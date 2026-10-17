import type { Problem } from '../../types'

export const binarySearch: Problem = {
  id: 'binary-search',
  title: 'Binary Search',
  difficulty: 'Fácil',
  pattern: 'binary-search',
  leetcode: { number: 704, slug: 'binary-search' },
  fnName: 'search',
  params: ['nums', 'target'],
  description: `
Dado um array de inteiros \`nums\` **ordenado em ordem crescente** (sem repetidos) e um inteiro \`target\`, retorne o **índice** de \`target\` em \`nums\`, ou \`-1\` se ele não existir.

Seu algoritmo precisa ser **O(log n)**.
`,
  examples: [
    { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4' },
    { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1' },
  ],
  constraints: ['1 <= nums.length <= 10^4', 'Todos os valores são distintos', 'nums está ordenado'],
  starter: {
    js: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function search(nums, target) {

}
`,
    ts: `function search(nums: number[], target: number): number {

}
`,
  },
  tests: [
    { input: [[-1, 0, 3, 5, 9, 12], 9], expected: 4, label: 'Exemplo 1' },
    { input: [[-1, 0, 3, 5, 9, 12], 2], expected: -1, label: 'Exemplo 2 (não existe)' },
    { input: [[5], 5], expected: 0, label: 'Um elemento (achou)' },
    { input: [[5], -5], expected: -1, label: 'Um elemento (não achou)' },
    { input: [[1, 3, 5, 7, 9, 11, 13], 1], expected: 0, label: 'Primeiro' },
    { input: [[1, 3, 5, 7, 9, 11, 13], 13], expected: 6, label: 'Último' },
    { input: [[1, 3, 5, 7, 9, 11, 13], 14], expected: -1, label: 'Maior que todos' },
  ],
  hints: [
    'Olhe o elemento do meio. Se ele for menor que o alvo, em qual metade o alvo pode estar?',
    'Mantenha `[lo, hi]` como o intervalo onde o alvo ainda pode estar. `mid = Math.floor((lo + hi) / 2)`.',
    'Se `nums[mid] < target`, `lo = mid + 1`; se maior, `hi = mid - 1`. Pare quando `lo > hi`.',
  ],
  explanation: {
    intuition: `
O array ordenado permite **descartar metade** a cada comparação. O intervalo \`[lo, hi]\` é tudo que ainda pode conter o alvo; o \`mid\` decide qual metade sobra.

Como o intervalo é **fechado** (inclui \`lo\` e \`hi\`), o loop roda enquanto \`lo <= hi\`, e ao descartar o \`mid\` usamos \`mid + 1\` / \`mid - 1\`.
`,
    steps: ['`lo = 0`, `hi = n - 1`.', 'Enquanto `lo <= hi`: `mid = Math.floor((lo + hi) / 2)`.', 'Igual → retorne `mid`. Menor → `lo = mid + 1`. Maior → `hi = mid - 1`.', 'Retorne `-1`.'],
    time: 'O(log n)',
    space: 'O(1)',
    complexityWhy: 'O intervalo cai pela metade a cada iteração: log₂(n) iterações.',
    pitfalls: ['`while (lo < hi)` com intervalo fechado: não testa o último candidato (`[5]`, alvo 5).', '`lo = mid` em vez de `mid + 1`: loop infinito.', '`(lo + hi) / 2` sem `Math.floor` dá índice quebrado (2.5).'],
  },
  bruteForce: { idea: 'Percorrer o array (indexOf).', complexity: 'O(n): não atende o O(log n) pedido' },
  solution: {
    js: `function search(nums, target) {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}
`,
    ts: `function search(nums: number[], target: number): number {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}
`,
  },
}

export const search2DMatrix: Problem = {
  id: 'search-2d-matrix',
  title: 'Search a 2D Matrix',
  difficulty: 'Médio',
  pattern: 'binary-search',
  leetcode: { number: 74, slug: 'search-a-2d-matrix' },
  fnName: 'searchMatrix',
  params: ['matrix', 'target'],
  description: `
Você recebe uma matriz \`m x n\` de inteiros com duas propriedades:

- cada linha está ordenada em ordem crescente;
- o primeiro número de cada linha é **maior** que o último da linha anterior.

Retorne \`true\` se \`target\` estiver na matriz. Resolva em **O(log(m · n))**.
`,
  examples: [
    { input: 'matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3', output: 'true' },
    { input: 'matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 13', output: 'false' },
  ],
  constraints: ['1 <= m, n <= 100', '-10^4 <= matrix[i][j], target <= 10^4'],
  starter: {
    js: `/**
 * @param {number[][]} matrix
 * @param {number} target
 * @return {boolean}
 */
function searchMatrix(matrix, target) {

}
`,
    ts: `function searchMatrix(matrix: number[][], target: number): boolean {

}
`,
  },
  tests: [
    { input: [[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 3], expected: true, label: 'Exemplo 1' },
    { input: [[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 13], expected: false, label: 'Exemplo 2' },
    { input: [[[1]], 1], expected: true, label: '1x1' },
    { input: [[[1, 3]], 3], expected: true, label: 'Uma linha' },
    { input: [[[1], [3], [5]], 4], expected: false, label: 'Uma coluna' },
    { input: [[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 60], expected: true, label: 'Último elemento' },
    { input: [[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 0], expected: false, label: 'Menor que todos' },
  ],
  hints: [
    'Se você "achatar" a matriz linha por linha, o que obtém?',
    'Um array ordenado de tamanho `m * n`! Faça binary search de 0 a `m * n - 1`.',
    'Para converter o índice achatado `mid` em linha/coluna: `row = Math.floor(mid / n)`, `col = mid % n`.',
  ],
  explanation: {
    intuition: `
As duas propriedades juntas dizem que, lendo a matriz linha por linha, os números estão **todos em ordem**. Então ela é um array ordenado disfarçado.

Fazemos binary search nos índices \`0..m·n-1\` e convertemos cada \`mid\` para coordenadas:
- \`row = Math.floor(mid / n)\`
- \`col = mid % n\`
`,
    steps: ['`m = matrix.length`, `n = matrix[0].length`, `lo = 0`, `hi = m * n - 1`.', 'Enquanto `lo <= hi`: `mid`, `row`, `col`, `value = matrix[row][col]`.', 'Compare com o alvo como no binary search normal.'],
    time: 'O(log(m · n))',
    space: 'O(1)',
    complexityWhy: 'Binary search sobre m·n posições virtuais, sem copiar a matriz.',
    pitfalls: ['Usar `matrix.flat()`: funciona, mas copia tudo (O(m·n) tempo e memória).', 'Dividir por `m` em vez de `n` (número de colunas) na conversão.'],
  },
  solution: {
    js: `function searchMatrix(matrix, target) {
  const m = matrix.length;
  const n = matrix[0].length;
  let lo = 0;
  let hi = m * n - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const row = Math.floor(mid / n);
    const col = mid % n;
    const value = matrix[row][col];
    if (value === target) return true;
    if (value < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return false;
}
`,
    ts: `function searchMatrix(matrix: number[][], target: number): boolean {
  const m = matrix.length;
  const n = matrix[0].length;
  let lo = 0;
  let hi = m * n - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const row = Math.floor(mid / n);
    const col = mid % n;
    const value = matrix[row][col];
    if (value === target) return true;
    if (value < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return false;
}
`,
  },
}

export const kokoBananas: Problem = {
  id: 'koko-bananas',
  title: 'Koko Eating Bananas',
  difficulty: 'Médio',
  pattern: 'binary-search',
  leetcode: { number: 875, slug: 'koko-eating-bananas' },
  fnName: 'minEatingSpeed',
  params: ['piles', 'h'],
  description: `
Koko tem \`n\` pilhas de bananas (\`piles[i]\` bananas na pilha \`i\`) e os guardas voltam em \`h\` horas.

Ela escolhe uma velocidade \`k\` (bananas por hora). A cada hora, escolhe uma pilha e come \`k\` bananas dela; se a pilha tiver menos que \`k\`, come tudo e **não come mais nada naquela hora**.

Retorne o **menor \`k\` inteiro** que permite comer todas as bananas em até \`h\` horas.
`,
  examples: [
    { input: 'piles = [3,6,7,11], h = 8', output: '4', explanation: 'Com k=4: 1 + 2 + 2 + 3 = 8 horas.' },
    { input: 'piles = [30,11,23,4,20], h = 5', output: '30' },
    { input: 'piles = [30,11,23,4,20], h = 6', output: '23' },
  ],
  constraints: ['1 <= piles.length <= 10^4', 'piles.length <= h <= 10^9', '1 <= piles[i] <= 10^9'],
  starter: {
    js: `/**
 * @param {number[]} piles
 * @param {number} h
 * @return {number}
 */
function minEatingSpeed(piles, h) {

}
`,
    ts: `function minEatingSpeed(piles: number[], h: number): number {

}
`,
  },
  tests: [
    { input: [[3, 6, 7, 11], 8], expected: 4, label: 'Exemplo 1' },
    { input: [[30, 11, 23, 4, 20], 5], expected: 30, label: 'Exemplo 2 (h = número de pilhas)' },
    { input: [[30, 11, 23, 4, 20], 6], expected: 23, label: 'Exemplo 3' },
    { input: [[1], 1], expected: 1, label: 'Mínimo' },
    { input: [[312884470], 312884469], expected: 2, label: 'Pilha gigante' },
    { input: [[1000000000], 2], expected: 500000000, label: '10^9 bananas' },
  ],
  hints: [
    'Se uma velocidade `k` funciona, uma velocidade `k + 1` também funciona? E isso ajuda como?',
    'A resposta está entre 1 e `max(piles)`. A função "dá tempo com k?" é monotônica: binary search **na resposta**.',
    'Horas com velocidade k: soma de `Math.ceil(pile / k)`. Se `<= h`, tente menor (`hi = mid`); senão, `lo = mid + 1`.',
  ],
  explanation: {
    intuition: `
Aqui não buscamos dentro do array: buscamos **a resposta**.

- Com \`k = max(piles)\`, cada pilha leva 1 hora: sempre dá (pois \`h >= n\`).
- Se \`k\` funciona, qualquer valor maior também funciona. Se não funciona, qualquer menor também não.

Essa **monotonicidade** cria uma linha \`✗ ✗ ✗ ✓ ✓ ✓\` sobre os valores de k, e o binary search acha o **primeiro ✓**.
`,
    steps: [
      '`lo = 1`, `hi = Math.max(...piles)`.',
      'Enquanto `lo < hi`: `mid`; calcule `hours = Σ Math.ceil(p / mid)`.',
      'Se `hours <= h`, `hi = mid` (mid serve, tenta menor). Senão `lo = mid + 1`.',
      'Retorne `lo`.',
    ],
    time: 'O(n · log(max))',
    space: 'O(1)',
    complexityWhy: 'log₂(10^9) ≈ 30 iterações, cada uma somando as n pilhas.',
    pitfalls: [
      'Testar k de 1 em 1 (busca linear): com pilhas de 10^9 bananas é lento demais.',
      'Usar `Math.floor` nas horas: uma pilha de 7 com k=4 leva **2** horas, não 1.',
      '`Math.max(...piles)` com arrays enormes pode estourar a pilha de chamadas; com 10^4 itens é seguro.',
    ],
  },
  bruteForce: { idea: 'Testar k = 1, 2, 3, ... até funcionar.', complexity: 'O(n · max(piles))' },
  solution: {
    js: `function minEatingSpeed(piles, h) {
  let lo = 1;
  let hi = Math.max(...piles);
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    let hours = 0;
    for (const p of piles) hours += Math.ceil(p / mid);
    if (hours <= h) hi = mid; // mid serve: tenta menor
    else lo = mid + 1; // não deu tempo: precisa de mais velocidade
  }
  return lo;
}
`,
    ts: `function minEatingSpeed(piles: number[], h: number): number {
  let lo = 1;
  let hi = Math.max(...piles);
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    let hours = 0;
    for (const p of piles) hours += Math.ceil(p / mid);
    if (hours <= h) hi = mid; // mid serve: tenta menor
    else lo = mid + 1; // não deu tempo: precisa de mais velocidade
  }
  return lo;
}
`,
  },
  perf: { gen: (n: number) => [Array.from({ length: n }, (_, i) => 1000000000 - i), n + 5], n: 10000, limitMs: 3000, label: '10.000 pilhas de ~10^9' },
}
