import type { Problem } from '../../types'
import { BASIC_PROBLEMS } from './basics'
import { ADVANCED_PROBLEMS } from './advanced'
import { RAG_PROBLEM_LIST } from './rag'

/** Um problema do treino com o tema que ele treina (ex.: "Arrays", "Hash map", "Embeddings"). */
export interface IfoodProblemEntry {
  topic: string
  problem: Problem
}

/** Seção 1: problemas no formato HackerRank, na ordem de prioridade dos temas. */
export const IFOOD_PROBLEM_LIST: IfoodProblemEntry[] = [...BASIC_PROBLEMS, ...ADVANCED_PROBLEMS]

/** Seção 2: exercícios de RAG, na ordem do pipeline (o último é o formato HackerRank). */
export { RAG_PROBLEM_LIST }

/** Todos os exercícios de código do treino (rota /ifood/p/:id). */
export const IFOOD_PROBLEMS: Problem[] = [...IFOOD_PROBLEM_LIST, ...RAG_PROBLEM_LIST].map((e) => e.problem)
export const PROBLEM_IDS = IFOOD_PROBLEM_LIST.map((e) => e.problem.id)
export const RAG_PROBLEM_IDS = RAG_PROBLEM_LIST.map((e) => e.problem.id)
