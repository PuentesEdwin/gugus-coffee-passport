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
  id: string
  name: string
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
const validUser = (u: string) => /^[a-z0-9-]{2,32}$/.test(u)

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

/** What a session is signed with: changing the PIN logs that passport's devices out. */
async function credential(id: string): Promise<{ cred: string; name: string } | null> {
  if (id === HOME) return process.env.PASSPORT_PIN ? { cred: process.env.PASSPORT_PIN, name: 'The Gugus' } : null
  if (!validUser(id)) return null
  const { data } = await db().from(USERS).select('name, pass_hash').eq('id', id).maybeSingle()
  return data ? { cred: data.pass_hash, name: data.name } : null
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
  const id = normUser(user)
  const p = String(pin ?? '')
  if (!p) return null
  const c = await credential(id)
  if (!c) return null
  const ok = id === HOME ? same(p, c.cred) : pinMatchesHash(p, c.cred)
  return ok ? { id, name: c.name } : null
}

export async function sessionPassport(req: VercelRequest): Promise<Passport | null> {
  const raw = req.headers.cookie || ''
  const m = raw.match(new RegExp('(?:^|; )' + COOKIE + '=([a-z0-9-]+\\.)?([a-f0-9]+)'))
  if (!m) return null
  if (!m[1]) return process.env.PASSPORT_PIN && same(m[2], legacyToken()) ? { id: HOME, name: 'The Gugus' } : null
  const id = m[1].slice(0, -1)
  const c = await credential(id)
  return c && same(m[2], sign(id, c.cred)) ? { id, name: c.name } : null
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
