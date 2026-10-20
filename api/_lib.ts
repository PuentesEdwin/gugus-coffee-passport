import { createHmac, timingSafeEqual } from 'node:crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const BUCKET = 'passport-photos'
export const TABLE = 'passport_entries'
export const SETTINGS_ID = '__settings'
const COOKIE = 'cp_session'

export function cloudConfigured() {
  return !!(process.env.PASSPORT_PIN && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

let client: SupabaseClient | null = null
export function db() {
  if (!client) client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
  return client
}

function token() {
  const secret = process.env.SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY!
  // Changing the PIN logs every device out.
  return createHmac('sha256', secret).update('passport:' + process.env.PASSPORT_PIN).digest('hex')
}

export function pinMatches(pin: unknown) {
  const a = Buffer.from(String(pin ?? ''))
  const b = Buffer.from(process.env.PASSPORT_PIN || '')
  return a.length === b.length && timingSafeEqual(a, b)
}

export function isAuthed(req: VercelRequest) {
  const raw = req.headers.cookie || ''
  const m = raw.match(new RegExp('(?:^|; )' + COOKIE + '=([a-f0-9]+)'))
  if (!m) return false
  const a = Buffer.from(m[1])
  const b = Buffer.from(token())
  return a.length === b.length && timingSafeEqual(a, b)
}

export function setSession(res: VercelResponse, on: boolean) {
  const base = `${COOKIE}=${on ? token() : ''}; Path=/; HttpOnly; Secure; SameSite=Lax`
  res.setHeader('Set-Cookie', on ? `${base}; Max-Age=${60 * 60 * 24 * 180}` : `${base}; Max-Age=0`)
}

/** Returns false (and answers the request) when the caller can't use the API. */
export function guard(req: VercelRequest, res: VercelResponse) {
  if (!cloudConfigured()) {
    res.status(503).json({ error: 'Cloud mode is not configured' })
    return false
  }
  if (!isAuthed(req)) {
    res.status(401).json({ error: 'locked' })
    return false
  }
  return true
}
