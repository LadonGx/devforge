import type { Problem } from '../../types'

const HEAP_DOC = `MinHeap e MaxHeap já estão disponíveis (como a PriorityQueue do LeetCode):
 *   const h = new MinHeap();            // ou new MinHeap(x => x.dist) para ordenar por uma chave
 *   h.push(x); h.pop(); h.peek(); h.size(); h.isEmpty();`

export const kthLargestStream: Problem = {
  id: 'kth-largest-stream',
  title: 'Kth Largest Element in a Stream',
  difficulty: 'Fácil',
  pattern: 'heap',
  leetcode: { number: 703, slug: 'kth-largest-element-in-a-stream' },
  fnName: 'KthLargest',
  params: ['operações', 'argumentos'],
  io: { design: true },
  description: `
Projete uma classe que encontra o **k-ésimo maior** elemento de um fluxo de números (o k-ésimo na ordem decrescente, contando repetidos).

- \`new KthLargest(k, nums)\` inicia com o inteiro \`k\` e os números iniciais \`nums\`.
- \`add(val)\` adiciona \`val\` ao fluxo e **retorna o k-ésimo maior** até agora.

Este é um problema de **design**: cada teste é uma sequência de operações. A tabela do teste mostra cada chamada com o retorno esperado.
`,
  examples: [
    {
      input: '["KthLargest","add","add","add","add","add"]\n[[3,[4,5,8,2]],[3],[5],[10],[9],[4]]',
      output: '[null,4,5,5,8,8]',
      explanation: 'k = 3. Depois de add(3): [2,3,4,5,8] → 3º maior = 4.',
    },
  ],
  constraints: ['1 <= k <= 10^4', 'Sempre haverá pelo menos k elementos ao chamar add', 'Até 10^4 chamadas de add'],
  starter: {
    js: `/*
 * ${HEAP_DOC}
 */
class KthLargest {
  /**
   * @param {number} k
   * @param {number[]} nums
   */
  constructor(k, nums) {

  }

  /**
   * @param {number} val
   * @return {number}
   */
  add(val) {

  }
}
`,
    ts: `/*
 * ${HEAP_DOC}
 */
class KthLargest {
  constructor(k: number, nums: number[]) {

  }

  add(val: number): number {

  }
}
`,
  },
  tests: [
    {
      input: [['KthLargest', 'add', 'add', 'add', 'add', 'add'], [[3, [4, 5, 8, 2]], [3], [5], [10], [9], [4]]],
      expected: [null, 4, 5, 5, 8, 8],
      label: 'Exemplo 1',
    },
    {
      input: [['KthLargest', 'add', 'add', 'add', 'add'], [[4, [7, 7, 7, 7, 8, 3]], [2], [10], [9], [9]]],
      expected: [null, 7, 7, 7, 8],
      label: 'Repetidos',
    },
    { input: [['KthLargest', 'add', 'add'], [[1, []], [-3], [-2]]], expected: [null, -3, -2], label: 'k = 1, começa vazio' },
    { input: [['KthLargest', 'add', 'add', 'add'], [[2, [0]], [-1], [1], [-2]]], expected: [null, -1, 0, 0], label: 'Negativos' },
  ],
  hints: [
    'Ordenar tudo a cada `add` funciona, mas custa O(n log n) por chamada. Você precisa mesmo guardar **todos** os números?',
    'Só importam os **k maiores**. Entre eles, qual é a resposta? O **menor** dos k maiores.',
    'Mantenha um **MinHeap de tamanho k**: ao adicionar, faça push; se passar de k, pop (remove o menor). O topo (`peek`) é a resposta.',
  ],
  explanation: {
    intuition: `
Guardamos só os **k maiores** vistos até agora, num **MinHeap**. O topo do MinHeap é o menor deles, ou seja, exatamente o **k-ésimo maior**.

Quando chega um número novo: entra no heap; se o heap passou de k elementos, o menor sai (ele não é mais um dos k maiores). Abra o visualizador para ver o heap como árvore (o topo é a raiz).
`,
    steps: [
      'No construtor: guarde `k`, crie `this.heap = new MinHeap()` e chame `add` para cada número inicial.',
      'Em `add(val)`: `heap.push(val)`; se `heap.size() > k`, `heap.pop()`.',
      'Retorne `heap.peek()`.',
    ],
    time: 'O(log k) por add',
    space: 'O(k)',
    complexityWhy: 'push e pop num heap de tamanho k custam O(log k).',
    pitfalls: ['Usar MaxHeap: o topo seria o maior de todos, não o k-ésimo.', 'Esquecer de limitar o tamanho a k.', 'No JS puro do LeetCode não existe heap nativo: muitas entrevistas pedem para implementar (veja a aula).'],
  },
  solution: {
    js: `class KthLargest {
  constructor(k, nums) {
    this.k = k;
    this.heap = new MinHeap();
    for (const n of nums) this.add(n);
  }

  add(val) {
    this.heap.push(val);
    if (this.heap.size() > this.k) this.heap.pop();
    return this.heap.peek();
  }
}
`,
    ts: `class KthLargest {
  k: number;
  heap: MinHeap;

  constructor(k: number, nums: number[]) {
    this.k = k;
    this.heap = new MinHeap();
    for (const n of nums) this.add(n);
  }

  add(val: number): number {
    this.heap.push(val);
    if (this.heap.size() > this.k) this.heap.pop();
    return this.heap.peek();
  }
}
`,
  },
}

export const lastStoneWeight: Problem = {
  id: 'last-stone-weight',
  title: 'Last Stone Weight',
  difficulty: 'Fácil',
  pattern: 'heap',
  leetcode: { number: 1046, slug: 'last-stone-weight' },
  fnName: 'lastStoneWeight',
  params: ['stones'],
  description: `
Você tem pedras com pesos \`stones[i]\`. A cada rodada, pegue as **duas mais pesadas** \`x <= y\` e bata uma na outra:

- se \`x === y\`, as duas são destruídas;
- se não, \`x\` é destruída e \`y\` vira \`y - x\`.

No fim sobra no máximo uma pedra. Retorne o peso dela (ou \`0\` se não sobrar nenhuma).
`,
  examples: [
    { input: 'stones = [2,7,4,1,8,1]', output: '1', explanation: '8 e 7 → 1; 4 e 2 → 2; 2 e 1 → 1; 1 e 1 → 0; sobra 1.' },
    { input: 'stones = [1]', output: '1' },
  ],
  constraints: ['1 <= stones.length <= 30', '1 <= stones[i] <= 1000'],
  starter: {
    js: `/*
 * ${HEAP_DOC}
 */
/**
 * @param {number[]} stones
 * @return {number}
 */
function lastStoneWeight(stones) {

}
`,
    ts: `/*
 * ${HEAP_DOC}
 */
function lastStoneWeight(stones: number[]): number {

}
`,
  },
  tests: [
    { input: [[2, 7, 4, 1, 8, 1]], expected: 1, label: 'Exemplo 1' },
    { input: [[1]], expected: 1, label: 'Uma pedra' },
    { input: [[2, 2]], expected: 0, label: 'Iguais se anulam' },
    { input: [[10, 4, 2, 10]], expected: 2, label: 'Repetidas' },
    { input: [[3, 7, 2]], expected: 2, label: 'Três pedras' },
  ],
  hints: [
    'A cada rodada você precisa das **duas maiores**. Ordenar de novo toda rodada custa caro.',
    'Uma estrutura que entrega o maior em O(log n) e aceita inserções: **MaxHeap**.',
    'Coloque todas no MaxHeap. Enquanto houver 2+: `y = pop()`, `x = pop()`; se diferentes, `push(y - x)`. No fim, `peek() ?? 0`.',
  ],
  explanation: {
    intuition: `
"Sempre pegar o **maior**" e "ir colocando coisas novas" é o caso de uso perfeito de um **heap de máximo**. Cada rodada faz 2 pops e no máximo 1 push.
`,
    steps: ['`heap = new MaxHeap()` e push de todas as pedras.', 'Enquanto `heap.size() > 1`: `y = heap.pop()`, `x = heap.pop()`.', 'Se `y !== x`, `heap.push(y - x)`.', 'Retorne `heap.size() ? heap.peek() : 0`.'],
    time: 'O(n log n)',
    space: 'O(n)',
    complexityWhy: 'Até n rodadas, cada uma com operações O(log n) no heap.',
    pitfalls: ['Retornar `undefined` quando o heap esvazia: o pedido é 0.', 'Ordenar o array a cada rodada: O(n² log n).'],
  },
  solution: {
    js: `function lastStoneWeight(stones) {
  const heap = new MaxHeap();
  for (const s of stones) heap.push(s);
  while (heap.size() > 1) {
    const y = heap.pop();
    const x = heap.pop();
    if (y !== x) heap.push(y - x);
  }
  return heap.size() ? heap.peek() : 0;
}
`,
    ts: `function lastStoneWeight(stones: number[]): number {
  const heap = new MaxHeap();
  for (const s of stones) heap.push(s);
  while (heap.size() > 1) {
    const y = heap.pop() as number;
    const x = heap.pop() as number;
    if (y !== x) heap.push(y - x);
  }
  return heap.size() ? (heap.peek() as number) : 0;
}
`,
  },
}

export const kClosest: Problem = {
  id: 'k-closest-points',
  title: 'K Closest Points to Origin',
  difficulty: 'Médio',
  pattern: 'heap',
  leetcode: { number: 973, slug: 'k-closest-points-to-origin' },
  fnName: 'kClosest',
  params: ['points', 'k'],
  compare: 'unordered',
  description: `
Dado um array \`points\` onde \`points[i] = [x, y]\` e um inteiro \`k\`, retorne os **k pontos mais próximos da origem** \`(0, 0)\`.

A distância é a euclidiana, \`√(x² + y²)\`. A resposta pode vir em qualquer ordem (e é única).
`,
  examples: [
    { input: 'points = [[1,3],[-2,2]], k = 1', output: '[[-2,2]]', explanation: 'Distância² de (1,3) = 10; de (-2,2) = 8.' },
    { input: 'points = [[3,3],[5,-1],[-2,4]], k = 2', output: '[[3,3],[-2,4]]' },
  ],
  constraints: ['1 <= k <= points.length <= 10^4', '-10^4 <= x, y <= 10^4'],
  starter: {
    js: `/*
 * ${HEAP_DOC}
 */
/**
 * @param {number[][]} points
 * @param {number} k
 * @return {number[][]}
 */
function kClosest(points, k) {

}
`,
    ts: `/*
 * ${HEAP_DOC}
 */
function kClosest(points: number[][], k: number): number[][] {

}
`,
  },
  tests: [
    { input: [[[1, 3], [-2, 2]], 1], expected: [[-2, 2]], label: 'Exemplo 1' },
    { input: [[[3, 3], [5, -1], [-2, 4]], 2], expected: [[3, 3], [-2, 4]], label: 'Exemplo 2' },
    { input: [[[0, 1], [1, 0]], 2], expected: [[0, 1], [1, 0]], label: 'k = n' },
    { input: [[[1, 1], [10, 10], [-1, -1], [2, 2]], 3], expected: [[1, 1], [-1, -1], [2, 2]], label: 'Simétricos' },
  ],
  hints: [
    'Para comparar distâncias, você não precisa da raiz quadrada: compare `x² + y²`.',
    'Ordenar todos por distância e pegar k resolve em O(n log n). Com heap dá O(n log k).',
    'MaxHeap por distância, de tamanho k: `new MaxHeap(p => p[0]**2 + p[1]**2)`. Push de cada ponto; se passar de k, pop (sai o mais longe). Sobram os k mais próximos.',
  ],
  explanation: {
    intuition: `
Mesmo truque do "k-ésimo maior", invertido: queremos os k **menores** (distâncias), então guardamos um **MaxHeap de tamanho k**. O topo é o **pior** dos k melhores; quando chega alguém mais perto, o topo sai.

Não use \`Math.sqrt\`: \`x² + y²\` preserva a ordem e evita números quebrados.
`,
    steps: ['`heap = new MaxHeap(p => p[0] * p[0] + p[1] * p[1])`.', 'Para cada ponto: `heap.push(p)`; se `heap.size() > k`, `heap.pop()`.', 'Retorne o conteúdo do heap (pop até esvaziar).'],
    time: 'O(n log k)',
    space: 'O(k)',
    complexityWhy: 'n inserções num heap limitado a k elementos.',
    pitfalls: ['MinHeap com todos os pontos e k pops também funciona, mas é O(n log n) de memória/tempo.', 'Comparar arrays `[x, y]` diretamente com `<`.'],
  },
  bruteForce: { idea: 'Ordenar por distância e pegar os k primeiros.', complexity: 'O(n log n)' },
  solution: {
    js: `function kClosest(points, k) {
  const dist = (p) => p[0] * p[0] + p[1] * p[1];
  const heap = new MaxHeap(dist); // topo = mais distante entre os k
  for (const p of points) {
    heap.push(p);
    if (heap.size() > k) heap.pop();
  }
  const res = [];
  while (heap.size()) res.push(heap.pop());
  return res;
}
`,
    ts: `function kClosest(points: number[][], k: number): number[][] {
  const dist = (p: number[]) => p[0] * p[0] + p[1] * p[1];
  const heap = new MaxHeap(dist); // topo = mais distante entre os k
  for (const p of points) {
    heap.push(p);
    if (heap.size() > k) heap.pop();
  }
  const res: number[][] = [];
  while (heap.size()) res.push(heap.pop() as number[]);
  return res;
}
`,
  },
  perf: {
    gen: (n: number) => [Array.from({ length: n }, (_, i) => [((i * 7919) % 20001) - 10000, ((i * 104729) % 20001) - 10000]), 50],
    n: 10000,
    limitMs: 2500,
    label: '10.000 pontos, k = 50',
  },
}
