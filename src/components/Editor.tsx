import { useState } from 'react'
import type { Borough, Cafe, Entry, Settings } from '../types'
import { BITTER_SCALE, DRINKS, drinkByKey } from '../data/drinks'
import { CAFES } from '../data/cafes'
import { compressImage } from '../lib/image'
import { photoSrc, type Store } from '../lib/storage'
import { today, uid } from '../lib/util'
import { BeanRow, CupDiagram, Icon } from './art'

const BOROUGHS: Borough[] = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island']

export function newEntry(cafe: Cafe | undefined, s: Settings): Entry {
  return {
    id: uid(),
    cafeId: cafe?.id,
    cafeName: cafe?.name || '',
    neighborhood: cafe?.neighborhood || '',
    borough: cafe?.borough || '',
    address: cafe?.address || '',
    date: today(),
    drink: '',
    drinkType: '',
    bitterness: 3,
    rating: 0,
    price: '',
    notes: '',
    filledBy: s.names.filter(Boolean),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

export default function Editor({ entry, isNew, settings, store, onCancel, onSave, onDelete }: {
  entry: Entry
  isNew: boolean
  settings: Settings
  store: Store
  onCancel: () => void
  onSave: (e: Entry) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [e, setE] = useState<Entry>(entry)
  const [busy, setBusy] = useState<string | null>(null)
  const [err, setErr] = useState('')
  const [confirmDel, setConfirmDel] = useState(false)
  const up = (p: Partial<Entry>) => setE((x) => ({ ...x, ...p }))
  const suggested = e.cafeId ? CAFES.find((c) => c.id === e.cafeId) : undefined
  const scale = BITTER_SCALE[e.bitterness - 1]

  async function pickPhoto(field: 'photoStore' | 'photoCoffee', file?: File) {
    if (!file) return
    try {
      setBusy('Preparing photo…')
      up({ [field]: await compressImage(file) })
    } catch {
      setErr('That photo could not be read. Try another one.')
    } finally {
      setBusy(null)
    }
  }

  async function submit() {
    if (!e.cafeName.trim()) return setErr('Give the café a name first.')
    if (!e.drinkType) return setErr('Pick what you drank (step 3).')
    setErr('')
    try {
      const out = { ...e, cafeName: e.cafeName.trim(), drink: e.drink.trim() || drinkByKey(e.drinkType).name, updatedAt: Date.now() }
      for (const f of ['photoStore', 'photoCoffee'] as const) {
        if (out[f]?.startsWith('data:')) {
          setBusy('Uploading photos…')
          out[f] = await store.savePhoto(out[f]!)
        }
      }
      setBusy('Stamping…')
      await onSave(out)
    } catch (x) {
      setErr('Could not save: ' + (x as Error).message)
      setBusy(null)
    }
  }

  return (
    <div className="sheet-backdrop" onClick={(ev) => ev.target === ev.currentTarget && !busy && onCancel()}>
      <div className="sheet paper" role="dialog" aria-modal="true" aria-labelledby="ed-title">
        <div className="sheet-head leather">
          <h3 id="ed-title">{isNew ? 'Fill a passport page' : 'Edit this page'}</h3>
          <button className="icon-btn" onClick={onCancel} aria-label="Close" disabled={!!busy}>{Icon.close()}</button>
        </div>
        <div className="sheet-body">
          {/* 1. where */}
          <div className="step-block">
            <div className="head"><span className="n">1</span><div><b>Where</b><br /><span>The café and the day you went</span></div></div>
            {suggested ? (
              <div className="info-card"><span className="k">Suggested stop</span><b>{suggested.name}</b> · {suggested.neighborhood}, {suggested.borough}</div>
            ) : (
              <>
                <label className="sr-only" htmlFor="ed-name">Café name</label>
                <input id="ed-name" className="input" placeholder="Café name" value={e.cafeName} onChange={(x) => up({ cafeName: x.target.value })} />
                <div className="row2" style={{ marginTop: 8 }}>
                  <input className="input" placeholder="Neighborhood (e.g. SoHo)" aria-label="Neighborhood" value={e.neighborhood} onChange={(x) => up({ neighborhood: x.target.value })} />
                  <input className="input" placeholder="Address (optional)" aria-label="Address" value={e.address} onChange={(x) => up({ address: x.target.value })} />
                </div>
                <div className="chips" style={{ marginTop: 8 }}>
                  {BOROUGHS.map((b) => (
                    <button type="button" key={b} className={'chip' + (e.borough === b ? ' on' : '')} onClick={() => up({ borough: b })}>{b}</button>
                  ))}
                </div>
              </>
            )}
            <label style={{ display: 'block', marginTop: 10, fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)' }} htmlFor="ed-date">Date</label>
            <input id="ed-date" type="date" className="input" value={e.date} onChange={(x) => up({ date: x.target.value })} style={{ maxWidth: 220 }} />
          </div>

          {/* 2. photos */}
          <div className="step-block">
            <div className="head"><span className="n">2</span><div><b>Two photos</b><br /><span>The storefront from outside, and your coffee or the beans they use</span></div></div>
            <div className="polaroids" style={{ marginTop: 6 }}>
              {(
                [
                  ['photoStore', 'The storefront'],
                  ['photoCoffee', 'Coffee / beans'],
                ] as const
              ).map(([f, label], i) => (
                <label key={f} className="upload">
                  <figure className={'polaroid' + (e[f] ? '' : ' empty')} style={{ margin: 0, ['--tilt' as string]: i ? '2deg' : '-2deg' }}>
                    <div className="ph">
                      {e[f] ? <img src={photoSrc(e[f])} alt={label} /> : <>{Icon.camera()}<span>Tap to add<br />{label.toLowerCase()}</span></>}
                    </div>
                    <figcaption>{label}</figcaption>
                  </figure>
                  <input type="file" accept="image/*" aria-label={label} onChange={(x) => pickPhoto(f, x.target.files?.[0])} />
                  {e[f] && (
                    <button type="button" className="remove" aria-label={'Remove ' + label} onClick={(x) => { x.preventDefault(); up({ [f]: undefined }) }}>{Icon.close(14)}</button>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* 3. drink */}
          <div className="step-block">
            <div className="head"><span className="n">3</span><div><b>What we drank</b><br /><span>Pick the style, then name it the way the menu does</span></div></div>
            <div className="drink-chips">
              {DRINKS.map((d) => (
                <button
                  type="button"
                  key={d.key}
                  className={'drink-chip' + (e.drinkType === d.key ? ' on' : '')}
                  onClick={() => up({ drinkType: d.key, drink: !e.drink || DRINKS.some((x) => x.name === e.drink) ? d.name : e.drink, bitterness: e.drinkType ? e.bitterness : d.bitter })}
                >
                  <CupDiagram drink={d} size={44} id={'chip-' + d.key} />
                  {d.name}
                </button>
              ))}
            </div>
            <label className="sr-only" htmlFor="ed-drink">Drink name</label>
            <input id="ed-drink" className="input" style={{ marginTop: 10 }} placeholder="e.g. Iced oat latte, Lavender cortado…" value={e.drink} onChange={(x) => up({ drink: x.target.value })} />
          </div>

          {/* 4. bitterness */}
          <div className="step-block">
            <div className="head"><span className="n">4</span><div><b>How bitter was it?</b><br /><span>Tap the beans</span></div></div>
            <div className="bitter-live">
              <BeanRow value={e.bitterness} size={34} onChange={(n) => up({ bitterness: n })} />
              <div className="txt"><b>{e.bitterness} · {scale.label}</b><span>{scale.desc}</span></div>
            </div>
          </div>

          {/* 5. overall + price */}
          <div className="step-block">
            <div className="head"><span className="n">5</span><div><b>Overall & price</b><br /><span>Would you come back?</span></div></div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="star-input" role="radiogroup" aria-label="Overall rating">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button type="button" key={n} role="radio" aria-checked={e.rating === n} aria-label={`${n} stars`} className={n <= e.rating ? 'on' : ''} onClick={() => up({ rating: e.rating === n ? 0 : n })}>★</button>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontWeight: 700 }}>$</span>
                <input className="input" style={{ width: 110 }} inputMode="decimal" placeholder="6.50" aria-label="Price" value={e.price} onChange={(x) => up({ price: x.target.value })} />
              </div>
            </div>
          </div>

          {/* 6. notes */}
          <div className="step-block">
            <div className="head"><span className="n">6</span><div><b>Notes</b><br /><span>Vibe, music, the pastry, who said what…</span></div></div>
            <label className="sr-only" htmlFor="ed-notes">Notes</label>
            <textarea id="ed-notes" className="lined" placeholder="Cozy corner by the window, chocolatey finish…" value={e.notes} onChange={(x) => up({ notes: x.target.value })} />
          </div>

          {/* 7. who */}
          <div className="step-block">
            <div className="head"><span className="n">7</span><div><b>Filled by</b></div></div>
            <div className="chips">
              {settings.names.filter(Boolean).map((n) => (
                <button type="button" key={n} className={'chip' + (e.filledBy.includes(n) ? ' on' : '')} onClick={() => up({ filledBy: e.filledBy.includes(n) ? e.filledBy.filter((x) => x !== n) : [...e.filledBy, n] })}>{n}</button>
              ))}
            </div>
          </div>

          {!isNew && (
            <div style={{ marginTop: 26, borderTop: '1px dashed var(--line)', paddingTop: 14 }}>
              {confirmDel ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14 }}>Remove this visit and its photos?</span>
                  <button className="btn danger" disabled={!!busy} onClick={() => { setBusy('Removing…'); onDelete(e.id).catch((x) => { setErr((x as Error).message); setBusy(null) }) }}>Yes, remove</button>
                  <button className="btn ghost" onClick={() => setConfirmDel(false)}>Keep it</button>
                </div>
              ) : (
                <button className="btn ghost" onClick={() => setConfirmDel(true)}>Remove this visit</button>
              )}
            </div>
          )}
          {err && <p role="alert" style={{ color: '#8f3220', fontWeight: 700, marginBottom: 0 }}>{err}</p>}
        </div>
        <div className="sheet-foot">
          <button className="btn ghost" onClick={onCancel} disabled={!!busy}>Cancel</button>
          <button className="btn primary" onClick={submit} disabled={!!busy}>{busy || (isNew ? 'Save & stamp it' : 'Save changes')}</button>
        </div>
      </div>
    </div>
  )
}
