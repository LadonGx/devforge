import { describe, expect, it } from 'vitest'
import {
  REFUSAL,
  buildPrompt,
  buildTfIdf,
  chunk,
  cosineSimilarity,
  embedQuery,
  extractiveAnswer,
  parseContext,
  tokenize,
  topK,
} from './core'
import { citations, isRefusal, verifyRagAnswer } from './verify'
import { executeTests } from '../../engine/exec'
import { compareResult } from '../../engine/compare'
import type { WorkerRequest } from '../../engine/types'

const POLICY = [
  'O cancelamento é grátis até o restaurante aceitar o pedido. Depois disso, a taxa é de 50% do valor.',
  'O reembolso no cartão leva até 7 dias úteis. No Pix, cai em até 1 hora.',
  'A entrega grátis vale para pedidos acima de R$ 40 em restaurantes parceiros.',
]
const CONTEXT = POLICY.map((t, i) => `[${i + 1}] ${t}`).join('\n')

describe('tokenize', () => {
  it('tira acento, maiúsculas, pontuação e stopwords', () => {
    expect(tokenize('O Reembolso no cartão é rápido!')).toEqual(['reembolso', 'cartao', 'rapido'])
  })
  it('texto vazio dá lista vazia', () => {
    expect(tokenize('')).toEqual([])
  })
})

describe('chunk', () => {
  it('janelas de tamanho fixo com sobreposição', () => {
    expect(chunk('a b c d e f g', 3, 1)).toEqual(['a b c', 'c d e', 'e f g'])
  })
  it('última janela menor quando o texto não fecha', () => {
    expect(chunk('a b c d e', 3, 0)).toEqual(['a b c', 'd e'])
  })
  it('para quando a janela alcança o fim (sem pedaço repetido)', () => {
    expect(chunk('a b c d', 3, 2)).toEqual(['a b c', 'b c d'])
  })
  it('texto vazio ou só espaços', () => {
    expect(chunk('   ', 3, 1)).toEqual([])
  })
  it('overlap inválido é erro', () => {
    expect(() => chunk('a b', 2, 2)).toThrow(RangeError)
  })
})

describe('cosineSimilarity e topK', () => {
  it('mesma direção = 1, ortogonal = 0, oposto = -1', () => {
    expect(cosineSimilarity([1, 2], [2, 4])).toBeCloseTo(1)
    expect(cosineSimilarity([1, 0], [0, 3])).toBeCloseTo(0)
    expect(cosineSimilarity([1, 1], [-1, -1])).toBeCloseTo(-1)
  })
  it('vetor nulo dá 0 (sem dividir por zero)', () => {
    expect(cosineSimilarity([0, 0], [1, 1])).toBe(0)
  })
  it('tamanhos diferentes é erro', () => {
    expect(() => cosineSimilarity([1], [1, 2])).toThrow(RangeError)
  })
  it('ordena do mais parecido para o menos, empate pelo menor índice, e corta em k', () => {
    const r = topK([1, 0], [[0, 1], [1, 0], [2, 0], [1, 1]], 3)
    expect(r.map((x) => x.index)).toEqual([1, 2, 3])
    expect(topK([1, 0], [[1, 0]], 5)).toHaveLength(1)
  })
})

describe('TF-IDF', () => {
  it('a pergunta fica mais perto do trecho que fala do assunto', () => {
    const m = buildTfIdf(POLICY)
    const [best] = topK(embedQuery(m, 'Quanto tempo demora o reembolso no Pix?'), m.vectors, 1)
    expect(best.index).toBe(1)
    expect(best.score).toBeGreaterThan(0.2)
  })
  it('termo presente em todos os documentos pesa menos que um termo raro', () => {
    const m = buildTfIdf(['pedido pizza', 'pedido sushi', 'pedido lanche'])
    expect(m.idf[m.index.get('pedido')!]).toBeLessThan(m.idf[m.index.get('pizza')!])
  })
  it('pergunta sem nenhuma palavra do vocabulário vira vetor nulo', () => {
    const m = buildTfIdf(POLICY)
    expect(embedQuery(m, 'xyz abc').every((x) => x === 0)).toBe(true)
  })
})

describe('buildPrompt e parseContext', () => {
  it('numera os trechos, traz as regras e a pergunta', () => {
    const p = buildPrompt('Qual o prazo do reembolso?', [{ id: 2, text: POLICY[1] }])
    expect(p).toContain('[2] O reembolso')
    expect(p).toContain('APENAS o contexto')
    expect(p).toContain(REFUSAL)
    expect(p.trim().endsWith('Pergunta: Qual o prazo do reembolso?')).toBe(true)
  })
  it('lê o contexto numerado de volta', () => {
    expect(parseContext(CONTEXT)).toEqual(POLICY.map((text, i) => ({ id: i + 1, text })))
  })
})

describe('extractiveAnswer (linha de base sem LLM)', () => {
  const passages = parseContext(CONTEXT)
  it('responde com a frase certa e cita o trecho', () => {
    const a = extractiveAnswer(passages, 'Em quanto tempo o reembolso cai no Pix?')
    expect(a.response).toContain('1 hora')
    expect(a.response).toContain('[2]')
  })
  it('recusa quando nenhum trecho fala do assunto', () => {
    const a = extractiveAnswer(passages, 'Vocês aceitam pagamento em dinheiro?')
    expect(a.response).toBe(REFUSAL)
  })
  it('passa no próprio verificador', () => {
    const ok = extractiveAnswer(passages, 'Qual o valor mínimo para entrega grátis?')
    expect(verifyRagAnswer(ok, { answerable: true, facts: ['R$ 40'], sources: [3] }).pass).toBe(true)
  })
})

describe('verifyRagAnswer (verificador de RAG)', () => {
  const exp = { answerable: true, facts: ['7 dias úteis'], sources: [2] }

  it('aprova resposta com o fato e a fonte certa', () => {
    const v = verifyRagAnswer({ reasoning: 'O trecho [2] fala de reembolso.', response: 'Leva até 7 dias uteis no cartão [2].' }, exp)
    expect(v.pass).toBe(true)
    expect(v.checks.map((c) => c.id)).toEqual(['format', 'facts', 'source', 'no-refusal'])
  })

  it('compara fatos sem acento e sem maiúsculas', () => {
    expect(verifyRagAnswer({ reasoning: 'r', response: 'ATÉ 7 DIAS ÚTEIS [2]' }, exp).pass).toBe(true)
  })

  it('reprova sem citar a fonte, e diz qual citar', () => {
    const v = verifyRagAnswer({ reasoning: 'r', response: 'Leva até 7 dias úteis.' }, exp)
    expect(v.pass).toBe(false)
    const src = v.checks.find((c) => c.id === 'source')!
    expect(src.pass).toBe(false)
    expect(src.detail).toContain('[2]')
  })

  it('a citação pode estar no reasoning', () => {
    expect(verifyRagAnswer({ reasoning: 'Usei o trecho [2].', response: '7 dias úteis.' }, exp).pass).toBe(true)
  })

  it('citar um trecho que não tem a resposta não conta', () => {
    expect(verifyRagAnswer({ reasoning: 'r', response: '7 dias úteis [1]' }, exp).pass).toBe(false)
  })

  it('reprova quando falta o fato (resposta inventada ou genérica)', () => {
    const v = verifyRagAnswer({ reasoning: 'r', response: 'Leva alguns dias [2].' }, exp)
    expect(v.checks.find((c) => c.id === 'facts')!.detail).toContain('7 dias úteis')
  })

  it('reprova a recusa quando a resposta estava no contexto', () => {
    const v = verifyRagAnswer({ reasoning: 'r', response: `${REFUSAL} 7 dias úteis [2]` }, exp)
    expect(v.checks.find((c) => c.id === 'no-refusal')!.pass).toBe(false)
  })

  it('aprova a recusa quando o contexto não responde', () => {
    const v = verifyRagAnswer({ reasoning: 'Nenhum trecho fala disso.', response: 'Não encontrei essa informação no contexto.' }, { answerable: false })
    expect(v.pass).toBe(true)
  })

  it('reprova quem inventa resposta (ou cita trecho) sem a informação no contexto', () => {
    const inventou = verifyRagAnswer({ reasoning: 'r', response: 'Sim, aceitamos vale-refeição [1].' }, { answerable: false })
    expect(inventou.pass).toBe(false)
    expect(inventou.checks.map((c) => c.pass)).toEqual([true, false, false])
    const recusaCitando = verifyRagAnswer({ reasoning: 'r', response: 'Não encontrei essa informação no contexto [1].' }, { answerable: false })
    expect(recusaCitando.checks.find((c) => c.id === 'no-citation')!.pass).toBe(false)
  })

  it('formato errado para em um critério só', () => {
    for (const got of [null, 'texto', { response: 'x' }, { reasoning: '', response: 'x' }]) {
      const v = verifyRagAnswer(got, exp)
      expect(v.pass).toBe(false)
      expect(v.checks).toHaveLength(1)
    }
  })

  it('reconhece variações de recusa e de citação', () => {
    expect(isRefusal('O contexto não menciona isso.')).toBe(true)
    expect(isRefusal('Não há informação sobre isso.')).toBe(true)
    expect(isRefusal('Leva 7 dias.')).toBe(false)
    expect(citations('veja [1, 3] e [2][4]').sort()).toEqual([1, 2, 3, 4])
  })
})

describe("modo de comparação 'rag' no executor de testes", () => {
  const code = `function answerQuestion(input) {
  return input.question.includes('Pix')
    ? { reasoning: 'trecho 2', response: 'Cai em até 1 hora [2].' }
    : { reasoning: 'nada', response: 'Não encontrei essa informação no contexto.' }
}`
  const tests = [
    { input: [{ context: CONTEXT, question: 'Reembolso no Pix?' }], expected: { answerable: true, facts: ['1 hora'], sources: [2] } },
    { input: [{ context: CONTEXT, question: 'Aceita vale?' }], expected: { answerable: false } },
    { input: [{ context: CONTEXT, question: 'Prazo no cartão?' }], expected: { answerable: true, facts: ['7 dias'], sources: [2] } },
  ]

  it('compareResult usa o verificador', () => {
    expect(compareResult({ reasoning: 'r', response: '1 hora [2]' }, tests[0].expected, 'rag')).toBe(true)
    expect(compareResult({ reasoning: 'r', response: '1 hora' }, tests[0].expected, 'rag')).toBe(false)
    // expected que não é uma expectativa de RAG nunca passa
    expect(compareResult({ reasoning: 'r', response: 'x' }, 'x', 'rag')).toBe(false)
  })

  it('cada resultado traz os critérios avaliados', async () => {
    const req = { kind: 'test', code, fnName: 'answerQuestion', tests, compare: 'rag' } as Extract<WorkerRequest, { kind: 'test' }>
    const res = await executeTests(req, { reset() {}, take: () => [] })
    if (res.kind !== 'test') throw new Error('tipo inesperado')
    expect(res.results.map((r) => r.pass)).toEqual([true, true, false])
    const wrong = res.results[2].checks!
    expect(wrong.find((c) => !c.pass)?.label).toMatch(/Usa o contexto|Indica/)
    expect(res.results[0].checks!.every((c) => c.pass)).toBe(true)
  })
})
