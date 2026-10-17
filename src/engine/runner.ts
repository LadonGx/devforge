import { transform } from 'sucrase'
import { parse } from 'acorn'
import { instrument } from './instrument'
import type { CompareMode, Lang, PerfResult, RunError, TestCase, TestResult, TraceResult, WorkerRequest, WorkerResponse } from './types'

export interface Prepared {
  js?: string
  error?: RunError
}

/** Remove `export`, converte TS → JS (preservando linhas) e valida a sintaxe. */
export function prepare(code: string, lang: Lang): Prepared {
  let js = code.replace(/^(\s*)export\s+(default\s+)?/gm, '$1')
  try {
    if (lang === 'ts') {
      js = transform(js, { transforms: ['typescript'], disableESTransforms: true }).code
    }
  } catch (e) {
    const err = e as Error & { loc?: { line: number } }
    const m = /\((\d+):(\d+)\)/.exec(err.message)
    return { error: { name: 'SyntaxError', message: err.message.replace(/\s*\(\d+:\d+\)$/, ''), line: err.loc?.line ?? (m ? Number(m[1]) : undefined) } }
  }
  try {
    parse(js, { ecmaVersion: 'latest', sourceType: 'script' })
  } catch (e) {
    const err = e as Error & { loc?: { line: number } }
    return { error: { name: 'SyntaxError', message: err.message.replace(/\s*\(\d+:\d+\)$/, ''), line: err.loc?.line } }
  }
  return { js }
}

type Timeout = { kind: 'timeout' }

function runInWorker(req: WorkerRequest, timeoutMs: number): Promise<WorkerResponse | Timeout> {
  return new Promise((resolve) => {
    const worker = new Worker(new URL('./runner.worker.ts', import.meta.url), { type: 'module' })
    const timer = setTimeout(() => {
      worker.terminate()
      resolve({ kind: 'timeout' })
    }, timeoutMs)
    worker.onmessage = (ev: MessageEvent<WorkerResponse>) => {
      clearTimeout(timer)
      worker.terminate()
      resolve(ev.data)
    }
    worker.onerror = (ev) => {
      clearTimeout(timer)
      worker.terminate()
      ev.preventDefault()
      resolve({ kind: 'test', results: [], fatal: { name: 'Error', message: ev.message || 'Erro desconhecido no worker' } })
    }
    worker.postMessage(req)
  })
}

export interface TestRun {
  results: TestResult[]
  fatal?: RunError
  timeout?: boolean
}

export async function runTests(code: string, lang: Lang, fnName: string, tests: TestCase[], compare: CompareMode): Promise<TestRun> {
  const p = prepare(code, lang)
  if (p.error) return { results: [], fatal: p.error }
  const res = await runInWorker(
    { kind: 'test', code: p.js!, fnName, tests: tests.map((t) => ({ input: t.input, expected: t.expected })), compare },
    5000,
  )
  if (res.kind === 'timeout') return { results: [], timeout: true }
  if (res.kind !== 'test') return { results: [], fatal: { name: 'Error', message: 'Resposta inesperada' } }
  return { results: res.results, fatal: res.fatal }
}

export async function runTrace(code: string, lang: Lang, fnName: string, input: unknown[]): Promise<TraceResult> {
  const p = prepare(code, lang)
  if (p.error) return { steps: [], logs: [], error: p.error, truncated: false }
  let instrumented: string
  try {
    instrumented = instrument(p.js!).code
  } catch (e) {
    return { steps: [], logs: [], error: { name: 'Error', message: 'Falha ao instrumentar: ' + (e as Error).message }, truncated: false }
  }
  const res = await runInWorker({ kind: 'trace', code: instrumented, fnName, input }, 6000)
  if (res.kind === 'timeout') {
    return { steps: [], logs: [], error: { name: 'Timeout', message: 'A execução demorou demais (loop infinito?).' }, truncated: false }
  }
  if (res.kind === 'test' && res.fatal) return { steps: [], logs: [], error: res.fatal, truncated: false }
  if (res.kind !== 'trace') return { steps: [], logs: [], error: { name: 'Error', message: 'Resposta inesperada' }, truncated: false }
  return res.result
}

export async function runPerf(code: string, lang: Lang, refCode: string, fnName: string, gen: string, n: number, limitMs: number): Promise<PerfResult> {
  const p = prepare(code, lang)
  if (p.error) return { error: p.error }
  const r = prepare(refCode, 'js')
  if (r.error) return { error: r.error }
  const res = await runInWorker({ kind: 'perf', code: p.js!, refCode: r.js!, fnName, gen, n }, limitMs)
  if (res.kind === 'timeout') return { timeout: true }
  if (res.kind === 'test' && res.fatal) return { error: res.fatal }
  if (res.kind !== 'perf') return { error: { name: 'Error', message: 'Resposta inesperada' } }
  return res.result
}
