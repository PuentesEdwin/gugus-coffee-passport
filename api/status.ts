import type { VercelRequest, VercelResponse } from '@vercel/node'
import { cloudConfigured, sessionPassport } from './_lib.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const cloud = cloudConfigured()
  res.setHeader('Cache-Control', 'no-store')
  const p = cloud ? await sessionPassport(req) : null
  res.json({ cloud, authed: !!p, passport: p })
}
