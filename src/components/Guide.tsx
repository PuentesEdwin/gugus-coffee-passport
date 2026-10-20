import { BITTER_SCALE, DRINKS, LAYER_INFO, TASTING_STEPS } from '../data/drinks'
import { BeanRow, CupDiagram } from './art'

export default function Guide() {
  const used = new Set(DRINKS.flatMap((d) => d.layers.map(([l]) => l)))
  return (
    <section>
      <div className="section-title">
        <h2>Coffee 101</h2>
        <p>A pocket guide to fill your pages like pros</p>
      </div>

      <div className="card paper">
        <h3>The bitterness scale</h3>
        <div className="scale">
          {BITTER_SCALE.map((s) => (
            <div key={s.n} className="scale-row">
              <BeanRow value={s.n} size={20} />
              <div><b>{s.n} · {s.label}</b><span>{s.desc}</span></div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 0 }}>
          Darker roasts, longer extraction and less milk push it up. Light roasts taste more acidic (bright, fruity), which is not the same as bitter.
        </p>
      </div>

      <div className="card paper" style={{ marginTop: 16 }}>
        <h3>How to taste, in 6 steps</h3>
        <div className="steps">
          {TASTING_STEPS.map((s) => (
            <div key={s.t} className="step"><b>{s.t}</b>{s.d}</div>
          ))}
        </div>
      </div>

      <div className="section-title" style={{ marginTop: 26 }}>
        <h2 style={{ fontSize: 26 }}>What’s in the cup?</h2>
        <p>Each drawing shows the layers, bottom to top</p>
      </div>
      <div className="legend">
        {[...used].map((l) => (
          <span key={l}><i style={{ background: LAYER_INFO[l].color }} />{LAYER_INFO[l].label}</span>
        ))}
      </div>
      <div className="drink-grid">
        {DRINKS.map((d) => (
          <div key={d.key} className="drink-card paper">
            <CupDiagram drink={d} id={'g-' + d.key} />
            <div>
              <h4>{d.name}</h4>
              <div className="ratio">{d.ratio}</div>
              <p>{d.what}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                Usually <BeanRow value={d.bitter} size={15} />
              </div>
            </div>
            <div className="tip">{d.tip}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
