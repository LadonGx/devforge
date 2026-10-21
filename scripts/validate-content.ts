/**
 * Valida o conteúdo: roda as soluções de referência (JS e TS) contra os testes,
 * também em modo instrumentado (visualizador), e os demos das aulas.
 * Uso: npm run validate
 */
import { COURSES } from '../src/content/courses'
import { compareResult } from '../src/engine/compare'
import { instrument } from '../src/engine/instrument'
import { GLOBALS, buildArgs, convertResult, runDesign } from '../src/engine/ds'
import type { IOSpec } from '../src/engine/types'
import { transform } from 'sucrase'
import { simulate } from '../src/components/widgets/eventLoopSim'

const noop = () => {}
const hooks = {
  __s: (_l: number, c: () => unknown) => c(),
  __enter: noop,
  __exit: noop,
  __ret: (_l: number, v: unknown) => v,
  __suspend: (x: unknown) => Promise.resolve(x).then((v) => ({ ok: true, v }), (e) => ({ ok: false, e })),
  __resume: (b: { ok: boolean; v?: unknown; e?: unknown }) => {
    if (!b.ok) throw b.e
    return b.v
  },
}

function compile(code: string, name: string, withHooks = false): (...a: unknown[]) => unknown {
  const extra = withHooks ? hooks : {}
  const names = [...Object.keys(GLOBALS), ...Object.keys(extra)]
  const f = new Function(...names, `return (function(){${code}\n;return ${name}})()`)
  return f(...Object.values(GLOBALS), ...Object.values(extra))
}

function exec(fn: (...a: unknown[]) => unknown, input: unknown[], io?: IOSpec) {
  if (io?.harness) {
    const h = new Function(`return (${io.harness})`)() as (...a: unknown[]) => unknown
    return h(fn, ...structuredClone(input))
  }
  if (io?.design) {
    const [ops, args] = structuredClone(input) as [string[], unknown[][]]
    return runDesign(fn, ops, args, io.design === 'factory')
  }
  return convertResult(io, fn(...buildArgs(io, input)))
}

const ts = (code: string) => transform(code, { transforms: ['typescript'], disableESTransforms: true }).code

const PROBLEMS = COURSES.flatMap((c) => c.problems)
const PATTERNS = COURSES.flatMap((c) => c.units)

let fails = 0
const ids = new Set<string>()

/** Roda o código de um cenário do event loop de verdade e devolve o que foi impresso. */
async function realConsole(code: string, prelude = ''): Promise<string[]> {
  const out: string[] = []
  const fakeConsole = { log: (...a: unknown[]) => out.push(a.map(String).join(' ')) }
  new Function('console', prelude + '\n' + code)(fakeConsole)
  await new Promise((r) => setTimeout(r, 400))
  return out
}

async function main() {
for (const p of PROBLEMS) {
  if (ids.has(p.id)) {
    console.log('ID DUPLICADO', p.id)
    fails++
  }
  ids.add(p.id)
  for (const lang of ['js', 'ts'] as const) {
    const code = lang === 'ts' ? ts(p.solution.ts) : p.solution.js
    const fn = compile(code, p.fnName)
    const fnInst = compile(instrument(code).code, p.fnName, true)
    for (const t of p.tests) {
      for (const [label, f] of [
        ['', fn],
        ['INST ', fnInst],
      ] as const) {
        try {
          const got = await exec(f, t.input, p.io)
          if (!compareResult(got, t.expected, p.compare ?? 'exact')) {
            fails++
            console.log(`${label}FAIL`, p.id, lang, t.label, JSON.stringify(got), '!=', JSON.stringify(t.expected))
          }
        } catch (e) {
          fails++
          console.log(`${label}ERRO`, p.id, lang, t.label, (e as Error).message)
        }
      }
    }
    // o código inicial precisa compilar
    const st = lang === 'ts' ? ts(p.starter.ts) : p.starter.js
    try {
      compile(st, p.fnName)
    } catch (e) {
      fails++
      console.log('STARTER', p.id, lang, (e as Error).message)
    }
  }
  if (p.perf) {
    const input = new Function('return (' + p.perf.gen.toString() + ')')()(p.perf.n)
    const fn = compile(p.solution.js, p.fnName)
    const t0 = performance.now()
    await exec(fn, input, p.io)
    const ms = performance.now() - t0
    console.log('perf', p.id, ms.toFixed(1) + 'ms', ms > p.perf.limitMs / 3 ? '  <-- ATENÇÃO: referência lenta' : '')
  }
}
for (const pat of PATTERNS) {
  for (const id of pat.problems) {
    if (!PROBLEMS.find((p) => p.id === id)) {
      console.log('problema inexistente no padrão', pat.id, id)
      fails++
    }
  }
  for (const b of pat.lesson) {
    if (b.type === 'eventloop') {
      // o simulador precisa imprimir exatamente o que o JS real imprime
      const frames = simulate(b.program)
      const sim = frames[frames.length - 1].console
      const real = await realConsole(b.code, b.prelude)
      if (JSON.stringify(sim) !== JSON.stringify(real)) {
        fails++
        console.log('EVENTLOOP DIVERGE', pat.id, b.title, '\n  simulado:', JSON.stringify(sim), '\n  real:    ', JSON.stringify(real))
      } else console.log('eventloop ok', pat.id, '·', b.title, '·', frames.length, 'quadros')
      continue
    }
    if (b.type !== 'demo') continue
    try {
      const f = compile(instrument(b.code).code, b.fnName, true)
      const r = await exec(f, b.input, b.io)
      console.log('demo', pat.id, JSON.stringify(r)?.slice(0, 60))
    } catch (e) {
      fails++
      console.log('DEMO ERRO', pat.id, (e as Error).message)
    }
  }
}
}
main().then(() => {
console.log(`\n${fails === 0 ? 'OK' : 'FALHAS: ' + fails} · ${PROBLEMS.length} exercícios · ${PATTERNS.length} aulas · ${COURSES.length} cursos`)
if (fails) process.exit(1)
})
