import { randomUUID } from 'node:crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { db, guard, ownsPhoto, BUCKET } from './_lib.js'

export const config = { api: { bodyParser: { sizeLimit: '4mb' } } }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const p = await guard(req, res)
  if (!p) return
  const sb = db()

  if (req.method === 'POST') {
    const m = String(req.body?.dataUrl || '').match(/^data:image\/(jpeg|png|webp);base64,(.+)$/)
    if (!m) return res.status(400).json({ error: 'Expected an image' })
    const path = `${p.id}/${new Date().toISOString().slice(0, 7)}/${randomUUID()}.${m[1] === 'jpeg' ? 'jpg' : m[1]}`
    const { error } = await sb.storage.from(BUCKET).upload(path, Buffer.from(m[2], 'base64'), { contentType: 'image/' + m[1] })
    if (error) return res.status(500).json({ error: error.message })
    return res.json({ path })
  }

  if (req.method === 'GET') {
    const path = String(req.query.path || '')
    if (!ownsPhoto(p, path)) return res.status(404).end()
    const { data, error } = await sb.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 24)
    if (error || !data) return res.status(404).end()
    res.setHeader('Cache-Control', 'private, max-age=3600')
    return res.redirect(302, data.signedUrl)
  }

  res.status(405).end()
}
