import type { Borough, Entry, Settings } from '../types'
import { BITTER_SCALE, DRINKS, drinkByKey } from '../data/drinks'
import { groupKey } from '../lib/pages'
import { BeanRow, CupDiagram, Stamp, Stars } from './art'

const BOROUGHS: Borough[] = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island']

export default function Stats({ entries, settings, onOpen }: { entries: Entry[]; settings: Settings; onOpen: (k: string) => void }) {
  const cafes = new Set(entries.map(groupKey))
  const suggested = new Set(entries.map((e) => e.cafeId).filter(Boolean))
  const boros = new Set(entries.map((e) => e.borough).filter(Boolean))
  const count = (k: string) => entries.filter((e) => e.drinkType === k).length
  const favDrink = DRINKS.map((d) => ({ d, n: count(d.key) })).sort((a, b) => b.n - a.n)[0]
  const avgBitter = entries.length ? entries.reduce((s, e) => s + e.bitterness, 0) / entries.length : 0
  const byBitter = [1, 2, 3, 4, 5].map((n) => entries.filter((e) => e.bitterness === n).length)
  const maxB = Math.max(1, ...byBitter)
  const top = [...entries].filter((e) => e.rating > 0).sort((a, b) => b.rating - a.rating || b.date.localeCompare(a.date)).slice(0, 5)
  const own = [...cafes].filter((k) => k.startsWith('own:')).length
  const months = new Set(entries.map((e) => e.date.slice(0, 7))).size

  const badges = [
    { icon: '☕', name: 'First sip', how: 'Stamp your first café', ok: entries.length >= 1 },
    { icon: '🗽', name: 'Five stamps', how: '5 different cafés', ok: cafes.size >= 5 },
    { icon: '🏙️', name: 'Ten stamps', how: '10 different cafés', ok: cafes.size >= 10 },
    { icon: '🌉', name: 'Bridge crosser', how: 'Cafés in 2 boroughs', ok: boros.size >= 2 },
    { icon: '🚇', name: 'Borough hopper', how: 'Cafés in 3 boroughs', ok: boros.size >= 3 },
    { icon: '🧭', name: 'Trailblazers', how: 'Fill 3 blank pages', ok: own >= 3 },
    { icon: '🥛', name: 'Latte lovers', how: '5 lattes or flat whites', ok: count('latte') + count('flat-white') + count('iced-latte') >= 5 },
    { icon: '⚡', name: 'Espresso brave', how: 'Rate one 5 beans bitter', ok: entries.some((e) => e.bitterness === 5) },
    { icon: '🧪', name: 'Explorers', how: 'Try 6 drink styles', ok: new Set(entries.map((e) => e.drinkType)).size >= 6 },
    { icon: '📆', name: 'Habit', how: 'Coffee dates in 3 months', ok: months >= 3 },
    { icon: '🏆', name: 'Halfway', how: '15 of the 30 suggested', ok: suggested.size >= 15 },
    { icon: '👑', name: 'Passport complete', how: 'All 30 suggested', ok: suggested.size >= 30 },
  ]
  const who = settings.names.map((n) => ({ n, c: entries.filter((e) => e.filledBy.includes(n)).length }))

  return (
    <section>
      <div className="section-title">
        <h2>Stamps & stats</h2>
        <p>What your coffee dates say about you two</p>
      </div>
      <div className="stats-grid">
        <div className="card paper">
          <h3>So far</h3>
          <div className="kpis">
            <div><b>{cafes.size}</b><span>cafés</span></div>
            <div><b>{entries.length}</b><span>visits</span></div>
            <div><b>{suggested.size}<small style={{ fontSize: 16 }}>/30</small></b><span>suggested</span></div>
          </div>
          <Progress v={suggested.size / 30} />
        </div>

        <div className="card paper">
          <h3>Borough stamps</h3>
          <div className="boroughs">
            {BOROUGHS.map((b) => (
              <div key={b} className="boro" style={{ opacity: boros.has(b) ? 1 : 0.3, filter: boros.has(b) ? undefined : 'grayscale(1)', color: boros.has(b) ? 'var(--brown-800)' : undefined }}>
                <Stamp id={'boro-' + b} top={b} bottom="NYC" center={boros.has(b) ? '✓' : '?'} sub={boros.has(b) ? 'INKED' : undefined} />
                {b === 'Staten Island' ? 'Staten Is.' : b}
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 0 }}>{boros.size}/5 boroughs. Every borough you drink coffee in inks its stamp.</p>
        </div>

        <div className="card paper">
          <h3>Your bitterness profile</h3>
          {entries.length ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <BeanRow value={Math.round(avgBitter)} />
                <span style={{ fontSize: 14 }}><b>{avgBitter.toFixed(1)}</b> avg · {BITTER_SCALE[Math.max(0, Math.round(avgBitter) - 1)].label}</span>
              </div>
              <div className="bars">
                {BITTER_SCALE.map((s, i) => (
                  <div key={s.n} className="bar">
                    <span>{s.n} · {s.label}</span>
                    <span className="track"><span className="fill" style={{ display: 'block', width: `${(byBitter[i] / maxB) * 100}%` }} /></span>
                    <span>{byBitter[i]}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p style={{ fontSize: 14, color: 'var(--ink-soft)' }}>Rate your first coffee to see whether you two lean sweet or bold.</p>
          )}
        </div>

        <div className="card paper">
          <h3>Favorite drink</h3>
          {favDrink && favDrink.n > 0 ? (
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <CupDiagram drink={favDrink.d} size={90} id="fav" />
              <div>
                <b style={{ fontFamily: 'var(--f-display)', fontSize: 22 }}>{favDrink.d.name}</b>
                <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>ordered {favDrink.n} {favDrink.n === 1 ? 'time' : 'times'}</div>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 14, color: 'var(--ink-soft)' }}>Shows up after your first visit.</p>
          )}
          <div style={{ marginTop: 12, fontSize: 13 }}>
            {who.map((w) => (
              <span key={w.n} style={{ marginRight: 14 }}><b>{w.n}</b> filled {w.c} {w.c === 1 ? 'page' : 'pages'}</span>
            ))}
          </div>
        </div>

        <div className="card paper">
          <h3>Top rated</h3>
          {top.length ? (
            <ol className="top-list">
              {top.map((e) => (
                <li key={e.id}>
                  <CupDiagram drink={drinkByKey(e.drinkType)} size={36} id={'top-' + e.id} />
                  <button style={{ border: 0, background: 'none', padding: 0, textAlign: 'left', flex: 1 }} onClick={() => onOpen(groupKey(e))}>
                    <b>{e.cafeName}</b>
                    <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{e.drink}</div>
                  </button>
                  <Stars n={e.rating} />
                </li>
              ))}
            </ol>
          ) : (
            <p style={{ fontSize: 14, color: 'var(--ink-soft)' }}>Give a visit some stars and it lands here.</p>
          )}
        </div>
      </div>

      <div className="card paper" style={{ marginTop: 16 }}>
        <h3>Badges</h3>
        <div className="badges">
          {badges.map((b) => (
            <div key={b.name} className={'badge' + (b.ok ? '' : ' locked')}>
              <div className="medal" aria-hidden>{b.icon}</div>
              <b>{b.name}</b>
              <span>{b.how}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Progress({ v }: { v: number }) {
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ height: 14, borderRadius: 7, background: 'var(--olive-100)', overflow: 'hidden' }}>
        <div style={{ width: `${Math.max(2, v * 100)}%`, height: '100%', background: 'linear-gradient(90deg, var(--olive-500), var(--brown-500))', borderRadius: 7, transition: 'width .6s' }} />
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 6 }}>{Math.round(v * 100)}% of the suggested passport</div>
    </div>
  )
}
