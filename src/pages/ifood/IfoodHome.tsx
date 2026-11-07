import { Link } from 'react-router-dom'
import { HACKERRANK_TOPICS, IFOOD_SECTIONS, TEST_FORMATS, ifoodSectionPath } from '../../content/ifood'
import { useProgress } from '../../lib/progress'
import { ifoodProgress, sectionProgress } from '../../lib/ifood'
import { Markdown } from '../../components/Markdown'

export function IfoodHome() {
  const s = useProgress()
  const mp = ifoodProgress(s)
  return (
    <div>
      <div className="breadcrumb">
        <Link to="/">Vitrine</Link> / <span>Processos seletivos</span>
      </div>
      <div className="lc-head">
        <div>
          <h1>Treinamento iFood GenAI · Desafio Técnico</h1>
          <p className="text-2 course-intro">
            Preparação para a <strong>etapa 3</strong> do Programa GenAI 2027 do iFood, trilha <strong>AI Engineer</strong>. Pelos relatos de
            candidatos, é um teste no <strong>HackerRank</strong>, com a tela gravada, que mistura questões de alternativa e questões 100% de código
            sobre <strong>SQL</strong>, <strong>lógica estilo LeetCode</strong>, <strong>API</strong> e <strong>conceitos de computação</strong>. Um
            candidato também relatou uma questão de <strong>implementar um RAG</strong>.
          </p>
        </div>
        <div className="lc-progress card">
          <div className="muted small">Progresso do treino</div>
          <div className="lc-progress-num">{mp.pct}%</div>
          <div className="progress-bar">
            <span style={{ width: mp.pct + '%' }} />
          </div>
          <div className="muted small">
            {mp.done} de {mp.items} itens
          </div>
        </div>
      </div>

      <div className="ifood-about">
        <section className="card">
          <h2 className="ifood-card-title">O formato da prova</h2>
          <p className="text-2 small">
            O formato relatado coincide com a certificação <strong>Software Engineer</strong> do próprio HackerRank. As certificações de cada tema
            servem de referência de tempo:
          </p>
          <ul className="ifood-formats">
            {TEST_FORMATS.map((f) => (
              <li key={f.title} className={f.main ? 'is-main' : ''}>
                <strong>{f.title}</strong>
                <span className="muted small">{f.detail}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="card">
          <h2 className="ifood-card-title">O que mais cai</h2>
          <p className="text-2 small">
            Temas mais cobrados pelas empresas, segundo o Interview Preparation Kit do HackerRank. Os problemas deste treino seguem essa ordem.
          </p>
          <ul className="ifood-bars">
            {HACKERRANK_TOPICS.map((t) => (
              <li key={t.label}>
                <span className="ifood-bar-label">{t.label}</span>
                <span className="ifood-bar">
                  <span style={{ width: t.pct + '%' }} />
                </span>
                <span className="ifood-bar-pct">{t.pct}%</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="section-head" style={{ marginTop: 28 }}>
        <div>
          <h2>Seções</h2>
          <p className="muted section-desc">
            Faça na ordem que quiser. A <Link to="/trilhas#ifood">trilha do desafio</Link> sugere uma sequência.
          </p>
        </div>
      </div>
      <div className="module-grid">
        {IFOOD_SECTIONS.map((sec, i) => {
          const p = sectionProgress(sec.id, s)
          return (
            <Link key={sec.id} to={ifoodSectionPath(sec.id)} className={'module-card card ifood-section-card' + (p.empty ? ' is-soon' : ' is-available')}>
              <div className="module-top">
                <span className="module-icon">{sec.icon}</span>
                <div className="module-badges">
                  <span className="badge">Seção {i + 1}</span>
                  {p.empty ? <span className="badge badge-soon">Em construção</span> : <span className="badge badge-ok">Disponível</span>}
                </div>
              </div>
              <h3>{sec.title}</h3>
              <p className="text-2 module-summary">{sec.short}</p>
              <div className="chips">
                {sec.topics.slice(0, 5).map((t) => (
                  <span key={t} className="chip">
                    {t}
                  </span>
                ))}
                {sec.topics.length > 5 && <span className="chip chip-more">+{sec.topics.length - 5}</span>}
              </div>
              {!p.empty && (
                <div className="module-progress">
                  <div className="progress-bar">
                    <span style={{ width: p.pct + '%' }} />
                  </div>
                  <span className="muted small">
                    {p.done}/{p.total}
                  </span>
                </div>
              )}
            </Link>
          )
        })}
      </div>

      <div className="callout callout-warn" style={{ marginTop: 28 }}>
        <div className="callout-title">No teste real</div>
        <Markdown md="A tela é **gravada** e não se pode usar IA nem consultar nada. Use o **simulado** para treinar nessas condições: cronômetro, sem dicas e sem ver a solução até o fim. A nota mínima aqui é só indicativa e não bloqueia nada." />
      </div>
    </div>
  )
}
