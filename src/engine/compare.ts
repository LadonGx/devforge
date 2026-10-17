import type { CompareMode } from './types'

function key(x: unknown): string {
  if (x instanceof Map) return 'Map' + key([...x.entries()].sort())
  if (x instanceof Set) return 'Set' + key([...x].map(key).sort())
  if (Array.isArray(x)) return '[' + x.map(key).join(',') + ']'
  if (x && typeof x === 'object') {
    return '{' + Object.keys(x).sort().map((k) => k + ':' + key((x as Record<string, unknown>)[k])).join(',') + '}'
  }
  if (typeof x === 'number' && Number.isNaN(x)) return 'NaN'
  return typeof x + ':' + String(x)
}

function deepEqual(a: unknown, b: unknown, float: boolean): boolean {
  if (typeof a === 'number' && typeof b === 'number') {
    if (Number.isNaN(a) && Number.isNaN(b)) return true
    return float ? Math.abs(a - b) < 1e-5 : a === b
  }
  if (a === b) return true
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((x, i) => deepEqual(x, b[i], float))
  }
  if (a instanceof Map || b instanceof Map || a instanceof Set || b instanceof Set) return key(a) === key(b)
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const ka = Object.keys(a)
    const kb = Object.keys(b)
    if (ka.length !== kb.length) return false
    return ka.every((k) => deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k], float))
  }
  return false
}

const sortBy = (arr: unknown[]) => [...arr].sort((x, y) => (key(x) < key(y) ? -1 : key(x) > key(y) ? 1 : 0))

export function compareResult(got: unknown, expected: unknown, mode: CompareMode): boolean {
  if (mode === 'float') return deepEqual(got, expected, true)
  if (mode === 'unordered' && Array.isArray(got) && Array.isArray(expected)) {
    return deepEqual(sortBy(got), sortBy(expected), false)
  }
  if (mode === 'unorderedNested' && Array.isArray(got) && Array.isArray(expected)) {
    const norm = (a: unknown[]) => sortBy(a.map((x) => (Array.isArray(x) ? sortBy(x) : x)))
    return deepEqual(norm(got), norm(expected), false)
  }
  return deepEqual(got, expected, false)
}
