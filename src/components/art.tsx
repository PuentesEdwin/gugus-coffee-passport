import type { Drink, Layer } from '../data/drinks'
import { LAYER_INFO } from '../data/drinks'
import { hash } from '../lib/util'

/* ---------- icons (24px line icons) ---------- */
const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
export const Icon = {
  book: (s = 22) => (
    <svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5" /><circle cx="12" cy="10" r="3" /></svg>
  ),
  album: (s = 22) => (
    <svg width={s} height={s} viewBox="0 0 24 24" {...P}><rect x="3" y="5" width="13" height="15" rx="1.5" transform="rotate(-6 9 12)" /><rect x="8" y="4" width="13" height="15" rx="1.5" /><circle cx="12.5" cy="9" r="1.6" /><path d="m8 16 4-4 3 3 2-2 4 4" /></svg>
  ),
  pin: (s = 22) => (
    <svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" /><path d="M9.5 8.5c1.2-1 3.8-1 5 0M10 11c1-.6 3-.6 4 0" /></svg>
  ),
  stamp: (s = 22) => (
    <svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M9 3h6v4.5a2 2 0 0 0 1 1.7l1.5.8A2 2 0 0 1 18.5 12H5.5a2 2 0 0 1 1-2l1.5-.8a2 2 0 0 0 1-1.7z" /><path d="M5 12h14v3H5zM6 19h12" /></svg>
  ),
  cup: (s = 22) => (
    <svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M4 9h13v5a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6z" /><path d="M17 11h1.5a2.5 2.5 0 0 1 0 5H17" /><path d="M8 3c-.8 1.2.8 2 0 3.2M12 3c-.8 1.2.8 2 0 3.2" /></svg>
  ),
  plus: (s = 20) => (
    <svg width={s} height={s} viewBox="0 0 24 24" {...P} strokeWidth={2.4}><path d="M12 5v14M5 12h14" /></svg>
  ),
  left: (s = 20) => (
    <svg width={s} height={s} viewBox="0 0 24 24" {...P} strokeWidth={2.2}><path d="m15 5-7 7 7 7" /></svg>
  ),
  right: (s = 20) => (
    <svg width={s} height={s} viewBox="0 0 24 24" {...P} strokeWidth={2.2}><path d="m9 5 7 7-7 7" /></svg>
  ),
  close: (s = 20) => (
    <svg width={s} height={s} viewBox="0 0 24 24" {...P} strokeWidth={2.2}><path d="M6 6l12 12M18 6 6 18" /></svg>
  ),
  camera: (s = 26) => (
    <svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M4 8h3l1.5-2h7L17 8h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>
  ),
  edit: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="m13.5 6.5 4 4" /></svg>
  ),
  gear: (s = 20) => (
    <svg width={s} height={s} viewBox="0 0 24 24" {...P}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>
  ),
  dice: (s = 20) => (
    <svg width={s} height={s} viewBox="0 0 24 24" {...P}><rect x="4" y="4" width="16" height="16" rx="3" /><circle cx="9" cy="9" r="1" fill="currentColor" /><circle cx="15" cy="15" r="1" fill="currentColor" /><circle cx="15" cy="9" r="1" fill="currentColor" /><circle cx="9" cy="15" r="1" fill="currentColor" /></svg>
  ),
}

/* ---------- coffee bean (bitterness unit) ---------- */
export function Bean({ on, size = 26, tilt = -20 }: { on: boolean; size?: number; tilt?: number }) {
  return (
    <svg className="bean" width={size} height={size} viewBox="0 0 32 32" style={{ transform: `rotate(${tilt}deg)` }} aria-hidden>
      <ellipse cx="16" cy="16" rx="10" ry="13.5" fill={on ? '#5a3a24' : 'none'} stroke={on ? '#3d2a1d' : '#c19a6b'} strokeWidth="1.8" strokeDasharray={on ? undefined : '3 2.5'} />
      <path d="M16 3.5c-4 5-4 9 0 12.5s4 7.5 0 12.5" fill="none" stroke={on ? '#c19a6b' : '#c19a6b'} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function BeanRow({ value, size = 24, onChange }: { value: number; size?: number; onChange?: (n: number) => void }) {
  return (
    <span className="beans" role={onChange ? 'radiogroup' : 'img'} aria-label={`Bitterness ${value} of 5`}>
      {[1, 2, 3, 4, 5].map((n) =>
        onChange ? (
          <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} of 5`} onClick={() => onChange(n)}>
            <Bean on={n <= value} size={size} tilt={-25 + n * 6} />
          </button>
        ) : (
          <Bean key={n} on={n <= value} size={size} tilt={-25 + n * 6} />
        ),
      )}
    </span>
  )
}

export const Stars = ({ n }: { n: number }) => (
  <span className="stars" aria-label={`${n} of 5 stars`}>
    {'★★★★★'.slice(0, n)}
    <span style={{ color: 'var(--line)' }}>{'★★★★★'.slice(0, 5 - n)}</span>
  </span>
)

/* ---------- cup cross-section: shows what's inside each drink ---------- */
const CUPS = {
  demitasse: { top: 52, bot: 84, tl: 30, tr: 70, bl: 36, br: 64, handle: true, cap: 3 },
  glass: { top: 36, bot: 86, tl: 30, tr: 70, bl: 33, br: 67, handle: false, cap: 3 },
  cup: { top: 40, bot: 84, tl: 22, tr: 78, bl: 32, br: 68, handle: true, cap: 3.6 },
  mug: { top: 22, bot: 86, tl: 26, tr: 72, bl: 28, br: 70, handle: true, cap: 6 },
  tall: { top: 12, bot: 90, tl: 28, tr: 72, bl: 33, br: 67, handle: false, cap: 5.2 },
}

export function CupDiagram({ drink, size = 96, id }: { drink: Drink; size?: number; id: string }) {
  const c = CUPS[drink.cup]
  const h = c.bot - c.top
  const unit = h / c.cap
  let y = c.bot
  const rects: { layer: Layer; y: number; hh: number }[] = []
  for (const [layer, parts] of drink.layers) {
    const hh = parts * unit
    y -= hh
    rects.push({ layer, y, hh })
  }
  const clip = `cup-${id}`
  const hot = !drink.layers.some(([l]) => l === 'ice' || l === 'cold') && drink.key !== 'affogato'
  const poly = `${c.tl},${c.top} ${c.tr},${c.top} ${c.br},${c.bot} ${c.bl},${c.bot}`
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={`${drink.name}: ${drink.layers.map(([l]) => LAYER_INFO[l].label).join(', ')}`}>
      <defs>
        <clipPath id={clip}><polygon points={poly} /></clipPath>
      </defs>
      {drink.cup !== 'tall' && drink.cup !== 'glass' && <ellipse cx="50" cy={c.bot + 4} rx={(c.br - c.bl) / 2 + 18} ry="4" fill="#d9c9a6" />}
      <g clipPath={`url(#${clip})`}>
        <rect x="0" y="0" width="100" height="100" fill="rgba(255,255,255,0.55)" />
        {rects.map((r, i) => (
          <g key={i}>
            <rect x="0" y={r.y} width="100" height={r.hh + 0.4} fill={LAYER_INFO[r.layer].color} />
            {r.layer === 'ice' &&
              [0, 1, 2].map((k) => <rect key={k} x={36 + k * 10} y={r.y + 3 + (k % 2) * 6} width="9" height="9" rx="2" fill="#f4fbfd" stroke="#b9d2d8" strokeWidth=".8" transform={`rotate(${k * 17 - 10} ${40 + k * 10} ${r.y + 8})`} />)}
            {r.layer === 'foam' &&
              [0, 1, 2, 3, 4].map((k) => <circle key={k} cx={34 + k * 8} cy={r.y + r.hh / 2} r="1.2" fill="#e8dcc6" />)}
          </g>
        ))}
      </g>
      <polygon points={poly} fill="none" stroke="#3d2a1d" strokeWidth="2.4" strokeLinejoin="round" />
      {c.handle && <path d={`M${c.tr - 2},${c.top + h * 0.2} q16,2 14,${h * 0.3} t-16,${h * 0.28}`} fill="none" stroke="#3d2a1d" strokeWidth="2.6" strokeLinecap="round" />}
      {hot && (
        <g stroke="#8a5a36" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity=".55">
          <path d={`M44 ${c.top - 6}c-3-4 3-6 0-10`} />
          <path d={`M54 ${c.top - 6}c-3-4 3-6 0-10`} />
        </g>
      )}
      {!hot && drink.cup === 'tall' && <path d={`M58 ${c.top - 8} L54 ${c.bot - 10}`} stroke="#b45f3c" strokeWidth="3" strokeLinecap="round" />}
    </svg>
  )
}

/* ---------- rubber stamp ---------- */
const INKS = ['#6b3a22', '#4a5a2a', '#8f3220', '#3d4f6b', '#5a3a24']

export function Stamp({ id, top, bottom, center, sub, size = '100%', animate = false }: { id: string; top: string; bottom: string; center: string; sub?: string; size?: string | number; animate?: boolean }) {
  const h = hash(id)
  const ink = INKS[Math.floor(h * INKS.length)]
  const rot = Math.round(h * 34 - 17)
  const shape = Math.floor(h * 100) % 3 // 0 circle, 1 scalloped, 2 octagon
  const t = top.toUpperCase().slice(0, 26)
  const b = bottom.toUpperCase().slice(0, 28)
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={animate ? 'stamp-in' : undefined} style={{ ['--r' as string]: `${rot}deg`, transform: `rotate(${rot}deg)`, opacity: 0.92, mixBlendMode: 'multiply' }} aria-label={`Stamp: ${top}, ${center}`}>
      <defs>
        <filter id={`rough-${id}`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={Math.floor(h * 50)} result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.3 1.45" result="m" />
          <feComposite in="SourceGraphic" in2="m" operator="in" />
        </filter>
        <path id={`tp-${id}`} d="M 22 60 A 38 38 0 0 1 98 60" />
        <path id={`bp-${id}`} d="M 16 60 A 44 44 0 0 0 104 60" />
      </defs>
      <g filter={`url(#rough-${id})`} fill="none" stroke={ink} color={ink}>
        {shape === 0 && <circle cx="60" cy="60" r="56" strokeWidth="4" />}
        {shape === 1 && <path d={scallop()} strokeWidth="3" />}
        {shape === 2 && <polygon points={octagon(56)} strokeWidth="3.5" />}
        <circle cx="60" cy="60" r="47" strokeWidth="1.5" />
        <circle cx="60" cy="60" r="27" strokeWidth="1.5" />
        <text fontFamily="Special Elite, monospace" fontSize={t.length > 18 ? 8.5 : 10} fill={ink} stroke="none" letterSpacing="1">
          <textPath href={`#tp-${id}`} startOffset="50%" textAnchor="middle">{t}</textPath>
        </text>
        <text fontFamily="Special Elite, monospace" fontSize="7.5" fill={ink} stroke="none" letterSpacing="1.4">
          <textPath href={`#bp-${id}`} startOffset="50%" textAnchor="middle" dominantBaseline="hanging">{b}</textPath>
        </text>
        <text x="60" y={sub ? 57 : 63} textAnchor="middle" fontFamily="Special Elite, monospace" fontSize="9.5" fill={ink} stroke="none">{center}</text>
        {sub && <text x="60" y="70" textAnchor="middle" fontFamily="Fraunces, serif" fontWeight="900" fontSize="9" fill={ink} stroke="none" letterSpacing="1">{sub}</text>}
        <text x="23" y="64" fontSize="8" fill={ink} stroke="none">★</text>
        <text x="90" y="64" fontSize="8" fill={ink} stroke="none">★</text>
      </g>
    </svg>
  )
}
function scallop() {
  let d = ''
  const n = 18
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2
    const x = 60 + 54 * Math.cos(a)
    const y = 60 + 54 * Math.sin(a)
    d += i === 0 ? `M${x.toFixed(1)},${y.toFixed(1)}` : ` A6,6 0 0 1 ${x.toFixed(1)},${y.toFixed(1)}`
  }
  return d
}
function octagon(r: number) {
  return Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8
    return `${(60 + r * Math.cos(a)).toFixed(1)},${(60 + r * Math.sin(a)).toFixed(1)}`
  }).join(' ')
}

/* ---------- cover emblem: coffee cup over the skyline, in a laurel ---------- */
export function Emblem() {
  const gold = 'url(#goldg)'
  return (
    <svg className="emblem" viewBox="0 0 200 200" aria-hidden>
      <defs>
        <linearGradient id="goldg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--metal-hi)' }} />
          <stop offset=".5" style={{ stopColor: 'var(--gold)' }} />
          <stop offset="1" style={{ stopColor: 'var(--gold-2)' }} />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="92" fill="none" stroke={gold} strokeWidth="2" />
      <circle cx="100" cy="100" r="84" fill="none" stroke={gold} strokeWidth="1" strokeDasharray="2 4" />
      {/* laurel */}
      {Array.from({ length: 9 }).map((_, i) => {
        const a = (200 + i * 15) * (Math.PI / 180)
        const x = 100 + 72 * Math.cos(a)
        const y = 100 + 72 * Math.sin(a) * -1
        const x2 = 200 - x
        const deg = 200 + i * 15
        return (
          <g key={i} fill={gold}>
            <ellipse cx={x} cy={y} rx="8" ry="3.4" transform={`rotate(${-deg + 50} ${x} ${y})`} />
            <ellipse cx={x2} cy={y} rx="8" ry="3.4" transform={`rotate(${deg - 50} ${x2} ${y})`} />
          </g>
        )
      })}
      {/* skyline */}
      <path
        d="M44 118 v-14 h8 v-10 h6 v18 h6 v-26 h4 v-8 h3 v8 h4 v30 h6 v-20 h8 v-16 l3 -10 l3 10 v40 h6 v-22 h7 v-12 h5 v34 h6 v-18 h8 v26 z"
        fill="none"
        stroke={gold}
        strokeWidth="1.6"
        strokeLinejoin="round"
        opacity=".85"
      />
      {/* cup */}
      <path d="M62 112 h66 v8 a30 30 0 0 1 -30 30 h-6 a30 30 0 0 1 -30 -30 z" fill={gold} />
      <path d="M128 118 h6 a10 10 0 0 1 0 20 h-9" fill="none" stroke={gold} strokeWidth="5" />
      <ellipse cx="96" cy="156" rx="46" ry="5" fill={gold} />
      {/* steam */}
      <g stroke={gold} strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M84 104 c-6 -8 6 -12 0 -22" />
        <path d="M96 104 c-6 -8 6 -12 0 -22" />
        <path d="M108 104 c-6 -8 6 -12 0 -22" />
      </g>
      {/* bean on the cup */}
      <ellipse cx="95" cy="128" rx="6" ry="8.5" style={{ fill: 'var(--olive-800)' }} transform="rotate(-25 95 128)" />
      <path d="M97 120 c-5 5 -1 8 -4 16" stroke={gold} strokeWidth="1.4" fill="none" />
    </svg>
  )
}
