import type { Pattern } from '../types'

export const PATTERNS: Pattern[] = [
  {
    id: 'arrays-hashing',
    title: 'Arrays & Hashing',
    short: 'Map e Set para trocar loops aninhados por consultas O(1).',
    summary: 'A base de quase tudo: usar Map/Set como "memória" para não repetir trabalho.',
    color: '#6ea8fe',
    problems: ['contains-duplicate', 'valid-anagram', 'two-sum', 'group-anagrams', 'top-k-frequent'],
    lesson: [
      {
        type: 'text',
        md: `
### A ideia central

Muitos problemas de array fazem a mesma pergunta várias vezes: **"já vi esse valor?"**, **"quantas vezes ele aparece?"**, **"em que índice ele está?"**.

Responder isso percorrendo o array de novo custa **O(n)** a cada pergunta, o que leva a **O(n²)** no total. Uma **tabela hash** (\`Map\`, \`Set\` ou objeto) responde em **O(1)** em média. Você troca um pouco de memória por muito tempo.
`,
      },
      {
        type: 'compare',
        left: {
          title: 'Força bruta: O(n²)',
          md: `
\`\`\`
for (let i = 0; i < n; i++)
  for (let j = i + 1; j < n; j++)
    if (nums[i] === nums[j]) ...
\`\`\`
Para n = 100.000 → ~5 bilhões de comparações.
`,
        },
        right: {
          title: 'Com hash: O(n)',
          md: `
\`\`\`
const seen = new Set();
for (const x of nums) {
  if (seen.has(x)) ...
  seen.add(x);
}
\`\`\`
Para n = 100.000 → 100.000 consultas.
`,
        },
      },
      {
        type: 'signals',
        title: 'Sinais no enunciado de que é esse padrão',
        items: [
          '"Existe duplicata?", "quantas vezes aparece?", "elementos mais frequentes"',
          '"Encontre dois números que somam X" (complemento: `target - x`)',
          '"Agrupe" itens que compartilham alguma característica (anagramas, mesma soma...)',
          'A solução óbvia tem dois `for` aninhados procurando algo',
        ],
      },
      {
        type: 'text',
        md: `
### Map, Set ou objeto?

- **\`Set\`**: só precisa saber *se* algo existe. \`add\`, \`has\`, \`delete\`.
- **\`Map\`**: precisa associar um valor (contagem, índice, lista). \`set\`, \`get\`, \`has\`. Aceita **qualquer tipo de chave** e mantém a ordem de inserção.
- **Objeto \`{}\`**: funciona, mas as chaves sempre viram **string** (\`obj[1]\` e \`obj['1']\` são a mesma coisa) e herda propriedades do protótipo. Em entrevista, prefira \`Map\`.
`,
      },
      {
        type: 'demo',
        title: 'Veja um contador de frequência sendo montado',
        caption: 'Avance os passos e observe a tabela do Map ganhando linhas (verde = nova, amarelo = alterada).',
        fnName: 'countFreq',
        input: [[3, 1, 3, 2, 1, 3]],
        code: `function countFreq(nums) {
  const freq = new Map();
  for (let i = 0; i < nums.length; i++) {
    const n = nums[i];
    freq.set(n, (freq.get(n) ?? 0) + 1);
  }
  return freq;
}
`,
      },
      {
        type: 'code',
        caption: 'Templates que você vai reutilizar',
        code: `// 1) "Já vi?"
const seen = new Set();
for (const x of nums) {
  if (seen.has(x)) { /* achou */ }
  seen.add(x);
}

// 2) Contagem de frequência
const freq = new Map();
for (const x of nums) freq.set(x, (freq.get(x) ?? 0) + 1);

// 3) Valor -> índice (complemento)
const idx = new Map();
for (let i = 0; i < nums.length; i++) {
  const need = target - nums[i];
  if (idx.has(need)) return [idx.get(need), i];
  idx.set(nums[i], i);
}

// 4) Agrupar por chave
const groups = new Map();
for (const item of items) {
  const key = makeKey(item); // precisa ser string/number!
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(item);
}`,
      },
      {
        type: 'callout',
        tone: 'warn',
        title: 'Pegadinhas clássicas em JS',
        md: `
- \`if (map.get(k))\` falha quando o valor guardado é \`0\`. Use \`map.has(k)\`.
- Arrays e objetos como chave de \`Map\` são comparados por **referência**: \`map.get([1,2])\` nunca acha \`[1,2]\` guardado antes. Converta para string.
- \`new Array(n).fill([])\` reaproveita o **mesmo** array em todas as posições.
`,
      },
      {
        type: 'callout',
        tone: 'tip',
        title: 'Na entrevista',
        md: 'Comece falando a força bruta e a complexidade dela. Depois diga: "posso trocar a busca interna por um Map, ficando O(n) de tempo e O(n) de espaço". Essa troca tempo × memória é exatamente o que o entrevistador quer ouvir.',
      },
    ],
  },
  {
    id: 'two-pointers',
    title: 'Two Pointers',
    short: 'Dois índices andando pelo array para eliminar candidatos a cada passo.',
    summary: 'Em arrays ordenados ou simétricos, dois índices substituem o loop aninhado.',
    color: '#f78c6c',
    problems: ['valid-palindrome', 'two-sum-ii', 'container-with-most-water'],
    lesson: [
      {
        type: 'text',
        md: `
### A ideia central

Em vez de testar **todos os pares** (O(n²)), você mantém dois índices — normalmente \`l\` no começo e \`r\` no fim — e a cada passo **move um deles** com base numa regra que garante que você não está descartando a resposta.

Cada passo elimina pelo menos uma posição, então o total é **O(n)**.
`,
      },
      {
        type: 'signals',
        title: 'Sinais no enunciado',
        items: [
          'O array está **ordenado** (ou você pode ordenar)',
          'Comparar o começo com o fim: **palíndromos**, inverter, espelhar',
          '"Par" ou "trio" que satisfaz uma soma em array ordenado',
          'Maximizar/minimizar algo que depende de duas posições (área, distância)',
          'Remover duplicatas / reorganizar **in-place** (ponteiro lento e rápido)',
        ],
      },
      {
        type: 'text',
        md: `
### Por que dá para descartar?

No Two Sum em array **ordenado**: se \`nums[l] + nums[r]\` é **menor** que o alvo, aumentar \`r\` é impossível (já está no maior). O único jeito de crescer a soma é **avançar \`l\`**. Se for **maior**, só diminuindo: **recue \`r\`**.

Essa justificativa ("por que posso descartar essa posição?") é o que separa decorar de entender. Treine dizer ela em voz alta.
`,
      },
      {
        type: 'demo',
        title: 'Par com soma 10 em array ordenado',
        caption: 'Repare nos ponteiros l e r embaixo do array e na faixa azul entre eles: o espaço de busca encolhendo.',
        fnName: 'pairSum',
        input: [[1, 3, 4, 6, 8, 11], 10],
        code: `function pairSum(nums, target) {
  let l = 0;
  let r = nums.length - 1;
  while (l < r) {
    const sum = nums[l] + nums[r];
    if (sum === target) return [l, r];
    if (sum < target) l++;
    else r--;
  }
  return [];
}
`,
      },
      {
        type: 'code',
        caption: 'Templates',
        code: `// 1) Pontas convergindo (ordenado / palíndromo)
let l = 0, r = arr.length - 1;
while (l < r) {
  if (/* condição achada */) return ...;
  if (/* preciso de mais */) l++;
  else r--;
}

// 2) Lento e rápido (in-place)
let slow = 0;
for (let fast = 0; fast < arr.length; fast++) {
  if (/* arr[fast] deve ficar */) {
    arr[slow] = arr[fast];
    slow++;
  }
}
return slow; // novo tamanho`,
      },
      {
        type: 'callout',
        tone: 'warn',
        title: 'Cuidados',
        md: `
- \`while (l < r)\` vs \`while (l <= r)\`: em pares, \`l < r\` evita usar o mesmo elemento duas vezes.
- Sempre **mova pelo menos um ponteiro** em cada iteração, senão é loop infinito.
- Se o array não estiver ordenado e você ordenar, os **índices originais se perdem**.
`,
      },
    ],
  },
  {
    id: 'sliding-window',
    title: 'Sliding Window',
    short: 'Uma janela [l, r] que cresce e encolhe sobre o array/string.',
    summary: 'Para subarrays/substrings contíguos: reaproveita o cálculo da janela anterior.',
    color: '#3fb950',
    problems: ['best-time-stock', 'longest-substring', 'char-replacement'],
    lesson: [
      {
        type: 'text',
        md: `
### A ideia central

Quando a pergunta é sobre um **trecho contíguo** (subarray, substring), recalcular cada trecho do zero custa O(n²) ou pior. A **janela deslizante** mantém um trecho \`[l, r]\` e o estado dele (soma, contagem de letras, etc.):

- **expande**: \`r++\` e adiciona \`arr[r]\` ao estado
- **encolhe**: enquanto a janela estiver **inválida**, remove \`arr[l]\` do estado e faz \`l++\`

Cada índice entra e sai da janela no máximo uma vez → **O(n)**.
`,
      },
      {
        type: 'signals',
        title: 'Sinais no enunciado',
        items: [
          '"Maior/menor **substring** ou **subarray** que..."',
          '"Contíguo", "consecutivo", "janela de tamanho k"',
          'Restrição que pode ser checada incrementalmente (soma ≤ X, sem repetidos, no máximo k trocas)',
        ],
      },
      {
        type: 'demo',
        title: 'Menor subarray com soma ≥ 7',
        caption: 'A faixa azul é a janela [l, r]. Veja r avançar sempre e l avançar só quando a janela já é válida e dá para encolher.',
        fnName: 'minSubArrayLen',
        input: [7, [2, 3, 1, 2, 4, 3]],
        code: `function minSubArrayLen(target, nums) {
  let l = 0;
  let sum = 0;
  let best = Infinity;
  for (let r = 0; r < nums.length; r++) {
    sum += nums[r];
    while (sum >= target) {
      best = Math.min(best, r - l + 1);
      sum -= nums[l];
      l++;
    }
  }
  return best === Infinity ? 0 : best;
}
`,
      },
      {
        type: 'code',
        caption: 'Template da janela variável',
        code: `let l = 0;
let best = 0;
// estado da janela: soma, Map de contagem, Set...
for (let r = 0; r < arr.length; r++) {
  // 1) adiciona arr[r] ao estado
  while (/* janela inválida */) {
    // 2) remove arr[l] do estado
    l++;
  }
  // 3) janela [l, r] é válida: atualiza a resposta
  best = Math.max(best, r - l + 1);
}`,
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'Tamanho da janela',
        md: 'O tamanho de `[l, r]` (inclusivo) é `r - l + 1`. Errar esse +1 é o bug mais comum desse padrão.',
      },
    ],
  },
  {
    id: 'stack',
    title: 'Stack',
    short: 'LIFO: o último que entra é o primeiro que sai.',
    summary: 'Para pares que se fecham, expressões e "próximo maior elemento" (pilha monotônica).',
    color: '#c792ea',
    problems: ['valid-parentheses', 'eval-rpn', 'daily-temperatures'],
    lesson: [
      {
        type: 'text',
        md: `
### A ideia central

Uma pilha (**LIFO**) guarda coisas "pendentes" e devolve sempre a **mais recente**. Em JS, um array já é uma pilha: \`push\` coloca no topo, \`pop\` tira do topo, \`stack[stack.length - 1]\` (ou \`stack.at(-1)\`) espia o topo. Todas O(1).

Ela aparece quando o problema tem **aninhamento** ou quando um elemento novo **resolve** elementos antigos pendentes.
`,
      },
      {
        type: 'signals',
        title: 'Sinais no enunciado',
        items: [
          'Parênteses/tags que **abrem e fecham** (aninhamento)',
          'Avaliar expressões, desfazer ações (undo), navegar (voltar)',
          '"Próximo elemento maior/menor", "quantos dias até..." → **pilha monotônica**',
          'Remover pares adjacentes que se anulam',
        ],
      },
      {
        type: 'demo',
        title: 'Removendo duplicatas adjacentes',
        caption: 'Cada letra igual ao topo da pilha "anula" o topo. A pilha está desenhada na vertical, com o topo em cima.',
        fnName: 'removeDuplicates',
        input: ['abbaca'],
        code: `function removeDuplicates(s) {
  const stack = [];
  for (const ch of s) {
    if (stack.length && stack[stack.length - 1] === ch) {
      stack.pop();
    } else {
      stack.push(ch);
    }
  }
  return stack.join('');
}
`,
      },
      {
        type: 'code',
        caption: 'Templates',
        code: `// 1) Pares que fecham
const stack = [];
for (const ch of s) {
  if (abre(ch)) stack.push(ch);
  else if (stack.pop() !== par(ch)) return false;
}
return stack.length === 0;

// 2) Pilha monotônica (próximo maior)
const res = new Array(n).fill(0);
const stack = []; // guarda ÍNDICES pendentes
for (let i = 0; i < n; i++) {
  while (stack.length && nums[i] > nums[stack.at(-1)]) {
    const j = stack.pop();
    res[j] = i - j; // i resolveu o pendente j
  }
  stack.push(i);
}`,
      },
      {
        type: 'callout',
        tone: 'warn',
        title: 'Cuidados',
        md: `
- \`[].pop()\` retorna \`undefined\` (não lança erro). Verifique se a pilha está vazia quando isso importar.
- No fim, a pilha precisa estar vazia? (parênteses: sim!)
- \`shift()\`/\`unshift()\` são O(n): para pilha use só \`push\`/\`pop\`.
`,
      },
    ],
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    short: 'Corta o espaço de busca pela metade a cada passo: O(log n).',
    summary: 'Em dados ordenados — ou em qualquer resposta "monotônica" — descarta metade por vez.',
    color: '#e3a008',
    problems: ['binary-search', 'search-2d-matrix', 'koko-bananas'],
    lesson: [
      {
        type: 'text',
        md: `
### A ideia central

Se os dados estão **ordenados**, olhar o elemento do **meio** diz em qual metade a resposta está. Você descarta a outra metade inteira. Com n = 1.000.000, são no máximo **20 passos** (log₂ 10⁶ ≈ 20).

O padrão vai além de arrays: sempre que existe uma função **monotônica** ("se x funciona, qualquer valor maior também funciona"), dá para fazer binary search **na resposta** (ex.: Koko Eating Bananas).
`,
      },
      {
        type: 'signals',
        title: 'Sinais no enunciado',
        items: [
          'Array **ordenado** e "encontre X" / "posição de inserção"',
          'Pedem **O(log n)**',
          '"Qual o **menor** valor que satisfaz...?" / "o **maior** que ainda funciona" → busca na resposta',
          'Matriz ordenada linha a linha',
        ],
      },
      {
        type: 'demo',
        title: 'Procurando o 9',
        caption: 'A faixa azul é o intervalo [lo, hi] que ainda pode conter a resposta. Veja ele cair pela metade a cada passo.',
        fnName: 'search',
        input: [[-1, 0, 3, 5, 9, 12, 15, 20], 9],
        code: `function search(nums, target) {
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
      {
        type: 'code',
        caption: 'Templates',
        code: `// 1) Achar um valor exato
let lo = 0, hi = n - 1;
while (lo <= hi) {
  const mid = Math.floor((lo + hi) / 2);
  if (arr[mid] === target) return mid;
  if (arr[mid] < target) lo = mid + 1;
  else hi = mid - 1;
}
return -1;

// 2) Menor valor que satisfaz ok(x) (busca na resposta)
let lo = MIN, hi = MAX;
while (lo < hi) {
  const mid = Math.floor((lo + hi) / 2);
  if (ok(mid)) hi = mid;   // mid serve: tenta menor
  else lo = mid + 1;       // mid não serve: precisa maior
}
return lo;`,
      },
      {
        type: 'callout',
        tone: 'warn',
        title: 'Os bugs clássicos',
        md: `
- **Loop infinito**: no template 2, \`hi = mid\` com \`while (lo < hi)\` é seguro; já \`lo = mid\` (sem +1) trava quando \`hi = lo + 1\`.
- \`<=\` vs \`<\`: no template 1 o intervalo é fechado \`[lo, hi]\`, então \`lo <= hi\`.
- Em JS não existe divisão inteira: use \`Math.floor\` (ou \`(lo + hi) >> 1\`).
`,
      },
    ],
  },
]

export const patternById = (id: string) => PATTERNS.find((p) => p.id === id)
