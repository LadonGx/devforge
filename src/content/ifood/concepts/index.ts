import type { ConceptQuestion, ConceptTheme } from '../types'
import { COMPLEXITY_QUESTIONS } from './complexity'
import { GRAPH_QUESTIONS } from './graphs'
import { SORTING_QUESTIONS } from './sorting'
import { DATABASE_QUESTIONS } from './database'
import { HTTP_QUESTIONS } from './http'
import { AI_QUESTIONS } from './ai'

export { CONCEPT_THEMES, conceptTheme } from './themes'

/** Banco de questões conceituais (seção 4), na ordem dos temas. */
export const CONCEPTS: ConceptQuestion[] = [
  ...COMPLEXITY_QUESTIONS,
  ...GRAPH_QUESTIONS,
  ...SORTING_QUESTIONS,
  ...DATABASE_QUESTIONS,
  ...HTTP_QUESTIONS,
  ...AI_QUESTIONS,
]

export const conceptById = (id: string) => CONCEPTS.find((q) => q.id === id)
export const conceptsOf = (theme: ConceptTheme) => CONCEPTS.filter((q) => q.theme === theme)
