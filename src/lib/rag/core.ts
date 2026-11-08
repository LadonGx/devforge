/**
 * Pipeline de RAG de referência, sem dependências: é o que o laboratório da seção 2 usa
 * e o que os exercícios pedem para o aluno implementar (as assinaturas batem).
 *
 * documento → chunk() → tokenize() → TF-IDF → cosineSimilarity() → topK() → buildPrompt()
 */

/** Palavras muito comuns em PT-BR que não ajudam a diferenciar trechos. */
export const STOPWORDS = new Set(
  (
    'a o as os um uma uns umas de do da dos das em no na nos nas por pelo pela pelos pelas para pra com sem ' +
    'e ou mas que se como ao aos à às é ser são foi era está estão tem têm ter há meu minha seu sua seus suas ' +
    'eu você voce ele ela nós eles elas isso isto esse essa este esta lhe me te nos já não nao sim mais menos muito ' +
    'qual quais quando onde quanto quanta quantos quantas porque pois então entao também tambem só so ' +
    'até após entre sobre num numa dele dela deles delas'
  )
    .split(' ')
    .map((w) => w.normalize('NFD').replace(/\p{M}/gu, '')),
)

/** Minúsculas, sem acento, separado em palavras (letras e números), sem stopwords e sem palavras de 1 letra. */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
}

/**
 * Divide o texto em janelas de `size` palavras; cada janela repete as `overlap` últimas palavras da anterior.
 * Para quando a janela chega ao fim do texto. Texto vazio devolve [].
 */
export function chunk(text: string, size: number, overlap: number): string[] {
  if (size <= 0 || overlap < 0 || overlap >= size) throw new RangeError('use 0 ≤ overlap < size')
  const words = text.split(/\s+/).filter(Boolean)
  const out: string[] = []
  const step = size - overlap
  for (let i = 0; i < words.length; i += step) {
    out.push(words.slice(i, i + size).join(' '))
    if (i + size >= words.length) break
  }
  return out
}

export interface TfIdfModel {
  vocab: string[]
  /** índice de cada termo em `vocab` */
  index: Map<string, number>
  idf: number[]
  /** um vetor por documento (chunk), na ordem de `vocab` */
  vectors: number[][]
}

/** idf suavizado: ln((N + 1) / (df + 1)) + 1, para nenhum termo ter peso zero. */
export function buildTfIdf(docs: string[]): TfIdfModel {
  const tokens = docs.map(tokenize)
  const vocab = [...new Set(tokens.flat())].sort()
  const index = new Map(vocab.map((t, i) => [t, i]))
  const df = new Array<number>(vocab.length).fill(0)
  for (const doc of tokens) for (const t of new Set(doc)) df[index.get(t)!]++
  const n = docs.length
  const idf = df.map((d) => Math.log((n + 1) / (d + 1)) + 1)
  const vectors = tokens.map((doc) => vectorize(doc, index, idf))
  return { vocab, index, idf, vectors }
}

function vectorize(doc: string[], index: Map<string, number>, idf: number[]): number[] {
  const v = new Array<number>(idf.length).fill(0)
  if (doc.length === 0) return v
  for (const t of doc) {
    const i = index.get(t)
    if (i !== undefined) v[i] += 1
  }
  // tf = contagem / tamanho do documento
  return v.map((c, i) => (c / doc.length) * idf[i])
}

/** Vetor da pergunta no mesmo espaço dos chunks. Palavras fora do vocabulário são ignoradas. */
export function embedQuery(model: TfIdfModel, text: string): number[] {
  return vectorize(tokenize(text), model.index, model.idf)
}

/** cos(θ) = (a · b) / (|a| · |b|). Vetor nulo dá 0 (não há direção para comparar). */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) throw new RangeError('os vetores precisam ter o mesmo tamanho')
  let dot = 0
  let na = 0
  let nb = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  if (na === 0 || nb === 0) return 0
  return dot / (Math.sqrt(na) * Math.sqrt(nb))
}

export interface Scored {
  index: number
  score: number
}

/** Os `k` vetores mais parecidos com a pergunta, do maior score para o menor (empate: menor índice primeiro). */
export function topK(query: number[], vectors: number[][], k: number): Scored[] {
  return vectors
    .map((v, index) => ({ index, score: cosineSimilarity(query, v) }))
    .sort((x, y) => y.score - x.score || x.index - y.index)
    .slice(0, Math.max(0, k))
}

/** Frase padrão de recusa: o prompt pede exatamente esta frase quando o contexto não responde. */
export const REFUSAL = 'Não encontrei essa informação no contexto.'

export interface Passage {
  /** número do trecho, começando em 1 (é o que a resposta cita: [1], [2]...) */
  id: number
  text: string
}

/** Monta o prompt: regras (só o contexto, citar a fonte, recusar), os trechos numerados e a pergunta. */
export function buildPrompt(question: string, passages: Passage[]): string {
  const context = passages.map((p) => `[${p.id}] ${p.text}`).join('\n')
  return [
    'Você é o assistente de suporte de um app de delivery.',
    'Responda usando APENAS o contexto abaixo.',
    'Cite o trecho de onde veio cada informação, com o número entre colchetes, como [2].',
    `Se a resposta não estiver no contexto, responda exatamente: "${REFUSAL}"`,
    '',
    'Contexto:',
    context || '(vazio)',
    '',
    `Pergunta: ${question}`,
  ].join('\n')
}

/** Lê um contexto no formato "[1] texto\n[2] texto" (o do exercício no formato HackerRank). */
export function parseContext(context: string): Passage[] {
  const out: Passage[] = []
  const re = /\[(\d+)\]\s*([^]*?)(?=\n?\[\d+\]|$)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(context))) {
    const text = m[2].trim()
    if (text) out.push({ id: Number(m[1]), text })
  }
  return out
}

export interface RagAnswer {
  reasoning: string
  response: string
}

/**
 * Resposta extrativa, sem LLM: acha o trecho mais parecido com a pergunta e devolve a frase dele
 * que mais compartilha palavras com ela, citando o trecho. Abaixo do limiar, recusa.
 * Serve de linha de base no laboratório e é a ideia da solução do exercício no formato HackerRank.
 */
export function extractiveAnswer(passages: Passage[], question: string, threshold = 0.1): RagAnswer & { best?: Scored } {
  if (passages.length === 0) return { reasoning: 'O contexto está vazio.', response: REFUSAL }
  const model = buildTfIdf(passages.map((p) => p.text))
  const [best] = topK(embedQuery(model, question), model.vectors, 1)
  const q = new Set(tokenize(question))
  if (!best || best.score < threshold) {
    const s = best ? best.score.toFixed(2) : '0'
    return {
      reasoning: `Nenhum trecho fala do assunto da pergunta: a maior similaridade foi ${s}, abaixo do limiar ${threshold}.`,
      response: REFUSAL,
      best,
    }
  }
  const passage = passages[best.index]
  const sentences = passage.text.split(/(?<=[.!?])\s+/).filter(Boolean)
  let sentence = sentences[0] ?? passage.text
  let bestHits = -1
  for (const s of sentences) {
    const hits = tokenize(s).filter((t) => q.has(t)).length
    if (hits > bestHits) {
      bestHits = hits
      sentence = s
    }
  }
  return {
    reasoning: `O trecho [${passage.id}] é o mais parecido com a pergunta (similaridade ${best.score.toFixed(2)}), e a frase escolhida é a que mais repete os termos dela.`,
    response: `${sentence.trim()} [${passage.id}]`,
    best,
  }
}
