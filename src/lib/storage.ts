import { get, set } from 'idb-keyval'
import type { Entry, Settings } from '../types'
import { DEFAULT_SETTINGS } from '../types'

export type Mode = 'local' | 'cloud'

export interface Status {
  mode: Mode
  authed: boolean
  /** Which passport this device is signed in to (shared mode) */
  passport?: PassportInfo | null
}

export interface PassportInfo {
  id: string
  name: string
  /** The name typed on the cover to sign in */
  login: string
}

/** Cloud mode exists when the /api functions are deployed and configured (Vercel + Supabase). */
export async function getStatus(): Promise<Status> {
  try {
    const r = await fetch('/api/status', { credentials: 'same-origin' })
    if (!r.ok || !(r.headers.get('content-type') || '').includes('json')) throw new Error()
    const j = await r.json()
    if (j.cloud) return { mode: 'cloud', authed: !!j.authed, passport: j.passport }
  } catch {
    /* no server: local mode */
  }
  return { mode: 'local', authed: true }
}

export async function login(user: string, pin: string): Promise<boolean> {
  const r = await fetch('/api/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ user, pin }),
  })
  return r.ok
}

/** Renames the passport name used to sign in. Returns an error message, or '' when it worked. */
export async function changeLogin(login: string): Promise<string> {
  try {
    await api('/api/account', { method: 'PUT', body: JSON.stringify({ login }) })
    return ''
  } catch (e) {
    const m = (e as Error).message
    return m.includes('taken') ? 'Someone already uses that passport name. Try another one.' : 'Use 2–32 letters, numbers or dashes.'
  }
}

/** Lowercase, no accents, dashes instead of spaces: "José María" becomes "jose-maria". */
export const toLogin = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 32)

/** What the closed cover shows on this device before anyone signs in. */
export interface CoverLook {
  user?: string
  palette?: string
  coverPhoto?: string
  coupleName?: string
}
const LOOK = 'cp-cover'
export function readLook(): CoverLook {
  try {
    return JSON.parse(localStorage.getItem(LOOK) || '{}')
  } catch {
    return {}
  }
}
export function rememberLook(l: CoverLook) {
  try {
    localStorage.setItem(LOOK, JSON.stringify({ ...readLook(), ...l }))
  } catch {
    /* private window */
  }
}

export async function logout(): Promise<void> {
  await fetch('/api/login', { method: 'DELETE' })
}

const LOCAL_ENTRIES = 'cp-entries'
const LOCAL_SETTINGS = 'cp-settings'

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(path, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers || {}) },
  })
  if (r.status === 401) throw new Error('locked')
  if (!r.ok) throw new Error((await r.text()) || r.statusText)
  return r.json()
}

export interface Store {
  load(): Promise<{ entries: Entry[]; settings: Settings; passport?: PassportInfo }>
  saveEntry(e: Entry): Promise<void>
  deleteEntry(id: string): Promise<void>
  saveSettings(s: Settings): Promise<void>
  /** Takes a compressed JPEG data URL and returns what to keep on the entry. */
  savePhoto(dataUrl: string): Promise<string>
}

export const localStore: Store = {
  async load() {
    let entries: Entry[] = []
    let settings: Settings = DEFAULT_SETTINGS
    try {
      entries = (await get(LOCAL_ENTRIES)) || []
      settings = (await get(LOCAL_SETTINGS)) || DEFAULT_SETTINGS
    } catch {
      /* storage blocked (private window): start empty */
    }
    return { entries, settings }
  },
  async saveEntry(e) {
    const all: Entry[] = (await get(LOCAL_ENTRIES)) || []
    await set(LOCAL_ENTRIES, [...all.filter((x) => x.id !== e.id), e])
  },
  async deleteEntry(id) {
    const all: Entry[] = (await get(LOCAL_ENTRIES)) || []
    await set(LOCAL_ENTRIES, all.filter((x) => x.id !== id))
  },
  async saveSettings(s) {
    await set(LOCAL_SETTINGS, s)
  },
  async savePhoto(dataUrl) {
    return dataUrl
  },
}

export const cloudStore: Store = {
  async load() {
    const j = await api<{ entries: Entry[]; settings: Settings | null; passport: PassportInfo }>('/api/entries')
    return { entries: j.entries, settings: j.settings || DEFAULT_SETTINGS, passport: j.passport }
  },
  async saveEntry(e) {
    await api('/api/entries', { method: 'PUT', body: JSON.stringify({ entry: e }) })
  },
  async deleteEntry(id) {
    await api('/api/entries?id=' + encodeURIComponent(id), { method: 'DELETE' })
  },
  async saveSettings(s) {
    await api('/api/entries', { method: 'PUT', body: JSON.stringify({ settings: s }) })
  },
  async savePhoto(dataUrl) {
    const j = await api<{ path: string }>('/api/photo', { method: 'POST', body: JSON.stringify({ dataUrl }) })
    return 'cloud:' + j.path
  },
}

/** Turns what is stored on an entry into something an <img> can show. */
export function photoSrc(p?: string): string | undefined {
  if (!p) return undefined
  if (p.startsWith('cloud:')) return '/api/photo?path=' + encodeURIComponent(p.slice(6))
  return p
}
