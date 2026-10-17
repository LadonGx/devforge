import type { Problem } from '../../content/types'
import type { PerfResult } from '../../engine/types'

export function PerfPanel({ p, perf, busy }: { p: Problem; perf: PerfResult | null; busy: boolean }) {
  const lim = p.perf!.limitMs
  if (busy) return <div className="loading">Medindo com {p.perf!.label}…</div>
  if (!perf) {
    return (
      <div className="empty-panel">
        <p>
          Depois que todos os testes passarem, sua solução roda com uma entrada grande (<strong>{p.perf!.label}</strong>) e é comparada com a
          solução de referência. O limite é <strong>{lim} ms</strong>, parecido com o "Time Limit Exceeded" do LeetCode.
        </p>
        <p className="muted small">É aqui que uma solução O(n²) aparece, mesmo passando em todos os testes pequenos.</p>
      </div>
    )
  }
  if (perf.error) {
    return (
      <div className="err-box">
        {perf.error.name}: {perf.error.message}
      </div>
    )
  }
  const user = perf.timeout ? Infinity : perf.userMs ?? 0
  const ref = perf.refMs ?? 0
  const scale = Math.max(lim, Number.isFinite(user) ? user : 0, ref) * 1.05
  const tle = !Number.isFinite(user) || user > lim
  const ratio = ref > 0 && Number.isFinite(user) ? user / ref : 0
  return (
    <div className="perf">
      <p className="text-2 small" style={{ marginTop: 0 }}>
        Entrada: <strong>{p.perf!.label}</strong>. Tempos variam um pouco a cada execução; o que importa é a ordem de grandeza.
      </p>
      <div className="perf-bars">
        <PerfBar label="Sua solução" ms={user} scale={scale} tone={tle ? 'bad' : 'user'} />
        <PerfBar label="Referência" ms={ref} scale={scale} tone="ref" />
        <div className="perf-limit" style={{ left: `calc(110px + (100% - 110px) * ${lim / scale})` }}>
          <span>limite {lim} ms</span>
        </div>
      </div>
      {tle ? (
        <div className="callout callout-warn">
          <div className="callout-title">Lento demais</div>
          Sua solução {perf.timeout ? 'não terminou' : `levou ${user.toFixed(0)} ms`}. Procure loops aninhados (ou métodos como <code>indexOf</code>,{' '}
          <code>includes</code>, <code>splice</code>, <code>shift</code> dentro de loops: eles também percorrem o array). A complexidade esperada é{' '}
          <strong>{p.explanation.time}</strong>.
        </div>
      ) : ratio > 8 && user > 30 ? (
        <div className="callout callout-info">
          <div className="callout-title">Passou, mas ~{ratio.toFixed(0)}x mais lento que a referência</div>
          Pode ser uma complexidade pior escondida (algo O(n) dentro de um loop). Esperado: <strong>{p.explanation.time}</strong>.
        </div>
      ) : (
        <div className="callout callout-tip">
          <div className="callout-title">Desempenho ok</div>
          Na mesma ordem de grandeza da referência ({p.explanation.time}).
        </div>
      )}
    </div>
  )
}

function PerfBar({ label, ms, scale, tone }: { label: string; ms: number; scale: number; tone: 'user' | 'ref' | 'bad' }) {
  const pct = Number.isFinite(ms) ? Math.max(1, (ms / scale) * 100) : 100
  return (
    <div className="perf-row">
      <span className="perf-label">{label}</span>
      <div className="perf-track">
        <span className={'perf-fill perf-' + tone} style={{ width: pct + '%' }} />
        <span className="perf-ms">{Number.isFinite(ms) ? `${ms.toFixed(1)} ms` : 'não terminou'}</span>
      </div>
    </div>
  )
}
