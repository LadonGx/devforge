import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { Exam, ExamQuestion, Problem } from '../content/types'
import { EXAMS, examById, topicRef } from '../content/exams'
import { STAGES } from '../content/guide'
import type { Lang } from '../engine/types'
import { runTests } from '../engine/runner'
import { serialize, formatV } from '../engine/serialize'
import { CodeEditor } from '../components/CodeEditor'
import { CodeBlock, Markdown } from '../components/Markdown'
import { shuffledOrder } from '../components/widgets/Quiz'
import { progress, useProgress } from '../lib/progress'
import {
  drafts,
  examScore,
  gradeEssay,
  gradeSimple,
  isAnswered,
  outputLines,
  statusFromScore,
  useDraft,
  weightOf,
  type Answer,
  type ExamDraft,
  type Graded,
  type QStatus,
} from '../lib/exam'

const KIND_LABEL: Record<ExamQuestion['kind'], string> = {
  choice: 'Múltipla escolha',
  output: 'Prever a saída',
  code: 'Código',
  essay: 'Discursiva',
}

const STATUS_LABEL: Record<QStatus, string> = {
  right: 'Certa',
  partial: 'Parcial',
  wrong: 'Errada',
  blank: 'Em branco',
  pending: 'Autoavaliação pendente',
}

const fmtTime = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(s / 60)
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export function ExamPage() {
  const { id = '' } = useParams()
  const exam = examById(id)
  if (!exam) {
    return (
      <div className="empty-state">
        <h2>Prova não encontrada</h2>
        <Link to="/guia">Voltar ao guia</Link>
      </div>
    )
  }
  return <ExamFlow key={exam.id} exam={exam} />
}

function ExamFlow({ exam }: { exam: Exam }) {
  const draft = useDraft(exam.id)
  if (!draft) return <ExamIntro exam={exam} />
  if (!draft.submittedAt) return <ExamRunner exam={exam} draft={draft} />
  return <ExamReview exam={exam} draft={draft} />
}

/* ============================== Introdução ============================== */

function ExamIntro({ exam }: { exam: Exam }) {
  const s = useProgress()
  const rec = s.exams[exam.id]
  const stage = STAGES.find((st) => st.id === exam.stage)
  const counts = exam.questions.reduce<Record<string, number>>((acc, q) => ({ ...acc, [q.kind]: (acc[q.kind] ?? 0) + 1 }), {})
  return (
    <div className="exam-intro">
      <div className="breadcrumb">
        <Link to="/guia">Guia</Link> / {stage ? stage.title : 'Prova'}
      </div>
      <span className="badge badge-accent">Prova</span>
      <h1>{exam.title}</h1>
      <Markdown md={exam.summary} className="text-2" />
      <div className="exam-facts">
        <div>
          <strong>{exam.questions.length}</strong>
          <span>questões</span>
        </div>
        <div>
          <strong>~{exam.minutes} min</strong>
          <span>tempo sugerido</span>
        </div>
        <div>
          <strong>{exam.passPct}%</strong>
          <span>para aprovação</span>
        </div>
        {rec && (
          <div>
            <strong className={rec.passed ? 'text-ok' : 'text-bad'}>{rec.best}%</strong>
            <span>sua melhor nota</span>
          </div>
        )}
      </div>
      <div className="exam-kinds">
        {(Object.keys(KIND_LABEL) as ExamQuestion['kind'][])
          .filter((k) => counts[k])
          .map((k) => (
            <span key={k} className={'exam-kind exam-kind-' + k}>
              {counts[k]} × {KIND_LABEL[k]}
            </span>
          ))}
      </div>
      <div className="card exam-rules">
        <strong>Como funciona</strong>
        <ul>
          <li>Não há limite de tempo: o relógio só mostra quanto você levou. Tente ficar perto do tempo sugerido, como numa entrevista.</li>
          <li>Responda sem consultar as aulas. Suas respostas ficam salvas no navegador se você fechar a página.</li>
          <li>Nas questões de código você pode rodar os exemplos. Na entrega, a função passa por todos os testes (inclusive os escondidos) e a nota é proporcional aos que passarem.</li>
          <li>
            As discursivas são corrigidas por você: depois de entregar, você compara sua resposta com uma resposta modelo e marca os pontos que cobriu.
          </li>
          <li>Nota mínima de {exam.passPct}%. Ela não bloqueia o guia, mas a prova fica marcada como pendente até você passar.</li>
        </ul>
      </div>
      <button className="btn btn-primary btn-lg" onClick={() => drafts.start(exam.id)}>
        {rec ? 'Fazer de novo' : 'Começar a prova'}
      </button>
    </div>
  )
}

/* ============================== Durante a prova ============================== */

function ExamRunner({ exam, draft }: { exam: Exam; draft: ExamDraft }) {
  const [now, setNow] = useState(Date.now())
  const [confirming, setConfirming] = useState(false)
  const [grading, setGrading] = useState<string | null>(null)
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const q = exam.questions[draft.current] ?? exam.questions[0]
  const answered = exam.questions.filter((x) => isAnswered(x, draft.answers[x.id])).length
  const elapsed = now - draft.startedAt
  const over = elapsed > exam.minutes * 60_000

  const setAnswer = (a: Answer) => drafts.update(exam.id, (d) => ({ ...d, answers: { ...d.answers, [q.id]: a } }))
  const go = (i: number) => drafts.update(exam.id, (d) => ({ ...d, current: Math.max(0, Math.min(exam.questions.length - 1, i)) }))

  const submit = async () => {
    const graded: Record<string, Graded> = {}
    for (let i = 0; i < exam.questions.length; i++) {
      const x = exam.questions[i]
      const a = draft.answers[x.id]
      const simple = gradeSimple(x, a)
      if (simple) graded[x.id] = simple
      else if (x.kind === 'code') {
        if (!isAnswered(x, a) || typeof a !== 'object') {
          graded[x.id] = { score: 0, status: 'blank' }
          continue
        }
        setGrading(`Corrigindo a questão ${i + 1}…`)
        const p = x.problem
        const run = await runTests(a.code, a.lang, p.fnName, p.tests, p.compare ?? 'exact', p.io)
        const pass = run.fatal || run.timeout ? 0 : run.results.filter((r) => r.pass).length
        const score = run.results.length ? pass / p.tests.length : 0
        graded[x.id] = { score, status: statusFromScore(score), run }
      }
    }
    setGrading(null)
    drafts.update(exam.id, (d) => ({ ...d, graded, essays: {}, submittedAt: Date.now() }))
  }

  return (
    <div className="exam-run">
      <div className="exam-bar">
        <div className="exam-bar-title">
          <span className="badge badge-accent">Prova</span>
          <strong>{exam.title}</strong>
        </div>
        <span className={'exam-timer' + (over ? ' over' : '')} title={`Tempo sugerido: ${exam.minutes} min`}>
          ⏱ {fmtTime(elapsed)} <span className="muted">/ {exam.minutes}:00</span>
        </span>
        <span className="muted small">
          {answered}/{exam.questions.length} respondidas
        </span>
        <button className="btn btn-primary btn-sm" onClick={() => setConfirming(true)} disabled={!!grading}>
          Entregar prova
        </button>
      </div>

      {confirming && !grading && (
        <div className="exam-confirm card">
          <span>
            {answered < exam.questions.length
              ? `Você deixou ${exam.questions.length - answered} questão(ões) em branco. Entregar mesmo assim?`
              : 'Entregar a prova? Depois disso as respostas não podem mais ser alteradas.'}
          </span>
          <span className="spacer" />
          <button className="btn btn-sm" onClick={() => setConfirming(false)}>
            Continuar respondendo
          </button>
          <button className="btn btn-primary btn-sm" onClick={submit}>
            Entregar
          </button>
        </div>
      )}
      {grading && <div className="loading">{grading}</div>}

      <div className="exam-nav">
        {exam.questions.map((x, i) => (
          <button
            key={x.id}
            className={'exam-dot' + (i === draft.current ? ' current' : '') + (isAnswered(x, draft.answers[x.id]) ? ' answered' : '')}
            onClick={() => go(i)}
            title={KIND_LABEL[x.kind]}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="exam-q card" key={q.id}>
        <div className="exam-q-head">
          <span className="muted small">
            Questão {draft.current + 1} de {exam.questions.length}
          </span>
          <span className={'exam-kind exam-kind-' + q.kind}>{KIND_LABEL[q.kind]}</span>
          {weightOf(q) > 1 && <span className="muted small">vale {weightOf(q)} pontos</span>}
        </div>
        <QuestionInput q={q} answer={draft.answers[q.id]} onAnswer={setAnswer} />
      </div>

      <div className="exam-pager">
        <button className="btn" onClick={() => go(draft.current - 1)} disabled={draft.current === 0}>
          ← Anterior
        </button>
        <span className="spacer" />
        {draft.current < exam.questions.length - 1 ? (
          <button className="btn btn-primary" onClick={() => go(draft.current + 1)}>
            Próxima →
          </button>
        ) : (
          <button className="btn btn-primary" onClick={() => setConfirming(true)}>
            Revisar e entregar
          </button>
        )}
      </div>
    </div>
  )
}

function QuestionInput({ q, answer, onAnswer }: { q: ExamQuestion; answer: Answer | undefined; onAnswer: (a: Answer) => void }) {
  switch (q.kind) {
    case 'choice':
      return <ChoiceInput q={q} answer={answer} onAnswer={onAnswer} />
    case 'output':
      return (
        <>
          <Markdown md={q.prompt ?? 'O que este código imprime no console?'} />
          <CodeBlock code={q.code} />
          <label className="exam-label">Saída (uma linha para cada console.log, na ordem):</label>
          <textarea
            className="exam-textarea mono"
            rows={Math.max(3, q.expected.length + 1)}
            value={typeof answer === 'string' ? answer : ''}
            onChange={(e) => onAnswer(e.target.value)}
            placeholder={'ex.:\n1\nolá\ntrue'}
            spellCheck={false}
          />
          <p className="muted small">Escreva os valores como aparecem no console (aspas em volta de texto são opcionais).</p>
        </>
      )
    case 'code':
      return <CodeInput problem={q.problem} answer={answer} onAnswer={onAnswer} />
    case 'essay':
      return (
        <>
          <Markdown md={q.prompt} />
          <textarea
            className="exam-textarea"
            rows={9}
            value={typeof answer === 'string' ? answer : ''}
            onChange={(e) => onAnswer(e.target.value)}
            placeholder="Responda como se estivesse explicando para o entrevistador: definição, um exemplo e quando você usa."
          />
          <p className="muted small">Depois de entregar, você compara com uma resposta modelo e marca os pontos que cobriu.</p>
        </>
      )
  }
}

function ChoiceInput({ q, answer, onAnswer }: { q: Extract<ExamQuestion, { kind: 'choice' }>; answer: Answer | undefined; onAnswer: (a: Answer) => void }) {
  const order = useMemo(() => shuffledOrder(q.id + q.prompt, q.options), [q])
  return (
    <>
      <Markdown md={q.prompt} />
      {q.code && <CodeBlock code={q.code} />}
      <div className="exam-options">
        {order.map((i, k) => (
          <button key={i} className={'exam-opt' + (answer === i ? ' selected' : '')} onClick={() => onAnswer(i)}>
            <span className="exam-opt-letter">{String.fromCharCode(65 + k)}</span>
            <Markdown md={q.options[i]} className="inline-md" />
          </button>
        ))}
      </div>
    </>
  )
}

function CodeInput({ problem: p, answer, onAnswer }: { problem: Problem; answer: Answer | undefined; onAnswer: (a: Answer) => void }) {
  const cur = typeof answer === 'object' ? answer : null
  const [lang, setLang] = useState<Lang>(cur?.lang ?? progress.get().lang)
  const code = cur && cur.lang === lang ? cur.code : p.starter[lang]
  const examples = p.tests.slice(0, 2)
  const [run, setRun] = useState<Awaited<ReturnType<typeof runTests>> | null>(null)
  const [busy, setBusy] = useState(false)
  const tryExamples = async () => {
    setBusy(true)
    setRun(await runTests(code, lang, p.fnName, examples, p.compare ?? 'exact', p.io))
    setBusy(false)
  }
  return (
    <>
      <h3 className="exam-code-title">{p.title}</h3>
      <Markdown md={p.description} />
      {p.examples.map((ex, i) => (
        <div key={i} className="example">
          <div className="example-line">
            <span className="muted">Entrada:</span> <code>{ex.input}</code>
          </div>
          <div className="example-line">
            <span className="muted">Saída:</span> <code>{ex.output}</code>
          </div>
          {ex.explanation && <div className="example-line muted">{ex.explanation}</div>}
        </div>
      ))}
      <div className="exam-editor-bar">
        <div className="seg">
          <button
            className={lang === 'js' ? 'active' : ''}
            onClick={() => {
              setLang('js')
              setRun(null)
            }}
          >
            JavaScript
          </button>
          <button
            className={lang === 'ts' ? 'active' : ''}
            onClick={() => {
              setLang('ts')
              setRun(null)
            }}
          >
            TypeScript
          </button>
        </div>
        <span className="spacer" />
        <button className="btn btn-sm" onClick={tryExamples} disabled={busy}>
          {busy ? 'Rodando…' : `▶ Rodar ${examples.length} exemplos`}
        </button>
      </div>
      <div className="exam-editor">
        <CodeEditor value={code} onChange={(c) => onAnswer({ code: c, lang })} lang={lang} onRun={tryExamples} />
      </div>
      {run && <MiniRun p={p} run={run} />}
      <p className="muted small">Trocar de linguagem recomeça o código. Na entrega, sua função roda contra todos os {p.tests.length} testes.</p>
    </>
  )
}

function MiniRun({ p, run, showAll }: { p: Problem; run: Awaited<ReturnType<typeof runTests>>; showAll?: boolean }) {
  if (run.timeout) return <div className="err-box">Tempo esgotado: provavelmente um loop infinito.</div>
  if (run.fatal) return <div className="err-box">{run.fatal.name}: {run.fatal.message}{run.fatal.line ? ` (linha ${run.fatal.line})` : ''}</div>
  return (
    <div className="exam-mini-run">
      {run.results.map((r, i) => {
        if (showAll === false && r.pass) return null
        const t = p.tests[i]
        return (
          <div key={i} className={'exam-mini-case ' + (r.pass ? 'ok' : 'bad')}>
            <span>{r.pass ? '✓' : '✗'}</span>
            <span className="exam-mini-label">{t.label ?? `Caso ${i + 1}`}</span>
            {!r.pass && (
              <span className="exam-mini-diff">
                {r.error ? (
                  <code>
                    {r.error.name}: {r.error.message}
                  </code>
                ) : (
                  <>
                    esperado <code>{formatV(serialize(t.expected))}</code>, recebido <code>{formatV(r.got)}</code>
                  </>
                )}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ============================== Correção ============================== */

function ExamReview({ exam, draft }: { exam: Exam; draft: ExamDraft }) {
  const navigate = useNavigate()
  const graded: Record<string, Graded> = useMemo(() => {
    const out: Record<string, Graded> = { ...(draft.graded ?? {}) }
    for (const q of exam.questions) if (q.kind === 'essay') out[q.id] = gradeEssay(q, draft.answers[q.id], draft.essays?.[q.id])
    return out
  }, [exam, draft])
  const pending = exam.questions.filter((q) => graded[q.id]?.status === 'pending').length
  const score = examScore(exam, graded)
  const passed = score >= exam.passPct
  const duration = (draft.submittedAt ?? 0) - draft.startedAt

  useEffect(() => {
    if (pending === 0 && !draft.saved) {
      progress.saveExam(exam.id, score, exam.passPct)
      drafts.update(exam.id, (d) => ({ ...d, saved: true }))
    }
  }, [pending, draft.saved, exam, score])

  // tópicos para revisar: questões que não ficaram 100%
  const review = useMemo(() => {
    const seen = new Map<string, { label: string; to: string; count: number }>()
    for (const q of exam.questions) {
      const g = graded[q.id]
      if (!g || g.status === 'right' || g.status === 'pending') continue
      const ref = topicRef(q.topic)
      if (!ref) continue
      const cur = seen.get(ref.to)
      if (cur) cur.count++
      else seen.set(ref.to, { ...ref, count: 1 })
    }
    return [...seen.values()].sort((a, b) => b.count - a.count)
  }, [exam, graded])

  const counts = exam.questions.reduce<Record<QStatus, number>>(
    (acc, q) => ({ ...acc, [graded[q.id]?.status ?? 'blank']: acc[graded[q.id]?.status ?? 'blank'] + 1 }),
    { right: 0, partial: 0, wrong: 0, blank: 0, pending: 0 },
  )

  return (
    <div className="exam-review">
      <div className="breadcrumb">
        <Link to="/guia">Guia</Link> / {exam.title}
      </div>
      <div className={'exam-score card ' + (pending ? 'is-pending' : passed ? 'is-pass' : 'is-fail')}>
        <div className="exam-score-num">{score}%</div>
        <div className="exam-score-info">
          <strong>
            {pending
              ? 'Nota parcial: falta a autoavaliação'
              : passed
                ? 'Aprovado! 🎉'
                : `Ainda não foi desta vez (mínimo ${exam.passPct}%)`}
          </strong>
          <span className="muted small">
            {counts.right} certas · {counts.partial} parciais · {counts.wrong} erradas · {counts.blank} em branco · tempo {fmtTime(duration)} (sugerido{' '}
            {exam.minutes} min)
          </span>
          {pending > 0 && (
            <span className="small">
              Corrija as <strong>{pending} discursiva(s)</strong> lá embaixo para fechar a nota.
            </span>
          )}
        </div>
      </div>

      {review.length > 0 && (
        <div className="card exam-revisit">
          <strong>O que revisar</strong>
          <p className="muted small">Aulas dos assuntos em que você perdeu pontos (mais erros primeiro):</p>
          <div className="exam-revisit-list">
            {review.map((r) => (
              <Link key={r.to} to={r.to} className="exam-revisit-item">
                {r.label}
                <span className="badge">{r.count}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {exam.questions.map((q, i) => (
        <ReviewCard key={q.id} exam={exam} q={q} index={i} answer={draft.answers[q.id]} g={graded[q.id]} draft={draft} navigate={navigate} />
      ))}

      <div className="exam-pager">
        <Link className="btn" to="/guia">
          ← Voltar ao guia
        </Link>
        <span className="spacer" />
        <button className="btn btn-primary" onClick={() => drafts.discard(exam.id)}>
          ↺ Refazer a prova
        </button>
      </div>
    </div>
  )
}

function ReviewCard({
  exam,
  q,
  index,
  answer,
  g,
  draft,
  navigate,
}: {
  exam: Exam
  q: ExamQuestion
  index: number
  answer: Answer | undefined
  g: Graded | undefined
  draft: ExamDraft
  navigate: ReturnType<typeof useNavigate>
}) {
  const status = g?.status ?? 'blank'
  const ref = topicRef(q.topic)
  const [showSol, setShowSol] = useState(false)
  return (
    <div className={'exam-q card review review-' + status} id={'q-' + q.id}>
      <div className="exam-q-head">
        <strong>Questão {index + 1}</strong>
        <span className={'exam-kind exam-kind-' + q.kind}>{KIND_LABEL[q.kind]}</span>
        <span className={'exam-status status-' + status}>
          {STATUS_LABEL[status]}
          {g && weightOf(q) > 0 && status !== 'pending' && ` · ${Math.round(g.score * weightOf(q) * 10) / 10}/${weightOf(q)}`}
        </span>
        <span className="spacer" />
        {ref && (
          <Link className="muted small" to={ref.to}>
            📖 {ref.label}
          </Link>
        )}
      </div>

      {q.kind === 'choice' && <ChoiceReview q={q} answer={answer} />}

      {q.kind === 'output' && (
        <>
          <CodeBlock code={q.code} />
          <div className="exam-output-cmp">
            <div>
              <div className="muted small">Sua resposta</div>
              <pre className={status === 'right' ? 'ok' : 'bad'}>{typeof answer === 'string' && answer.trim() ? outputLines(answer).join('\n') : '(em branco)'}</pre>
            </div>
            <div>
              <div className="muted small">Saída real</div>
              <pre className="ok">{q.expected.join('\n')}</pre>
            </div>
          </div>
          <Markdown md={q.explain} className="exam-explain" />
        </>
      )}

      {q.kind === 'code' && (
        <>
          <div className="muted small">
            {q.problem.title} ·{' '}
            {g?.run && !g.run.fatal && !g.run.timeout
              ? `${g.run.results.filter((r) => r.pass).length}/${q.problem.tests.length} testes passaram`
              : status === 'blank'
                ? 'não respondida'
                : 'o código não rodou'}
          </div>
          {g?.run && <MiniRun p={q.problem} run={g.run} showAll={false} />}
          {typeof answer === 'object' && <CodeBlock code={answer.code} caption="Seu código" />}
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => {
                if (typeof answer === 'object') {
                  progress.saveCode(q.problem.id, answer.lang, answer.code)
                  progress.setLang(answer.lang)
                }
                navigate('/provas/p/' + q.problem.id)
              }}
            >
              🔍 Abrir no editor com visualizador
            </button>
            <button className="btn btn-sm" onClick={() => setShowSol(!showSol)}>
              {showSol ? 'Esconder solução' : 'Ver solução comentada'}
            </button>
          </div>
          {showSol && (
            <div className="exam-sol">
              <Markdown md={q.problem.explanation.intuition} />
              <CodeBlock code={q.problem.solution.js} />
              <ul className="pitfalls">
                {q.problem.explanation.pitfalls.map((pf, k) => (
                  <li key={k}>
                    <Markdown md={pf} className="inline-md" />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {q.kind === 'essay' && <EssayReview exam={exam} q={q} answer={answer} draft={draft} />}
    </div>
  )
}

function ChoiceReview({ q, answer }: { q: Extract<ExamQuestion, { kind: 'choice' }>; answer: Answer | undefined }) {
  const order = useMemo(() => shuffledOrder(q.id + q.prompt, q.options), [q])
  return (
    <>
      <Markdown md={q.prompt} />
      {q.code && <CodeBlock code={q.code} />}
      <div className="exam-options">
        {order.map((i, k) => {
          const cls = ['exam-opt', 'static']
          if (i === q.answer) cls.push('is-answer')
          if (answer === i && i !== q.answer) cls.push('is-wrong')
          return (
            <div key={i} className={cls.join(' ')}>
              <span className="exam-opt-letter">{String.fromCharCode(65 + k)}</span>
              <Markdown md={q.options[i]} className="inline-md" />
              {answer === i && <span className="exam-opt-you">sua resposta</span>}
            </div>
          )
        })}
      </div>
      <Markdown md={q.explain} className="exam-explain" />
    </>
  )
}

function EssayReview({ exam, q, answer, draft }: { exam: Exam; q: Extract<ExamQuestion, { kind: 'essay' }>; answer: Answer | undefined; draft: ExamDraft }) {
  const check = draft.essays?.[q.id] ?? { checked: q.checklist.map(() => false), confirmed: false }
  const blank = typeof answer !== 'string' || answer.trim() === ''
  const setCheck = (next: typeof check) => drafts.update(exam.id, (d) => ({ ...d, essays: { ...(d.essays ?? {}), [q.id]: next } }))
  return (
    <>
      <Markdown md={q.prompt} />
      <div className="exam-essay-cols">
        <div>
          <div className="muted small">Sua resposta</div>
          <div className="exam-essay-answer">{blank ? '(em branco)' : (answer as string)}</div>
        </div>
        <div>
          <div className="muted small">Resposta modelo</div>
          <Markdown md={q.model} className="exam-essay-model" />
        </div>
      </div>
      {!blank && (
        <div className="exam-checklist">
          <strong className="small">Marque os pontos que a sua resposta cobriu:</strong>
          {q.checklist.map((item, i) => (
            <label key={i} className={'exam-check' + (check.confirmed ? ' locked' : '')}>
              <input
                type="checkbox"
                checked={!!check.checked[i]}
                disabled={check.confirmed}
                onChange={(e) => {
                  const checked = [...check.checked]
                  checked[i] = e.target.checked
                  setCheck({ ...check, checked })
                }}
              />
              <Markdown md={item} className="inline-md" />
            </label>
          ))}
          {!check.confirmed ? (
            <button className="btn btn-sm btn-primary" onClick={() => setCheck({ ...check, confirmed: true })}>
              Confirmar autoavaliação
            </button>
          ) : (
            <span className="muted small">
              Autoavaliação registrada: {check.checked.filter(Boolean).length} de {q.checklist.length} pontos.
            </span>
          )}
        </div>
      )}
    </>
  )
}

/* ============================== Lista de provas ============================== */

export function ExamsPage() {
  const s = useProgress()
  return (
    <div className="exams-page">
      <div className="breadcrumb">
        <Link to="/guia">Guia</Link> / Provas
      </div>
      <h1>Provas</h1>
      <p className="text-2">Uma prova no fim de cada etapa do guia, misturando conceitos, boas práticas, leitura de código e exercícios.</p>
      <div className="exams-list">
        {EXAMS.map((e) => {
          const rec = s.exams[e.id]
          const stage = STAGES.find((st) => st.id === e.stage)
          return (
            <Link key={e.id} to={'/prova/' + e.id} className="card exams-item">
              <div>
                <div className="muted small">{stage?.title}</div>
                <strong>{e.title}</strong>
                <div className="muted small">
                  {e.questions.length} questões · ~{e.minutes} min
                </div>
              </div>
              <span className={'badge ' + (rec ? (rec.passed ? 'badge-ok' : 'badge-bad') : '')}>
                {rec ? `${rec.best}%${rec.passed ? ' ✓' : ''}` : 'não feita'}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
