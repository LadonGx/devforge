import { Link, useParams } from 'react-router-dom'
import type { Course } from '../content/types'
import { lessonKey, problemPath, unitPath } from '../content/courses'
import { LessonBlocks } from '../components/LessonBlocks'
import { progress, useProgress } from '../lib/progress'
import { DifficultyBadge } from '../components/DifficultyBadge'

export function UnitPage({ course: c }: { course: Course }) {
  const { id = '' } = useParams()
  const s = useProgress()
  const u = c.units.find((x) => x.id === id)
  if (!u) {
    return (
      <div className="empty-state">
        <h2>{c.unitLabel} não encontrada</h2>
        <Link to={c.basePath}>Voltar</Link>
      </div>
    )
  }
  const idx = c.units.indexOf(u)
  const prev = c.units[idx - 1]
  const next = c.units[idx + 1]
  const key = lessonKey(c, u.id)
  const done = !!s.lessons[key]

  return (
    <div className="pattern-page">
      <div className="breadcrumb">
        <Link to="/">Vitrine</Link> / <Link to={c.basePath}>{c.title}</Link> / <span>{u.title}</span>
      </div>
      <div className="pattern-title" style={{ borderLeft: `4px solid ${u.color}` }}>
        <span className="muted small">
          {c.unitLabel} {idx + 1} de {c.units.length}
        </span>
        <h1>{u.title}</h1>
        <p className="text-2">{u.summary}</p>
      </div>

      <LessonBlocks key={u.id} blocks={u.lesson} />

      <div className="lesson-done card">
        <div>
          <strong>{done ? 'Aula concluída ✓' : 'Entendeu a ideia?'}</strong>
          <div className="muted small">Marque a aula e vá para a prática. Você pode voltar aqui quando quiser.</div>
        </div>
        <button className={'btn ' + (done ? '' : 'btn-primary')} onClick={() => progress.toggleLesson(key)}>
          {done ? 'Desmarcar' : 'Marcar como concluída'}
        </button>
      </div>

      <h2 style={{ marginTop: 32 }}>Pratique</h2>
      <div className="practice-list">
        {u.problems.map((pid, i) => {
          const prob = c.problems.find((x) => x.id === pid)
          if (!prob) return null
          const solved = !!s.solved[pid]
          return (
            <Link key={pid} to={problemPath(c, pid)} className={'practice-item card' + (solved ? ' is-done' : '')}>
              <span className="practice-num">{solved ? '✓' : i + 1}</span>
              <div className="practice-body">
                <strong>{prob.title}</strong>
                {prob.leetcode && <span className="muted small">LeetCode #{prob.leetcode.number}</span>}
              </div>
              <DifficultyBadge d={prob.difficulty} />
            </Link>
          )
        })}
      </div>

      <div className="pager">
        {prev ? (
          <Link to={unitPath(c, prev.id)} className="btn">
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link to={unitPath(c, next.id)} className="btn">
            {next.title} →
          </Link>
        )}
      </div>
    </div>
  )
}
