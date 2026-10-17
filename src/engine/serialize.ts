import type { V } from './types'

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
