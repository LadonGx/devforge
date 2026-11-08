/**
 * Verificador de respostas de RAG (formato do HackerRank: `{ reasoning, response }`).
 *
 * Não compara texto exato: confere os critérios que importam numa resposta com contexto.
 * 1. formato: os dois campos existem e não estão vazios;
 * 2. usa o contexto: os fatos esperados aparecem na resposta;
 * 3. indica a fonte: cita, como [n], um dos trechos que têm a resposta;
 * 4. recusa quando deve: sem a informação no contexto, diz que não encontrou e não cita nada.
 *
 * Roda no worker (é usado pelo compareResult no modo 'rag'), então não depende do DOM.
 */

/** O que o teste espera da resposta. Vai como `expected` do caso de teste. */
export interface RagExpectation {
  /** o contexto tem a resposta? */
  answerable: boolean
  /** trechos curtos que precisam aparecer na resposta (comparados sem acento e sem maiúsculas) */
  facts?: string[]
  /** números dos trechos que têm a resposta: citar qualquer um deles vale */
  sources?: number[]
}

export interface RagCheck {
  id: 'format' | 'facts' | 'source' | 'no-refusal' | 'refusal' | 'no-citation'
  label: string
  pass: boolean
  detail?: string
}

export interface RagVerdict {
  pass: boolean
  checks: RagCheck[]
}

export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, ' ')
    .trim()

/** Formas de dizer "não está no contexto" que contam como recusa (já normalizadas). */
export const REFUSAL_MARKERS = [
  'nao encontrei',
  'nao ha informacao',
  'nao tenho informacao',
  'nao esta no contexto',
  'nao consta no contexto',
  'o contexto nao informa',
  'o contexto nao menciona',
]

export const isRefusal = (response: string) => {
  const r = normalize(response)
  return REFUSAL_MARKERS.some((m) => r.includes(m))
}

/** Números citados como [n] (também aceita [1, 3] e [1][3]). */
export function citations(text: string): number[] {
  const out = new Set<number>()
  for (const m of text.matchAll(/\[(\d+(?:\s*,\s*\d+)*)\]/g)) {
    for (const n of m[1].split(',')) out.add(Number(n.trim()))
  }
  return [...out]
}

export function isRagExpectation(x: unknown): x is RagExpectation {
  return !!x && typeof x === 'object' && typeof (x as RagExpectation).answerable === 'boolean'
}

export function verifyRagAnswer(got: unknown, exp: RagExpectation): RagVerdict {
  const o = (got && typeof got === 'object' ? got : {}) as Record<string, unknown>
  const okFormat =
    typeof o.reasoning === 'string' && o.reasoning.trim() !== '' && typeof o.response === 'string' && o.response.trim() !== ''
  const checks: RagCheck[] = [
    {
      id: 'format',
      label: 'Devolve { reasoning, response } preenchidos',
      pass: okFormat,
      detail: okFormat ? undefined : 'os dois campos precisam ser strings não vazias',
    },
  ]
  if (!okFormat) return { pass: false, checks }

  const response = o.response as string
  const reasoning = o.reasoning as string
  const cited = citations(response)
  const refused = isRefusal(response)

  if (exp.answerable) {
    const r = normalize(response)
    const missing = (exp.facts ?? []).filter((f) => !r.includes(normalize(f)))
    checks.push({
      id: 'facts',
      label: 'Usa o contexto (a resposta traz a informação)',
      pass: missing.length === 0,
      detail: missing.length ? `faltou: ${missing.map((f) => `"${f}"`).join(', ')}` : undefined,
    })
    const sources = exp.sources ?? []
    const citedAll = new Set([...cited, ...citations(reasoning)])
    const okSource = sources.length === 0 ? citedAll.size > 0 : sources.some((s) => citedAll.has(s))
    checks.push({
      id: 'source',
      label: 'Indica de qual trecho veio',
      pass: okSource,
      detail: okSource ? undefined : `cite ${sources.length ? sources.map((s) => `[${s}]`).join(' ou ') : 'o trecho usado, como [1]'}`,
    })
    checks.push({
      id: 'no-refusal',
      label: 'Não recusa quando a resposta está no contexto',
      pass: !refused,
      detail: refused ? 'o contexto tem a resposta' : undefined,
    })
  } else {
    checks.push({
      id: 'refusal',
      label: 'Recusa: diz que a informação não está no contexto',
      pass: refused,
      detail: refused ? undefined : 'o contexto não responde essa pergunta; diga, por exemplo, "Não encontrei essa informação no contexto."',
    })
    checks.push({
      id: 'no-citation',
      label: 'Não cita trecho numa recusa',
      pass: cited.length === 0,
      detail: cited.length ? `citou ${cited.map((n) => `[${n}]`).join(' ')}, mas nenhum trecho responde` : undefined,
    })
  }
  return { pass: checks.every((c) => c.pass), checks }
}
