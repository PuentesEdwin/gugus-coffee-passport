export type Borough = 'Manhattan' | 'Brooklyn' | 'Queens' | 'Bronx' | 'Staten Island'

export interface Cafe {
  id: string
  name: string
  neighborhood: string
  borough: Borough
  address: string
  mustTry: string
  why: string
  lat: number
  lng: number
}

export interface Entry {
  id: string
  /** id of a suggested café, or undefined for a blank page (your own find) */
  cafeId?: string
  cafeName: string
  neighborhood: string
  borough: Borough | ''
  address: string
  date: string // YYYY-MM-DD
  drink: string // e.g. "Iced oat latte"
  drinkType: string // key from DRINKS, or 'other'
  bitterness: number // 1–5
  rating: number // 0–5
  price: string
  notes: string
  /** data: URL (local mode) or "cloud:<path>" (shared mode) */
  photoStore?: string
  photoCoffee?: string
  filledBy: string[]
  createdAt: number
  updatedAt: number
}

export interface Settings {
  /** The second name may be empty: a friend's passport can be for one person. */
  names: [string, string]
  coupleName: string
  /** Key from src/data/palettes.ts */
  palette?: string
  /** Photo on the cover, stored like the page photos */
  coverPhoto?: string
}

export const DEFAULT_SETTINGS: Settings = { names: ['Edwin', 'Stefany'], coupleName: 'The Gugus' }
