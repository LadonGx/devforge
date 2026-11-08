/**
 * Geração opcional com o Groq (API compatível com a da OpenAI), chamada direto do navegador.
 *
 * A chave é do aluno e fica **só neste navegador** (localStorage, numa chave separada do progresso,
 * então não vai junto se o progresso for exportado). Nada disso entra no código nem no repositório.
 */
const STORAGE_KEY = 'devforge:groq:v1'
const BASE = 'https://api.groq.com/openai/v1'
export const DEFAULT_GROQ_MODEL = 'llama-3.3-70b-versatile'

export interface GroqConfig {
  apiKey: string
  model: string
}

export function loadGroq(): GroqConfig {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as Partial<GroqConfig>
    return { apiKey: raw.apiKey ?? '', model: raw.model || DEFAULT_GROQ_MODEL }
  } catch {
    return { apiKey: '', model: DEFAULT_GROQ_MODEL }
  }
}

export function saveGroq(cfg: GroqConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ apiKey: cfg.apiKey.trim(), model: cfg.model.trim() || DEFAULT_GROQ_MODEL }))
}

export function clearGroq() {
  localStorage.removeItem(STORAGE_KEY)
}

/** Mostra só o começo e o fim da chave. */
export const maskKey = (k: string) => (k.length <= 8 ? '••••' : `${k.slice(0, 4)}••••${k.slice(-4)}`)

async function call<T>(path: string, apiKey: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(BASE + path, {
    ...init,
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  })
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`
    try {
      const body = (await res.json()) as { error?: { message?: string } }
      if (body.error?.message) msg += `: ${body.error.message}`
    } catch {
      /* corpo sem JSON */
    }
    if (res.status === 401) msg += ' (confira a chave)'
    if (res.status === 429) msg += ' (limite de uso; espere um pouco)'
    throw new Error(msg)
  }
  return (await res.json()) as T
}

/** Modelos de chat disponíveis para a chave (para o aluno escolher; a lista do Groq muda com o tempo). */
export async function groqModels(apiKey: string): Promise<string[]> {
  const r = await call<{ data: { id: string }[] }>('/models', apiKey)
  return r.data
    .map((m) => m.id)
    .filter((id) => !/whisper|tts|guard|embed/i.test(id))
    .sort()
}

/** Instrução extra: responder no formato do HackerRank. */
export const JSON_INSTRUCTION =
  'Responda somente com um JSON no formato {"reasoning": "...", "response": "..."}: em reasoning, diga qual trecho usou e por quê; em response, a resposta curta com a citação.'

export async function groqChat(cfg: GroqConfig, prompt: string, signal?: AbortSignal): Promise<string> {
  const r = await call<{ choices: { message: { content: string } }[] }>('/chat/completions', cfg.apiKey, {
    method: 'POST',
    signal,
    body: JSON.stringify({
      model: cfg.model || DEFAULT_GROQ_MODEL,
      temperature: 0,
      messages: [
        { role: 'system', content: JSON_INSTRUCTION },
        { role: 'user', content: prompt },
      ],
    }),
  })
  return r.choices[0]?.message?.content ?? ''
}

/** Lê `{ reasoning, response }` do texto do modelo (às vezes vem com ```json ou texto em volta). */
export function parseModelAnswer(text: string): { reasoning: string; response: string } {
  const m = /\{[^]*\}/.exec(text)
  if (m) {
    try {
      const o = JSON.parse(m[0]) as Record<string, unknown>
      if (typeof o.response === 'string') return { reasoning: typeof o.reasoning === 'string' ? o.reasoning : '', response: o.response }
    } catch {
      /* não era JSON válido */
    }
  }
  return { reasoning: '', response: text.trim() }
}
