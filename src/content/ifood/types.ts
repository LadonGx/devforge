/* Tipos do Treinamento iFood GenAI. */

/** Temas do banco de questões conceituais (seção 4). */
export type ConceptTheme = 'complexidade' | 'grafos' | 'ordenacao' | 'banco' | 'http' | 'ia'

/**
 * Questão de múltipla escolha com explicação da certa e de cada errada.
 * Os textos aceitam o markdown simples do projeto (`código`, **negrito**).
 */
export interface ConceptQuestion {
  /** único no banco todo, em kebab-case, prefixado pelo tema (ex.: "grafos-bfs-menor-caminho") */
  id: string
  theme: ConceptTheme
  prompt: string
  /** trecho de código opcional mostrado abaixo do enunciado (JS/TS ou SQL) */
  code?: string
  /** 4 alternativas */
  options: string[]
  /** índice da certa em `options` (a tela embaralha a ordem) */
  answer: number
  /** por que a certa está certa */
  explain: string
  /** por que cada alternativa está errada, na mesma ordem de `options`; na posição da certa, '' */
  whyWrong: string[]
  /**
   * Onde revisar no DevForge: "curso:aula" (ex.: "leetcode:graphs") ou "ifood:<seção>" (ex.: "ifood:sql").
   * Sem isso, vale o `review` do tema.
   */
  review?: string
}
