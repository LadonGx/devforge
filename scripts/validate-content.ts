import { PROBLEMS, PATTERNS } from '../src/content/leetcode/index'
import { compareResult } from '../src/engine/compare'
import { instrument } from '../src/engine/instrument'
import { transform } from 'sucrase'
let fails = 0
const noop = () => {}
for (const p of PROBLEMS) {
  for (const lang of ['js', 'ts'] as const) {
    let code = p.solution[lang]
    if (lang === 'ts') code = transform(code, { transforms: ['typescript'], disableESTransforms: true }).code
    const fn = new Function(code + `\nreturn ${p.fnName}`)()
    for (const t of p.tests) {
      const got = fn(...structuredClone(t.input))
      if (!compareResult(got, t.expected, p.compare ?? 'exact')) { fails++; console.log('FAIL', p.id, lang, t.label, JSON.stringify(got), JSON.stringify(t.expected)) }
    }
    // instrumentado
    const inst = instrument(code).code
    let steps = 0
    const f2 = new Function('__s','__enter','__exit','__ret', inst + `\nreturn ${p.fnName}`)((l: number, c: any) => { steps++; c() }, noop, noop, (l: number, v: any) => v)
    for (const t of p.tests) {
      const got = f2(...structuredClone(t.input))
      if (!compareResult(got, t.expected, p.compare ?? 'exact')) { fails++; console.log('INST FAIL', p.id, lang, t.label) }
    }
    // starter compiles
    const st = lang === 'ts' ? transform(p.starter.ts, { transforms: ['typescript'], disableESTransforms: true }).code : p.starter.js
    new Function(st + `\nreturn ${p.fnName}`)()
  }
  if (p.perf) {
    const input = new Function('return (' + p.perf.gen.toString() + ')')()(p.perf.n)
    const fn = new Function(p.solution.js + `\nreturn ${p.fnName}`)()
    const t0 = performance.now(); fn(...input); const ms = performance.now() - t0
    console.log('perf', p.id, ms.toFixed(1) + 'ms')
  }
}
for (const pat of PATTERNS) for (const b of pat.lesson) if (b.type === 'demo') {
  const inst = instrument(b.code).code
  let steps = 0
  const f = new Function('__s','__enter','__exit','__ret', inst + `\nreturn ${b.fnName}`)(() => steps++, noop, noop, (l: number, v: any) => v)
  console.log('demo', pat.id, JSON.stringify(f(...structuredClone(b.input)) instanceof Map ? 'map' : f(...structuredClone(b.input))), 'steps', steps)
  for (const id of pat.problems) if (!PROBLEMS.find(p => p.id === id)) { console.log('missing problem', id); fails++ }
}
console.log('fails', fails, 'problems', PROBLEMS.length)
