import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CONCEPTS, CONCEPT_THEMES, conceptTheme } from '../../content/ifood/concepts'
import type { ConceptQuestion, ConceptTheme } from '../../content/ifood/types'
import { topicRef } from '../../content/exams'
import { progress, useProgress, type ConceptAnswer } from '../../lib/progress'
import { shuffledOrder } from '../../components/widgets/Quiz'
import { CodeBlock, Markdown } from '../../components/Markdown'

type StatusFilter = 'all' | 'todo' | 'wrong'

const STATUS_LABEL: Record<StatusFilter, string> = { all: 'Todas', todo: 'Não respondidas', wrong: 'Erradas' }
const LETTERS = 'ABCD'

/** Seção 4: banco de questões de alternativa, com filtro por tema e explicação de cada alternativa. */
export function ConceptsView() {
  const s = useProgress()
  const [theme, setTheme] = useState<ConceptTheme | 'all'>('all')
  const [status, setStatus] = useState<StatusFilter>('all')

  const answered = CONCEPTS.filter((q) => s.concepts[q.id]).length
  const right = CONCEPTS.filter((q) => s.concepts[q.id]?.right).length

  const visible = CONCEPTS.filter((q) => {
    if (theme !== 'all' && q.theme !== theme) return false
    const a = s.concepts[q.id]
    if (status === 'todo') return !a
    if (status === 'wrong') return !!a && !a.right
    return true
  })

  const resetVisible = () => {
    progress.clearConcepts(visible.map((q) => q.id))
  }

  return (
    <div className="concepts">
      <div className="concepts-summary card">
        <div className="concepts-score">
          <div>
            <div className="lc-progress-num">
              {right}/{CONCEPTS.length}
            </div>
            <div className="muted small">
              acertos · {answered} respondidas
            </div>
          </div>
          <p className="text-2 small" style={{ margin: 0 }}>
            Responda e leia a explicação de <strong>todas</strong> as alternativas, não só da certa: entender por que as erradas estão erradas é o que
            faz o conceito fixar. A ordem das alternativas é embaralhada.
          </p>
        </div>
        <div className="concepts-themes" role="group" aria-label="Filtrar por tema">
          <button className={'concepts-theme' + (theme === 'all' ? ' active' : '')} onClick={() => setTheme('all')}>
            <span className="concepts-theme-title">Todos os temas</span>
            <ThemeBar done={right} total={CONCEPTS.length} />
          </button>
          {CONCEPT_THEMES.map((t) => {
            const qs = CONCEPTS.filter((q) => q.theme === t.id)
            const ok = qs.filter((q) => s.concepts[q.id]?.right).length
            return (
              <button key={t.id} className={'concepts-theme' + (theme === t.id ? ' active' : '')} onClick={() => setTheme(t.id)} title={t.covers}>
                <span className="concepts-theme-title">{t.title}</span>
                <ThemeBar done={ok} total={qs.length} />
              </button>
            )
          })}
        </div>
      </div>

      <div className="concepts-toolbar">
        <div className="seg" role="group" aria-label="Filtrar por situação">
          {(Object.keys(STATUS_LABEL) as StatusFilter[]).map((k) => (
            <button key={k} className={status === k ? 'active' : ''} onClick={() => setStatus(k)}>
              {STATUS_LABEL[k]}
            </button>
          ))}
        </div>
        <span className="muted small">
          {visible.length} {visible.length === 1 ? 'questão' : 'questões'}
        </span>
        <button className="btn btn-sm btn-ghost" onClick={resetVisible} disabled={!visible.some((q) => s.concepts[q.id])}>
          Zerar respostas {theme === 'all' && status === 'all' ? '' : 'destas'}
        </button>
      </div>

      {theme !== 'all' && <p className="muted small concepts-covers">{conceptTheme(theme).covers}</p>}

      {visible.length === 0 ? (
        <div className="card muted">Nenhuma questão com esse filtro.</div>
      ) : (
        <ol className="concepts-list">
          {visible.map((q) => (
            <li key={q.id}>
              <ConceptCard q={q} n={CONCEPTS.indexOf(q) + 1} saved={s.concepts[q.id]} />
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

function ThemeBar({ done, total }: { done: number; total: number }) {
  return (
    <span className="concepts-theme-bar">
      <span className="progress-bar">
        <span style={{ width: (total ? (done / total) * 100 : 0) + '%' }} />
      </span>
      <span className="muted small">
        {done}/{total}
      </span>
    </span>
  )
}

function ConceptCard({ q, n, saved }: { q: ConceptQuestion; n: number; saved?: ConceptAnswer }) {
  // "Responder de novo" esconde o resultado salvo até a próxima resposta
  const [retry, setRetry] = useState(false)
  const order = useMemo(() => shuffledOrder(q.id, q.options), [q.id, q.options])
  const result = retry ? undefined : saved
  const done = !!result
  const review = topicRef(q.review ?? conceptTheme(q.theme).review)

  const pick = (i: number) => {
    progress.answerConcept(q.id, i, i === q.answer)
    setRetry(false)
  }

  return (
    <article id={q.id} className={'concept card' + (done ? (result.right ? ' is-right' : ' is-wrong') : '')}>
      <div className="concept-head">
        <span className="badge">#{n}</span>
        <span className="badge">{conceptTheme(q.theme).title}</span>
        {saved && saved.tries > 1 && <span className="muted small">{saved.tries} tentativas</span>}
      </div>
      <Markdown md={q.prompt} className="concept-prompt" />
      {q.code && <CodeBlock code={q.code} />}

      <div className="concept-options">
        {order.map((i, pos) => {
          const isAnswer = i === q.answer
          const isPicked = done && i === result.picked
          const cls = ['concept-opt']
          if (done && isAnswer) cls.push('is-answer')
          if (isPicked && !isAnswer) cls.push('is-wrong')
          if (isPicked) cls.push('is-picked')
          return (
            <div key={i} className={cls.join(' ')}>
              <button className="concept-opt-btn" data-option={i} disabled={done} onClick={() => pick(i)}>
                <span className="concept-letter">{LETTERS[pos]}</span>
                <Markdown md={q.options[i]} className="inline-md" />
                {done && <span className="concept-mark">{isAnswer ? '✓ certa' : isPicked ? '✗ sua resposta' : ''}</span>}
              </button>
              {done && (
                <div className="concept-why">
                  <Markdown md={isAnswer ? q.explain : q.whyWrong[i]} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {done && (
        <div className="concept-foot">
          <strong className={result.right ? 'ok' : 'bad'}>{result.right ? 'Você acertou.' : 'Você errou esta.'}</strong>
          {review && (
            <span className="muted small">
              Revisar: <Link to={review.to}>{review.label}</Link>
            </span>
          )}
          <button className="btn btn-sm" onClick={() => setRetry(true)}>
            Responder de novo
          </button>
        </div>
      )}
    </article>
  )
}
