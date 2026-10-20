import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import type { Course } from '../content/types'
import { problemPath, unitPath } from '../content/courses'
import { useProgress } from '../lib/progress'
import { moduleProgress, unitProgress } from '../lib/stats'
import { DifficultyBadge } from '../components/DifficultyBadge'
import { Markdown } from '../components/Markdown'

export function CourseHome({ course: c }: { course: Course }) {
  const s = useProgress()
  const mp = moduleProgress(c.id, s)
  const isLeet = c.id === 'leetcode'
  return (
    <div>
      <div className="breadcrumb">
        <Link to="/">Vitrine</Link> / <span>{c.volumeLabel}</span>
      </div>
      <div className="lc-head">
        <div>
          <h1>{c.title}</h1>
          <Markdown md={c.intro} className="text-2 course-intro" />
        </div>
        <div className="lc-progress card">
          <div className="muted small">Progresso do módulo</div>
          <div className="lc-progress-num">{mp.pct}%</div>
          <div className="progress-bar">
            <span style={{ width: mp.pct + '%' }} />
          </div>
          <div className="muted small">
            {mp.done} de {mp.items} itens
          </div>
        </div>
      </div>

      <div className="how card">
        {c.how.map((h, i) => (
          <div key={h.title} className="how-step">
            <span className="how-num">{i + 1}</span>
            <div>
              <strong>{h.title}</strong>
              <div className="muted small">{h.text}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="roadmap">
        {c.units.map((u, idx) => {
          const pr = unitProgress(c, u, s)
          const part = c.parts?.[u.id]
          return (
            <Fragment key={u.id}>
              {part && <h3 className="roadmap-part">{part}</h3>}
              <section className="roadmap-item">
                <div className="roadmap-rail">
                  <span className={'roadmap-dot' + (pr.complete ? ' done' : pr.started ? ' started' : '')} style={{ borderColor: u.color }}>
                    {pr.complete ? '✓' : idx + 1}
                  </span>
                  {idx < c.units.length - 1 && <span className="roadmap-line" />}
                </div>
                <div className="card pattern-card" style={{ borderTop: `3px solid ${u.color}` }}>
                  <div className="pattern-head">
                    <div>
                      <h2>{u.title}</h2>
                      <p className="text-2" style={{ margin: 0 }}>
                        {u.summary}
                      </p>
                    </div>
                    <div className="pattern-meta">
                      <span className="muted small">
                        {pr.solved}/{pr.total} {isLeet ? 'problemas' : 'exercícios'}
                      </span>
                      <div className="progress-bar" style={{ width: 120 }}>
                        <span style={{ width: pr.pct + '%' }} />
                      </div>
                    </div>
                  </div>
                  <div className="pattern-list">
                    <Link to={unitPath(c, u.id)} className={'pattern-row lesson-row' + (pr.lessonDone ? ' is-done' : '')}>
                      <span className="row-check">{pr.lessonDone ? '✓' : '📖'}</span>
                      <span className="row-title">Aula: {u.title}</span>
                      <span className="muted small">{u.short}</span>
                    </Link>
                    {u.problems.map((id) => {
                      const prob = c.problems.find((x) => x.id === id)
                      if (!prob) return null
                      const done = !!s.solved[id]
                      return (
                        <Link key={id} to={problemPath(c, id)} className={'pattern-row' + (done ? ' is-done' : '')}>
                          <span className="row-check">{done ? '✓' : s.attempted[id] ? '◐' : '○'}</span>
                          <span className="row-title">{prob.title}</span>
                          {prob.leetcode && <span className="muted small">#{prob.leetcode.number}</span>}
                          <DifficultyBadge d={prob.difficulty} />
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </section>
            </Fragment>
          )
        })}
        {c.soonNote && (
          <section className="roadmap-item">
            <div className="roadmap-rail">
              <span className="roadmap-dot soon">…</span>
            </div>
            <div className="card soon-card">
              <Markdown md={c.soonNote} />
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
