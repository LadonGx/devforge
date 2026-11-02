import type { Problem } from '../types'
import { starter } from './helpers'

/* ======================= Arrays: o básico ======================= */

export const minMax: Problem = {
  id: 'js-min-max',
  title: 'Menor e maior valor',
  difficulty: 'Fácil',
  pattern: 'arrays',
  fnName: 'minMax',
  params: ['nums'],
  description: `
Um painel de vendas mostra o **menor** e o **maior** valor de venda do dia.

Escreva \`minMax(nums)\` que retorna \`[menor, maior]\`. Se o array estiver vazio, retorne \`null\`.

Tente resolver com **um único loop**, usando o padrão "melhor até agora".
`,
  examples: [
    { input: 'minMax([40, 12, 99, 7, 55])', output: '[7, 99]' },
    { input: 'minMax([])', output: 'null' },
  ],
  constraints: ['0 <= nums.length <= 10^5'],
  starter: starter('function minMax(nums)', 'function minMax(nums: number[]): [number, number] | null', '/**\n * @param {number[]} nums\n * @return {[number, number] | null}\n */'),
  tests: [
    { input: [[40, 12, 99, 7, 55]], expected: [7, 99], label: 'Exemplo 1' },
    { input: [[]], expected: null, label: 'Vazio' },
    { input: [[5]], expected: [5, 5], label: 'Um elemento' },
    { input: [[-3, -10, -1]], expected: [-10, -1], label: 'Negativos' },
    { input: [[2, 2, 2]], expected: [2, 2], label: 'Todos iguais' },
  ],
  hints: [
    'Comece com `menor` e `maior` valendo `nums[0]` (não 0! e se todos forem negativos?).',
    'Percorra o array: `if (n < menor) menor = n;` e `if (n > maior) maior = n;`.',
  ],
  explanation: {
    intuition: 'Padrão "melhor até agora": você carrega o menor e o maior vistos e atualiza quando aparece alguém melhor. Começar com o primeiro elemento garante um valor que **existe** no array.',
    steps: ['Se `nums.length === 0` → `null`.', '`menor = maior = nums[0]`.', 'Para cada `n`: atualize `menor` e `maior`.', 'Retorne `[menor, maior]`.'],
    time: 'O(n)',
    space: 'O(1)',
    complexityWhy: 'Uma passada pelo array.',
    pitfalls: ['Começar `maior = 0`: com só negativos, o resultado seria 0.', '`Math.max(...nums)` funciona, mas com arrays muito grandes (centenas de milhares) o spread estoura a pilha.', 'Ordenar para pegar as pontas é O(n log n) e altera o array original.'],
  },
  solution: {
    js: `function minMax(nums) {
  if (nums.length === 0) return null;
  let menor = nums[0];
  let maior = nums[0];
  for (const n of nums) {
    if (n < menor) menor = n;
    if (n > maior) maior = n;
  }
  return [menor, maior];
}
`,
    ts: `function minMax(nums: number[]): [number, number] | null {
  if (nums.length === 0) return null;
  let menor = nums[0];
  let maior = nums[0];
  for (const n of nums) {
    if (n < menor) menor = n;
    if (n > maior) maior = n;
  }
  return [menor, maior];
}
`,
  },
}

export const removeAt: Problem = {
  id: 'js-remove-at',
  title: 'Remover sem alterar o original',
  difficulty: 'Fácil',
  pattern: 'arrays',
  fnName: 'removeAt',
  params: ['arr', 'index'],
  io: {
    harness: `(removeAt, arr, index) => {
  const recebido = [...arr];
  const result = removeAt(recebido, index);
  if (JSON.stringify(recebido) !== JSON.stringify(arr)) {
    throw new Error('Você alterou o array original! Devolva um array novo.');
  }
  if (result === recebido) throw new Error('Você devolveu o próprio array recebido: crie um novo.');
  return result;
}`,
  },
  description: `
No React, a lista do estado **não pode ser alterada diretamente**: você precisa criar uma lista nova.

Escreva \`removeAt(arr, index)\` que retorna um **array novo** sem o item da posição \`index\`, **sem alterar** \`arr\`. Se \`index\` estiver fora do array, retorne uma cópia igual.

O teste confere se o array original continua intacto.
`,
  examples: [
    { input: 'removeAt(["a", "b", "c"], 1)', output: '["a", "c"]' },
    { input: 'removeAt([1, 2, 3], 10)', output: '[1, 2, 3]' },
  ],
  constraints: [],
  starter: starter('function removeAt(arr, index)', 'function removeAt<T>(arr: T[], index: number): T[]', '/**\n * @param {any[]} arr\n * @param {number} index\n * @return {any[]}\n */'),
  tests: [
    { input: [['a', 'b', 'c'], 1], expected: ['a', 'c'], label: 'Meio' },
    { input: [[1, 2, 3], 0], expected: [2, 3], label: 'Primeiro' },
    { input: [[1, 2, 3], 2], expected: [1, 2], label: 'Último' },
    { input: [[1, 2, 3], 10], expected: [1, 2, 3], label: 'Fora do array' },
    { input: [[1, 2, 3], -1], expected: [1, 2, 3], label: 'Índice negativo' },
    { input: [[], 0], expected: [], label: 'Vazio' },
  ],
  hints: [
    '`splice` altera o original: evite, ou use em uma **cópia** (`const copia = [...arr]`).',
    'Sem splice: `[...arr.slice(0, index), ...arr.slice(index + 1)]` junta o pedaço antes e o pedaço depois.',
    'Para índices inválidos (negativo ou >= length), retorne `[...arr]`.',
  ],
  explanation: {
    intuition: 'O item removido é "o que está antes dele" + "o que está depois dele". Os dois `slice` fazem cópias desses pedaços, e o spread os junta num array novo: o original nunca é tocado.',
    steps: ['Se `index < 0 || index >= arr.length`, retorne `[...arr]`.', 'Retorne `[...arr.slice(0, index), ...arr.slice(index + 1)]`.'],
    time: 'O(n)',
    space: 'O(n)',
    complexityWhy: 'Copia todos os itens para o array novo.',
    pitfalls: ['`arr.splice(index, 1); return arr;` altera o original (o teste reclama).', '`slice(-1)` com índice negativo pegaria o fim do array: trate antes.', 'Também dá com `arr.filter((_, i) => i !== index)` ou `arr.toSpliced(index, 1)`.'],
  },
  solution: {
    js: `function removeAt(arr, index) {
  if (index < 0 || index >= arr.length) return [...arr];
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
}
`,
    ts: `function removeAt<T>(arr: T[], index: number): T[] {
  if (index < 0 || index >= arr.length) return [...arr];
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
}
`,
  },
}

export const chunk: Problem = {
  id: 'js-chunk',
  title: 'Dividir em páginas',
  difficulty: 'Fácil',
  pattern: 'arrays',
  fnName: 'chunk',
  params: ['items', 'size'],
  description: `
Uma tela mostra os produtos em **páginas** de tamanho fixo.

Escreva \`chunk(items, size)\` que divide o array em grupos de \`size\` itens. O último grupo pode ter menos.
`,
  examples: [
    { input: 'chunk([1, 2, 3, 4, 5], 2)', output: '[[1, 2], [3, 4], [5]]' },
    { input: 'chunk(["a", "b", "c"], 3)', output: '[["a", "b", "c"]]' },
  ],
  constraints: ['size >= 1'],
  starter: starter('function chunk(items, size)', 'function chunk<T>(items: T[], size: number): T[][]', '/**\n * @param {any[]} items\n * @param {number} size\n * @return {any[][]}\n */'),
  tests: [
    { input: [[1, 2, 3, 4, 5], 2], expected: [[1, 2], [3, 4], [5]], label: 'Exemplo 1' },
    { input: [['a', 'b', 'c'], 3], expected: [['a', 'b', 'c']], label: 'Um grupo exato' },
    { input: [[], 3], expected: [], label: 'Vazio' },
    { input: [[1, 2, 3], 1], expected: [[1], [2], [3]], label: 'Tamanho 1' },
    { input: [[1, 2], 5], expected: [[1, 2]], label: 'Tamanho maior que o array' },
  ],
  hints: ['Um `for` que anda de `size` em `size`: `for (let i = 0; i < items.length; i += size)`.', 'Em cada volta, `items.slice(i, i + size)` é um grupo.'],
  explanation: {
    intuition: 'O índice de início de cada página é 0, size, 2·size... Um `for` com passo `size` visita exatamente esses pontos, e o `slice` recorta a página (ele não reclama se o fim passar do array).',
    steps: ['`const pages = []`.', '`for (let i = 0; i < items.length; i += size) pages.push(items.slice(i, i + size))`.', 'Retorne `pages`.'],
    time: 'O(n)',
    space: 'O(n)',
    complexityWhy: 'Cada item é copiado uma vez para algum grupo.',
    pitfalls: ['Usar `i++` e recortar páginas sobrepostas.', 'Esquecer o último grupo incompleto quando faz manualmente com contador.'],
  },
  solution: {
    js: `function chunk(items, size) {
  const pages = [];
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size));
  }
  return pages;
}
`,
    ts: `function chunk<T>(items: T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size));
  }
  return pages;
}
`,
  },
}

/* ======================= Objetos: o básico ======================= */

export const pick: Problem = {
  id: 'js-pick',
  title: 'Só os campos públicos',
  difficulty: 'Fácil',
  pattern: 'objetos',
  fnName: 'pick',
  params: ['obj', 'keys'],
  description: `
Uma API nunca deve devolver o usuário inteiro do banco (com senha, tokens...). Só os campos permitidos.

Escreva \`pick(obj, keys)\` que retorna um **objeto novo** só com as chaves de \`keys\` que **existem** em \`obj\`. Chaves que não existem são ignoradas.
`,
  examples: [
    {
      input: 'pick({ id: 1, nome: "Ana", senha: "123" }, ["id", "nome"])',
      output: '{ id: 1, nome: "Ana" }',
    },
    { input: 'pick({ a: 1 }, ["a", "b"])', output: '{ a: 1 }' },
  ],
  constraints: [],
  starter: starter(
    'function pick(obj, keys)',
    'function pick(obj: Record<string, unknown>, keys: string[]): Record<string, unknown>',
    '/**\n * @param {Record<string, any>} obj\n * @param {string[]} keys\n * @return {Record<string, any>}\n */',
  ),
  tests: [
    { input: [{ id: 1, nome: 'Ana', senha: '123' }, ['id', 'nome']], expected: { id: 1, nome: 'Ana' }, label: 'Exemplo 1' },
    { input: [{ a: 1 }, ['a', 'b']], expected: { a: 1 }, label: 'Chave inexistente' },
    { input: [{ a: 1, b: 2 }, []], expected: {}, label: 'Nenhuma chave' },
    { input: [{ ativo: false, total: 0, nome: '' }, ['ativo', 'total', 'nome']], expected: { ativo: false, total: 0, nome: '' }, label: 'Valores falsy existem!' },
    { input: [{ endereco: { cidade: 'Americana' }, id: 7 }, ['endereco']], expected: { endereco: { cidade: 'Americana' } }, label: 'Valor objeto' },
  ],
  hints: [
    'Comece com `const result = {}` e percorra `keys`.',
    'Para saber se a chave existe, use `key in obj` (ou `Object.hasOwn(obj, key)`). **Não** use `if (obj[key])`: valores como `0`, `false` e `""` existem, mas são falsy.',
    'Copie com colchetes: `result[key] = obj[key]`.',
  ],
  explanation: {
    intuition: 'Montar um objeto novo com só o necessário é o padrão "DTO" (objeto de transferência de dados). O detalhe é diferenciar "a chave não existe" de "a chave existe e vale algo falsy".',
    steps: ['`const result = {}`.', 'Para cada `key` de `keys`: se `key in obj`, `result[key] = obj[key]`.', 'Retorne `result`.'],
    time: 'O(k)',
    space: 'O(k)',
    complexityWhy: 'k = quantidade de chaves pedidas; cada checagem e cópia é O(1).',
    pitfalls: ['`if (obj[key])` descarta `0`, `false` e `""`.', 'Usar `result.key = ...` (cria uma chave chamada literalmente "key").'],
  },
  solution: {
    js: `function pick(obj, keys) {
  const result = {};
  for (const key of keys) {
    if (key in obj) result[key] = obj[key];
  }
  return result;
}
`,
    ts: `function pick(obj: Record<string, unknown>, keys: string[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    if (key in obj) result[key] = obj[key];
  }
  return result;
}
`,
  },
}

export const invertObject: Problem = {
  id: 'js-invert-object',
  title: 'Invertendo chaves e valores',
  difficulty: 'Fácil',
  pattern: 'objetos',
  fnName: 'invertObject',
  params: ['obj'],
  description: `
Um sistema guarda siglas → nomes dos estados, e outra tela precisa do caminho inverso (nome → sigla).

Escreva \`invertObject(obj)\` que retorna um objeto novo onde cada **valor** vira chave e cada **chave** vira valor. Se dois valores forem iguais, **o último vence**.
`,
  examples: [
    { input: 'invertObject({ SP: "São Paulo", RJ: "Rio de Janeiro" })', output: '{ "São Paulo": "SP", "Rio de Janeiro": "RJ" }' },
    { input: 'invertObject({ a: "x", b: "x" })', output: '{ x: "b" }' },
  ],
  constraints: ['Os valores são strings'],
  starter: starter(
    'function invertObject(obj)',
    'function invertObject(obj: Record<string, string>): Record<string, string>',
    '/**\n * @param {Record<string, string>} obj\n * @return {Record<string, string>}\n */',
  ),
  tests: [
    { input: [{ SP: 'São Paulo', RJ: 'Rio de Janeiro' }], expected: { 'São Paulo': 'SP', 'Rio de Janeiro': 'RJ' }, label: 'Exemplo 1' },
    { input: [{ a: 'x', b: 'x' }], expected: { x: 'b' }, label: 'Valor repetido' },
    { input: [{}], expected: {}, label: 'Vazio' },
    { input: [{ ok: '200', notFound: '404' }], expected: { '200': 'ok', '404': 'notFound' }, label: 'Status HTTP' },
  ],
  hints: ['`Object.entries(obj)` dá os pares `[chave, valor]`.', 'Para cada par, `result[valor] = chave`.'],
  explanation: {
    intuition: '`Object.entries` transforma o objeto numa lista de pares, que você percorre trocando a ordem. Como objetos não aceitam chaves repetidas, atribuir a mesma chave de novo sobrescreve: daí "o último vence".',
    steps: ['`const result = {}`.', '`for (const [k, v] of Object.entries(obj)) result[v] = k`.', 'Retorne `result`.'],
    time: 'O(n)',
    space: 'O(n)',
    complexityWhy: 'Uma passada pelas n chaves.',
    pitfalls: ['Usar `for...in` e esquecer que ele pode trazer chaves herdadas.', 'Em uma linha: `Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]))`.'],
  },
  solution: {
    js: `function invertObject(obj) {
  const result = {};
  for (const [chave, valor] of Object.entries(obj)) {
    result[valor] = chave;
  }
  return result;
}
`,
    ts: `function invertObject(obj: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [chave, valor] of Object.entries(obj)) {
    result[valor] = chave;
  }
  return result;
}
`,
  },
}

export const cartTotal: Problem = {
  id: 'js-cart-total',
  title: 'Total do carrinho',
  difficulty: 'Fácil',
  pattern: 'objetos',
  fnName: 'cartTotal',
  params: ['prices', 'cart'],
  description: `
O mercado online guarda os preços num objeto (\`produto → preço\`) e o carrinho em outro (\`produto → quantidade\`).

Escreva \`cartTotal(prices, cart)\` que retorna o **total da compra**, arredondado em 2 casas. Produtos do carrinho que não estão na tabela de preços são **ignorados** (saíram de linha).
`,
  examples: [
    {
      input: 'cartTotal({ arroz: 25.9, feijao: 8.5, cafe: 18 }, { arroz: 2, cafe: 1 })',
      output: '69.8',
    },
    { input: 'cartTotal({ leite: 5 }, { leite: 3, pao: 10 })', output: '15', explanation: 'pao não tem preço.' },
  ],
  constraints: [],
  starter: starter(
    'function cartTotal(prices, cart)',
    'function cartTotal(prices: Record<string, number>, cart: Record<string, number>): number',
    '/**\n * @param {Record<string, number>} prices\n * @param {Record<string, number>} cart\n * @return {number}\n */',
  ),
  tests: [
    { input: [{ arroz: 25.9, feijao: 8.5, cafe: 18 }, { arroz: 2, cafe: 1 }], expected: 69.8, label: 'Exemplo 1' },
    { input: [{ leite: 5 }, { leite: 3, pao: 10 }], expected: 15, label: 'Produto sem preço' },
    { input: [{ leite: 5 }, {}], expected: 0, label: 'Carrinho vazio' },
    { input: [{ a: 0.1, b: 0.2 }, { a: 1, b: 1 }], expected: 0.3, label: '0.1 + 0.2' },
    { input: [{ gratis: 0, caro: 999.99 }, { gratis: 5, caro: 1 }], expected: 999.99, label: 'Preço zero' },
  ],
  compare: 'float',
  hints: [
    'Percorra o **carrinho** com `Object.entries(cart)`: cada par é `[produto, quantidade]`.',
    'Pegue o preço com `prices[produto]`. Se for `undefined`, pule (cuidado: o preço 0 existe!).',
    'Arredonde no fim com `Math.round(total * 100) / 100`.',
  ],
  explanation: {
    intuition: 'Os dois objetos funcionam como "tabelas de consulta": para cada produto do carrinho, você **consulta** o preço pelo nome em O(1). É o mesmo princípio do hash map que vai aparecer no LeetCode.',
    steps: ['`let total = 0`.', 'Para cada `[produto, qtd]` do carrinho: se `produto in prices`, `total += prices[produto] * qtd`.', 'Retorne o total arredondado.'],
    time: 'O(n)',
    space: 'O(1)',
    complexityWhy: 'n = itens no carrinho; cada consulta de preço é O(1).',
    pitfalls: ['`if (!prices[produto]) continue` pula produtos de preço 0 (aqui não muda o total, mas é o hábito errado).', 'Somar `NaN` de produtos sem preço (`undefined * 3` é `NaN`).', 'Esquecer de arredondar (0.1 + 0.2).'],
  },
  solution: {
    js: `function cartTotal(prices, cart) {
  let total = 0;
  for (const [produto, qtd] of Object.entries(cart)) {
    if (!(produto in prices)) continue;
    total += prices[produto] * qtd;
  }
  return Math.round(total * 100) / 100;
}
`,
    ts: `function cartTotal(prices: Record<string, number>, cart: Record<string, number>): number {
  let total = 0;
  for (const [produto, qtd] of Object.entries(cart)) {
    if (!(produto in prices)) continue;
    total += prices[produto] * qtd;
  }
  return Math.round(total * 100) / 100;
}
`,
  },
}

/* ======================= Classes ======================= */

export const bankAccount: Problem = {
  id: 'js-bank-account',
  title: 'Conta bancária',
  difficulty: 'Fácil',
  pattern: 'classes',
  fnName: 'BankAccount',
  params: ['operações', 'argumentos'],
  io: { design: true },
  description: `
Implemente a classe \`BankAccount\`:

- \`new BankAccount(owner, initialBalance)\`: cria a conta. \`initialBalance\` é opcional (padrão **0**).
- \`deposit(amount)\`: soma ao saldo e retorna o **novo saldo**. Valores menores ou iguais a 0 são ignorados (retorna o saldo atual).
- \`withdraw(amount)\`: se houver saldo suficiente, subtrai e retorna \`true\`; senão, **não muda nada** e retorna \`false\`.
- \`getBalance()\`: retorna o saldo.
- \`getStatement()\`: retorna o extrato, um array de strings no formato \`"+100"\` (depósito) e \`"-30"\` (saque), só das operações que **deram certo**.

**Como é testado:** cada teste é uma sequência de operações (problema de design). A tabela mostra cada chamada com o retorno esperado.
`,
  examples: [
    {
      input: '["BankAccount","deposit","withdraw","withdraw","getBalance","getStatement"]\n[["Ana"],[100],[30],[500],[],[]]',
      output: '[null, 100, true, false, 70, ["+100", "-30"]]',
    },
  ],
  constraints: [],
  starter: {
    js: `class BankAccount {
  /**
   * @param {string} owner
   * @param {number} [initialBalance]
   */
  constructor(owner, initialBalance) {

  }

  /** @param {number} amount @return {number} */
  deposit(amount) {

  }

  /** @param {number} amount @return {boolean} */
  withdraw(amount) {

  }

  /** @return {number} */
  getBalance() {

  }

  /** @return {string[]} */
  getStatement() {

  }
}
`,
    ts: `class BankAccount {
  constructor(owner: string, initialBalance?: number) {

  }

  deposit(amount: number): number {

  }

  withdraw(amount: number): boolean {

  }

  getBalance(): number {

  }

  getStatement(): string[] {

  }
}
`,
  },
  tests: [
    {
      input: [['BankAccount', 'deposit', 'withdraw', 'withdraw', 'getBalance', 'getStatement'], [['Ana'], [100], [30], [500], [], []]],
      expected: [null, 100, true, false, 70, ['+100', '-30']],
      label: 'Exemplo 1',
    },
    {
      input: [['BankAccount', 'getBalance', 'withdraw', 'getBalance'], [['Bia', 50], [], [50], []]],
      expected: [null, 50, true, 0],
      label: 'Saldo inicial e saque total',
    },
    {
      input: [['BankAccount', 'deposit', 'deposit', 'getStatement'], [['Caio'], [0], [-20], []]],
      expected: [null, 0, 0, []],
      label: 'Depósitos inválidos',
    },
    {
      input: [['BankAccount', 'withdraw', 'deposit', 'withdraw', 'getStatement'], [['Duda', 10], [11], [5], [15], []]],
      expected: [null, false, 15, true, ['+5', '-15']],
      label: 'Saque negado não entra no extrato',
    },
  ],
  hints: [
    'No constructor guarde o estado em `this`: `this.balance = initialBalance ?? 0` (ou parâmetro com valor padrão) e `this.statement = []`.',
    'Em `withdraw`, use guard clause: `if (amount > this.balance) return false;`.',
    'Em `getStatement`, devolva uma **cópia** (`[...this.statement]`) para ninguém alterar o extrato de fora.',
  ],
  explanation: {
    intuition: 'A classe junta o **estado** (saldo, extrato) com as **regras** que o protegem (não depositar negativo, não sacar sem saldo). Quem usa a conta só consegue mudar o saldo pelos métodos, e os métodos garantem que o estado nunca fica inválido.',
    steps: ['constructor: `this.owner`, `this.balance`, `this.statement = []`.', 'deposit: ignore `<= 0`; some, registre `"+" + amount`, retorne o saldo.', 'withdraw: se faltar saldo, `false`; senão subtraia, registre `"-" + amount`, `true`.', 'getBalance / getStatement: leitura.'],
    time: 'O(1) por operação',
    space: 'O(n)',
    complexityWhy: 'Cada operação faz um número fixo de passos; o extrato guarda n registros.',
    pitfalls: ['Registrar no extrato antes de validar.', 'Esquecer o `this.` e criar variáveis soltas.', 'Para proteger de verdade, `#balance` (campo privado) impede `conta.balance = 1000000` de fora.'],
  },
  solution: {
    js: `class BankAccount {
  constructor(owner, initialBalance = 0) {
    this.owner = owner;
    this.balance = initialBalance;
    this.statement = [];
  }

  deposit(amount) {
    if (amount <= 0) return this.balance;
    this.balance += amount;
    this.statement.push('+' + amount);
    return this.balance;
  }

  withdraw(amount) {
    if (amount > this.balance) return false;
    this.balance -= amount;
    this.statement.push('-' + amount);
    return true;
  }

  getBalance() {
    return this.balance;
  }

  getStatement() {
    return [...this.statement];
  }
}
`,
    ts: `class BankAccount {
  owner: string;
  balance: number;
  statement: string[] = [];

  constructor(owner: string, initialBalance: number = 0) {
    this.owner = owner;
    this.balance = initialBalance;
  }

  deposit(amount: number): number {
    if (amount <= 0) return this.balance;
    this.balance += amount;
    this.statement.push('+' + amount);
    return this.balance;
  }

  withdraw(amount: number): boolean {
    if (amount > this.balance) return false;
    this.balance -= amount;
    this.statement.push('-' + amount);
    return true;
  }

  getBalance(): number {
    return this.balance;
  }

  getStatement(): string[] {
    return [...this.statement];
  }
}
`,
  },
}

export const stackClass: Problem = {
  id: 'js-stack-class',
  title: 'Sua própria pilha (Stack)',
  difficulty: 'Fácil',
  pattern: 'classes',
  fnName: 'Stack',
  params: ['operações', 'argumentos'],
  io: { design: true },
  description: `
A **pilha** (stack) funciona como uma pilha de pratos: o último que entra é o primeiro que sai (LIFO). Ela aparece no "desfazer" dos editores, no histórico do navegador e em muitos problemas de LeetCode.

Implemente a classe \`Stack\`:

- \`push(x)\`: coloca no topo e retorna o **novo tamanho**.
- \`pop()\`: remove e retorna o topo (ou \`null\` se estiver vazia).
- \`peek()\`: retorna o topo **sem remover** (ou \`null\`).
- \`isEmpty()\`: \`true\` se não houver itens.
- \`size()\`: quantidade de itens.
`,
  examples: [
    {
      input: '["Stack","push","push","peek","pop","pop","pop","isEmpty"]\n[[],[1],[2],[],[],[],[],[]]',
      output: '[null, 1, 2, 2, 2, 1, null, true]',
    },
  ],
  constraints: [],
  starter: {
    js: `class Stack {
  constructor() {

  }

  /** @param {any} x @return {number} */
  push(x) {

  }

  pop() {

  }

  peek() {

  }

  /** @return {boolean} */
  isEmpty() {

  }

  /** @return {number} */
  size() {

  }
}
`,
    ts: `class Stack<T> {
  constructor() {

  }

  push(x: T): number {

  }

  pop(): T | null {

  }

  peek(): T | null {

  }

  isEmpty(): boolean {

  }

  size(): number {

  }
}
`,
  },
  tests: [
    {
      input: [['Stack', 'push', 'push', 'peek', 'pop', 'pop', 'pop', 'isEmpty'], [[], [1], [2], [], [], [], [], []]],
      expected: [null, 1, 2, 2, 2, 1, null, true],
      label: 'Exemplo 1',
    },
    { input: [['Stack', 'isEmpty', 'size', 'peek'], [[], [], [], []]], expected: [null, true, 0, null], label: 'Vazia' },
    {
      input: [['Stack', 'push', 'push', 'push', 'size', 'pop', 'size', 'peek'], [[], ['a'], ['b'], ['c'], [], [], [], []]],
      expected: [null, 1, 2, 3, 3, 'c', 2, 'b'],
      label: 'Strings',
    },
    { input: [['Stack', 'push', 'pop', 'isEmpty'], [[], [0], [], []]], expected: [null, 1, 0, true], label: 'Empilhar o 0' },
  ],
  hints: ['Guarde os itens num array `this.items = []`. O **fim** do array é o topo.', '`push` e `pop` do array já fazem o trabalho; `peek` é `this.items[this.items.length - 1]`.', 'Retorne `null` quando estiver vazia (o `pop` do array devolveria `undefined`).'],
  explanation: {
    intuition: 'Usar o **fim** do array como topo deixa todas as operações O(1): `push` e `pop` do array mexem só no final. Usar o começo (`unshift`/`shift`) seria O(n).',
    steps: ['`this.items = []`.', '`push`: `return this.items.push(x)` (o push do array já devolve o novo tamanho).', '`pop`/`peek`: se vazia, `null`; senão o último.', '`isEmpty`: `length === 0`; `size`: `length`.'],
    time: 'O(1) por operação',
    space: 'O(n)',
    complexityWhy: 'Operações só no fim do array.',
    pitfalls: ['`if (!this.peek())` para checar vazio: falha quando o topo é `0` ou `""`.', 'Topo no começo do array com `unshift` (O(n)).'],
  },
  solution: {
    js: `class Stack {
  constructor() {
    this.items = [];
  }

  push(x) {
    return this.items.push(x);
  }

  pop() {
    if (this.isEmpty()) return null;
    return this.items.pop();
  }

  peek() {
    if (this.isEmpty()) return null;
    return this.items[this.items.length - 1];
  }

  isEmpty() {
    return this.items.length === 0;
  }

  size() {
    return this.items.length;
  }
}
`,
    ts: `class Stack<T> {
  private items: T[] = [];

  push(x: T): number {
    return this.items.push(x);
  }

  pop(): T | null {
    if (this.isEmpty()) return null;
    return this.items.pop() as T;
  }

  peek(): T | null {
    if (this.isEmpty()) return null;
    return this.items[this.items.length - 1];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }
}
`,
  },
}

export const todoList: Problem = {
  id: 'js-todo-list',
  title: 'Lista de tarefas',
  difficulty: 'Médio',
  pattern: 'classes',
  fnName: 'TodoList',
  params: ['operações', 'argumentos'],
  io: { design: true },
  description: `
Implemente a classe \`TodoList\`, o "back-end" de um app de tarefas:

- \`add(title)\`: cria uma tarefa e retorna o **id** dela. Os ids começam em **1** e aumentam a cada tarefa criada (nunca reaproveitam).
- \`complete(id)\`: marca como concluída e retorna \`true\`; se o id não existir, retorna \`false\`.
- \`remove(id)\`: remove a tarefa e retorna \`true\` (ou \`false\` se não existir).
- \`pending()\`: retorna os **títulos** das tarefas não concluídas, na ordem de criação.
- \`progress()\`: retorna a porcentagem concluída (0 a 100, **inteiro arredondado**). Sem tarefas, retorna 0.
`,
  examples: [
    {
      input: '["TodoList","add","add","add","complete","pending","progress"]\n[[],["estudar JS"],["fazer LeetCode"],["revisar"],[2],[],[]]',
      output: '[null, 1, 2, 3, true, ["estudar JS", "revisar"], 33]',
    },
  ],
  constraints: [],
  starter: {
    js: `class TodoList {
  constructor() {

  }

  /** @param {string} title @return {number} */
  add(title) {

  }

  /** @param {number} id @return {boolean} */
  complete(id) {

  }

  /** @param {number} id @return {boolean} */
  remove(id) {

  }

  /** @return {string[]} */
  pending() {

  }

  /** @return {number} */
  progress() {

  }
}
`,
    ts: `class TodoList {
  constructor() {

  }

  add(title: string): number {

  }

  complete(id: number): boolean {

  }

  remove(id: number): boolean {

  }

  pending(): string[] {

  }

  progress(): number {

  }
}
`,
  },
  tests: [
    {
      input: [['TodoList', 'add', 'add', 'add', 'complete', 'pending', 'progress'], [[], ['estudar JS'], ['fazer LeetCode'], ['revisar'], [2], [], []]],
      expected: [null, 1, 2, 3, true, ['estudar JS', 'revisar'], 33],
      label: 'Exemplo 1',
    },
    { input: [['TodoList', 'progress', 'pending', 'complete'], [[], [], [], [1]]], expected: [null, 0, [], false], label: 'Vazia' },
    {
      input: [['TodoList', 'add', 'add', 'remove', 'add', 'pending', 'remove'], [[], ['a'], ['b'], [1], ['c'], [], [1]]],
      expected: [null, 1, 2, true, 3, ['b', 'c'], false],
      label: 'Ids não são reaproveitados',
    },
    {
      input: [['TodoList', 'add', 'add', 'add', 'complete', 'complete', 'progress', 'remove', 'progress'], [[], ['a'], ['b'], ['c'], [1], [3], [], [2], []]],
      expected: [null, 1, 2, 3, true, true, 67, true, 100],
      label: 'Progresso arredondado',
    },
  ],
  hints: [
    'Guarde as tarefas como objetos `{ id, title, done }` num array (ou num `Map` por id) e um contador `this.nextId = 1`.',
    'Para achar uma tarefa: `this.tasks.find((t) => t.id === id)`. Para remover: `filter` ou `findIndex` + `splice`.',
    '`progress`: `Math.round((concluidas / total) * 100)`, com cuidado na divisão por zero.',
  ],
  explanation: {
    intuition: 'Cada tarefa é um objeto pequeno; a classe guarda a lista e um contador de ids que **só cresce** (assim um id removido nunca volta, como num banco de dados com auto-incremento). Os métodos de array (`find`, `filter`, `map`) fazem o resto.',
    steps: ['constructor: `this.tasks = []`, `this.nextId = 1`.', 'add: cria `{ id: this.nextId++, title, done: false }`.', 'complete/remove: encontre pelo id; `false` se não achar.', 'pending: `filter(!done).map(title)`.', 'progress: guarda para lista vazia + `Math.round`.'],
    time: 'O(n) por busca',
    space: 'O(n)',
    complexityWhy: 'find/filter percorrem a lista. Com um `Map` por id, complete e remove ficam O(1).',
    pitfalls: ['Usar `this.tasks.length + 1` como id: depois de remover, os ids se repetem.', 'Dividir por zero no `progress` (resultado `NaN`).', 'Retornar o array interno em `pending` em vez de um novo.'],
  },
  solution: {
    js: `class TodoList {
  constructor() {
    this.tasks = [];
    this.nextId = 1;
  }

  add(title) {
    const task = { id: this.nextId++, title, done: false };
    this.tasks.push(task);
    return task.id;
  }

  complete(id) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return false;
    task.done = true;
    return true;
  }

  remove(id) {
    const before = this.tasks.length;
    this.tasks = this.tasks.filter((t) => t.id !== id);
    return this.tasks.length < before;
  }

  pending() {
    return this.tasks.filter((t) => !t.done).map((t) => t.title);
  }

  progress() {
    if (this.tasks.length === 0) return 0;
    const done = this.tasks.filter((t) => t.done).length;
    return Math.round((done / this.tasks.length) * 100);
  }
}
`,
    ts: `interface Task {
  id: number;
  title: string;
  done: boolean;
}

class TodoList {
  private tasks: Task[] = [];
  private nextId = 1;

  add(title: string): number {
    const task: Task = { id: this.nextId++, title, done: false };
    this.tasks.push(task);
    return task.id;
  }

  complete(id: number): boolean {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return false;
    task.done = true;
    return true;
  }

  remove(id: number): boolean {
    const before = this.tasks.length;
    this.tasks = this.tasks.filter((t) => t.id !== id);
    return this.tasks.length < before;
  }

  pending(): string[] {
    return this.tasks.filter((t) => !t.done).map((t) => t.title);
  }

  progress(): number {
    if (this.tasks.length === 0) return 0;
    const done = this.tasks.filter((t) => t.done).length;
    return Math.round((done / this.tasks.length) * 100);
  }
}
`,
  },
}

/* ======================= Erros ======================= */

export const safeParse: Problem = {
  id: 'js-safe-parse',
  title: 'JSON.parse sem quebrar',
  difficulty: 'Fácil',
  pattern: 'erros',
  fnName: 'safeParse',
  params: ['text', 'fallback'],
  description: `
Dados salvos no \`localStorage\` podem estar corrompidos (alguém editou na mão, versão antiga...). Um \`JSON.parse\` direto derrubaria a tela inteira.

Escreva \`safeParse(text, fallback)\` que retorna o resultado de \`JSON.parse(text)\` ou, se o texto **não for JSON válido**, retorna \`fallback\`.

Atenção: \`"null"\` é um JSON **válido** (vira \`null\`) e deve ser respeitado.
`,
  examples: [
    { input: 'safeParse(\'{"tema":"escuro"}\', {})', output: '{ tema: "escuro" }' },
    { input: 'safeParse("{tema: escuro}", {})', output: '{}' },
  ],
  constraints: [],
  starter: starter('function safeParse(text, fallback)', 'function safeParse<T>(text: string, fallback: T): unknown', '/**\n * @param {string} text\n * @param {any} fallback\n * @return {any}\n */'),
  tests: [
    { input: ['{"tema":"escuro"}', {}], expected: { tema: 'escuro' }, label: 'JSON válido' },
    { input: ['{tema: escuro}', {}], expected: {}, label: 'JSON inválido' },
    { input: ['[1,2,3]', []], expected: [1, 2, 3], label: 'Array' },
    { input: ['', 'padrão'], expected: 'padrão', label: 'Texto vazio' },
    { input: ['null', 'padrão'], expected: null, label: '"null" é JSON válido' },
    { input: ['0', 10], expected: 0, label: '"0" é JSON válido' },
  ],
  hints: ['Coloque o `JSON.parse` dentro de um `try` e retorne o resultado.', 'No `catch`, retorne `fallback`.', 'Não teste o resultado com `||`: `null` e `0` são resultados válidos.'],
  explanation: {
    intuition: 'Não há como saber se um texto é JSON válido sem tentar ler. O `try/catch` é exatamente para isso: tenta; se lançar `SyntaxError`, usa o plano B.',
    steps: ['`try { return JSON.parse(text); }`', '`catch { return fallback; }`'],
    time: 'O(n)',
    space: 'O(n)',
    complexityWhy: 'O parse lê o texto inteiro.',
    pitfalls: ['`return JSON.parse(text) || fallback` troca `null`, `0` e `""` válidos pelo fallback.', 'Engolir erros que não são de parse (aqui só há o parse no try, então tudo bem).'],
  },
  solution: {
    js: `function safeParse(text, fallback) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}
`,
    ts: `function safeParse<T>(text: string, fallback: T): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}
`,
  },
}

export const validateUser: Problem = {
  id: 'js-validate-user',
  title: 'Validação com erro customizado',
  difficulty: 'Médio',
  pattern: 'erros',
  fnName: 'validateUser',
  params: ['user'],
  io: {
    harness: `(validateUser, user) => {
  try {
    const r = validateUser(user);
    return r === true ? 'ok' : 'retornou ' + String(r) + ' (esperado true)';
  } catch (e) {
    if (!(e instanceof Error)) return 'lançou algo que não é Error: ' + String(e);
    return e.name + ': ' + e.message;
  }
}`,
  },
  description: `
Crie uma classe \`ValidationError\` que **estende \`Error\`** e define \`this.name = "ValidationError"\`.

Depois escreva \`validateUser(user)\` que **lança** \`ValidationError\` com a mensagem da **primeira** regra que falhar, nesta ordem:

1. \`name\` ausente ou com menos de 2 caracteres (depois de \`trim\`) → \`"nome é obrigatório"\`
2. \`email\` sem \`"@"\` → \`"email inválido"\`
3. \`age\` não é número ou é negativa → \`"idade inválida"\`
4. \`age\` menor que 18 → \`"cadastro permitido só para maiores de 18"\`

Se tudo estiver certo, retorne \`true\`.

**Como é testado:** o teste mostra \`"ok"\` quando a função retorna \`true\`, ou \`"NomeDoErro: mensagem"\` quando ela lança.
`,
  examples: [
    { input: 'validateUser({ name: "Ana", email: "ana@x.com", age: 28 })', output: '"ok"' },
    { input: 'validateUser({ name: "Ana", email: "ana.com", age: 28 })', output: '"ValidationError: email inválido"' },
  ],
  constraints: [],
  starter: {
    js: `class ValidationError extends Error {
  // defina o constructor
}

/**
 * @param {{ name?: string, email?: string, age?: any }} user
 * @return {true}
 */
function validateUser(user) {

}
`,
    ts: `class ValidationError extends Error {
  // defina o constructor
}

interface UserInput {
  name?: string;
  email?: string;
  age?: unknown;
}

function validateUser(user: UserInput): true {

}
`,
  },
  tests: [
    { input: [{ name: 'Ana', email: 'ana@x.com', age: 28 }], expected: 'ok', label: 'Válido' },
    { input: [{ name: 'Ana', email: 'ana.com', age: 28 }], expected: 'ValidationError: email inválido', label: 'Email sem @' },
    { input: [{ name: ' A ', email: 'a@x.com', age: 30 }], expected: 'ValidationError: nome é obrigatório', label: 'Nome curto' },
    { input: [{ email: 'a@x.com', age: 30 }], expected: 'ValidationError: nome é obrigatório', label: 'Sem nome' },
    { input: [{ name: 'Bia', email: 'b@x.com', age: '20' }], expected: 'ValidationError: idade inválida', label: 'Idade como string' },
    { input: [{ name: 'Bia', email: 'b@x.com', age: -1 }], expected: 'ValidationError: idade inválida', label: 'Idade negativa' },
    { input: [{ name: 'Caio', email: 'c@x.com', age: 17 }], expected: 'ValidationError: cadastro permitido só para maiores de 18', label: 'Menor de idade' },
    { input: [{ name: 'Lu', email: 'semarroba', age: 10 }], expected: 'ValidationError: email inválido', label: 'Primeira regra que falha' },
  ],
  hints: [
    'A classe: `constructor(message) { super(message); this.name = "ValidationError"; }`.',
    'Guard clauses com `throw`: `if (!user.name || user.name.trim().length < 2) throw new ValidationError("nome é obrigatório");`.',
    'Para checar número: `typeof user.age !== "number"` (e `Number.isNaN` se quiser ser rigoroso).',
  ],
  explanation: {
    intuition: 'Validação é o lugar clássico do "falhe cedo": cada regra é uma linha que **para tudo** com uma mensagem clara. A classe própria permite a quem chamou diferenciar erro de validação (mostra para o usuário) de erro inesperado (bug, banco fora).',
    steps: ['`class ValidationError extends Error` com `super(message)` e `this.name`.', 'Quatro `if` + `throw`, na ordem do enunciado.', '`return true`.'],
    time: 'O(1)',
    space: 'O(1)',
    complexityWhy: 'Número fixo de verificações (o trim é sobre um nome curto).',
    pitfalls: ['Esquecer `this.name`: o erro apareceria como "Error: ...".', 'Lançar uma string (`throw "email inválido"`): não tem `name`, `message` nem stack.', '`user.name.trim()` quando `name` não existe: TypeError. Cheque a existência antes.'],
  },
  solution: {
    js: `class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

function validateUser(user) {
  if (!user.name || user.name.trim().length < 2) {
    throw new ValidationError('nome é obrigatório');
  }
  if (!user.email || !user.email.includes('@')) {
    throw new ValidationError('email inválido');
  }
  if (typeof user.age !== 'number' || user.age < 0) {
    throw new ValidationError('idade inválida');
  }
  if (user.age < 18) {
    throw new ValidationError('cadastro permitido só para maiores de 18');
  }
  return true;
}
`,
    ts: `class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

interface UserInput {
  name?: string;
  email?: string;
  age?: unknown;
}

function validateUser(user: UserInput): true {
  if (!user.name || user.name.trim().length < 2) {
    throw new ValidationError('nome é obrigatório');
  }
  if (!user.email || !user.email.includes('@')) {
    throw new ValidationError('email inválido');
  }
  if (typeof user.age !== 'number' || user.age < 0) {
    throw new ValidationError('idade inválida');
  }
  if (user.age < 18) {
    throw new ValidationError('cadastro permitido só para maiores de 18');
  }
  return true;
}
`,
  },
}

export const attempt: Problem = {
  id: 'js-attempt',
  title: 'Erro como valor: [erro, resultado]',
  difficulty: 'Médio',
  pattern: 'erros',
  fnName: 'attempt',
  params: ['fn'],
  io: {
    harness: `(attempt, nome) => {
  const fns = {
    ok: () => 42,
    objeto: () => ({ id: 1 }),
    erro: () => { throw new Error('saldo insuficiente'); },
    typeError: () => { const u = null; return u.nome; },
    string: () => { throw 'falhou'; },
    zero: () => 0,
  };
  const r = attempt(fns[nome]);
  if (!Array.isArray(r) || r.length !== 2) return 'retorne um array [erro, resultado]';
  if (nome === 'typeError') return [typeof r[0] === 'string' && r[0].length > 0 ? 'mensagem do TypeError' : r[0], r[1]];
  return r;
}`,
  },
  description: `
Algumas linguagens (como Go) tratam erro como **valor** de retorno, em vez de exceção. Esse estilo também aparece em JS para evitar \`try/catch\` espalhado.

Escreva \`attempt(fn)\` que **chama** \`fn()\` e retorna:

- \`[null, resultado]\` se der certo;
- \`[mensagem, null]\` se \`fn\` lançar algo. A mensagem é \`erro.message\` se for um \`Error\`, ou \`String(erro)\` se for qualquer outra coisa.

**Como é testado:** o teste passa funções prontas (\`ok\` retorna 42, \`erro\` lança \`new Error("saldo insuficiente")\`, \`string\` lança a string \`"falhou"\`...). A coluna de entrada mostra o nome da função.
`,
  examples: [
    { input: 'attempt(() => 42)', output: '[null, 42]' },
    { input: 'attempt(() => { throw new Error("saldo insuficiente") })', output: '["saldo insuficiente", null]' },
  ],
  constraints: [],
  starter: starter(
    'function attempt(fn)',
    'function attempt<T>(fn: () => T): [string, null] | [null, T]',
    '/**\n * @param {() => any} fn\n * @return {[string | null, any]}\n */',
  ),
  tests: [
    { input: ['ok'], expected: [null, 42], label: 'ok: retorna 42' },
    { input: ['objeto'], expected: [null, { id: 1 }], label: 'objeto: retorna { id: 1 }' },
    { input: ['zero'], expected: [null, 0], label: 'zero: retorna 0' },
    { input: ['erro'], expected: ['saldo insuficiente', null], label: 'erro: lança Error' },
    { input: ['string'], expected: ['falhou', null], label: 'string: lança "falhou"' },
    { input: ['typeError'], expected: ['mensagem do TypeError', null], label: 'typeError: lê propriedade de null' },
  ],
  hints: ['`try { return [null, fn()]; } catch (e) { ... }`.', 'No catch: `e instanceof Error ? e.message : String(e)`.'],
  explanation: {
    intuition: 'O `try/catch` fica **dentro** de `attempt`, uma vez só. Quem usa recebe um par e decide com um `if`, sem precisar de `try` próprio: `const [erro, dados] = attempt(() => JSON.parse(texto)); if (erro) ...`.',
    steps: ['No `try`, chame `fn()` e retorne `[null, resultado]`.', 'No `catch`, monte a mensagem e retorne `[mensagem, null]`.'],
    time: 'O(1) + custo de fn',
    space: 'O(1)',
    complexityWhy: 'Só encapsula a chamada.',
    pitfalls: ['Acessar `e.message` quando o lançado é uma string: dá `undefined`.', 'Chamar `fn` fora do `try`.'],
  },
  solution: {
    js: `function attempt(fn) {
  try {
    return [null, fn()];
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return [message, null];
  }
}
`,
    ts: `function attempt<T>(fn: () => T): [string, null] | [null, T] {
  try {
    return [null, fn()];
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return [message, null];
  }
}
`,
  },
}

/* ======================= Recursão ======================= */

export const sumNested: Problem = {
  id: 'js-sum-nested',
  title: 'Soma de arrays aninhados',
  difficulty: 'Fácil',
  pattern: 'recursao',
  fnName: 'sumNested',
  params: ['list'],
  description: `
Escreva \`sumNested(list)\` que soma todos os números de um array que pode conter **arrays dentro de arrays**, em qualquer profundidade.
`,
  examples: [
    { input: 'sumNested([1, [2, [3, [4]]], 5])', output: '15' },
    { input: 'sumNested([[[]]])', output: '0' },
  ],
  constraints: ['Os itens são números ou arrays'],
  starter: starter('function sumNested(list)', 'type Nested = number | Nested[];\n\nfunction sumNested(list: Nested[]): number', '/**\n * @param {any[]} list\n * @return {number}\n */'),
  tests: [
    { input: [[1, [2, [3, [4]]], 5]], expected: 15, label: 'Exemplo 1' },
    { input: [[[[]]]], expected: 0, label: 'Só arrays vazios' },
    { input: [[]], expected: 0, label: 'Vazio' },
    { input: [[1, 2, 3]], expected: 6, label: 'Sem aninhamento' },
    { input: [[[1, [1, [1, [1, [1, [1]]]]]], 10]], expected: 16, label: 'Bem fundo' },
  ],
  hints: ['Percorra os itens. Se o item for número, some. Se for array (`Array.isArray`), some `sumNested(item)`.', 'O caso base está implícito: um array vazio não entra no loop e retorna 0.'],
  explanation: {
    intuition: 'Você não sabe quantos níveis existem, mas sabe tratar **um** nível: números você soma; arrays são "o mesmo problema, menor", então delega para a própria função.',
    steps: ['`let total = 0`.', 'Para cada item: array → `total += sumNested(item)`; número → `total += item`.', 'Retorne `total`.'],
    time: 'O(n)',
    space: 'O(d)',
    complexityWhy: 'n = total de itens em todos os níveis; a pilha cresce até a profundidade d.',
    pitfalls: ['`typeof item === "object"` também é verdade para `null`; prefira `Array.isArray`.', 'Esquecer de somar o retorno da chamada recursiva (chamar sem usar o resultado).'],
  },
  solution: {
    js: `function sumNested(list) {
  let total = 0;
  for (const item of list) {
    if (Array.isArray(item)) total += sumNested(item);
    else total += item;
  }
  return total;
}
`,
    ts: `type Nested = number | Nested[];

function sumNested(list: Nested[]): number {
  let total = 0;
  for (const item of list) {
    if (Array.isArray(item)) total += sumNested(item);
    else total += item;
  }
  return total;
}
`,
  },
}

export const flatten: Problem = {
  id: 'js-flatten',
  title: 'Achatar sem .flat()',
  difficulty: 'Médio',
  pattern: 'recursao',
  fnName: 'flatten',
  params: ['list'],
  io: {
    harness: `(flatten, list) => {
  const original = Array.prototype.flat;
  Array.prototype.flat = function () {
    throw new Error('Neste exercício não vale usar .flat(): faça com recursão.');
  };
  try {
    return flatten(list);
  } finally {
    Array.prototype.flat = original;
  }
}`,
  },
  description: `
Escreva \`flatten(list)\` que transforma um array aninhado (em qualquer profundidade) num array **plano**, mantendo a ordem.

**Regra:** não vale usar \`.flat()\` (o teste bloqueia).
`,
  examples: [
    { input: 'flatten([1, [2, [3, [4]], 5]])', output: '[1, 2, 3, 4, 5]' },
    { input: 'flatten([["a"], [], [["b"]]])', output: '["a", "b"]' },
  ],
  constraints: [],
  starter: starter('function flatten(list)', 'function flatten(list: unknown[]): unknown[]', '/**\n * @param {any[]} list\n * @return {any[]}\n */'),
  tests: [
    { input: [[1, [2, [3, [4]], 5]]], expected: [1, 2, 3, 4, 5], label: 'Exemplo 1' },
    { input: [[['a'], [], [['b']]]], expected: ['a', 'b'], label: 'Strings e vazios' },
    { input: [[]], expected: [], label: 'Vazio' },
    { input: [[1, 2]], expected: [1, 2], label: 'Já plano' },
    { input: [[[[[[[7]]]]]]], expected: [7], label: 'Muito fundo' },
    { input: [[{ a: 1 }, [null, [0]]]], expected: [{ a: 1 }, null, 0], label: 'Objetos e null' },
  ],
  hints: [
    'Crie `const result = []` e percorra a lista.',
    'Se o item for array, `result.push(...flatten(item))`; senão, `result.push(item)`.',
    'Alternativa sem criar arrays intermediários: uma função auxiliar `visit(arr)` que empurra num único `result` de fora.',
  ],
  explanation: {
    intuition: 'Igual à soma aninhada, mas em vez de somar você **coleta**. Cada chamada achata o seu pedaço e devolve; quem chamou junta no resultado com spread.',
    steps: ['`result = []`.', 'Item array → `result.push(...flatten(item))`.', 'Senão → `result.push(item)`.', 'Retorne `result`.'],
    time: 'O(n·d)',
    space: 'O(n)',
    complexityWhy: 'Com spread, cada item pode ser copiado uma vez por nível (d). A versão com função auxiliar e um único array é O(n).',
    pitfalls: ['Esquecer o spread: `result.push(flatten(item))` empurra o array inteiro e não achata nada.', 'Usar `concat` sem guardar o retorno (concat não altera o original).'],
  },
  solution: {
    js: `function flatten(list) {
  const result = [];
  const visit = (arr) => {
    for (const item of arr) {
      if (Array.isArray(item)) visit(item);
      else result.push(item);
    }
  };
  visit(list);
  return result;
}
`,
    ts: `function flatten(list: unknown[]): unknown[] {
  const result: unknown[] = [];
  const visit = (arr: unknown[]) => {
    for (const item of arr) {
      if (Array.isArray(item)) visit(item);
      else result.push(item);
    }
  };
  visit(list);
  return result;
}
`,
  },
}

export const folderSize: Problem = {
  id: 'js-folder-size',
  title: 'Tamanho de uma pasta',
  difficulty: 'Médio',
  pattern: 'recursao',
  fnName: 'folderSize',
  params: ['node'],
  description: `
Um explorador de arquivos representa pastas e arquivos assim:

- arquivo: \`{ name: "foto.png", size: 300 }\`
- pasta: \`{ name: "fotos", children: [ ...arquivos e pastas... ] }\`

Escreva \`folderSize(node)\` que retorna o **tamanho total** (soma dos \`size\` de todos os arquivos dentro, em qualquer nível). Para um arquivo, é o próprio \`size\`. Uma pasta vazia tem tamanho 0.
`,
  examples: [
    {
      input: 'folderSize({ name: "docs", children: [{ name: "a.txt", size: 10 }, { name: "img", children: [{ name: "b.png", size: 90 }] }] })',
      output: '100',
    },
  ],
  constraints: ['Um nó tem `size` (arquivo) ou `children` (pasta)'],
  starter: starter(
    'function folderSize(node)',
    'interface FsNode {\n  name: string;\n  size?: number;\n  children?: FsNode[];\n}\n\nfunction folderSize(node: FsNode): number',
    '/**\n * @param {{ name: string, size?: number, children?: any[] }} node\n * @return {number}\n */',
  ),
  tests: [
    {
      input: [{ name: 'docs', children: [{ name: 'a.txt', size: 10 }, { name: 'img', children: [{ name: 'b.png', size: 90 }] }] }],
      expected: 100,
      label: 'Exemplo 1',
    },
    { input: [{ name: 'foto.png', size: 300 }], expected: 300, label: 'Um arquivo só' },
    { input: [{ name: 'vazia', children: [] }], expected: 0, label: 'Pasta vazia' },
    {
      input: [
        {
          name: 'projeto',
          children: [
            { name: 'src', children: [{ name: 'app.ts', size: 40 }, { name: 'lib', children: [{ name: 'util.ts', size: 15 }, { name: 'vazia', children: [] }] }] },
            { name: 'README.md', size: 5 },
            { name: 'node_modules', children: [{ name: 'react', children: [{ name: 'index.js', size: 940 }] }] },
          ],
        },
      ],
      expected: 1000,
      label: 'Projeto com vários níveis',
    },
  ],
  hints: [
    'Caso base: se o nó **não** tem `children`, é um arquivo: retorne `node.size`.',
    'Caso recursivo: some `folderSize(filho)` para cada filho.',
  ],
  explanation: {
    intuition: 'Uma pasta é uma árvore: o tamanho dela é a soma do tamanho dos filhos, e cada filho que é pasta resolve o próprio tamanho do mesmo jeito. É o mesmo raciocínio do DFS em árvores do LeetCode.',
    steps: ['Se `!node.children`, retorne `node.size`.', 'Some `folderSize(child)` de cada filho.', 'Retorne a soma.'],
    time: 'O(n)',
    space: 'O(h)',
    complexityWhy: 'Cada nó é visitado uma vez; a pilha cresce até a altura h da árvore.',
    pitfalls: ['Somar `node.size` de pastas (é `undefined` → `NaN`).', 'Achar que pasta vazia não tem `children` (tem, só que vazio).'],
  },
  solution: {
    js: `function folderSize(node) {
  if (!node.children) return node.size;
  let total = 0;
  for (const child of node.children) {
    total += folderSize(child);
  }
  return total;
}
`,
    ts: `interface FsNode {
  name: string;
  size?: number;
  children?: FsNode[];
}

function folderSize(node: FsNode): number {
  if (!node.children) return node.size ?? 0;
  let total = 0;
  for (const child of node.children) {
    total += folderSize(child);
  }
  return total;
}
`,
  },
}

export const EXTRA_PROBLEMS: Problem[] = [
  minMax,
  removeAt,
  chunk,
  pick,
  invertObject,
  cartTotal,
  bankAccount,
  stackClass,
  todoList,
  safeParse,
  validateUser,
  attempt,
  sumNested,
  flatten,
  folderSize,
]
