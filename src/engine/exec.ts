/**
 * Núcleo do executor de testes: compila o código do aluno, roda cada caso e compara com o esperado.
 * Não depende do Web Worker (roda igual no Node), então é coberto por testes unitários (exec.test.ts).
 * O runner.worker.ts usa estas funções; o limite de tempo fica no runner.ts (o worker é encerrado).
 */
import { serialize } from './serialize'
import { compareResult } from './compare'
import { GLOBALS, buildArgs, convertResult, runDesign } from './ds'
import type { IOSpec, RunError, TestResult, WorkerRequest, WorkerResponse } from './types'

const LINE_OFFSET = 2 // `new Function` adiciona 2 linhas antes do código

export function toRunError(e: unknown): RunError {
  if (e instanceof Error) {
    const m = /(?:<anonymous>|Function|eval):(\d+):\d+/.exec(e.stack || '')
    const line = m ? Number(m[1]) - LINE_OFFSET : undefined
    return { message: e.message, name: e.name, line: line && line > 0 ? line : undefined }
  }
  return { message: String(e), name: 'Error' }
}

const GLOBAL_NAMES = Object.keys(GLOBALS)
const GLOBAL_VALUES = Object.values(GLOBALS)

/**
 * Compila o código do usuário. As estruturas (ListNode, TreeNode, MinHeap...) ficam num escopo
 * externo, então o usuário pode redeclará-las se quiser. O código começa na linha 3 (LINE_OFFSET).
 */
export function compile(code: string, fnName: string, hooks: Record<string, unknown> = {}): unknown {
  const names = [...GLOBAL_NAMES, ...Object.keys(hooks)]
  const factory = new Function(
    ...names,
    `return (function(){${code}\n;return (typeof ${fnName} !== 'undefined') ? ${fnName} : undefined;})()`,
  )
  return factory(...GLOBAL_VALUES, ...Object.values(hooks))
}

export function getFn(exported: unknown, fnName: string): (...a: unknown[]) => unknown {
  if (typeof exported !== 'function') {
    throw new ReferenceError(`Não encontrei "${fnName}". Não renomeie a função/classe principal.`)
  }
  return exported as (...a: unknown[]) => unknown
}

const harnessCache = new Map<string, (...a: unknown[]) => unknown>()

/** Executa um caso: função comum, harness (alta ordem / async) ou problema de design (classe). */
export async function execute(fn: (...a: unknown[]) => unknown, input: unknown[], io: IOSpec | undefined) {
  if (io?.harness) {
    let h = harnessCache.get(io.harness)
    if (!h) {
      h = new Function(`return (${io.harness})`)() as (...a: unknown[]) => unknown
      harnessCache.set(io.harness, h)
    }
    let r = h(fn, ...structuredClone(input))
    if (r instanceof Promise) r = await r
    return r
  }
  if (io?.design) {
    const [ops, args] = structuredClone(input) as [string[], unknown[][]]
    return runDesign(fn, ops, args, io.design === 'factory')
  }
  let r = fn(...buildArgs(io, input))
  if (r instanceof Promise) r = await r
  return convertResult(io, r)
}

/** Onde o console do aluno escreve: o worker zera antes de cada caso e lê no fim. */
export interface LogSink {
  reset(): void
  take(): string[]
}

/** Roda todos os casos (inclusive os ocultos: quem esconde é a interface) e devolve o resultado de cada um. */
export async function executeTests(req: Extract<WorkerRequest, { kind: 'test' }>, logs: LogSink): Promise<WorkerResponse> {
  let fn: (...a: unknown[]) => unknown
  try {
    fn = getFn(compile(req.code, req.fnName), req.fnName)
  } catch (e) {
    return { kind: 'test', results: [], fatal: toRunError(e) }
  }
  const results: TestResult[] = []
  for (const t of req.tests) {
    logs.reset()
    const t0 = performance.now()
    try {
      const got = await execute(fn, t.input, req.io)
      const ms = performance.now() - t0
      results.push({ pass: compareResult(got, t.expected, req.compare), got: serialize(got), logs: logs.take(), ms })
    } catch (e) {
      results.push({ pass: false, error: toRunError(e), logs: logs.take(), ms: performance.now() - t0 })
    }
  }
  return { kind: 'test', results }
}

/** Placar de uma execução, separando visíveis e ocultos (como o HackerRank mostra). */
export function summarizeRun(results: Pick<TestResult, 'pass'>[], tests: { hidden?: boolean }[]) {
  let visiblePass = 0
  let hiddenPass = 0
  let hiddenTotal = 0
  results.forEach((r, i) => {
    const hidden = !!tests[i]?.hidden
    if (hidden) hiddenTotal++
    if (r.pass) {
      if (hidden) hiddenPass++
      else visiblePass++
    }
  })
  return {
    pass: visiblePass + hiddenPass,
    total: results.length,
    visiblePass,
    visibleTotal: results.length - hiddenTotal,
    hiddenPass,
    hiddenTotal,
    allPass: results.length > 0 && visiblePass + hiddenPass === results.length,
  }
}
