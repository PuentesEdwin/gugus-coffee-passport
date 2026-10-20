import { useState } from 'react'
import type { Settings } from '../types'
import { login } from '../lib/storage'
import { Emblem } from './art'

export default function Cover({ settings, needsPin, onUnlocked, onOpen }: { settings: Settings; needsPin: boolean; onUnlocked: () => void; onOpen: () => void }) {
  const [opening, setOpening] = useState(false)
  const [pin, setPin] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [shake, setShake] = useState(false)

  const open = () => {
    setOpening(true)
    setTimeout(onOpen, 650)
  }

  async function submit(p = pin) {
    if (!p || busy) return
    setBusy(true)
    setErr('')
    const ok = await login(p)
    setBusy(false)
    if (ok) {
      onUnlocked()
      open()
    } else {
      setErr('That PIN doesn’t match. Try again.')
      setPin('')
      setShake(true)
      setTimeout(() => setShake(false), 450)
    }
  }

  const press = (d: string) => {
    if (d === '⌫') return setPin((p) => p.slice(0, -1))
    if (d === '→') return submit()
    setPin((p) => (p.length < 12 ? p + d : p))
  }

  return (
    <div className="cover-stage">
      <div className={'cover leather' + (opening ? ' opening' : '')}>
        <div>
          <h1 className="gold">COFFEE<br />PASSPORT</h1>
          <div className="city gold">NEW YORK CITY</div>
        </div>
        <Emblem />
        <div className="couple gold">{settings.coupleName}</div>
        {needsPin ? (
          <form
            className={shake ? 'shake' : ''}
            onSubmit={(e) => {
              e.preventDefault()
              submit()
            }}
          >
            <label className="sr-only" htmlFor="pin">PIN</label>
            <input id="pin" className="sr-only" inputMode="numeric" autoComplete="current-password" type="password" value={pin} onChange={(e) => setPin(e.target.value)} />
            <div className="pin-dots" aria-hidden>
              {Array.from({ length: Math.max(4, pin.length) }).map((_, i) => (
                <span key={i} className={i < pin.length ? 'on' : ''} />
              ))}
            </div>
            <div className="pin-pad">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '→'].map((d) => (
                <button type="button" key={d} onClick={() => press(d)} disabled={busy} aria-label={d === '⌫' ? 'Delete' : d === '→' ? 'Unlock' : d}>
                  {d}
                </button>
              ))}
            </div>
            <div className="pin-err" role="alert">{busy ? 'Checking…' : err}</div>
          </form>
        ) : (
          <button className="cover-btn" onClick={open}>Open passport</button>
        )}
      </div>
    </div>
  )
}
