import type { Problem } from '../../types'

export const subsets: Problem = {
  id: 'subsets',
  title: 'Subsets',
  difficulty: 'Médio',
  pattern: 'backtracking',
  leetcode: { number: 78, slug: 'subsets' },
  fnName: 'subsets',
  params: ['nums'],
  compare: 'unorderedNested',
  description: `
Dado um array \`nums\` de elementos **distintos**, retorne **todos os subconjuntos possíveis** (o conjunto das partes).

Não pode haver subconjuntos repetidos. A ordem não importa.
`,
  examples: [
    { input: 'nums = [1,2,3]', output: '[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]' },
    { input: 'nums = [0]', output: '[[],[0]]' },
  ],
  constraints: ['1 <= nums.length <= 10', 'Todos os elementos são distintos'],
  starter: {
    js: `/**
 * @param {number[]} nums
 * @return {number[][]}
 */
function subsets(nums) {

}
`,
    ts: `function subsets(nums: number[]): number[][] {

}
`,
  },
  tests: [
    { input: [[1, 2, 3]], expected: [[], [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3]], label: 'Exemplo 1' },
    { input: [[0]], expected: [[], [0]], label: 'Exemplo 2' },
    { input: [[5, 9]], expected: [[], [5], [9], [5, 9]], label: 'Dois elementos' },
  ],
  hints: [
    'Para cada elemento existem só duas escolhas: **entra** ou **não entra** no subconjunto. Quantos subconjuntos isso dá?',
    '2ⁿ. Desenhe a árvore de decisão: cada nível decide um elemento. As folhas são os subconjuntos.',
    "`dfs(i)`: se `i === nums.length`, salve uma **cópia** de `path`. Senão: `path.push(nums[i]); dfs(i+1); path.pop(); dfs(i+1)`.",
  ],
  explanation: {
    intuition: `
Backtracking é **explorar uma árvore de decisões** com DFS, desfazendo cada escolha ao voltar.

Aqui, no nível \`i\` decidimos o elemento \`nums[i]\`: **incluir** (push, desce, pop) ou **não incluir** (só desce). Quando \`i\` chega no fim, \`path\` é um subconjunto completo.

O visualizador mostra exatamente essa árvore em **Árvore de chamadas**: cada caixa é uma chamada \`dfs(i)\`.
`,
    steps: [
      '`res = []`, `path = []`.',
      '`dfs(i)`: se `i === nums.length`, `res.push([...path])` e retorne.',
      'Escolha incluir: `path.push(nums[i])`, `dfs(i + 1)`, `path.pop()` (desfaz).',
      'Escolha não incluir: `dfs(i + 1)`.',
      'Chame `dfs(0)` e retorne `res`.',
    ],
    time: 'O(n · 2ⁿ)',
    space: 'O(n)',
    complexityWhy: '2ⁿ subconjuntos, cada cópia custa até n. A recursão tem profundidade n (fora a saída).',
    pitfalls: [
      '`res.push(path)` sem copiar: todos os itens de `res` apontam para o **mesmo** array, que termina vazio. Use `[...path]`.',
      'Esquecer o `pop()`: a escolha "não incluir" herda o elemento.',
    ],
  },
  solution: {
    js: `function subsets(nums) {
  const res = [];
  const path = [];
  const dfs = (i) => {
    if (i === nums.length) {
      res.push([...path]);
      return;
    }
    path.push(nums[i]); // inclui nums[i]
    dfs(i + 1);
    path.pop();         // desfaz a escolha
    dfs(i + 1);         // não inclui nums[i]
  };
  dfs(0);
  return res;
}
`,
    ts: `function subsets(nums: number[]): number[][] {
  const res: number[][] = [];
  const path: number[] = [];
  const dfs = (i: number): void => {
    if (i === nums.length) {
      res.push([...path]);
      return;
    }
    path.push(nums[i]); // inclui nums[i]
    dfs(i + 1);
    path.pop();         // desfaz a escolha
    dfs(i + 1);         // não inclui nums[i]
  };
  dfs(0);
  return res;
}
`,
  },
}

export const permutations: Problem = {
  id: 'permutations',
  title: 'Permutations',
  difficulty: 'Médio',
  pattern: 'backtracking',
  leetcode: { number: 46, slug: 'permutations' },
  fnName: 'permute',
  params: ['nums'],
  compare: 'unordered',
  description: `
Dado um array \`nums\` de inteiros **distintos**, retorne **todas as permutações** possíveis, em qualquer ordem.
`,
  examples: [
    { input: 'nums = [1,2,3]', output: '[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]' },
    { input: 'nums = [0,1]', output: '[[0,1],[1,0]]' },
    { input: 'nums = [1]', output: '[[1]]' },
  ],
  constraints: ['1 <= nums.length <= 6', 'Todos os elementos são distintos'],
  starter: {
    js: `/**
 * @param {number[]} nums
 * @return {number[][]}
 */
function permute(nums) {

}
`,
    ts: `function permute(nums: number[]): number[][] {

}
`,
  },
  tests: [
    { input: [[1, 2, 3]], expected: [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]], label: 'Exemplo 1' },
    { input: [[0, 1]], expected: [[0, 1], [1, 0]], label: 'Exemplo 2' },
    { input: [[1]], expected: [[1]], label: 'Exemplo 3' },
  ],
  hints: [
    'Para montar uma permutação, escolha o 1º elemento (n opções), depois o 2º entre os que sobraram (n-1)...',
    'Mantenha `path` e um `used` (Set ou array de booleanos) dizendo quem já está no caminho.',
    'Em cada nível, tente todo `nums[i]` ainda não usado: marca, push, desce, pop, desmarca.',
  ],
  explanation: {
    intuition: `
Diferente de subsets, aqui a **ordem importa** e todo elemento precisa aparecer. Em cada nível da árvore de decisão tentamos **cada elemento que ainda não foi usado**.

A árvore tem n! folhas (para \`[1,2,3]\`, 6). Veja no visualizador como \`used\` marca e desmarca os elementos ao descer e voltar.
`,
    steps: [
      '`dfs()`: se `path.length === nums.length`, salve uma cópia.',
      'Para cada `n` de `nums`: se já está em `used`, pule.',
      '`used.add(n)`, `path.push(n)`, `dfs()`, `path.pop()`, `used.delete(n)`.',
    ],
    time: 'O(n · n!)',
    space: 'O(n)',
    complexityWhy: 'n! permutações, cada cópia custa n.',
    pitfalls: ['Esquecer de desmarcar `used` ao voltar.', 'Usar `path.includes(n)` funciona, mas é O(n) por checagem.'],
  },
  solution: {
    js: `function permute(nums) {
  const res = [];
  const path = [];
  const used = new Set();
  const dfs = () => {
    if (path.length === nums.length) {
      res.push([...path]);
      return;
    }
    for (const n of nums) {
      if (used.has(n)) continue;
      used.add(n);
      path.push(n);
      dfs();
      path.pop();
      used.delete(n);
    }
  };
  dfs();
  return res;
}
`,
    ts: `function permute(nums: number[]): number[][] {
  const res: number[][] = [];
  const path: number[] = [];
  const used = new Set<number>();
  const dfs = (): void => {
    if (path.length === nums.length) {
      res.push([...path]);
      return;
    }
    for (const n of nums) {
      if (used.has(n)) continue;
      used.add(n);
      path.push(n);
      dfs();
      path.pop();
      used.delete(n);
    }
  };
  dfs();
  return res;
}
`,
  },
}

export const combinationSum: Problem = {
  id: 'combination-sum',
  title: 'Combination Sum',
  difficulty: 'Médio',
  pattern: 'backtracking',
  leetcode: { number: 39, slug: 'combination-sum' },
  fnName: 'combinationSum',
  params: ['candidates', 'target'],
  compare: 'unorderedNested',
  description: `
Dado um array de inteiros **distintos** \`candidates\` e um \`target\`, retorne todas as **combinações únicas** de candidatos cuja soma é \`target\`.

O **mesmo número pode ser usado várias vezes**. Duas combinações são iguais se usam os mesmos números nas mesmas quantidades (a ordem não importa).
`,
  examples: [
    { input: 'candidates = [2,3,6,7], target = 7', output: '[[2,2,3],[7]]' },
    { input: 'candidates = [2,3,5], target = 8', output: '[[2,2,2,2],[2,3,3],[3,5]]' },
    { input: 'candidates = [2], target = 1', output: '[]' },
  ],
  constraints: ['1 <= candidates.length <= 30', '2 <= candidates[i] <= 40', '1 <= target <= 40'],
  starter: {
    js: `/**
 * @param {number[]} candidates
 * @param {number} target
 * @return {number[][]}
 */
function combinationSum(candidates, target) {

}
`,
    ts: `function combinationSum(candidates: number[], target: number): number[][] {

}
`,
  },
  tests: [
    { input: [[2, 3, 6, 7], 7], expected: [[2, 2, 3], [7]], label: 'Exemplo 1' },
    { input: [[2, 3, 5], 8], expected: [[2, 2, 2, 2], [2, 3, 3], [3, 5]], label: 'Exemplo 2' },
    { input: [[2], 1], expected: [], label: 'Impossível' },
    { input: [[3, 4], 6], expected: [[3, 3]], label: 'Repetindo um número' },
  ],
  hints: [
    'Como evitar `[2,2,3]` e `[2,3,2]` como respostas diferentes?',
    'Só permita escolher candidatos a partir do **índice atual** para frente (nunca volte para trás). Assim cada combinação sai em ordem.',
    "`dfs(start, remaining)`: se `remaining === 0`, salve; se `< 0`, pare. Para `i` de `start` em diante: push, `dfs(i, remaining - c[i])` (i, não i+1: pode repetir), pop.",
  ],
  explanation: {
    intuition: `
A árvore de decisão: em cada nível, escolha **qual candidato adicionar**. Para não gerar a mesma combinação em ordens diferentes, impomos uma ordem: depois de escolher \`candidates[i]\`, os próximos só podem ser \`candidates[i]\` ou posteriores.

**Poda:** se o que falta (\`remaining\`) ficou negativo, esse galho morre. Veja no visualizador os galhos que retornam cedo.
`,
    steps: [
      '`dfs(start, remaining)`: se `remaining === 0`, salve cópia de `path`.',
      'Se `remaining < 0`, retorne (poda).',
      'Para `i` de `start` até o fim: `path.push(c[i])`, `dfs(i, remaining - c[i])`, `path.pop()`.',
    ],
    time: 'O(2^(t/m)) aproximadamente',
    space: 'O(t/m)',
    complexityWhy: 't = target, m = menor candidato: a profundidade máxima é t/m e cada nível ramifica.',
    pitfalls: ['Chamar `dfs(i + 1, ...)`: impede repetir o mesmo número.', 'Começar o loop sempre do 0: gera permutações repetidas.'],
  },
  solution: {
    js: `function combinationSum(candidates, target) {
  const res = [];
  const path = [];
  const dfs = (start, remaining) => {
    if (remaining === 0) {
      res.push([...path]);
      return;
    }
    if (remaining < 0) return; // poda
    for (let i = start; i < candidates.length; i++) {
      path.push(candidates[i]);
      dfs(i, remaining - candidates[i]); // i: pode repetir
      path.pop();
    }
  };
  dfs(0, target);
  return res;
}
`,
    ts: `function combinationSum(candidates: number[], target: number): number[][] {
  const res: number[][] = [];
  const path: number[] = [];
  const dfs = (start: number, remaining: number): void => {
    if (remaining === 0) {
      res.push([...path]);
      return;
    }
    if (remaining < 0) return; // poda
    for (let i = start; i < candidates.length; i++) {
      path.push(candidates[i]);
      dfs(i, remaining - candidates[i]); // i: pode repetir
      path.pop();
    }
  };
  dfs(0, target);
  return res;
}
`,
  },
}
