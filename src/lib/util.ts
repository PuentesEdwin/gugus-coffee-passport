export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

export const today = () => {
  const d = new Date()
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

export function fmtDate(iso: string, style: 'long' | 'stamp' = 'long') {
  if (!iso) return ''
  const d = new Date(iso + 'T12:00:00')
  if (style === 'stamp') return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })
}

/** Small stable hash so each stamp gets its own tilt and ink. */
export function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return (h >>> 0) / 4294967295
}
