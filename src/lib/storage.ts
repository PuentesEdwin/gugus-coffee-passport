import { get, set } from 'idb-keyval'
import type { Entry, Settings } from '../types'
import { DEFAULT_SETTINGS } from '../types'

export type Mode = 'local' | 'cloud'

export interface Status {
  mode: Mode
  authed: boolean
}

/** Cloud mode exists when the /api functions are deployed and configured (Vercel + Supabase). */
export async function getStatus(): Promise<Status> {
  try {
    const r = await fetch('/api/status', { credentials: 'same-origin' })
    if (!r.ok || !(r.headers.get('content-type') || '').includes('json')) throw new Error()
    const j = await r.json()
    if (j.cloud) return { mode: 'cloud', authed: !!j.authed }
  } catch {
    /* no server: local mode */
  }
  return { mode: 'local', authed: true }
}

export async function login(pin: string): Promise<boolean> {
  const r = await fetch('/api/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ pin }),
  })
  return r.ok
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
  load(): Promise<{ entries: Entry[]; settings: Settings }>
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
    const j = await api<{ entries: Entry[]; settings: Settings | null }>('/api/entries')
    return { entries: j.entries, settings: j.settings || DEFAULT_SETTINGS }
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
