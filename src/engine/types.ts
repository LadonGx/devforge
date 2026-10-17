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
  | { t: 'cycle'; id: number }
  | { t: 'deep' }

export type Lang = 'js' | 'ts'

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
  | { kind: 'test'; code: string; fnName: string; tests: { input: unknown[]; expected: unknown }[]; compare: CompareMode }
  | { kind: 'trace'; code: string; fnName: string; input: unknown[] }
  | { kind: 'perf'; code: string; refCode: string; fnName: string; gen: string; n: number }

export type WorkerResponse =
  | { kind: 'test'; results: TestResult[]; fatal?: RunError }
  | { kind: 'trace'; result: TraceResult }
  | { kind: 'perf'; result: PerfResult }
