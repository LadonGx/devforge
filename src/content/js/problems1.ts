import type { Problem } from '../types'

/* ======================= Tipos e coerção ======================= */

export const getType: Problem = {
  id: 'js-get-type',
  title: 'Tipo de verdade',
  difficulty: 'Fácil',
  pattern: 'tipos-coercao',
  fnName: 'getType',
  params: ['value'],
  description: `
O operador \`typeof\` tem pegadinhas famosas: \`typeof null === "object"\`, \`typeof [] === "object"\` e \`typeof NaN === "number"\`.

Escreva \`getType(value)\` que retorna o tipo **de verdade**:

- \`null\` → \`"null"\`
- arrays → \`"array"\`
- \`NaN\` → \`"nan"\`
- qualquer outro → o resultado de \`typeof\` (\`"number"\`, \`"string"\`, \`"boolean"\`, \`"undefined"\`, \`"object"\`...)
`,
  examples: [
    { input: 'getType(null)', output: '"null"' },
    { input: 'getType([1, 2])', output: '"array"' },
    { input: 'getType(NaN)', output: '"nan"' },
    { input: 'getType("oi")', output: '"string"' },
  ],
  constraints: [],
  starter: {
    js: `/**
 * @param {unknown} value
 * @return {string}
 */
function getType(value) {

}
`,
    ts: `function getType(value: unknown): string {

}
`,
  },
  tests: [
    { input: [null], expected: 'null', label: 'null' },
    { input: [[]], expected: 'array', label: 'array vazio' },
    { input: [[1, 2, 3]], expected: 'array', label: 'array' },
    { input: [{}], expected: 'object', label: 'objeto' },
    { input: [NaN], expected: 'nan', label: 'NaN' },
    { input: [42], expected: 'number', label: 'número' },
    { input: ['42'], expected: 'string', label: 'string numérica' },
    { input: [false], expected: 'boolean', label: 'boolean' },
    { input: [undefined], expected: 'undefined', label: 'undefined' },
  ],
  hints: [
    'Trate primeiro os casos em que `typeof` "mente": null, arrays e NaN. Depois use `typeof`.',
    'Para arrays use `Array.isArray(value)`. Para NaN, `Number.isNaN(value)` (não confunda com o `isNaN` global, que converte antes!).',
    'Cuidado com a ordem: `value === null` precisa vir antes de qualquer acesso a propriedade.',
  ],
  explanation: {
    intuition: `
\`typeof\` olha o **tipo interno** do valor. \`null\` é um valor primitivo, mas por um bug histórico da primeira versão do JS, \`typeof null\` devolve \`"object"\` (e nunca foi corrigido para não quebrar a web). Arrays **são** objetos, então \`typeof\` não os diferencia. E NaN ("not a number") é, ironicamente, do tipo number.

Por isso, checagens de tipo robustas sempre tratam esses casos antes.
`,
    steps: ['`if (value === null) return "null"`.', '`if (Array.isArray(value)) return "array"`.', '`if (Number.isNaN(value)) return "nan"`.', '`return typeof value`.'],
    time: 'O(1)',
    space: 'O(1)',
    complexityWhy: 'Só algumas comparações.',
    pitfalls: [
      '`isNaN("abc")` é `true` (converte a string para número antes). `Number.isNaN("abc")` é `false`. Use o segundo.',
      '`value instanceof Array` funciona, mas falha com arrays vindos de outro frame/iframe; `Array.isArray` é o jeito certo.',
    ],
  },
  solution: {
    js: `function getType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (Number.isNaN(value)) return 'nan';
  return typeof value;
}
`,
    ts: `function getType(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (Number.isNaN(value)) return 'nan';
  return typeof value;
}
`,
  },
}

export const sumNumeric: Problem = {
  id: 'js-sum-numeric',
  title: 'Somando o que é número',
  difficulty: 'Fácil',
  pattern: 'tipos-coercao',
  fnName: 'sumNumeric',
  params: ['values'],
  description: `
Você recebe um array \`values\` com dados "sujos" vindos de um formulário: números, strings, booleanos, \`null\`...

Some apenas o que **representa um número de verdade**:
- números finitos (ignore \`NaN\` e \`Infinity\`);
- strings que, depois de \`trim()\`, **não são vazias** e viram um número finito (\`" 3.5 "\` conta como 3.5).

Ignore todo o resto (\`true\`, \`null\`, \`""\`, \`"abc"\`, arrays...).
`,
  examples: [
    { input: 'values = [1, "2", " 3 ", "", null, true, "abc"]', output: '6' },
    { input: 'values = ["10", NaN, Infinity, "1e2"]', output: '110' },
  ],
  constraints: ['0 <= values.length <= 1000'],
  starter: {
    js: `/**
 * @param {unknown[]} values
 * @return {number}
 */
function sumNumeric(values) {

}
`,
    ts: `function sumNumeric(values: unknown[]): number {

}
`,
  },
  tests: [
    { input: [[1, '2', ' 3 ', '', null, true, 'abc']], expected: 6, label: 'Exemplo 1' },
    { input: [['10', NaN, Infinity, '1e2']], expected: 110, label: 'Exemplo 2' },
    { input: [[]], expected: 0, label: 'Vazio' },
    { input: [['  ', '\n', false, undefined]], expected: 0, label: 'Só "falsos números"' },
    { input: [['-4', 4, '0.5', [7], { n: 1 }]], expected: 0.5, label: 'Negativos e objetos' },
  ],
  compare: 'float',
  hints: [
    'Teste no Laboratório da aula: `Number("")`, `Number(" ")`, `Number(null)` e `Number(true)`. O que retornam?',
    'Todos viram 0 ou 1! Por isso você não pode simplesmente fazer `Number(x)` em tudo: precisa olhar o **tipo** antes.',
    'Use `typeof x === "number"` ou `typeof x === "string" && x.trim() !== ""`, converta com `Number(...)` e confira com `Number.isFinite`.',
  ],
  explanation: {
    intuition: `
\`Number(x)\` é generoso demais: \`Number("")\`, \`Number(" ")\` e \`Number(null)\` dão **0**, \`Number(true)\` dá **1** e \`Number([7])\` dá **7**. Se você converter tudo às cegas, soma lixo.

A regra prática: **decida pelo tipo primeiro**, converta depois, e valide o resultado com \`Number.isFinite\` (que já descarta NaN e ±Infinity).
`,
    steps: [
      'Para cada `x`: se `typeof x === "number"`, candidato = x.',
      'Se `typeof x === "string"` e `x.trim() !== ""`, candidato = `Number(x)`.',
      'Senão, ignore.',
      'Some o candidato se `Number.isFinite(candidato)`.',
    ],
    time: 'O(n)',
    space: 'O(1)',
    complexityWhy: 'Uma passada pelo array.',
    pitfalls: ['`parseFloat("12abc")` dá 12 (lê até onde consegue). `Number("12abc")` dá NaN. Aqui queremos o rigor do `Number`.', '`isFinite("5")` global converte a string; `Number.isFinite("5")` é false. Use a versão `Number.`.'],
  },
  solution: {
    js: `function sumNumeric(values) {
  let total = 0;
  for (const x of values) {
    let n = NaN;
    if (typeof x === 'number') n = x;
    else if (typeof x === 'string' && x.trim() !== '') n = Number(x);
    if (Number.isFinite(n)) total += n;
  }
  return total;
}
`,
    ts: `function sumNumeric(values: unknown[]): number {
  let total = 0;
  for (const x of values) {
    let n = NaN;
    if (typeof x === 'number') n = x;
    else if (typeof x === 'string' && x.trim() !== '') n = Number(x);
    if (Number.isFinite(n)) total += n;
  }
  return total;
}
`,
  },
}

export const sameValue: Problem = {
  id: 'js-same-value',
  title: 'Recriando Object.is',
  difficulty: 'Médio',
  pattern: 'tipos-coercao',
  fnName: 'sameValue',
  params: ['a', 'b'],
  description: `
\`===\` tem dois casos "estranhos":
- \`NaN === NaN\` é \`false\`;
- \`0 === -0\` é \`true\`.

\`Object.is(a, b)\` corrige os dois. Implemente \`sameValue(a, b)\` com o mesmo comportamento de \`Object.is\`, **sem usar** \`Object.is\`.
`,
  examples: [
    { input: 'sameValue(NaN, NaN)', output: 'true' },
    { input: 'sameValue(0, -0)', output: 'false' },
    { input: 'sameValue("1", 1)', output: 'false' },
  ],
  constraints: ['Não use Object.is'],
  starter: {
    js: `/**
 * @param {unknown} a
 * @param {unknown} b
 * @return {boolean}
 */
function sameValue(a, b) {

}
`,
    ts: `function sameValue(a: unknown, b: unknown): boolean {

}
`,
  },
  tests: [
    { input: [NaN, NaN], expected: true, label: 'NaN e NaN' },
    { input: [0, -0], expected: false, label: '0 e -0' },
    { input: [-0, -0], expected: true, label: '-0 e -0' },
    { input: [1, 1], expected: true, label: 'iguais' },
    { input: ['1', 1], expected: false, label: 'string × número' },
    { input: [null, undefined], expected: false, label: 'null × undefined' },
    { input: [NaN, 0], expected: false, label: 'NaN × 0' },
  ],
  hints: [
    'Para quase tudo, `a === b` já está certo. Só falta tratar os dois casos especiais.',
    'NaN é o **único** valor diferente de si mesmo: `x !== x` só é true quando x é NaN.',
    'Para distinguir 0 de -0: `1 / 0 === Infinity`, mas `1 / -0 === -Infinity`.',
  ],
  explanation: {
    intuition: `
Dois truques clássicos de JS:
- **NaN** é o único valor em que \`x !== x\`. Então "a e b são NaN" é \`a !== a && b !== b\`.
- **0 e -0** são iguais com \`===\`, mas dividir por eles revela o sinal: \`1/0 = Infinity\`, \`1/-0 = -Infinity\`.
`,
    steps: ['Se `a === b`: são iguais, exceto se forem 0 e -0 → retorne `a !== 0 || 1 / a === 1 / b`.', 'Senão: só são "iguais" se os dois forem NaN → `a !== a && b !== b`.'],
    time: 'O(1)',
    space: 'O(1)',
    complexityWhy: 'Apenas comparações.',
    pitfalls: ['Usar `isNaN(a)`: converte strings (`isNaN("abc")` é true).', 'Esquecer que `-0` existe: aparece em `Math.round(-0.4)` ou `-1 * 0`.'],
  },
  solution: {
    js: `function sameValue(a, b) {
  if (a === b) {
    // 0 === -0 é true: confere o sinal pelo infinito
    return a !== 0 || 1 / a === 1 / b;
  }
  // NaN é o único valor diferente de si mesmo
  return a !== a && b !== b;
}
`,
    ts: `function sameValue(a: unknown, b: unknown): boolean {
  if (a === b) {
    // 0 === -0 é true: confere o sinal pelo infinito
    return a !== 0 || 1 / (a as number) === 1 / (b as number);
  }
  // NaN é o único valor diferente de si mesmo
  return a !== a && b !== b;
}
`,
  },
}

/* ======================= Escopo e closures ======================= */

export const createCounter: Problem = {
  id: 'js-create-counter',
  title: 'Contador com closure',
  difficulty: 'Fácil',
  pattern: 'escopo-closures',
  fnName: 'createCounter',
  params: ['starts', 'ops'],
  io: {
    harness: `(createCounter, starts, ops) => {
  const counters = starts.map((s) => createCounter(s));
  return ops.map(([i, op]) => counters[i][op]());
}`,
  },
  description: `
Escreva \`createCounter(start)\` que retorna um objeto com três métodos:

- \`increment()\`: soma 1 e retorna o novo valor;
- \`decrement()\`: subtrai 1 e retorna o novo valor;
- \`get()\`: retorna o valor atual.

O valor **não pode** ser uma propriedade pública do objeto: guarde-o numa variável capturada por **closure**. Cada contador criado precisa ser **independente** dos outros.

**Como é testado:** o teste cria um contador para cada valor de \`starts\` e executa as operações de \`ops\` no formato \`[índiceDoContador, "método"]\`.
`,
  examples: [
    { input: 'starts = [5], ops = [[0,"increment"],[0,"increment"],[0,"get"]]', output: '[6, 7, 7]' },
    { input: 'starts = [0, 10], ops = [[0,"increment"],[1,"decrement"],[0,"get"],[1,"get"]]', output: '[1, 9, 1, 9]', explanation: 'Os dois contadores não se misturam.' },
  ],
  constraints: [],
  starter: {
    js: `/**
 * @param {number} start
 * @return {{ increment: () => number, decrement: () => number, get: () => number }}
 */
function createCounter(start) {

}
`,
    ts: `interface Counter {
  increment(): number;
  decrement(): number;
  get(): number;
}

function createCounter(start: number): Counter {

}
`,
  },
  tests: [
    { input: [[5], [[0, 'increment'], [0, 'increment'], [0, 'get']]], expected: [6, 7, 7], label: 'Exemplo 1' },
    { input: [[0, 10], [[0, 'increment'], [1, 'decrement'], [0, 'get'], [1, 'get']]], expected: [1, 9, 1, 9], label: 'Dois contadores independentes' },
    { input: [[-1], [[0, 'decrement'], [0, 'decrement'], [0, 'increment']]], expected: [-2, -3, -2], label: 'Negativos' },
    { input: [[3], [[0, 'get']]], expected: [3], label: 'Só get' },
  ],
  hints: [
    'Declare uma variável dentro de `createCounter` (ex.: `let count = start`). As funções retornadas conseguem acessá-la mesmo depois que `createCounter` terminou?',
    'Sim! Isso é uma closure: a função "lembra" do escopo onde foi criada.',
    'Retorne `{ increment: () => ++count, decrement: () => --count, get: () => count }`.',
  ],
  explanation: {
    intuition: `
Quando uma função é criada, ela guarda uma referência ao **escopo** onde nasceu. Mesmo depois que \`createCounter\` retorna, \`count\` continua vivo, porque as três funções ainda o referenciam. Isso é uma **closure**.

Cada chamada de \`createCounter\` cria um **escopo novo**, com seu próprio \`count\`: por isso os contadores são independentes. E ninguém de fora consegue mexer em \`count\` diretamente: é um jeito de ter estado **privado** em JS.

No visualizador, as variáveis capturadas aparecem com **↑** dentro das funções internas.
`,
    steps: ['`let count = start`.', 'Retorne um objeto com três funções que leem/alteram `count`.', '`++count` incrementa e já retorna o novo valor.'],
    time: 'O(1) por operação',
    space: 'O(1) por contador',
    complexityWhy: 'Cada contador guarda só um número no seu escopo.',
    pitfalls: ['Guardar `count` fora da função (global): todos os contadores compartilham o mesmo valor.', '`count++` retorna o valor **antigo**; `++count` retorna o novo.', 'Usar `this.count` funciona, mas expõe o estado (qualquer um pode fazer `counter.count = 999`).'],
  },
  solution: {
    js: `function createCounter(start) {
  let count = start; // fica "preso" na closure
  return {
    increment() {
      count++;
      return count;
    },
    decrement() {
      count--;
      return count;
    },
    get() {
      return count;
    },
  };
}
`,
    ts: `interface Counter {
  increment(): number;
  decrement(): number;
  get(): number;
}

function createCounter(start: number): Counter {
  let count = start; // fica "preso" na closure
  return {
    increment() {
      count++;
      return count;
    },
    decrement() {
      count--;
      return count;
    },
    get() {
      return count;
    },
  };
}
`,
  },
}

export const once: Problem = {
  id: 'js-once',
  title: 'once(fn)',
  difficulty: 'Fácil',
  pattern: 'escopo-closures',
  fnName: 'once',
  params: ['x', 'y'],
  io: {
    harness: `(once, x, y) => {
  let calls = 0;
  const double = once((n) => {
    calls++;
    return n * 2;
  });
  return { first: double(x), second: double(y), calls };
}`,
  },
  description: `
Escreva \`once(fn)\`: ela recebe uma função e retorna uma **nova função** que executa \`fn\` **só na primeira chamada**. Nas chamadas seguintes, devolve o **mesmo resultado** da primeira, sem executar \`fn\` de novo.

É um utilitário real (lodash tem \`_.once\`): útil para inicializações que não podem rodar duas vezes.

**Como é testado:** o teste cria \`const double = once(n => n * 2)\` (contando quantas vezes ela roda), chama \`double(x)\` e depois \`double(y)\`.
`,
  examples: [{ input: 'x = 2, y = 5', output: '{ first: 4, second: 4, calls: 1 }', explanation: 'A segunda chamada não executa a função de novo.' }],
  constraints: [],
  starter: {
    js: `/**
 * @param {Function} fn
 * @return {Function}
 */
function once(fn) {

}
`,
    ts: `function once<T extends (...args: any[]) => any>(fn: T): (...args: Parameters<T>) => ReturnType<T> {

}
`,
  },
  tests: [
    { input: [2, 5], expected: { first: 4, second: 4, calls: 1 }, label: 'Exemplo' },
    { input: [0, 7], expected: { first: 0, second: 0, calls: 1 }, label: 'Primeiro resultado é 0 (falsy!)' },
    { input: [-3, -3], expected: { first: -6, second: -6, calls: 1 }, label: 'Mesmo argumento' },
  ],
  hints: [
    'A função retornada precisa **lembrar** se já foi chamada e qual foi o resultado. Onde guardar isso?',
    'Em variáveis no escopo de `once` (closure): `let called = false; let result;`.',
    'Não use `if (result)` para saber se já rodou: o resultado pode ser 0, "" ou false. Use um booleano separado.',
  ],
  explanation: {
    intuition: `
\`once\` é uma **função que retorna função** (higher-order function). A função interna fecha sobre duas variáveis: \`called\` e \`result\`. Elas sobrevivem entre chamadas porque estão na closure.

O teste "primeiro resultado é 0" pega um bug clássico: usar o próprio resultado como flag (\`if (!result)\`) faria a função rodar de novo, porque 0 é falsy.
`,
    steps: ['`let called = false`, `let result`.', 'Retorne `(...args) => { if (!called) { called = true; result = fn(...args); } return result; }`.'],
    time: 'O(1) + custo de fn na primeira chamada',
    space: 'O(1)',
    complexityWhy: 'Só guarda um booleano e um resultado.',
    pitfalls: ['Usar `result` como flag (falha com resultados falsy).', 'Esquecer de repassar os argumentos (`...args`).', 'Para preservar o `this`, use `function (...args) { result = fn.apply(this, args) }`.'],
  },
  solution: {
    js: `function once(fn) {
  let called = false;
  let result;
  return (...args) => {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  };
}
`,
    ts: `function once<T extends (...args: any[]) => any>(fn: T): (...args: Parameters<T>) => ReturnType<T> {
  let called = false;
  let result: ReturnType<T>;
  return (...args) => {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  };
}
`,
  },
}

export const memoize: Problem = {
  id: 'js-memoize',
  title: 'memoize(fn)',
  difficulty: 'Médio',
  pattern: 'escopo-closures',
  fnName: 'memoize',
  params: ['args'],
  io: {
    harness: `(memoize, args) => {
  let calls = 0;
  const square = memoize((n) => {
    calls++;
    return n * n;
  });
  const results = args.map((a) => square(a));
  return { results, calls };
}`,
  },
  description: `
Escreva \`memoize(fn)\` para funções de **um argumento**: retorna uma versão de \`fn\` que guarda os resultados num **cache**. Se for chamada de novo com o mesmo argumento, devolve o valor do cache sem executar \`fn\`.

**Como é testado:** o teste cria \`const square = memoize(n => n * n)\` (contando execuções), chama \`square\` para cada valor de \`args\` e confere os resultados e **quantas vezes** a função original rodou.
`,
  examples: [{ input: 'args = [2, 3, 2, 2]', output: '{ results: [4, 9, 4, 4], calls: 2 }' }],
  constraints: [],
  starter: {
    js: `/**
 * @param {(x: any) => any} fn
 * @return {(x: any) => any}
 */
function memoize(fn) {

}
`,
    ts: `function memoize<A, R>(fn: (x: A) => R): (x: A) => R {

}
`,
  },
  tests: [
    { input: [[2, 3, 2, 2]], expected: { results: [4, 9, 4, 4], calls: 2 }, label: 'Exemplo' },
    { input: [[0, 0, 0]], expected: { results: [0, 0, 0], calls: 1 }, label: 'Resultado 0 também é cacheado' },
    { input: [[1, 2, 3]], expected: { results: [1, 4, 9], calls: 3 }, label: 'Sem repetição' },
    { input: [[]], expected: { results: [], calls: 0 }, label: 'Nenhuma chamada' },
  ],
  hints: [
    'O cache precisa sobreviver entre chamadas e ser exclusivo desta função memoizada: closure de novo.',
    'Use um `Map` (aceita qualquer tipo de chave, inclusive números, sem convertê-los para string).',
    'Para saber se está no cache use `cache.has(x)`, não `if (cache.get(x))` (0 é falsy).',
  ],
  explanation: {
    intuition: `
Memoização é a base da **programação dinâmica** do módulo LeetCode, aqui como utilitário genérico: um \`Map\` na closure guarda \`argumento → resultado\`.

Troca memória por tempo: ótimo para funções **puras** (mesma entrada → mesma saída) e caras. Péssimo para funções com efeitos colaterais ou que dependem de hora/estado externo.
`,
    steps: ['`const cache = new Map()`.', 'Retorne `(x) => { if (cache.has(x)) return cache.get(x); const r = fn(x); cache.set(x, r); return r; }`.'],
    time: 'O(1) por chamada repetida',
    space: 'O(k) para k argumentos distintos',
    complexityWhy: 'Busca e inserção no Map são O(1) em média.',
    pitfalls: ['Testar `if (cache.get(x))`: resultados falsy nunca ficam no cache.', 'Usar objeto `{}` como cache: `1` e `"1"` viram a mesma chave.', 'Memoizar funções impuras (ex.: que leem `Date.now()`).'],
  },
  solution: {
    js: `function memoize(fn) {
  const cache = new Map();
  return (x) => {
    if (cache.has(x)) return cache.get(x);
    const result = fn(x);
    cache.set(x, result);
    return result;
  };
}
`,
    ts: `function memoize<A, R>(fn: (x: A) => R): (x: A) => R {
  const cache = new Map<A, R>();
  return (x) => {
    if (cache.has(x)) return cache.get(x)!;
    const result = fn(x);
    cache.set(x, result);
    return result;
  };
}
`,
  },
}

/* ======================= this e funções ======================= */

export const calculator: Problem = {
  id: 'js-calculator-chain',
  title: 'Calculadora encadeável',
  difficulty: 'Fácil',
  pattern: 'this-funcoes',
  fnName: 'createCalculator',
  params: ['initial', 'ops'],
  io: {
    harness: `(createCalculator, initial, ops) => {
  let calc = createCalculator(initial);
  for (const [op, n] of ops) calc = calc[op](n);
  return calc.value();
}`,
  },
  description: `
Escreva \`createCalculator(initial)\` que retorna um objeto com os métodos \`add(n)\`, \`sub(n)\`, \`mul(n)\` e \`value()\`.

Os três primeiros devem **retornar o próprio objeto**, permitindo encadear chamadas (como o jQuery ou query builders fazem):

\`\`\`
createCalculator(2).add(3).mul(4).sub(1).value() // 19
\`\`\`

Use \`this\` dentro dos métodos.
`,
  examples: [{ input: 'initial = 2, ops = [["add",3],["mul",4],["sub",1]]', output: '19' }],
  constraints: [],
  starter: {
    js: `/**
 * @param {number} initial
 */
function createCalculator(initial) {
  return {
    total: initial,
    // add(n) { ... },
  };
}
`,
    ts: `interface Calculator {
  total: number;
  add(n: number): Calculator;
  sub(n: number): Calculator;
  mul(n: number): Calculator;
  value(): number;
}

function createCalculator(initial: number): Calculator {

}
`,
  },
  tests: [
    { input: [2, [['add', 3], ['mul', 4], ['sub', 1]]], expected: 19, label: 'Exemplo' },
    { input: [10, []], expected: 10, label: 'Sem operações' },
    { input: [0, [['add', 5], ['add', 5], ['mul', 0]]], expected: 0, label: 'Multiplica por zero' },
    { input: [1, [['sub', 3], ['mul', -2]]], expected: 4, label: 'Negativos' },
  ],
  hints: [
    'Num método chamado como `obj.metodo()`, o `this` é o `obj` (o que está antes do ponto).',
    'Guarde o total em `this.total` e altere-o nos métodos.',
    'Para encadear, cada método termina com `return this`. Atenção: arrow functions **não** têm `this` próprio, use a sintaxe de método `add(n) { ... }`.',
  ],
  explanation: {
    intuition: `
**Regra do \`this\`**: ele é decidido na **hora da chamada**, não onde a função foi escrita. Em \`calc.add(3)\`, o que vem antes do ponto (\`calc\`) vira o \`this\`.

Retornar \`this\` devolve o mesmo objeto, então a próxima chamada (\`.mul(4)\`) também acontece "em cima" dele: isso é o **method chaining** (fluent interface).

Se os métodos fossem arrow functions, o \`this\` seria o do escopo externo (não o objeto), e \`this.total\` quebraria.
`,
    steps: ['Retorne um objeto com `total: initial`.', '`add(n) { this.total += n; return this; }` (idem para sub e mul).', '`value() { return this.total; }`.'],
    time: 'O(1) por operação',
    space: 'O(1)',
    complexityWhy: 'Cada método altera um número e retorna o mesmo objeto.',
    pitfalls: [
      'Escrever `add: (n) => { this.total += n; return this; }`: arrow function não tem `this` próprio.',
      'Esquecer o `return this`: a próxima chamada vira `undefined.mul(...)` (TypeError).',
      'Extrair o método: `const f = calc.add; f(1)` perde o `this`. Use `calc.add.bind(calc)`.',
    ],
  },
  solution: {
    js: `function createCalculator(initial) {
  return {
    total: initial,
    add(n) {
      this.total += n;
      return this;
    },
    sub(n) {
      this.total -= n;
      return this;
    },
    mul(n) {
      this.total *= n;
      return this;
    },
    value() {
      return this.total;
    },
  };
}
`,
    ts: `interface Calculator {
  total: number;
  add(n: number): Calculator;
  sub(n: number): Calculator;
  mul(n: number): Calculator;
  value(): number;
}

function createCalculator(initial: number): Calculator {
  return {
    total: initial,
    add(n) {
      this.total += n;
      return this;
    },
    sub(n) {
      this.total -= n;
      return this;
    },
    mul(n) {
      this.total *= n;
      return this;
    },
    value() {
      return this.total;
    },
  };
}
`,
  },
}

export const myBind: Problem = {
  id: 'js-my-bind',
  title: 'Implementando bind',
  difficulty: 'Médio',
  pattern: 'this-funcoes',
  fnName: 'myBind',
  params: ['ctx', 'preset', 'rest'],
  io: {
    harness: `(myBind, ctx, preset, rest) => {
  function describe(...args) {
    return [this ? this.name : null, ...args];
  }
  const bound = myBind(describe, ctx, ...preset);
  return bound(...rest);
}`,
  },
  description: `
Implemente \`myBind(fn, ctx, ...presetArgs)\`, uma versão simplificada de \`Function.prototype.bind\`:

- retorna uma nova função;
- quando chamada, executa \`fn\` com \`this = ctx\`;
- passa primeiro os \`presetArgs\` e depois os argumentos da chamada (aplicação parcial).

**Não use** \`fn.bind\`. Use \`call\` ou \`apply\`.

**Como é testado:** a função \`describe(...args)\` retorna \`[this.name, ...args]\`. O teste faz \`myBind(describe, ctx, ...preset)(...rest)\`.
`,
  examples: [{ input: 'ctx = { name: "Ana" }, preset = [1], rest = [2, 3]', output: '["Ana", 1, 2, 3]' }],
  constraints: ['Não use Function.prototype.bind'],
  starter: {
    js: `/**
 * @param {Function} fn
 * @param {object} ctx
 * @param {...any} presetArgs
 * @return {Function}
 */
function myBind(fn, ctx, ...presetArgs) {

}
`,
    ts: `function myBind(fn: (...args: any[]) => any, ctx: object, ...presetArgs: any[]): (...args: any[]) => any {

}
`,
  },
  tests: [
    { input: [{ name: 'Ana' }, [1], [2, 3]], expected: ['Ana', 1, 2, 3], label: 'Exemplo' },
    { input: [{ name: 'Bia' }, [], []], expected: ['Bia'], label: 'Sem argumentos' },
    { input: [{ name: 'Caio' }, ['a', 'b'], []], expected: ['Caio', 'a', 'b'], label: 'Só preset' },
    { input: [{ name: 'Duda' }, [], [true]], expected: ['Duda', true], label: 'Só na chamada' },
  ],
  hints: [
    '`fn.call(ctx, a, b)` executa `fn` com `this = ctx`. `fn.apply(ctx, [a, b])` faz o mesmo recebendo um array.',
    'A função retornada recebe `...callArgs`. Junte: `[...presetArgs, ...callArgs]`.',
    'Retorne `(...callArgs) => fn.apply(ctx, [...presetArgs, ...callArgs])`.',
  ],
  explanation: {
    intuition: `
\`call\`, \`apply\` e \`bind\` são as três formas de **escolher o \`this\`** explicitamente:

- \`fn.call(ctx, a, b)\`: chama agora, argumentos soltos;
- \`fn.apply(ctx, [a, b])\`: chama agora, argumentos em array;
- \`fn.bind(ctx, a)\`: **não chama**; devolve uma nova função com o \`this\` (e alguns argumentos) fixados.

Seu \`myBind\` é uma closure que guarda \`fn\`, \`ctx\` e \`presetArgs\` e usa \`apply\` quando for chamada.
`,
    steps: ['Retorne uma função que recebe `...callArgs`.', 'Dentro dela: `return fn.apply(ctx, [...presetArgs, ...callArgs])`.'],
    time: 'O(k) por chamada (k argumentos)',
    space: 'O(k)',
    complexityWhy: 'Monta um array com os argumentos a cada chamada.',
    pitfalls: ['Chamar `fn` diretamente (`fn(...args)`): o `this` vira `undefined`.', 'Esquecer os `presetArgs`.', 'Retornar `fn.apply(...)` em vez de uma função: aí você chamou na hora, como o `call`.'],
  },
  solution: {
    js: `function myBind(fn, ctx, ...presetArgs) {
  return (...callArgs) => fn.apply(ctx, [...presetArgs, ...callArgs]);
}
`,
    ts: `function myBind(fn: (...args: any[]) => any, ctx: object, ...presetArgs: any[]): (...args: any[]) => any {
  return (...callArgs: any[]) => fn.apply(ctx, [...presetArgs, ...callArgs]);
}
`,
  },
}
