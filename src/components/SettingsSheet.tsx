import { useState } from 'react'
import type { Entry, Settings } from '../types'
import type { Mode } from '../lib/storage'
import { Icon } from './art'

export default function SettingsSheet({ settings, entries, mode, onClose, onSave, onLock }: {
  settings: Settings
  entries: Entry[]
  mode: Mode
  onClose: () => void
  onSave: (s: Settings) => Promise<void>
  onLock: () => void
}) {
  const [s, setS] = useState<Settings>(settings)

  function backup() {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), settings, entries }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `coffee-passport-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="sheet-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet paper" role="dialog" aria-modal="true" aria-labelledby="st-title" style={{ maxWidth: 480 }}>
        <div className="sheet-head leather">
          <h3 id="st-title">Passport settings</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">{Icon.close()}</button>
        </div>
        <div className="sheet-body settings">
          <label htmlFor="s-couple">Name on the cover</label>
          <input id="s-couple" className="input" value={s.coupleName} onChange={(e) => setS({ ...s, coupleName: e.target.value })} />
          <label htmlFor="s-a">First traveler</label>
          <input id="s-a" className="input" value={s.names[0]} onChange={(e) => setS({ ...s, names: [e.target.value, s.names[1]] })} />
          <label htmlFor="s-b">Second traveler</label>
          <input id="s-b" className="input" value={s.names[1]} onChange={(e) => setS({ ...s, names: [s.names[0], e.target.value] })} />
          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            <button className="btn primary" onClick={() => onSave(s).then(onClose)}>Save</button>
            <button className="btn ghost" onClick={backup}>Download a backup</button>
            {mode === 'cloud' && <button className="btn ghost" onClick={onLock}>Lock this device</button>}
          </div>
          <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 16 }}>
            {mode === 'cloud' ? 'Shared mode: both phones see the same passport. Pull the app back to the foreground to refresh.' : 'Preview mode: pages are kept only in this browser.'}
          </p>
        </div>
      </div>
    </div>
  )
}
