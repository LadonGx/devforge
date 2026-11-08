import { useEffect, useMemo, useState } from 'react'
import { CodeBlock } from '../Markdown'
import { REFUSAL, buildPrompt, buildTfIdf, chunk, cosineSimilarity, embedQuery, tokenize, type Passage } from '../../lib/rag/core'
import { citations, isRefusal } from '../../lib/rag/verify'
import { EMBEDDING_MODELS, loadEmbedder } from '../../lib/rag/embeddings'
import { clearGroq, groqChat, groqModels, loadGroq, maskKey, parseModelAnswer, saveGroq, type GroqConfig } from '../../lib/rag/groq'

/** Documento de exemplo: a "pasta de políticas" do suporte de um app de delivery. */
export const RAG_SAMPLE_DOC = `Cancelamento: o cancelamento é grátis até o restaurante aceitar o pedido. Depois que o restaurante aceita, é cobrada uma taxa de 50% do valor dos itens. Pedidos que já saíram para entrega não podem ser cancelados pelo app.

Reembolso: quando o pedido é cancelado ou chega com problema, o reembolso volta para a mesma forma de pagamento. No Pix, o dinheiro cai em até 1 hora. No cartão de crédito, o estorno aparece na fatura em até 7 dias úteis.

Entrega grátis: vale para pedidos acima de R$ 40 em restaurantes parceiros, num raio de até 5 km. Pedidos abaixo desse valor pagam a taxa de entrega mostrada no carrinho.

Cupons: só um cupom pode ser usado por pedido. Cupons não cobrem a taxa de entrega e expiram na data mostrada na carteira do app.

Atraso: se o pedido atrasar mais de 30 minutos além da previsão, o cliente recebe um cupom de R$ 10 para a próxima compra.`

const PRESETS: { q: string; note: string }[] = [
  { q: 'Em quanto tempo o reembolso cai no Pix?', note: 'está no documento' },
  { q: 'Posso usar dois cupons no mesmo pedido?', note: 'está no documento' },
  { q: 'Qual o horário de atendimento do suporte?', note: 'não está no documento: o certo é recusar' },
  { q: 'Vocês aceitam vale-refeição?', note: 'armadilha do TF-IDF: "vale" casa com "vale para pedidos"' },
]

const DEFAULT_THRESHOLD = { tfidf: 0.1, model: 0.45 }

type Mode = 'tfidf' | 'model'
type ModelState = { status: 'idle' } | { status: 'loading'; pct: number } | { status: 'ready' } | { status: 'error'; message: string }

interface Props {
  title: string
  caption?: string
  question?: string
}

const fmt = (x: number) => x.toFixed(2)

/** Laboratório do pipeline de RAG: documento → chunks → vetores → scores → top-k → prompt → resposta. */
export function RagLab({ title, caption, question: initialQuestion }: Props) {
  const [doc, setDoc] = useState(RAG_SAMPLE_DOC)
  const [size, setSize] = useState(30)
  const [overlap, setOverlap] = useState(6)
  const [k, setK] = useState(2)
  const [question, setQuestion] = useState(initialQuestion ?? PRESETS[0].q)
  const [mode, setMode] = useState<Mode>('tfidf')
  const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD.tfidf)
  const [modelId, setModelId] = useState(EMBEDDING_MODELS[0].id)
  const [modelState, setModelState] = useState<ModelState>({ status: 'idle' })
  const [modelVecs, setModelVecs] = useState<{ key: string; chunks: number[][]; query: number[] } | null>(null)

  const chunks = useMemo(() => chunk(doc, size, Math.min(overlap, size - 1)), [doc, size, overlap])
  const tfidf = useMemo(() => buildTfIdf(chunks), [chunks])
  const vecKey = `${modelId}|${chunks.join('\u0001')}|${question}`

  // embeddings de modelo: recalcula quando o documento, os chunks ou a pergunta mudam
  useEffect(() => {
    if (mode !== 'model' || modelState.status !== 'ready' || modelVecs?.key === vecKey) return
    let alive = true
    const id = setTimeout(async () => {
      try {
        const embed = await loadEmbedder(modelId)
        const out = await embed([...chunks, question])
        if (alive) setModelVecs({ key: vecKey, chunks: out.slice(0, -1), query: out[out.length - 1] })
      } catch (e) {
        if (alive) setModelState({ status: 'error', message: e instanceof Error ? e.message : String(e) })
      }
    }, 250)
    return () => {
      alive = false
      clearTimeout(id)
    }
  }, [mode, modelState.status, modelId, chunks, question, vecKey, modelVecs?.key])

  const scored = useMemo(() => {
    let query: number[]
    let vectors: number[][]
    if (mode === 'model') {
      if (!modelVecs || modelVecs.key !== vecKey) return null
      query = modelVecs.query
      vectors = modelVecs.chunks
    } else {
      query = embedQuery(tfidf, question)
      vectors = tfidf.vectors
    }
    return vectors.map((v, index) => ({ index, score: cosineSimilarity(query, v) }))
  }, [mode, modelVecs, vecKey, tfidf, question])

  const ranked = scored ? [...scored].sort((a, b) => b.score - a.score || a.index - b.index) : []
  const top = ranked.slice(0, k)
  const best = top[0]
  const shouldRefuse = !best || best.score < threshold
  // o prompt leva os trechos do top-k que passam no limiar (abaixo dele, o contexto vai vazio)
  const passages: Passage[] = top.filter((s) => s.score >= threshold).map((s) => ({ id: s.index + 1, text: chunks[s.index] }))
  const prompt = buildPrompt(question, passages)

  const extractive = (() => {
    if (shouldRefuse || !best) {
      return {
        reasoning: `O melhor trecho teve similaridade ${best ? fmt(best.score) : '0'}, abaixo do limiar ${fmt(threshold)}: nenhum trecho fala disso.`,
        response: REFUSAL,
      }
    }
    const text = chunks[best.index]
    const q = new Set(tokenize(question))
    const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean)
    let pick = sentences[0] ?? text
    let hits = -1
    for (const s of sentences) {
      const h = tokenize(s).filter((t) => q.has(t)).length
      if (h > hits) {
        hits = h
        pick = s
      }
    }
    return {
      reasoning: `O trecho [${best.index + 1}] é o mais parecido com a pergunta (${fmt(best.score)}); escolhi a frase dele que mais repete os termos da pergunta.`,
      response: `${pick.trim()} [${best.index + 1}]`,
    }
  })()

  const switchMode = (m: Mode) => {
    setMode(m)
    setThreshold(DEFAULT_THRESHOLD[m])
  }

  const loadModel = async () => {
    setModelState({ status: 'loading', pct: 0 })
    try {
      await loadEmbedder(modelId, (pct) => setModelState({ status: 'loading', pct }))
      setModelState({ status: 'ready' })
    } catch (e) {
      setModelState({ status: 'error', message: e instanceof Error ? e.message : String(e) })
    }
  }

  return (
    <div className="raglab">
      <div className="lab-head">
        <span className="badge badge-accent">Laboratório</span>
        <strong>{title}</strong>
      </div>
      {caption && <p className="muted small" style={{ margin: '0 0 10px' }}>{caption}</p>}

      {/* 1. documento e chunking */}
      <section className="raglab-step">
        <h4>
          <span className="raglab-num">1</span> Documento e chunks
        </h4>
        <textarea className="raglab-doc" value={doc} onChange={(e) => setDoc(e.target.value)} rows={5} aria-label="Documento" spellCheck={false} />
        <div className="raglab-controls">
          <label>
            Tamanho do chunk: <strong>{size} palavras</strong>
            <input type="range" min={8} max={80} value={size} onChange={(e) => setSize(Number(e.target.value))} aria-label="Tamanho do chunk" />
          </label>
          <label>
            Overlap: <strong>{Math.min(overlap, size - 1)} palavras</strong>
            <input type="range" min={0} max={Math.min(20, size - 1)} value={Math.min(overlap, size - 1)} onChange={(e) => setOverlap(Number(e.target.value))} aria-label="Overlap" />
          </label>
          {doc !== RAG_SAMPLE_DOC && (
            <button className="btn btn-sm btn-ghost" onClick={() => setDoc(RAG_SAMPLE_DOC)}>
              Restaurar o documento
            </button>
          )}
        </div>
        <p className="muted small">
          {chunks.length} chunks. As palavras destacadas no começo de cada um são o overlap: repetem o fim do chunk anterior, para uma frase cortada na
          fronteira não se perder.
        </p>
        <ol className="raglab-chunks">
          {chunks.map((c, i) => {
            const words = c.split(' ')
            const ov = i === 0 ? 0 : Math.min(overlap, size - 1)
            const isTop = top.some((t) => t.index === i)
            return (
              <li key={i} className={'raglab-chunk' + (isTop ? ' is-top' : '')} data-chunk={i + 1}>
                <span className="raglab-chunk-id">[{i + 1}]</span>
                <span>
                  {ov > 0 && <mark className="raglab-overlap">{words.slice(0, ov).join(' ')}</mark>} {words.slice(ov).join(' ')}
                </span>
              </li>
            )
          })}
        </ol>
      </section>

      {/* 2. embeddings */}
      <section className="raglab-step">
        <h4>
          <span className="raglab-num">2</span> Embeddings: texto vira vetor
        </h4>
        <div className="seg" role="tablist" aria-label="Tipo de embedding">
          <button role="tab" aria-selected={mode === 'tfidf'} className={mode === 'tfidf' ? 'active' : ''} onClick={() => switchMode('tfidf')}>
            TF-IDF (no navegador)
          </button>
          <button role="tab" aria-selected={mode === 'model'} className={mode === 'model' ? 'active' : ''} onClick={() => switchMode('model')}>
            Modelo de embeddings (opcional)
          </button>
        </div>
        {mode === 'tfidf' ? (
          <>
            <p className="muted small">
              Vocabulário com {tfidf.vocab.length} palavras: cada chunk vira um vetor desse tamanho. Os termos de maior peso de cada um (tf × idf):
            </p>
            <div className="raglab-terms">
              {tfidf.vectors.map((v, i) => {
                const terms = v
                  .map((w, j) => ({ term: tfidf.vocab[j], w }))
                  .filter((t) => t.w > 0)
                  .sort((a, b) => b.w - a.w)
                  .slice(0, 4)
                const max = terms[0]?.w || 1
                return (
                  <div key={i} className="raglab-term-row">
                    <span className="raglab-chunk-id">[{i + 1}]</span>
                    {terms.map((t) => (
                      <span key={t.term} className="raglab-term" style={{ '--w': t.w / max } as React.CSSProperties} title={t.w.toFixed(3)}>
                        {t.term}
                      </span>
                    ))}
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <div className="raglab-model">
            <p className="muted small">
              Um modelo de embeddings transforma o texto num vetor de 384 números que representa o <em>sentido</em>, não só as palavras. Roda neste
              navegador com o transformers.js; o modelo é baixado uma vez e fica no cache.
            </p>
            <div className="raglab-controls">
              <label>
                Modelo
                <select value={modelId} onChange={(e) => { setModelId(e.target.value); setModelState({ status: 'idle' }) }} disabled={modelState.status === 'loading'}>
                  {EMBEDDING_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label} · {m.size} · {m.note}
                    </option>
                  ))}
                </select>
              </label>
              {modelState.status !== 'ready' && (
                <button className="btn btn-sm btn-primary" onClick={loadModel} disabled={modelState.status === 'loading'}>
                  {modelState.status === 'loading' ? `Baixando… ${Math.round(modelState.pct * 100)}%` : 'Baixar e usar o modelo'}
                </button>
              )}
            </div>
            {modelState.status === 'error' && <div className="callout callout-warn small">Não consegui carregar o modelo: {modelState.message}</div>}
            {modelState.status === 'ready' && !scored && <div className="loading">Calculando os vetores…</div>}
          </div>
        )}
      </section>

      {/* 3. busca */}
      <section className="raglab-step">
        <h4>
          <span className="raglab-num">3</span> Pergunta e busca (cosseno + top-k)
        </h4>
        <input className="raglab-question" value={question} onChange={(e) => setQuestion(e.target.value)} aria-label="Pergunta" />
        <div className="raglab-presets">
          {PRESETS.map((p) => (
            <button key={p.q} className={'raglab-preset' + (p.q === question ? ' is-on' : '')} onClick={() => setQuestion(p.q)} title={p.note}>
              {p.q}
            </button>
          ))}
        </div>
        {PRESETS.find((p) => p.q === question) && <p className="muted small">↳ {PRESETS.find((p) => p.q === question)!.note}</p>}
        <div className="raglab-controls">
          <label>
            k (trechos no prompt): <strong>{k}</strong>
            <input type="range" min={1} max={Math.max(1, Math.min(5, chunks.length))} value={Math.min(k, Math.max(1, chunks.length))} onChange={(e) => setK(Number(e.target.value))} aria-label="k" />
          </label>
          <label>
            Limiar para recusar: <strong>{fmt(threshold)}</strong>
            <input type="range" min={0} max={0.9} step={0.01} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} aria-label="Limiar" />
          </label>
        </div>
        {scored ? (
          <ol className="raglab-scores" aria-label="Similaridade de cada chunk">
            {ranked.map((s, pos) => (
              <li key={s.index} className={(pos < k ? 'is-top' : '') + (s.score < threshold ? ' is-below' : '')}>
                <span className="raglab-chunk-id">[{s.index + 1}]</span>
                <span className="raglab-bar">
                  <span className="raglab-bar-fill" style={{ width: `${Math.max(0, s.score) * 100}%` }} />
                  <span className="raglab-bar-threshold" style={{ left: `${threshold * 100}%` }} />
                </span>
                <span className="raglab-score">{fmt(s.score)}</span>
              </li>
            ))}
          </ol>
        ) : (
          mode === 'model' && <p className="muted small">Baixe o modelo acima para ver os scores.</p>
        )}
        {scored && (
          <p className={'small ' + (shouldRefuse ? 'raglab-warn' : 'muted')}>
            {shouldRefuse
              ? `O melhor score (${best ? fmt(best.score) : '0'}) está abaixo do limiar: nenhum trecho fala disso, então o certo é recusar.`
              : `Os ${top.length} melhores (top-${k}) vão para o prompt, menos os que ficaram abaixo do limiar.`}
          </p>
        )}
      </section>

      {/* 4. prompt */}
      <section className="raglab-step">
        <h4>
          <span className="raglab-num">4</span> Prompt montado
        </h4>
        <CodeBlock code={prompt} />
      </section>

      {/* 5. resposta */}
      <section className="raglab-step">
        <h4>
          <span className="raglab-num">5</span> Resposta
        </h4>
        <div className="raglab-answers">
          <AnswerCard title="Sem LLM (extrativa)" note="a frase do melhor trecho, com a citação; é a ideia da solução do exercício no formato HackerRank" answer={extractive} />
          <GroqPanel prompt={prompt} allowed={passages.map((p) => p.id)} shouldRefuse={shouldRefuse} />
        </div>
      </section>
    </div>
  )
}

function AnswerCard({ title, note, answer, checks }: { title: string; note?: string; answer: { reasoning: string; response: string }; checks?: { label: string; pass: boolean }[] }) {
  return (
    <div className="card raglab-answer">
      <strong>{title}</strong>
      {note && <p className="muted small" style={{ margin: '2px 0 8px' }}>{note}</p>}
      <div className="raglab-field">
        <span className="io-title">reasoning</span>
        <p>{answer.reasoning || <em className="muted">(vazio)</em>}</p>
      </div>
      <div className="raglab-field">
        <span className="io-title">response</span>
        <p className="raglab-response">{answer.response}</p>
      </div>
      {checks && (
        <ul className="rag-checks">
          {checks.map((c) => (
            <li key={c.label} className={c.pass ? 'is-ok' : 'is-bad'}>
              <span className="rag-check-icon">{c.pass ? '✓' : '✗'}</span>
              <span>{c.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** Geração opcional com o Groq. A chave fica só no localStorage deste navegador. */
function GroqPanel({ prompt, allowed, shouldRefuse }: { prompt: string; allowed: number[]; shouldRefuse: boolean }) {
  const [cfg, setCfg] = useState<GroqConfig>(() => loadGroq())
  const [draft, setDraft] = useState('')
  const [models, setModels] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [answer, setAnswer] = useState<{ reasoning: string; response: string; prompt: string } | null>(null)

  if (!cfg.apiKey) {
    return (
      <div className="card raglab-answer">
        <strong>Com LLM (Groq, opcional)</strong>
        <p className="muted small" style={{ margin: '2px 0 8px' }}>
          Cole a sua chave do Groq (crie em console.groq.com/keys). Ela fica <strong>só neste navegador</strong>, no localStorage, e é enviada apenas
          para a API do Groq. Não entra no código nem no progresso exportado.
        </p>
        <form
          className="row"
          onSubmit={(e) => {
            e.preventDefault()
            if (!draft.trim()) return
            const next = { ...cfg, apiKey: draft.trim() }
            saveGroq(next)
            setCfg(next)
            setDraft('')
          }}
        >
          <input type="password" className="raglab-key" placeholder="gsk_..." value={draft} onChange={(e) => setDraft(e.target.value)} aria-label="Chave do Groq" autoComplete="off" />
          <button className="btn btn-sm btn-primary" type="submit" disabled={!draft.trim()}>
            Salvar neste navegador
          </button>
        </form>
      </div>
    )
  }

  const generate = async () => {
    setBusy(true)
    setError('')
    try {
      const text = await groqChat(cfg, prompt)
      setAnswer({ ...parseModelAnswer(text), prompt })
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  const checks = answer
    ? (() => {
        const cited = [...new Set([...citations(answer.response), ...citations(answer.reasoning)])]
        const refused = isRefusal(answer.response)
        return shouldRefuse
          ? [
              { label: 'Recusou (nenhum trecho passou no limiar)', pass: refused },
              { label: 'Não citou trecho', pass: citations(answer.response).length === 0 },
            ]
          : [
              { label: 'Não recusou (havia contexto)', pass: !refused },
              { label: 'Citou um trecho com [n]', pass: cited.length > 0 },
              { label: 'Só citou trechos que estavam no prompt', pass: cited.length > 0 && cited.every((n) => allowed.includes(n)) },
            ]
      })()
    : undefined

  return (
    <div className="raglab-groq">
      <div className="row raglab-groq-head">
        <span className="small">
          Chave {maskKey(cfg.apiKey)} · modelo
        </span>
        <input
          className="raglab-model-input"
          list="groq-models"
          value={cfg.model}
          onChange={(e) => setCfg({ ...cfg, model: e.target.value })}
          onBlur={() => saveGroq(cfg)}
          aria-label="Modelo do Groq"
        />
        <datalist id="groq-models">
          {models.map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>
        <button
          className="btn btn-sm btn-ghost"
          onClick={async () => {
            try {
              setModels(await groqModels(cfg.apiKey))
            } catch (e) {
              setError(e instanceof Error ? e.message : String(e))
            }
          }}
        >
          Listar modelos
        </button>
        <button
          className="btn btn-sm btn-ghost"
          onClick={() => {
            clearGroq()
            setCfg(loadGroq())
            setAnswer(null)
          }}
        >
          Esquecer a chave
        </button>
      </div>
      <button className="btn btn-sm btn-primary" onClick={generate} disabled={busy}>
        {busy ? 'Gerando…' : 'Gerar resposta com o Groq'}
      </button>
      {error && <div className="callout callout-warn small">{error}</div>}
      {answer && (
        <>
          <AnswerCard title="Com LLM (Groq)" answer={answer} checks={checks} />
          {answer.prompt !== prompt && <p className="muted small">O prompt mudou desde esta resposta: gere de novo para comparar.</p>}
        </>
      )}
    </div>
  )
}
