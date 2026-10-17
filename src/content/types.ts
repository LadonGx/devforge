import type { CompareMode, TestCase } from '../engine/types'

export type Difficulty = 'Fácil' | 'Médio' | 'Difícil'

/** Blocos de conteúdo das aulas. `md` aceita um markdown simples. */
export type Block =
  | { type: 'text'; md: string }
  | { type: 'code'; code: string; caption?: string }
  | { type: 'callout'; tone: 'tip' | 'warn' | 'info'; title?: string; md: string }
  | { type: 'signals'; title?: string; items: string[] }
  | { type: 'demo'; title: string; code: string; fnName: string; input: unknown[]; caption?: string }
  | { type: 'compare'; left: { title: string; md: string }; right: { title: string; md: string } }

export interface Problem {
  id: string
  title: string
  difficulty: Difficulty
  pattern: string
  leetcode: { number: number; slug: string }
  fnName: string
  params: string[]
  description: string
  examples: { input: string; output: string; explanation?: string }[]
  constraints: string[]
  starter: { js: string; ts: string }
  tests: TestCase[]
  compare?: CompareMode
  hints: string[]
  explanation: {
    intuition: string
    steps: string[]
    time: string
    space: string
    complexityWhy: string
    pitfalls: string[]
  }
  bruteForce?: { idea: string; complexity: string }
  solution: { js: string; ts: string }
  perf?: { gen: (n: number) => unknown[]; n: number; limitMs: number; label: string }
}

export interface Pattern {
  id: string
  title: string
  short: string
  summary: string
  color: string
  lesson: Block[]
  problems: string[]
}

export type ModuleStatus = 'available' | 'soon'

export interface ModuleInfo {
  id: string
  title: string
  volume: string
  summary: string
  topics: string[]
  status: ModuleStatus
  route?: string
  icon: string
  level: 'Base' | 'Intermediário' | 'Avançado'
}

export interface TrailStep {
  module: string
  ref?: string // id de aula/padrão dentro do módulo
  label: string
}

export interface Trail {
  id: string
  title: string
  summary: string
  steps: TrailStep[]
}
