import { useEffect, useMemo, useState } from 'react'
import { CodeEditor } from '../CodeEditor'
import { simulate, type ElStmt } from './eventLoopSim'

const PHASE_LABEL = {
  script: 'executando o script',
  micro: 'rodando microtask',
  macro: 'rodando macrotask',
  loop: 'event loop',
  end: 'fim',
} as const

interface Props {
  title: string
  caption?: string
  code: string
  program: ElStmt[]
}

export function EventLoop({ title, caption, code, program }: Props) {
  const frames = useMemo(() => {
    try {
      return simulate(program)
    } catch (e) {
      return [{ line: null, stack: [], webApis: [], micro: [], macro: [], console: [], time: 0, note: 'Erro no cenário: ' + (e as Error).message, phase: 'end' as const }]
    }
  }, [program])
  const [pos, setPos] = useState(0)
  const [playing, setPlaying] = useState(false)
  const total = frames.length
  const f = frames[pos]

  useEffect(() => {
    if (!playing) return
    if (pos >= total - 1) {
      setPlaying(false)
      return
    }
    const t = setTimeout(() => setPos((p) => p + 1), 1100)
    return () => clearTimeout(t)
  }, [playing, pos, total])

  const go = (p: number) => setPos(Math.max(0, Math.min(total - 1, p)))

  return (
    <div className="el">
      <div className="lab-head">
        <span className="badge badge-accent">Event loop</span>
        <strong>{title}</strong>
      </div>
      {caption && <p className="muted small" style={{ margin: '0 0 10px' }}>{caption}</p>}
      <div
        className="viz-controls el-controls"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') go(pos + 1)
          if (e.key === 'ArrowLeft') go(pos - 1)
        }}
      >
        <button className="icon-btn" onClick={() => go(0)} disabled={pos === 0} title="Início">
          ⏮
        </button>
        <button className="icon-btn" onClick={() => go(pos - 1)} disabled={pos === 0} title="Voltar">
          ◀
        </button>
        <button className="icon-btn play" onClick={() => (pos >= total - 1 ? (go(0), setPlaying(true)) : setPlaying(!playing))} title="Play/Pause">
          {playing ? '⏸' : '▶'}
        </button>
        <button className="icon-btn" onClick={() => go(pos + 1)} disabled={pos >= total - 1} title="Avançar">
          ▶▏
        </button>
        <button className="icon-btn" onClick={() => go(total - 1)} disabled={pos >= total - 1} title="Fim">
          ⏭
        </button>
        <input className="viz-slider" type="range" min={0} max={total - 1} value={pos} onChange={(e) => go(Number(e.target.value))} aria-label="Passo" />
        <span className="viz-count">
          {pos + 1} / {total}
        </span>
        <span className="el-time">t = {f.time}ms</span>
      </div>
      <div className={'el-note el-phase-' + f.phase}>
        <span className="el-phase">{PHASE_LABEL[f.phase]}</span>
        {f.note}
      </div>
      <div className="el-grid">
        <div className="el-code">
          <CodeEditor value={code} lang="js" readOnly stepLine={f.line} />
        </div>
        <div className="el-panels">
          <div className="el-box el-stack">
            <div className="el-title">Call stack</div>
            <div className="el-stack-items">
              {f.stack.length === 0 && <div className="el-empty">vazia</div>}
              {[...f.stack].reverse().map((s, i) => (
                <div key={i} className={'el-item' + (i === 0 ? ' top' : '')}>
                  {s}
                </div>
              ))}
            </div>
          </div>
          <div className="el-box el-web">
            <div className="el-title">Web APIs (timers, rede)</div>
            {f.webApis.length === 0 && <div className="el-empty">nada pendente</div>}
            {f.webApis.map((w, i) => (
              <div key={i} className="el-item el-pending">
                <span>⏱ {w.label}</span>
                <span className="muted small">termina em t={w.until}ms</span>
              </div>
            ))}
          </div>
          <div className="el-box el-micro">
            <div className="el-title">
              Fila de microtasks <span className="muted">(Promises, await, queueMicrotask) · prioridade</span>
            </div>
            <div className="el-queue">
              {f.micro.length === 0 && <div className="el-empty">vazia</div>}
              {f.micro.map((m, i) => (
                <div key={i} className="el-item el-chip">
                  {m}
                </div>
              ))}
            </div>
          </div>
          <div className="el-box el-macro">
            <div className="el-title">
              Fila de macrotasks <span className="muted">(setTimeout, eventos, I/O)</span>
            </div>
            <div className="el-queue">
              {f.macro.length === 0 && <div className="el-empty">vazia</div>}
              {f.macro.map((m, i) => (
                <div key={i} className="el-item el-chip">
                  {m}
                </div>
              ))}
            </div>
          </div>
          <div className="el-box el-console">
            <div className="el-title">Console</div>
            <pre>{f.console.length ? f.console.join('\n') : ' '}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}
