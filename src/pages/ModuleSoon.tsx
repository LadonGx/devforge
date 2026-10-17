import { Link, useParams } from 'react-router-dom'
import { MODULES, VOLUMES } from '../content/modules'

export function ModuleSoon() {
  const { id } = useParams()
  const m = MODULES.find((x) => x.id === id)
  if (!m) {
    return (
      <div className="empty-state">
        <h2>Módulo não encontrado</h2>
        <Link to="/">Voltar para a vitrine</Link>
      </div>
    )
  }
  const vol = VOLUMES.find((v) => v.id === m.volume)
  return (
    <div style={{ maxWidth: 760 }}>
      <div className="breadcrumb">
        <Link to="/">Vitrine</Link> / <span>{vol?.title}</span>
      </div>
      <div className="row" style={{ marginBottom: 8 }}>
        <span className="module-icon">{m.icon}</span>
        <h1 style={{ margin: 0 }}>{m.title}</h1>
      </div>
      <div className="row" style={{ marginBottom: 16 }}>
        <span className="badge">{m.level}</span>
        <span className="badge badge-soon">Em construção</span>
      </div>
      <p className="text-2">{m.summary}</p>
      <div className="card" style={{ marginTop: 20 }}>
        <h3>Conteúdo planejado</h3>
        <ol className="planned">
          {m.topics.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ol>
        <p className="muted small" style={{ marginBottom: 0 }}>
          Cada tópico terá explicação por partes, visualização e exercícios com testes, igual ao módulo LeetCode.
        </p>
      </div>
      <p style={{ marginTop: 20 }}>
        Enquanto isso, que tal treinar algoritmos? <Link to="/leetcode">Abrir o módulo LeetCode →</Link>
      </p>
    </div>
  )
}
