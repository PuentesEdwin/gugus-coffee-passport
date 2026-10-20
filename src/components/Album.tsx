import { useState } from 'react'
import type { Entry } from '../types'
import { drinkByKey } from '../data/drinks'
import { photoSrc } from '../lib/storage'
import { groupKey } from '../lib/pages'
import { fmtDate, hash } from '../lib/util'
import { BeanRow, CupDiagram, Emblem, Icon } from './art'

export default function Album({ entries, onOpen, onAdd }: { entries: Entry[]; onOpen: (key: string) => void; onAdd: () => void }) {
  const [boro, setBoro] = useState('All')
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
  const boros = ['All', ...new Set(sorted.map((e) => e.borough).filter(Boolean))]
  const list = sorted.filter((e) => boro === 'All' || e.borough === boro)

  return (
    <section>
      <div className="section-title">
        <h2>Photo album</h2>
        <p>{entries.length} {entries.length === 1 ? 'memory' : 'memories'} · tap a photo to open its passport page</p>
      </div>
      {entries.length === 0 ? (
        <div className="empty-state paper card">
          <div style={{ width: 120, margin: '0 auto', color: 'var(--olive-700)', background: 'var(--olive-700)', borderRadius: '50%', padding: 8 }}><Emblem /></div>
          <h3>Your album is waiting</h3>
          <p>Every café you stamp shows up here as a polaroid: the storefront and your cup, side by side.</p>
          <button className="btn primary" onClick={onAdd}>{Icon.plus()} Add our first café</button>
        </div>
      ) : (
        <>
          {boros.length > 2 && (
            <div className="chips" style={{ marginBottom: 16 }}>
              {boros.map((b) => (
                <button key={b} className={'chip' + (boro === b ? ' on' : '')} onClick={() => setBoro(b)}>{b}</button>
              ))}
            </div>
          )}
          <div className="album">
            {list.map((e) => {
              const t = (hash(e.id) * 6 - 3).toFixed(1)
              const store = photoSrc(e.photoStore)
              const coffee = photoSrc(e.photoCoffee)
              const main = store || coffee
              const inset = store && coffee ? coffee : undefined
              return (
                <button key={e.id} className="album-card" onClick={() => onOpen(groupKey(e))}>
                  <figure className="polaroid" style={{ ['--tilt' as string]: t + 'deg', margin: 0 }}>
                    <span className="tape" />
                    {main ? (
                      <div className="ph"><img src={main} alt={e.cafeName} loading="lazy" /></div>
                    ) : (
                      <div className="ph noimg"><CupDiagram drink={drinkByKey(e.drinkType)} size={90} id={'al-' + e.id} /></div>
                    )}
                    <div className="cap">
                      <b>{e.cafeName}</b>
                      <span>{e.drink} · {fmtDate(e.date, 'stamp')}</span>
                      <div style={{ marginTop: 4 }}><BeanRow value={e.bitterness} size={16} /></div>
                    </div>
                  </figure>
                  {inset && (
                    <span className="inset"><img src={inset} alt={'Coffee at ' + e.cafeName} loading="lazy" /></span>
                  )}
                </button>
              )
            })}
          </div>
        </>
      )}
    </section>
  )
}
