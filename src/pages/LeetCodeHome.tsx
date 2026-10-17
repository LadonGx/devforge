import { Fragment } from 'react'
import { Link } from 'react-router-dom'

const PART_START: Record<string, string> = {
  'arrays-hashing': 'Parte 1 · Arrays e strings',
  'linked-list': 'Parte 2 · Estruturas ligadas, recursão e grafos',
}
import { PATTERNS, problemById } from '../content/leetcode'
import { useProgress } from '../lib/progress'
import { moduleProgress, patternProgress } from '../lib/stats'
import { DifficultyBadge } from '../components/DifficultyBadge'

export function LeetCodeHome() {
  const s = useProgress()
  const mp = moduleProgress('leetcode', s)
  return (
    <div>
      <div className="breadcrumb">
        <Link to="/">Vitrine</Link> / <span>Volume 1 · JavaScript</span>
      </div>
      <div className="lc-head">
        <div>
          <h1>Treino LeetCode / NeetCode</h1>
          <p className="text-2" style={{ maxWidth: 680 }}>
            Organizado por <strong>padrões</strong>, como o roadmap do NeetCode: aprender o padrão vale mais que decorar 300 problemas. Cada padrão
            tem uma aula com visualização e problemas inspirados nos do LeetCode, que você resolve em JavaScript ou TypeScript.
          </p>
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
        <div className="how-step">
          <span className="how-num">1</span>
          <div>
            <strong>Aula do padrão</strong>
            <div className="muted small">Ideia, sinais no enunciado, template e uma animação.</div>
          </div>
        </div>
        <div className="how-step">
          <span className="how-num">2</span>
          <div>
            <strong>Resolva e rode os testes</strong>
            <div className="muted small">Ctrl+Enter roda. Teste que falha mostra o diff visual.</div>
          </div>
        </div>
        <div className="how-step">
          <span className="how-num">3</span>
          <div>
            <strong>Visualize o seu código</strong>
            <div className="muted small">Passo a passo: ponteiros, Map, pilha e linha atual.</div>
          </div>
        </div>
      </div>

      <div className="roadmap">
        {PATTERNS.map((p, idx) => {
          const pr = patternProgress(p, s)
          const part = PART_START[p.id]
          return (
            <Fragment key={p.id}>
            {part && <h3 className="roadmap-part">{part}</h3>}
            <section className="roadmap-item">
              <div className="roadmap-rail">
                <span className={'roadmap-dot' + (pr.complete ? ' done' : pr.started ? ' started' : '')} style={{ borderColor: p.color }}>
                  {pr.complete ? '✓' : idx + 1}
                </span>
                {idx < PATTERNS.length - 1 && <span className="roadmap-line" />}
              </div>
              <div className="card pattern-card" style={{ borderTop: `3px solid ${p.color}` }}>
                <div className="pattern-head">
                  <div>
                    <h2>{p.title}</h2>
                    <p className="text-2" style={{ margin: 0 }}>
                      {p.summary}
                    </p>
                  </div>
                  <div className="pattern-meta">
                    <span className="muted small">
                      {pr.solved}/{pr.total} problemas
                    </span>
                    <div className="progress-bar" style={{ width: 120 }}>
                      <span style={{ width: pr.pct + '%' }} />
                    </div>
                  </div>
                </div>
                <div className="pattern-list">
                  <Link to={`/leetcode/padrao/${p.id}`} className={'pattern-row lesson-row' + (pr.lessonDone ? ' is-done' : '')}>
                    <span className="row-check">{pr.lessonDone ? '✓' : '📖'}</span>
                    <span className="row-title">Aula: {p.title}</span>
                    <span className="muted small">{p.short}</span>
                  </Link>
                  {p.problems.map((id) => {
                    const prob = problemById(id)
                    if (!prob) return null
                    const done = !!s.solved[id]
                    return (
                      <Link key={id} to={`/leetcode/p/${id}`} className={'pattern-row' + (done ? ' is-done' : '')}>
                        <span className="row-check">{done ? '✓' : s.attempted[id] ? '◐' : '○'}</span>
                        <span className="row-title">{prob.title}</span>
                        <span className="muted small">#{prob.leetcode.number}</span>
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
        <section className="roadmap-item">
          <div className="roadmap-rail">
            <span className="roadmap-dot soon">…</span>
          </div>
          <div className="card soon-card">
            <strong>Em breve na parte 3:</strong> Tries, Intervals, Greedy, Advanced Graphs (Dijkstra, Union-Find) e 2-D Dynamic Programming.
          </div>
        </section>
      </div>
    </div>
  )
}
