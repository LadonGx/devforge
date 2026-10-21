import type { Course, Problem } from './types'
import { PATTERNS, PROBLEMS } from './leetcode'
import { JS_UNITS, JS_PROBLEMS } from './js'
import { ASYNC_UNITS, ASYNC_PROBLEMS } from './async'

export const LEETCODE: Course = {
  id: 'leetcode',
  title: 'Treino LeetCode / NeetCode',
  basePath: '/leetcode',
  unitSegment: 'padrao',
  unitLabel: 'Padrão',
  volumeLabel: 'Volume 1 · JavaScript',
  intro:
    'Organizado por **padrões**, como o roadmap do NeetCode: aprender o padrão vale mais que decorar 300 problemas. Cada padrão tem uma aula com visualização e problemas inspirados nos do LeetCode, que você resolve em JavaScript ou TypeScript.',
  how: [
    { title: 'Aula do padrão', text: 'Ideia, sinais no enunciado, template e uma animação.' },
    { title: 'Resolva e rode os testes', text: 'Ctrl+Enter roda. Teste que falha mostra o diff visual.' },
    { title: 'Visualize o seu código', text: 'Passo a passo: ponteiros, Map, pilha, árvores e recursão.' },
  ],
  units: PATTERNS,
  problems: PROBLEMS,
  parts: {
    'arrays-hashing': 'Parte 1 · Arrays e strings',
    'linked-list': 'Parte 2 · Estruturas ligadas, recursão e grafos',
  },
  soonNote: '**Em breve na parte 3:** Tries, Intervals, Greedy, Advanced Graphs (Dijkstra, Union-Find) e 2-D Dynamic Programming.',
}

export const JS_FUNDAMENTOS: Course = {
  id: 'js-fundamentos',
  title: 'Fundamentos de JavaScript',
  basePath: '/js',
  unitSegment: 'aula',
  unitLabel: 'Aula',
  volumeLabel: 'Volume 1 · JavaScript',
  intro:
    'Os conceitos que aparecem em **todo** código JS e em toda entrevista: tipos e coerção, escopo e closures, `this`, métodos de array, referências, Map/Set e a sintaxe moderna. Cada aula tem explicação por partes, perguntas rápidas para testar a intuição e exercícios com testes que você pode ver rodando passo a passo.',
  how: [
    { title: 'Leia a aula', text: 'Explicação por partes, laboratórios interativos e perguntas rápidas.' },
    { title: 'Faça os exercícios', text: 'Funções pequenas com testes. Ctrl+Enter roda.' },
    { title: 'Veja por dentro', text: 'Visualizador mostra closures (↑), referências e cada passo.' },
  ],
  units: JS_UNITS,
  problems: JS_PROBLEMS,
  soonNote: '**Próximo módulo:** [Assincronismo](#/async) (event loop visual, Promises, async/await).',
}

export const JS_ASYNC: Course = {
  id: 'js-async',
  title: 'Assincronismo',
  basePath: '/async',
  unitSegment: 'aula',
  unitLabel: 'Aula',
  volumeLabel: 'Volume 1 · JavaScript',
  intro:
    'Como o JavaScript faz várias coisas "ao mesmo tempo" com **uma thread só**. O coração do módulo é o **visualizador do event loop**: você vê a call stack, as Web APIs e as filas de microtasks e macrotasks se mexendo a cada linha. Depois: callbacks, Promises, async/await e os padrões de concorrência que aparecem em entrevistas e no dia a dia.',
  how: [
    { title: 'Veja o event loop', text: 'Cada aula tem cenários animados passo a passo.' },
    { title: 'Teste a intuição', text: 'Perguntas de "qual a ordem da saída?", o clássico das entrevistas.' },
    { title: 'Implemente', text: 'sleep, promisify, Promise.all, retry, pool e debounce, com testes reais.' },
  ],
  units: ASYNC_UNITS,
  problems: ASYNC_PROBLEMS,
  soonNote: '**Próximo módulo:** Tipagem com TypeScript.',
}

export const COURSES: Course[] = [JS_FUNDAMENTOS, JS_ASYNC, LEETCODE]

export const courseById = (id: string) => COURSES.find((c) => c.id === id)

const problemIndex = new Map<string, { course: Course; problem: Problem }>()
for (const c of COURSES) for (const p of c.problems) problemIndex.set(p.id, { course: c, problem: p })

export const findProblem = (id: string) => problemIndex.get(id)
export const courseOfProblem = (id: string) => problemIndex.get(id)?.course

export const unitPath = (c: Course, unitId: string) => `${c.basePath}/${c.unitSegment}/${unitId}`
export const problemPath = (c: Course, problemId: string) => `${c.basePath}/p/${problemId}`
export const lessonKey = (c: Course, unitId: string) => `${c.id}:${unitId}`
