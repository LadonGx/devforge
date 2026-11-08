import type { Pattern } from '../../types'
import { PROBLEMS_LESSON } from './problems'
import { CONCEPT_LESSONS } from './concepts'
import { RAG_LESSONS } from './rag'

/** Aulas do treino iFood (IFOOD.units). Cada seção lista as suas em `lessons`. */
export const IFOOD_LESSONS: Pattern[] = [PROBLEMS_LESSON, ...RAG_LESSONS, ...CONCEPT_LESSONS]
