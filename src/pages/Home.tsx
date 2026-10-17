import { Link } from 'react-router-dom'
import { MODULES, TRAILS, VOLUMES } from '../content/modules'
import { PROBLEMS } from '../content/leetcode'
import { useProgress } from '../lib/progress'
import { moduleProgress, nextAction, stepStatus } from '../lib/stats'
import type { ModuleInfo } from '../content/types'

export function Home() {
  const s = useProgress()
  const solved = Object.keys(s.solved).length
  const lessons = Object.keys(s.lessons).length
  const next = nextAction(s)
  const available = MODULES.filter((m) => m.status === 'available').length

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-text">
          <h1>Sua vitrine de estudos</h1>
          <p className="text-2">
            Conceitos explicados por partes, prática com testes e <strong>o seu código rodando passo a passo na tela</strong>. Escolha qualquer
            módulo ou siga uma trilha sugerida.
          </p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-num">{solved}</span>
              <span className="stat-label">problemas resolvidos de {PROBLEMS.length}</span>
            </div>
            <div className="stat">
              <span className="stat-num">{lessons}</span>
              <span className="stat-label">aulas concluídas</span>
            </div>
            <div className="stat">
              <span className="stat-num">
                {available}/{MODULES.length}
              </span>
              <span className="stat-label">módulos disponíveis</span>
            </div>
          </div>
        </div>
        <Link to={next.to} className="continue-card">
          <span className="continue-kicker">Próximo passo sugerido</span>
          <span className="continue-title">{next.label}</span>
          <span className="continue-detail">{next.detail}</span>
          <span className="continue-go">Continuar →</span>
        </Link>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Trilhas sugeridas</h2>
          <Link to="/trilhas">Ver todas →</Link>
        </div>
        <div className="trail-strip">
          {TRAILS.map((t) => {
            const statuses = t.steps.map((st) => stepStatus(st, s))
            const done = statuses.filter((x) => x === 'done').length
            return (
              <Link key={t.id} to={`/trilhas#${t.id}`} className="trail-mini card">
                <div className="trail-mini-title">{t.title}</div>
                <div className="trail-dots">
                  {statuses.map((st, i) => (
                    <span key={i} className={'dot dot-' + st} title={t.steps[i].label} />
                  ))}
                </div>
                <div className="muted small">
                  {done}/{t.steps.length} etapas
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {VOLUMES.map((v) => (
        <section key={v.id} className="section">
          <div className="section-head">
            <div>
              <h2>{v.title}</h2>
              <p className="muted section-desc">{v.desc}</p>
            </div>
          </div>
          <div className="module-grid">
            {MODULES.filter((m) => m.volume === v.id).map((m) => (
              <ModuleCard key={m.id} m={m} pct={moduleProgress(m.id, s).pct} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function ModuleCard({ m, pct }: { m: ModuleInfo; pct: number }) {
  const available = m.status === 'available'
  const to = available ? m.route! : `/modulo/${m.id}`
  return (
    <Link to={to} className={'module-card card' + (available ? ' is-available' : ' is-soon')}>
      <div className="module-top">
        <span className="module-icon">{m.icon}</span>
        <div className="module-badges">
          <span className="badge">{m.level}</span>
          {available ? <span className="badge badge-ok">Disponível</span> : <span className="badge badge-soon">Em breve</span>}
        </div>
      </div>
      <h3>{m.title}</h3>
      <p className="text-2 module-summary">{m.summary}</p>
      <div className="chips">
        {m.topics.slice(0, 5).map((t) => (
          <span key={t} className="chip">
            {t}
          </span>
        ))}
        {m.topics.length > 5 && <span className="chip chip-more">+{m.topics.length - 5}</span>}
      </div>
      {available && (
        <div className="module-progress">
          <div className="progress-bar">
            <span style={{ width: pct + '%' }} />
          </div>
          <span className="muted small">{pct}%</span>
        </div>
      )}
    </Link>
  )
}
