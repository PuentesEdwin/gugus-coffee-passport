import { CAFES } from '../data/cafes'
import type { Cafe, Entry } from '../types'

export interface Page {
  key: string
  no: number
  cafe?: Cafe // suggested café; undefined = blank page
  visits: Entry[] // oldest first
}

export const groupKey = (e: Pick<Entry, 'cafeId' | 'cafeName'>) => e.cafeId || 'own:' + e.cafeName.trim().toLowerCase()

const MIN_BLANK = 10

/** The passport: 30 printed pages for the suggested cafés, then blank pages for your own finds. */
export function buildPages(entries: Entry[]): Page[] {
  const groups = new Map<string, Entry[]>()
  for (const e of [...entries].sort((a, b) => a.date.localeCompare(b.date) || a.createdAt - b.createdAt)) {
    const k = groupKey(e)
    groups.set(k, [...(groups.get(k) || []), e])
  }
  const pages: Page[] = CAFES.map((cafe, i) => ({ key: cafe.id, no: i + 1, cafe, visits: groups.get(cafe.id) || [] }))
  const own = [...groups.entries()].filter(([k]) => k.startsWith('own:'))
  own.forEach(([key, visits]) => pages.push({ key, no: pages.length + 1, visits }))
  const empty = Math.max(2, MIN_BLANK - own.length)
  for (let i = 0; i < empty; i++) pages.push({ key: 'blank-' + (pages.length + 1), no: pages.length + 1, visits: [] })
  return pages
}
