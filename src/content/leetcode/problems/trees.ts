import type { Problem } from '../../types'

const TREE_DOC_JS = ` * TreeNode já está disponível (não precisa declarar):
 * class TreeNode { constructor(val = 0, left = null, right = null) { ... } }
 *`
const TREE_DOC_TS = `/*
 * TreeNode já está disponível (não precisa declarar):
 * class TreeNode { val: number; left: TreeNode | null; right: TreeNode | null }
 */
`

export const invertTree: Problem = {
  id: 'invert-binary-tree',
  title: 'Invert Binary Tree',
  difficulty: 'Fácil',
  pattern: 'trees',
  leetcode: { number: 226, slug: 'invert-binary-tree' },
  fnName: 'invertTree',
  params: ['root'],
  io: { args: ['tree'], ret: 'tree' },
  description: `
Dada a raiz de uma árvore binária, **espelhe a árvore** (troque esquerda e direita em todos os nós) e retorne a raiz.

As árvores dos testes estão em **ordem de nível** (como no LeetCode): \`[4,2,7,1,3,6,9]\` lê a árvore linha por linha, da esquerda para a direita; \`null\` marca um filho que não existe.
`,
  examples: [
    { input: 'root = [4,2,7,1,3,6,9]', output: '[4,7,2,9,6,3,1]' },
    { input: 'root = [2,1,3]', output: '[2,3,1]' },
    { input: 'root = []', output: '[]' },
  ],
  constraints: ['0 <= nós <= 100', '-100 <= Node.val <= 100'],
  starter: {
    js: `/**
${TREE_DOC_JS}
 * @param {TreeNode | null} root
 * @return {TreeNode | null}
 */
function invertTree(root) {

}
`,
    ts: `${TREE_DOC_TS}function invertTree(root: TreeNode | null): TreeNode | null {

}
`,
  },
  tests: [
    { input: [[4, 2, 7, 1, 3, 6, 9]], expected: [4, 7, 2, 9, 6, 3, 1], label: 'Exemplo 1' },
    { input: [[2, 1, 3]], expected: [2, 3, 1], label: 'Exemplo 2' },
    { input: [[]], expected: [], label: 'Árvore vazia' },
    { input: [[1, 2]], expected: [1, null, 2], label: 'Só filho esquerdo' },
    { input: [[1, null, 2, null, 3]], expected: [1, 2, null, 3], label: 'Torta para a direita' },
  ],
  hints: [
    'Para espelhar a árvore inteira, o que precisa acontecer com a raiz? E com cada subárvore?',
    'Recursão: troque `root.left` e `root.right`, depois inverta cada um dos lados.',
    'Caso base: `if (!root) return null`.',
  ],
  explanation: {
    intuition: `
Árvores são **recursivas por natureza**: cada filho é a raiz de uma árvore menor. Então o problema se repete:

> inverter(árvore) = trocar os filhos da raiz + inverter(esquerda) + inverter(direita)

Abra o visualizador e veja a **árvore de chamadas**: cada nó vira uma chamada de \`invertTree\`, e o nó atual fica destacado na árvore.
`,
    steps: ['Caso base: se `root` é `null`, retorne `null`.', 'Troque: `[root.left, root.right] = [root.right, root.left]`.', 'Chame `invertTree` nos dois filhos.', 'Retorne `root`.'],
    time: 'O(n)',
    space: 'O(h)',
    complexityWhy: 'Visitamos cada nó uma vez. A pilha de recursão tem a altura h da árvore (O(log n) balanceada, O(n) no pior caso).',
    pitfalls: ['Fazer `root.left = invertTree(root.right)` e depois `root.right = invertTree(root.left)`: na segunda linha o `root.left` já foi sobrescrito! Guarde em variáveis ou use desestruturação.', 'Esquecer o caso base `null`.'],
  },
  solution: {
    js: `function invertTree(root) {
  if (!root) return null;
  [root.left, root.right] = [root.right, root.left];
  invertTree(root.left);
  invertTree(root.right);
  return root;
}
`,
    ts: `function invertTree(root: TreeNode | null): TreeNode | null {
  if (!root) return null;
  [root.left, root.right] = [root.right, root.left];
  invertTree(root.left);
  invertTree(root.right);
  return root;
}
`,
  },
}

export const maxDepth: Problem = {
  id: 'max-depth-binary-tree',
  title: 'Maximum Depth of Binary Tree',
  difficulty: 'Fácil',
  pattern: 'trees',
  leetcode: { number: 104, slug: 'maximum-depth-of-binary-tree' },
  fnName: 'maxDepth',
  params: ['root'],
  io: { args: ['tree'] },
  description: `
Dada a raiz de uma árvore binária, retorne sua **profundidade máxima**: o número de nós no caminho mais longo da raiz até uma folha.
`,
  examples: [
    { input: 'root = [3,9,20,null,null,15,7]', output: '3', explanation: 'Caminho 3 → 20 → 15 (ou 7).' },
    { input: 'root = [1,null,2]', output: '2' },
  ],
  constraints: ['0 <= nós <= 10^4', '-100 <= Node.val <= 100'],
  starter: {
    js: `/**
${TREE_DOC_JS}
 * @param {TreeNode | null} root
 * @return {number}
 */
function maxDepth(root) {

}
`,
    ts: `${TREE_DOC_TS}function maxDepth(root: TreeNode | null): number {

}
`,
  },
  tests: [
    { input: [[3, 9, 20, null, null, 15, 7]], expected: 3, label: 'Exemplo 1' },
    { input: [[1, null, 2]], expected: 2, label: 'Exemplo 2' },
    { input: [[]], expected: 0, label: 'Vazia' },
    { input: [[1]], expected: 1, label: 'Só a raiz' },
    { input: [[1, 2, 3, 4, null, null, null, 5]], expected: 4, label: 'Desbalanceada' },
  ],
  hints: [
    'Se você soubesse a profundidade da subárvore esquerda e da direita, como calcularia a da árvore toda?',
    '`1 + Math.max(esquerda, direita)`. E a profundidade de uma árvore vazia?',
    'Caso base: `null` tem profundidade 0.',
  ],
  explanation: {
    intuition: `
DFS clássico: a resposta de um nó depende das respostas dos filhos. Cada chamada **retorna** um número, e o pai combina.

Na árvore de chamadas do visualizador, veja os valores **voltando** (→ 1, → 2...) de baixo para cima.
`,
    steps: ['Se `root` é `null`, retorne 0.', 'Calcule `left = maxDepth(root.left)` e `right = maxDepth(root.right)`.', 'Retorne `1 + Math.max(left, right)`.'],
    time: 'O(n)',
    space: 'O(h)',
    complexityWhy: 'Cada nó é visitado uma vez; a recursão vai até a altura h.',
    pitfalls: ['Retornar 1 para `null`: conta um nível a mais.', 'Alternativa BFS: conte quantos níveis o loop processa (útil se perguntarem sem recursão).'],
  },
  solution: {
    js: `function maxDepth(root) {
  if (!root) return 0;
  const left = maxDepth(root.left);
  const right = maxDepth(root.right);
  return 1 + Math.max(left, right);
}
`,
    ts: `function maxDepth(root: TreeNode | null): number {
  if (!root) return 0;
  const left = maxDepth(root.left);
  const right = maxDepth(root.right);
  return 1 + Math.max(left, right);
}
`,
  },
}

export const levelOrder: Problem = {
  id: 'level-order-traversal',
  title: 'Binary Tree Level Order Traversal',
  difficulty: 'Médio',
  pattern: 'trees',
  leetcode: { number: 102, slug: 'binary-tree-level-order-traversal' },
  fnName: 'levelOrder',
  params: ['root'],
  io: { args: ['tree'] },
  description: `
Dada a raiz de uma árvore binária, retorne os valores dos nós **nível por nível** (da esquerda para a direita), como um array de arrays.
`,
  examples: [
    { input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]' },
    { input: 'root = [1]', output: '[[1]]' },
    { input: 'root = []', output: '[]' },
  ],
  constraints: ['0 <= nós <= 2000', '-1000 <= Node.val <= 1000'],
  starter: {
    js: `/**
${TREE_DOC_JS}
 * @param {TreeNode | null} root
 * @return {number[][]}
 */
function levelOrder(root) {

}
`,
    ts: `${TREE_DOC_TS}function levelOrder(root: TreeNode | null): number[][] {

}
`,
  },
  tests: [
    { input: [[3, 9, 20, null, null, 15, 7]], expected: [[3], [9, 20], [15, 7]], label: 'Exemplo 1' },
    { input: [[1]], expected: [[1]], label: 'Só a raiz' },
    { input: [[]], expected: [], label: 'Vazia' },
    { input: [[1, 2, 3, 4, null, null, 5]], expected: [[1], [2, 3], [4, 5]], label: 'Buracos no meio' },
  ],
  hints: [
    'Percorrer "por camadas" é o trabalho da **BFS** (busca em largura). Qual estrutura ela usa?',
    'Uma **fila**: tire da frente, coloque os filhos no fim.',
    'Para separar os níveis: no começo de cada nível, `size = queue.length`. Processe exatamente `size` nós; eles são o nível atual.',
  ],
  explanation: {
    intuition: `
DFS desce fundo; **BFS** varre em camadas. A fila garante a ordem: todos os nós do nível k saem antes dos do nível k+1, porque foram colocados antes.

O detalhe para separar os níveis: no início de cada rodada, a fila contém **exatamente** o nível atual. Guarde \`queue.length\` e processe só essa quantidade.
`,
    steps: [
      'Se `root` é null, retorne `[]`.',
      '`queue = [root]`, `res = []`.',
      'Enquanto a fila não estiver vazia: `size = queue.length`, `level = []`.',
      'Repita `size` vezes: tire o primeiro nó, coloque `node.val` em `level` e enfileire os filhos não nulos.',
      '`res.push(level)`.',
    ],
    time: 'O(n)',
    space: 'O(n)',
    complexityWhy: 'Cada nó entra e sai da fila uma vez; a fila guarda até um nível inteiro (até n/2 nós).',
    pitfalls: [
      'Usar `queue.length` diretamente no `for` enquanto adiciona filhos: o tamanho muda durante o loop.',
      '`queue.shift()` é O(n) em arrays JS. Para entrevistas em geral é aceito; se perguntarem, use um índice `head` em vez de shift.',
    ],
  },
  solution: {
    js: `function levelOrder(root) {
  if (!root) return [];
  const res = [];
  const queue = [root];
  while (queue.length) {
    const size = queue.length;
    const level = [];
    for (let i = 0; i < size; i++) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    res.push(level);
  }
  return res;
}
`,
    ts: `function levelOrder(root: TreeNode | null): number[][] {
  if (!root) return [];
  const res: number[][] = [];
  const queue: TreeNode[] = [root];
  while (queue.length) {
    const size = queue.length;
    const level: number[] = [];
    for (let i = 0; i < size; i++) {
      const node = queue.shift()!;
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    res.push(level);
  }
  return res;
}
`,
  },
}

export const validateBST: Problem = {
  id: 'validate-bst',
  title: 'Validate Binary Search Tree',
  difficulty: 'Médio',
  pattern: 'trees',
  leetcode: { number: 98, slug: 'validate-binary-search-tree' },
  fnName: 'isValidBST',
  params: ['root'],
  io: { args: ['tree'] },
  description: `
Dada a raiz de uma árvore binária, determine se ela é uma **árvore binária de busca (BST)** válida:

- toda a subárvore **esquerda** de um nó tem valores **menores** que ele;
- toda a subárvore **direita** tem valores **maiores**;
- as duas subárvores também são BSTs.
`,
  examples: [
    { input: 'root = [2,1,3]', output: 'true' },
    { input: 'root = [5,1,4,null,null,3,6]', output: 'false', explanation: 'O 4 está à direita do 5, mas é menor que 5.' },
  ],
  constraints: ['1 <= nós <= 10^4', '-2^31 <= Node.val <= 2^31 - 1'],
  starter: {
    js: `/**
${TREE_DOC_JS}
 * @param {TreeNode | null} root
 * @return {boolean}
 */
function isValidBST(root) {

}
`,
    ts: `${TREE_DOC_TS}function isValidBST(root: TreeNode | null): boolean {

}
`,
  },
  tests: [
    { input: [[2, 1, 3]], expected: true, label: 'Exemplo 1' },
    { input: [[5, 1, 4, null, null, 3, 6]], expected: false, label: 'Exemplo 2' },
    { input: [[5, 4, 6, null, null, 3, 7]], expected: false, label: 'Neto viola o avô (pegadinha!)' },
    { input: [[2, 2, 2]], expected: false, label: 'Valores iguais não valem' },
    { input: [[10, 5, 15, 3, 7, 12, 20]], expected: true, label: 'BST completa' },
    { input: [[1]], expected: true, label: 'Um nó' },
  ],
  hints: [
    'Comparar cada nó só com os filhos diretos **não basta**. Veja o caso "neto viola o avô".',
    'Cada nó precisa estar dentro de um **intervalo** (min, max) herdado dos ancestrais.',
    '`valid(node, min, max)`: ao descer para a esquerda o max vira `node.val`; para a direita o min vira `node.val`. Comece com `-Infinity` e `Infinity`.',
  ],
  explanation: {
    intuition: `
O erro clássico é checar só \`left.val < node.val < right.val\`. Na árvore \`[5,4,6,null,null,3,7]\`, o 3 está à direita do 5 (mesmo sendo filho esquerdo do 6): inválido.

A solução é passar para baixo os **limites** que cada nó precisa respeitar. Descendo à esquerda de \`x\`, tudo precisa ser < x; à direita, > x.
`,
    steps: [
      '`valid(node, min, max)`: se `node` é null, retorne `true`.',
      'Se `node.val <= min` ou `node.val >= max`, retorne `false`.',
      'Retorne `valid(node.left, min, node.val) && valid(node.right, node.val, max)`.',
      'Chame `valid(root, -Infinity, Infinity)`.',
    ],
    time: 'O(n)',
    space: 'O(h)',
    complexityWhy: 'Cada nó é checado uma vez.',
    pitfalls: ['Comparar só com os filhos diretos.', 'Usar `<` / `>` errado e aceitar valores iguais.', 'Alternativa: a travessia **in-order** de uma BST é estritamente crescente.'],
  },
  solution: {
    js: `function isValidBST(root) {
  const valid = (node, min, max) => {
    if (!node) return true;
    if (node.val <= min || node.val >= max) return false;
    return valid(node.left, min, node.val) && valid(node.right, node.val, max);
  };
  return valid(root, -Infinity, Infinity);
}
`,
    ts: `function isValidBST(root: TreeNode | null): boolean {
  const valid = (node: TreeNode | null, min: number, max: number): boolean => {
    if (!node) return true;
    if (node.val <= min || node.val >= max) return false;
    return valid(node.left, min, node.val) && valid(node.right, node.val, max);
  };
  return valid(root, -Infinity, Infinity);
}
`,
  },
}
