/**
 * Estruturas disponíveis para o código do usuário (como no LeetCode):
 * ListNode, TreeNode, MinHeap e MaxHeap. Também converte entradas/saídas
 * no formato do LeetCode (arrays) para nós e vice-versa.
 */
import type { ArgType, IOSpec } from './types'

export class ListNode {
  val: unknown
  next: ListNode | null
  constructor(val: unknown = 0, next: ListNode | null = null) {
    this.val = val
    this.next = next
  }
}

export class TreeNode {
  val: unknown
  left: TreeNode | null
  right: TreeNode | null
  constructor(val: unknown = 0, left: TreeNode | null = null, right: TreeNode | null = null) {
    this.val = val
    this.left = left
    this.right = right
  }
}

type KeyFn = (x: unknown) => number

/** Heap binária. `new MinHeap()` ou `new MinHeap(x => x.dist)` para ordenar por uma chave. */
class BaseHeap {
  data: unknown[] = []
  private key: KeyFn
  private sign: number
  constructor(key: KeyFn | undefined, sign: number) {
    this.key = key ?? ((x) => x as number)
    this.sign = sign
    Object.defineProperty(this, 'key', { enumerable: false })
    Object.defineProperty(this, 'sign', { enumerable: false })
  }
  private before(a: unknown, b: unknown) {
    return this.sign * (this.key(a) - this.key(b)) < 0
  }
  size() {
    return this.data.length
  }
  isEmpty() {
    return this.data.length === 0
  }
  peek() {
    return this.data[0]
  }
  push(x: unknown) {
    const d = this.data
    d.push(x)
    let i = d.length - 1
    while (i > 0) {
      const p = (i - 1) >> 1
      if (!this.before(d[i], d[p])) break
      ;[d[i], d[p]] = [d[p], d[i]]
      i = p
    }
    return this
  }
  pop() {
    const d = this.data
    if (d.length === 0) return undefined
    const top = d[0]
    const last = d.pop()
    if (d.length > 0) {
      d[0] = last
      let i = 0
      for (;;) {
        const l = 2 * i + 1
        const r = l + 1
        let best = i
        if (l < d.length && this.before(d[l], d[best])) best = l
        if (r < d.length && this.before(d[r], d[best])) best = r
        if (best === i) break
        ;[d[i], d[best]] = [d[best], d[i]]
        i = best
      }
    }
    return top
  }
}

export class MinHeap extends BaseHeap {
  constructor(key?: KeyFn) {
    super(key, 1)
  }
}
export class MaxHeap extends BaseHeap {
  constructor(key?: KeyFn) {
    super(key, -1)
  }
}

// nomes estáveis mesmo depois da minificação (usados no visualizador)
for (const [C, n] of [
  [ListNode, 'ListNode'],
  [TreeNode, 'TreeNode'],
  [MinHeap, 'MinHeap'],
  [MaxHeap, 'MaxHeap'],
] as const) {
  Object.defineProperty(C, 'name', { value: n })
}

export const GLOBALS = { ListNode, TreeNode, MinHeap, MaxHeap }

export function buildList(arr: unknown[]): ListNode | null {
  let head: ListNode | null = null
  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head)
  return head
}

export function buildCycleList([arr, pos]: [unknown[], number]): ListNode | null {
  const head = buildList(arr)
  if (pos < 0 || !head) return head
  let tail = head
  let target: ListNode | null = null
  let i = 0
  for (let n: ListNode | null = head; n; n = n.next, i++) {
    if (i === pos) target = n
    tail = n
  }
  tail.next = target
  return head
}

export function buildTree(arr: unknown[]): TreeNode | null {
  if (!arr.length || arr[0] === null) return null
  const root = new TreeNode(arr[0])
  const q: TreeNode[] = [root]
  let i = 1
  while (q.length && i < arr.length) {
    const n = q.shift()!
    if (i < arr.length && arr[i] !== null) {
      n.left = new TreeNode(arr[i])
      q.push(n.left)
    }
    i++
    if (i < arr.length && arr[i] !== null) {
      n.right = new TreeNode(arr[i])
      q.push(n.right)
    }
    i++
  }
  return root
}

export function listToArray(head: unknown): unknown[] {
  const out: unknown[] = []
  const seen = new Set<unknown>()
  let n = head as ListNode | null
  while (n) {
    if (seen.has(n)) throw new Error('A lista retornada tem um ciclo (next aponta para um nó anterior).')
    seen.add(n)
    out.push(n.val)
    n = n.next
    if (out.length > 100000) break
  }
  return out
}

export function treeToArray(root: unknown): unknown[] {
  const out: unknown[] = []
  const q: (TreeNode | null)[] = [root as TreeNode | null]
  while (q.length) {
    const n = q.shift()!
    out.push(n ? n.val : null)
    if (n) q.push(n.left, n.right)
    if (out.length > 100000) break
  }
  while (out.length && out[out.length - 1] === null) out.pop()
  return out
}

function convertArg(type: ArgType | undefined, v: unknown): unknown {
  switch (type) {
    case 'list':
      return buildList(v as unknown[])
    case 'tree':
      return buildTree(v as unknown[])
    case 'cycleList':
      return buildCycleList(v as [unknown[], number])
    default:
      return v
  }
}

export function buildArgs(io: IOSpec | undefined, input: unknown[]): unknown[] {
  const args = structuredClone(input)
  if (!io?.args) return args
  return args.map((v, i) => convertArg(io.args![i], v))
}

export function convertResult(io: IOSpec | undefined, r: unknown): unknown {
  if (io?.ret === 'list') return listToArray(r)
  if (io?.ret === 'tree') return treeToArray(r)
  return r
}

/** Executa um problema de design: ops = ["Classe", "metodo", ...], args = [[...], [...]] */
export function runDesign(Cls: unknown, ops: string[], args: unknown[][]): unknown[] {
  const C = Cls as new (...a: unknown[]) => Record<string, (...a: unknown[]) => unknown>
  const out: unknown[] = []
  let obj: Record<string, (...a: unknown[]) => unknown> | null = null
  for (let i = 0; i < ops.length; i++) {
    if (i === 0) {
      obj = new C(...(args[0] ?? []))
      out.push(null)
      continue
    }
    const m = obj![ops[i]]
    if (typeof m !== 'function') throw new TypeError(`O método "${ops[i]}" não existe na classe.`)
    const r = m.apply(obj, args[i] ?? [])
    out.push(r === undefined ? null : r)
  }
  return out
}
