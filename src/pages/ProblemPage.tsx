import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Course, Problem } from '../content/types'
import { problemPath, unitPath } from '../content/courses'
import type { Lang, PerfResult, TraceResult } from '../engine/types'
import { runPerf, runTests, runTrace, type TestRun } from '../engine/runner'
import { progress, useProgress } from '../lib/progress'
import { CodeEditor } from '../components/CodeEditor'
import { Markdown, CodeBlock } from '../components/Markdown'
import { DifficultyBadge } from '../components/DifficultyBadge'
import { Visualizer } from '../components/viz/Visualizer'
import { TestsPanel } from '../components/problem/TestsPanel'
import { PerfPanel } from '../components/problem/PerfPanel'

type LeftTab = 'desc' | 'hints' | 'solution'
type BottomTab = 'tests' | 'viz' | 'perf'

export function ProblemPage({ course }: { course: Course }) {
  const { id = '' } = useParams()
  const p = course.problems.find((x) => x.id === id)
  if (!p) {
    return (
      <div className="empty-state">
        <h2>Exercício não encontrado</h2>
        <Link to={course.basePath}>Voltar</Link>
      </div>
    )
  }
  return <ProblemWorkspace key={p.id} p={p} course={course} />
}

function ProblemWorkspace({ p, course }: { p: Problem; course: Course }) {
  const s = useProgress()
  const lang = s.lang
  const initial = progress.get().code[`${p.id}:${lang}`] ?? p.starter[lang]
  const [code, setCode] = useState(initial)
  const [leftTab, setLeftTab] = useState<LeftTab>('desc')
  const [bottomTab, setBottomTab] = useState<BottomTab>('tests')
  const [hintsShown, setHintsShown] = useState(0)
  const [showSolution, setShowSolution] = useState(false)
  const [solLang, setSolLang] = useState<Lang>(lang)
  const [busy, setBusy] = useState<null | 'tests' | 'trace' | 'perf'>(null)
  const [testRun, setTestRun] = useState<TestRun | null>(null)
  const [perf, setPerf] = useState<PerfResult | null>(null)
  const [trace, setTrace] = useState<{ result: TraceResult; source: 'user' | 'ref'; caseIdx: number } | null>(null)
  const [vizCase, setVizCase] = useState(0)
  const [stepLine, setStepLine] = useState<number | null>(null)
  const [editorPct, setEditorPct] = useState(48)
  const rightRef = useRef<HTMLDivElement>(null)

  // troca de linguagem: carrega o código salvo daquela linguagem
  useEffect(() => {
    setCode(progress.get().code[`${p.id}:${lang}`] ?? p.starter[lang])
    setTestRun(null)
    setTrace(null)
    setPerf(null)
  }, [lang, p])

  // salva com debounce
  useEffect(() => {
    const t = setTimeout(() => {
      if (code !== p.starter[lang]) progress.saveCode(p.id, lang, code)
    }, 500)
    return () => clearTimeout(t)
  }, [code, lang, p])

  const pattern = course.units.find((u) => u.id === p.pattern)
  const idx = course.problems.indexOf(p)
  const nextProblem = course.problems[idx + 1]
  const solved = !!s.solved[p.id]

  const onRunTests = useCallback(async () => {
    if (busy) return
    setBusy('tests')
    setBottomTab('tests')
    setPerf(null)
    progress.markAttempted(p.id)
    const run = await runTests(code, lang, p.fnName, p.tests, p.compare ?? 'exact', p.io)
    setTestRun(run)
    const allPass = !run.fatal && !run.timeout && run.results.length > 0 && run.results.every((r) => r.pass)
    if (allPass && p.perf) {
      setBusy('perf')
      const pr = await runPerf(code, lang, p.solution.js, p.fnName, p.perf.gen.toString(), p.perf.n, p.perf.limitMs * 2 + 1000, p.io)
      setPerf(pr)
      const ok = !pr.timeout && !pr.error && (pr.userMs ?? Infinity) <= p.perf.limitMs
      if (ok) progress.markSolved(p.id)
    } else if (allPass) {
      progress.markSolved(p.id)
    }
    setBusy(null)
  }, [busy, code, lang, p])

  const onTrace = useCallback(
    async (source: 'user' | 'ref', caseIdx: number) => {
      if (busy) return
      setBusy('trace')
      setBottomTab('viz')
      setEditorPct((pct) => Math.min(pct, 32))
      setVizCase(caseIdx)
      const input = p.tests[caseIdx].input
      const result =
        source === 'user' ? await runTrace(code, lang, p.fnName, input, p.io) : await runTrace(p.solution.js, 'js', p.fnName, input, p.io)
      setTrace({ result, source, caseIdx })
      setBusy(null)
    },
    [busy, code, lang, p],
  )

  const [resetArmed, setResetArmed] = useState(false)
  useEffect(() => {
    if (!resetArmed) return
    const t = setTimeout(() => setResetArmed(false), 3000)
    return () => clearTimeout(t)
  }, [resetArmed])
  const resetCode = () => {
    if (!resetArmed) {
      setResetArmed(true)
      return
    }
    setResetArmed(false)
    progress.clearCode(p.id, lang)
    setCode(p.starter[lang])
  }

  const errorLine = useMemo(() => {
    if (testRun?.fatal?.line) return testRun.fatal.line
    const firstErr = testRun?.results.find((r) => r.error?.line)
    return firstErr?.error?.line ?? null
  }, [testRun])

  // arrastar divisória editor / painel
  const onDrag = (e: React.MouseEvent) => {
    e.preventDefault()
    const rect = rightRef.current?.getBoundingClientRect()
    if (!rect) return
    const move = (ev: MouseEvent) => {
      const pct = ((ev.clientY - rect.top) / rect.height) * 100
      setEditorPct(Math.max(18, Math.min(80, pct)))
    }
    const up = () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
  }

  const passCount = testRun?.results.filter((r) => r.pass).length ?? 0
  const userTraceActive = bottomTab === 'viz' && trace?.source === 'user'

  return (
    <div className="problem-layout">
      {/* ------- Esquerda: enunciado ------- */}
      <aside className="problem-left">
        <div className="problem-head">
          <div className="breadcrumb" style={{ marginBottom: 6 }}>
            <Link to={course.basePath}>{course.title}</Link> /{' '}
            {pattern && <Link to={unitPath(course, pattern.id)}>{pattern.title}</Link>}
          </div>
          <h1 className="problem-title">
            {p.title} {solved && <span className="badge badge-ok">Resolvido ✓</span>}
          </h1>
          <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
            <DifficultyBadge d={p.difficulty} />
            {p.leetcode && (
              <a className="badge" href={`https://leetcode.com/problems/${p.leetcode.slug}/`} target="_blank" rel="noreferrer">
                LeetCode #{p.leetcode.number} ↗
              </a>
            )}
            {pattern && (
              <Link className="badge" to={unitPath(course, pattern.id)} style={{ color: pattern.color }}>
                📖 Aula: {pattern.title}
              </Link>
            )}
          </div>
        </div>
        <div className="tabs">
          <button className={'tab' + (leftTab === 'desc' ? ' active' : '')} onClick={() => setLeftTab('desc')}>
            Descrição
          </button>
          <button className={'tab' + (leftTab === 'hints' ? ' active' : '')} onClick={() => setLeftTab('hints')}>
            Dicas <span className="badge">{hintsShown}/{p.hints.length}</span>
          </button>
          <button className={'tab' + (leftTab === 'solution' ? ' active' : '')} onClick={() => setLeftTab('solution')}>
            Solução explicada
          </button>
        </div>
        <div className="problem-left-body">
          {leftTab === 'desc' && (
            <>
              <Markdown md={p.description} />
              {p.examples.map((ex, i) => (
                <div key={i} className="example">
                  <div className="example-title">Exemplo {i + 1}</div>
                  <div className="example-line">
                    <span className="muted">Entrada:</span> <code>{ex.input}</code>
                  </div>
                  <div className="example-line">
                    <span className="muted">Saída:</span> <code>{ex.output}</code>
                  </div>
                  {ex.explanation && <div className="example-line muted">{ex.explanation}</div>}
                </div>
              ))}
              {p.constraints.length > 0 && (
                <>
              <h4>Restrições</h4>
              <ul className="constraints">
                {p.constraints.map((c) => (
                  <li key={c}>
                    <code>{c}</code>
                  </li>
                ))}
              </ul>
                </>
              )}
            </>
          )}

          {leftTab === 'hints' && (
            <div className="hints">
              <p className="muted small">Abra uma dica por vez. Tente avançar um pouco entre uma e outra.</p>
              {p.hints.slice(0, hintsShown).map((h, i) => (
                <div key={i} className="hint card">
                  <div className="hint-num">Dica {i + 1}</div>
                  <Markdown md={h} />
                </div>
              ))}
              {hintsShown < p.hints.length ? (
                <button className="btn" onClick={() => setHintsShown(hintsShown + 1)}>
                  💡 Mostrar dica {hintsShown + 1}
                </button>
              ) : (
                <p className="muted small">Acabaram as dicas. Se travou, veja a solução explicada e depois reescreva sem olhar.</p>
              )}
            </div>
          )}

          {leftTab === 'solution' && (
            <div className="solution">
              {!showSolution ? (
                <div className="solution-gate card">
                  <strong>Antes de ver a solução…</strong>
                  <ul className="small text-2">
                    <li>Rodou os testes e olhou o diff do caso que falhou?</li>
                    <li>Visualizou o seu código passo a passo?</li>
                    <li>Leu as dicas?</li>
                  </ul>
                  <button className="btn" onClick={() => setShowSolution(true)}>
                    Mostrar solução explicada
                  </button>
                </div>
              ) : (
                <>
                  <h3>Intuição</h3>
                  <Markdown md={p.explanation.intuition} />
                  <h3>Passo a passo</h3>
                  <ol className="steps-list">
                    {p.explanation.steps.map((st, i) => (
                      <li key={i}>
                        <Markdown md={st} className="inline-md" />
                      </li>
                    ))}
                  </ol>
                  <div className="complexity">
                    <div>
                      <span className="muted small">Tempo</span>
                      <strong>{p.explanation.time}</strong>
                    </div>
                    <div>
                      <span className="muted small">Espaço</span>
                      <strong>{p.explanation.space}</strong>
                    </div>
                  </div>
                  <p className="text-2 small">{p.explanation.complexityWhy}</p>
                  {p.bruteForce && (
                    <div className="callout callout-info">
                      <div className="callout-title">Força bruta (para mencionar na entrevista)</div>
                      {p.bruteForce.idea} <span className="muted">— {p.bruteForce.complexity}</span>
                    </div>
                  )}
                  <div className="row" style={{ marginBottom: 8 }}>
                    <h3 style={{ margin: 0 }}>Código</h3>
                    <span className="spacer" />
                    <div className="seg">
                      <button className={solLang === 'js' ? 'active' : ''} onClick={() => setSolLang('js')}>
                        JS
                      </button>
                      <button className={solLang === 'ts' ? 'active' : ''} onClick={() => setSolLang('ts')}>
                        TS
                      </button>
                    </div>
                  </div>
                  <CodeBlock code={p.solution[solLang]} />
                  <button className="btn btn-primary" onClick={() => onTrace('ref', vizCase)} disabled={!!busy}>
                    ▶ Ver a solução rodando passo a passo
                  </button>
                  <h3 style={{ marginTop: 20 }}>Erros comuns</h3>
                  <ul className="pitfalls">
                    {p.explanation.pitfalls.map((pf, i) => (
                      <li key={i}>
                        <Markdown md={pf} className="inline-md" />
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* ------- Direita: editor + painel ------- */}
      <section className="problem-right" ref={rightRef}>
        <div className="editor-toolbar">
          <div className="seg" title="Linguagem">
            <button className={lang === 'js' ? 'active' : ''} onClick={() => progress.setLang('js')}>
              JavaScript
            </button>
            <button className={lang === 'ts' ? 'active' : ''} onClick={() => progress.setLang('ts')}>
              TypeScript
            </button>
          </div>
          <button className={'btn btn-sm ' + (resetArmed ? 'btn-danger' : 'btn-ghost')} onClick={resetCode} title="Voltar ao código inicial">
            {resetArmed ? 'Apagar meu código?' : '↺ Resetar'}
          </button>
          <span className="spacer" />
          <button className="btn btn-sm" onClick={() => onTrace('user', vizCase)} disabled={!!busy}>
            🔍 Visualizar
          </button>
          <button className="btn btn-primary btn-sm" onClick={onRunTests} disabled={!!busy} title="Ctrl+Enter">
            {busy === 'tests' ? 'Rodando…' : busy === 'perf' ? 'Medindo desempenho…' : '▶ Rodar testes'}
          </button>
        </div>
        <div className="editor-wrap" style={{ height: `${editorPct}%` }}>
          <CodeEditor value={code} onChange={setCode} lang={lang} onRun={onRunTests} stepLine={userTraceActive ? stepLine : null} errorLine={errorLine} />
        </div>
        <div className="drag-handle" onMouseDown={onDrag} title="Arraste para redimensionar" />
        <div className="bottom-panel">
          <div className="tabs">
            <button className={'tab' + (bottomTab === 'tests' ? ' active' : '')} onClick={() => setBottomTab('tests')}>
              Testes
              {testRun && !testRun.fatal && !testRun.timeout && (
                <span className={'badge ' + (passCount === testRun.results.length ? 'badge-ok' : 'badge-bad')}>
                  {passCount}/{testRun.results.length}
                </span>
              )}
            </button>
            <button className={'tab' + (bottomTab === 'viz' ? ' active' : '')} onClick={() => setBottomTab('viz')}>
              Visualização
            </button>
            {p.perf && (
              <button className={'tab' + (bottomTab === 'perf' ? ' active' : '')} onClick={() => setBottomTab('perf')}>
                Desempenho
              </button>
            )}
            <span className="spacer" />
            <button
              className="tab"
              onClick={() => setEditorPct(editorPct > 25 ? 15 : 48)}
              title={editorPct > 25 ? 'Expandir painel' : 'Restaurar editor'}
            >
              {editorPct > 25 ? '⤢ Expandir' : '⤡ Restaurar'}
            </button>
          </div>
          <div className="bottom-body">
            {bottomTab === 'tests' && (
              <TestsPanel
                p={p}
                run={testRun}
                perf={perf}
                busy={busy}
                onVisualize={(i) => onTrace('user', i)}
                onPerf={() => setBottomTab('perf')}
                nextProblem={nextProblem}
                nextPath={nextProblem ? problemPath(course, nextProblem.id) : undefined}
              />
            )}
            {bottomTab === 'viz' && (
              <div className="viz-tab">
                <div className="viz-picker">
                  <label className="muted small">Caso:</label>
                  <select value={vizCase} onChange={(e) => setVizCase(Number(e.target.value))} className="select">
                    {p.tests.map((t, i) => (
                      <option key={i} value={i}>
                        {i + 1}. {t.label ?? `Caso ${i + 1}`}
                      </option>
                    ))}
                  </select>
                  <button className="btn btn-sm btn-primary" onClick={() => onTrace('user', vizCase)} disabled={!!busy}>
                    Meu código
                  </button>
                  <button className="btn btn-sm" onClick={() => onTrace('ref', vizCase)} disabled={!!busy}>
                    Solução de referência
                  </button>
                </div>
                {busy === 'trace' && <div className="loading">Executando passo a passo…</div>}
                {!busy && !trace && (
                  <div className="empty-panel">
                    <p>
                      Escolha um caso e clique em <strong>Meu código</strong> para ver sua função rodando linha por linha: valores das variáveis,
                      ponteiros sobre o array, Map/Set e pilha.
                    </p>
                    <p className="muted small">Dica: use ← → para navegar entre os passos e espaço para play/pause.</p>
                  </div>
                )}
                {trace && busy !== 'trace' && (
                  <>
                    <div className="viz-source muted small">
                      {trace.source === 'user' ? 'Seu código' : 'Solução de referência (JS)'} · caso {trace.caseIdx + 1}: {p.tests[trace.caseIdx].label}
                      {trace.source === 'user' && ' · a linha atual fica destacada no editor acima'}
                    </div>
                    {trace.source === 'user' ? (
                      <Visualizer trace={trace.result} onLine={setStepLine} />
                    ) : (
                      <Visualizer trace={trace.result} code={p.solution.js} lang="js" />
                    )}
                  </>
                )}
              </div>
            )}
            {bottomTab === 'perf' && p.perf && <PerfPanel p={p} perf={perf} busy={busy === 'perf'} />}
          </div>
        </div>
      </section>
    </div>
  )
}
