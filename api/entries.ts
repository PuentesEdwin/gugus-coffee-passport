import type { VercelRequest, VercelResponse } from '@vercel/node'
import { db, guard, ownsPhoto, HOME, SETTINGS_ID, TABLE, BUCKET } from './_lib.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const p = await guard(req, res)
  if (!p) return
  res.setHeader('Cache-Control', 'no-store')
  const sb = db()

  if (req.method === 'GET') {
    const { data, error } = await sb.from(TABLE).select('id, data').eq('passport_id', p.id)
    if (error) return res.status(500).json({ error: error.message })
    // A friend's brand-new passport starts with their name on the cover.
    const fresh = p.id === HOME ? null : { names: [p.name, ''], coupleName: p.name, palette: 'olive' }
    const settings = data.find((r) => r.id === SETTINGS_ID)?.data ?? fresh
    const entries = data.filter((r) => r.id !== SETTINGS_ID).map((r) => r.data)
    return res.json({ entries, settings, passport: p })
  }

  if (req.method === 'PUT') {
    const { entry, settings } = req.body || {}
    const row = settings ? { id: SETTINGS_ID, data: settings } : entry?.id ? { id: String(entry.id), data: entry } : null
    if (!row || row.id.length > 64) return res.status(400).json({ error: 'Nothing to save' })
    const { error } = await sb
      .from(TABLE)
      .upsert({ ...row, passport_id: p.id, updated_at: new Date().toISOString() }, { onConflict: 'passport_id,id' })
    if (error) return res.status(500).json({ error: error.message })
    return res.json({ ok: true })
  }

  if (req.method === 'DELETE') {
    const id = String(req.query.id || '')
    if (!id || id === SETTINGS_ID) return res.status(400).json({ error: 'Missing id' })
    const { data } = await sb.from(TABLE).select('data').eq('passport_id', p.id).eq('id', id).maybeSingle()
    const photos = [data?.data?.photoStore, data?.data?.photoCoffee]
      .filter((x): x is string => typeof x === 'string' && x.startsWith('cloud:'))
      .map((x) => x.slice(6))
      .filter((x) => ownsPhoto(p, x))
    if (photos.length) await sb.storage.from(BUCKET).remove(photos)
    const { error } = await sb.from(TABLE).delete().eq('passport_id', p.id).eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.json({ ok: true })
  }

  res.status(405).end()
}
