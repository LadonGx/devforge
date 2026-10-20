import type { CompareMode, IOSpec, TestCase } from '../engine/types'

export type Difficulty = 'Fácil' | 'Médio' | 'Difícil'

/** Blocos de conteúdo das aulas. `md` aceita um markdown simples. */
export type Block =
  | { type: 'text'; md: string }
  | { type: 'code'; code: string; caption?: string }
  | { type: 'callout'; tone: 'tip' | 'warn' | 'info'; title?: string; md: string }
  | { type: 'signals'; title?: string; items: string[] }
  | { type: 'demo'; title: string; code: string; fnName: string; input: unknown[]; caption?: string; io?: IOSpec }
  | { type: 'compare'; left: { title: string; md: string }; right: { title: string; md: string } }
  | { type: 'quiz'; question: string; code?: string; options: string[]; answer: number; explain: string }
  | { type: 'coercion'; title?: string }
  | { type: 'pipeline'; title: string; caption?: string; input: unknown[]; stages: PipelineStage[] }

export interface PipelineStage {
  op: 'map' | 'filter' | 'reduce' | 'find' | 'some' | 'every' | 'sort'
  /** código mostrado na tela, ex.: "x => x * 2" */
  code: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (...args: any[]) => unknown
  initial?: unknown
}

export interface Problem {
  id: string
  title: string
  difficulty: Difficulty
  pattern: string
  /** referência ao problema original do LeetCode (opcional) */
  leetcode?: { number: number; slug: string }
  fnName: string
  params: string[]
  description: string
  examples: { input: string; output: string; explanation?: string }[]
  constraints: string[]
  starter: { js: string; ts: string }
  tests: TestCase[]
  compare?: CompareMode
  /** conversão de entradas/saídas (ListNode, TreeNode, design de classe) */
  io?: IOSpec
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

/** Um curso = módulo com aulas (unidades) e exercícios práticos. */
export interface Course {
  id: string // mesmo id do módulo na vitrine
  title: string
  basePath: string // ex.: '/leetcode', '/js'
  unitSegment: string // ex.: 'padrao', 'aula'
  unitLabel: string // ex.: 'Padrão', 'Aula'
  volumeLabel: string
  intro: string
  how: { title: string; text: string }[]
  units: Pattern[]
  problems: Problem[]
  /** id da unidade → título da parte que começa nela */
  parts?: Record<string, string>
  soonNote?: string
}
