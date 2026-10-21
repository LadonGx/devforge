import { useEffect, useState } from 'react'

interface Props {
  title: string
  caption?: string
  tasks: { label: string; ms: number }[]
}

/** Linha do tempo: as mesmas operações feitas em sequência (await uma por uma) × em paralelo (Promise.all). */
export function Timeline({ title, caption, tasks }: Props) {
  const seqTotal = tasks.reduce((s, t) => s + t.ms, 0)
  const parTotal = Math.max(...tasks.map((t) => t.ms))
  const [t, setT] = useState(seqTotal)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!playing) return
    if (t >= seqTotal) {
      setPlaying(false)
      return
    }
    const id = setTimeout(() => setT((x) => Math.min(seqTotal, x + seqTotal / 60)), 40)
    return () => clearTimeout(id)
  }, [playing, t, seqTotal])

  const pct = (ms: number) => (ms / seqTotal) * 100
  let acc = 0
  const seqBars = tasks.map((task) => {
    const start = acc
    acc += task.ms
    return { ...task, start }
  })

  const bar = (start: number, ms: number, label: string, key: string) => {
    const done = Math.max(0, Math.min(ms, t - start))
    const state = t >= start + ms ? 'done' : t > start ? 'running' : 'waiting'
    return (
      <div key={key} className="tl-row">
        <span className="tl-label">{label}</span>
        <div className="tl-track">
          <div className={'tl-bar tl-' + state} style={{ left: pct(start) + '%', width: pct(ms) + '%' }}>
            <div className="tl-fill" style={{ width: (done / ms) * 100 + '%' }} />
            <span className="tl-ms">{ms}ms</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="tl">
      <div className="lab-head">
        <span className="badge badge-accent">Linha do tempo</span>
        <strong>{title}</strong>
      </div>
      {caption && <p className="muted small" style={{ margin: '0 0 10px' }}>{caption}</p>}
      <div className="row" style={{ marginBottom: 10 }}>
        <button
          className="btn btn-sm btn-primary"
          onClick={() => {
            setT(0)
            setPlaying(true)
          }}
        >
          ▶ Animar
        </button>
        <span className="muted small">t = {Math.round(t)}ms</span>
      </div>
      <div className="tl-group">
        <div className="tl-group-title">
          Em sequência <code>await a(); await b(); await c();</code> <span className="tl-total">{seqTotal}ms</span>
        </div>
        {seqBars.map((b, i) => bar(b.start, b.ms, b.label, 's' + i))}
      </div>
      <div className="tl-group">
        <div className="tl-group-title">
          Em paralelo <code>await Promise.all([a(), b(), c()])</code> <span className="tl-total tl-good">{parTotal}ms</span>
        </div>
        {tasks.map((task, i) => bar(0, task.ms, task.label, 'p' + i))}
      </div>
      <div className="tl-cursor-note muted small">
        Em paralelo o tempo total é o da operação <strong>mais lenta</strong>, não a soma. Só funciona quando as operações são
        independentes entre si.
      </div>
    </div>
  )
}
