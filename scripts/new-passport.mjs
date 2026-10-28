// Creates a friend's passport login: prints the PIN to hand over and the SQL to run in Supabase.
// usage: node scripts/new-passport.mjs <passport-name> "<Name on the cover>"
import { randomBytes, randomInt, scryptSync } from 'node:crypto'

const [id, name] = process.argv.slice(2)
if (!/^[a-z0-9-]{2,32}$/.test(id || '') || !name) {
  console.error('usage: node scripts/new-passport.mjs <passport-name: a-z 0-9 -> "<Name on the cover>"')
  process.exit(1)
}
const pin = String(randomInt(0, 1e8)).padStart(8, '0')
const salt = randomBytes(16).toString('hex')
const hash = `scrypt$${salt}$${scryptSync(pin, salt, 32).toString('hex')}`
const q = (s) => "'" + s.replace(/'/g, "''") + "'"
console.log(JSON.stringify({ passport: id, pin }))
// The passport name starts as the id; the friend can change it later in Settings.
console.log(`insert into public.passport_users (id, name, login, pass_hash) values (${q(id)}, ${q(name)}, ${q(id)}, ${q(hash)});
-- fails if the name is already used, so an existing friend's PIN is never replaced by accident`)
