import { Link } from 'react-router-dom'
import { IFOOD } from '../../content/ifood'
import { RAG_PROBLEM_LIST } from '../../content/ifood/problems'
import { problemPath } from '../../content/courses'
import { useProgress } from '../../lib/progress'
import { DifficultyBadge } from '../../components/DifficultyBadge'
import { RagLab } from '../../components/widgets/RagLab'

/** Seção 2: laboratório do pipeline + exercícios na ordem das etapas (o último é o formato HackerRank). */
export function RagView() {
  const s = useProgress()
  return (
    <div className="ifood-problems">
      <h2>Laboratório</h2>
      <p className="muted small">
        Mexa no documento, no tamanho do chunk, no k e no limiar e veja o que muda em cada etapa. O TF-IDF roda aqui mesmo; os embeddings de modelo e
        a geração com o Groq são opcionais.
      </p>
      <RagLab title="Pipeline de RAG com a política de um app de delivery" />

      <h2>Exercícios</h2>
      {RAG_PROBLEM_LIST.length === 0 ? (
        <div className="card muted">Os exercícios desta seção estão sendo escritos.</div>
      ) : (
        <>
          <p className="muted small">
            Você implementa cada etapa do pipeline em TypeScript (ou JavaScript). O último junta tudo no formato do HackerRank: recebe{' '}
            <code>{'{ context, question }'}</code> e devolve <code>{'{ reasoning, response }'}</code>, avaliado pelo uso do contexto, pela citação da
            fonte e pela recusa quando a informação não está lá.
          </p>
          <ol className="practice-list">
            {RAG_PROBLEM_LIST.map(({ topic, problem: p }, i) => {
              const solved = !!s.solved[p.id]
              const hidden = p.tests.filter((t) => t.hidden).length
              return (
                <li key={p.id}>
                  <Link to={problemPath(IFOOD, p.id)} className={'practice-item card' + (solved ? ' is-done' : '')}>
                    <span className="practice-num">{solved ? '✓' : i + 1}</span>
                    <div className="practice-body">
                      <strong>{p.title}</strong>
                      <span className="muted small">
                        {topic} · <code>{p.fnName}()</code> · {p.tests.length - hidden} visíveis + {hidden} ocultos
                      </span>
                    </div>
                    {!solved && s.attempted[p.id] && <span className="badge">Em andamento</span>}
                    <DifficultyBadge d={p.difficulty} />
                  </Link>
                </li>
              )
            })}
          </ol>
        </>
      )}
    </div>
  )
}
