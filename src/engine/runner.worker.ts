/// <reference lib="webworker" />
import { serialize, formatLogArg, formatV } from './serialize'
import { compareResult } from './compare'
import { GLOBALS, buildArgs, convertResult, runDesign } from './ds'
import type { CallNode, FrameSnap, IOSpec, RunError, Step, TestResult, WorkerRequest, WorkerResponse, V } from './types'

const MAX_STEPS = 2500
const MAX_CALLS = 400
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

const GLOBAL_NAMES = Object.keys(GLOBALS)
const GLOBAL_VALUES = Object.values(GLOBALS)

/**
 * Compila o código do usuário. As estruturas (ListNode, TreeNode, MinHeap...) ficam num escopo
 * externo, então o usuário pode redeclará-las se quiser. O código começa na linha 3 (LINE_OFFSET).
 */
function compile(code: string, fnName: string, hooks: Record<string, unknown> = {}): unknown {
  const names = [...GLOBAL_NAMES, ...Object.keys(hooks)]
  const factory = new Function(
    ...names,
    `return (function(){${code}\n;return (typeof ${fnName} !== 'undefined') ? ${fnName} : undefined;})()`,
  )
  return factory(...GLOBAL_VALUES, ...Object.values(hooks))
}

function getFn(exported: unknown, fnName: string): (...a: unknown[]) => unknown {
  if (typeof exported !== 'function') {
    throw new ReferenceError(`Não encontrei "${fnName}". Não renomeie a função/classe principal.`)
  }
  return exported as (...a: unknown[]) => unknown
}

/** Executa um caso: função comum ou problema de design (classe). */
const harnessCache = new Map<string, (...a: unknown[]) => unknown>()

async function execute(fn: (...a: unknown[]) => unknown, input: unknown[], io: IOSpec | undefined) {
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

async function runTests(req: Extract<WorkerRequest, { kind: 'test' }>): Promise<WorkerResponse> {
  let fn: (...a: unknown[]) => unknown
  try {
    fn = getFn(compile(req.code, req.fnName), req.fnName)
  } catch (e) {
    return { kind: 'test', results: [], fatal: toRunError(e) }
  }
  const results: TestResult[] = []
  for (const t of req.tests) {
    logs = []
    const t0 = performance.now()
    try {
      const got = await execute(fn, t.input, req.io)
      const ms = performance.now() - t0
      results.push({ pass: compareResult(got, t.expected, req.compare), got: serialize(got), logs, ms })
    } catch (e) {
      results.push({ pass: false, error: toRunError(e), logs, ms: performance.now() - t0 })
    }
  }
  return { kind: 'test', results }
}

const short = (s: string, n = 22) => (s.length > n ? s.slice(0, n - 1) + '…' : s)

/** Rótulo curto para argumentos/retornos na árvore de chamadas (nós viram "nó 4"). */
function label(x: unknown, n: number) {
  const v = serialize(x)
  if (v.t === 'tree') return `nó ${formatV(v.root.val)}`
  if (v.t === 'list') return `nó ${formatV(v.nodes[0].val)}`
  if (v.t === 'map') return `Map(${v.size})`
  if (v.t === 'set') return `Set(${v.size})`
  if (v.t === 'arr' && formatV(v).length > n) return `Array(${v.len})`
  return short(formatV(v), n)
}

async function runTrace(req: Extract<WorkerRequest, { kind: 'trace' }>): Promise<WorkerResponse> {
  logs = []
  interface Frame {
    id: number
    name: string
    params: string[]
    cap?: () => Record<string, unknown>
    call?: CallNode
    lastRet?: unknown
  }
  const frames: Frame[] = []
  const steps: Step[] = []
  const calls: CallNode[] = []
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
  const __enter = (name: string, params: string[], argsCap?: () => unknown[]) => {
    const id = ++fid
    const frame: Frame = { id, name, params }
    if (calls.length < MAX_CALLS) {
      let args = ''
      try {
        args = (argsCap ? argsCap() : []).map((a) => label(a, 14)).join(', ')
      } catch {
        /* ignora */
      }
      const parent = frames.length ? frames[frames.length - 1].id : null
      frame.call = { id, parent, name, args, start: steps.length }
      calls.push(frame.call)
    }
    frames.push(frame)
  }
  const __exit = () => {
    const f = frames.pop()
    if (f?.call) {
      f.call.end = steps.length
      if (f.lastRet !== undefined) f.call.ret = label(f.lastRet, 18)
    }
  }
  const __ret = (line: number, v: unknown) => {
    const top = frames[frames.length - 1]
    if (top) top.lastRet = v
    push({ line, kind: 'return', stack: snapStack(), ret: serialize(v), logs: logs.length })
    return v
  }

  let truncated = false
  let error: RunError | undefined
  let returnValue: V | undefined
  try {
    const fn = getFn(compile(req.code, req.fnName, { __s, __enter, __exit, __ret }), req.fnName)
    const r = await execute(fn, req.input, req.io)
    returnValue = serialize(r)
  } catch (e) {
    if (e instanceof StepLimit) truncated = true
    else error = toRunError(e)
  }
  return { kind: 'trace', result: { steps, calls, logs, returnValue, error, truncated } }
}

async function runPerf(req: Extract<WorkerRequest, { kind: 'perf' }>): Promise<WorkerResponse> {
  try {
    const gen = new Function(`return (${req.gen})`)() as (n: number) => unknown[]
    const input = gen(req.n)
    const ref = getFn(compile(req.refCode, req.fnName), req.fnName)
    const user = getFn(compile(req.code, req.fnName), req.fnName)
    logs = []
    let t0 = performance.now()
    await execute(ref, input, req.io)
    const refMs = performance.now() - t0
    logs = []
    t0 = performance.now()
    await execute(user, input, req.io)
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
