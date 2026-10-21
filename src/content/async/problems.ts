import type { Problem } from '../types'

/** API falsa usada pelos testes (tempos curtos para os testes rodarem rápido). */
const FAKE_API = `const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const api = {
    getUser: async (id) => {
      await wait(10);
      if (id === 404) throw new Error('Usuário não encontrado');
      return { id, name: id === 1 ? 'Ana' : 'Bia' };
    },
    getPosts: async (userId) => {
      await wait(40);
      return userId === 1 ? [{ title: 'Olá, mundo' }, { title: 'Async é legal' }] : [{ title: 'Primeiro post' }];
    },
    getFriends: async (userId) => {
      await wait(40);
      if (userId === 500) throw new Error('Serviço de amigos fora do ar');
      return userId === 1 ? ['bia', 'caio', 'duda'] : ['ana'];
    },
  };`

/** Cria promises a partir de [ok, valor, ms] (usado por vários testes). */
const MAKE = `const make = ([ok, value, ms]) =>
    new Promise((resolve, reject) => setTimeout(() => (ok ? resolve(value) : reject(value)), ms));`

/* ======================= Event loop ======================= */

export const sleep: Problem = {
  id: 'async-sleep',
  title: 'sleep(ms) com Promise',
  difficulty: 'Fácil',
  pattern: 'event-loop',
  fnName: 'sleep',
  params: ['ms', 'value'],
  io: {
    harness: `async (sleep, ms, value) => {
  const start = Date.now();
  const p = sleep(ms, value);
  const isPromise = p instanceof Promise;
  const result = await p;
  const elapsed = Date.now() - start;
  return { isPromise, result, waitedEnough: elapsed >= ms - 2 };
}`,
  },
  description: `
JavaScript não tem um \`sleep\` que bloqueia, e **não deveria**: bloquear a thread trava a página inteira.

Escreva \`sleep(ms, value)\` que retorna uma **Promise** que resolve com \`value\` depois de \`ms\` milissegundos, para ser usada com \`await sleep(100)\`.
`,
  examples: [{ input: 'await sleep(50, "ok")', output: '"ok" (depois de ~50ms)' }],
  constraints: [],
  starter: {
    js: `/**
 * @param {number} ms
 * @param {any} [value]
 * @return {Promise<any>}
 */
function sleep(ms, value) {

}
`,
    ts: `function sleep<T>(ms: number, value?: T): Promise<T | undefined> {

}
`,
  },
  tests: [
    { input: [50, 'ok'], expected: { isPromise: true, result: 'ok', waitedEnough: true }, label: '50ms com valor' },
    { input: [0, 42], expected: { isPromise: true, result: 42, waitedEnough: true }, label: '0ms' },
    { input: [20, undefined], expected: { isPromise: true, result: undefined, waitedEnough: true }, label: 'Sem valor' },
  ],
  hints: [
    '`new Promise((resolve, reject) => { ... })` cria uma promise. Você decide quando chamar `resolve`.',
    'Qual API agenda algo para daqui a `ms` milissegundos? `setTimeout`.',
    '`return new Promise((resolve) => setTimeout(() => resolve(value), ms))`.',
  ],
  explanation: {
    intuition: `
É o exemplo mais simples de **transformar uma API de callback em Promise**. \`setTimeout\` aceita um callback; a Promise "embrulha" esse callback e expõe o momento em que ele roda através do \`resolve\`.

Repare que \`sleep\` **não bloqueia** nada: ela registra um timer na Web API e devolve a promise na hora. Quem faz \`await sleep(50)\` é que pausa (só a sua função async), enquanto o resto da página continua respondendo.
`,
    steps: ['Retorne `new Promise(...)`.', 'Dentro do executor: `setTimeout(() => resolve(value), ms)`.'],
    time: 'O(1)',
    space: 'O(1)',
    complexityWhy: 'Só registra um timer.',
    pitfalls: [
      'Um loop `while (Date.now() < fim) {}` "funciona", mas **congela** a thread: nada mais roda (nem cliques, nem outros timers).',
      'Esquecer de retornar a promise: `await sleep(10)` vira `await undefined` e não espera nada.',
    ],
  },
  solution: {
    js: `function sleep(ms, value) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms);
  });
}
`,
    ts: `function sleep<T>(ms: number, value?: T): Promise<T | undefined> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms);
  });
}
`,
  },
}

export const predictOrder: Problem = {
  id: 'async-predict-order',
  title: 'Prevendo a ordem do event loop',
  difficulty: 'Médio',
  pattern: 'event-loop',
  fnName: 'predictOrder',
  params: ['tasks'],
  description: `
Você recebe uma lista de "agendamentos" feitos, **nessa ordem**, no nível principal de um script. Cada item é \`{ type, label }\` (e \`ms\` para timeouts):

- \`"sync"\`: um \`console.log(label)\` direto;
- \`"promise"\`: \`Promise.resolve().then(() => console.log(label))\`;
- \`"microtask"\`: \`queueMicrotask(() => console.log(label))\`;
- \`"timeout"\`: \`setTimeout(() => console.log(label), ms)\`.

Retorne a lista de labels **na ordem em que seriam impressos**. Você está escrevendo um mini event loop!
`,
  examples: [
    {
      input: 'tasks = [{type:"timeout",label:"T",ms:0},{type:"sync",label:"S"},{type:"promise",label:"P"}]',
      output: '["S", "P", "T"]',
    },
  ],
  constraints: ['Timeouts com o mesmo ms saem na ordem em que foram registrados'],
  starter: {
    js: `/**
 * @param {{ type: 'sync' | 'promise' | 'microtask' | 'timeout', label: string, ms?: number }[]} tasks
 * @return {string[]}
 */
function predictOrder(tasks) {

}
`,
    ts: `type Task =
  | { type: 'sync' | 'promise' | 'microtask'; label: string }
  | { type: 'timeout'; label: string; ms: number };

function predictOrder(tasks: Task[]): string[] {

}
`,
  },
  tests: [
    {
      input: [
        [
          { type: 'timeout', label: 'T', ms: 0 },
          { type: 'sync', label: 'S' },
          { type: 'promise', label: 'P' },
        ],
      ],
      expected: ['S', 'P', 'T'],
      label: 'Exemplo',
    },
    {
      input: [
        [
          { type: 'sync', label: '1' },
          { type: 'timeout', label: '2', ms: 0 },
          { type: 'promise', label: '3' },
          { type: 'microtask', label: '4' },
          { type: 'sync', label: '5' },
        ],
      ],
      expected: ['1', '5', '3', '4', '2'],
      label: 'Clássico de entrevista',
    },
    {
      input: [
        [
          { type: 'timeout', label: 'lento', ms: 100 },
          { type: 'timeout', label: 'rápido', ms: 10 },
          { type: 'timeout', label: 'zero', ms: 0 },
        ],
      ],
      expected: ['zero', 'rápido', 'lento'],
      label: 'Timeouts pelo tempo',
    },
    {
      input: [
        [
          { type: 'timeout', label: 'a', ms: 5 },
          { type: 'timeout', label: 'b', ms: 5 },
          { type: 'microtask', label: 'm' },
        ],
      ],
      expected: ['m', 'a', 'b'],
      label: 'Empate: ordem de registro',
    },
    { input: [[]], expected: [], label: 'Vazio' },
  ],
  hints: [
    'Separe em três grupos: o que roda **agora** (síncrono), as **microtasks** e os **timers**.',
    '`promise` e `microtask` vão para a mesma fila (microtasks), na ordem em que foram registradas.',
    'Timers: ordene por `ms` de forma **estável** (`sort` do JS é estável desde 2019), mantendo a ordem de registro nos empates.',
  ],
  explanation: {
    intuition: `
O event loop segue uma regra simples:

1. roda todo o código **síncrono** (a call stack esvazia);
2. esvazia **toda** a fila de **microtasks** (Promises, \`queueMicrotask\`);
3. pega **uma** macrotask (timer pronto), roda, e volta ao passo 2.

Como nenhum callback aqui agenda novas tarefas, a ordem final é: síncronos → microtasks (em ordem) → timers (por tempo, empate pela ordem de registro).
`,
    steps: [
      '`sync = tasks.filter(t => t.type === "sync")`.',
      '`micro = tasks.filter(t => t.type === "promise" || t.type === "microtask")`.',
      '`timers = tasks.filter(t => t.type === "timeout").sort((a, b) => a.ms - b.ms)` (sort estável).',
      'Retorne os labels concatenados nessa ordem.',
    ],
    time: 'O(n log n)',
    space: 'O(n)',
    complexityWhy: 'Ordenar os timers domina.',
    pitfalls: ['Achar que `setTimeout(fn, 0)` roda antes de uma Promise: microtasks sempre ganham.', 'Separar promise e queueMicrotask em filas diferentes: é a mesma fila.'],
  },
  solution: {
    js: `function predictOrder(tasks) {
  const sync = tasks.filter((t) => t.type === 'sync');
  const micro = tasks.filter((t) => t.type === 'promise' || t.type === 'microtask');
  const timers = tasks.filter((t) => t.type === 'timeout').sort((a, b) => a.ms - b.ms);
  return [...sync, ...micro, ...timers].map((t) => t.label);
}
`,
    ts: `type Task =
  | { type: 'sync' | 'promise' | 'microtask'; label: string }
  | { type: 'timeout'; label: string; ms: number };

function predictOrder(tasks: Task[]): string[] {
  const sync = tasks.filter((t) => t.type === 'sync');
  const micro = tasks.filter((t) => t.type === 'promise' || t.type === 'microtask');
  const timers = tasks
    .filter((t): t is Extract<Task, { type: 'timeout' }> => t.type === 'timeout')
    .sort((a, b) => a.ms - b.ms);
  return [...sync, ...micro, ...timers].map((t) => t.label);
}
`,
  },
}

/* ======================= Callbacks ======================= */

export const promisify: Problem = {
  id: 'async-promisify',
  title: 'promisify: de callback para Promise',
  difficulty: 'Médio',
  pattern: 'callbacks',
  fnName: 'promisify',
  params: ['a', 'b'],
  io: {
    harness: `async (promisify, a, b) => {
  // API no estilo Node: o último argumento é um callback (erro, resultado)
  function divideLater(x, y, callback) {
    setTimeout(() => {
      if (y === 0) callback(new Error('divisão por zero'));
      else callback(null, x / y);
    }, 5);
  }
  const divide = promisify(divideLater);
  try {
    return { value: await divide(a, b) };
  } catch (e) {
    return { error: e.message };
  }
}`,
  },
  description: `
APIs antigas do Node usam **callbacks "error-first"**: o último argumento é uma função \`(erro, resultado)\`. Se deu certo, \`erro\` é \`null\`.

Escreva \`promisify(fn)\` que transforma uma função desse tipo numa função que **retorna uma Promise** (é o que \`util.promisify\` do Node faz):

- resolve com o \`resultado\` quando \`erro\` é null/undefined;
- rejeita com o \`erro\` caso contrário.

**Como é testado:** \`divideLater(x, y, callback)\` divide depois de 5ms, ou chama o callback com erro se \`y === 0\`.
`,
  examples: [
    { input: 'promisify(divideLater)(10, 2)', output: '{ value: 5 }' },
    { input: 'promisify(divideLater)(1, 0)', output: '{ error: "divisão por zero" }' },
  ],
  constraints: [],
  starter: {
    js: `/**
 * @param {(...args: any[]) => void} fn função cujo último argumento é (err, result) => void
 * @return {(...args: any[]) => Promise<any>}
 */
function promisify(fn) {

}
`,
    ts: `type Callback<T> = (err: Error | null, result?: T) => void;

function promisify<T>(fn: (...args: any[]) => void): (...args: any[]) => Promise<T> {

}
`,
  },
  tests: [
    { input: [10, 2], expected: { value: 5 }, label: 'Sucesso' },
    { input: [1, 0], expected: { error: 'divisão por zero' }, label: 'Erro vira rejeição' },
    { input: [0, 5], expected: { value: 0 }, label: 'Resultado 0 (falsy) também resolve' },
  ],
  hints: [
    'A função retornada recebe `...args` e precisa devolver `new Promise(...)`.',
    'Dentro da promise, chame `fn(...args, callback)`: você acrescenta o callback no fim.',
    'O callback: `(err, result) => (err ? reject(err) : resolve(result))`.',
  ],
  explanation: {
    intuition: `
Callbacks e Promises representam a mesma coisa: "um resultado que vai chegar depois". A Promise só padroniza o formato (\`then\`/\`catch\`, \`await\`) e evita o **callback hell**.

Para converter, criamos a promise e **injetamos** um callback no fim dos argumentos. Esse callback decide entre \`resolve\` e \`reject\` olhando o primeiro parâmetro (o erro).
`,
    steps: ['Retorne `(...args) => new Promise((resolve, reject) => { ... })`.', 'Dentro: `fn(...args, (err, result) => { if (err) reject(err); else resolve(result); })`.'],
    time: 'O(1)',
    space: 'O(1)',
    complexityWhy: 'Só um embrulho em volta da função.',
    pitfalls: [
      'Testar `if (result)` para decidir: resultados falsy (0, "") viram erro. Olhe o **erro**.',
      'Esquecer de repassar os argumentos originais.',
      'Para métodos de objeto, preserve o `this`: `fn.call(this, ...args, cb)` (com `function`, não arrow).',
    ],
  },
  solution: {
    js: `function promisify(fn) {
  return (...args) =>
    new Promise((resolve, reject) => {
      fn(...args, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
}
`,
    ts: `type Callback<T> = (err: Error | null, result?: T) => void;

function promisify<T>(fn: (...args: any[]) => void): (...args: any[]) => Promise<T> {
  return (...args) =>
    new Promise<T>((resolve, reject) => {
      const callback: Callback<T> = (err, result) => {
        if (err) reject(err);
        else resolve(result as T);
      };
      fn(...args, callback);
    });
}
`,
  },
}

export const after: Problem = {
  id: 'async-after',
  title: 'Esperando N callbacks',
  difficulty: 'Fácil',
  pattern: 'callbacks',
  fnName: 'after',
  params: ['n', 'delays'],
  io: {
    harness: `async (after, n, delays) => {
  const log = [];
  const done = after(n, () => log.push('tudo pronto'));
  delays.forEach((ms, i) => setTimeout(() => { log.push('tarefa ' + i); done(); }, ms));
  await new Promise((r) => setTimeout(r, Math.max(0, ...delays) + 20));
  return log;
}`,
  },
  description: `
Antes das Promises, para esperar várias operações assíncronas terminarem, usava-se um **contador** de callbacks.

Escreva \`after(n, fn)\`: retorna uma função \`done\` que só chama \`fn\` quando \`done\` tiver sido chamada **n vezes**. Chamadas depois disso não fazem nada.

**Como é testado:** dispara tarefas com \`setTimeout\` (tempos em \`delays\`); cada uma chama \`done()\` ao terminar.
`,
  examples: [{ input: 'n = 2, delays = [20, 5]', output: '["tarefa 1", "tarefa 0", "tudo pronto"]' }],
  constraints: [],
  starter: {
    js: `/**
 * @param {number} n
 * @param {() => void} fn
 * @return {() => void}
 */
function after(n, fn) {

}
`,
    ts: `function after(n: number, fn: () => void): () => void {

}
`,
  },
  tests: [
    { input: [2, [20, 5]], expected: ['tarefa 1', 'tarefa 0', 'tudo pronto'], label: 'Exemplo' },
    { input: [3, [5, 10, 15]], expected: ['tarefa 0', 'tarefa 1', 'tarefa 2', 'tudo pronto'], label: 'Três tarefas' },
    { input: [1, [5, 10]], expected: ['tarefa 0', 'tudo pronto', 'tarefa 1'], label: 'Chama fn uma vez só' },
  ],
  hints: [
    'A função retornada precisa contar quantas vezes foi chamada: closure com um contador.',
    'Quando o contador chegar em `n`, chame `fn`.',
    'Use `===` (e não `>=`) para garantir que `fn` rode uma única vez.',
  ],
  explanation: {
    intuition: `
Callbacks terminam **em qualquer ordem** (veja o exemplo: a tarefa 1 termina antes da 0). Por isso não dá para "chamar fn depois da última": não sabemos qual é a última. Contamos as conclusões.

É exatamente o que \`Promise.all\` faz por dentro, de forma mais elegante.
`,
    steps: ['`let count = 0`.', 'Retorne `() => { count++; if (count === n) fn(); }`.'],
    time: 'O(1) por chamada',
    space: 'O(1)',
    complexityWhy: 'Só um contador na closure.',
    pitfalls: ['`count >= n` chama `fn` de novo a cada chamada extra.', 'Achar que as tarefas terminam na ordem em que foram iniciadas.'],
  },
  solution: {
    js: `function after(n, fn) {
  let count = 0;
  return () => {
    count++;
    if (count === n) fn();
  };
}
`,
    ts: `function after(n: number, fn: () => void): () => void {
  let count = 0;
  return () => {
    count++;
    if (count === n) fn();
  };
}
`,
  },
}

/* ======================= Promises ======================= */

export const postTitles: Problem = {
  id: 'async-post-titles',
  title: 'Encadeando .then e .catch',
  difficulty: 'Fácil',
  pattern: 'promises',
  fnName: 'getPostTitles',
  params: ['userId'],
  io: {
    harness: `async (getPostTitles, userId) => {
  ${FAKE_API}
  const p = getPostTitles(api, userId);
  return { returnsPromise: p instanceof Promise, result: await p };
}`,
  },
  description: `
Usando **apenas \`.then\` e \`.catch\`** (sem async/await), escreva \`getPostTitles(api, userId)\`:

1. busque o usuário com \`api.getUser(userId)\`;
2. com o usuário em mãos, busque \`api.getPosts(user.id)\`;
3. resolva com \`"Nome: título 1, título 2"\`;
4. se qualquer etapa falhar, resolva com \`"Erro: <mensagem>"\` (não rejeite).

Todas as funções da \`api\` retornam Promises.
`,
  examples: [
    { input: 'userId = 1', output: '"Ana: Olá, mundo, Async é legal"' },
    { input: 'userId = 404', output: '"Erro: Usuário não encontrado"' },
  ],
  constraints: ['Use .then/.catch (o objetivo é treinar o encadeamento)'],
  starter: {
    js: `/**
 * @param {{ getUser: (id: number) => Promise<{id: number, name: string}>, getPosts: (id: number) => Promise<{title: string}[]> }} api
 * @param {number} userId
 * @return {Promise<string>}
 */
function getPostTitles(api, userId) {

}
`,
    ts: `interface Api {
  getUser(id: number): Promise<{ id: number; name: string }>;
  getPosts(userId: number): Promise<{ title: string }[]>;
}

function getPostTitles(api: Api, userId: number): Promise<string> {

}
`,
  },
  tests: [
    { input: [1], expected: { returnsPromise: true, result: 'Ana: Olá, mundo, Async é legal' }, label: 'Usuário 1' },
    { input: [2], expected: { returnsPromise: true, result: 'Bia: Primeiro post' }, label: 'Usuário 2' },
    { input: [404], expected: { returnsPromise: true, result: 'Erro: Usuário não encontrado' }, label: 'Erro vira texto' },
  ],
  hints: [
    'Se um `.then` **retorna uma promise**, o próximo `.then` espera ela resolver. Isso evita aninhar.',
    'Você precisa do nome do usuário lá no final: retorne `api.getPosts(user.id).then(posts => ...)` dentro do primeiro then, ou guarde o usuário numa variável.',
    'Um único `.catch` no fim pega erro de **qualquer** etapa anterior.',
  ],
  explanation: {
    intuition: `
O poder do \`.then\` é que ele **retorna uma nova promise**. Se o callback retorna um valor, a nova promise resolve com ele; se retorna **outra promise**, a cadeia espera ela. Assim operações dependentes ficam em sequência, sem pirâmide de callbacks.

Erros "escorregam" pela cadeia até o primeiro \`.catch\`: ele funciona como um \`try/catch\` para tudo que vem antes.
`,
    steps: [
      '`return api.getUser(userId)`',
      '`.then(user => api.getPosts(user.id).then(posts => \\`${user.name}: ${posts.map(p => p.title).join(", ")}\\`))`',
      '`.catch(err => \\`Erro: ${err.message}\\`)`',
    ],
    time: 'O(p)',
    space: 'O(p)',
    complexityWhy: 'p = número de posts para montar o texto (as esperas são de rede, não de CPU).',
    pitfalls: [
      'Esquecer o `return` dentro do `.then`: a cadeia segue com `undefined` sem esperar a requisição.',
      'Colocar `.catch` em cada etapa: erros intermediários viram "sucesso" e a cadeia continua com valores errados.',
      'Não retornar a promise da função: quem chama não consegue esperar o resultado.',
    ],
  },
  solution: {
    js: `function getPostTitles(api, userId) {
  return api
    .getUser(userId)
    .then((user) =>
      api.getPosts(user.id).then((posts) => \`\${user.name}: \${posts.map((p) => p.title).join(', ')}\`),
    )
    .catch((err) => \`Erro: \${err.message}\`);
}
`,
    ts: `interface Api {
  getUser(id: number): Promise<{ id: number; name: string }>;
  getPosts(userId: number): Promise<{ title: string }[]>;
}

function getPostTitles(api: Api, userId: number): Promise<string> {
  return api
    .getUser(userId)
    .then((user) =>
      api.getPosts(user.id).then((posts) => \`\${user.name}: \${posts.map((p) => p.title).join(', ')}\`),
    )
    .catch((err: Error) => \`Erro: \${err.message}\`);
}
`,
  },
}

export const promiseAll: Problem = {
  id: 'async-promise-all',
  title: 'Implementando Promise.all',
  difficulty: 'Médio',
  pattern: 'promises',
  fnName: 'promiseAll',
  params: ['specs'],
  io: {
    harness: `async (promiseAll, specs) => {
  ${MAKE}
  try {
    return { values: await promiseAll(specs.map(make)) };
  } catch (e) {
    return { rejected: e };
  }
}`,
  },
  description: `
Implemente \`promiseAll(promises)\` com o mesmo comportamento de \`Promise.all\`, **sem usá-lo**:

- resolve com um array dos valores **na mesma ordem das promises de entrada** (não na ordem em que terminaram);
- rejeita **assim que qualquer uma** rejeitar, com o motivo dela;
- array vazio resolve imediatamente com \`[]\`.

**Como é testado:** cada item de \`specs\` é \`[ok, valor, ms]\` e vira uma promise que resolve (ou rejeita) com \`valor\` depois de \`ms\`.
`,
  examples: [
    { input: 'specs = [[true,"a",30],[true,"b",10]]', output: '{ values: ["a", "b"] }', explanation: '"b" termina primeiro, mas o resultado respeita a ordem de entrada.' },
    { input: 'specs = [[true,"a",30],[false,"falhou",10]]', output: '{ rejected: "falhou" }' },
  ],
  constraints: ['Não use Promise.all / allSettled / race / any'],
  starter: {
    js: `/**
 * @param {Promise<any>[]} promises
 * @return {Promise<any[]>}
 */
function promiseAll(promises) {

}
`,
    ts: `function promiseAll<T>(promises: Promise<T>[]): Promise<T[]> {

}
`,
  },
  tests: [
    {
      input: [
        [
          [true, 'a', 30],
          [true, 'b', 10],
          [true, 'c', 20],
        ],
      ],
      expected: { values: ['a', 'b', 'c'] },
      label: 'Ordem de entrada',
    },
    {
      input: [
        [
          [true, 'a', 30],
          [false, 'falhou', 10],
        ],
      ],
      expected: { rejected: 'falhou' },
      label: 'Uma rejeição derruba tudo',
    },
    { input: [[]], expected: { values: [] }, label: 'Array vazio' },
    {
      input: [
        [
          [true, 0, 5],
          [true, null, 5],
        ],
      ],
      expected: { values: [0, null] },
      label: 'Valores falsy',
    },
  ],
  hints: [
    'Retorne `new Promise((resolve, reject) => ...)` e assine cada promise com `.then`.',
    'Guarde cada resultado em `results[i]` (posição de entrada) e conte quantas já terminaram. Não use `results.length`: posições preenchidas fora de ordem deixam "buracos".',
    'Quando `done === promises.length`, `resolve(results)`. No `.then`, passe `reject` como segundo argumento (ou use `.catch(reject)`).',
  ],
  explanation: {
    intuition: `
É o \`after(n, fn)\` da aula de callbacks com Promises: contamos as conclusões e só resolvemos quando todas terminarem. Dois detalhes fazem a diferença:

- **ordem**: guardamos pelo índice \`i\`, não com \`push\` (que seguiria a ordem de chegada);
- **contador**: \`results.length\` mente quando \`results[2]\` é preenchido antes de \`results[0]\` (vira 3!). Use um contador separado.

Chamar \`reject\` mais de uma vez não tem efeito: a primeira rejeição "vence".
`,
    steps: [
      'Se a lista está vazia, resolva com `[]`.',
      '`results = new Array(n)`, `done = 0`.',
      'Para cada `p` no índice `i`: `Promise.resolve(p).then(v => { results[i] = v; done++; if (done === n) resolve(results); }, reject)`.',
    ],
    time: 'O(n)',
    space: 'O(n)',
    complexityWhy: 'Uma assinatura e um slot de resultado por promise; o tempo de espera é o da mais lenta.',
    pitfalls: ['`results.push(v)`: ordem de chegada, não de entrada.', '`if (results.length === n)`: falha quando terminam fora de ordem.', 'Esquecer o caso do array vazio (a promise nunca resolveria).'],
  },
  solution: {
    js: `function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    if (promises.length === 0) return resolve([]);
    const results = new Array(promises.length);
    let done = 0;
    promises.forEach((p, i) => {
      Promise.resolve(p).then((value) => {
        results[i] = value;
        done++;
        if (done === promises.length) resolve(results);
      }, reject);
    });
  });
}
`,
    ts: `function promiseAll<T>(promises: Promise<T>[]): Promise<T[]> {
  return new Promise((resolve, reject) => {
    if (promises.length === 0) return resolve([]);
    const results: T[] = new Array(promises.length);
    let done = 0;
    promises.forEach((p, i) => {
      Promise.resolve(p).then((value) => {
        results[i] = value;
        done++;
        if (done === promises.length) resolve(results);
      }, reject);
    });
  });
}
`,
  },
}

/* ======================= async / await ======================= */

export const dashboard: Problem = {
  id: 'async-dashboard',
  title: 'Dashboard com async/await',
  difficulty: 'Médio',
  pattern: 'async-await',
  fnName: 'loadDashboard',
  params: ['userId'],
  io: {
    harness: `async (loadDashboard, userId) => {
  ${FAKE_API}
  const start = Date.now();
  const result = await loadDashboard(api, userId);
  const elapsed = Date.now() - start;
  return { result, parallel: 'error' in result || elapsed < 80 };
}`,
  },
  description: `
Escreva \`async function loadDashboard(api, userId)\`:

1. busque o usuário (\`api.getUser\`), que é necessário antes de tudo;
2. depois busque **em paralelo** \`api.getPosts(user.id)\` e \`api.getFriends(user.id)\` (cada uma leva ~40ms);
3. retorne \`{ name, posts: quantidadeDePosts, friends: quantidadeDeAmigos }\`;
4. se qualquer chamada falhar, retorne \`{ error: mensagem }\` (use \`try/catch\`).

**Como é testado:** além do resultado, o teste mede o tempo. Buscar posts e amigos um depois do outro leva ~90ms; em paralelo, ~50ms (limite: 80ms).
`,
  examples: [
    { input: 'userId = 1', output: '{ result: { name: "Ana", posts: 2, friends: 3 }, parallel: true }' },
    { input: 'userId = 404', output: '{ result: { error: "Usuário não encontrado" }, parallel: true }' },
  ],
  constraints: [],
  starter: {
    js: `/**
 * @param {{ getUser: Function, getPosts: Function, getFriends: Function }} api
 * @param {number} userId
 */
async function loadDashboard(api, userId) {

}
`,
    ts: `interface Api {
  getUser(id: number): Promise<{ id: number; name: string }>;
  getPosts(userId: number): Promise<{ title: string }[]>;
  getFriends(userId: number): Promise<string[]>;
}

type Dashboard = { name: string; posts: number; friends: number } | { error: string };

async function loadDashboard(api: Api, userId: number): Promise<Dashboard> {

}
`,
  },
  tests: [
    { input: [1], expected: { result: { name: 'Ana', posts: 2, friends: 3 }, parallel: true }, label: 'Usuário 1' },
    { input: [2], expected: { result: { name: 'Bia', posts: 1, friends: 1 }, parallel: true }, label: 'Usuário 2' },
    { input: [404], expected: { result: { error: 'Usuário não encontrado' }, parallel: true }, label: 'Usuário inexistente' },
    { input: [500], expected: { result: { error: 'Serviço de amigos fora do ar' }, parallel: true }, label: 'Uma das chamadas paralelas falha' },
  ],
  hints: [
    '`const user = await api.getUser(userId)` primeiro: as outras dependem do `user.id`.',
    '`await a(); await b();` espera uma terminar para começar a outra. Para paralelo: **dispare as duas** e espere juntas.',
    '`const [posts, friends] = await Promise.all([api.getPosts(user.id), api.getFriends(user.id)])`, tudo dentro de `try { } catch (e) { return { error: e.message } }`.',
  ],
  explanation: {
    intuition: `
\`async/await\` deixa código assíncrono com cara de síncrono, mas é fácil cair na armadilha do **await em sequência sem necessidade**:

\`\`\`
const posts = await api.getPosts(id);     // 40ms
const friends = await api.getFriends(id); // +40ms (só começa depois!)
\`\`\`

Posts e amigos não dependem um do outro, então devem ser **disparados juntos** com \`Promise.all\`. O tempo total cai para o da mais lenta. O usuário, por outro lado, precisa vir antes (dependência real).

\`try/catch\` com \`await\` captura rejeições como se fossem exceções síncronas.
`,
    steps: [
      '`try {`',
      '`const user = await api.getUser(userId)`.',
      '`const [posts, friends] = await Promise.all([api.getPosts(user.id), api.getFriends(user.id)])`.',
      '`return { name: user.name, posts: posts.length, friends: friends.length }`.',
      '`} catch (e) { return { error: e.message } }`.',
    ],
    time: 'O(1) de CPU · ~50ms de espera',
    space: 'O(p + f)',
    complexityWhy: 'O tempo é dominado pela rede: getUser (10ms) + a mais lenta das paralelas (40ms).',
    pitfalls: [
      'Dois `await` seguidos para chamadas independentes: dobra o tempo de espera.',
      '`array.forEach(async (x) => await ...)`: o forEach **não espera** os callbacks async. Use `for...of` (sequencial) ou `Promise.all(arr.map(...))` (paralelo).',
      'Esquecer o `await` no `Promise.all`: você recebe uma promise, não os resultados.',
    ],
  },
  solution: {
    js: `async function loadDashboard(api, userId) {
  try {
    const user = await api.getUser(userId);
    const [posts, friends] = await Promise.all([api.getPosts(user.id), api.getFriends(user.id)]);
    return { name: user.name, posts: posts.length, friends: friends.length };
  } catch (e) {
    return { error: e.message };
  }
}
`,
    ts: `interface Api {
  getUser(id: number): Promise<{ id: number; name: string }>;
  getPosts(userId: number): Promise<{ title: string }[]>;
  getFriends(userId: number): Promise<string[]>;
}

type Dashboard = { name: string; posts: number; friends: number } | { error: string };

async function loadDashboard(api: Api, userId: number): Promise<Dashboard> {
  try {
    const user = await api.getUser(userId);
    const [posts, friends] = await Promise.all([api.getPosts(user.id), api.getFriends(user.id)]);
    return { name: user.name, posts: posts.length, friends: friends.length };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
`,
  },
}

export const retry: Problem = {
  id: 'async-retry',
  title: 'retry com async/await',
  difficulty: 'Médio',
  pattern: 'async-await',
  fnName: 'retry',
  params: ['failures', 'attempts'],
  io: {
    harness: `async (retry, failures, attempts) => {
  let calls = 0;
  const flaky = async () => {
    calls++;
    await new Promise((r) => setTimeout(r, 2));
    if (calls <= failures) throw new Error('falha ' + calls);
    return 'sucesso na tentativa ' + calls;
  };
  try {
    return { value: await retry(flaky, attempts), calls };
  } catch (e) {
    return { error: e.message, calls };
  }
}`,
  },
  description: `
Requisições falham de vez em quando (rede instável, servidor ocupado). Escreva \`async function retry(fn, attempts)\`:

- chama \`await fn()\`;
- se der certo, retorna o valor;
- se falhar, tenta de novo, até \`attempts\` tentativas **no total**;
- se todas falharem, **rejeita com o erro da última tentativa**.

**Como é testado:** \`flaky()\` falha nas primeiras \`failures\` chamadas e depois funciona.
`,
  examples: [
    { input: 'failures = 2, attempts = 3', output: '{ value: "sucesso na tentativa 3", calls: 3 }' },
    { input: 'failures = 5, attempts = 3', output: '{ error: "falha 3", calls: 3 }' },
  ],
  constraints: ['attempts >= 1'],
  starter: {
    js: `/**
 * @param {() => Promise<any>} fn
 * @param {number} attempts
 */
async function retry(fn, attempts) {

}
`,
    ts: `async function retry<T>(fn: () => Promise<T>, attempts: number): Promise<T> {

}
`,
  },
  tests: [
    { input: [2, 3], expected: { value: 'sucesso na tentativa 3', calls: 3 }, label: 'Funciona na última' },
    { input: [0, 3], expected: { value: 'sucesso na tentativa 1', calls: 1 }, label: 'Funciona de primeira' },
    { input: [5, 3], expected: { error: 'falha 3', calls: 3 }, label: 'Desiste após 3' },
    { input: [1, 1], expected: { error: 'falha 1', calls: 1 }, label: 'Uma tentativa só' },
  ],
  hints: [
    'Um `for` de 1 até `attempts` com `try { return await fn(); } catch (e) { lastError = e; }`.',
    'Atenção ao `return await`: sem o `await`, a rejeição escapa do `try` e não é capturada!',
    'Depois do loop, `throw lastError`.',
  ],
  explanation: {
    intuition: `
Com \`async/await\`, um retry é só um **loop com try/catch**. O detalhe que pega muita gente: dentro de um \`try\`, \`return fn()\` (sem \`await\`) devolve a promise **sem esperá-la**; se ela rejeitar, o erro acontece depois que o \`try\` já terminou. \`return await fn()\` espera ali dentro, então o \`catch\` funciona.

Em produção, adicione uma espera crescente entre as tentativas (**backoff exponencial**: 100ms, 200ms, 400ms...) para não martelar um servidor que já está com problema.
`,
    steps: ['`let lastError`.', 'Para `i` de 1 a `attempts`: `try { return await fn(); } catch (e) { lastError = e; }`.', '`throw lastError`.'],
    time: 'O(attempts)',
    space: 'O(1)',
    complexityWhy: 'No máximo `attempts` chamadas.',
    pitfalls: ['`return fn()` dentro do try (sem await): o catch nunca vê a rejeição.', 'Contar errado: `attempts` é o total de tentativas, não o número de "re"tentativas.', 'Engolir o erro e retornar `undefined` quando tudo falha.'],
  },
  solution: {
    js: `async function retry(fn, attempts) {
  let lastError;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError;
}
`,
    ts: `async function retry<T>(fn: () => Promise<T>, attempts: number): Promise<T> {
  let lastError: unknown;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError;
}
`,
  },
}

/* ======================= Combinadores e concorrência ======================= */

export const allSettled: Problem = {
  id: 'async-all-settled',
  title: 'Implementando Promise.allSettled',
  difficulty: 'Médio',
  pattern: 'concorrencia',
  fnName: 'allSettled',
  params: ['specs'],
  io: {
    harness: `async (allSettled, specs) => {
  ${MAKE}
  return await allSettled(specs.map(make));
}`,
  },
  description: `
\`Promise.all\` desiste na primeira falha. Às vezes você quer o resultado de **todas**, mesmo das que falharam (ex.: enviar 10 e-mails e mostrar quais deram erro).

Implemente \`allSettled(promises)\` sem usar os combinadores nativos. Ela **nunca rejeita** e resolve com um array, na ordem de entrada, de:
- \`{ status: "fulfilled", value }\` para as que resolveram;
- \`{ status: "rejected", reason }\` para as que rejeitaram.
`,
  examples: [{ input: 'specs = [[true,"ok",10],[false,"erro",5]]', output: '[{status:"fulfilled",value:"ok"},{status:"rejected",reason:"erro"}]' }],
  constraints: ['Não use os combinadores nativos'],
  starter: {
    js: `/**
 * @param {Promise<any>[]} promises
 */
function allSettled(promises) {

}
`,
    ts: `type Settled<T> = { status: 'fulfilled'; value: T } | { status: 'rejected'; reason: unknown };

function allSettled<T>(promises: Promise<T>[]): Promise<Settled<T>[]> {

}
`,
  },
  tests: [
    {
      input: [
        [
          [true, 'ok', 10],
          [false, 'erro', 5],
        ],
      ],
      expected: [
        { status: 'fulfilled', value: 'ok' },
        { status: 'rejected', reason: 'erro' },
      ],
      label: 'Exemplo',
    },
    { input: [[]], expected: [], label: 'Vazio' },
    {
      input: [
        [
          [false, 'a', 15],
          [false, 'b', 5],
        ],
      ],
      expected: [
        { status: 'rejected', reason: 'a' },
        { status: 'rejected', reason: 'b' },
      ],
      label: 'Todas falham (e mesmo assim resolve)',
    },
  ],
  hints: [
    'Transforme cada promise numa promise que **nunca rejeita**: `p.then(value => ({ status: "fulfilled", value }), reason => ({ status: "rejected", reason }))`.',
    'Agora todas resolvem: dá para aguardar todas juntas.',
    'Se puder usar o seu `promiseAll` da aula de Promises, é uma linha. Aqui, use um contador como lá.',
  ],
  explanation: {
    intuition: `
O truque é **normalizar**: o segundo argumento do \`.then\` trata a rejeição e devolve um **valor normal**, então a promise resultante sempre resolve. Depois é igual ao \`Promise.all\`: contar e guardar pelo índice.

Resumo dos combinadores:
- \`all\`: todas, ou falha na primeira rejeição;
- \`allSettled\`: todas, nunca falha;
- \`race\`: a primeira que **terminar** (resolver ou rejeitar);
- \`any\`: a primeira que **resolver** (falha só se todas falharem).
`,
    steps: [
      'Vazio → resolve `[]`.',
      'Para cada `p` em `i`: `Promise.resolve(p).then(ok, fail)` onde ambos gravam `results[i]` e incrementam `done`.',
      'Quando `done === n`, resolve.',
    ],
    time: 'O(n)',
    space: 'O(n)',
    complexityWhy: 'Um resultado por promise.',
    pitfalls: ['Usar `.catch` separado e esquecer de marcar como concluída.', 'Perder a ordem de entrada.'],
  },
  solution: {
    js: `function allSettled(promises) {
  return new Promise((resolve) => {
    if (promises.length === 0) return resolve([]);
    const results = new Array(promises.length);
    let done = 0;
    const settle = (i, outcome) => {
      results[i] = outcome;
      done++;
      if (done === promises.length) resolve(results);
    };
    promises.forEach((p, i) => {
      Promise.resolve(p).then(
        (value) => settle(i, { status: 'fulfilled', value }),
        (reason) => settle(i, { status: 'rejected', reason }),
      );
    });
  });
}
`,
    ts: `type Settled<T> = { status: 'fulfilled'; value: T } | { status: 'rejected'; reason: unknown };

function allSettled<T>(promises: Promise<T>[]): Promise<Settled<T>[]> {
  return new Promise((resolve) => {
    if (promises.length === 0) return resolve([]);
    const results: Settled<T>[] = new Array(promises.length);
    let done = 0;
    const settle = (i: number, outcome: Settled<T>) => {
      results[i] = outcome;
      done++;
      if (done === promises.length) resolve(results);
    };
    promises.forEach((p, i) => {
      Promise.resolve(p).then(
        (value) => settle(i, { status: 'fulfilled', value }),
        (reason) => settle(i, { status: 'rejected', reason }),
      );
    });
  });
}
`,
  },
}

export const withTimeout: Problem = {
  id: 'async-with-timeout',
  title: 'Timeout com Promise.race',
  difficulty: 'Fácil',
  pattern: 'concorrencia',
  fnName: 'withTimeout',
  params: ['taskMs', 'limitMs'],
  io: {
    harness: `async (withTimeout, taskMs, limitMs) => {
  const task = new Promise((r) => setTimeout(() => r('dados'), taskMs));
  try {
    return 'ok: ' + (await withTimeout(task, limitMs));
  } catch (e) {
    return 'erro: ' + (e instanceof Error ? e.message : String(e));
  }
}`,
  },
  description: `
Escreva \`withTimeout(promise, ms)\`: retorna uma promise que

- resolve com o valor de \`promise\` se ela terminar **antes** de \`ms\`;
- rejeita com \`new Error("timeout")\` se demorar mais que isso.

É o que você usaria para não deixar uma requisição travar a tela para sempre.
`,
  examples: [
    { input: 'tarefa de 10ms, limite 50ms', output: '"ok: dados"' },
    { input: 'tarefa de 80ms, limite 20ms', output: '"erro: timeout"' },
  ],
  constraints: [],
  starter: {
    js: `/**
 * @param {Promise<any>} promise
 * @param {number} ms
 */
function withTimeout(promise, ms) {

}
`,
    ts: `function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {

}
`,
  },
  tests: [
    { input: [10, 50], expected: 'ok: dados', label: 'Dentro do prazo' },
    { input: [80, 20], expected: 'erro: timeout', label: 'Estourou o prazo' },
    { input: [0, 30], expected: 'ok: dados', label: 'Instantâneo' },
  ],
  hints: [
    'Crie uma segunda promise que **rejeita** depois de `ms` milissegundos.',
    '`Promise.race([a, b])` assume o resultado da primeira que terminar.',
    '`return Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms))])`.',
  ],
  explanation: {
    intuition: `
\`Promise.race\` é uma "corrida": quem terminar primeiro (resolvendo **ou** rejeitando) define o resultado. Colocando para correr a tarefa contra um timer que rejeita, ganhamos um timeout.

Detalhe importante: o timeout **não cancela** a tarefa original; ela continua rodando, só que ninguém mais espera por ela. Para cancelar de verdade uma requisição, use \`AbortController\` (\`fetch(url, { signal })\`).
`,
    steps: ['`const timer = new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms))`.', '`return Promise.race([promise, timer])`.'],
    time: 'O(1)',
    space: 'O(1)',
    complexityWhy: 'Uma promise extra e um timer.',
    pitfalls: ['Rejeitar com string (`reject("timeout")`): perde o stack trace; prefira `new Error`.', 'Não limpar o timer: em servidores Node, timers pendentes podem manter o processo vivo. Guarde o id e use `clearTimeout` no `finally`.'],
  },
  solution: {
    js: `function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('timeout')), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
`,
    ts: `function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('timeout')), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
`,
  },
}

export const mapLimit: Problem = {
  id: 'async-map-limit',
  title: 'Concorrência limitada (pool)',
  difficulty: 'Difícil',
  pattern: 'concorrencia',
  fnName: 'mapLimit',
  params: ['items', 'limit'],
  io: {
    harness: `async (mapLimit, items, limit) => {
  let active = 0;
  let maxActive = 0;
  const work = async (x) => {
    active++;
    maxActive = Math.max(maxActive, active);
    await new Promise((r) => setTimeout(r, 5 + (x % 3) * 5));
    active--;
    return x * 2;
  };
  const results = await mapLimit(items, limit, work);
  return { results, maxActive };
}`,
  },
  description: `
Você precisa processar 1000 itens chamando uma API, mas ela aceita no máximo **\`limit\` requisições simultâneas**. \`Promise.all(items.map(fn))\` dispara tudo de uma vez; em sequência fica lento demais.

Escreva \`async mapLimit(items, limit, fn)\`:
- nunca mais que \`limit\` chamadas de \`fn\` em andamento ao mesmo tempo;
- assim que uma terminar, a próxima começa;
- retorna os resultados **na ordem dos itens**.

**Como é testado:** \`fn\` mede quantas execuções estão ativas ao mesmo tempo (\`maxActive\`), que precisa ser exatamente \`min(limit, items.length)\`.
`,
  examples: [{ input: 'items = [1,2,3,4,5], limit = 2', output: '{ results: [2,4,6,8,10], maxActive: 2 }' }],
  constraints: ['limit >= 1'],
  starter: {
    js: `/**
 * @param {any[]} items
 * @param {number} limit
 * @param {(item: any) => Promise<any>} fn
 * @return {Promise<any[]>}
 */
async function mapLimit(items, limit, fn) {

}
`,
    ts: `async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {

}
`,
  },
  tests: [
    { input: [[1, 2, 3, 4, 5], 2], expected: { results: [2, 4, 6, 8, 10], maxActive: 2 }, label: 'Exemplo' },
    { input: [[1, 2, 3], 5], expected: { results: [2, 4, 6], maxActive: 3 }, label: 'Limite maior que a lista' },
    { input: [[7, 8, 9, 10], 1], expected: { results: [14, 16, 18, 20], maxActive: 1 }, label: 'Limite 1 = sequencial' },
    { input: [[], 3], expected: { results: [], maxActive: 0 }, label: 'Vazio' },
  ],
  hints: [
    'Pense em `limit` "trabalhadores". Cada um pega o próximo item livre da fila, processa e volta para pegar outro.',
    'Um índice compartilhado `next` (closure) diz qual é o próximo item. Como JS é single-thread, `const i = next++` é seguro.',
    '`const worker = async () => { while (next < items.length) { const i = next++; results[i] = await fn(items[i]); } }`; depois `await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))`.',
  ],
  explanation: {
    intuition: `
O padrão **worker pool**: criamos \`limit\` funções async ("trabalhadores") que rodam em paralelo. Cada uma fica num loop: pega o próximo índice livre, espera \`fn\` terminar e repete. Assim nunca há mais que \`limit\` chamadas ativas, e nenhum trabalhador fica parado enquanto houver itens.

Não há condição de corrida em \`next++\`: o JS executa uma coisa por vez, e entre \`await\`s o código roda sem interrupção. Pergunta comum em entrevistas de nível pleno, e muito útil na vida real (APIs com rate limit, uploads em lote).
`,
    steps: [
      '`results = new Array(items.length)`, `next = 0`.',
      '`worker`: `while (next < items.length) { const i = next++; results[i] = await fn(items[i]); }`.',
      'Dispare `Math.min(limit, items.length)` workers e `await Promise.all(...)` neles.',
      'Retorne `results`.',
    ],
    time: 'O(n)',
    space: 'O(n)',
    complexityWhy: 'Cada item é processado uma vez; o tempo de espera total é ~ n/limit lotes.',
    pitfalls: [
      'Dividir em lotes fixos (`chunk` de `limit` + `Promise.all` por lote): funciona, mas o lote inteiro espera o item mais lento.',
      '`results.push(...)`: ordem de chegada, não dos itens.',
      'Disparar `limit` workers mesmo com menos itens: alguns terminam na hora (ok), mas confira o caso vazio.',
    ],
  },
  solution: {
    js: `async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  };
  const workers = Array.from({ length: Math.min(limit, items.length) }, worker);
  await Promise.all(workers);
  return results;
}
`,
    ts: `async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const worker = async (): Promise<void> => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  };
  const workers = Array.from({ length: Math.min(limit, items.length) }, worker);
  await Promise.all(workers);
  return results;
}
`,
  },
}

export const debounce: Problem = {
  id: 'async-debounce',
  title: 'debounce',
  difficulty: 'Médio',
  pattern: 'concorrencia',
  fnName: 'debounce',
  params: ['script'],
  io: {
    harness: `async (debounce, script) => {
  const calls = [];
  const search = debounce((term) => calls.push(term), 30);
  for (const [term, waitAfter] of script) {
    search(term);
    await new Promise((r) => setTimeout(r, waitAfter));
  }
  await new Promise((r) => setTimeout(r, 60));
  return calls;
}`,
  },
  description: `
Num campo de busca, disparar uma requisição a **cada tecla** sobrecarrega o servidor. O **debounce** espera o usuário **parar de digitar** por um tempo antes de chamar a função.

Escreva \`debounce(fn, ms)\`: retorna uma função que, a cada chamada, **cancela** o agendamento anterior e agenda \`fn(...args)\` para daqui a \`ms\`. Só a última chamada de uma "rajada" executa.

**Como é testado:** \`script\` é uma lista de \`[termo, espera]\`: chama a função debounced com o termo e espera \`espera\` ms antes do próximo (o debounce é de 30ms).
`,
  examples: [
    { input: 'script = [["r",5],["re",5],["rea",5],["reac",5],["react",100]]', output: '["react"]', explanation: 'Digitação rápida: só a última chamada sobrevive.' },
  ],
  constraints: [],
  starter: {
    js: `/**
 * @param {(...args: any[]) => void} fn
 * @param {number} ms
 */
function debounce(fn, ms) {

}
`,
    ts: `function debounce<A extends unknown[]>(fn: (...args: A) => void, ms: number): (...args: A) => void {

}
`,
  },
  tests: [
    {
      input: [
        [
          ['r', 5],
          ['re', 5],
          ['rea', 5],
          ['reac', 5],
          ['react', 100],
        ],
      ],
      expected: ['react'],
      label: 'Rajada de digitação',
    },
    {
      input: [
        [
          ['vue', 60],
          ['svelte', 60],
        ],
      ],
      expected: ['vue', 'svelte'],
      label: 'Pausas longas: as duas executam',
    },
    {
      input: [
        [
          ['a', 5],
          ['ab', 60],
          ['abc', 5],
          ['abcd', 5],
        ],
      ],
      expected: ['ab', 'abcd'],
      label: 'Duas rajadas',
    },
  ],
  hints: [
    'O debounce precisa lembrar do timer agendado entre as chamadas: closure com `let timer`.',
    'A cada chamada: `clearTimeout(timer)` (cancela o anterior) e agenda um novo.',
    '`return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); }`.',
  ],
  explanation: {
    intuition: `
Debounce junta três conceitos do módulo: **closure** (guarda o timer), **macrotask** (\`setTimeout\`) e **cancelamento** (\`clearTimeout\`). Cada nova chamada "empurra" a execução para frente; a função só roda quando as chamadas param por \`ms\` milissegundos.

Parente próximo: o **throttle**, que garante **no máximo uma** execução a cada \`ms\` (útil em scroll e resize), em vez de esperar parar.
`,
    steps: ['`let timer`.', 'Retorne `(...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); }`.'],
    time: 'O(1) por chamada',
    space: 'O(1)',
    complexityWhy: 'Só um timer guardado.',
    pitfalls: ['Criar `let timer` dentro da função retornada: cada chamada tem o seu e nada é cancelado.', 'Chamar `fn` com os argumentos da **primeira** chamada da rajada: o certo é a última.'],
  },
  solution: {
    js: `function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
`,
    ts: `function debounce<A extends unknown[]>(fn: (...args: A) => void, ms: number): (...args: A) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: A) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
`,
  },
}
