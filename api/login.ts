import type { VercelRequest, VercelResponse } from '@vercel/node'
import { checkLogin, cloudConfigured, setSession } from './_lib.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!cloudConfigured()) return res.status(503).json({ error: 'Cloud mode is not configured' })
  if (req.method === 'DELETE') {
    await setSession(res, null)
    return res.json({ ok: true })
  }
  if (req.method !== 'POST') return res.status(405).end()
  const p = await checkLogin(req.body?.user, req.body?.pin)
  if (!p) {
    await new Promise((r) => setTimeout(r, 1200)) // slows down guessing
    return res.status(401).json({ error: 'Wrong passport name or PIN' })
  }
  await setSession(res, p)
  res.json({ ok: true, passport: p })
}
