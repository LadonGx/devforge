import type { ConceptQuestion } from '../types'
import { CONCEPT_THEMES } from './themes'

/** quanto a alternativa certa pode ser maior que a maior errada (diferenças de até 12 caracteres não contam: "O(log n)" × "O(n)") */
export const MAX_ANSWER_LENGTH_RATIO = 1.25

/**
 * Confere o formato do banco de questões. Devolve a lista de problemas encontrados (vazia = ok).
 * `resolveReview` diz se uma referência "curso:aula" / "ifood:<seção>" existe.
 */
export function checkConcepts(questions: ConceptQuestion[], resolveReview: (ref: string) => boolean): string[] {
  const errors: string[] = []
  const ids = new Set<string>()
  const themes = new Set(CONCEPT_THEMES.map((t) => t.id))
  for (const q of questions) {
    const at = `[${q.id}]`
    if (ids.has(q.id)) errors.push(`${at} id duplicado`)
    ids.add(q.id)
    if (!themes.has(q.theme)) errors.push(`${at} tema inexistente: ${q.theme}`)
    else if (!q.id.startsWith(q.theme + '-')) errors.push(`${at} o id deve começar com "${q.theme}-"`)
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(q.id)) errors.push(`${at} id deve ser kebab-case sem acentos`)
    if (!q.prompt.trim()) errors.push(`${at} enunciado vazio`)
    if (q.options.length !== 4) errors.push(`${at} deve ter 4 alternativas (tem ${q.options.length})`)
    if (new Set(q.options.map((o) => o.trim().toLowerCase())).size !== q.options.length) errors.push(`${at} alternativas repetidas`)
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) errors.push(`${at} answer fora das alternativas`)
    if (q.options.length > 1 && q.answer >= 0 && q.answer < q.options.length) {
      // a certa não pode se destacar pelo tamanho: isso entrega a resposta sem saber o conteúdo
      const right = q.options[q.answer].length
      const longestWrong = Math.max(...q.options.filter((_, i) => i !== q.answer).map((o) => o.length))
      if (right > longestWrong * MAX_ANSWER_LENGTH_RATIO && right - longestWrong > 12)
        errors.push(`${at} a alternativa certa é ${(right / longestWrong).toFixed(2)}× a maior errada (máx. ${MAX_ANSWER_LENGTH_RATIO}): encurte a certa (o detalhe vai no explain) ou deixe as erradas tão completas quanto ela`)
    }
    if (!q.explain.trim()) errors.push(`${at} explain vazio`)
    if (q.whyWrong.length !== q.options.length) errors.push(`${at} whyWrong deve ter ${q.options.length} itens (tem ${q.whyWrong.length})`)
    q.whyWrong.forEach((w, i) => {
      if (i === q.answer && w.trim() !== '') errors.push(`${at} whyWrong[${i}] é a resposta certa e deve ser ''`)
      if (i !== q.answer && !w.trim()) errors.push(`${at} whyWrong[${i}] vazio: explique por que essa alternativa está errada`)
    })
    if (q.review !== undefined && !resolveReview(q.review)) errors.push(`${at} review inexistente: ${q.review}`)
  }
  return errors
}
