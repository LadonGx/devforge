import { Link, useParams } from 'react-router-dom'
import { PATTERNS, patternById, problemById } from '../content/leetcode'
import { LessonBlocks } from '../components/LessonBlocks'
import { progress, useProgress } from '../lib/progress'
import { lessonKey } from '../lib/stats'
import { DifficultyBadge } from '../components/DifficultyBadge'

export function PatternPage() {
  const { id = '' } = useParams()
  const s = useProgress()
  const p = patternById(id)
  if (!p) {
    return (
      <div className="empty-state">
        <h2>Padrão não encontrado</h2>
        <Link to="/leetcode">Voltar</Link>
      </div>
    )
  }
  const idx = PATTERNS.indexOf(p)
  const prev = PATTERNS[idx - 1]
  const next = PATTERNS[idx + 1]
  const done = !!s.lessons[lessonKey(p.id)]

  return (
    <div className="pattern-page">
      <div className="breadcrumb">
        <Link to="/">Vitrine</Link> / <Link to="/leetcode">LeetCode</Link> / <span>{p.title}</span>
      </div>
      <div className="pattern-title" style={{ borderLeft: `4px solid ${p.color}` }}>
        <span className="muted small">Padrão {idx + 1} de {PATTERNS.length}</span>
        <h1>{p.title}</h1>
        <p className="text-2">{p.summary}</p>
      </div>

      <LessonBlocks key={p.id} blocks={p.lesson} />

      <div className="lesson-done card">
        <div>
          <strong>{done ? 'Aula concluída ✓' : 'Entendeu a ideia?'}</strong>
          <div className="muted small">Marque a aula e vá para a prática. Você pode voltar aqui quando quiser.</div>
        </div>
        <button className={'btn ' + (done ? '' : 'btn-primary')} onClick={() => progress.toggleLesson(lessonKey(p.id))}>
          {done ? 'Desmarcar' : 'Marcar como concluída'}
        </button>
      </div>

      <h2 style={{ marginTop: 32 }}>Pratique</h2>
      <div className="practice-list">
        {p.problems.map((pid, i) => {
          const prob = problemById(pid)
          if (!prob) return null
          const solved = !!s.solved[pid]
          return (
            <Link key={pid} to={`/leetcode/p/${pid}`} className={'practice-item card' + (solved ? ' is-done' : '')}>
              <span className="practice-num">{solved ? '✓' : i + 1}</span>
              <div className="practice-body">
                <strong>{prob.title}</strong>
                <span className="muted small">LeetCode #{prob.leetcode.number}</span>
              </div>
              <DifficultyBadge d={prob.difficulty} />
            </Link>
          )
        })}
      </div>

      <div className="pager">
        {prev ? (
          <Link to={`/leetcode/padrao/${prev.id}`} className="btn">
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link to={`/leetcode/padrao/${next.id}`} className="btn">
            {next.title} →
          </Link>
        )}
      </div>
    </div>
  )
}
