import { IFOOD_SECTIONS, type IfoodSectionId } from '../content/ifood'
import { CONCEPTS } from '../content/ifood/concepts'
import type { ProgressState } from './progress'

export interface SectionProgress {
  done: number
  total: number
  pct: number
  /** a seção ainda não tem conteúdo */
  empty: boolean
}

const pctOf = (done: number, total: number) => (total === 0 ? 0 : Math.round((done / total) * 100))

/**
 * Itens de cada seção (feitos / total). Cada fase do módulo preenche a sua seção;
 * enquanto ela não tem conteúdo, o total é 0 e ela aparece como "em construção".
 */
function sectionItems(id: IfoodSectionId, s: ProgressState): { done: number; total: number } {
  switch (id) {
    case 'conceitos':
      // conta a questão como feita quando a última resposta foi a certa
      return { done: CONCEPTS.filter((q) => s.concepts[q.id]?.right).length, total: CONCEPTS.length }
    default:
      return { done: 0, total: 0 }
  }
}

export function sectionProgress(id: IfoodSectionId, s: ProgressState): SectionProgress {
  const { done, total } = sectionItems(id, s)
  return { done, total, pct: pctOf(done, total), empty: total === 0 }
}

export function ifoodProgress(s: ProgressState) {
  let done = 0
  let items = 0
  for (const sec of IFOOD_SECTIONS) {
    const p = sectionItems(sec.id, s)
    done += p.done
    items += p.total
  }
  return { pct: pctOf(done, items), done, items }
}
