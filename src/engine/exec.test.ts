import { afterEach, describe, expect, it, vi } from 'vitest'
import { executeTests, summarizeRun } from './exec'
import { compareResult } from './compare'
import { prepare, runInWorker, type WorkerLike } from './runner'
import type { CompareMode, IOSpec, WorkerRequest } from './types'

/** Monta o pedido como o runner faz: código do aluno (já em JS), casos e modo de comparação. */
function req(code: string, fnName: string, tests: { input: unknown[]; expected: unknown }[], compare: CompareMode = 'exact', io?: IOSpec) {
  return { kind: 'test', code, fnName, tests, compare, io } as Extract<WorkerRequest, { kind: 'test' }>
}

/** Sink de logs igual ao do worker: zera antes de cada caso. */
function sink() {
  let lines: string[] = []
  const origLog = console.log
  return {
    reset: () => {
      lines = []
      console.log = (...a: unknown[]) => {
        lines.push(a.join(' '))
      }
    },
    take: () => {
      console.log = origLog
      return lines
    },
  }
}

const SUM = `function sumOrders(totals) {
  let s = 0
  for (const t of totals) s += t
  return s
}`

describe('executeTests (executor de testes)', () => {
  it('marca como aceito quando todos os casos batem', async () => {
    const res = await executeTests(
      req(SUM, 'sumOrders', [
        { input: [[10, 20, 5]], expected: 35 },
        { input: [[]], expected: 0 },
      ]),
      sink(),
    )
    expect(res.kind).toBe('test')
    if (res.kind !== 'test') return
    expect(res.fatal).toBeUndefined()
    expect(res.results.map((r) => r.pass)).toEqual([true, true])
  })

  it('reprova o caso errado e devolve o valor recebido para o diff', async () => {
    const wrong = SUM.replace('s += t', 's += 1')
    const res = await executeTests(req(wrong, 'sumOrders', [{ input: [[10, 20]], expected: 30 }]), sink())
    if (res.kind !== 'test') throw new Error('tipo inesperado')
    expect(res.results[0].pass).toBe(false)
    expect(res.results[0].got).toEqual({ t: 'n', v: 2 })
  })

  it('erro em tempo de execução vira resultado com nome, mensagem e linha', async () => {
    const code = `function first(list) {\n  return list[0].id\n}`
    const res = await executeTests(req(code, 'first', [{ input: [[]], expected: null }]), sink())
    if (res.kind !== 'test') throw new Error('tipo inesperado')
    const r = res.results[0]
    expect(r.pass).toBe(false)
    expect(r.error?.name).toBe('TypeError')
    expect(r.error?.line).toBe(2)
  })

  it('função renomeada é erro fatal (nenhum caso roda)', async () => {
    const res = await executeTests(req('function other() {}', 'sumOrders', [{ input: [[1]], expected: 1 }]), sink())
    if (res.kind !== 'test') throw new Error('tipo inesperado')
    expect(res.results).toEqual([])
    expect(res.fatal?.name).toBe('ReferenceError')
    expect(res.fatal?.message).toContain('sumOrders')
  })

  it('captura o console.log de cada caso separadamente', async () => {
    const code = `function echo(x) {\n  console.log('pedido', x)\n  return x\n}`
    const res = await executeTests(
      req(code, 'echo', [
        { input: [1], expected: 1 },
        { input: [2], expected: 2 },
      ]),
      sink(),
    )
    if (res.kind !== 'test') throw new Error('tipo inesperado')
    expect(res.results.map((r) => r.logs)).toEqual([['pedido 1'], ['pedido 2']])
  })

  it('espera funções async e harness (alta ordem)', async () => {
    const code = `async function double(x) {\n  return x * 2\n}`
    const io: IOSpec = { harness: '(fn, x) => fn(x).then((v) => v + 1)' }
    const res = await executeTests(req(code, 'double', [{ input: [4], expected: 9 }], 'exact', io), sink())
    if (res.kind !== 'test') throw new Error('tipo inesperado')
    expect(res.results[0].pass).toBe(true)
  })

  it('não deixa o código do aluno alterar a entrada de outro caso (harness recebe cópia)', async () => {
    const code = `function take(list) {\n  list.length = 0\n  return 0\n}`
    const shared = [1, 2, 3]
    const io: IOSpec = { harness: '(fn, list) => fn(list)' }
    await executeTests(req(code, 'take', [{ input: [shared], expected: 0 }], 'exact', io), sink())
    expect(shared).toEqual([1, 2, 3])
  })
})

describe('compareResult (comparação com o esperado)', () => {
  it('exact compara em profundidade e respeita a ordem', () => {
    expect(compareResult([1, [2, 3]], [1, [2, 3]], 'exact')).toBe(true)
    expect(compareResult([3, 1], [1, 3], 'exact')).toBe(false)
    expect(compareResult({ a: 1, b: [2] }, { b: [2], a: 1 }, 'exact')).toBe(true)
  })
  it('unordered ignora a ordem do array externo', () => {
    expect(compareResult([3, 1, 2], [1, 2, 3], 'unordered')).toBe(true)
    expect(compareResult([3, 1], [1, 2], 'unordered')).toBe(false)
  })
  it('unorderedNested ignora a ordem também dentro dos grupos', () => {
    expect(compareResult([['b', 'a'], ['c']], [['c'], ['a', 'b']], 'unorderedNested')).toBe(true)
  })
  it('float tolera erro de arredondamento', () => {
    expect(compareResult(0.1 + 0.2, 0.3, 'float')).toBe(true)
    expect(compareResult(0.1 + 0.2, 0.3, 'exact')).toBe(false)
  })
})

describe('summarizeRun (placar visíveis × ocultos)', () => {
  it('separa o placar dos testes ocultos', () => {
    const tests = [{}, {}, { hidden: true }, { hidden: true }, { hidden: true }]
    const results = [{ pass: true }, { pass: true }, { pass: true }, { pass: false }, { pass: true }]
    expect(summarizeRun(results, tests)).toEqual({
      pass: 4,
      total: 5,
      visiblePass: 2,
      visibleTotal: 2,
      hiddenPass: 2,
      hiddenTotal: 3,
      allPass: false,
    })
  })
  it('sem resultados não é "aceito"', () => {
    expect(summarizeRun([], []).allPass).toBe(false)
  })
})

describe('prepare (TS → JS e sintaxe)', () => {
  it('transpila TypeScript mantendo as linhas', () => {
    const p = prepare('function f(x: number): number {\n  return x + 1\n}', 'ts')
    expect(p.error).toBeUndefined()
    expect(p.js).not.toContain(': number')
    expect(new Function(`${p.js}; return f(1)`)()).toBe(2)
  })
  it('aponta a linha do erro de sintaxe', () => {
    const p = prepare('function f() {\n  return (1 +\n}', 'js')
    expect(p.error?.name).toBe('SyntaxError')
    expect(p.error?.line).toBe(3)
  })
  it('remove export para rodar como script', () => {
    expect(prepare('export function f() { return 1 }', 'js').js).toBe('function f() { return 1 }')
  })
})

describe('runInWorker (limite de tempo)', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  /** Worker falso: `respond` decide se e quando ele responde. */
  function fakeWorker(respond?: (w: WorkerLike) => void) {
    const w: WorkerLike & { terminated: boolean } = {
      onmessage: null,
      onerror: null,
      terminated: false,
      postMessage() {
        respond?.(w)
      },
      terminate() {
        w.terminated = true
      },
    }
    return w
  }

  it('encerra o worker e devolve timeout quando o código não termina (loop infinito)', async () => {
    vi.useFakeTimers()
    const w = fakeWorker() // nunca responde
    const pending = runInWorker(req('', 'f', []), 5000, () => w)
    await vi.advanceTimersByTimeAsync(4999)
    expect(w.terminated).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    await expect(pending).resolves.toEqual({ kind: 'timeout' })
    expect(w.terminated).toBe(true)
  })

  it('devolve a resposta do worker e o encerra quando ele responde a tempo', async () => {
    const answer = { kind: 'test' as const, results: [] }
    const w = fakeWorker((self) => {
      queueMicrotask(() => self.onmessage?.({ data: answer } as MessageEvent))
    })
    await expect(runInWorker(req('', 'f', []), 5000, () => w)).resolves.toEqual(answer)
    expect(w.terminated).toBe(true)
  })

  it('erro do worker vira erro fatal, sem travar', async () => {
    const w = fakeWorker((self) => {
      queueMicrotask(() => self.onerror?.({ message: 'boom', preventDefault() {} } as ErrorEvent))
    })
    await expect(runInWorker(req('', 'f', []), 5000, () => w)).resolves.toMatchObject({ kind: 'test', fatal: { message: 'boom' } })
  })
})
