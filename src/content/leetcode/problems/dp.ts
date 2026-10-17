import type { Problem } from '../../types'

export const climbingStairs: Problem = {
  id: 'climbing-stairs',
  title: 'Climbing Stairs',
  difficulty: 'Fácil',
  pattern: 'dp-1d',
  leetcode: { number: 70, slug: 'climbing-stairs' },
  fnName: 'climbStairs',
  params: ['n'],
  description: `
Você está subindo uma escada de \`n\` degraus. A cada passo pode subir **1 ou 2** degraus.

De **quantas formas distintas** você pode chegar ao topo?
`,
  examples: [
    { input: 'n = 2', output: '2', explanation: '1+1 ou 2.' },
    { input: 'n = 3', output: '3', explanation: '1+1+1, 1+2 ou 2+1.' },
  ],
  constraints: ['1 <= n <= 45'],
  starter: {
    js: `/**
 * @param {number} n
 * @return {number}
 */
function climbStairs(n) {

}
`,
    ts: `function climbStairs(n: number): number {

}
`,
  },
  tests: [
    { input: [2], expected: 2, label: 'Exemplo 1' },
    { input: [3], expected: 3, label: 'Exemplo 2' },
    { input: [1], expected: 1, label: 'Um degrau' },
    { input: [5], expected: 8, label: 'n = 5' },
    { input: [10], expected: 89, label: 'n = 10' },
    { input: [45], expected: 1836311903, label: 'n = 45 (recursão pura não aguenta)' },
  ],
  hints: [
    'Para chegar no degrau n, de onde você veio no último passo?',
    'Do degrau n-1 (passo de 1) ou do n-2 (passo de 2). Então `ways(n) = ways(n-1) + ways(n-2)`. Parece familiar? (Fibonacci)',
    'A recursão pura recalcula os mesmos valores milhões de vezes. Guarde os resultados (memo) ou construa de baixo para cima com duas variáveis.',
  ],
  explanation: {
    intuition: `
**Programação dinâmica** = recursão + **não recalcular**. A relação é \`ways(n) = ways(n-1) + ways(n-2)\`, mas a árvore de recursão explode (O(2ⁿ)): \`ways(3)\` é calculado várias vezes.

Duas formas de resolver:
- **Top-down (memo):** recursão guardando cada resposta num Map.
- **Bottom-up:** começa de \`ways(1) = 1\`, \`ways(2) = 2\` e vai subindo. Como só usamos os dois últimos valores, bastam duas variáveis.

Rode a referência no visualizador para ver as variáveis "andando" degrau a degrau.
`,
    steps: ['Se `n <= 2`, retorne `n`.', '`prev2 = 1` (ways(1)), `prev1 = 2` (ways(2)).', 'Para `i` de 3 a n: `cur = prev1 + prev2`; desloque: `prev2 = prev1`, `prev1 = cur`.', 'Retorne `prev1`.'],
    time: 'O(n)',
    space: 'O(1)',
    complexityWhy: 'Um loop até n guardando só os dois últimos resultados.',
    pitfalls: ['Recursão sem memo: O(2ⁿ), estoura o tempo com n = 45.', 'Errar os casos base (n = 1 → 1, n = 2 → 2).'],
  },
  bruteForce: { idea: 'Recursão pura ways(n-1) + ways(n-2).', complexity: 'O(2ⁿ)' },
  solution: {
    js: `function climbStairs(n) {
  if (n <= 2) return n;
  let prev2 = 1; // formas de chegar em i - 2
  let prev1 = 2; // formas de chegar em i - 1
  for (let i = 3; i <= n; i++) {
    const cur = prev1 + prev2;
    prev2 = prev1;
    prev1 = cur;
  }
  return prev1;
}
`,
    ts: `function climbStairs(n: number): number {
  if (n <= 2) return n;
  let prev2 = 1; // formas de chegar em i - 2
  let prev1 = 2; // formas de chegar em i - 1
  for (let i = 3; i <= n; i++) {
    const cur = prev1 + prev2;
    prev2 = prev1;
    prev1 = cur;
  }
  return prev1;
}
`,
  },
  perf: { gen: (n: number) => [n], n: 44, limitMs: 1500, label: 'n = 44' },
}

export const houseRobber: Problem = {
  id: 'house-robber',
  title: 'House Robber',
  difficulty: 'Médio',
  pattern: 'dp-1d',
  leetcode: { number: 198, slug: 'house-robber' },
  fnName: 'rob',
  params: ['nums'],
  description: `
Casas numa rua têm \`nums[i]\` de dinheiro. Você não pode roubar **duas casas vizinhas** (o alarme dispara).

Retorne o **máximo** que dá para roubar.
`,
  examples: [
    { input: 'nums = [1,2,3,1]', output: '4', explanation: 'Casas 0 e 2: 1 + 3.' },
    { input: 'nums = [2,7,9,3,1]', output: '12', explanation: 'Casas 0, 2 e 4: 2 + 9 + 1.' },
  ],
  constraints: ['1 <= nums.length <= 100', '0 <= nums[i] <= 400'],
  starter: {
    js: `/**
 * @param {number[]} nums
 * @return {number}
 */
function rob(nums) {

}
`,
    ts: `function rob(nums: number[]): number {

}
`,
  },
  tests: [
    { input: [[1, 2, 3, 1]], expected: 4, label: 'Exemplo 1' },
    { input: [[2, 7, 9, 3, 1]], expected: 12, label: 'Exemplo 2' },
    { input: [[5]], expected: 5, label: 'Uma casa' },
    { input: [[2, 1, 1, 2]], expected: 4, label: 'Pular duas casas seguidas' },
    { input: [[0, 0, 0]], expected: 0, label: 'Zeros' },
  ],
  hints: [
    'Gulosamente pegar as casas de índice par (ou ímpar) falha em `[2, 1, 1, 2]`. Pense em decisões.',
    'Na casa i: **roubar** (nums[i] + melhor até i-2) ou **pular** (melhor até i-1). `dp[i] = max(dp[i-1], dp[i-2] + nums[i])`.',
    'Como só precisa de dp[i-1] e dp[i-2], use duas variáveis.',
  ],
  explanation: {
    intuition: `
Em cada casa a decisão é binária, e o melhor resultado até a casa \`i\` depende só dos dois anteriores:

\`best(i) = max(best(i-1), best(i-2) + nums[i])\`

- \`best(i-1)\`: pulei a casa i.
- \`best(i-2) + nums[i]\`: roubei a casa i (então a i-1 ficou de fora).

Isso é o padrão de **DP 1-D**: definir o estado, a transição e os casos base.
`,
    steps: ['`prev2 = 0` (melhor até i-2), `prev1 = 0` (melhor até i-1).', 'Para cada `n` de `nums`: `cur = Math.max(prev1, prev2 + n)`.', 'Desloque: `prev2 = prev1`, `prev1 = cur`.', 'Retorne `prev1`.'],
    time: 'O(n)',
    space: 'O(1)',
    complexityWhy: 'Uma passada; o estado cabe em duas variáveis.',
    pitfalls: ['Alternar pares/ímpares (guloso): falha em `[2,1,1,2]` (resposta 4).', 'Começar `prev1 = nums[0]` e esquecer de tratar arrays de tamanho 1.'],
  },
  solution: {
    js: `function rob(nums) {
  let prev2 = 0; // melhor até a casa i - 2
  let prev1 = 0; // melhor até a casa i - 1
  for (const n of nums) {
    const cur = Math.max(prev1, prev2 + n); // pula ou rouba
    prev2 = prev1;
    prev1 = cur;
  }
  return prev1;
}
`,
    ts: `function rob(nums: number[]): number {
  let prev2 = 0; // melhor até a casa i - 2
  let prev1 = 0; // melhor até a casa i - 1
  for (const n of nums) {
    const cur = Math.max(prev1, prev2 + n); // pula ou rouba
    prev2 = prev1;
    prev1 = cur;
  }
  return prev1;
}
`,
  },
  perf: { gen: (n: number) => [Array.from({ length: n }, (_, i) => (i * 37) % 401)], n: 60, limitMs: 1500, label: '60 casas (recursão sem memo estoura)' },
}

export const coinChange: Problem = {
  id: 'coin-change',
  title: 'Coin Change',
  difficulty: 'Médio',
  pattern: 'dp-1d',
  leetcode: { number: 322, slug: 'coin-change' },
  fnName: 'coinChange',
  params: ['coins', 'amount'],
  description: `
Dadas moedas de valores \`coins\` (quantidade infinita de cada) e um valor \`amount\`, retorne o **menor número de moedas** que somam \`amount\`. Se for impossível, retorne \`-1\`.
`,
  examples: [
    { input: 'coins = [1,2,5], amount = 11', output: '3', explanation: '5 + 5 + 1.' },
    { input: 'coins = [2], amount = 3', output: '-1' },
    { input: 'coins = [1], amount = 0', output: '0' },
  ],
  constraints: ['1 <= coins.length <= 12', '1 <= coins[i] <= 2^31 - 1', '0 <= amount <= 10^4'],
  starter: {
    js: `/**
 * @param {number[]} coins
 * @param {number} amount
 * @return {number}
 */
function coinChange(coins, amount) {

}
`,
    ts: `function coinChange(coins: number[], amount: number): number {

}
`,
  },
  tests: [
    { input: [[1, 2, 5], 11], expected: 3, label: 'Exemplo 1' },
    { input: [[2], 3], expected: -1, label: 'Exemplo 2 (impossível)' },
    { input: [[1], 0], expected: 0, label: 'amount = 0' },
    { input: [[1, 3, 4], 6], expected: 2, label: 'Guloso falha (4+1+1 vs 3+3)' },
    { input: [[2, 5, 10, 1], 27], expected: 4, label: '27 = 10+10+5+2' },
  ],
  hints: [
    'Pegar sempre a maior moeda (guloso) falha: com `[1,3,4]` e 6, o guloso dá 4+1+1 (3 moedas), mas 3+3 usa 2.',
    'Se você soubesse o mínimo para todos os valores menores que `a`, como calcularia o de `a`?',
    '`dp[a] = 1 + min(dp[a - c])` para cada moeda `c <= a`. `dp[0] = 0` e o resto começa em `Infinity`.',
  ],
  explanation: {
    intuition: `
O estado é \`dp[a]\` = menor número de moedas para formar o valor \`a\`. Para formar \`a\`, a **última moeda** usada foi alguma \`c\`; antes dela formamos \`a - c\` da melhor forma possível:

\`dp[a] = min(dp[a - c] + 1)\` para cada moeda c

Construímos \`dp\` de 0 até \`amount\`. No visualizador, veja o array \`dp\` sendo preenchido da esquerda para a direita.
`,
    steps: [
      '`dp = new Array(amount + 1).fill(Infinity)`, `dp[0] = 0`.',
      'Para `a` de 1 a `amount`, para cada moeda `c`: se `c <= a`, `dp[a] = Math.min(dp[a], dp[a - c] + 1)`.',
      'Retorne `dp[amount] === Infinity ? -1 : dp[amount]`.',
    ],
    time: 'O(amount · moedas)',
    space: 'O(amount)',
    complexityWhy: 'Para cada valor até amount testamos todas as moedas.',
    pitfalls: ['Solução gulosa (maior moeda primeiro).', 'Esquecer `dp[0] = 0`.', 'Retornar `Infinity` em vez de -1.'],
  },
  solution: {
    js: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}
`,
    ts: `function coinChange(coins: number[], amount: number): number {
  const dp: number[] = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}
`,
  },
  perf: { gen: (n: number) => [[3, 7, 11, 13, 29], n], n: 10000, limitMs: 2500, label: 'amount = 10.000' },
}
