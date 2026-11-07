import type { ComponentType } from 'react'
import { Link, useParams } from 'react-router-dom'
import { IFOOD, IFOOD_SECTIONS, ifoodSection, ifoodSectionPath, type IfoodSectionId } from '../../content/ifood'
import { useProgress } from '../../lib/progress'
import { sectionProgress } from '../../lib/ifood'
import { Markdown } from '../../components/Markdown'
import { ConceptsView } from './ConceptsView'

/** Conteúdo de cada seção. Cada fase do módulo registra a sua aqui; sem registro, a página mostra o que está planejado. */
const SECTION_VIEWS: Partial<Record<IfoodSectionId, ComponentType>> = {
  conceitos: ConceptsView,
}

export function IfoodSectionPage() {
  const { section } = useParams()
  const s = useProgress()
  const sec = section ? ifoodSection(section) : undefined
  if (!sec) {
    return (
      <div className="empty-state">
        <h2>Seção não encontrada</h2>
        <Link to={IFOOD.basePath}>Voltar para o treino</Link>
      </div>
    )
  }
  const idx = IFOOD_SECTIONS.indexOf(sec)
  const prev = IFOOD_SECTIONS[idx - 1]
  const next = IFOOD_SECTIONS[idx + 1]
  const p = sectionProgress(sec.id, s)
  const View = SECTION_VIEWS[sec.id]

  return (
    <div>
      <div className="breadcrumb">
        <Link to="/">Vitrine</Link> / <Link to={IFOOD.basePath}>{IFOOD.title}</Link> / <span>{sec.title}</span>
      </div>
      <div className="row" style={{ marginBottom: 8 }}>
        <span className="module-icon">{sec.icon}</span>
        <h1 style={{ margin: 0 }}>{sec.title}</h1>
      </div>
      <div className="row" style={{ marginBottom: 16 }}>
        <span className="badge">Seção {idx + 1}</span>
        {p.empty ? (
          <span className="badge badge-soon">Em construção</span>
        ) : (
          <span className="badge badge-ok">
            {p.done}/{p.total} concluídos
          </span>
        )}
      </div>
      <p className="text-2" style={{ maxWidth: 760 }}>
        {sec.summary}
      </p>
      <div className="callout callout-interview" style={{ maxWidth: 760 }}>
        <div className="callout-title">Como cai no teste</div>
        <Markdown md={sec.inTest} />
      </div>

      {View ? (
        <View />
      ) : (
        <div className="card" style={{ marginTop: 20, maxWidth: 760 }}>
          <h3>O que vai ter aqui</h3>
          <ol className="planned">
            {sec.planned.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>
          <p className="muted small" style={{ marginBottom: 0 }}>
            Esta seção está em construção.
          </p>
        </div>
      )}

      <nav className="ifood-section-nav">
        {prev ? (
          <Link to={ifoodSectionPath(prev.id)} className="card ifood-section-link">
            <span className="muted small">← Seção anterior</span>
            <strong>{prev.title}</strong>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={ifoodSectionPath(next.id)} className="card ifood-section-link is-next">
            <span className="muted small">Próxima seção →</span>
            <strong>{next.title}</strong>
          </Link>
        ) : (
          <Link to={IFOOD.basePath} className="card ifood-section-link is-next">
            <span className="muted small">Fim das seções</span>
            <strong>Voltar para o treino</strong>
          </Link>
        )}
      </nav>
    </div>
  )
}
