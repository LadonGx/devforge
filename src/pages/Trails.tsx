import { Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { TRAILS } from '../content/modules'
import { useProgress } from '../lib/progress'
import { stepRoute, stepStatus } from '../lib/stats'

const LABEL = { done: 'Concluído', progress: 'Em andamento', todo: 'A fazer', soon: 'Em breve' } as const

export function TrailsPage() {
  const s = useProgress()
  const { hash } = useLocation()

  useEffect(() => {
    if (!hash) return
    const el = document.getElementById(hash.slice(1))
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [hash])

  return (
    <div>
      <h1>Trilhas sugeridas</h1>
      <p className="text-2" style={{ maxWidth: 720 }}>
        Caminhos prontos para não ficar perdido. Você continua livre para abrir qualquer módulo pela vitrine: as trilhas só sugerem uma ordem que faz
        sentido.
      </p>
      <div className="grid" style={{ marginTop: 24 }}>
        {TRAILS.map((t) => {
          const statuses = t.steps.map((st) => stepStatus(st, s))
          const nextIdx = statuses.findIndex((x) => x === 'todo' || x === 'progress')
          return (
            <section key={t.id} id={t.id} className={'card trail' + (hash === '#' + t.id ? ' trail-focus' : '')}>
              <h2>{t.title}</h2>
              <p className="text-2">{t.summary}</p>
              <ol className="trail-steps">
                {t.steps.map((st, i) => {
                  const status = statuses[i]
                  const isNext = i === nextIdx
                  return (
                    <li key={i} className={'trail-step step-' + status + (isNext ? ' is-next' : '')}>
                      <span className="step-num">{status === 'done' ? '✓' : i + 1}</span>
                      <div className="step-body">
                        {status === 'soon' ? (
                          <Link to={stepRoute(st)} className="step-title muted">
                            {st.label}
                          </Link>
                        ) : (
                          <Link to={stepRoute(st)} className="step-title">
                            {st.label}
                          </Link>
                        )}
                        <span className={'badge step-badge-' + status}>{LABEL[status]}</span>
                        {isNext && <span className="badge badge-accent">Próximo</span>}
                      </div>
                    </li>
                  )
                })}
              </ol>
            </section>
          )
        })}
      </div>
    </div>
  )
}
