import { Link } from 'react-router-dom'
import { STAGES, checkKey } from '../content/guide'
import { progress, useProgress } from '../lib/progress'
import { guideProgress, nextGuideStep, stageProgress, type GuideStatus } from '../lib/guide'

const STATUS_ICON: Record<GuideStatus, string> = {
  done: '✓',
  progress: '◐',
  todo: '○',
  pending: '!',
  soon: '·',
}

export function GuidePage() {
  const s = useProgress()
  const total = guideProgress(s)
  const next = nextGuideStep(s)
  let currentFound = false

  return (
    <div className="guide">
      <section className="guide-hero">
        <div>
          <span className="badge badge-accent">Guia</span>
          <h1>Rumo à primeira vaga júnior</h1>
          <p className="text-2">
            Um caminho único que <strong>intercala</strong> as aulas de JavaScript com os padrões de algoritmos do LeetCode: cada padrão entra logo
            depois da aula que ele usa. No fim de cada etapa, uma <strong>prova</strong> com perguntas técnicas, boas práticas, leitura de código e
            exercícios. As etapas marcadas como "em breve" mostram o caminho completo até a vaga.
          </p>
          <div className="guide-total">
            <div className="progress-bar">
              <span style={{ width: total.pct + '%' }} />
            </div>
            <span className="muted small">
              {total.done}/{total.total} passos disponíveis concluídos · {total.pct}%
            </span>
          </div>
        </div>
        {next && (
          <Link to={next.info.to!} className="continue-card">
            <span className="continue-kicker">Próximo passo · {next.stage.title}</span>
            <span className="continue-title">{next.info.title}</span>
            <span className="continue-detail">{next.info.detail}</span>
            <span className="continue-go">Continuar →</span>
          </Link>
        )}
      </section>

      <div className="guide-legend muted small">
        <span>
          <span className="g-status g-done">✓</span> concluído
        </span>
        <span>
          <span className="g-status g-progress">◐</span> em andamento
        </span>
        <span>
          <span className="g-status g-pending">!</span> prova abaixo da nota mínima
        </span>
        <span>
          <span className="tag tag-js">JavaScript</span> aula + exercícios
        </span>
        <span>
          <span className="tag tag-lc">LeetCode</span> padrão de algoritmos
        </span>
      </div>

      <ol className="guide-stages">
        {STAGES.map((stage, si) => {
          const p = stageProgress(stage, s)
          const allSoon = p.total === 0
          const isCurrent = !currentFound && !p.complete && !allSoon
          if (isCurrent) currentFound = true
          return (
            <li
              key={stage.id}
              id={stage.id}
              className={'guide-stage card' + (p.complete ? ' is-complete' : '') + (isCurrent ? ' is-current' : '') + (allSoon ? ' is-soon' : '')}
            >
              <div className="guide-stage-head">
                <span className="guide-num">{p.complete ? '✓' : si + 1}</span>
                <div className="guide-stage-text">
                  <h2>{stage.title}</h2>
                  <p className="text-2 small">{stage.goal}</p>
                </div>
                <span className="guide-stage-count muted small">
                  {allSoon ? 'em breve' : `${p.done}/${p.total}`}
                  {isCurrent && <span className="badge badge-accent">você está aqui</span>}
                </span>
              </div>
              <div className="guide-steps">
                {stage.steps.map((step, i) => {
                  const info = p.infos[i]
                  const body = (
                    <>
                      <span className={'g-status g-' + info.status}>{STATUS_ICON[info.status]}</span>
                      <span className={'tag ' + info.tagClass}>{info.tag}</span>
                      <span className="guide-step-main">
                        <span className="guide-step-title">{info.title}</span>
                        {info.detail && <span className="guide-step-detail muted small">{info.detail}</span>}
                      </span>
                      {info.meta && <span className={'guide-step-meta small' + (info.status === 'pending' ? ' text-bad' : ' muted')}>{info.meta}</span>}
                    </>
                  )
                  const cls = 'guide-step g-row-' + info.status + (step.kind === 'exam' ? ' is-exam' : '')
                  if (step.kind === 'check') {
                    return (
                      <label key={i} className={cls + ' is-check'}>
                        <input
                          type="checkbox"
                          checked={info.status === 'done'}
                          onChange={() => progress.toggleLesson(checkKey(step.id))}
                          aria-label={info.title}
                        />
                        {body}
                      </label>
                    )
                  }
                  return info.to ? (
                    <Link key={i} to={info.to} className={cls}>
                      {body}
                    </Link>
                  ) : (
                    <div key={i} className={cls}>
                      {body}
                    </div>
                  )
                })}
              </div>
            </li>
          )
        })}
      </ol>
      <p className="muted small" style={{ textAlign: 'center' }}>
        Todas as provas: <Link to="/provas">ver lista</Link>
      </p>
    </div>
  )
}
