import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const BUCKET = 'passport-photos'
export const TABLE = 'passport_entries'
export const USERS = 'passport_users'
export const SETTINGS_ID = '__settings'
/** The original passport: its PIN lives in PASSPORT_PIN instead of the users table. */
export const HOME = 'gugus'
const COOKIE = 'cp_session'

export interface Passport {
  /** Internal and permanent: pages and photo folders hang off it. */
  id: string
  name: string
  /** What people type on the cover to sign in; they can change it in Settings. */
  login: string
}

export function cloudConfigured() {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

let client: SupabaseClient | null = null
export function db() {
  if (!client) client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
  return client
}

const same = (x: string, y: string) => {
  const a = Buffer.from(x)
  const b = Buffer.from(y)
  return a.length === b.length && timingSafeEqual(a, b)
}

export const normUser = (u: unknown) => String(u ?? '').trim().toLowerCase()
export const validLogin = (u: string) => /^[a-z0-9-]{2,32}$/.test(u)

/** scrypt$<salt>$<hash>; the same format scripts/new-passport.mjs writes. */
export function hashPin(pin: string) {
  const salt = randomBytes(16).toString('hex')
  return `scrypt$${salt}$${scryptSync(pin, salt, 32).toString('hex')}`
}

function pinMatchesHash(pin: string, stored: string) {
  const [kind, salt, hash] = stored.split('$')
  if (kind !== 'scrypt' || !salt || !hash) return false
  return same(scryptSync(pin, salt, 32).toString('hex'), hash)
}

interface UserRow {
  id: string
  name: string
  login: string
  pass_hash: string | null
}

/** What a session is signed with: changing the PIN logs that passport's devices out. */
function credentialOf(id: string, row: UserRow | null): { cred: string; p: Passport } | null {
  if (id === HOME) {
    if (!process.env.PASSPORT_PIN) return null
    return { cred: process.env.PASSPORT_PIN, p: { id, name: row?.name || 'The Gugus', login: row?.login || HOME } }
  }
  return row?.pass_hash ? { cred: row.pass_hash, p: { id, name: row.name, login: row.login } } : null
}

async function credential(id: string) {
  if (!validLogin(id)) return null
  const { data } = await db().from(USERS).select('id, name, login, pass_hash').eq('id', id).maybeSingle()
  return credentialOf(id, (data as UserRow) || null)
}

function sign(id: string, cred: string) {
  const secret = process.env.SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createHmac('sha256', secret).update(`passport:${id}:${cred}`).digest('hex')
}

/** Cookie from before there were several passports: it only ever opened the Gugus one. */
function legacyToken() {
  const secret = process.env.SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createHmac('sha256', secret).update('passport:' + process.env.PASSPORT_PIN).digest('hex')
}

export async function checkLogin(user: unknown, pin: unknown): Promise<Passport | null> {
  const login = normUser(user)
  const p = String(pin ?? '')
  if (!p || !validLogin(login)) return null
  const { data } = await db().from(USERS).select('id, name, login, pass_hash').eq('login', login).maybeSingle()
  const row = (data as UserRow) || null
  if (!row) return null
  const id = row.id
  const c = credentialOf(id, row)
  if (!c) return null
  const ok = id === HOME ? same(p, c.cred) : pinMatchesHash(p, c.cred)
  return ok ? c.p : null
}

/** Changes the name typed on the cover; pages and photos don't move. */
export async function changeLogin(p: Passport, wanted: unknown): Promise<'ok' | 'invalid' | 'taken'> {
  const login = normUser(wanted)
  if (!validLogin(login)) return 'invalid'
  if (login === p.login) return 'ok'
  if (p.id !== HOME && login === HOME) return 'taken'
  const { data: other } = await db().from(USERS).select('id').eq('login', login).maybeSingle()
  if (other && other.id !== p.id) return 'taken'
  const users = db().from(USERS)
  const { error } =
    p.id === HOME
      ? await users.upsert({ id: HOME, name: p.name, login, pass_hash: null }, { onConflict: 'id' })
      : await users.update({ login }).eq('id', p.id)
  if (error) return error.code === '23505' ? 'taken' : 'invalid'
  return 'ok'
}

export async function sessionPassport(req: VercelRequest): Promise<Passport | null> {
  const raw = req.headers.cookie || ''
  const m = raw.match(new RegExp('(?:^|; )' + COOKIE + '=([a-z0-9-]+\\.)?([a-f0-9]+)'))
  if (!m) return null
  const id = m[1] ? m[1].slice(0, -1) : HOME
  const c = await credential(id)
  if (!c) return null
  if (!m[1]) return same(m[2], legacyToken()) ? c.p : null
  return same(m[2], sign(id, c.cred)) ? c.p : null
}

export async function setSession(res: VercelResponse, p: Passport | null) {
  const c = p && (await credential(p.id))
  const value = p && c ? `${p.id}.${sign(p.id, c.cred)}` : ''
  const base = `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax`
  res.setHeader('Set-Cookie', value ? `${base}; Max-Age=${60 * 60 * 24 * 180}` : `${base}; Max-Age=0`)
}

/** Returns the caller's passport, or null after answering the request. */
export async function guard(req: VercelRequest, res: VercelResponse): Promise<Passport | null> {
  if (!cloudConfigured()) {
    res.status(503).json({ error: 'Cloud mode is not configured' })
    return null
  }
  const p = await sessionPassport(req)
  if (!p) res.status(401).json({ error: 'locked' })
  return p
}

/** Photos live under "<passport>/<yyyy-mm>/<uuid>.jpg"; the Gugus ones from before have no passport folder. */
export function ownsPhoto(p: Passport, path: string) {
  if (/^[a-z0-9-]+\/[\w-]+\/[\w-]+\.(jpg|png|webp)$/.test(path)) return path.startsWith(p.id + '/')
  return p.id === HOME && /^[\w-]+\/[\w-]+\.(jpg|png|webp)$/.test(path)
}
