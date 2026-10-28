import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Entry, Settings } from './types'
import { DEFAULT_SETTINGS } from './types'
import { cloudStore, getStatus, localStore, logout, readLook, rememberLook, type Mode, type Store } from './lib/storage'
import { applyPalette } from './data/palettes'
import { buildPages } from './lib/pages'
import { CAFES } from './data/cafes'
import Cover from './components/Cover'
import Passport from './components/Passport'
import Album from './components/Album'
import Explore from './components/Explore'
import Stats from './components/Stats'
import Guide from './components/Guide'
import Editor, { newEntry } from './components/Editor'
import SettingsSheet from './components/SettingsSheet'
import { Icon, Stamp } from './components/art'
import { fmtDate } from './lib/util'

export type View = 'passport' | 'album' | 'explore' | 'stamps' | 'guide'

const TABS: { v: View; label: string; icon: () => React.ReactNode }[] = [
  { v: 'passport', label: 'Passport', icon: () => Icon.book() },
  { v: 'album', label: 'Album', icon: () => Icon.album() },
  { v: 'explore', label: 'Explore', icon: () => Icon.pin() },
  { v: 'stamps', label: 'Stamps', icon: () => Icon.stamp() },
  { v: 'guide', label: 'Coffee 101', icon: () => Icon.cup() },
]

export default function App() {
  const [mode, setMode] = useState<Mode | null>(null)
  const [authed, setAuthed] = useState(false)
  const [open, setOpen] = useState(false)
  const [entries, setEntries] = useState<Entry[] | null>(null)
  // Until the passport loads, the cover wears what this device saw last time.
  const [settings, setSettings] = useState<Settings>(() => {
    const l = readLook()
    return { ...DEFAULT_SETTINGS, coupleName: l.coupleName || '', palette: l.palette, coverPhoto: l.coverPhoto }
  })
  const [view, setView] = useState<View>('passport')
  const [pageKey, setPageKey] = useState<string>(CAFES[0].id)
  const [editing, setEditing] = useState<Entry | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [celebrate, setCelebrate] = useState<Entry | null>(null)

  const store: Store = mode === 'cloud' ? cloudStore : localStore

  useEffect(() => {
    applyPalette(settings.palette)
  }, [settings.palette])

  useEffect(() => {
    getStatus().then((s) => {
      setMode(s.mode)
      setAuthed(s.authed)
    })
  }, [])

  const reload = useCallback(async () => {
    try {
      const d = await store.load()
      setEntries(d.entries)
      setSettings(d.settings)
      rememberLook({ palette: d.settings.palette, coverPhoto: d.settings.coverPhoto, coupleName: d.settings.coupleName })
    } catch (e) {
      if ((e as Error).message === 'locked') {
        setAuthed(false)
        setOpen(false)
      } else flash('Could not load the passport. Check your connection.')
    }
  }, [store])

  useEffect(() => {
    if (mode && authed) reload()
  }, [mode, authed, reload])

  // Pick up what the other person added when the app comes back to the foreground.
  useEffect(() => {
    if (mode !== 'cloud' || !authed) return
    const onVis = () => document.visibilityState === 'visible' && !editing && reload()
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [mode, authed, editing, reload])

  const flash = (m: string) => {
    setToast(m)
    setTimeout(() => setToast(null), 2600)
  }

  const pages = useMemo(() => buildPages(entries || []), [entries])

  async function save(e: Entry) {
    const isNew = !entries?.some((x) => x.id === e.id)
    await store.saveEntry(e)
    setEntries((prev) => [...(prev || []).filter((x) => x.id !== e.id), e])
    setEditing(null)
    setView('passport')
    setPageKey(e.cafeId || 'own:' + e.cafeName.trim().toLowerCase())
    if (isNew) {
      setCelebrate(e)
      setTimeout(() => setCelebrate(null), 1700)
    } else flash('Page updated')
  }

  async function remove(id: string) {
    await store.deleteEntry(id)
    setEntries((prev) => (prev || []).filter((x) => x.id !== id))
    setEditing(null)
    flash('Visit removed')
  }

  async function saveSettings(s: Settings) {
    await store.saveSettings(s)
    setSettings(s)
    rememberLook({ palette: s.palette, coverPhoto: s.coverPhoto, coupleName: s.coupleName })
    flash('Saved')
  }

  if (!mode) return <div className="loading">Opening the passport…</div>

  if (!open)
    return (
      <Cover
        settings={settings}
        needsPin={mode === 'cloud' && !authed}
        onUnlocked={() => setAuthed(true)}
        onOpen={() => setOpen(true)}
      />
    )

  const visitedSuggested = new Set((entries || []).map((e) => e.cafeId).filter(Boolean)).size

  return (
    <>
      <div className="shell">
        <header className="topbar leather">
          <button className="brand" style={{ border: 0, background: 'none', color: 'inherit', padding: 0, textAlign: 'left' }} onClick={() => setOpen(false)} aria-label="Close passport">
            <svg width="34" height="34" viewBox="0 0 64 64" aria-hidden>
              <rect width="64" height="64" rx="14" style={{ fill: 'var(--olive-800)' }} />
              <path d="M16 26h28v10a14 14 0 0 1-28 0z" style={{ fill: 'var(--gold-2)' }} />
              <path d="M44 29h4a5 5 0 0 1 0 10h-5" fill="none" style={{ stroke: 'var(--gold-2)' }} strokeWidth="3" />
              <path d="M24 12c-2 4 2 6 0 10M32 12c-2 4 2 6 0 10" stroke="#f3ead6" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </svg>
            <span>
              <b>COFFEE PASSPORT</b>
              <small>{settings.coupleName} · NYC</small>
            </span>
          </button>
          <span className="spacer" />
          <span className="mini-progress">
            <b>{visitedSuggested}</b>/30
            <br />
            stamped
          </span>
          <button className="top-add" onClick={() => setEditing(newBlank(settings))}>
            {Icon.plus(18)} New café
          </button>
          <button className="icon-btn" onClick={() => setShowSettings(true)} aria-label="Settings">
            {Icon.gear()}
          </button>
        </header>

        {mode === 'local' && (
          <div className="mode-note">
            Preview mode: pages are saved only in this browser. Once it’s published with your PIN, both of your phones share the same passport.
          </div>
        )}

        {!entries ? (
          <div className="loading">Loading pages…</div>
        ) : (
          <>
            {view === 'passport' && (
              <Passport
                pages={pages}
                pageKey={pageKey}
                setPageKey={setPageKey}
                onFill={(draft) => setEditing(draft)}
                onEdit={(e) => setEditing(e)}
                settings={settings}
              />
            )}
            {view === 'album' && <Album entries={entries} onOpen={(k) => { setPageKey(k); setView('passport') }} onAdd={() => setEditing(newBlank(settings))} />}
            {view === 'explore' && <Explore entries={entries} onOpen={(k) => { setPageKey(k); setView('passport') }} />}
            {view === 'stamps' && <Stats entries={entries} settings={settings} onOpen={(k) => { setPageKey(k); setView('passport') }} />}
            {view === 'guide' && <Guide />}
          </>
        )}
      </div>

      {view !== 'guide' && (
        <button className="fab" onClick={() => setEditing(newBlank(settings))}>
          {Icon.plus()} New café
        </button>
      )}

      <nav className="tabs leather" aria-label="Sections">
        {TABS.map((t) => (
          <button key={t.v} className={view === t.v ? 'on' : ''} onClick={() => setView(t.v)} aria-current={view === t.v ? 'page' : undefined}>
            {t.icon()}
            {t.label}
          </button>
        ))}
      </nav>

      {editing && (
        <Editor
          entry={editing}
          isNew={!entries?.some((x) => x.id === editing.id)}
          settings={settings}
          store={store}
          onCancel={() => setEditing(null)}
          onSave={save}
          onDelete={remove}
        />
      )}
      {showSettings && (
        <SettingsSheet
          settings={settings}
          entries={entries || []}
          mode={mode}
          store={store}
          onClose={() => setShowSettings(false)}
          onSave={saveSettings}
          onLock={async () => {
            await logout()
            setEntries(null)
            setAuthed(false)
            setOpen(false)
            setShowSettings(false)
          }}
        />
      )}
      {toast && <div className="toast" role="status">{toast}</div>}
      {celebrate && (
        <div className="big-stamp" aria-live="polite">
          <div>
            <Stamp id={'big-' + celebrate.id} top={celebrate.cafeName || 'New York City'} bottom={'New York City · ' + (celebrate.borough || 'NYC')} center={fmtDate(celebrate.date, 'stamp')} sub="STAMPED!" animate />
          </div>
        </div>
      )}
    </>
  )
}

const newBlank = (s: Settings) => newEntry(undefined, s)
