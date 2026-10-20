import type { VercelRequest, VercelResponse } from '@vercel/node'
import { cloudConfigured, pinMatches, setSession } from './_lib.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!cloudConfigured()) return res.status(503).json({ error: 'Cloud mode is not configured' })
  if (req.method === 'DELETE') {
    setSession(res, false)
    return res.json({ ok: true })
  }
  if (req.method !== 'POST') return res.status(405).end()
  if (!pinMatches(req.body?.pin)) {
    await new Promise((r) => setTimeout(r, 1200)) // slows down guessing
    return res.status(401).json({ error: 'Wrong PIN' })
  }
  setSession(res, true)
  res.json({ ok: true })
}
