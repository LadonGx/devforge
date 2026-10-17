import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Lang, TraceResult } from '../../engine/types'
import { formatV } from '../../engine/serialize'
import { CodeEditor } from '../CodeEditor'
import { FrameView } from './FrameView'
import { ValueView } from './views'
import { CallTreeView } from './structures'

interface Props {
  trace: TraceResult
  /** Mostra o código ao lado (read-only) com a linha atual destacada. */
  code?: string
  lang?: Lang
  onLine?: (line: number | null) => void
  title?: string
}

const SPEEDS = [
  { label: '0.5x', ms: 1200 },
  { label: '1x', ms: 700 },
  { label: '2x', ms: 350 },
  { label: '4x', ms: 150 },
]

export function Visualizer({ trace, code, lang = 'js', onLine, title }: Props) {
  const { steps } = trace
  const total = steps.length
  // posição `total` = estado final (resultado)
  const [pos, setPos] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [showCalls, setShowCalls] = useState(true)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setPos(0)
    setPlaying(false)
  }, [trace])

  const step = pos < total ? steps[pos] : undefined
  const prevStep = pos > 0 ? steps[Math.min(pos, total) - 1] : undefined

  useEffect(() => {
    onLine?.(step ? step.line : null)
  }, [step, onLine])

  useEffect(() => () => onLine?.(null), [onLine])

  useEffect(() => {
    if (!playing) return
    if (pos >= total) {
      setPlaying(false)
      return
    }
    const t = setTimeout(() => setPos((p) => Math.min(total, p + 1)), SPEEDS[speed].ms)
    return () => clearTimeout(t)
  }, [playing, pos, total, speed])

  const go = useCallback((p: number) => setPos(Math.max(0, Math.min(total, p))), [total])

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      go(pos + 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      go(pos - 1)
    } else if (e.key === ' ') {
      e.preventDefault()
      setPlaying((p) => !p)
    }
  }

  const frames = useMemo(() => (step ? [...step.stack].reverse() : []), [step])
  const prevFrames = useMemo(() => new Map((prevStep?.stack || []).map((f) => [f.id, f])), [prevStep])
  const logs = trace.logs.slice(0, step ? step.logs : trace.logs.length)
  const context = useMemo(() => (step ? step.stack.flatMap((f) => f.vars.map(([, v]) => v)) : []), [step])
  const calls = trace.calls ?? []
  // árvore de chamadas só ajuda quando há recursão ou várias chamadas de funções auxiliares
  const hasCallTree = calls.length > 1 && calls.some((c) => c.parent !== null)
  // estruturas desenhadas em frames anteriores (o atual vem primeiro) para não repetir
  const shownBefore = useMemo(() => {
    const acc = new Set<number>()
    return frames.map((f) => {
      const snapshot = new Set(acc)
      for (const [, v] of f.vars) if ('id' in v && (v.t === 'arr' || v.t === 'map' || v.t === 'set' || v.t === 'obj')) acc.add(v.id)
      return snapshot
    })
  }, [frames])
  const focusCell = useMemo((): [number, number] | null => {
    const top = frames[0]
    if (!top) return null
    const m = new Map(top.vars)
    const r = m.get('row') ?? m.get('r')
    const c = m.get('col') ?? m.get('c')
    return r?.t === 'n' && c?.t === 'n' ? [r.v, c.v] : null
  }, [frames])
  const activeIds = useMemo(() => new Set(step ? step.stack.map((f) => f.id) : []), [step])

  const description = (() => {
    if (!step) return null
    const fn = step.stack[step.stack.length - 1]?.name
    if (step.kind === 'return') return `Linha ${step.line} · ${fn}() retorna ${step.ret ? formatV(step.ret) : ''}`
    return `Linha ${step.line} · prestes a executar (em ${fn}())`
  })()

  const view = (
    <div className="viz" tabIndex={0} onKeyDown={onKey} ref={rootRef}>
      <div className="viz-controls">
        <button className="icon-btn" title="Início" onClick={() => go(0)} disabled={pos === 0}>
          ⏮
        </button>
        <button className="icon-btn" title="Voltar (←)" onClick={() => go(pos - 1)} disabled={pos === 0}>
          ◀
        </button>
        <button className="icon-btn play" title="Play/Pause (espaço)" onClick={() => (pos >= total ? (go(0), setPlaying(true)) : setPlaying(!playing))}>
          {playing ? '⏸' : '▶'}
        </button>
        <button className="icon-btn" title="Avançar (→)" onClick={() => go(pos + 1)} disabled={pos >= total}>
          ▶▏
        </button>
        <button className="icon-btn" title="Fim" onClick={() => go(total)} disabled={pos >= total}>
          ⏭
        </button>
        <input
          className="viz-slider"
          type="range"
          min={0}
          max={total}
          value={pos}
          onChange={(e) => {
            setPlaying(false)
            go(Number(e.target.value))
          }}
          aria-label="Passo"
        />
        <span className="viz-count">
          {pos >= total ? 'Fim' : `Passo ${pos + 1}`} / {total}
        </span>
        <select className="viz-speed" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} aria-label="Velocidade">
          {SPEEDS.map((s, i) => (
            <option key={s.label} value={i}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {title && <div className="viz-title">{title}</div>}

      {step ? (
        <div className={'viz-desc' + (step.kind === 'return' ? ' is-return' : '')}>{description}</div>
      ) : (
        <div className="viz-desc is-end">Fim da execução</div>
      )}

      <div className="viz-body">
        {hasCallTree && (
          <div className="calltree">
            <button className="calltree-toggle" onClick={() => setShowCalls(!showCalls)}>
              {showCalls ? '▾' : '▸'} Árvore de chamadas <span className="muted">({callCountLabel(calls.filter((c) => c.start <= pos).length)})</span>
            </button>
            {showCalls && (
              <>
                <CallTreeView calls={calls} pos={pos} activeIds={activeIds} currentId={step?.stack[step.stack.length - 1]?.id} />
                <div className="calltree-legend muted small">
                  <span className="lg lg-current" /> executando agora <span className="lg lg-active" /> esperando retorno <span className="lg lg-done" /> já
                  retornou
                </div>
              </>
            )}
          </div>
        )}
        {step &&
          frames.map((f, i) => (
            <FrameView
              key={f.id}
              frame={f}
              prev={prevFrames.get(f.id)}
              current={i === 0}
              context={context}
              shownIds={shownBefore[i]}
              focusCell={focusCell}
            />
          ))}

        {!step && (
          <div className="viz-final">
            {trace.error ? (
              <div className="err-box">
                <strong>{trace.error.name}:</strong> {trace.error.message}
                {trace.error.line && <span className="muted"> (linha {trace.error.line})</span>}
              </div>
            ) : trace.truncated ? (
              <div className="callout callout-warn">
                <div className="callout-title">Visualização interrompida</div>
                Passou de {total} passos. Use uma entrada menor para visualizar — ou verifique se não há um loop infinito.
              </div>
            ) : trace.returnValue ? (
              <>
                <div className="viz-label">Valor retornado</div>
                <ValueView v={trace.returnValue} />
              </>
            ) : null}
            {total === 0 && !trace.error && (
              <p className="muted">Nenhum passo registrado. A função principal executou alguma linha?</p>
            )}
          </div>
        )}
      </div>

      {logs.length > 0 && (
        <div className="viz-console">
          <div className="viz-label">console</div>
          <pre>{logs.join('\n')}</pre>
        </div>
      )}
    </div>
  )

  if (!code) return view
  return (
    <div className="viz-with-code">
      <div className="viz-code">
        <CodeEditor value={code} lang={lang} readOnly stepLine={step ? step.line : null} errorLine={!step ? trace.error?.line ?? null : null} />
      </div>
      {view}
    </div>
  )
}

function callCountLabel(n: number) {
  return n === 1 ? '1 chamada até aqui' : `${n} chamadas até aqui`
}
