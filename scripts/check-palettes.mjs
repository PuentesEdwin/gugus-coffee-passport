// Contrast check for src/data/palettes.ts: node --experimental-strip-types scripts/check-palettes.mjs
import { PALETTES, paletteVars } from '../src/data/palettes.ts'

const lum = (h) => {
  const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}
const PAPER = '#fbf6ea'
const CREAM = '#f3ead6'
let bad = 0
for (const p of PALETTES) {
  const v = paletteVars(p)
  const pairs = {
    'metal-light on leather': ratio(v['--gold-2'], v['--olive-700']),
    'metal-light on dark leather': ratio(v['--gold-2'], v['--olive-800']),
    'cream on leather': ratio(CREAM, v['--olive-700']),
    'leather on paper': ratio(v['--olive-700'], PAPER),
    'dark leather on paper': ratio(v['--olive-800'], PAPER),
    'mid leather on paper (large text)': ratio(v['--olive-500'], PAPER),
  }
  const fails = Object.entries(pairs).filter(([k, r]) => r < (k.includes('large') ? 3 : 4.5))
  bad += fails.length
  console.log(p.key.padEnd(11), Object.values(pairs).map((r) => r.toFixed(1).padStart(5)).join(''), fails.length ? ' FAIL ' + fails.map((f) => f[0]).join(', ') : '')
}
process.exit(bad ? 1 : 0)
