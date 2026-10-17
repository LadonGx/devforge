import type { Pattern } from '../types'

/** Parte 2 do roadmap: estruturas ligadas, heap, recursão e grafos. */
export const PATTERNS_2: Pattern[] = [
  {
    id: 'linked-list',
    title: 'Linked List',
    short: 'Nós ligados por referências: ponteiros prev/curr, dummy e slow/fast.',
    summary: 'Manipular referências sem perder o resto da lista: inverter, juntar, achar ciclos.',
    color: '#4dd0e1',
    problems: ['reverse-linked-list', 'merge-two-sorted-lists', 'linked-list-cycle', 'remove-nth-from-end'],
    lesson: [
      {
        type: 'text',
        md: `
### A ideia central

Uma **lista ligada** é uma corrente de objetos: cada nó guarda um valor (\`val\`) e uma **referência** para o próximo (\`next\`). O último aponta para \`null\`.

\`\`\`
head → [1|•] → [2|•] → [3|•] → null
\`\`\`

Diferente do array, **não existe índice**: para chegar no 3º nó você anda \`head.next.next\`. Em troca, inserir e remover no meio é O(1), desde que você já esteja no lugar certo.

Quase todo problema de lista ligada se resume a **mover referências na ordem certa** sem perder o resto da lista.
`,
      },
      {
        type: 'signals',
        title: 'Técnicas que aparecem o tempo todo',
        items: [
          '**prev / curr / next**: inverter ou reordenar nós (guarde o `next` antes de mexer!)',
          '**Nó dummy**: um nó falso antes do head, para não tratar o head como caso especial',
          '**slow / fast**: meio da lista, detectar ciclo, n-ésimo a partir do fim',
          '**Dois ponteiros em listas diferentes**: merge, interseção',
        ],
      },
      {
        type: 'demo',
        title: 'Achando o meio da lista com slow e fast',
        caption: 'fast anda 2 nós por vez, slow anda 1. Quando fast chega ao fim, slow está no meio. Os rótulos embaixo dos nós mostram para onde cada variável aponta.',
        fnName: 'middleNode',
        input: [[1, 2, 3, 4, 5, 6, 7]],
        io: { args: ['list'] },
        code: `function middleNode(head) {
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow;
}
`,
      },
      {
        type: 'code',
        caption: 'Templates',
        code: `// Percorrer
for (let node = head; node; node = node.next) { /* ... */ }

// Inverter (prev / curr / next)
let prev = null, curr = head;
while (curr) {
  const next = curr.next; // 1) guarda o resto
  curr.next = prev;       // 2) vira a seta
  prev = curr;            // 3) anda
  curr = next;
}

// Construir uma lista nova com dummy
const dummy = new ListNode(0);
let tail = dummy;
// ... tail.next = algumNo; tail = tail.next;
return dummy.next;

// slow / fast
let slow = head, fast = head;
while (fast && fast.next) {
  slow = slow.next;
  fast = fast.next.next;
}`,
      },
      {
        type: 'callout',
        tone: 'warn',
        title: 'Pegadinhas',
        md: `
- \`node.next.val\` quebra se \`node.next\` for \`null\`. Sempre cheque antes.
- Compare nós por **referência** (\`a === b\`), não por valor.
- Desenhe! Em entrevista, desenhar as caixas e setas antes de codar evita 90% dos bugs. (É o que o visualizador faz por você.)
`,
      },
    ],
  },
  {
    id: 'trees',
    title: 'Trees',
    short: 'DFS recursiva (pré/em/pós-ordem) e BFS por níveis.',
    summary: 'Cada nó é a raiz de uma árvore menor: a recursão aparece naturalmente.',
    color: '#82aaff',
    problems: ['invert-binary-tree', 'max-depth-binary-tree', 'level-order-traversal', 'validate-bst'],
    lesson: [
      {
        type: 'text',
        md: `
### A ideia central

Uma **árvore binária** é feita de nós com até dois filhos (\`left\` e \`right\`). O ponto-chave: **cada filho é a raiz de outra árvore**. Por isso quase toda solução tem a forma:

1. **Caso base**: \`if (!root) return ...\` (árvore vazia)
2. **Resolva os filhos** recursivamente
3. **Combine** as respostas no nó atual

Isso é **DFS** (busca em profundidade). Quando a pergunta é sobre **níveis** ("por camada", "menor profundidade", "visão da direita"), use **BFS** com uma fila.
`,
      },
      {
        type: 'signals',
        title: 'Qual travessia usar?',
        items: [
          '**Pré-ordem** (nó → esquerda → direita): copiar/serializar a árvore, passar informação de cima para baixo',
          '**Em ordem** (esquerda → nó → direita): numa **BST** visita os valores em ordem crescente',
          '**Pós-ordem** (esquerda → direita → nó): o nó depende da resposta dos filhos (altura, diâmetro)',
          '**BFS** (fila): níveis, menor caminho até uma folha',
        ],
      },
      {
        type: 'demo',
        title: 'Somando todos os nós (DFS pós-ordem)',
        caption: 'Veja a árvore de chamadas crescer e os valores voltando (→ soma). Na árvore desenhada, o nó roxo é o `root` da chamada atual.',
        fnName: 'sumTree',
        input: [[5, 3, 8, 1, 4, null, 9]],
        io: { args: ['tree'] },
        code: `function sumTree(root) {
  if (!root) return 0;
  const left = sumTree(root.left);
  const right = sumTree(root.right);
  return root.val + left + right;
}
`,
      },
      {
        type: 'code',
        caption: 'Templates',
        code: `// DFS recursiva
function dfs(node) {
  if (!node) return /* caso base */;
  const l = dfs(node.left);
  const r = dfs(node.right);
  return /* combina node.val, l, r */;
}

// BFS por níveis
const queue = [root];
while (queue.length) {
  const size = queue.length;      // nós deste nível
  for (let i = 0; i < size; i++) {
    const node = queue.shift();
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
}

// Passando informação para baixo (ex.: limites de uma BST)
function valid(node, min, max) {
  if (!node) return true;
  if (node.val <= min || node.val >= max) return false;
  return valid(node.left, min, node.val) && valid(node.right, node.val, max);
}`,
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'Formato dos testes',
        md: 'O LeetCode escreve árvores em **ordem de nível**: `[3,9,20,null,null,15,7]` lê a árvore linha a linha; `null` marca um filho que não existe. Aqui a entrada é convertida em `TreeNode` antes de chamar sua função, e a saída (se for árvore) é convertida de volta.',
      },
      {
        type: 'callout',
        tone: 'warn',
        title: 'Complexidade de espaço',
        md: 'A recursão usa a **pilha de chamadas**: O(h), onde h é a altura. Numa árvore balanceada h = log n; numa árvore "torta" (uma linha), h = n.',
      },
    ],
  },
  {
    id: 'heap',
    title: 'Heap / Priority Queue',
    short: 'Sempre o menor (ou maior) em O(1), inserção e remoção em O(log n).',
    summary: 'Para "os k maiores/menores", "sempre pegar o próximo melhor" e fluxos de dados.',
    color: '#ff6b9a',
    problems: ['kth-largest-stream', 'last-stone-weight', 'k-closest-points'],
    lesson: [
      {
        type: 'text',
        md: `
### A ideia central

Um **heap** é uma árvore binária quase completa com uma regra: **todo pai é menor que os filhos** (MinHeap) ou maior (MaxHeap). Resultado: o menor/maior está **sempre na raiz**.

- \`peek()\`: O(1)
- \`push(x)\`: O(log n) (sobe o elemento até o lugar certo)
- \`pop()\`: O(log n) (tira a raiz, põe o último no topo e desce)

O truque de implementação: a árvore é guardada num **array**. O nó \`i\` tem filhos em \`2i + 1\` e \`2i + 2\`, e pai em \`Math.floor((i - 1) / 2)\`.
`,
      },
      {
        type: 'signals',
        title: 'Sinais no enunciado',
        items: [
          '"**k** maiores / menores / mais frequentes / mais próximos"',
          '"Sempre pegue o maior/menor" repetidas vezes, com inserções no meio',
          'Fluxo de dados (stream): mediana, k-ésimo maior',
          'Juntar k listas ordenadas, agendar tarefas, Dijkstra',
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'Heap neste sistema (e no LeetCode)',
        md: `
JavaScript **não tem heap nativo**. O LeetCode oferece a biblioteca \`@datastructures-js/priority-queue\`; aqui você tem o equivalente:

\`\`\`
const h = new MinHeap();               // ou new MaxHeap()
const byDist = new MinHeap(p => p.d);  // ordena por uma chave
h.push(5); h.peek(); h.pop(); h.size(); h.isEmpty();
\`\`\`

Em algumas entrevistas pedem para **implementar** o heap: o template abaixo é tudo que você precisa.
`,
      },
      {
        type: 'demo',
        title: 'Os 3 menores com um MinHeap',
        caption: 'Veja o heap desenhado como árvore (a raiz é sempre o menor) e o array por trás dele.',
        fnName: 'kSmallest',
        input: [[7, 2, 9, 4, 1, 8], 3],
        code: `function kSmallest(nums, k) {
  const heap = new MinHeap();
  for (const n of nums) {
    heap.push(n);
  }
  const res = [];
  while (res.length < k) {
    res.push(heap.pop());
  }
  return res;
}
`,
      },
      {
        type: 'code',
        caption: 'Implementando um MinHeap do zero',
        code: `class MinHeap {
  constructor() { this.data = []; }
  size() { return this.data.length; }
  peek() { return this.data[0]; }

  push(x) {
    const d = this.data;
    d.push(x);
    let i = d.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;          // pai
      if (d[p] <= d[i]) break;
      [d[p], d[i]] = [d[i], d[p]];     // sobe
      i = p;
    }
  }

  pop() {
    const d = this.data;
    const top = d[0];
    const last = d.pop();
    if (d.length) {
      d[0] = last;
      let i = 0;
      while (true) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < d.length && d[l] < d[m]) m = l;
        if (r < d.length && d[r] < d[m]) m = r;
        if (m === i) break;
        [d[m], d[i]] = [d[i], d[m]];   // desce
        i = m;
      }
    }
    return top;
  }
}`,
      },
      {
        type: 'callout',
        tone: 'tip',
        title: 'O truque do "heap de tamanho k"',
        md: 'Para os **k maiores**, use um **MinHeap** limitado a k: quem está no topo é o "pior dos melhores" e sai quando chega alguém maior. Para os **k menores**, um **MaxHeap** de tamanho k. Isso dá O(n log k) em vez de O(n log n).',
      },
    ],
  },
  {
    id: 'backtracking',
    title: 'Backtracking',
    short: 'Explora uma árvore de decisões: escolhe, desce, desfaz.',
    summary: 'Gerar todas as combinações/permutações/caminhos válidos, podando o que não serve.',
    color: '#f78c6c',
    problems: ['subsets', 'permutations', 'combination-sum'],
    lesson: [
      {
        type: 'text',
        md: `
### A ideia central

Backtracking resolve problemas do tipo **"gere todas as possibilidades"**. Pense numa **árvore de decisões**: em cada nível você faz uma escolha, desce para a próxima, e quando volta **desfaz** a escolha para tentar outra.

\`\`\`
escolhe → explora (recursão) → desfaz
\`\`\`

O caminho atual fica num array \`path\` compartilhado. Quando o caminho está completo, salvamos uma **cópia** dele.
`,
      },
      {
        type: 'signals',
        title: 'Sinais no enunciado',
        items: [
          '"Retorne **todas** as combinações / permutações / subconjuntos / partições"',
          'Restrições pequenas (n ≤ 10 ou 20): a resposta é exponencial mesmo',
          'Tabuleiros: N-Rainhas, Sudoku, busca de palavras numa grade',
        ],
      },
      {
        type: 'demo',
        title: 'Combinações de 2 elementos de [1, 2, 3]',
        caption: 'Abra a árvore de chamadas: cada caixa é uma decisão. Repare no path crescendo (push) e encolhendo (pop) ao voltar.',
        fnName: 'combine',
        input: [[1, 2, 3], 2],
        code: `function combine(nums, k) {
  const res = [];
  const path = [];
  const dfs = (start) => {
    if (path.length === k) {
      res.push([...path]);
      return;
    }
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]); // escolhe
      dfs(i + 1);         // explora
      path.pop();         // desfaz
    }
  };
  dfs(0);
  return res;
}
`,
      },
      {
        type: 'code',
        caption: 'Template',
        code: `const res = [];
const path = [];

function dfs(estado) {
  if (/* path está completo */) {
    res.push([...path]);    // CÓPIA!
    return;
  }
  if (/* não tem como dar certo */) return; // poda

  for (const escolha of /* opções válidas */) {
    path.push(escolha);     // escolhe
    dfs(/* próximo estado */);
    path.pop();             // desfaz
  }
}`,
      },
      {
        type: 'callout',
        tone: 'warn',
        title: 'Os 3 erros clássicos',
        md: `
- \`res.push(path)\` sem copiar: no fim todos os resultados são o mesmo array (vazio).
- Esquecer o \`pop()\` (ou de desmarcar o \`used\`).
- Gerar duplicatas: controle **de onde** as escolhas começam (\`start\`) para combinações; use \`used\` para permutações.
`,
      },
    ],
  },
  {
    id: 'graphs',
    title: 'Graphs',
    short: 'Nós e arestas: DFS, BFS, componentes e ordenação topológica.',
    summary: 'Grades, dependências e redes: percorrer sem visitar o mesmo nó duas vezes.',
    color: '#3fb950',
    problems: ['number-of-islands', 'rotting-oranges', 'course-schedule'],
    lesson: [
      {
        type: 'text',
        md: `
### A ideia central

Um **grafo** é um conjunto de nós ligados por arestas. Árvores são um caso particular (sem ciclos). Em entrevistas o grafo costuma aparecer disfarçado:

- **Grade** (matriz): cada célula é um nó ligado às 4 vizinhas.
- **Lista de pares** (\`[a, b]\`): monte uma **lista de adjacência** \`graph[a] = [vizinhos]\`.

Para percorrer: **DFS** (recursão/pilha, vai fundo) ou **BFS** (fila, vai em camadas, acha o **menor caminho** em grafos sem peso). A regra de ouro: **marque como visitado** para não andar em círculos.
`,
      },
      {
        type: 'signals',
        title: 'Sinais no enunciado',
        items: [
          '"Ilhas", "regiões", "conectados" → componentes conectados (DFS/BFS)',
          '"Menor número de passos/minutos" → **BFS**',
          '"Pré-requisitos", "ordem de tarefas", "dependências" → **ordenação topológica**',
          'Grade com "vizinhos" nas 4 direções',
        ],
      },
      {
        type: 'demo',
        title: 'BFS numa grade: distância até cada célula',
        caption: 'A fila guarda a "onda" atual. Veja a matriz dist sendo preenchida em camadas a partir de (0,0); 1 é parede.',
        fnName: 'distances',
        input: [
          [
            [0, 0, 0],
            [1, 1, 0],
            [0, 0, 0],
          ],
        ],
        code: `function distances(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const dist = grid.map((row) => row.map(() => -1));
  dist[0][0] = 0;
  const queue = [[0, 0]];
  while (queue.length) {
    const [r, c] = queue.shift();
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
      if (grid[nr][nc] === 1 || dist[nr][nc] !== -1) continue;
      dist[nr][nc] = dist[r][c] + 1;
      queue.push([nr, nc]);
    }
  }
  return dist;
}
`,
      },
      {
        type: 'code',
        caption: 'Templates',
        code: `// Lista de adjacência a partir de pares
const graph = Array.from({ length: n }, () => []);
for (const [a, b] of edges) {
  graph[a].push(b);
  graph[b].push(a); // só se for não direcionado
}

// DFS com visitados
const seen = new Set();
function dfs(node) {
  if (seen.has(node)) return;
  seen.add(node);
  for (const nb of graph[node]) dfs(nb);
}

// BFS (menor caminho em passos)
const queue = [start];
const dist = new Map([[start, 0]]);
while (queue.length) {
  const node = queue.shift();
  for (const nb of graph[node]) {
    if (dist.has(nb)) continue;
    dist.set(nb, dist.get(node) + 1);
    queue.push(nb);
  }
}

// Vizinhos numa grade
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];`,
      },
      {
        type: 'callout',
        tone: 'warn',
        title: 'Cuidados',
        md: `
- Marque como visitado **ao enfileirar** (BFS), não ao desenfileirar: senão o mesmo nó entra várias vezes.
- Cheque os limites da grade **antes** de acessar \`grid[r][c]\`.
- Complexidade típica: **O(V + E)** (nós + arestas); numa grade, O(linhas × colunas).
`,
      },
    ],
  },
  {
    id: 'dp-1d',
    title: '1-D Dynamic Programming',
    short: 'Recursão + memória: cada subproblema é resolvido uma vez só.',
    summary: 'Quando a resposta de n depende das respostas de valores menores que se repetem.',
    color: '#c792ea',
    problems: ['climbing-stairs', 'house-robber', 'coin-change'],
    lesson: [
      {
        type: 'text',
        md: `
### A ideia central

**Programação dinâmica** serve para problemas em que:

1. a resposta pode ser montada a partir de **respostas de subproblemas menores**; e
2. os mesmos subproblemas **se repetem** muitas vezes.

A recursão ingênua recalcula tudo e explode (O(2ⁿ)). A DP guarda cada resposta e reaproveita. Para resolver qualquer DP, responda três perguntas:

- **Estado**: o que \`dp[i]\` significa? (ex.: "formas de chegar no degrau i")
- **Transição**: como \`dp[i]\` depende dos anteriores? (ex.: \`dp[i-1] + dp[i-2]\`)
- **Casos base**: os primeiros valores, que não dependem de ninguém.
`,
      },
      {
        type: 'compare',
        left: {
          title: 'Recursão pura: O(2ⁿ)',
          md: `
\`\`\`
fib(n) = fib(n-1) + fib(n-2)
\`\`\`
\`fib(40)\` faz ~330 milhões de chamadas.
`,
        },
        right: {
          title: 'Com memo: O(n)',
          md: `
\`\`\`
if (memo.has(n)) return memo.get(n);
\`\`\`
Cada \`fib(k)\` é calculado **uma** vez.
`,
        },
      },
      {
        type: 'demo',
        title: 'fib(6) com memoização',
        caption: 'Na árvore de chamadas, os galhos da direita retornam na hora: o valor já estava no memo. Sem memo essa árvore teria 25 chamadas.',
        fnName: 'fib',
        input: [6],
        code: `function fib(n, memo = new Map()) {
  if (n <= 1) return n;
  if (memo.has(n)) return memo.get(n);
  const result = fib(n - 1, memo) + fib(n - 2, memo);
  memo.set(n, result);
  return result;
}
`,
      },
      {
        type: 'signals',
        title: 'Sinais no enunciado',
        items: [
          '"De **quantas formas**...", "qual o **mínimo/máximo**...", "é **possível**..."',
          'Decisões em sequência (pegar ou não pegar, subir 1 ou 2)',
          'A força bruta é uma recursão com chamadas repetidas',
        ],
      },
      {
        type: 'code',
        caption: 'Top-down (memo) × Bottom-up (tabela)',
        code: `// Top-down: recursão + cache
const memo = new Map();
function solve(i) {
  if (/* caso base */) return /* ... */;
  if (memo.has(i)) return memo.get(i);
  const ans = /* combina solve(i - 1), solve(i - 2)... */;
  memo.set(i, ans);
  return ans;
}

// Bottom-up: preenche a tabela do menor para o maior
const dp = new Array(n + 1).fill(0);
dp[0] = /* base */;
for (let i = 1; i <= n; i++) {
  dp[i] = /* usa dp[i - 1], dp[i - 2]... */;
}
return dp[n];

// Se só usa os 2 últimos: troque o array por duas variáveis (O(1) de espaço)`,
      },
      {
        type: 'callout',
        tone: 'tip',
        title: 'Na entrevista',
        md: 'Comece pela recursão que você **entende** (mesmo exponencial), diga a complexidade, e então: "esses subproblemas se repetem, então vou memoizar". Depois, se der tempo, converta para bottom-up e reduza o espaço.',
      },
    ],
  },
]
