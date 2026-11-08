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
import { EXAMS, EXAM_COURSE, topicRef } from '../src/content/exams'
import { STAGES } from '../src/content/guide'
import { courseById } from '../src/content/courses'
import { normalizeLine } from '../src/lib/exam'
import { CONCEPTS, CONCEPT_THEMES } from '../src/content/ifood/concepts'
import { checkConcepts } from '../src/content/ifood/concepts/check'
import { IFOOD, IFOOD_SECTIONS } from '../src/content/ifood'
import { IFOOD_PROBLEM_LIST, RAG_PROBLEM_LIST } from '../src/content/ifood/problems'

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

const PROBLEMS = [...COURSES.flatMap((c) => c.problems), ...EXAM_COURSE.problems]
const PATTERNS = COURSES.flatMap((c) => c.units)

let fails = 0
const ids = new Set<string>()

/** Roda o código de um cenário do event loop de verdade e devolve o que foi impresso. */
async function realConsole(code: string, prelude = ''): Promise<string[]> {
  const out: string[] = []
  const fakeConsole = {
    log: (...a: unknown[]) => {
      // as questões de "prever a saída" só podem imprimir primitivos (o formato de objetos varia)
      if (a.some((x) => typeof x === 'object' && x !== null)) out.push('<<OBJETO IMPRESSO>>')
      out.push(a.map(String).join(' '))
    },
  }
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

// ---------- Provas ----------
const qids = new Set<string>()
for (const e of EXAMS) {
  if (!STAGES.find((st) => st.id === e.stage)) {
    fails++
    console.log('PROVA com etapa inexistente', e.id, e.stage)
  }
  for (const q of e.questions) {
    if (qids.has(q.id)) {
      fails++
      console.log('QUESTÃO com id duplicado', q.id)
    }
    qids.add(q.id)
    if (!topicRef(q.topic)) {
      fails++
      console.log('QUESTÃO com tópico inválido', q.id, q.topic)
    }
    if (q.kind === 'choice' && (q.answer < 0 || q.answer >= q.options.length)) {
      fails++
      console.log('QUESTÃO com resposta fora das alternativas', q.id)
    }
    if (q.kind === 'output') {
      let real: string[]
      try {
        real = await realConsole(q.code)
      } catch (err) {
        real = ['ERRO: ' + (err as Error).message]
      }
      const exp = q.expected.map(normalizeLine)
      if (JSON.stringify(real.map(normalizeLine)) !== JSON.stringify(exp)) {
        fails++
        console.log('SAÍDA DIVERGE', q.id, '\n  esperado:', JSON.stringify(q.expected), '\n  real:    ', JSON.stringify(real))
      }
    }
    if (q.kind === 'essay' && q.checklist.length < 2) {
      fails++
      console.log('DISCURSIVA sem checklist', q.id)
    }
  }
  console.log('prova ok', e.id, e.questions.length, 'questões')
}
// ---------- Guia ----------
for (const st of STAGES) {
  for (const step of st.steps) {
    if (step.kind === 'unit') {
      const c = courseById(step.course)
      if (!c?.units.find((u) => u.id === step.unit)) {
        fails++
        console.log('GUIA aponta para aula inexistente', st.id, step.course, step.unit)
      }
    }
    if (step.kind === 'exam' && !EXAMS.find((e) => e.id === step.exam)) {
      fails++
      console.log('GUIA aponta para prova inexistente', st.id, step.exam)
    }
  }
}
// ---------- iFood: banco de questões conceituais ----------
for (const err of checkConcepts(CONCEPTS, (ref) => !!topicRef(ref))) {
  fails++
  console.log('CONCEITO', err)
}
for (const t of CONCEPT_THEMES) if (!topicRef(t.review)) {
  fails++
  console.log('CONCEITO tema com review inexistente', t.id, t.review)
}
// ---------- iFood: aulas das seções e problemas estilo HackerRank ----------
for (const sec of IFOOD_SECTIONS) for (const l of sec.lessons) if (!IFOOD.units.find((u) => u.id === l)) {
  fails++
  console.log('IFOOD seção aponta para aula inexistente', sec.id, l)
}
const RAG_PATTERNS = ['rag-pipeline', 'rag-hackerrank']
const ifoodEntries = [...IFOOD_PROBLEM_LIST.map((e) => ({ ...e, rag: false })), ...RAG_PROBLEM_LIST.map((e) => ({ ...e, rag: true }))]
for (const { topic, problem: p, rag } of ifoodEntries) {
  const errs: string[] = []
  if (!p.id.startsWith('ifood-')) errs.push('id deve começar com "ifood-"')
  if (!topic.trim()) errs.push('topic vazio')
  if (!rag && p.pattern !== 'problemas-hackerrank') errs.push('pattern deve ser "problemas-hackerrank"')
  if (rag && !RAG_PATTERNS.includes(p.pattern)) errs.push('pattern deve ser uma aula de RAG: ' + RAG_PATTERNS.join(' ou '))
  if (rag && !IFOOD.units.some((u) => u.id === p.pattern && u.problems.includes(p.id))) errs.push('a aula ' + p.pattern + ' precisa listar este exercício em problems')
  if (!p.format?.input.trim() || !p.format?.output.trim()) errs.push('falta format.input/format.output')
  if (!p.related?.length) errs.push('falta related (aula do padrão do NeetCode)')
  for (const r of p.related ?? []) if (!topicRef(r)) errs.push('related inexistente: ' + r)
  const hidden = p.tests.filter((t) => t.hidden).length
  if (p.tests.length - hidden < 2) errs.push('precisa de pelo menos 2 testes visíveis')
  if (hidden < 4) errs.push(`precisa de pelo menos 4 testes ocultos (tem ${hidden})`)
  if (p.tests[0]?.hidden) errs.push('o primeiro teste deve ser visível (é o caso padrão do visualizador)')
  if (p.tests.some((t) => !t.label)) errs.push('todo teste precisa de label')
  if (p.examples.length === 0) errs.push('precisa de exemplos')
  if (p.hints.length < 2) errs.push('precisa de pelo menos 2 dicas')
  for (const e of errs) {
    fails++
    console.log('IFOOD PROBLEMA', `[${p.id}]`, e)
  }
}
console.log('ifood ok', IFOOD.units.length, 'aulas', IFOOD_PROBLEM_LIST.length, 'problemas', RAG_PROBLEM_LIST.length, 'exercícios de RAG')
console.log('conceitos ok', CONCEPTS.length, 'questões', CONCEPT_THEMES.map((t) => `${t.id}=${CONCEPTS.filter((q) => q.theme === t.id).length}`).join(' '))
}
main().then(() => {
console.log(`\n${fails === 0 ? 'OK' : 'FALHAS: ' + fails} · ${PROBLEMS.length} exercícios · ${PATTERNS.length} aulas · ${COURSES.length} cursos · ${EXAMS.length} provas`)
if (fails) process.exit(1)
})
