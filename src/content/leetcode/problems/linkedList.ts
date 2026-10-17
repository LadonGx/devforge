import type { Problem } from '../../types'

const LIST_DOC_JS = ` * ListNode já está disponível (não precisa declarar):
 * class ListNode { constructor(val = 0, next = null) { this.val = val; this.next = next } }
 *`
const LIST_DOC_TS = `/*
 * ListNode já está disponível (não precisa declarar):
 * class ListNode { val: number; next: ListNode | null; constructor(val?, next?) }
 */
`

export const reverseList: Problem = {
  id: 'reverse-linked-list',
  title: 'Reverse Linked List',
  difficulty: 'Fácil',
  pattern: 'linked-list',
  leetcode: { number: 206, slug: 'reverse-linked-list' },
  fnName: 'reverseList',
  params: ['head'],
  io: { args: ['list'], ret: 'list' },
  description: `
Dado o \`head\` de uma lista ligada simples, **inverta a lista** e retorne o novo head.

Nos testes, a lista aparece como array (\`[1,2,3]\` = \`1 → 2 → 3 → null\`), mas sua função recebe e retorna **nós** (\`ListNode\`).
`,
  examples: [
    { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' },
    { input: 'head = [1,2]', output: '[2,1]' },
    { input: 'head = []', output: '[]' },
  ],
  constraints: ['0 <= número de nós <= 5000', '-5000 <= Node.val <= 5000'],
  starter: {
    js: `/**
${LIST_DOC_JS}
 * @param {ListNode | null} head
 * @return {ListNode | null}
 */
function reverseList(head) {

}
`,
    ts: `${LIST_DOC_TS}function reverseList(head: ListNode | null): ListNode | null {

}
`,
  },
  tests: [
    { input: [[1, 2, 3, 4, 5]], expected: [5, 4, 3, 2, 1], label: 'Exemplo 1' },
    { input: [[1, 2]], expected: [2, 1], label: 'Exemplo 2' },
    { input: [[]], expected: [], label: 'Lista vazia (head = null)' },
    { input: [[7]], expected: [7], label: 'Um nó' },
    { input: [[3, 3, 1]], expected: [1, 3, 3], label: 'Valores repetidos' },
  ],
  hints: [
    'Cada nó precisa passar a apontar para o **anterior**. Quantas referências você precisa guardar ao mesmo tempo?',
    'Três: `prev` (já invertido), `curr` (o que estou mexendo) e `next` (o resto, para não perder).',
    'No loop: `next = curr.next; curr.next = prev; prev = curr; curr = next`. No fim, `prev` é o novo head.',
  ],
  explanation: {
    intuition: `
Inverter uma lista é **virar cada seta** \`→\` para \`←\`. O perigo: ao fazer \`curr.next = prev\`, você **perde** o caminho para o resto da lista. Por isso guardamos \`next\` antes.

Pense em duas listas: a já invertida (começando em \`prev\`) e a que falta (começando em \`curr\`). A cada passo, um nó sai da segunda e entra na frente da primeira. Abra o visualizador: você vê as duas listas lado a lado.
`,
    steps: ['`prev = null`, `curr = head`.', 'Enquanto `curr`: guarde `next = curr.next`.', 'Vire a seta: `curr.next = prev`.', 'Avance: `prev = curr`, `curr = next`.', 'Retorne `prev`.'],
    time: 'O(n)',
    space: 'O(1)',
    complexityWhy: 'Cada nó é visitado uma vez e só usamos três ponteiros. (A versão recursiva usa O(n) de pilha.)',
    pitfalls: ['Fazer `curr.next = prev` antes de salvar `curr.next`: o resto da lista se perde.', 'Retornar `head` no fim: ele agora é o **último** nó.', 'Esquecer o caso `head = null`.'],
  },
  solution: {
    js: `function reverseList(head) {
  let prev = null;
  let curr = head;
  while (curr) {
    const next = curr.next; // guarda o resto
    curr.next = prev;       // vira a seta
    prev = curr;
    curr = next;
  }
  return prev;
}
`,
    ts: `function reverseList(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null;
  let curr = head;
  while (curr) {
    const next = curr.next; // guarda o resto
    curr.next = prev;       // vira a seta
    prev = curr;
    curr = next;
  }
  return prev;
}
`,
  },
  perf: { gen: (n: number) => [Array.from({ length: n }, (_, i) => i)], n: 100000, limitMs: 2500, label: 'lista com 100.000 nós' },
}

export const mergeTwoLists: Problem = {
  id: 'merge-two-sorted-lists',
  title: 'Merge Two Sorted Lists',
  difficulty: 'Fácil',
  pattern: 'linked-list',
  leetcode: { number: 21, slug: 'merge-two-sorted-lists' },
  fnName: 'mergeTwoLists',
  params: ['list1', 'list2'],
  io: { args: ['list', 'list'], ret: 'list' },
  description: `
Você recebe os heads de duas listas ligadas **ordenadas**, \`list1\` e \`list2\`.

Junte as duas em **uma única lista ordenada**, reaproveitando os nós (sem criar cópias dos valores), e retorne o head dela.
`,
  examples: [
    { input: 'list1 = [1,2,4], list2 = [1,3,4]', output: '[1,1,2,3,4,4]' },
    { input: 'list1 = [], list2 = []', output: '[]' },
    { input: 'list1 = [], list2 = [0]', output: '[0]' },
  ],
  constraints: ['0 <= nós em cada lista <= 50', 'As duas listas estão em ordem crescente'],
  starter: {
    js: `/**
${LIST_DOC_JS}
 * @param {ListNode | null} list1
 * @param {ListNode | null} list2
 * @return {ListNode | null}
 */
function mergeTwoLists(list1, list2) {

}
`,
    ts: `${LIST_DOC_TS}function mergeTwoLists(list1: ListNode | null, list2: ListNode | null): ListNode | null {

}
`,
  },
  tests: [
    { input: [[1, 2, 4], [1, 3, 4]], expected: [1, 1, 2, 3, 4, 4], label: 'Exemplo 1' },
    { input: [[], []], expected: [], label: 'Duas vazias' },
    { input: [[], [0]], expected: [0], label: 'Uma vazia' },
    { input: [[5], [1, 2, 3]], expected: [1, 2, 3, 5], label: 'Uma acaba antes' },
    { input: [[1, 3, 5, 7], [2, 4, 6, 8]], expected: [1, 2, 3, 4, 5, 6, 7, 8], label: 'Intercaladas' },
  ],
  hints: [
    'Compare os dois heads: o menor é, com certeza, o primeiro da resposta.',
    'Criar o head da resposta é chato (qual lista?). Use um nó **dummy** (falso) no começo e um ponteiro `tail` que vai costurando.',
    'Quando uma lista acabar, basta apontar `tail.next` para o que sobrou da outra.',
  ],
  explanation: {
    intuition: `
É o passo de "merge" do merge sort, só que com nós. Mantemos um ponteiro em cada lista e sempre costuramos o **menor** dos dois no fim da resposta.

O truque do **nó dummy**: criamos \`new ListNode(0)\` como "âncora". Assim não precisamos de um \`if\` especial para o primeiro nó; a resposta é \`dummy.next\`.
`,
    steps: [
      '`dummy = new ListNode(0)`, `tail = dummy`.',
      'Enquanto as duas listas têm nós: ligue `tail.next` ao menor, avance aquela lista e avance `tail`.',
      'Ligue `tail.next` ao que sobrou (`list1 ?? list2`).',
      'Retorne `dummy.next`.',
    ],
    time: 'O(n + m)',
    space: 'O(1)',
    complexityWhy: 'Cada nó é costurado uma vez; não criamos nós novos (fora o dummy).',
    pitfalls: ['Esquecer de anexar o resto da lista que não acabou.', 'Retornar `dummy` em vez de `dummy.next`.', 'Esquecer de avançar `tail`.'],
  },
  solution: {
    js: `function mergeTwoLists(list1, list2) {
  const dummy = new ListNode(0);
  let tail = dummy;
  while (list1 && list2) {
    if (list1.val <= list2.val) {
      tail.next = list1;
      list1 = list1.next;
    } else {
      tail.next = list2;
      list2 = list2.next;
    }
    tail = tail.next;
  }
  tail.next = list1 ?? list2;
  return dummy.next;
}
`,
    ts: `function mergeTwoLists(list1: ListNode | null, list2: ListNode | null): ListNode | null {
  const dummy = new ListNode(0);
  let tail = dummy;
  while (list1 && list2) {
    if (list1.val <= list2.val) {
      tail.next = list1;
      list1 = list1.next;
    } else {
      tail.next = list2;
      list2 = list2.next;
    }
    tail = tail.next;
  }
  tail.next = list1 ?? list2;
  return dummy.next;
}
`,
  },
}

export const linkedListCycle: Problem = {
  id: 'linked-list-cycle',
  title: 'Linked List Cycle',
  difficulty: 'Fácil',
  pattern: 'linked-list',
  leetcode: { number: 141, slug: 'linked-list-cycle' },
  fnName: 'hasCycle',
  params: ['head'],
  io: { args: ['cycleList'] },
  description: `
Dado \`head\`, determine se a lista ligada tem um **ciclo**: algum nó cujo \`next\` aponta para um nó anterior, fazendo a lista nunca chegar em \`null\`.

Nos testes, \`pos\` indica o índice do nó para onde o **último** nó aponta (\`-1\` = sem ciclo). \`pos\` **não** é passado para a sua função.

**Desafio:** O(1) de memória.
`,
  examples: [
    { input: 'head = [3,2,0,-4], pos = 1', output: 'true', explanation: 'O último nó (-4) aponta para o nó de índice 1 (2).' },
    { input: 'head = [1,2], pos = 0', output: 'true' },
    { input: 'head = [1], pos = -1', output: 'false' },
  ],
  constraints: ['0 <= número de nós <= 10^4', 'pos é -1 ou um índice válido'],
  starter: {
    js: `/**
${LIST_DOC_JS}
 * @param {ListNode | null} head
 * @return {boolean}
 */
function hasCycle(head) {

}
`,
    ts: `${LIST_DOC_TS}function hasCycle(head: ListNode | null): boolean {

}
`,
  },
  tests: [
    { input: [[[3, 2, 0, -4], 1]], expected: true, label: 'Exemplo 1' },
    { input: [[[1, 2], 0]], expected: true, label: 'Exemplo 2' },
    { input: [[[1], -1]], expected: false, label: 'Exemplo 3' },
    { input: [[[], -1]], expected: false, label: 'Lista vazia' },
    { input: [[[1, 2, 3, 4, 5, 6], -1]], expected: false, label: 'Longa sem ciclo' },
    { input: [[[1], 0]], expected: true, label: 'Nó apontando para si mesmo' },
  ],
  hints: [
    'Jeito fácil: guardar os nós visitados num `Set`. Se encontrar um repetido, tem ciclo. Funciona, mas usa O(n) de memória.',
    'Pense em dois corredores numa pista: um anda 1 passo, o outro 2. Se a pista for circular, o que acontece?',
    'Ponteiros `slow` e `fast` (algoritmo de Floyd). Se `fast` chegar em `null`, não há ciclo. Se `slow === fast`, há.',
  ],
  explanation: {
    intuition: `
**Tartaruga e lebre (Floyd):** \`slow\` anda 1 nó por vez, \`fast\` anda 2.

- Sem ciclo, \`fast\` chega no fim (\`null\`) primeiro.
- Com ciclo, os dois ficam presos dando voltas, e a cada passo a distância entre eles diminui 1. Uma hora \`fast\` **alcança** \`slow\`.

Comparamos **referências** (\`slow === fast\`), não valores: valores podem se repetir.
`,
    steps: ['`slow = fast = head`.', 'Enquanto `fast && fast.next`: `slow = slow.next`, `fast = fast.next.next`.', 'Se `slow === fast`, retorne `true`.', 'Saiu do loop: retorne `false`.'],
    time: 'O(n)',
    space: 'O(1)',
    complexityWhy: 'Dentro do ciclo, fast diminui a distância para slow em 1 a cada passo: encontram-se em no máximo n passos.',
    pitfalls: ['Comparar `slow.val === fast.val`: valores repetidos dão falso positivo.', 'Checar só `fast.next.next` sem antes checar `fast.next`: TypeError no fim da lista.'],
  },
  bruteForce: { idea: 'Guardar cada nó visitado num Set.', complexity: 'O(n) tempo, O(n) espaço' },
  solution: {
    js: `function hasCycle(head) {
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}
`,
    ts: `function hasCycle(head: ListNode | null): boolean {
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow!.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}
`,
  },
}

export const removeNthFromEnd: Problem = {
  id: 'remove-nth-from-end',
  title: 'Remove Nth Node From End of List',
  difficulty: 'Médio',
  pattern: 'linked-list',
  leetcode: { number: 19, slug: 'remove-nth-node-from-end-of-list' },
  fnName: 'removeNthFromEnd',
  params: ['head', 'n'],
  io: { args: ['list', 'raw'], ret: 'list' },
  description: `
Dado o \`head\` de uma lista ligada, **remova o n-ésimo nó a partir do fim** e retorne o head.

**Desafio:** faça em **uma passada**.
`,
  examples: [
    { input: 'head = [1,2,3,4,5], n = 2', output: '[1,2,3,5]', explanation: 'O 2º a partir do fim é o 4.' },
    { input: 'head = [1], n = 1', output: '[]' },
    { input: 'head = [1,2], n = 1', output: '[1]' },
  ],
  constraints: ['1 <= tamanho <= 30', '1 <= n <= tamanho'],
  starter: {
    js: `/**
${LIST_DOC_JS}
 * @param {ListNode | null} head
 * @param {number} n
 * @return {ListNode | null}
 */
function removeNthFromEnd(head, n) {

}
`,
    ts: `${LIST_DOC_TS}function removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {

}
`,
  },
  tests: [
    { input: [[1, 2, 3, 4, 5], 2], expected: [1, 2, 3, 5], label: 'Exemplo 1' },
    { input: [[1], 1], expected: [], label: 'Remove o único nó' },
    { input: [[1, 2], 1], expected: [1], label: 'Remove o último' },
    { input: [[1, 2], 2], expected: [2], label: 'Remove o head' },
    { input: [[10, 20, 30, 40], 4], expected: [20, 30, 40], label: 'Remove o head (lista maior)' },
  ],
  hints: [
    'Duas passadas: conte o tamanho L e remova o nó L - n. Dá para fazer em uma?',
    'Se um ponteiro `fast` estiver **n nós à frente** de `slow`, quando `fast` chegar no fim, onde estará `slow`?',
    'Comece os dois num nó **dummy** antes do head (assim remover o head não é caso especial). Avance `fast` n + 1 vezes, depois ande os dois juntos. `slow.next` é o nó a remover.',
  ],
  explanation: {
    intuition: `
Mantemos uma **distância fixa** entre dois ponteiros. Se \`fast\` está n + 1 nós à frente de \`slow\`, quando \`fast\` cair no \`null\`, \`slow\` estará **exatamente antes** do nó a remover.

O **dummy** antes do head resolve o caso de remover o próprio head (n = tamanho).
`,
    steps: [
      '`dummy = new ListNode(0, head)`; `slow = fast = dummy`.',
      'Avance `fast` n + 1 vezes.',
      'Enquanto `fast`: avance os dois.',
      'Pule o nó: `slow.next = slow.next.next`. Retorne `dummy.next`.',
    ],
    time: 'O(L)',
    space: 'O(1)',
    complexityWhy: 'Uma passada com dois ponteiros.',
    pitfalls: ['Sem dummy, remover o head vira um `if` especial (e é fácil esquecer).', 'Erro de 1: avançar `fast` só n vezes faz `slow` parar **no** nó, e não antes dele.'],
  },
  solution: {
    js: `function removeNthFromEnd(head, n) {
  const dummy = new ListNode(0, head);
  let slow = dummy;
  let fast = dummy;
  for (let i = 0; i <= n; i++) fast = fast.next;
  while (fast) {
    slow = slow.next;
    fast = fast.next;
  }
  slow.next = slow.next.next;
  return dummy.next;
}
`,
    ts: `function removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {
  const dummy = new ListNode(0, head);
  let slow: ListNode = dummy;
  let fast: ListNode | null = dummy;
  for (let i = 0; i <= n; i++) fast = fast!.next;
  while (fast) {
    slow = slow.next!;
    fast = fast.next;
  }
  slow.next = slow.next!.next;
  return dummy.next;
}
`,
  },
}
