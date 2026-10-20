import type { VercelRequest, VercelResponse } from '@vercel/node'
import { db, guard, SETTINGS_ID, TABLE, BUCKET } from './_lib.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!guard(req, res)) return
  res.setHeader('Cache-Control', 'no-store')
  const sb = db()

  if (req.method === 'GET') {
    const { data, error } = await sb.from(TABLE).select('id, data')
    if (error) return res.status(500).json({ error: error.message })
    const settings = data.find((r) => r.id === SETTINGS_ID)?.data ?? null
    const entries = data.filter((r) => r.id !== SETTINGS_ID).map((r) => r.data)
    return res.json({ entries, settings })
  }

  if (req.method === 'PUT') {
    const { entry, settings } = req.body || {}
    const row = settings ? { id: SETTINGS_ID, data: settings } : entry?.id ? { id: String(entry.id), data: entry } : null
    if (!row || row.id.length > 64) return res.status(400).json({ error: 'Nothing to save' })
    const { error } = await sb.from(TABLE).upsert({ ...row, updated_at: new Date().toISOString() })
    if (error) return res.status(500).json({ error: error.message })
    return res.json({ ok: true })
  }

  if (req.method === 'DELETE') {
    const id = String(req.query.id || '')
    if (!id || id === SETTINGS_ID) return res.status(400).json({ error: 'Missing id' })
    const { data } = await sb.from(TABLE).select('data').eq('id', id).maybeSingle()
    const photos = [data?.data?.photoStore, data?.data?.photoCoffee]
      .filter((p): p is string => typeof p === 'string' && p.startsWith('cloud:'))
      .map((p) => p.slice(6))
    if (photos.length) await sb.storage.from(BUCKET).remove(photos)
    const { error } = await sb.from(TABLE).delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.json({ ok: true })
  }

  res.status(405).end()
}
