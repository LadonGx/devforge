import type { Problem } from '../types'

/* ======================= Arrays: map, filter, reduce ======================= */

export const myMap: Problem = {
  id: 'js-my-map',
  title: 'Recriando o map',
  difficulty: 'Fácil',
  pattern: 'arrays-metodos',
  fnName: 'myMap',
  params: ['arr'],
  io: {
    harness: `(myMap, arr) => {
  const before = JSON.stringify(arr);
  const result = myMap(arr, (x, i) => x * 10 + i);
  return { result, originalUntouched: JSON.stringify(arr) === before };
}`,
  },
  description: `
Implemente \`myMap(arr, fn)\` sem usar \`Array.prototype.map\`:

- chama \`fn(elemento, índice)\` para cada elemento;
- retorna um **array novo** com os resultados;
- **não altera** o array original.

**Como é testado:** \`myMap(arr, (x, i) => x * 10 + i)\` e confere se o original ficou intacto.
`,
  examples: [{ input: 'arr = [1, 2, 3]', output: '{ result: [10, 21, 32], originalUntouched: true }' }],
  constraints: ['Não use .map'],
  starter: {
    js: `/**
 * @param {any[]} arr
 * @param {(x: any, i: number) => any} fn
 * @return {any[]}
 */
function myMap(arr, fn) {

}
`,
    ts: `function myMap<T, R>(arr: T[], fn: (x: T, i: number) => R): R[] {

}
`,
  },
  tests: [
    { input: [[1, 2, 3]], expected: { result: [10, 21, 32], originalUntouched: true }, label: 'Exemplo' },
    { input: [[]], expected: { result: [], originalUntouched: true }, label: 'Vazio' },
    { input: [[5]], expected: { result: [50], originalUntouched: true }, label: 'Um elemento' },
    { input: [[0, 0, 0, 0]], expected: { result: [0, 1, 2, 3], originalUntouched: true }, label: 'Usa o índice' },
  ],
  hints: [
    'Crie um array vazio `result` e percorra `arr` com um `for` clássico (você precisa do índice).',
    'Em cada volta: `result.push(fn(arr[i], i))`.',
    'Nunca escreva em `arr[i]`: o map não modifica o original.',
  ],
  explanation: {
    intuition: `
\`map\` **transforma** cada elemento e devolve um array **do mesmo tamanho**. Por dentro ele é só um loop que chama a sua função e guarda o resultado num array novo.

Entender isso tira o "mistério" dos métodos de array: \`filter\`, \`find\`, \`some\` e \`reduce\` são todos loops com uma regra diferente para o que fazer com o retorno da função.
`,
    steps: ['`const result = []`.', 'Para `i` de 0 a `arr.length - 1`: `result.push(fn(arr[i], i))`.', 'Retorne `result`.'],
    time: 'O(n)',
    space: 'O(n)',
    complexityWhy: 'Uma chamada de fn por elemento e um array novo do mesmo tamanho.',
    pitfalls: ['Usar `forEach` + `return`: o retorno do callback do forEach é ignorado.', 'Modificar `arr` em vez de criar um novo.', 'Esquecer de passar o índice para `fn`.'],
  },
  solution: {
    js: `function myMap(arr, fn) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    result.push(fn(arr[i], i));
  }
  return result;
}
`,
    ts: `function myMap<T, R>(arr: T[], fn: (x: T, i: number) => R): R[] {
  const result: R[] = [];
  for (let i = 0; i < arr.length; i++) {
    result.push(fn(arr[i], i));
  }
  return result;
}
`,
  },
}

export const myReduce: Problem = {
  id: 'js-my-reduce',
  title: 'Recriando o reduce',
  difficulty: 'Médio',
  pattern: 'arrays-metodos',
  fnName: 'myReduce',
  params: ['arr', 'useInitial'],
  io: {
    harness: `(myReduce, arr, useInitial) => {
  const sum = (acc, x) => acc + x;
  try {
    return useInitial ? myReduce(arr, sum, 100) : myReduce(arr, sum);
  } catch (e) {
    return e instanceof TypeError ? 'TypeError' : 'outro erro: ' + e;
  }
}`,
  },
  description: `
Implemente \`myReduce(arr, fn, initial?)\` sem usar \`Array.prototype.reduce\`, com o mesmo comportamento:

- **com** valor inicial: o acumulador começa em \`initial\` e \`fn(acc, x, i)\` é chamada para **todos** os elementos;
- **sem** valor inicial: o acumulador começa no **primeiro elemento** e o loop começa do índice 1;
- **sem** valor inicial e array **vazio**: lança \`TypeError\` (como o reduce de verdade).

**Como é testado:** soma \`(acc, x) => acc + x\`, com \`initial = 100\` quando \`useInitial\` é true.
`,
  examples: [
    { input: 'arr = [1, 2, 3], useInitial = true', output: '106' },
    { input: 'arr = [1, 2, 3], useInitial = false', output: '6' },
    { input: 'arr = [], useInitial = false', output: '"TypeError"' },
  ],
  constraints: ['Não use .reduce'],
  starter: {
    js: `/**
 * @param {any[]} arr
 * @param {(acc: any, x: any, i: number) => any} fn
 * @param {any} [initial]
 */
function myReduce(arr, fn, initial) {

}
`,
    ts: `function myReduce<T, A>(arr: T[], fn: (acc: A, x: T, i: number) => A, initial?: A): A {

}
`,
  },
  tests: [
    { input: [[1, 2, 3], true], expected: 106, label: 'Com inicial' },
    { input: [[1, 2, 3], false], expected: 6, label: 'Sem inicial' },
    { input: [[], true], expected: 100, label: 'Vazio com inicial' },
    { input: [[], false], expected: 'TypeError', label: 'Vazio sem inicial: erro' },
    { input: [[7], false], expected: 7, label: 'Um elemento sem inicial' },
  ],
  hints: [
    'Como saber se o `initial` foi passado? Cuidado: `initial` pode ser legitimamente 0 ou "".',
    'Use `arguments.length >= 3` (função normal) ou um parâmetro rest: `(arr, fn, ...rest)` e `rest.length > 0`.',
    'Sem inicial: `if (arr.length === 0) throw new TypeError(...)`; `acc = arr[0]` e comece o loop em 1.',
  ],
  explanation: {
    intuition: `
\`reduce\` "dobra" o array num único valor: a cada elemento, combina o acumulador com o elemento e o resultado vira o novo acumulador.

A parte sutil é o **valor inicial opcional**. Não dá para testar \`if (initial === undefined)\`, porque alguém pode querer começar de \`undefined\` de propósito. O jeito correto é saber **quantos argumentos** foram passados.
`,
    steps: [
      'Descubra se houve inicial: `const hasInitial = arguments.length >= 3`.',
      'Se houve: `acc = initial`, `start = 0`. Se não: array vazio → TypeError; senão `acc = arr[0]`, `start = 1`.',
      'Para `i` de `start` em diante: `acc = fn(acc, arr[i], i)`.',
      'Retorne `acc`.',
    ],
    time: 'O(n)',
    space: 'O(1)',
    complexityWhy: 'Uma passada; só guarda o acumulador.',
    pitfalls: [
      '`if (!initial)`: trata `0` como "não passado".',
      '`arguments` não existe em arrow functions. Use `function` ou rest parameters.',
      'Esquecer o TypeError no array vazio sem inicial.',
    ],
  },
  solution: {
    js: `function myReduce(arr, fn, ...rest) {
  const hasInitial = rest.length > 0;
  let acc;
  let start = 0;
  if (hasInitial) {
    acc = rest[0];
  } else {
    if (arr.length === 0) throw new TypeError('Reduce of empty array with no initial value');
    acc = arr[0];
    start = 1;
  }
  for (let i = start; i < arr.length; i++) {
    acc = fn(acc, arr[i], i);
  }
  return acc;
}
`,
    ts: `function myReduce<T, A>(arr: T[], fn: (acc: A, x: T, i: number) => A, ...rest: [A?]): A {
  const hasInitial = rest.length > 0;
  let acc: A;
  let start = 0;
  if (hasInitial) {
    acc = rest[0] as A;
  } else {
    if (arr.length === 0) throw new TypeError('Reduce of empty array with no initial value');
    acc = arr[0] as unknown as A;
    start = 1;
  }
  for (let i = start; i < arr.length; i++) {
    acc = fn(acc, arr[i], i);
  }
  return acc;
}
`,
  },
}

export const groupBy: Problem = {
  id: 'js-group-by',
  title: 'groupBy',
  difficulty: 'Fácil',
  pattern: 'arrays-metodos',
  fnName: 'groupBy',
  params: ['items', 'key'],
  description: `
Escreva \`groupBy(items, key)\` que agrupa um array de objetos pelo valor da propriedade \`key\`.

Retorne um **objeto** em que cada chave é um valor encontrado e o valor é o array de itens com aquele valor, **na ordem original**.
`,
  examples: [
    {
      input: 'items = [{n:"Ana", time:"A"}, {n:"Bia", time:"B"}, {n:"Caio", time:"A"}], key = "time"',
      output: '{ A: [{n:"Ana",time:"A"}, {n:"Caio",time:"A"}], B: [{n:"Bia",time:"B"}] }',
    },
  ],
  constraints: [],
  starter: {
    js: `/**
 * @param {object[]} items
 * @param {string} key
 * @return {Record<string, object[]>}
 */
function groupBy(items, key) {

}
`,
    ts: `function groupBy<T extends Record<string, any>>(items: T[], key: keyof T): Record<string, T[]> {

}
`,
  },
  tests: [
    {
      input: [
        [
          { n: 'Ana', time: 'A' },
          { n: 'Bia', time: 'B' },
          { n: 'Caio', time: 'A' },
        ],
        'time',
      ],
      expected: {
        A: [
          { n: 'Ana', time: 'A' },
          { n: 'Caio', time: 'A' },
        ],
        B: [{ n: 'Bia', time: 'B' }],
      },
      label: 'Exemplo',
    },
    { input: [[], 'x'], expected: {}, label: 'Vazio' },
    {
      input: [
        [
          { id: 1, ok: true },
          { id: 2, ok: false },
          { id: 3, ok: true },
        ],
        'ok',
      ],
      expected: {
        true: [
          { id: 1, ok: true },
          { id: 3, ok: true },
        ],
        false: [{ id: 2, ok: false }],
      },
      label: 'Chave booleana (vira string)',
    },
  ],
  hints: [
    'Comece com `{}` e percorra os itens.',
    'Para cada item: `const k = item[key]`. Se `result[k]` não existe, crie `[]`. Depois `push`.',
    'Dá para escrever com `reduce((acc, item) => { ...; return acc }, {})`, ou com um for...of simples (mais legível).',
  ],
  explanation: {
    intuition: `
Agrupar é o padrão "**balde por chave**" (o mesmo do Group Anagrams). Repare no último teste: chaves de objeto são **sempre strings**, então \`true\` vira \`"true"\`.

Desde 2024 o JS tem \`Object.groupBy(items, fn)\`, mas entrevistas adoram pedir para implementar.
`,
    steps: ['`const groups = {}`.', 'Para cada `item`: `const k = item[key]`; `(groups[k] ??= []).push(item)`.', 'Retorne `groups`.'],
    time: 'O(n)',
    space: 'O(n)',
    complexityWhy: 'Cada item é colocado num grupo uma vez.',
    pitfalls: ['Esquecer o `return acc` dentro do reduce (o acumulador vira undefined na próxima volta).', 'Usar `if (!groups[k])` com valores que podem ser falsy... aqui funciona porque o valor é sempre um array.'],
  },
  solution: {
    js: `function groupBy(items, key) {
  const groups = {};
  for (const item of items) {
    const k = item[key];
    if (!groups[k]) groups[k] = [];
    groups[k].push(item);
  }
  return groups;
}
`,
    ts: `function groupBy<T extends Record<string, any>>(items: T[], key: keyof T): Record<string, T[]> {
  const groups: Record<string, T[]> = {};
  for (const item of items) {
    const k = String(item[key]);
    if (!groups[k]) groups[k] = [];
    groups[k].push(item);
  }
  return groups;
}
`,
  },
}

export const orderSummary: Problem = {
  id: 'js-order-summary',
  title: 'Relatório de pedidos (filter → reduce → sort)',
  difficulty: 'Médio',
  pattern: 'arrays-metodos',
  fnName: 'topCustomers',
  params: ['orders'],
  description: `
Você recebe pedidos no formato \`{ customer, total, status }\`. Monte o ranking de clientes:

1. considere só pedidos com \`status === "paid"\`;
2. some o \`total\` por cliente;
3. retorne um array de pares \`[cliente, soma]\` ordenado pela soma **decrescente**; em caso de empate, por nome em ordem **alfabética**.
`,
  examples: [
    {
      input: 'orders = [{customer:"ana",total:50,status:"paid"},{customer:"bia",total:80,status:"paid"},{customer:"ana",total:40,status:"paid"},{customer:"bia",total:500,status:"canceled"}]',
      output: '[["ana", 90], ["bia", 80]]',
    },
  ],
  constraints: [],
  starter: {
    js: `/**
 * @param {{ customer: string, total: number, status: string }[]} orders
 * @return {[string, number][]}
 */
function topCustomers(orders) {

}
`,
    ts: `interface Order {
  customer: string;
  total: number;
  status: 'paid' | 'pending' | 'canceled';
}

function topCustomers(orders: Order[]): [string, number][] {

}
`,
  },
  tests: [
    {
      input: [
        [
          { customer: 'ana', total: 50, status: 'paid' },
          { customer: 'bia', total: 80, status: 'paid' },
          { customer: 'ana', total: 40, status: 'paid' },
          { customer: 'bia', total: 500, status: 'canceled' },
        ],
      ],
      expected: [
        ['ana', 90],
        ['bia', 80],
      ],
      label: 'Exemplo',
    },
    { input: [[]], expected: [], label: 'Sem pedidos' },
    {
      input: [
        [
          { customer: 'zeca', total: 30, status: 'paid' },
          { customer: 'ana', total: 30, status: 'paid' },
          { customer: 'mia', total: 10, status: 'pending' },
        ],
      ],
      expected: [
        ['ana', 30],
        ['zeca', 30],
      ],
      label: 'Empate: ordem alfabética',
    },
    {
      input: [
        [
          { customer: 'c', total: 1, status: 'paid' },
          { customer: 'b', total: 2, status: 'paid' },
          { customer: 'a', total: 3, status: 'paid' },
          { customer: 'c', total: 10, status: 'paid' },
        ],
      ],
      expected: [
        ['c', 11],
        ['a', 3],
        ['b', 2],
      ],
      label: 'Ranking',
    },
  ],
  hints: [
    'Faça em três etapas, igual ao enunciado: `filter` → acumular por cliente → `sort`.',
    'Para acumular, um `Map` (ou objeto) `cliente → soma` com `reduce` ou for...of. Depois `[...map.entries()]` vira array de pares.',
    "Comparador do sort: `(a, b) => b[1] - a[1] || a[0].localeCompare(b[0])`. O `||` só usa o nome quando a diferença é 0.",
  ],
  explanation: {
    intuition: `
É o tipo de tarefa que aparece no dia a dia de um dev (relatórios, dashboards) e em entrevistas práticas. A solução limpa encadeia operações com **uma responsabilidade cada**:

- \`filter\`: seleciona;
- \`reduce\` (ou loop) num \`Map\`: agrega;
- \`sort\` com comparador: ordena.

O comparador recebe \`(a, b)\` e retorna negativo se \`a\` vem antes, positivo se \`b\` vem antes, 0 se tanto faz. \`b - a\` ordena números de forma **decrescente**.
`,
    steps: [
      '`paid = orders.filter(o => o.status === "paid")`.',
      'Some num Map: `totals.set(c, (totals.get(c) ?? 0) + o.total)`.',
      '`[...totals.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))`.',
    ],
    time: 'O(n + k log k)',
    space: 'O(k)',
    complexityWhy: 'n pedidos agregados em k clientes; ordenar os k clientes custa k log k.',
    pitfalls: [
      '`sort()` sem comparador ordena como **texto**: `[10, 9, 1]` vira `[1, 10, 9]`.',
      '`sort` **modifica** o array original. Aqui ordenamos um array novo (das entradas do Map), então tudo bem.',
      'Esquecer o desempate pelo nome.',
    ],
  },
  solution: {
    js: `function topCustomers(orders) {
  const totals = orders
    .filter((o) => o.status === 'paid')
    .reduce((acc, o) => acc.set(o.customer, (acc.get(o.customer) ?? 0) + o.total), new Map());
  return [...totals.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}
`,
    ts: `interface Order {
  customer: string;
  total: number;
  status: 'paid' | 'pending' | 'canceled';
}

function topCustomers(orders: Order[]): [string, number][] {
  const totals = orders
    .filter((o) => o.status === 'paid')
    .reduce((acc, o) => acc.set(o.customer, (acc.get(o.customer) ?? 0) + o.total), new Map<string, number>());
  return [...totals.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}
`,
  },
}

/* ======================= Objetos e referências ======================= */

export const deepClone: Problem = {
  id: 'js-deep-clone',
  title: 'Cópia profunda (deep clone)',
  difficulty: 'Médio',
  pattern: 'objetos-referencias',
  fnName: 'deepClone',
  params: ['value'],
  io: {
    harness: `(deepClone, value) => {
  const before = JSON.stringify(value);
  const copy = deepClone(value);
  const equal = JSON.stringify(copy) === before;
  // bagunça a cópia inteira: o original não pode mudar
  const touch = (o) => {
    if (o && typeof o === 'object') {
      for (const k of Object.keys(o)) {
        if (o[k] && typeof o[k] === 'object') touch(o[k]);
        else o[k] = '#';
      }
    }
  };
  touch(copy);
  return { equal, independent: JSON.stringify(value) === before };
}`,
  },
  description: `
Escreva \`deepClone(value)\` que cria uma **cópia profunda** de valores compostos por objetos simples, arrays e primitivos: nenhum objeto ou array da cópia pode ser **compartilhado** com o original.

Não use \`structuredClone\` nem \`JSON.parse(JSON.stringify(...))\`: faça a recursão você mesmo.

**Como é testado:** o teste confere se a cópia é igual ao original e depois **modifica a cópia inteira**; o original não pode mudar.
`,
  examples: [{ input: 'value = { a: 1, b: { c: [1, 2] } }', output: '{ equal: true, independent: true }' }],
  constraints: ['Sem structuredClone / JSON'],
  starter: {
    js: `/**
 * @param {any} value
 * @return {any}
 */
function deepClone(value) {

}
`,
    ts: `function deepClone<T>(value: T): T {

}
`,
  },
  tests: [
    { input: [{ a: 1, b: { c: [1, 2] } }], expected: { equal: true, independent: true }, label: 'Exemplo' },
    { input: [[{ x: 1 }, { y: [2, 3] }]], expected: { equal: true, independent: true }, label: 'Array de objetos' },
    { input: [42], expected: { equal: true, independent: true }, label: 'Primitivo' },
    { input: [{ deep: { deeper: { deepest: 'ok' } } }], expected: { equal: true, independent: true }, label: 'Bem aninhado' },
    { input: [{ list: [], obj: {}, n: null }], expected: { equal: true, independent: true }, label: 'Vazios e null' },
  ],
  hints: [
    'O spread `{ ...obj }` copia só o **primeiro nível**: objetos internos continuam compartilhados. Veja na aula o visual de referências.',
    'Recursão: primitivos (e `null`) retornam eles mesmos; arrays viram `value.map(deepClone)`; objetos copiam cada chave chamando `deepClone`.',
    'Cuidado: `typeof null === "object"`. Trate `null` antes.',
  ],
  explanation: {
    intuition: `
Em JS, objetos e arrays são guardados por **referência**: a variável aponta para o objeto, ela não "contém" o objeto. Copiar com spread cria um objeto novo por fora, mas os objetos internos continuam sendo os **mesmos**.

A cópia profunda resolve isso descendo recursivamente e criando um objeto/array novo em **cada nível**.
`,
    steps: [
      'Se `value` é primitivo ou `null`: retorne ele mesmo.',
      'Se é array: `return value.map((x) => deepClone(x))`.',
      'Se é objeto: crie `{}` e, para cada chave, `copy[k] = deepClone(value[k])`.',
    ],
    time: 'O(n)',
    space: 'O(n)',
    complexityWhy: 'n = quantidade total de valores na estrutura; cada um é visitado uma vez.',
    pitfalls: [
      '`{ ...obj }` / `Object.assign` / `[...arr]`: cópias **rasas**.',
      '`JSON.parse(JSON.stringify(x))` perde `undefined`, funções, `Date` (vira string), `Map`, `Set` e quebra com ciclos.',
      'No dia a dia use `structuredClone(x)`: nativo, lida com Date, Map, Set e ciclos.',
    ],
  },
  solution: {
    js: `function deepClone(value) {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((x) => deepClone(x));
  const copy = {};
  for (const key of Object.keys(value)) {
    copy[key] = deepClone(value[key]);
  }
  return copy;
}
`,
    ts: `function deepClone<T>(value: T): T {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((x) => deepClone(x)) as T;
  const copy: Record<string, unknown> = {};
  for (const key of Object.keys(value)) {
    copy[key] = deepClone((value as Record<string, unknown>)[key]);
  }
  return copy as T;
}
`,
  },
}

export const deepEqual: Problem = {
  id: 'js-deep-equal',
  title: 'Igualdade profunda',
  difficulty: 'Médio',
  pattern: 'objetos-referencias',
  fnName: 'deepEqual',
  params: ['a', 'b'],
  description: `
\`{ a: 1 } === { a: 1 }\` é \`false\`: são dois objetos diferentes na memória.

Escreva \`deepEqual(a, b)\` que compara **estruturalmente** objetos simples, arrays e primitivos:

- primitivos: \`===\`;
- arrays: mesmo tamanho e elementos iguais (recursivamente), na mesma ordem;
- objetos: mesmas chaves (a ordem das chaves **não** importa) e valores iguais recursivamente;
- um array **não** é igual a um objeto.
`,
  examples: [
    { input: 'a = { x: [1, 2], y: { z: 3 } }, b = { y: { z: 3 }, x: [1, 2] }', output: 'true' },
    { input: 'a = [1, 2], b = [2, 1]', output: 'false' },
  ],
  constraints: [],
  starter: {
    js: `/**
 * @param {any} a
 * @param {any} b
 * @return {boolean}
 */
function deepEqual(a, b) {

}
`,
    ts: `function deepEqual(a: unknown, b: unknown): boolean {

}
`,
  },
  tests: [
    { input: [{ x: [1, 2], y: { z: 3 } }, { y: { z: 3 }, x: [1, 2] }], expected: true, label: 'Ordem das chaves não importa' },
    { input: [[1, 2], [2, 1]], expected: false, label: 'Ordem do array importa' },
    { input: [{ a: 1 }, { a: 1, b: 2 }], expected: false, label: 'Chave a mais' },
    { input: [{ a: undefined }, { b: undefined }], expected: false, label: 'Chaves diferentes com undefined' },
    { input: [[], {}], expected: false, label: 'Array × objeto' },
    { input: [null, {}], expected: false, label: 'null × objeto' },
    { input: ['1', 1], expected: false, label: 'Tipos diferentes' },
    { input: [{ a: [{ b: [1] }] }, { a: [{ b: [1] }] }], expected: true, label: 'Bem aninhado' },
  ],
  hints: [
    'Se `a === b`, já é true. Se algum não é objeto (ou é null), o resultado é `a === b`.',
    'Arrays: se só um deles é array, false. Depois compare tamanho e cada elemento com `deepEqual`.',
    'Objetos: compare `Object.keys(a).length` com o de `b` e cheque se cada chave de `a` existe em `b` (`Object.hasOwn`) com valor deepEqual.',
  ],
  explanation: {
    intuition: `
\`===\` em objetos compara **referências** ("é o mesmo objeto na memória?"). Igualdade estrutural precisa descer pela estrutura.

O teste com \`{ a: undefined }\` × \`{ b: undefined }\` pega quem compara só \`a[k] === b[k]\`: \`b.a\` também é \`undefined\`! Por isso checamos se a chave **existe** em \`b\`.
`,
    steps: [
      '`if (a === b) return true`.',
      'Se algum é primitivo/null: `return false` (já sabemos que não são ===).',
      'Se `Array.isArray(a) !== Array.isArray(b)`: false.',
      'Compare quantidade de chaves e, para cada chave de `a`: existe em `b` e `deepEqual(a[k], b[k])`.',
    ],
    time: 'O(n)',
    space: 'O(d)',
    complexityWhy: 'n = total de valores; d = profundidade da recursão.',
    pitfalls: ['`JSON.stringify(a) === JSON.stringify(b)`: depende da ordem das chaves e ignora `undefined`.', 'Esquecer de comparar a quantidade de chaves (b pode ter chaves extras).', 'Não tratar `null` (`typeof null === "object"`).'],
  },
  solution: {
    js: `function deepEqual(a, b) {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const k of keysA) {
    if (!Object.hasOwn(b, k) || !deepEqual(a[k], b[k])) return false;
  }
  return true;
}
`,
    ts: `function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const objA = a as Record<string, unknown>;
  const objB = b as Record<string, unknown>;
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;
  for (const k of keysA) {
    if (!Object.hasOwn(objB, k) || !deepEqual(objA[k], objB[k])) return false;
  }
  return true;
}
`,
  },
}

export const updateImmutable: Problem = {
  id: 'js-update-immutable',
  title: 'Atualização imutável',
  difficulty: 'Médio',
  pattern: 'objetos-referencias',
  fnName: 'updateUser',
  params: ['users', 'id', 'changes'],
  io: {
    harness: `(updateUser, users, id, changes) => {
  const before = JSON.stringify(users);
  const out = updateUser(users, id, changes);
  return {
    result: out,
    originalUntouched: JSON.stringify(users) === before,
    newArray: out !== users,
    othersReused: out.every((u, i) => u.id === id || u === users[i]),
  };
}`,
  },
  description: `
Este é o jeito que React, Redux e NgRx esperam que você atualize estado: **sem mutar**.

Escreva \`updateUser(users, id, changes)\` que retorna um **novo array** em que o usuário com aquele \`id\` recebe as propriedades de \`changes\`.

Regras:
- o array e os objetos originais **não podem mudar**;
- o usuário alterado é um **objeto novo**;
- os usuários que **não mudaram** devem ser **os mesmos objetos** (mesma referência): isso é o *structural sharing*, que deixa o React detectar mudanças rápido.
`,
  examples: [
    {
      input: 'users = [{id:1,name:"Ana"},{id:2,name:"Bia"}], id = 2, changes = {name:"Beatriz"}',
      output: '{ result: [{id:1,name:"Ana"},{id:2,name:"Beatriz"}], originalUntouched: true, newArray: true, othersReused: true }',
    },
  ],
  constraints: [],
  starter: {
    js: `/**
 * @param {{ id: number, [k: string]: any }[]} users
 * @param {number} id
 * @param {object} changes
 */
function updateUser(users, id, changes) {

}
`,
    ts: `interface User {
  id: number;
  [key: string]: unknown;
}

function updateUser(users: User[], id: number, changes: Partial<User>): User[] {

}
`,
  },
  tests: [
    {
      input: [
        [
          { id: 1, name: 'Ana' },
          { id: 2, name: 'Bia' },
        ],
        2,
        { name: 'Beatriz' },
      ],
      expected: {
        result: [
          { id: 1, name: 'Ana' },
          { id: 2, name: 'Beatriz' },
        ],
        originalUntouched: true,
        newArray: true,
        othersReused: true,
      },
      label: 'Exemplo',
    },
    {
      input: [[{ id: 1, name: 'Ana', age: 20 }], 1, { age: 21, city: 'Americana' }],
      expected: { result: [{ id: 1, name: 'Ana', age: 21, city: 'Americana' }], originalUntouched: true, newArray: true, othersReused: true },
      label: 'Adiciona e altera campos',
    },
    {
      input: [[{ id: 1, name: 'Ana' }], 99, { name: 'X' }],
      expected: { result: [{ id: 1, name: 'Ana' }], originalUntouched: true, newArray: true, othersReused: true },
      label: 'id inexistente',
    },
  ],
  hints: [
    '`map` já cria um array novo. O que retornar para cada usuário?',
    'Se `u.id !== id`, retorne o **próprio** `u` (mesma referência). Se for o usuário certo, retorne um objeto novo.',
    'Objeto novo com as mudanças: `{ ...u, ...changes }` (o que vem depois sobrescreve).',
  ],
  explanation: {
    intuition: `
Imutabilidade não é "copiar tudo": é **nunca alterar o que já existe** e criar novos objetos só onde algo mudou.

\`users.map(u => u.id === id ? { ...u, ...changes } : u)\` faz exatamente isso: array novo, usuário alterado novo, os demais **reaproveitados**. Bibliotecas como o React comparam por referência (\`prev === next\`): se o objeto é o mesmo, sabem na hora que não mudou.
`,
    steps: ['`return users.map((u) => (u.id === id ? { ...u, ...changes } : u))`.'],
    time: 'O(n)',
    space: 'O(n)',
    complexityWhy: 'Um array novo de n posições (mas só um objeto novo).',
    pitfalls: [
      '`const u = users.find(...); u.name = ...`: muta o estado original (o React não percebe a mudança).',
      'Clonar todos os usuários (`map(u => ({ ...u }))`): funciona, mas força re-render de todos.',
      'A ordem do spread importa: `{ ...changes, ...u }` desfaz as mudanças.',
    ],
  },
  solution: {
    js: `function updateUser(users, id, changes) {
  return users.map((u) => (u.id === id ? { ...u, ...changes } : u));
}
`,
    ts: `interface User {
  id: number;
  [key: string]: unknown;
}

function updateUser(users: User[], id: number, changes: Partial<User>): User[] {
  return users.map((u) => (u.id === id ? { ...u, ...changes } : u));
}
`,
  },
}

/* ======================= Map e Set ======================= */

export const uniqueBy: Problem = {
  id: 'js-unique-by',
  title: 'Remover duplicados por chave',
  difficulty: 'Fácil',
  pattern: 'map-set',
  fnName: 'uniqueBy',
  params: ['items', 'key'],
  description: `
Escreva \`uniqueBy(items, key)\` que remove objetos duplicados considerando só a propriedade \`key\`. Mantenha a **primeira** ocorrência e a ordem original.
`,
  examples: [{ input: 'items = [{id:1,v:"a"},{id:2,v:"b"},{id:1,v:"c"}], key = "id"', output: '[{id:1,v:"a"},{id:2,v:"b"}]' }],
  constraints: [],
  starter: {
    js: `/**
 * @param {object[]} items
 * @param {string} key
 * @return {object[]}
 */
function uniqueBy(items, key) {

}
`,
    ts: `function uniqueBy<T>(items: T[], key: keyof T): T[] {

}
`,
  },
  tests: [
    {
      input: [
        [
          { id: 1, v: 'a' },
          { id: 2, v: 'b' },
          { id: 1, v: 'c' },
        ],
        'id',
      ],
      expected: [
        { id: 1, v: 'a' },
        { id: 2, v: 'b' },
      ],
      label: 'Exemplo',
    },
    { input: [[], 'id'], expected: [], label: 'Vazio' },
    {
      input: [
        [
          { email: 'a@x.com' },
          { email: 'A@x.com' },
          { email: 'a@x.com' },
        ],
        'email',
      ],
      expected: [{ email: 'a@x.com' }, { email: 'A@x.com' }],
      label: 'Diferencia maiúsculas',
    },
    {
      input: [
        [
          { k: 1 },
          { k: '1' },
        ],
        'k',
      ],
      expected: [{ k: 1 }, { k: '1' }],
      label: '1 e "1" são diferentes',
    },
  ],
  hints: [
    'Você precisa lembrar quais valores de `key` já viu. Qual estrutura responde "já vi?" em O(1)?',
    'Um `Set`. Percorra os itens; se `seen.has(item[key])`, pule; senão adicione e guarde o item.',
    'Por que não um objeto `{}`? Teste "1 e \\"1\\"": num objeto as duas viram a mesma chave.',
  ],
  explanation: {
    intuition: `
\`Set\` guarda valores únicos usando a igualdade **SameValueZero** (como \`===\`, mas com NaN igual a NaN). Ao contrário das chaves de objeto, ele **não converte para string**: \`1\` e \`"1"\` são valores diferentes.

Para arrays de primitivos, \`[...new Set(arr)]\` já remove duplicados. Para objetos, precisamos de uma chave, e é isso que \`uniqueBy\` faz.
`,
    steps: ['`const seen = new Set()`, `const out = []`.', 'Para cada item: `const k = item[key]`; se `!seen.has(k)`, `seen.add(k)` e `out.push(item)`.'],
    time: 'O(n)',
    space: 'O(n)',
    complexityWhy: 'Operações do Set são O(1) em média.',
    pitfalls: ['`out.find(o => o[key] === item[key])` dentro do loop: O(n²).', 'Usar objeto como "set": `1` e `"1"` colidem.', '`new Set(items)` não remove objetos "iguais": objetos são comparados por referência.'],
  },
  solution: {
    js: `function uniqueBy(items, key) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const k = item[key];
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return out;
}
`,
    ts: `function uniqueBy<T>(items: T[], key: keyof T): T[] {
  const seen = new Set<unknown>();
  const out: T[] = [];
  for (const item of items) {
    const k = item[key];
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return out;
}
`,
  },
}

export const wordFrequency: Problem = {
  id: 'js-word-frequency',
  title: 'Frequência de palavras com Map',
  difficulty: 'Fácil',
  pattern: 'map-set',
  fnName: 'wordFrequency',
  params: ['text'],
  description: `
Escreva \`wordFrequency(text)\` que retorna um **\`Map\`** de \`palavra → quantidade\`:

- palavras em **minúsculas**;
- palavras são sequências de letras (incluindo acentuadas) e números; ignore pontuação;
- a ordem do Map deve ser a ordem em que cada palavra apareceu pela **primeira vez**.
`,
  examples: [{ input: 'text = "O gato e o rato. O RATO!"', output: 'Map { "o" => 3, "gato" => 1, "e" => 1, "rato" => 2 }' }],
  constraints: [],
  starter: {
    js: `/**
 * @param {string} text
 * @return {Map<string, number>}
 */
function wordFrequency(text) {

}
`,
    ts: `function wordFrequency(text: string): Map<string, number> {

}
`,
  },
  tests: [
    {
      input: ['O gato e o rato. O RATO!'],
      expected: new Map([
        ['o', 3],
        ['gato', 1],
        ['e', 1],
        ['rato', 2],
      ]),
      label: 'Exemplo',
    },
    { input: [''], expected: new Map(), label: 'Texto vazio' },
    {
      input: ['Ação, ação... reação!'],
      expected: new Map([
        ['ação', 2],
        ['reação', 1],
      ]),
      label: 'Acentos',
    },
    {
      input: ['js 2026 js'],
      expected: new Map([
        ['js', 2],
        ['2026', 1],
      ]),
      label: 'Números',
    },
  ],
  hints: [
    'Separe as palavras com uma regex que aceite letras acentuadas: `text.toLowerCase().match(/[\\p{L}\\p{N}]+/gu)`.',
    'Cuidado: `match` retorna `null` quando não acha nada. Use `?? []`.',
    'Conte com `map.set(w, (map.get(w) ?? 0) + 1)`. O Map preserva a ordem de inserção.',
  ],
  explanation: {
    intuition: `
\`Map\` é a estrutura certa para **contagem**: aceita qualquer chave, tem \`.size\`, é iterável na **ordem de inserção** e não tem chaves herdadas (num objeto \`{}\`, a palavra \`"constructor"\` já "existe"!).

\`\\p{L}\` (com a flag \`u\`) é "qualquer letra Unicode": cobre ç, á, ã... que \`\\w\` não pega.
`,
    steps: ['`const words = text.toLowerCase().match(/[\\p{L}\\p{N}]+/gu) ?? []`.', '`const freq = new Map()`.', 'Para cada palavra: `freq.set(w, (freq.get(w) ?? 0) + 1)`.'],
    time: 'O(n)',
    space: 'O(k)',
    complexityWhy: 'n caracteres; k palavras distintas no Map.',
    pitfalls: ['`/\\w+/` não reconhece letras acentuadas ("ação" vira "a", "o").', 'Usar objeto `{}`: palavras como "constructor" ou "toString" dão resultados estranhos.', 'Esquecer o `?? []` quando o texto não tem palavras.'],
  },
  solution: {
    js: `function wordFrequency(text) {
  const words = text.toLowerCase().match(/[\\p{L}\\p{N}]+/gu) ?? [];
  const freq = new Map();
  for (const w of words) {
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }
  return freq;
}
`,
    ts: `function wordFrequency(text: string): Map<string, number> {
  const words = text.toLowerCase().match(/[\\p{L}\\p{N}]+/gu) ?? [];
  const freq = new Map<string, number>();
  for (const w of words) {
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }
  return freq;
}
`,
  },
}

export const intersection: Problem = {
  id: 'js-intersection',
  title: 'Interseção com Set',
  difficulty: 'Fácil',
  pattern: 'map-set',
  fnName: 'intersection',
  params: ['a', 'b'],
  description: `
Escreva \`intersection(a, b)\` que retorna os valores que aparecem **nos dois** arrays, **sem repetição**, na ordem em que aparecem em \`a\`.

Faça em **O(n + m)**.
`,
  examples: [{ input: 'a = [1, 2, 2, 3, 4], b = [2, 4, 4, 6]', output: '[2, 4]' }],
  constraints: [],
  starter: {
    js: `/**
 * @param {any[]} a
 * @param {any[]} b
 * @return {any[]}
 */
function intersection(a, b) {

}
`,
    ts: `function intersection<T>(a: T[], b: T[]): T[] {

}
`,
  },
  tests: [
    { input: [[1, 2, 2, 3, 4], [2, 4, 4, 6]], expected: [2, 4], label: 'Exemplo' },
    { input: [[1, 2], [3, 4]], expected: [], label: 'Nada em comum' },
    { input: [['a', 'b', 'c'], ['c', 'a']], expected: ['a', 'c'], label: 'Ordem de a' },
    { input: [[NaN, 1], [NaN]], expected: [NaN], label: 'NaN (Set entende NaN)' },
    { input: [[1, '1'], ['1']], expected: ['1'], label: 'Sem coerção' },
  ],
  hints: [
    '`a.filter(x => b.includes(x))` funciona, mas `includes` percorre `b` inteiro a cada elemento: O(n·m).',
    'Transforme `b` num `Set`: `has` é O(1).',
    'Para não repetir valores de `a`, use outro Set (`added`) ou transforme o resultado: `[...new Set(...)]`.',
  ],
  explanation: {
    intuition: `
O "truque" de performance mais comum em JS: **converter o array de busca num Set** antes do loop. \`includes\`/\`indexOf\` dentro de um loop são O(n) escondidos.

Bônus: \`Set\` usa SameValueZero, então até \`NaN\` é encontrado (\`[NaN].indexOf(NaN)\` é -1, mas \`new Set([NaN]).has(NaN)\` é true).
`,
    steps: ['`const inB = new Set(b)`, `const added = new Set()`, `const out = []`.', 'Para cada `x` de `a`: se `inB.has(x) && !added.has(x)`, adiciona em `added` e em `out`.'],
    time: 'O(n + m)',
    space: 'O(m)',
    complexityWhy: 'Construir o Set de b é O(m); a passada por a é O(n) com consultas O(1).',
    pitfalls: ['`b.includes(x)` dentro do loop: O(n·m).', '`b.indexOf(NaN)` nunca acha NaN.', 'Esquecer de remover repetidos de `a`.'],
  },
  solution: {
    js: `function intersection(a, b) {
  const inB = new Set(b);
  const added = new Set();
  const out = [];
  for (const x of a) {
    if (inB.has(x) && !added.has(x)) {
      added.add(x);
      out.push(x);
    }
  }
  return out;
}
`,
    ts: `function intersection<T>(a: T[], b: T[]): T[] {
  const inB = new Set(b);
  const added = new Set<T>();
  const out: T[] = [];
  for (const x of a) {
    if (inB.has(x) && !added.has(x)) {
      added.add(x);
      out.push(x);
    }
  }
  return out;
}
`,
  },
  perf: {
    gen: (n: number) => [Array.from({ length: n }, (_, i) => i), Array.from({ length: n }, (_, i) => i * 2)],
    n: 50000,
    limitMs: 2500,
    label: 'dois arrays de 50.000',
  },
}

/* ======================= Sintaxe moderna ======================= */

export const getCity: Problem = {
  id: 'js-get-city',
  title: 'Acesso seguro com ?. e ??',
  difficulty: 'Fácil',
  pattern: 'sintaxe-moderna',
  fnName: 'getCity',
  params: ['user'],
  description: `
Dados de API muitas vezes vêm incompletos. Escreva \`getCity(user)\` que retorna \`user.address.city\` com segurança:

- se \`user\`, \`address\` ou \`city\` não existirem (\`null\`/\`undefined\`), retorne \`"Desconhecida"\`;
- se a cidade existir mas for **string vazia**, retorne a string vazia mesmo (é um valor válido, não ausência).
`,
  examples: [
    { input: 'user = { address: { city: "Americana" } }', output: '"Americana"' },
    { input: 'user = null', output: '"Desconhecida"' },
    { input: 'user = { address: { city: "" } }', output: '""' },
  ],
  constraints: [],
  starter: {
    js: `/**
 * @param {{ address?: { city?: string | null } | null } | null | undefined} user
 * @return {string}
 */
function getCity(user) {

}
`,
    ts: `interface User {
  address?: { city?: string | null } | null;
}

function getCity(user: User | null | undefined): string {

}
`,
  },
  tests: [
    { input: [{ address: { city: 'Americana' } }], expected: 'Americana', label: 'Completo' },
    { input: [null], expected: 'Desconhecida', label: 'user null' },
    { input: [{}], expected: 'Desconhecida', label: 'Sem address' },
    { input: [{ address: null }], expected: 'Desconhecida', label: 'address null' },
    { input: [{ address: { city: '' } }], expected: '', label: 'Cidade vazia (pegadinha do ||)' },
    { input: [undefined], expected: 'Desconhecida', label: 'user undefined' },
  ],
  hints: [
    '`user?.address` devolve `undefined` (sem erro) quando `user` é null/undefined.',
    'Encadeie: `user?.address?.city`.',
    'Para o valor padrão use `??` (só troca null/undefined), não `||` (troca qualquer falsy, inclusive "").',
  ],
  explanation: {
    intuition: `
**Optional chaining** (\`?.\`) para a avaliação e devolve \`undefined\` se o que está à esquerda for \`null\` ou \`undefined\`, em vez de lançar \`TypeError: Cannot read properties of null\`.

**Nullish coalescing** (\`??\`) usa o valor da direita **só** se o da esquerda for \`null\`/\`undefined\`. Já \`||\` usa a direita para **qualquer falsy** (\`""\`, \`0\`, \`false\`): bug clássico em formulários, onde 0 e "" são respostas válidas.
`,
    steps: ['`return user?.address?.city ?? "Desconhecida"`.'],
    time: 'O(1)',
    space: 'O(1)',
    complexityWhy: 'Acessos diretos.',
    pitfalls: ['`user.address.city || "Desconhecida"`: quebra com user null e troca "" pelo padrão.', '`?.` só protege do null/undefined; se `address` for um número, `address.city` é só `undefined`.'],
  },
  solution: {
    js: `function getCity(user) {
  return user?.address?.city ?? 'Desconhecida';
}
`,
    ts: `interface User {
  address?: { city?: string | null } | null;
}

function getCity(user: User | null | undefined): string {
  return user?.address?.city ?? 'Desconhecida';
}
`,
  },
}

export const mergeSettings: Problem = {
  id: 'js-merge-settings',
  title: 'Mesclando configurações (spread + recursão)',
  difficulty: 'Médio',
  pattern: 'sintaxe-moderna',
  fnName: 'mergeSettings',
  params: ['defaults', 'overrides'],
  io: {
    harness: `(mergeSettings, defaults, overrides) => {
  const d = JSON.stringify(defaults);
  const o = JSON.stringify(overrides);
  const result = mergeSettings(defaults, overrides);
  return { result, inputsUntouched: JSON.stringify(defaults) === d && JSON.stringify(overrides) === o };
}`,
  },
  description: `
Escreva \`mergeSettings(defaults, overrides)\` que combina configurações:

- chaves de \`overrides\` sobrescrevem as de \`defaults\`;
- se **os dois** lados tiverem um **objeto simples** na mesma chave, mescle **recursivamente** (em vez de substituir o objeto inteiro);
- arrays e primitivos são **substituídos**, não mesclados;
- nenhum dos objetos de entrada pode ser alterado.
`,
  examples: [
    {
      input: 'defaults = { theme: { color: "dark", size: 14 }, lang: "pt" }, overrides = { theme: { size: 16 } }',
      output: '{ theme: { color: "dark", size: 16 }, lang: "pt" }',
      explanation: 'Com `{ ...defaults, ...overrides }` o theme inteiro seria trocado e color se perderia.',
    },
  ],
  constraints: [],
  starter: {
    js: `/**
 * @param {object} defaults
 * @param {object} overrides
 * @return {object}
 */
function mergeSettings(defaults, overrides) {

}
`,
    ts: `type Settings = { [key: string]: unknown };

function mergeSettings(defaults: Settings, overrides: Settings): Settings {

}
`,
  },
  tests: [
    {
      input: [{ theme: { color: 'dark', size: 14 }, lang: 'pt' }, { theme: { size: 16 } }],
      expected: { result: { theme: { color: 'dark', size: 16 }, lang: 'pt' }, inputsUntouched: true },
      label: 'Exemplo',
    },
    {
      input: [{ tags: ['a', 'b'], n: 1 }, { tags: ['c'] }],
      expected: { result: { tags: ['c'], n: 1 }, inputsUntouched: true },
      label: 'Arrays são substituídos',
    },
    {
      input: [{ a: { b: { c: 1, d: 2 } } }, { a: { b: { d: 3 }, e: 4 } }],
      expected: { result: { a: { b: { c: 1, d: 3 }, e: 4 } }, inputsUntouched: true },
      label: 'Três níveis',
    },
    {
      input: [{ x: { y: 1 } }, { x: null }],
      expected: { result: { x: null }, inputsUntouched: true },
      label: 'null substitui',
    },
    { input: [{}, { novo: true }], expected: { result: { novo: true }, inputsUntouched: true }, label: 'Chave nova' },
  ],
  hints: [
    'Comece com uma cópia rasa: `const out = { ...defaults }`. Assim o objeto de entrada não é alterado.',
    'Para cada chave de `overrides`: se o valor em `out` e em `overrides` forem objetos simples, chame `mergeSettings` neles; senão, sobrescreva.',
    'Helper: `const isPlainObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v)`.',
  ],
  explanation: {
    intuition: `
O spread (\`{ ...a, ...b }\`) é um merge **raso**: na colisão de chaves, o valor de \`b\` substitui o de \`a\` por inteiro, mesmo que ambos sejam objetos. Para configurações aninhadas isso apaga opções.

O merge profundo aplica a mesma regra **em cada nível**, descendo só quando os dois lados são objetos simples. Como sempre criamos objetos novos (\`{ ...defaults }\` em cada nível), as entradas ficam intactas.
`,
    steps: [
      '`const out = { ...defaults }`.',
      'Para cada `[k, v]` de `Object.entries(overrides)`: se `isPlainObject(out[k]) && isPlainObject(v)`, `out[k] = mergeSettings(out[k], v)`.',
      'Senão `out[k] = v`.',
      'Retorne `out`.',
    ],
    time: 'O(n)',
    space: 'O(n)',
    complexityWhy: 'n = total de chaves nos dois objetos.',
    pitfalls: ['`Object.assign(defaults, overrides)`: **altera** `defaults`.', 'Mesclar arrays por índice (`["a","b"]` + `["c"]` viraria `["c","b"]`).', 'Tratar `null` como objeto (`typeof null === "object"`).'],
  },
  solution: {
    js: `function mergeSettings(defaults, overrides) {
  const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
  const out = { ...defaults };
  for (const [key, value] of Object.entries(overrides)) {
    out[key] = isPlainObject(out[key]) && isPlainObject(value) ? mergeSettings(out[key], value) : value;
  }
  return out;
}
`,
    ts: `type Settings = { [key: string]: unknown };

function mergeSettings(defaults: Settings, overrides: Settings): Settings {
  const isPlainObject = (v: unknown): v is Settings => v !== null && typeof v === 'object' && !Array.isArray(v);
  const out: Settings = { ...defaults };
  for (const [key, value] of Object.entries(overrides)) {
    const current = out[key];
    out[key] = isPlainObject(current) && isPlainObject(value) ? mergeSettings(current, value) : value;
  }
  return out;
}
`,
  },
}

export const summarize: Problem = {
  id: 'js-summarize-rest',
  title: 'Rest, desestruturação e valores padrão',
  difficulty: 'Fácil',
  pattern: 'sintaxe-moderna',
  fnName: 'summarize',
  params: ['config', 'nums'],
  io: {
    harness: `(summarize, config, nums) => summarize(config, ...nums)`,
  },
  description: `
Escreva \`summarize({ label = "total", precision = 0 } = {}, ...nums)\`:

- o primeiro parâmetro é um objeto de opções, **desestruturado** com valores padrão (e pode nem ser passado);
- o resto dos argumentos (**rest parameter**) são números;
- retorne \`{ label, count, first, last, sum }\`, com \`sum\` arredondado para \`precision\` casas decimais (use \`Number(x.toFixed(precision))\`);
- sem números: \`first\` e \`last\` são \`null\` e \`sum\` é 0.

**Como é testado:** \`summarize(config, ...nums)\`.
`,
  examples: [
    { input: 'config = { label: "notas", precision: 1 }, nums = [7.25, 8.5, 9]', output: '{ label: "notas", count: 3, first: 7.25, last: 9, sum: 24.8 }' },
    { input: 'config = undefined, nums = [1, 2]', output: '{ label: "total", count: 2, first: 1, last: 2, sum: 3 }' },
  ],
  constraints: [],
  starter: {
    js: `function summarize({ label = 'total', precision = 0 } = {}, ...nums) {

}
`,
    ts: `interface SummaryOptions {
  label?: string;
  precision?: number;
}

function summarize({ label = 'total', precision = 0 }: SummaryOptions = {}, ...nums: number[]) {

}
`,
  },
  tests: [
    {
      input: [{ label: 'notas', precision: 1 }, [7.25, 8.5, 9]],
      expected: { label: 'notas', count: 3, first: 7.25, last: 9, sum: 24.8 },
      label: 'Exemplo 1',
    },
    { input: [undefined, [1, 2]], expected: { label: 'total', count: 2, first: 1, last: 2, sum: 3 }, label: 'Sem config' },
    { input: [{}, []], expected: { label: 'total', count: 0, first: null, last: null, sum: 0 }, label: 'Sem números' },
    { input: [{ precision: 2 }, [0.1, 0.2]], expected: { label: 'total', count: 2, first: 0.1, last: 0.2, sum: 0.3 }, label: '0.1 + 0.2' },
  ],
  hints: [
    'A assinatura já faz quase tudo: `label` e `precision` já chegam com os padrões, e `nums` é um array.',
    'Desestruture o array também: `const [first = null] = nums` pega o primeiro (ou null).',
    'Último: `nums.at(-1) ?? null`. Soma: `nums.reduce((a, b) => a + b, 0)`.',
  ],
  explanation: {
    intuition: `
Três recursos de sintaxe trabalhando juntos:

- **Desestruturação com padrão** no parâmetro: \`{ label = "total" } = {}\`. O \`= {}\` final é o que permite chamar sem nenhum objeto (senão, desestruturar \`undefined\` lança TypeError).
- **Rest parameter** \`...nums\`: junta os argumentos restantes num **array de verdade** (diferente do antigo \`arguments\`).
- **Spread** na chamada (\`summarize(config, ...nums)\`): o inverso, espalha um array em argumentos.

E o teste \`0.1 + 0.2\` mostra por que existe o \`precision\`: em ponto flutuante a soma dá \`0.30000000000000004\`.
`,
    steps: ['`const [first = null] = nums`, `const last = nums.at(-1) ?? null`.', '`const sum = Number(nums.reduce((a, b) => a + b, 0).toFixed(precision))`.', 'Retorne `{ label, count: nums.length, first, last, sum }` (shorthand properties).'],
    time: 'O(n)',
    space: 'O(1)',
    complexityWhy: 'Uma soma sobre os números.',
    pitfalls: ['Esquecer o `= {}` no parâmetro: `summarize(undefined, 1)` lança TypeError.', '`toFixed` retorna **string**: converta com `Number(...)`.', 'Padrões só valem para `undefined`: `{ label: null }` mantém `null`.'],
  },
  solution: {
    js: `function summarize({ label = 'total', precision = 0 } = {}, ...nums) {
  const [first = null] = nums;
  const last = nums.at(-1) ?? null;
  const sum = Number(nums.reduce((a, b) => a + b, 0).toFixed(precision));
  return { label, count: nums.length, first, last, sum };
}
`,
    ts: `interface SummaryOptions {
  label?: string;
  precision?: number;
}

function summarize({ label = 'total', precision = 0 }: SummaryOptions = {}, ...nums: number[]) {
  const [first = null] = nums;
  const last = nums.at(-1) ?? null;
  const sum = Number(nums.reduce((a, b) => a + b, 0).toFixed(precision));
  return { label, count: nums.length, first, last, sum };
}
`,
  },
}
