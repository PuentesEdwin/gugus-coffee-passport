import { useEffect, useMemo, useRef, useState } from 'react'
import type { Entry, Settings } from '../types'
import type { Page } from '../lib/pages'
import { BITTER_SCALE, drinkByKey } from '../data/drinks'
import { photoSrc } from '../lib/storage'
import { fmtDate } from '../lib/util'
import { BeanRow, CupDiagram, Icon, Stamp, Stars } from './art'
import { newEntry } from './Editor'

type Filter = 'all' | 'stamped' | 'todo'

export default function Passport({ pages, pageKey, setPageKey, onFill, onEdit, settings }: {
  pages: Page[]
  pageKey: string
  setPageKey: (k: string) => void
  onFill: (draft: Entry) => void
  onEdit: (e: Entry) => void
  settings: Settings
}) {
  const [filter, setFilter] = useState<Filter>('all')
  const [dir, setDir] = useState<'fwd' | 'back'>('fwd')
  const shown = useMemo(() => pages.filter((p) => (filter === 'all' ? true : filter === 'stamped' ? p.visits.length > 0 : p.visits.length === 0)), [pages, filter])
  let idx = shown.findIndex((p) => p.key === pageKey)
  if (idx < 0) idx = 0
  const page = shown[idx]

  const go = (d: number) => {
    const n = idx + d
    if (n < 0 || n >= shown.length) return
    setDir(d > 0 ? 'fwd' : 'back')
    setPageKey(shown[n].key)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, textarea, select')) return
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // swipe to turn the page
  const touch = useRef<{ x: number; y: number } | null>(null)

  const stamped = pages.filter((p) => p.visits.length).length

  return (
    <section>
      <div className="section-title">
        <h2>Our passport</h2>
        <p>{stamped} of {pages.length} pages stamped · swipe or use the arrows to turn pages</p>
      </div>
      <div className="book-nav">
        <div className="chips" role="tablist">
          {(['all', 'stamped', 'todo'] as Filter[]).map((f) => (
            <button key={f} className={'chip' + (filter === f ? ' on' : '')} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All pages' : f === 'stamped' ? 'Stamped' : 'Still to visit'}
            </button>
          ))}
        </div>
        <div className="pager">
          <button className="round" onClick={() => go(-1)} disabled={idx === 0} aria-label="Previous page">{Icon.left()}</button>
          <span className="page-count">{shown.length ? `${idx + 1} / ${shown.length}` : '0 / 0'}</span>
          <button className="round" onClick={() => go(1)} disabled={idx >= shown.length - 1} aria-label="Next page">{Icon.right()}</button>
        </div>
        <label className="sr-only" htmlFor="jump">Jump to page</label>
        <select id="jump" className="jump" value={page?.key || ''} onChange={(e) => { setDir('fwd'); setPageKey(e.target.value) }}>
          {shown.map((p) => (
            <option key={p.key} value={p.key}>
              {String(p.no).padStart(2, '0')} · {p.cafe?.name || p.visits[0]?.cafeName || 'Blank page'} {p.visits.length ? '✓' : ''}
            </option>
          ))}
        </select>
      </div>

      {!page ? (
        <div className="empty-state paper card">
          <h3>No pages here yet</h3>
          <p>{filter === 'stamped' ? 'Your first stamp is one coffee away.' : 'You visited them all. Legends.'}</p>
        </div>
      ) : (
        <div className="book-wrap">
          <PageSpread
            key={page.key + filter}
            page={page}
            dir={dir}
            settings={settings}
            onFill={onFill}
            onEdit={onEdit}
            onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
            onTouchEnd={(e) => {
              if (!touch.current) return
              const dx = e.changedTouches[0].clientX - touch.current.x
              const dy = e.changedTouches[0].clientY - touch.current.y
              touch.current = null
              if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1)
            }}
          />
        </div>
      )}
    </section>
  )
}

function PageSpread({ page, dir, settings, onFill, onEdit, onTouchStart, onTouchEnd }: {
  page: Page
  dir: 'fwd' | 'back'
  settings: Settings
  onFill: (d: Entry) => void
  onEdit: (e: Entry) => void
  onTouchStart: (e: React.TouchEvent) => void
  onTouchEnd: (e: React.TouchEvent) => void
}) {
  const [vi, setVi] = useState(page.visits.length - 1)
  const visit = page.visits[vi] as Entry | undefined
  const cafe = page.cafe
  const name = cafe?.name || visit?.cafeName
  const boro = cafe?.borough || visit?.borough
  const hood = cafe?.neighborhood || visit?.neighborhood
  const addr = cafe?.address || visit?.address
  const tilt = (k: number) => ({ ['--tilt' as string]: `${k}deg` })

  const startDraft = () => {
    const d = newEntry(cafe, settings)
    if (!cafe && visit) Object.assign(d, { cafeName: visit.cafeName, neighborhood: visit.neighborhood, borough: visit.borough, address: visit.address })
    onFill(d)
  }

  return (
    <article className={'spread' + (dir === 'back' ? ' back' : '')} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {/* left leaf: the place */}
      <div className="leaf paper guilloche">
        <div className="page-no">
          <span>PAGE {String(page.no).padStart(2, '0')}</span>
          <span>{cafe ? 'SUGGESTED STOP' : 'OUR OWN FIND'}</span>
        </div>
        {name ? (
          <>
            <h3 className="cafe-name">{name}</h3>
            <span className="borough-tag">{Icon.pin(14)} {[hood, boro].filter(Boolean).join(' · ')}</span>
            {addr && (
              <p className="addr">
                <a href={'https://maps.google.com/?q=' + encodeURIComponent(name + ', ' + addr)} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>{addr}</a>
              </p>
            )}
          </>
        ) : (
          <>
            <h3 className="cafe-name" style={{ color: 'var(--brown-300)' }}>Blank page</h3>
            <p className="addr">A café you discover on your own. Walk in, order, and fill this page.</p>
          </>
        )}
        {cafe && (
          <>
            <div className="info-card"><span className="k">Must try</span>{cafe.mustTry}</div>
            <div className="info-card"><span className="k">Why go</span>{cafe.why}</div>
          </>
        )}
        <div className="polaroids">
          <Polaroid src={photoSrc(visit?.photoStore)} label="The storefront" tilt={tilt(-3)} />
          <Polaroid src={photoSrc(visit?.photoCoffee)} label="Our coffee" tilt={tilt(2.5)} />
        </div>
      </div>

      {/* right leaf: the tasting */}
      <div className="leaf paper">
        <div className="page-no">
          <span>TASTING NOTES</span>
          <span>{visit ? fmtDate(visit.date, 'stamp') : 'DATE ____'}</span>
        </div>
        {page.visits.length > 1 && (
          <div className="visit-tabs" role="tablist" aria-label="Visits">
            {page.visits.map((v, i) => (
              <button key={v.id} className={i === vi ? 'on' : ''} onClick={() => setVi(i)}>Visit {i + 1}</button>
            ))}
          </div>
        )}
        {visit ? <Tasting visit={visit} /> : <EmptyTasting cafe={!!cafe} onFill={startDraft} />}
        {visit && (
          <div className="leaf-actions">
            <button className="btn brown" onClick={() => onEdit(visit)}>{Icon.edit()} Edit page</button>
            <button className="btn ghost" onClick={startDraft}>{Icon.plus(16)} Another visit</button>
          </div>
        )}
        <div className={'stamp-zone' + (visit ? '' : ' empty')}>
          {visit ? (
            <Stamp id={visit.id} top={visit.cafeName} bottom={'New York City · ' + (visit.borough || 'NYC')} center={fmtDate(visit.date, 'stamp')} sub={visit.rating >= 5 ? 'FAVORITE' : 'VISITED'} />
          ) : (
            <span>STAMP<br />HERE</span>
          )}
        </div>
      </div>
    </article>
  )
}

function Polaroid({ src, label, tilt }: { src?: string; label: string; tilt: React.CSSProperties }) {
  return (
    <figure className={'polaroid' + (src ? '' : ' empty')} style={{ ...tilt, margin: 0 }}>
      <span className="tape" />
      <div className="ph">
        {src ? <img src={src} alt={label} loading="lazy" /> : Icon.camera()}
      </div>
      <figcaption>{label}</figcaption>
    </figure>
  )
}

function Tasting({ visit }: { visit: Entry }) {
  const d = drinkByKey(visit.drinkType)
  const scale = BITTER_SCALE[Math.max(0, visit.bitterness - 1)]
  return (
    <>
      <div className="field" style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="lbl">{Icon.cup(14)} What we drank</div>
          <div className="val big">{visit.drink || d.name}</div>
        </div>
        <CupDiagram drink={d} size={64} id={'p-' + visit.id} />
      </div>
      <div className="field">
        <div className="lbl">Bitterness</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', paddingTop: 4 }}>
          <BeanRow value={visit.bitterness} />
          <span className="bitter-label"><b>{scale.label}</b> · {scale.desc}</span>
        </div>
      </div>
      <div className="row2">
        <div className="field">
          <div className="lbl">Overall</div>
          <div className="val"><Stars n={visit.rating} /></div>
        </div>
        <div className="field">
          <div className="lbl">Price</div>
          <div className="val">{visit.price ? '$' + visit.price.replace(/^\$/, '') : '—'}</div>
        </div>
      </div>
      <div className="field">
        <div className="lbl">Notes</div>
        <div className="notes">{visit.notes || ' '}</div>
      </div>
      {visit.filledBy.length > 0 && <div className="filled-by">— {visit.filledBy.join(' & ')}</div>}
    </>
  )
}

function EmptyTasting({ cafe, onFill }: { cafe: boolean; onFill: () => void }) {
  return (
    <>
      <div className="field"><div className="lbl">What we drank</div><div className="val" /></div>
      <div className="field"><div className="lbl">Bitterness</div><div style={{ paddingTop: 4, opacity: 0.6 }}><BeanRow value={0} /></div></div>
      <div className="field"><div className="lbl">Notes</div><div className="notes" style={{ minHeight: 90 }} /></div>
      <div className="empty-cta">
        <p>{cafe ? 'Not stamped yet. When you go, snap the storefront and your cup, then fill this page together.' : 'Found a café that’s not on the list? Make it yours.'}</p>
        <button className="btn primary" onClick={onFill}>{Icon.stamp(18)} {cafe ? 'We were here!' : 'Fill this page'}</button>
      </div>
    </>
  )
}
