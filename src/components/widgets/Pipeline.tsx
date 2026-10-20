import { useEffect, useMemo, useState } from 'react'
import type { PipelineStage } from '../../content/types'
import { formatV, serialize } from '../../engine/serialize'

/**
 * Pipeline de métodos de array (map → filter → reduce...), executado
 * elemento por elemento, na mesma ordem em que o JavaScript executa.
 */

const fmt = (x: unknown) => formatV(serialize(x))

interface Row {
  x: unknown
  i: number
  /** texto do que aconteceu, ex.: "3 → 6", "4 ✗" */
  text: string
  kept?: boolean
  stop?: boolean
}

interface StageRun {
  stage: PipelineStage
  input: unknown[]
  rows: Row[]
  output: unknown
  outputIsArray: boolean
}

function runStages(input: unknown[], stages: PipelineStage[]): StageRun[] {
  const runs: StageRun[] = []
  let cur: unknown = input
  for (const stage of stages) {
    const arr = Array.isArray(cur) ? cur : []
    const rows: Row[] = []
    let output: unknown
    switch (stage.op) {
      case 'map': {
        const out: unknown[] = []
        arr.forEach((x, i) => {
          const y = stage.fn(x, i)
          out.push(y)
          rows.push({ x, i, text: `${fmt(x)} → ${fmt(y)}` })
        })
        output = out
        break
      }
      case 'filter': {
        const out: unknown[] = []
        arr.forEach((x, i) => {
          const ok = !!stage.fn(x, i)
          if (ok) out.push(x)
          rows.push({ x, i, text: `${fmt(x)} ${ok ? '✓ fica' : '✗ sai'}`, kept: ok })
        })
        output = out
        break
      }
      case 'reduce': {
        let acc = stage.initial
        arr.forEach((x, i) => {
          const next = stage.fn(acc, x, i)
          rows.push({ x, i, text: `acc = ${fmt(acc)}, x = ${fmt(x)} → ${fmt(next)}` })
          acc = next
        })
        output = acc
        break
      }
      case 'find': {
        output = undefined
        for (let i = 0; i < arr.length; i++) {
          const ok = !!stage.fn(arr[i], i)
          rows.push({ x: arr[i], i, text: `${fmt(arr[i])} ${ok ? '✓ achou, para aqui' : '✗'}`, kept: ok, stop: ok })
          if (ok) {
            output = arr[i]
            break
          }
        }
        break
      }
      case 'some':
      case 'every': {
        output = stage.op === 'every'
        for (let i = 0; i < arr.length; i++) {
          const ok = !!stage.fn(arr[i], i)
          const stop = stage.op === 'some' ? ok : !ok
          rows.push({ x: arr[i], i, text: `${fmt(arr[i])} → ${ok}${stop ? ' (para aqui)' : ''}`, kept: ok, stop })
          if (stop) {
            output = stage.op === 'some'
            break
          }
        }
        break
      }
      case 'sort': {
        const out = [...arr].sort(stage.fn as (a: unknown, b: unknown) => number)
        rows.push({ x: arr, i: 0, text: `${fmt(arr)} → ${fmt(out)}` })
        output = out
        break
      }
    }
    runs.push({ stage, input: arr, rows, output, outputIsArray: Array.isArray(output) })
    cur = output
  }
  return runs
}

export function Pipeline({ title, caption, input, stages }: { title: string; caption?: string; input: unknown[]; stages: PipelineStage[] }) {
  const runs = useMemo(() => runStages(input, stages), [input, stages])
  const flat = useMemo(() => runs.flatMap((r, s) => r.rows.map((_, i) => ({ s, i }))), [runs])
  const total = flat.length
  const [pos, setPos] = useState(0) // pos = quantos passos já executados (0..total)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!playing) return
    if (pos >= total) {
      setPlaying(false)
      return
    }
    const t = setTimeout(() => setPos((p) => p + 1), 650)
    return () => clearTimeout(t)
  }, [playing, pos, total])

  const cur = pos > 0 ? flat[pos - 1] : null

  return (
    <div className="pipeline">
      <div className="lab-head">
        <span className="badge badge-accent">Pipeline</span>
        <strong>{title}</strong>
      </div>
      {caption && <p className="muted small" style={{ margin: '0 0 10px' }}>{caption}</p>}
      <div className="viz-controls pipe-controls">
        <button className="icon-btn" onClick={() => setPos(0)} disabled={pos === 0} title="Início">
          ⏮
        </button>
        <button className="icon-btn" onClick={() => setPos(Math.max(0, pos - 1))} disabled={pos === 0} title="Voltar">
          ◀
        </button>
        <button className="icon-btn play" onClick={() => (pos >= total ? (setPos(0), setPlaying(true)) : setPlaying(!playing))} title="Play/Pause">
          {playing ? '⏸' : '▶'}
        </button>
        <button className="icon-btn" onClick={() => setPos(Math.min(total, pos + 1))} disabled={pos >= total} title="Avançar">
          ▶▏
        </button>
        <button className="icon-btn" onClick={() => setPos(total)} disabled={pos >= total} title="Fim">
          ⏭
        </button>
        <span className="viz-count">
          {pos} / {total}
        </span>
      </div>
      <div className="pipe-row">
        <div className="pipe-stage pipe-input">
          <div className="pipe-title">entrada</div>
          <code className="pipe-array">{fmt(input)}</code>
        </div>
        {runs.map((r, s) => {
          const doneRows = flat.filter((f, k) => k < pos && f.s === s).length
          const finished = doneRows === r.rows.length && (r.rows.length > 0 || pos === total)
          const active = cur?.s === s
          return (
            <div key={s} className={'pipe-stage' + (active ? ' active' : '') + (finished && !active ? ' finished' : '')}>
              <div className="pipe-arrow">→</div>
              <div className="pipe-title">
                <code>
                  .{r.stage.op}({r.stage.code}
                  {r.stage.op === 'reduce' ? `, ${fmt(r.stage.initial)}` : ''})
                </code>
              </div>
              <div className="pipe-rows">
                {r.rows.slice(0, doneRows).map((row, i) => (
                  <div
                    key={i}
                    className={
                      'pipe-item' + (active && cur?.i === i ? ' current' : '') + (row.kept === false ? ' dropped' : '') + (row.stop ? ' stop' : '')
                    }
                  >
                    {row.text}
                  </div>
                ))}
                {doneRows === 0 && <div className="muted small">aguardando…</div>}
              </div>
              {finished && (
                <div className="pipe-out">
                  <span className="muted small">{r.outputIsArray ? 'resultado' : 'valor final'}</span>
                  <code className="pipe-array">{fmt(r.output)}</code>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
