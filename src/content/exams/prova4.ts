import type { Exam } from '../types'
import { starter } from '../js/helpers'

const LIST_DOC_JS = ` * ListNode já está disponível (não precisa declarar):
 * class ListNode { constructor(val = 0, next = null) { this.val = val; this.next = next } }
 *`
const LIST_DOC_TS = `/*
 * ListNode já está disponível (não precisa declarar):
 * class ListNode { val: number; next: ListNode | null; constructor(val?, next?) }
 */
`
const TREE_DOC_JS = ` * TreeNode já está disponível (não precisa declarar):
 * class TreeNode { constructor(val = 0, left = null, right = null) { ... } }
 *`
const TREE_DOC_TS = `/*
 * TreeNode já está disponível (não precisa declarar):
 * class TreeNode { val: number; left: TreeNode | null; right: TreeNode | null }
 */
`

export const PROVA_4: Exam = {
  id: 'prova-4',
  title: 'Prova 4 · Classes, erros e recursão',
  stage: 'alem',
  summary: 'Classes e herança, tratamento de erros, recursão, e os padrões **Binary Search**, **Linked List** e **Trees**. Junta orientação a objetos e boas práticas de back-end com as estruturas que mais aparecem nos live codings.',
  minutes: 50,
  passPct: 70,
  questions: [
    {
      kind: 'choice',
      id: 'p4-new',
      topic: 'js-fundamentos:classes',
      prompt: 'O que o operador `new` faz ao executar `new Produto("Caneca", 30)`?',
      options: [
        'Cria um objeto vazio ligado a `Produto.prototype`, roda o `constructor` com `this` apontando para ele e devolve o objeto',
        'Copia todos os métodos da classe para dentro do objeto',
        'Cria uma variável global chamada Produto',
        'Chama o constructor sem `this`, como uma função comum',
      ],
      answer: 0,
      explain: 'Os métodos **não** são copiados: ficam no protótipo e são compartilhados por todas as instâncias. O objeto novo só tem os campos atribuídos no constructor (`this.nome = ...`).',
    },
    {
      kind: 'choice',
      id: 'p4-composicao',
      topic: 'js-fundamentos:classes',
      prompt: 'Num e-commerce, um `Pedido` precisa dos dados do `Cliente` que fez a compra. Qual modelagem é a mais adequada?',
      options: [
        'Composição: `Pedido` guarda uma referência ao `Cliente` (`this.cliente = cliente`)',
        'Herança: `class Pedido extends Cliente`',
        'Herança: `class Cliente extends Pedido`',
        'Copiar todos os campos do cliente para dentro de `Pedido` com nomes iguais',
      ],
      answer: 0,
      explain: 'Herança expressa "**é um**" (Gerente é um Funcionário). Um pedido **não é** um cliente: ele **tem** um cliente. Para "tem um", use composição. "Prefira composição a herança" é um princípio clássico de design.',
    },
    {
      kind: 'choice',
      id: 'p4-catch-vazio',
      topic: 'js-fundamentos:erros',
      prompt: 'Num code review você encontra `try { await salvar(pedido) } catch (e) {}`. Qual o problema?',
      options: [
        'O erro é engolido: o pedido pode não ter sido salvo e ninguém fica sabendo (nem o usuário, nem os logs)',
        'Nenhum: é a forma recomendada de evitar que o app quebre',
        'É erro de sintaxe: `catch` precisa ter código',
        'O `await` não funciona dentro de `try`',
      ],
      answer: 0,
      explain: 'Capture só onde dá para **fazer algo** (avisar o usuário, tentar de novo, registrar). No mínimo registre o erro; e se não sabe tratar, deixe-o subir até um tratador central.',
    },
    {
      kind: 'choice',
      id: 'p4-sem-base',
      topic: 'js-fundamentos:recursao',
      prompt: 'O que acontece se uma função recursiva **não tem caso base** (ou nunca chega nele)?',
      options: [
        'As chamadas se acumulam na pilha até o limite e o JS lança `RangeError: Maximum call stack size exceeded`',
        'O JS detecta e retorna `undefined`',
        'A função roda uma vez só',
        'Entra num loop infinito que nunca termina, sem erro',
      ],
      answer: 0,
      explain: 'Cada chamada ocupa espaço na **call stack** e fica esperando a de baixo responder. Sem caso base, a pilha estoura: o famoso **stack overflow**.',
    },
    {
      kind: 'choice',
      id: 'p4-binary',
      topic: 'leetcode:binary-search',
      prompt: 'A busca binária encontra um valor num array **ordenado** de 1 milhão de itens com, no máximo, cerca de quantas comparações?',
      options: ['~20', '~1.000', '~500.000', '~1.000.000'],
      answer: 0,
      explain: 'A cada passo o espaço de busca cai pela metade: log₂(1.000.000) ≈ 20. Isso é **O(log n)**, contra O(n) da busca linear.',
    },
    {
      kind: 'choice',
      id: 'p4-linked',
      topic: 'leetcode:linked-list',
      prompt: 'Qual a complexidade de **inverter uma lista ligada** de forma iterativa (com `prev`, `curr` e `next`)?',
      options: ['O(n) de tempo e O(1) de espaço', 'O(n²) de tempo e O(1) de espaço', 'O(n) de tempo e O(n) de espaço', 'O(log n) de tempo e O(1) de espaço'],
      answer: 0,
      explain: 'Uma passada pelos nós (O(n)), trocando ponteiros no lugar, com três variáveis auxiliares (O(1)). A versão recursiva também é O(n) de tempo, mas usa O(n) de pilha.',
    },
    {
      kind: 'choice',
      id: 'p4-tree-depth',
      topic: 'leetcode:trees',
      prompt: 'Num DFS recursivo em uma árvore binária, de que depende o espaço usado pela pilha de chamadas?',
      options: [
        'Da **altura** da árvore: O(log n) se balanceada, O(n) se for "torta"',
        'Do número total de nós, sempre O(n)',
        'É sempre O(1)',
        'Do número de folhas',
      ],
      answer: 0,
      explain: 'A pilha só guarda o caminho da raiz até o nó atual. Numa árvore balanceada isso é ~log n; numa árvore que vira praticamente uma lista, chega a n.',
    },
    {
      kind: 'output',
      id: 'p4-out-finally',
      topic: 'js-fundamentos:erros',
      code: `function f(x) {
  try {
    if (x < 0) throw new Error("negativo");
    console.log("ok", x);
    return "fim";
  } catch (e) {
    console.log("erro:", e.message);
    return "falhou";
  } finally {
    console.log("finally");
  }
}
console.log(f(1));
console.log(f(-1));`,
      expected: ['ok 1', 'finally', 'fim', 'erro: negativo', 'finally', 'falhou'],
      explain: 'O `finally` roda **antes** de a função devolver o valor, mesmo com `return` no `try` ou no `catch`. Por isso "finally" aparece antes de "fim" e de "falhou", que são impressos pelo `console.log` de fora.',
    },
    {
      kind: 'output',
      id: 'p4-out-recursao',
      topic: 'js-fundamentos:recursao',
      code: `function soma(n) {
  if (n === 0) return 0;
  return n + soma(n - 1);
}
function inverte(s) {
  if (s.length <= 1) return s;
  return inverte(s.slice(1)) + s[0];
}
console.log(soma(4));
console.log(inverte("abc"));`,
      expected: ['10', 'cba'],
      explain: '`soma(4) = 4 + 3 + 2 + 1 + 0 = 10`. `inverte("abc") = inverte("bc") + "a" = (inverte("c") + "b") + "a" = "cba"`.',
    },
    {
      kind: 'output',
      id: 'p4-out-classes',
      topic: 'js-fundamentos:classes',
      code: `class Animal {
  constructor(nome) { this.nome = nome; }
  falar() { return this.nome + " faz um som"; }
}
class Cachorro extends Animal {
  falar() { return this.nome + " late"; }
}
const rex = new Cachorro("Rex");
console.log(rex.falar());
console.log(rex instanceof Animal, typeof Cachorro);`,
      expected: ['Rex late', 'true function'],
      explain: '`Cachorro` herdou o constructor de `Animal` e **sobrescreveu** `falar` (polimorfismo). `rex` é instância das duas classes. E classes em JS são, por baixo, funções: `typeof` dá "function".',
    },
    {
      kind: 'output',
      id: 'p4-out-tipos-erro',
      topic: 'js-fundamentos:erros',
      code: `try { null.nome; } catch (e) { console.log(e instanceof TypeError, e.name); }
try { naoExiste(); } catch (e) { console.log(e.name); }
try { JSON.parse("{oops"); } catch (e) { console.log(e.name); }`,
      expected: ['true TypeError', 'ReferenceError', 'SyntaxError'],
      explain: 'Ler propriedade de `null` → **TypeError**. Usar um nome que não existe → **ReferenceError**. JSON mal formado → **SyntaxError**.',
    },
    {
      kind: 'code',
      id: 'p4-code-insert',
      topic: 'leetcode:binary-search',
      problem: {
        id: 'prova-search-insert',
        title: 'Posição de inserção',
        difficulty: 'Fácil',
        pattern: 'binary-search',
        leetcode: { number: 35, slug: 'search-insert-position' },
        fnName: 'searchInsert',
        params: ['nums', 'target'],
        description: `
A agenda guarda os horários ocupados (em minutos) num array **ordenado e sem repetidos**. Para encaixar um novo horário, você precisa da **posição** dele.

Escreva \`searchInsert(nums, target)\` que retorna o índice de \`target\` se ele existir, ou o índice onde ele **seria inserido** para manter a ordem. A solução precisa ser **O(log n)**.
`,
        examples: [
          { input: 'searchInsert([1, 3, 5, 6], 5)', output: '2' },
          { input: 'searchInsert([1, 3, 5, 6], 2)', output: '1' },
          { input: 'searchInsert([1, 3, 5, 6], 7)', output: '4' },
        ],
        constraints: ['0 <= nums.length <= 10^4', 'nums ordenado, sem repetidos'],
        starter: starter('function searchInsert(nums, target)', 'function searchInsert(nums: number[], target: number): number', '/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number}\n */'),
        tests: [
          { input: [[1, 3, 5, 6], 5], expected: 2, label: 'Existe' },
          { input: [[1, 3, 5, 6], 2], expected: 1, label: 'No meio' },
          { input: [[1, 3, 5, 6], 7], expected: 4, label: 'Depois do último' },
          { input: [[1, 3, 5, 6], 0], expected: 0, label: 'Antes do primeiro' },
          { input: [[], 3], expected: 0, label: 'Vazio' },
          { input: [[10], 10], expected: 0, label: 'Um elemento' },
        ],
        hints: ['Busca binária com `lo = 0`, `hi = nums.length - 1`.', 'Se o loop terminar sem achar, `lo` é exatamente a posição de inserção.'],
        explanation: {
          intuition: 'Na busca binária, quando o alvo não existe, os ponteiros se cruzam exatamente no ponto onde ele deveria estar: `lo` termina na primeira posição com valor maior que o alvo.',
          steps: ['`lo = 0, hi = n - 1`.', 'Enquanto `lo <= hi`: `mid`; se igual, retorne; se menor, `lo = mid + 1`; senão `hi = mid - 1`.', 'Retorne `lo`.'],
          time: 'O(log n)',
          space: 'O(1)',
          complexityWhy: 'Metade do intervalo descartada a cada passo.',
          pitfalls: ['Percorrer o array (O(n)): funciona, mas não é o que foi pedido.', 'Retornar `hi` ou `mid` no fim.'],
        },
        solution: {
          js: `function searchInsert(nums, target) {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return lo;
}
`,
          ts: `function searchInsert(nums: number[], target: number): number {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return lo;
}
`,
        },
      },
    },
    {
      kind: 'code',
      id: 'p4-code-remove',
      topic: 'leetcode:linked-list',
      problem: {
        id: 'prova-remove-elements',
        title: 'Remover nós com um valor',
        difficulty: 'Fácil',
        pattern: 'linked-list',
        leetcode: { number: 203, slug: 'remove-linked-list-elements' },
        fnName: 'removeElements',
        params: ['head', 'val'],
        io: { args: ['list', 'raw'], ret: 'list' },
        description: `
Dada a cabeça \`head\` de uma lista ligada e um inteiro \`val\`, remova **todos** os nós com \`node.val === val\` e retorne a nova cabeça.

Os testes mostram as listas como arrays (\`[1, 2, 6, 3]\` é \`1 → 2 → 6 → 3\`).
`,
        examples: [
          { input: 'head = [1, 2, 6, 3, 4, 5, 6], val = 6', output: '[1, 2, 3, 4, 5]' },
          { input: 'head = [7, 7, 7], val = 7', output: '[]' },
        ],
        constraints: ['0 <= nós <= 10^4'],
        starter: {
          js: `/**
${LIST_DOC_JS}
 * @param {ListNode | null} head
 * @param {number} val
 * @return {ListNode | null}
 */
function removeElements(head, val) {

}
`,
          ts: `${LIST_DOC_TS}function removeElements(head: ListNode | null, val: number): ListNode | null {

}
`,
        },
        tests: [
          { input: [[1, 2, 6, 3, 4, 5, 6], 6], expected: [1, 2, 3, 4, 5], label: 'Exemplo 1' },
          { input: [[7, 7, 7], 7], expected: [], label: 'Todos removidos' },
          { input: [[], 1], expected: [], label: 'Lista vazia' },
          { input: [[1, 2, 3], 9], expected: [1, 2, 3], label: 'Nada a remover' },
          { input: [[5, 1, 5, 5, 2, 5], 5], expected: [1, 2], label: 'Na cabeça, no meio e no fim' },
        ],
        hints: [
          'O caso chato é remover a **cabeça**. Um nó "sentinela" (`dummy = new ListNode(0, head)`) antes dela elimina esse caso especial.',
          'Com `curr` começando no dummy: se `curr.next.val === val`, pule o nó (`curr.next = curr.next.next`); senão avance `curr`.',
        ],
        explanation: {
          intuition: 'Para remover um nó numa lista ligada, você muda o `next` do nó **anterior**. O sentinela garante que até a cabeça tenha um "anterior", então o mesmo código serve para todos os casos.',
          steps: ['`dummy = new ListNode(0, head)`, `curr = dummy`.', 'Enquanto `curr.next`: se o valor bate, `curr.next = curr.next.next` (não avança); senão `curr = curr.next`.', 'Retorne `dummy.next`.'],
          time: 'O(n)',
          space: 'O(1)',
          complexityWhy: 'Uma passada, sem estruturas extras.',
          pitfalls: ['Avançar `curr` logo depois de remover (pula nós repetidos seguidos).', 'Esquecer de tratar a cabeça (retornar `head` original quando ela foi removida).'],
        },
        solution: {
          js: `function removeElements(head, val) {
  const dummy = new ListNode(0, head);
  let curr = dummy;
  while (curr.next) {
    if (curr.next.val === val) curr.next = curr.next.next;
    else curr = curr.next;
  }
  return dummy.next;
}
`,
          ts: `function removeElements(head: ListNode | null, val: number): ListNode | null {
  const dummy = new ListNode(0, head);
  let curr = dummy;
  while (curr.next) {
    if (curr.next.val === val) curr.next = curr.next.next;
    else curr = curr.next;
  }
  return dummy.next;
}
`,
        },
      },
    },
    {
      kind: 'code',
      id: 'p4-code-path-sum',
      topic: 'leetcode:trees',
      problem: {
        id: 'prova-path-sum',
        title: 'Caminho com a soma',
        difficulty: 'Fácil',
        pattern: 'trees',
        leetcode: { number: 112, slug: 'path-sum' },
        fnName: 'hasPathSum',
        params: ['root', 'target'],
        io: { args: ['tree', 'raw'] },
        description: `
Dada a raiz de uma árvore binária e um inteiro \`target\`, retorne \`true\` se existir um caminho **da raiz até uma folha** cuja soma dos valores seja \`target\`.

Uma **folha** é um nó sem filhos. Os testes mostram a árvore em ordem de nível (\`[5, 4, 8]\` = raiz 5, filhos 4 e 8).
`,
        examples: [
          { input: 'root = [5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1], target = 22', output: 'true', explanation: '5 → 4 → 11 → 2' },
          { input: 'root = [1, 2, 3], target = 5', output: 'false' },
        ],
        constraints: ['0 <= nós <= 5000'],
        starter: {
          js: `/**
${TREE_DOC_JS}
 * @param {TreeNode | null} root
 * @param {number} target
 * @return {boolean}
 */
function hasPathSum(root, target) {

}
`,
          ts: `${TREE_DOC_TS}function hasPathSum(root: TreeNode | null, target: number): boolean {

}
`,
        },
        tests: [
          { input: [[5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1], 22], expected: true, label: 'Exemplo 1' },
          { input: [[1, 2, 3], 5], expected: false, label: 'Exemplo 2' },
          { input: [[], 0], expected: false, label: 'Árvore vazia' },
          { input: [[1, 2], 1], expected: false, label: 'A raiz não é folha' },
          { input: [[-2, null, -3], -5], expected: true, label: 'Negativos' },
        ],
        hints: [
          'Vá **subtraindo** o valor de cada nó do alvo enquanto desce.',
          'Caso base: nó nulo → `false`. Numa folha, confira se o que sobrou é igual ao valor dela.',
          'Caso recursivo: `hasPathSum(root.left, resto) || hasPathSum(root.right, resto)`.',
        ],
        explanation: {
          intuition: 'Cada nó responde: "existe um caminho a partir de mim que soma `target`?". Ele subtrai o próprio valor e pergunta para os filhos. Só a folha responde de verdade, comparando o resto com o próprio valor.',
          steps: ['Se `!root`, `false`.', 'Se é folha, `return root.val === target`.', '`resto = target - root.val`; retorne a resposta da esquerda `||` da direita.'],
          time: 'O(n)',
          space: 'O(h)',
          complexityWhy: 'Visita cada nó no máximo uma vez; a pilha cresce até a altura h.',
          pitfalls: ['Considerar a raiz de `[1, 2]` como folha (ela tem filho).', 'Retornar `true` para árvore vazia com target 0.'],
        },
        solution: {
          js: `function hasPathSum(root, target) {
  if (!root) return false;
  if (!root.left && !root.right) return root.val === target;
  const resto = target - root.val;
  return hasPathSum(root.left, resto) || hasPathSum(root.right, resto);
}
`,
          ts: `function hasPathSum(root: TreeNode | null, target: number): boolean {
  if (!root) return false;
  if (!root.left && !root.right) return root.val === target;
  const resto = target - root.val;
  return hasPathSum(root.left, resto) || hasPathSum(root.right, resto);
}
`,
        },
      },
    },
    {
      kind: 'essay',
      id: 'p4-essay-erros-api',
      topic: 'js-fundamentos:erros',
      prompt: 'Entrevistador: **"Como você trataria os erros numa API REST em Node? Pense em dados inválidos, recurso não encontrado e um erro inesperado (o banco caiu)."**',
      model: `
Eu separaria **erros esperados** (de domínio) dos **inesperados**:

- Para os esperados, crio classes próprias que estendem \`Error\`, como \`ValidationError\` e \`NotFoundError\`, e lanço no ponto onde detecto o problema (validação no começo do caso de uso, com guard clauses).
- Um **tratador central** (middleware de erro no Express, ou exception filter no NestJS) converte cada tipo num status HTTP: validação → **400** com a mensagem para o cliente; não encontrado → **404**.
- Erros inesperados (banco fora, bug) viram **500** com uma mensagem genérica. O detalhe (mensagem e **stack trace**) vai para o **log**, nunca para a resposta, para não expor a estrutura interna.

Também evito \`catch\` vazio: capturo só onde consigo fazer algo útil (tentar de novo, usar fallback) e deixo o resto subir para o tratador central. Respostas de erro seguem um formato padrão (ex.: \`{ error: { code, message } }\`).
`,
      checklist: [
        'Separou erros esperados (validação, não encontrado) de inesperados',
        'Classes de erro próprias (ex.: `ValidationError extends Error`)',
        'Tratador central (middleware/filter) que converte em status HTTP',
        'Mapeou os status: 400, 404 e 500',
        'Não expor stack trace para o cliente; registrar em log',
        'Não engolir erros com catch vazio',
      ],
    },
    {
      kind: 'essay',
      id: 'p4-essay-recursao',
      topic: 'js-fundamentos:recursao',
      prompt: 'Entrevistador: **"Explique recursão para alguém que nunca programou. E quando você prefere um loop em vez de recursão?"**',
      model: `
Recursão é resolver um problema grande **resolvendo uma versão menor dele mesmo**, até chegar num caso tão simples que a resposta é imediata. Por exemplo: numa fila escura, para saber minha posição eu pergunto para quem está na frente "qual a sua posição?" e somo 1. Cada pessoa faz o mesmo, até a primeira, que sabe que é a número 1 (o **caso base**). A resposta volta pela fila.

Toda função recursiva precisa de um **caso base** (onde para) e de uma chamada com uma entrada **menor**, que se aproxima do caso base. Sem isso, as chamadas se acumulam na **pilha** até estourar (stack overflow).

Prefiro recursão quando o dado tem forma de **árvore** (pastas, árvores binárias, JSON aninhado, backtracking): o código fica mais simples. Prefiro **loop** quando é uma repetição linear (somar uma lista, contar até N) ou quando a profundidade pode ser muito grande, porque o loop não consome a pilha.
`,
      checklist: [
        'Explicou com uma analogia ou exemplo simples (problema menor do mesmo tipo)',
        'Mencionou o caso base',
        'Mencionou a pilha de chamadas / stack overflow',
        'Recursão para estruturas em árvore ou aninhadas',
        'Loop para repetição linear ou profundidade grande',
      ],
    },
  ],
}
