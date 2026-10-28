// Ten cover-and-ink combinations. Each one is a leather color plus a metal for the lettering;
// the paper, the coffee browns and the photos stay the same. Every pair keeps metal-on-leather
// and leather-on-paper text at WCAG AA contrast (checked by scripts/check-palettes.mjs).

export interface Palette {
  key: string
  name: string
  leather: string
  metal: string
  metalLight: string
}

export const PALETTES: Palette[] = [
  { key: 'olive', name: 'Olive & Gold', leather: '#4a5a2a', metal: '#c9a54a', metalLight: '#e8cf86' },
  { key: 'espresso', name: 'Espresso & Copper', leather: '#4b2e20', metal: '#d38b55', metalLight: '#f2c39a' },
  { key: 'navy', name: 'Midnight & Gold', leather: '#1f3157', metal: '#d4ad4f', metalLight: '#f0d58c' },
  { key: 'burgundy', name: 'Burgundy & Champagne', leather: '#6a1f2b', metal: '#d9b77c', metalLight: '#f3ddb4' },
  { key: 'forest', name: 'Forest & Brass', leather: '#1e4a3a', metal: '#c8a14a', metalLight: '#ead08f' },
  { key: 'teal', name: 'Deep Teal & Coral', leather: '#124a50', metal: '#f08a6b', metalLight: '#ffc9b5' },
  { key: 'plum', name: 'Plum & Rose Gold', leather: '#4a2450', metal: '#e3a08c', metalLight: '#f7d2c6' },
  { key: 'charcoal', name: 'Charcoal & Mustard', leather: '#2f2f33', metal: '#e0b13a', metalLight: '#f5d77f' },
  { key: 'cobalt', name: 'Cobalt & Silver', leather: '#1f3f86', metal: '#b9c2cf', metalLight: '#eef1f6' },
  { key: 'terracotta', name: 'Terracotta & Cream', leather: '#7e3720', metal: '#e9c79a', metalLight: '#fbe8cc' },
]

export const paletteByKey = (k?: string) => PALETTES.find((p) => p.key === k) || PALETTES[0]

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const toHex = (c: number[]) => '#' + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')
/** Mixes a color toward black (t < 0) or white (t > 0). */
export const shade = (h: string, t: number) => toHex(hex(h).map((v) => (t < 0 ? v * (1 + t) : v + (255 - v) * t)))

/** The CSS custom properties a palette sets; the "olive" names are historic, they mean "leather". */
export function paletteVars(p: Palette): Record<string, string> {
  return {
    '--olive-950': shade(p.leather, -0.52),
    '--olive-900': shade(p.leather, -0.36),
    '--olive-800': shade(p.leather, -0.2),
    '--olive-700': p.leather,
    '--olive-600': shade(p.leather, 0.12),
    '--olive-500': shade(p.leather, 0.25),
    '--olive-300': shade(p.leather, 0.5),
    '--olive-100': shade(p.leather, 0.82),
    '--gold': p.metal,
    '--gold-2': p.metalLight,
    '--metal-hi': shade(p.metalLight, 0.35),
    '--metal-lo': shade(p.metal, -0.2),
  }
}

export function applyPalette(key?: string) {
  const vars = paletteVars(paletteByKey(key))
  const root = document.documentElement.style
  for (const [k, v] of Object.entries(vars)) root.setProperty(k, v)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', vars['--olive-800'])
}
