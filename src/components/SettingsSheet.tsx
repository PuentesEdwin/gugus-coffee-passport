import { useEffect, useRef, useState } from 'react'
import type { Entry, Settings } from '../types'
import { photoSrc, type Mode, type Store } from '../lib/storage'
import { compressImage } from '../lib/image'
import { applyPalette, paletteVars, PALETTES } from '../data/palettes'
import { Icon } from './art'

export default function SettingsSheet({ settings, entries, mode, store, onClose, onSave, onLock }: {
  settings: Settings
  entries: Entry[]
  mode: Mode
  store: Store
  onClose: () => void
  onSave: (s: Settings) => Promise<void>
  onLock: () => void
}) {
  const [s, setS] = useState<Settings>(settings)
  const [busy, setBusy] = useState('')
  const coverRef = useRef<HTMLInputElement>(null)

  // Preview the colors while choosing; closing without saving puts the saved ones back.
  useEffect(() => {
    applyPalette(s.palette)
  }, [s.palette])
  const cancel = () => {
    applyPalette(settings.palette)
    onClose()
  }

  async function pickCover(f?: File) {
    if (!f) return
    setBusy('Uploading the cover photo…')
    try {
      const url = await compressImage(f, 1000)
      setS((x) => ({ ...x, coverPhoto: undefined }))
      const kept = await store.savePhoto(url)
      setS((x) => ({ ...x, coverPhoto: kept }))
      setBusy('')
    } catch {
      setBusy('That photo could not be uploaded. Try another one.')
    }
  }

  function backup() {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), settings, entries }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `coffee-passport-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="sheet-backdrop" onClick={(e) => e.target === e.currentTarget && cancel()}>
      <div className="sheet paper" role="dialog" aria-modal="true" aria-labelledby="st-title" style={{ maxWidth: 480 }}>
        <div className="sheet-head leather">
          <h3 id="st-title">Passport settings</h3>
          <button className="icon-btn" onClick={cancel} aria-label="Close">{Icon.close()}</button>
        </div>
        <div className="sheet-body settings">
          <label htmlFor="s-couple">Name on the cover</label>
          <input id="s-couple" className="input" value={s.coupleName} onChange={(e) => setS({ ...s, coupleName: e.target.value })} />
          <label htmlFor="s-a">Your name</label>
          <input id="s-a" className="input" value={s.names[0]} onChange={(e) => setS({ ...s, names: [e.target.value, s.names[1]] })} />
          <label htmlFor="s-b">Coffee buddy (optional)</label>
          <input id="s-b" className="input" value={s.names[1]} onChange={(e) => setS({ ...s, names: [s.names[0], e.target.value] })} />

          <label>Cover photo</label>
          <div className="cover-pick">
            {s.coverPhoto && <img className="thumb" src={photoSrc(s.coverPhoto)} alt="Current cover photo" />}
            <button type="button" className="btn ghost" onClick={() => coverRef.current?.click()}>
              {s.coverPhoto ? 'Change photo' : 'Add a photo'}
            </button>
            {s.coverPhoto && (
              <button type="button" className="btn ghost" onClick={() => setS({ ...s, coverPhoto: undefined })}>
                Use the coffee emblem
              </button>
            )}
            <input ref={coverRef} type="file" accept="image/*" hidden onChange={(e) => pickCover(e.target.files?.[0])} />
          </div>
          {busy && <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: '6px 0 0' }}>{busy}</p>}

          <label>Passport colors</label>
          <div className="palettes" role="radiogroup" aria-label="Passport colors">
            {PALETTES.map((p) => {
              const v = paletteVars(p)
              return (
                <button
                  type="button"
                  key={p.key}
                  role="radio"
                  aria-checked={(s.palette || 'olive') === p.key}
                  className={'palette' + ((s.palette || 'olive') === p.key ? ' on' : '')}
                  onClick={() => setS({ ...s, palette: p.key })}
                >
                  <span className="sw" style={{ background: `linear-gradient(135deg, ${v['--olive-600']}, ${v['--olive-800']})`, color: v['--gold-2'] }}>NYC</span>
                  {p.name}
                </button>
              )
            })}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            <button className="btn primary" disabled={busy.startsWith('Uploading')} onClick={() => onSave(s).then(onClose)}>Save</button>
            <button className="btn ghost" onClick={backup}>Download a backup</button>
            {mode === 'cloud' && <button className="btn ghost" onClick={onLock}>Sign out of this passport</button>}
          </div>
          <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 16 }}>
            {mode === 'cloud' ? 'Shared mode: both phones see the same passport. Pull the app back to the foreground to refresh.' : 'Preview mode: pages are kept only in this browser.'}
          </p>
        </div>
      </div>
    </div>
  )
}
