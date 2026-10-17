/// <reference lib="webworker" />
import { serialize, formatLogArg } from './serialize'
import { compareResult } from './compare'
import type { FrameSnap, RunError, Step, TestResult, WorkerRequest, WorkerResponse, V } from './types'

const MAX_STEPS = 2500
const MAX_LOGS = 300
const LINE_OFFSET = 2 // `new Function` adiciona 2 linhas antes do código

let logs: string[] = []

function installConsole() {
  const push = (prefix: string) => (...args: unknown[]) => {
    if (logs.length >= MAX_LOGS) return
    logs.push(prefix + args.map(formatLogArg).join(' '))
  }
  const c = self.console as unknown as Record<string, unknown>
  c.log = push('')
  c.info = push('')
  c.debug = push('')
  c.warn = push('⚠ ')
  c.error = push('✖ ')
  c.table = push('')
}
installConsole()

class StepLimit extends Error {}

function toRunError(e: unknown): RunError {
  if (e instanceof Error) {
    const m = /(?:<anonymous>|Function|eval):(\d+):\d+/.exec(e.stack || '')
    const line = m ? Number(m[1]) - LINE_OFFSET : undefined
    return { message: e.message, name: e.name, line: line && line > 0 ? line : undefined }
  }
  return { message: String(e), name: 'Error' }
}

function compile(code: string, fnName: string, extraParams: string[] = []): (...a: unknown[]) => unknown {
  const factory = new Function(
    ...extraParams,
    `${code}\n;return (typeof ${fnName} !== 'undefined') ? ${fnName} : undefined;`,
  )
  return factory as (...a: unknown[]) => unknown
}

function getFn(exported: unknown, fnName: string): (...a: unknown[]) => unknown {
  if (typeof exported !== 'function') {
    throw new ReferenceError(`Não encontrei a função "${fnName}". Não renomeie a função principal.`)
  }
  return exported as (...a: unknown[]) => unknown
}

async function call(fn: (...a: unknown[]) => unknown, args: unknown[]) {
  let r = fn(...args)
  if (r instanceof Promise) r = await r
  return r
}

async function runTests(req: Extract<WorkerRequest, { kind: 'test' }>): Promise<WorkerResponse> {
  let fn: (...a: unknown[]) => unknown
  try {
    fn = getFn(compile(req.code, req.fnName)(), req.fnName)
  } catch (e) {
    return { kind: 'test', results: [], fatal: toRunError(e) }
  }
  const results: TestResult[] = []
  for (const t of req.tests) {
    logs = []
    const args = structuredClone(t.input)
    const t0 = performance.now()
    try {
      const got = await call(fn, args)
      const ms = performance.now() - t0
      results.push({ pass: compareResult(got, t.expected, req.compare), got: serialize(got), logs, ms })
    } catch (e) {
      results.push({ pass: false, error: toRunError(e), logs, ms: performance.now() - t0 })
    }
  }
  return { kind: 'test', results }
}

async function runTrace(req: Extract<WorkerRequest, { kind: 'trace' }>): Promise<WorkerResponse> {
  logs = []
  interface Frame {
    id: number
    name: string
    params: string[]
    cap?: () => Record<string, unknown>
  }
  const frames: Frame[] = []
  const steps: Step[] = []
  let fid = 0

  const serVars = (o: Record<string, unknown>): [string, V][] =>
    Object.entries(o)
      .filter(([, v]) => v !== undefined && typeof v !== 'function')
      .map(([k, v]) => [k, serialize(v)])

  const snapStack = (): FrameSnap[] =>
    frames.slice(-8).map((f) => {
      let vars: [string, V][] = []
      try {
        vars = f.cap ? serVars(f.cap()) : []
      } catch {
        /* ignora */
      }
      return { id: f.id, name: f.name, params: f.params, vars }
    })

  const push = (s: Step) => {
    steps.push(s)
    if (steps.length >= MAX_STEPS) throw new StepLimit('limite de passos')
  }

  const __s = (line: number, cap: () => Record<string, unknown>) => {
    const top = frames[frames.length - 1]
    if (top) top.cap = cap
    push({ line, kind: 'line', stack: snapStack(), logs: logs.length })
  }
  const __enter = (name: string, params: string[]) => {
    frames.push({ id: ++fid, name, params })
  }
  const __exit = () => {
    frames.pop()
  }
  const __ret = (line: number, v: unknown) => {
    push({ line, kind: 'return', stack: snapStack(), ret: serialize(v), logs: logs.length })
    return v
  }

  let truncated = false
  let error: RunError | undefined
  let returnValue: V | undefined
  try {
    const fn = getFn(compile(req.code, req.fnName, ['__s', '__enter', '__exit', '__ret'])(__s, __enter, __exit, __ret), req.fnName)
    const r = await call(fn, structuredClone(req.input))
    returnValue = serialize(r)
  } catch (e) {
    if (e instanceof StepLimit) truncated = true
    else error = toRunError(e)
  }
  return { kind: 'trace', result: { steps, logs, returnValue, error, truncated } }
}

async function runPerf(req: Extract<WorkerRequest, { kind: 'perf' }>): Promise<WorkerResponse> {
  try {
    const gen = new Function(`return (${req.gen})`)() as (n: number) => unknown[]
    const input = gen(req.n)
    const ref = getFn(compile(req.refCode, req.fnName)(), req.fnName)
    const user = getFn(compile(req.code, req.fnName)(), req.fnName)
    logs = []
    let t0 = performance.now()
    await call(ref, structuredClone(input))
    const refMs = performance.now() - t0
    logs = []
    t0 = performance.now()
    await call(user, structuredClone(input))
    const userMs = performance.now() - t0
    return { kind: 'perf', result: { userMs, refMs } }
  } catch (e) {
    return { kind: 'perf', result: { error: toRunError(e) } }
  }
}

self.onmessage = async (ev: MessageEvent<WorkerRequest>) => {
  const req = ev.data
  let res: WorkerResponse
  if (req.kind === 'test') res = await runTests(req)
  else if (req.kind === 'trace') res = await runTrace(req)
  else res = await runPerf(req)
  ;(self as unknown as Worker).postMessage(res)
}
