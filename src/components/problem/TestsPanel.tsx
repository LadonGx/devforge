import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Problem } from '../../content/types'
import type { PerfResult, TestResult, V } from '../../engine/types'
import type { TestRun } from '../../engine/runner'
import { serialize, formatV } from '../../engine/serialize'
import { ValueView, sameV } from '../viz/views'

interface Props {
  p: Problem
  run: TestRun | null
  perf: PerfResult | null
  busy: null | 'tests' | 'trace' | 'perf'
  onVisualize: (caseIdx: number) => void
  onPerf: () => void
  nextProblem?: Problem
  nextPath?: string
}

const typeName = (v: V) =>
  ({ n: 'number', s: 'string', b: 'boolean', null: 'null', u: 'undefined', arr: 'array', map: 'Map', set: 'Set', obj: 'object' } as Record<string, string>)[v.t] ?? v.t

/** Explica em português por que o resultado não bate. */
function diagnose(expected: V, got: V | undefined, ordered: boolean): string | null {
  if (!got) return null
  if (got.t === 'u') return 'Sua função retornou `undefined`. Esqueceu o `return`? (ou retornou dentro de um callback como forEach?)'
  if (typeName(expected) !== typeName(got)) return `Tipo diferente: era esperado **${typeName(expected)}** e veio **${typeName(got)}**.`
  if (expected.t === 'arr' && got.t === 'arr') {
    if (expected.len !== got.len) return `Tamanho diferente: esperado **${expected.len}** item(ns), recebido **${got.len}**.`
    if (ordered) {
      const i = expected.items.findIndex((x, k) => !sameV(x, got.items[k]))
      if (i >= 0) return `Primeira diferença no índice **${i}**: esperado \`${formatV(expected.items[i])}\`, recebido \`${formatV(got.items[i])}\`.`
    }
    return 'Os elementos não batem (a ordem não importa neste problema).'
  }
  if (expected.t === 'obj' && got.t === 'obj') {
    const gotMap = new Map(got.entries)
    const expMap = new Map(expected.entries)
    const diffs: string[] = []
    for (const [k, ev] of expected.entries) {
      const gv = gotMap.get(k)
      if (!gv) diffs.push(`falta a chave \`${k}\``)
      else if (!sameV(ev, gv)) diffs.push(`\`${k}\`: esperado \`${formatV(ev)}\`, recebido \`${formatV(gv)}\``)
    }
    for (const [k] of got.entries) if (!expMap.has(k)) diffs.push(`chave a mais: \`${k}\``)
    if (diffs.length) return 'Diferenças: ' + diffs.join('; ') + '.'
  }
  return `Esperado \`${formatV(expected)}\`, recebido \`${formatV(got)}\`.`
}

function badIndexes(expected: V, got: V | undefined, ordered: boolean): Set<number> | undefined {
  if (!ordered || !got || expected.t !== 'arr' || got.t !== 'arr') return undefined
  const bad = new Set<number>()
  got.items.forEach((x, i) => {
    if (!sameV(x, expected.items[i])) bad.add(i)
  })
  return bad
}

function inlineMd(text: string) {
  // mini markdown: **negrito** e `code`
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return parts.map((pt, i) =>
    pt.startsWith('**') ? <strong key={i}>{pt.slice(2, -2)}</strong> : pt.startsWith('`') ? <code key={i}>{pt.slice(1, -1)}</code> : pt,
  )
}

export function TestsPanel({ p, run, perf, busy, onVisualize, onPerf, nextProblem, nextPath }: Props) {
  const [open, setOpen] = useState<number | null>(null)
  const ordered = (p.compare ?? 'exact') === 'exact' || p.compare === 'float'

  useEffect(() => {
    if (!run) return
    const firstFail = run.results.findIndex((r) => !r.pass)
    setOpen(firstFail >= 0 ? firstFail : null)
  }, [run])

  if (busy === 'tests') return <div className="loading">Rodando {p.tests.length} testes…</div>

  if (!run) {
    return (
      <div className="tests">
        <p className="muted small" style={{ marginTop: 0 }}>
          {p.tests.length} casos de teste. Escreva sua solução e clique em <strong>Rodar testes</strong> (ou Ctrl+Enter).
        </p>
        <div className="case-list">
          {p.tests.map((t, i) => (
            <div key={i} className="case-row case-pending">
              <span className="case-icon">○</span>
              <span className="case-label">{t.label ?? `Caso ${i + 1}`}</span>
              <code className="case-preview">
                {p.io?.design
                  ? (t.input[0] as string[]).join(', ')
                  : p.params.map((n, k) => `${n} = ${formatV(serialize(t.input[k]))}`).join(', ')}
              </code>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (run.timeout) {
    return (
      <div className="verdict verdict-bad">
        <div className="verdict-title">Tempo esgotado</div>
        <p>
          Os testes não terminaram em 5 segundos. As causas mais comuns são um <strong>loop infinito</strong> (um ponteiro que nunca anda, um{' '}
          <code>while</code> cuja condição nunca fica falsa) ou uma solução <strong>lenta demais</strong>, como recursão exponencial sem memo.
        </p>
        <p className="small">Use 🔍 Visualizar: o visualizador para sozinho depois de muitos passos e você vê onde travou.</p>
      </div>
    )
  }

  if (run.fatal) {
    const isSyntax = run.fatal.name === 'SyntaxError'
    return (
      <div className="verdict verdict-bad">
        <div className="verdict-title">{isSyntax ? 'Erro de sintaxe' : 'Erro ao carregar o código'}</div>
        <div className="err-box">
          {run.fatal.name}: {run.fatal.message}
          {run.fatal.line && ` (linha ${run.fatal.line})`}
        </div>
        {run.fatal.line && <p className="muted small">A linha com erro está marcada em vermelho no editor.</p>}
      </div>
    )
  }

  const pass = run.results.filter((r) => r.pass).length
  const all = pass === run.results.length
  const hasError = run.results.some((r) => r.error)
  const perfTLE = perf && p.perf && (perf.timeout || (perf.userMs ?? 0) > p.perf.limitMs)
  const slow = perf && p.perf && !perfTLE && perf.userMs !== undefined && perf.refMs !== undefined && perf.userMs > Math.max(perf.refMs * 8, 30)

  return (
    <div className="tests">
      {all ? (
        perfTLE ? (
          <div className="verdict verdict-warn">
            <div className="verdict-title">Time Limit Exceeded</div>
            <p>
              Todos os testes passaram, mas com uma entrada grande ({p.perf!.label}) sua solução passou do limite. Provavelmente ela é O(n²) ou pior.
            </p>
            <button className="btn btn-sm" onClick={onPerf}>
              Ver detalhes de desempenho
            </button>
          </div>
        ) : busy === 'perf' ? (
          <div className="verdict verdict-ok">
            <div className="verdict-title">Todos os testes passaram ✓</div>
            <p className="small">Medindo desempenho com uma entrada grande…</p>
          </div>
        ) : (
          <div className="verdict verdict-ok">
            <div className="verdict-title">Aceito ✓</div>
            <p className="small" style={{ margin: 0 }}>
              {pass}/{run.results.length} testes passaram
              {perf?.userMs !== undefined && ` · ${p.perf!.label}: ${perf.userMs.toFixed(1)} ms`}
              {slow && ' · passou, mas bem mais lento que a referência: confira a aba Desempenho.'}
            </p>
            <div className="row" style={{ marginTop: 10, flexWrap: 'wrap' }}>
              <span className="small text-2">Próximo passo: revise a solução explicada e compare com a sua.</span>
              <span className="spacer" />
              {nextProblem && nextPath && (
                <Link to={nextPath} className="btn btn-sm btn-ok">
                  Próximo: {nextProblem.title} →
                </Link>
              )}
            </div>
          </div>
        )
      ) : (
        <div className="verdict verdict-bad">
          <div className="verdict-title">{hasError ? 'Erro em tempo de execução' : 'Resposta errada'}</div>
          <p className="small" style={{ margin: 0 }}>
            {pass} de {run.results.length} testes passaram. Abra o caso em vermelho para ver o que veio diferente, e visualize ele passo a passo.
          </p>
        </div>
      )}

      <div className="case-list">
        {run.results.map((r, i) => (
          <CaseRow
            key={i}
            idx={i}
            p={p}
            r={r}
            open={open === i}
            toggle={() => setOpen(open === i ? null : i)}
            ordered={ordered}
            onVisualize={() => onVisualize(i)}
          />
        ))}
      </div>
    </div>
  )
}

function CaseRow({
  idx,
  p,
  r,
  open,
  toggle,
  ordered,
  onVisualize,
}: {
  idx: number
  p: Problem
  r: TestResult
  open: boolean
  toggle: () => void
  ordered: boolean
  onVisualize: () => void
}) {
  const t = p.tests[idx]
  const expected = serialize(t.expected)
  const design = !!p.io?.design
  const msg = !r.pass && !r.error && !design ? diagnose(expected, r.got, ordered) : null
  const retAs = p.io?.ret
  return (
    <div className={'case' + (r.pass ? ' case-pass' : ' case-fail') + (open ? ' open' : '')}>
      <button className="case-row" onClick={toggle}>
        <span className="case-icon">{r.pass ? '✓' : '✗'}</span>
        <span className="case-label">{t.label ?? `Caso ${idx + 1}`}</span>
        <span className="spacer" />
        <span className="muted small">{r.ms.toFixed(1)} ms</span>
        <span className="case-caret">{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div className="case-detail">
          {design ? (
            <DesignTable ops={t.input[0] as string[]} args={t.input[1] as unknown[][]} expected={t.expected as unknown[]} got={r.got} error={!!r.error} />
          ) : (
          <div className="io-section">
            <div className="io-title">Entrada</div>
            <div className="io-values">
              {p.params.map((name, k) => (
                <ValueView key={name} name={name} v={serialize(t.input[k])} as={p.io?.args?.[k]} />
              ))}
            </div>
          </div>
          )}
          {(!design || r.error) && (
          <div className="io-grid">
            <div className="io-section">
              <div className="io-title">Esperado</div>
              <ValueView v={expected} as={retAs} />
            </div>
            <div className="io-section">
              <div className="io-title">{r.error ? 'Erro' : 'Recebido'}</div>
              {r.error ? (
                <div className="err-box">
                  {r.error.name}: {r.error.message}
                  {r.error.line && ` (linha ${r.error.line})`}
                </div>
              ) : r.got ? (
                <ValueView v={r.got} as={retAs} bad={r.pass ? undefined : badIndexes(expected, r.got, ordered)} />
              ) : null}
            </div>
          </div>
          )}
          {msg && <div className="diagnosis">🧭 {inlineMd(msg)}</div>}
          {r.logs.length > 0 && (
            <div className="io-section">
              <div className="io-title">console.log</div>
              <pre className="logs">{r.logs.join('\n')}</pre>
            </div>
          )}
          <button className="btn btn-sm btn-primary" onClick={onVisualize}>
            🔍 Visualizar este caso passo a passo
          </button>
        </div>
      )}
    </div>
  )
}

/** Problemas de design: uma linha por operação, com esperado × recebido. */
function DesignTable({ ops, args, expected, got, error }: { ops: string[]; args: unknown[][]; expected: unknown[]; got?: V; error: boolean }) {
  const gotItems = got?.t === 'arr' ? got.items : []
  return (
    <div className="io-section" style={{ width: '100%' }}>
      <div className="io-title">Operações</div>
      <table className="design-table">
        <thead>
          <tr>
            <th>#</th>
            <th>chamada</th>
            <th>esperado</th>
            <th>recebido</th>
          </tr>
        </thead>
        <tbody>
          {ops.map((op, i) => {
            const exp = serialize(expected[i])
            const g = gotItems[i]
            const bad = !error && got && !sameV(exp, g)
            return (
              <tr key={i} className={bad ? 'bad' : ''}>
                <td className="muted">{i}</td>
                <td>
                  <code>
                    {i === 0 ? 'new ' : '.'}
                    {op}({(args[i] ?? []).map((a) => formatV(serialize(a))).join(', ')})
                  </code>
                </td>
                <td>
                  <code>{formatV(exp)}</code>
                </td>
                <td>
                  <code>{g ? formatV(g) : error ? '—' : ''}</code>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
