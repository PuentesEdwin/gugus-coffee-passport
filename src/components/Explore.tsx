import { useState } from 'react'
import type { Borough, Entry } from '../types'
import { CAFES } from '../data/cafes'
import { Icon, Stamp } from './art'
import { fmtDate } from '../lib/util'

const ORDER: Borough[] = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island']

export default function Explore({ entries, onOpen }: { entries: Entry[]; onOpen: (key: string) => void }) {
  const [pick, setPick] = useState<string | null>(null)
  const last = new Map<string, Entry>()
  for (const e of entries) if (e.cafeId && (!last.get(e.cafeId) || last.get(e.cafeId)!.date < e.date)) last.set(e.cafeId, e)
  const todo = CAFES.filter((c) => !last.has(c.id))
  const picked = CAFES.find((c) => c.id === pick)

  return (
    <section>
      <div className="section-title">
        <h2>30 cafés to collect</h2>
        <p>{last.size} stamped · {todo.length} to go</p>
      </div>

      <div className="surprise leather">
        <div>
          <h3>Can’t decide where to go?</h3>
          <p>Let the passport pick your next coffee date.</p>
        </div>
        <button className="btn" onClick={() => todo.length && setPick(todo[Math.floor(Math.random() * todo.length)].id)} disabled={!todo.length}>
          {Icon.dice()} Surprise us
        </button>
        {picked && (
          <div className="pick" key={picked.id}>
            <b>{picked.name}</b> · {picked.neighborhood}, {picked.borough}
            <div style={{ fontSize: 14, marginTop: 4 }}>Order: {picked.mustTry}</div>
            <button className="chip" style={{ marginTop: 10 }} onClick={() => onOpen(picked.id)}>Open its page →</button>
          </div>
        )}
      </div>

      {ORDER.map((b) => {
        const list = CAFES.map((c, i) => ({ c, i })).filter(({ c }) => c.borough === b)
        if (!list.length) return null
        const done = list.filter(({ c }) => last.has(c.id)).length
        return (
          <div key={b}>
            <div className="borough-head">{b} <small>{done}/{list.length}</small></div>
            <div className="ticket-grid">
              {list.map(({ c, i }) => {
                const v = last.get(c.id)
                return (
                  <button key={c.id} className={'ticket paper' + (v ? ' done' : '')} onClick={() => onOpen(c.id)}>
                    <div style={{ paddingRight: v ? 56 : 0 }}>
                      <div className="num">No. {String(i + 1).padStart(2, '0')}</div>
                      <h4>{c.name}</h4>
                      <div className="meta">{c.neighborhood}</div>
                      <div className="try"><b>Try:</b> {c.mustTry}</div>
                    </div>
                    {v && (
                      <span className="mini-stamp">
                        <Stamp id={'ex-' + v.id} top={c.name} bottom="NYC" center={fmtDate(v.date, 'stamp').slice(0, 6)} />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </section>
  )
}
