import type { VercelRequest, VercelResponse } from '@vercel/node'
import { cloudConfigured, isAuthed } from './_lib.js'

export default function handler(req: VercelRequest, res: VercelResponse) {
  const cloud = cloudConfigured()
  res.setHeader('Cache-Control', 'no-store')
  res.json({ cloud, authed: cloud && isAuthed(req) })
}
