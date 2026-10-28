import type { VercelRequest, VercelResponse } from '@vercel/node'
import { changeLogin, guard } from './_lib.js'

// PUT { login } renames the passport name used on the cover. Pages, photos and PIN stay the same.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const p = await guard(req, res)
  if (!p) return
  if (req.method !== 'PUT') return res.status(405).end()
  const r = await changeLogin(p, req.body?.login)
  if (r === 'taken') return res.status(409).json({ error: 'That passport name is taken' })
  if (r === 'invalid') return res.status(400).json({ error: 'Use 2–32 letters, numbers or dashes' })
  res.json({ ok: true })
}
