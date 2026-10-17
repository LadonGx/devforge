import type { Problem } from '../../types'

export const numIslands: Problem = {
  id: 'number-of-islands',
  title: 'Number of Islands',
  difficulty: 'Médio',
  pattern: 'graphs',
  leetcode: { number: 200, slug: 'number-of-islands' },
  fnName: 'numIslands',
  params: ['grid'],
  description: `
Dada uma grade \`m x n\` de \`"1"\` (terra) e \`"0"\` (água), retorne o **número de ilhas**.

Uma ilha é um grupo de terras ligadas na **horizontal ou vertical** (não na diagonal). Tudo fora da grade é água.
`,
  examples: [
    {
      input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]',
      output: '3',
    },
  ],
  constraints: ['1 <= m, n <= 300', 'grid[i][j] é "0" ou "1"'],
  starter: {
    js: `/**
 * @param {string[][]} grid
 * @return {number}
 */
function numIslands(grid) {

}
`,
    ts: `function numIslands(grid: string[][]): number {

}
`,
  },
  tests: [
    {
      input: [
        [
          ['1', '1', '0', '0', '0'],
          ['1', '1', '0', '0', '0'],
          ['0', '0', '1', '0', '0'],
          ['0', '0', '0', '1', '1'],
        ],
      ],
      expected: 3,
      label: 'Exemplo 1',
    },
    {
      input: [
        [
          ['1', '1', '1'],
          ['0', '1', '0'],
          ['1', '1', '1'],
        ],
      ],
      expected: 1,
      label: 'Ilha em forma de I',
    },
    { input: [[['0']]], expected: 0, label: 'Só água' },
    {
      input: [
        [
          ['1', '0', '1'],
          ['0', '1', '0'],
          ['1', '0', '1'],
        ],
      ],
      expected: 5,
      label: 'Diagonais não conectam',
    },
  ],
  hints: [
    'Pense na grade como um **grafo**: cada célula é um nó, ligada às 4 vizinhas. Uma ilha é um **componente conectado**.',
    'Percorra a grade. Ao achar um "1" ainda não visitado, é uma ilha nova: conte e "afunde" a ilha inteira com DFS/BFS.',
    'DFS `sink(r, c)`: se fora da grade ou não é "1", pare. Senão marque `grid[r][c] = "0"` e chame para os 4 vizinhos.',
  ],
  explanation: {
    intuition: `
Contar ilhas = contar **componentes conectados** de um grafo implícito (a grade).

Varremos célula por célula. Toda vez que encontramos terra que ninguém visitou, **é uma ilha nova**. Então disparamos uma DFS que marca a ilha inteira (transformando em "0"), para não contá-la de novo.

No visualizador, veja a matriz mudando (células amarelas viram "0") e a árvore de chamadas da DFS se espalhando.
`,
    steps: [
      'Para cada célula `(r, c)`: se for "1", `count++` e `sink(r, c)`.',
      '`sink(r, c)`: se `r`/`c` fora dos limites ou `grid[r][c] !== "1"`, retorne.',
      'Marque `grid[r][c] = "0"` e chame `sink` nos 4 vizinhos.',
    ],
    time: 'O(m · n)',
    space: 'O(m · n)',
    complexityWhy: 'Cada célula é visitada um número constante de vezes. A recursão pode chegar a m·n de profundidade (grade toda terra).',
    pitfalls: [
      'Esquecer de marcar como visitado **antes** de chamar os vizinhos: recursão infinita.',
      'Comparar com o número `1` em vez da string `"1"`.',
      'Se não puder modificar a entrada, use um `Set` com chaves `"r,c"`.',
    ],
  },
  solution: {
    js: `function numIslands(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const sink = (r, c) => {
    if (r < 0 || c < 0 || r >= rows || c >= cols) return;
    if (grid[r][c] !== '1') return;
    grid[r][c] = '0'; // marca como visitado
    sink(r + 1, c);
    sink(r - 1, c);
    sink(r, c + 1);
    sink(r, c - 1);
  };
  let count = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') {
        count++;
        sink(r, c);
      }
    }
  }
  return count;
}
`,
    ts: `function numIslands(grid: string[][]): number {
  const rows = grid.length;
  const cols = grid[0].length;
  const sink = (r: number, c: number): void => {
    if (r < 0 || c < 0 || r >= rows || c >= cols) return;
    if (grid[r][c] !== '1') return;
    grid[r][c] = '0'; // marca como visitado
    sink(r + 1, c);
    sink(r - 1, c);
    sink(r, c + 1);
    sink(r, c - 1);
  };
  let count = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') {
        count++;
        sink(r, c);
      }
    }
  }
  return count;
}
`,
  },
}

export const rottingOranges: Problem = {
  id: 'rotting-oranges',
  title: 'Rotting Oranges',
  difficulty: 'Médio',
  pattern: 'graphs',
  leetcode: { number: 994, slug: 'rotting-oranges' },
  fnName: 'orangesRotting',
  params: ['grid'],
  description: `
Numa grade, \`0\` é vazio, \`1\` é laranja fresca e \`2\` é laranja podre. A cada minuto, toda laranja fresca **vizinha** (4 direções) de uma podre também apodrece.

Retorne o **mínimo de minutos** até não sobrar nenhuma fresca. Se for impossível, retorne \`-1\`.
`,
  examples: [
    { input: 'grid = [[2,1,1],[1,1,0],[0,1,1]]', output: '4' },
    { input: 'grid = [[2,1,1],[0,1,1],[1,0,1]]', output: '-1', explanation: 'A laranja do canto inferior esquerdo nunca é alcançada.' },
    { input: 'grid = [[0,2]]', output: '0' },
  ],
  constraints: ['1 <= m, n <= 10', 'grid[i][j] é 0, 1 ou 2'],
  starter: {
    js: `/**
 * @param {number[][]} grid
 * @return {number}
 */
function orangesRotting(grid) {

}
`,
    ts: `function orangesRotting(grid: number[][]): number {

}
`,
  },
  tests: [
    { input: [[[2, 1, 1], [1, 1, 0], [0, 1, 1]]], expected: 4, label: 'Exemplo 1' },
    { input: [[[2, 1, 1], [0, 1, 1], [1, 0, 1]]], expected: -1, label: 'Exemplo 2 (impossível)' },
    { input: [[[0, 2]]], expected: 0, label: 'Nenhuma fresca' },
    { input: [[[2, 1, 1, 1, 2]]], expected: 2, label: 'Duas fontes ao mesmo tempo' },
    { input: [[[1]]], expected: -1, label: 'Fresca sem nenhuma podre' },
  ],
  hints: [
    'O apodrecimento se espalha **em ondas**, minuto a minuto. Que busca percorre um grafo em ondas/camadas?',
    'BFS com **várias origens**: comece a fila com **todas** as laranjas podres ao mesmo tempo.',
    'Conte as frescas no início. Processe a fila nível a nível (cada nível = 1 minuto), apodrecendo vizinhos e decrementando `fresh`. No fim, `fresh === 0 ? minutos : -1`.',
  ],
  explanation: {
    intuition: `
Cada minuto é uma **camada** de uma BFS. Todas as laranjas podres começam juntas na fila (**BFS multi-origem**), porque apodrecem os vizinhos ao mesmo tempo.

Processamos a fila nível por nível, como no level order de árvores: o número de níveis processados é o número de minutos.
`,
    steps: [
      'Percorra a grade: enfileire cada `[r, c]` podre e conte `fresh`.',
      'Enquanto houver fila **e** `fresh > 0`: processe `queue.length` itens (um minuto).',
      'Para cada vizinho fresco: marque como 2, `fresh--`, enfileire.',
      'Depois do nível, `minutes++`. No fim, retorne `fresh === 0 ? minutes : -1`.',
    ],
    time: 'O(m · n)',
    space: 'O(m · n)',
    complexityWhy: 'Cada célula entra na fila no máximo uma vez.',
    pitfalls: ['Fazer BFS separada a partir de cada laranja podre: não respeita que elas apodrecem em paralelo.', 'Contar um minuto a mais no final (quando a última onda não apodrece ninguém).'],
  },
  solution: {
    js: `function orangesRotting(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  let queue = [];
  let fresh = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 2) queue.push([r, c]);
      else if (grid[r][c] === 1) fresh++;
    }
  }
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let minutes = 0;
  while (queue.length && fresh > 0) {
    const next = [];
    for (const [r, c] of queue) {
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
        if (grid[nr][nc] !== 1) continue;
        grid[nr][nc] = 2;
        fresh--;
        next.push([nr, nc]);
      }
    }
    queue = next;
    minutes++;
  }
  return fresh === 0 ? minutes : -1;
}
`,
    ts: `function orangesRotting(grid: number[][]): number {
  const rows = grid.length;
  const cols = grid[0].length;
  let queue: [number, number][] = [];
  let fresh = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 2) queue.push([r, c]);
      else if (grid[r][c] === 1) fresh++;
    }
  }
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let minutes = 0;
  while (queue.length && fresh > 0) {
    const next: [number, number][] = [];
    for (const [r, c] of queue) {
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
        if (grid[nr][nc] !== 1) continue;
        grid[nr][nc] = 2;
        fresh--;
        next.push([nr, nc]);
      }
    }
    queue = next;
    minutes++;
  }
  return fresh === 0 ? minutes : -1;
}
`,
  },
}

export const courseSchedule: Problem = {
  id: 'course-schedule',
  title: 'Course Schedule',
  difficulty: 'Médio',
  pattern: 'graphs',
  leetcode: { number: 207, slug: 'course-schedule' },
  fnName: 'canFinish',
  params: ['numCourses', 'prerequisites'],
  description: `
Existem \`numCourses\` cursos, numerados de \`0\` a \`numCourses - 1\`. \`prerequisites[i] = [a, b]\` significa que para fazer \`a\` você precisa ter feito \`b\` antes.

Retorne \`true\` se for possível concluir **todos** os cursos.
`,
  examples: [
    { input: 'numCourses = 2, prerequisites = [[1,0]]', output: 'true', explanation: 'Faça 0, depois 1.' },
    { input: 'numCourses = 2, prerequisites = [[1,0],[0,1]]', output: 'false', explanation: '0 depende de 1 e 1 depende de 0: ciclo.' },
  ],
  constraints: ['1 <= numCourses <= 2000', '0 <= prerequisites.length <= 5000', 'Pares únicos'],
  starter: {
    js: `/**
 * @param {number} numCourses
 * @param {number[][]} prerequisites
 * @return {boolean}
 */
function canFinish(numCourses, prerequisites) {

}
`,
    ts: `function canFinish(numCourses: number, prerequisites: number[][]): boolean {

}
`,
  },
  tests: [
    { input: [2, [[1, 0]]], expected: true, label: 'Exemplo 1' },
    { input: [2, [[1, 0], [0, 1]]], expected: false, label: 'Exemplo 2 (ciclo)' },
    { input: [3, []], expected: true, label: 'Sem pré-requisitos' },
    { input: [4, [[1, 0], [2, 1], [3, 2]]], expected: true, label: 'Corrente' },
    { input: [4, [[1, 0], [2, 1], [3, 2], [1, 3]]], expected: false, label: 'Ciclo no meio' },
    { input: [5, [[1, 4], [2, 4], [3, 1], [3, 2]]], expected: true, label: 'Losango (não é ciclo)' },
  ],
  hints: [
    'Modele como um **grafo direcionado**: aresta `b → a` (b libera a). Quando é impossível terminar?',
    'Quando existe um **ciclo**. Uma forma de detectar: **ordenação topológica** (algoritmo de Kahn).',
    'Calcule o grau de entrada (`indegree`) de cada curso. Enfileire os de grau 0, e ao "fazer" um curso, decremente os vizinhos. Se fizer todos, não há ciclo.',
  ],
  explanation: {
    intuition: `
Cursos são **nós** e pré-requisitos são **arestas direcionadas**. Dá para concluir tudo se, e somente se, o grafo **não tem ciclo**.

**Kahn (BFS topológica):** um curso com \`indegree = 0\` não depende de ninguém: pode ser feito já. Ao fazê-lo, ele deixa de bloquear seus vizinhos (decrementa o indegree deles). Se em algum momento ninguém tem grau 0 mas ainda sobram cursos, eles estão presos num ciclo.
`,
    steps: [
      'Monte `graph[b] = [a, ...]` e `indegree[a]++` para cada `[a, b]`.',
      'Enfileire todos os cursos com `indegree === 0`.',
      'Enquanto houver fila: tire `c`, `done++`; para cada vizinho `n`, `indegree[n]--` e, se chegou a 0, enfileire.',
      'Retorne `done === numCourses`.',
    ],
    time: 'O(V + E)',
    space: 'O(V + E)',
    complexityWhy: 'Cada curso e cada pré-requisito são processados uma vez.',
    pitfalls: [
      'Inverter a direção da aresta (`a → b`): o algoritmo ainda detecta ciclos, mas confunde a ordem quando pedirem a sequência (Course Schedule II).',
      'Alternativa com DFS: marque nós como "visitando"; reencontrar um "visitando" é ciclo.',
    ],
  },
  solution: {
    js: `function canFinish(numCourses, prerequisites) {
  const graph = Array.from({ length: numCourses }, () => []);
  const indegree = new Array(numCourses).fill(0);
  for (const [a, b] of prerequisites) {
    graph[b].push(a); // b libera a
    indegree[a]++;
  }
  const queue = [];
  for (let c = 0; c < numCourses; c++) if (indegree[c] === 0) queue.push(c);
  let done = 0;
  while (queue.length) {
    const c = queue.shift();
    done++;
    for (const n of graph[c]) {
      indegree[n]--;
      if (indegree[n] === 0) queue.push(n);
    }
  }
  return done === numCourses;
}
`,
    ts: `function canFinish(numCourses: number, prerequisites: number[][]): boolean {
  const graph: number[][] = Array.from({ length: numCourses }, () => []);
  const indegree: number[] = new Array(numCourses).fill(0);
  for (const [a, b] of prerequisites) {
    graph[b].push(a); // b libera a
    indegree[a]++;
  }
  const queue: number[] = [];
  for (let c = 0; c < numCourses; c++) if (indegree[c] === 0) queue.push(c);
  let done = 0;
  while (queue.length) {
    const c = queue.shift()!;
    done++;
    for (const n of graph[c]) {
      indegree[n]--;
      if (indegree[n] === 0) queue.push(n);
    }
  }
  return done === numCourses;
}
`,
  },
}
