import type { ConceptTheme } from '../types'

export interface ConceptThemeInfo {
  id: ConceptTheme
  title: string
  /** o que o tema cobre, em uma linha */
  covers: string
  /** onde revisar por padrão ("curso:aula" ou "ifood:<seção>") */
  review: string
}

export const CONCEPT_THEMES: ConceptThemeInfo[] = [
  { id: 'complexidade', title: 'Big O e estruturas de dados', covers: 'Complexidade de tempo e espaço; pilha, fila, hash, árvore, heap e grafo.', review: 'leetcode:arrays-hashing' },
  { id: 'grafos', title: 'Grafos', covers: 'BFS, DFS, caminho mínimo e ciclos.', review: 'leetcode:graphs' },
  { id: 'ordenacao', title: 'Ordenação e busca binária', covers: 'Algoritmos de ordenação, estabilidade e busca binária.', review: 'leetcode:binary-search' },
  { id: 'banco', title: 'Banco de dados', covers: 'Índices, transações (ACID) e normalização.', review: 'ifood:sql' },
  { id: 'http', title: 'HTTP e REST', covers: 'Métodos, status codes e idempotência.', review: 'ifood:api' },
  { id: 'ia', title: 'IA aplicada', covers: 'Tokens, temperatura, embeddings, RAG, alucinação e prompt injection.', review: 'ifood:rag' },
]

export const conceptTheme = (id: ConceptTheme) => CONCEPT_THEMES.find((t) => t.id === id)!
