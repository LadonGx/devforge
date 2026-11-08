import type { Problem } from '../../types'
import { BASIC_PROBLEMS } from './basics'
import { ADVANCED_PROBLEMS } from './advanced'

/** Um problema da seção 1 com o tema do HackerRank que ele treina (ex.: "Arrays", "Hash map"). */
export interface IfoodProblemEntry {
  topic: string
  problem: Problem
}

/** Seção 1: problemas no formato HackerRank, na ordem de prioridade dos temas. */
export const IFOOD_PROBLEM_LIST: IfoodProblemEntry[] = [...BASIC_PROBLEMS, ...ADVANCED_PROBLEMS]

export const IFOOD_PROBLEMS: Problem[] = IFOOD_PROBLEM_LIST.map((e) => e.problem)
export const PROBLEM_IDS = IFOOD_PROBLEMS.map((p) => p.id)
