// ---------- Valores serializados (snapshot de qualquer valor JS) ----------
export type V =
  | { t: 'n'; v: number }
  | { t: 's'; v: string }
  | { t: 'b'; v: boolean }
  | { t: 'null' }
  | { t: 'u' }
  | { t: 'big'; v: string }
  | { t: 'sym'; v: string }
  | { t: 'fn'; name: string }
  | { t: 'arr'; id: number; items: V[]; len: number }
  | { t: 'map'; id: number; entries: [V, V][]; size: number }
  | { t: 'set'; id: number; items: V[]; size: number }
  | { t: 'obj'; id: number; cls: string; entries: [string, V][] }
  | { t: 'promise'; id: number }
  | { t: 'list'; id: number; nodes: { id: number; val: V }[]; cycleTo?: number; more?: boolean }
  | { t: 'tree'; id: number; root: TNode; count: number }
  | { t: 'cycle'; id: number }
  | { t: 'deep' }

export interface TNode {
  id: number
  val: V
  left: TNode | null
  right: TNode | null
  cut?: boolean // filhos omitidos (limite de profundidade)
}

export type Lang = 'js' | 'ts'

/** Como converter entradas/saídas de um problema (formato LeetCode). */
export type ArgType = 'raw' | 'list' | 'tree' | 'cycleList'
export interface IOSpec {
  args?: ArgType[]
  ret?: 'raw' | 'list' | 'tree'
  /** problema de "design": fnName é uma classe (ou 'factory': função que retorna o objeto); input = [ops, args] */
  design?: boolean | 'factory'
  /**
   * Código JS de uma função `(fnDoUsuario, ...entrada) => resultado` que monta o teste.
   * Serve para testar funções de alta ordem, closures, imutabilidade etc.
   */
  harness?: string
}

/** Uma chamada de função registrada durante o trace (para a árvore de chamadas). */
export interface CallNode {
  id: number
  parent: number | null
  name: string
  args: string
  start: number
  end?: number
  ret?: string
}

// ---------- Trace (execução passo a passo) ----------
export interface FrameSnap {
  id: number
  name: string
  params: string[]
  vars: [string, V][]
}

export interface Step {
  line: number
  kind: 'line' | 'return' | 'call'
  stack: FrameSnap[] // [0] = mais externo
  ret?: V
  logs: number // quantidade de logs emitidos até aqui
}

export interface TraceResult {
  steps: Step[]
  calls?: CallNode[]
  logs: string[]
  returnValue?: V
  error?: RunError
  truncated: boolean
}

export interface RunError {
  message: string
  name: string
  line?: number
}

// ---------- Testes ----------
export type CompareMode = 'exact' | 'unordered' | 'unorderedNested' | 'float'

export interface TestCase {
  input: unknown[]
  expected: unknown
  label?: string
  hidden?: boolean
}

export interface TestResult {
  pass: boolean
  got?: V
  error?: RunError
  logs: string[]
  ms: number
}

export interface PerfResult {
  userMs?: number
  refMs?: number
  error?: RunError
  timeout?: boolean
}

// ---------- Mensagens com o worker ----------
export type WorkerRequest =
  | { kind: 'test'; code: string; fnName: string; tests: { input: unknown[]; expected: unknown }[]; compare: CompareMode; io?: IOSpec }
  | { kind: 'trace'; code: string; fnName: string; input: unknown[]; io?: IOSpec }
  | { kind: 'perf'; code: string; refCode: string; fnName: string; gen: string; n: number; io?: IOSpec }

export type WorkerResponse =
  | { kind: 'test'; results: TestResult[]; fatal?: RunError }
  | { kind: 'trace'; result: TraceResult }
  | { kind: 'perf'; result: PerfResult }
