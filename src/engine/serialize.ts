import type { TNode, V } from './types'

const MAX_DEPTH = 5
const MAX_ITEMS = 80
const MAX_STR = 400

let nextId = 1
const ids = new WeakMap<object, number>()

function idOf(o: object): number {
  let id = ids.get(o)
  if (!id) {
    id = nextId++
    ids.set(o, id)
  }
  return id
}

/** Converte qualquer valor JS em uma estrutura serializável (snapshot). */
export function serialize(value: unknown, depth = 0, path: Set<object> = new Set()): V {
  switch (typeof value) {
    case 'number':
      return { t: 'n', v: value }
    case 'string':
      return { t: 's', v: value.length > MAX_STR ? value.slice(0, MAX_STR) + '…' : value }
    case 'boolean':
      return { t: 'b', v: value }
    case 'undefined':
      return { t: 'u' }
    case 'bigint':
      return { t: 'big', v: value.toString() }
    case 'symbol':
      return { t: 'sym', v: value.toString() }
    case 'function':
      return { t: 'fn', name: (value as { name?: string }).name || 'anônima' }
  }
  if (value === null) return { t: 'null' }
  const obj = value as object
  const id = idOf(obj)
  if (path.has(obj)) return { t: 'cycle', id }
  if (depth >= MAX_DEPTH) return { t: 'deep' }
  path.add(obj)
  try {
    if (Array.isArray(obj)) {
      const items: V[] = []
      const n = Math.min(obj.length, MAX_ITEMS)
      for (let i = 0; i < n; i++) items.push(serialize(obj[i], depth + 1, path))
      return { t: 'arr', id, items, len: obj.length }
    }
    if (obj instanceof Map) {
      const entries: [V, V][] = []
      let i = 0
      for (const [k, v] of obj) {
        if (i++ >= MAX_ITEMS) break
        entries.push([serialize(k, depth + 1, path), serialize(v, depth + 1, path)])
      }
      return { t: 'map', id, entries, size: obj.size }
    }
    if (obj instanceof Set) {
      const items: V[] = []
      let i = 0
      for (const v of obj) {
        if (i++ >= MAX_ITEMS) break
        items.push(serialize(v, depth + 1, path))
      }
      return { t: 'set', id, items, size: obj.size }
    }
    if (obj instanceof Promise) return { t: 'promise', id }
    if (isListNode(obj)) return serializeList(obj, depth)
    if (isTreeNode(obj)) return serializeTree(obj, depth)
    const cls = obj.constructor && obj.constructor !== Object ? obj.constructor.name || '' : ''
    const entries: [string, V][] = []
    let i = 0
    for (const k of Object.keys(obj)) {
      if (i++ >= MAX_ITEMS) break
      entries.push([k, serialize((obj as Record<string, unknown>)[k], depth + 1, path)])
    }
    return { t: 'obj', id, cls, entries }
  } finally {
    path.delete(obj)
  }
}

const MAX_LIST = 40
const MAX_TREE = 127

type AnyNode = { val: unknown; next?: unknown; left?: unknown; right?: unknown }

function isListNode(o: object): o is AnyNode {
  return 'val' in o && 'next' in o && !('left' in o) && !('right' in o)
}

function isTreeNode(o: object): o is AnyNode {
  return 'val' in o && ('left' in o || 'right' in o) && !('next' in o && !('left' in o))
}

function serializeList(head: AnyNode, depth: number): V {
  const nodes: { id: number; val: V }[] = []
  const index = new Map<object, number>()
  let cur: unknown = head
  let cycleTo: number | undefined
  while (cur && typeof cur === 'object' && isListNode(cur as object)) {
    const node = cur as AnyNode
    if (index.has(node)) {
      cycleTo = index.get(node)
      break
    }
    if (nodes.length >= MAX_LIST) break
    index.set(node, nodes.length)
    nodes.push({ id: idOf(node), val: serialize(node.val, depth + 1) })
    cur = node.next
  }
  const more = cycleTo === undefined && !!cur && nodes.length >= MAX_LIST
  return { t: 'list', id: idOf(head), nodes, cycleTo, more }
}

function serializeTree(root: AnyNode, depth: number): V {
  let count = 0
  const seen = new Set<object>()
  const walk = (n: unknown, d: number): TNode | null => {
    if (!n || typeof n !== 'object' || !isTreeNode(n as object) || seen.has(n as object)) return null
    const node = n as AnyNode
    seen.add(node)
    count++
    const t: TNode = { id: idOf(node), val: serialize(node.val, depth + 1), left: null, right: null }
    if (d >= 9 || count >= MAX_TREE) {
      t.cut = !!(node.left || node.right)
      return t
    }
    t.left = walk(node.left, d + 1)
    t.right = walk(node.right, d + 1)
    return t
  }
  const r = walk(root, 0)!
  return { t: 'tree', id: idOf(root), root: r, count }
}

/** Árvore em ordem de nível (formato LeetCode), ex.: [3,9,20,null,null,15,7] */
export function treeToLevelOrder(root: TNode | null): (V | null)[] {
  const out: (V | null)[] = []
  const q: (TNode | null)[] = [root]
  while (q.length) {
    const n = q.shift()!
    out.push(n ? n.val : null)
    if (n) q.push(n.left, n.right)
  }
  while (out.length && out[out.length - 1] === null) out.pop()
  return out
}

/** Representação textual curta (estilo console). */
export function formatV(v: V | undefined, depth = 0): string {
  if (!v) return '—'
  switch (v.t) {
    case 'n':
      return Object.is(v.v, -0) ? '-0' : String(v.v)
    case 's':
      return depth === 0 ? JSON.stringify(v.v) : JSON.stringify(v.v)
    case 'b':
      return String(v.v)
    case 'null':
      return 'null'
    case 'u':
      return 'undefined'
    case 'big':
      return v.v + 'n'
    case 'sym':
      return v.v
    case 'fn':
      return `ƒ ${v.name}()`
    case 'arr':
      return '[' + v.items.map((x) => formatV(x, depth + 1)).join(', ') + (v.len > v.items.length ? ', …' : '') + ']'
    case 'map':
      return `Map(${v.size}) {` + v.entries.map(([k, x]) => `${formatV(k, depth + 1)} => ${formatV(x, depth + 1)}`).join(', ') + '}'
    case 'set':
      return `Set(${v.size}) {` + v.items.map((x) => formatV(x, depth + 1)).join(', ') + '}'
    case 'obj':
      return (v.cls ? v.cls + ' ' : '') + '{' + v.entries.map(([k, x]) => `${k}: ${formatV(x, depth + 1)}`).join(', ') + '}'
    case 'promise':
      return 'Promise {…}'
    case 'list':
      return v.nodes.map((n) => formatV(n.val, depth + 1)).join(' → ') + (v.cycleTo !== undefined ? ' ↺' : v.more ? ' → …' : ' → null')
    case 'tree':
      return 'TreeNode [' + treeToLevelOrder(v.root).map((x) => (x ? formatV(x, depth + 1) : 'null')).join(',') + ']'
    case 'cycle':
      return '[Circular]'
    case 'deep':
      return '…'
  }
}

/** Para console.log: strings sem aspas no nível raiz. */
export function formatLogArg(x: unknown): string {
  if (typeof x === 'string') return x
  return formatV(serialize(x))
}
