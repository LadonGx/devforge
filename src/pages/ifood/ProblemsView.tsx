import { Link } from 'react-router-dom'
import { IFOOD } from '../../content/ifood'
import { IFOOD_PROBLEM_LIST } from '../../content/ifood/problems'
import { problemPath } from '../../content/courses'
import { topicRef } from '../../content/exams'
import { useProgress } from '../../lib/progress'
import { DifficultyBadge } from '../../components/DifficultyBadge'

/** Seção 1: lista dos problemas estilo HackerRank, na ordem de prioridade dos temas. */
export function ProblemsView() {
  const s = useProgress()
  if (IFOOD_PROBLEM_LIST.length === 0) return <div className="card muted">Os problemas desta seção estão sendo escritos.</div>
  return (
    <div className="ifood-problems">
      <h2>Problemas</h2>
      <p className="muted small">
        Do fácil ao médio, na ordem dos temas mais cobrados. Cada um tem testes visíveis e ocultos; a solução explicada mostra o Big O e o padrão do
        NeetCode por trás.
      </p>
      <ol className="practice-list">
        {IFOOD_PROBLEM_LIST.map(({ topic, problem: p }, i) => {
          const solved = !!s.solved[p.id]
          const hidden = p.tests.filter((t) => t.hidden).length
          const pattern = p.related?.[0] ? topicRef(p.related[0]) : null
          return (
            <li key={p.id}>
              <Link to={problemPath(IFOOD, p.id)} className={'practice-item card' + (solved ? ' is-done' : '')}>
                <span className="practice-num">{solved ? '✓' : i + 1}</span>
                <div className="practice-body">
                  <strong>{p.title}</strong>
                  <span className="muted small">
                    {topic}
                    {pattern && ` · ${pattern.label.replace(/^[^:]+: /, 'padrão ')}`} · {p.tests.length - hidden} visíveis + {hidden} ocultos
                  </span>
                </div>
                {!solved && s.attempted[p.id] && <span className="badge">Em andamento</span>}
                <DifficultyBadge d={p.difficulty} />
              </Link>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
