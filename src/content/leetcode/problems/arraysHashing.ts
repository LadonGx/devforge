import type { Problem } from '../../types'

// Obs.: os geradores de `perf` precisam ser autocontidos (são enviados como texto ao worker).

export const containsDuplicate: Problem = {
  id: 'contains-duplicate',
  title: 'Contains Duplicate',
  difficulty: 'Fácil',
  pattern: 'arrays-hashing',
  leetcode: { number: 217, slug: 'contains-duplicate' },
  fnName: 'containsDuplicate',
  params: ['nums'],
  description: `
Dado um array de inteiros \`nums\`, retorne \`true\` se **algum valor aparecer pelo menos duas vezes** e \`false\` se todos os elementos forem distintos.
`,
  examples: [
    { input: 'nums = [1, 2, 3, 1]', output: 'true', explanation: 'O 1 aparece nos índices 0 e 3.' },
    { input: 'nums = [1, 2, 3, 4]', output: 'false' },
    { input: 'nums = [1, 1, 1, 3, 3, 4, 3, 2, 4, 2]', output: 'true' },
  ],
  constraints: ['1 <= nums.length <= 10^5', '-10^9 <= nums[i] <= 10^9'],
  starter: {
    js: `/**
 * @param {number[]} nums
 * @return {boolean}
 */
function containsDuplicate(nums) {

}
`,
    ts: `function containsDuplicate(nums: number[]): boolean {

}
`,
  },
  tests: [
    { input: [[1, 2, 3, 1]], expected: true, label: 'Exemplo 1' },
    { input: [[1, 2, 3, 4]], expected: false, label: 'Exemplo 2' },
    { input: [[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]], expected: true, label: 'Exemplo 3' },
    { input: [[7]], expected: false, label: 'Um elemento só' },
    { input: [[-1, 0, -1]], expected: true, label: 'Negativos' },
    { input: [[0, 4, 5, 0, 3, 6]], expected: true, label: 'Zero repetido' },
    { input: [[1000000000, -1000000000]], expected: false, label: 'Valores extremos' },
  ],
  hints: [
    'A força bruta compara cada par (i, j): funciona, mas é O(n²). Para 10^5 elementos isso é ~5 bilhões de comparações.',
    'Você precisa responder rápido à pergunta "eu já vi esse número antes?". Qual estrutura responde isso em O(1)?',
    'Use um `Set`: percorra o array; se o número já está no Set, achou a duplicata. Senão, adicione e continue.',
  ],
  explanation: {
    intuition: `
O problema é, no fundo, **"já vi esse valor antes?"**. Comparar todo mundo com todo mundo (força bruta) responde isso, mas repete trabalho demais.

Um \`Set\` guarda valores únicos e responde \`has(x)\` em tempo **O(1)** em média (é uma tabela hash). Então basta uma passada: para cada número, pergunte ao Set se ele já está lá.
`,
    steps: [
      'Crie um `Set` vazio chamado `seen`.',
      'Percorra `nums`. Para cada `n`: se `seen.has(n)`, retorne `true` na hora (achou uma repetição).',
      'Caso contrário, `seen.add(n)` e siga.',
      'Se o loop terminar, nenhum valor se repetiu: retorne `false`.',
    ],
    time: 'O(n)',
    space: 'O(n)',
    complexityWhy: 'Cada elemento é visitado uma vez e as operações do Set são O(1) em média. No pior caso (sem duplicatas) o Set guarda os n elementos.',
    pitfalls: [
      'Usar `nums.indexOf(n) !== i` dentro de um loop: parece O(n), mas `indexOf` também percorre o array, então vira O(n²).',
      'Ordenar com `nums.sort()` sem comparador: o JS ordena como **string** (`[10, 9, 1]` vira `[1, 10, 9]`). Para números use `sort((a, b) => a - b)`.',
      'Alternativa de uma linha: `new Set(nums).size !== nums.length` — correta, mas não para cedo quando acha a duplicata.',
    ],
  },
  bruteForce: { idea: 'Dois loops aninhados comparando nums[i] com nums[j] para todo j > i.', complexity: 'O(n²) tempo, O(1) espaço' },
  solution: {
    js: `function containsDuplicate(nums) {
  const seen = new Set();
  for (const n of nums) {
    if (seen.has(n)) return true;
    seen.add(n);
  }
  return false;
}
`,
    ts: `function containsDuplicate(nums: number[]): boolean {
  const seen = new Set<number>();
  for (const n of nums) {
    if (seen.has(n)) return true;
    seen.add(n);
  }
  return false;
}
`,
  },
  perf: { gen: (n: number) => [Array.from({ length: n }, (_, i) => i)], n: 100000, limitMs: 2500, label: 'n = 100.000 sem duplicatas' },
}

export const validAnagram: Problem = {
  id: 'valid-anagram',
  title: 'Valid Anagram',
  difficulty: 'Fácil',
  pattern: 'arrays-hashing',
  leetcode: { number: 242, slug: 'valid-anagram' },
  fnName: 'isAnagram',
  params: ['s', 't'],
  description: `
Dadas duas strings \`s\` e \`t\`, retorne \`true\` se \`t\` for um **anagrama** de \`s\`, e \`false\` caso contrário.

Um anagrama usa **exatamente as mesmas letras, nas mesmas quantidades**, só que possivelmente em outra ordem.
`,
  examples: [
    { input: 's = "anagram", t = "nagaram"', output: 'true' },
    { input: 's = "rat", t = "car"', output: 'false' },
  ],
  constraints: ['1 <= s.length, t.length <= 5 * 10^4', 's e t têm apenas letras minúsculas'],
  starter: {
    js: `/**
 * @param {string} s
 * @param {string} t
 * @return {boolean}
 */
function isAnagram(s, t) {

}
`,
    ts: `function isAnagram(s: string, t: string): boolean {

}
`,
  },
  tests: [
    { input: ['anagram', 'nagaram'], expected: true, label: 'Exemplo 1' },
    { input: ['rat', 'car'], expected: false, label: 'Exemplo 2' },
    { input: ['a', 'ab'], expected: false, label: 'Tamanhos diferentes' },
    { input: ['aacc', 'ccac'], expected: false, label: 'Mesmas letras, quantidades diferentes' },
    { input: ['listen', 'silent'], expected: true, label: 'listen / silent' },
    { input: ['ab', 'ba'], expected: true, label: 'Curto' },
    { input: ['x', 'x'], expected: true, label: 'Iguais' },
  ],
  hints: [
    'Se os tamanhos forem diferentes, já dá para responder.',
    'Conte quantas vezes cada letra aparece em `s`. O que precisa ser verdade sobre as contagens de `t`?',
    'Use um `Map` (ou objeto) de contagem: some 1 para cada letra de `s` e subtraia 1 para cada letra de `t`. No fim, todas as contagens devem ser 0.',
  ],
  explanation: {
    intuition: `
Anagrama = **mesmo "saco" de letras**. A ordem não importa, só a **frequência** de cada letra.

Então montamos um contador: passamos por \`s\` somando e por \`t\` subtraindo. Se alguma letra ficar com saldo diferente de zero, não é anagrama.
`,
    steps: [
      'Se `s.length !== t.length`, retorne `false`.',
      'Crie um `Map` `count`.',
      'Para cada índice `i`: `count[s[i]] += 1` e `count[t[i]] -= 1`.',
      'Verifique se todos os valores do Map são 0.',
    ],
    time: 'O(n)',
    space: 'O(1)',
    complexityWhy: 'Uma passada pelas strings. O Map tem no máximo 26 chaves (letras minúsculas), então o espaço é constante.',
    pitfalls: [
      "Ordenar as duas strings (`[...s].sort().join('')`) funciona e é bem aceito, mas é O(n log n). Diga isso na entrevista!",
      'Esquecer de checar o tamanho primeiro: `"a"` e `"ab"` passariam em algumas implementações que só percorrem `s`.',
      'Usar objeto `{}` como contador: `count[c]` começa `undefined`; use `(count[c] ?? 0) + 1`.',
    ],
  },
  bruteForce: { idea: 'Ordenar as duas strings e comparar.', complexity: 'O(n log n) tempo' },
  solution: {
    js: `function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const count = new Map();
  for (let i = 0; i < s.length; i++) {
    count.set(s[i], (count.get(s[i]) ?? 0) + 1);
    count.set(t[i], (count.get(t[i]) ?? 0) - 1);
  }
  for (const c of count.values()) {
    if (c !== 0) return false;
  }
  return true;
}
`,
    ts: `function isAnagram(s: string, t: string): boolean {
  if (s.length !== t.length) return false;
  const count = new Map<string, number>();
  for (let i = 0; i < s.length; i++) {
    count.set(s[i], (count.get(s[i]) ?? 0) + 1);
    count.set(t[i], (count.get(t[i]) ?? 0) - 1);
  }
  for (const c of count.values()) {
    if (c !== 0) return false;
  }
  return true;
}
`,
  },
  perf: {
    gen: (n: number) => {
      const a = Array.from({ length: n }, (_, i) => String.fromCharCode(97 + (i % 26)))
      return [a.join(''), a.reverse().join('')]
    },
    n: 50000,
    limitMs: 2500,
    label: 'strings com 50.000 letras',
  },
}

export const twoSum: Problem = {
  id: 'two-sum',
  title: 'Two Sum',
  difficulty: 'Fácil',
  pattern: 'arrays-hashing',
  leetcode: { number: 1, slug: 'two-sum' },
  fnName: 'twoSum',
  params: ['nums', 'target'],
  description: `
Dado um array de inteiros \`nums\` e um inteiro \`target\`, retorne os **índices** dos dois números que somados dão \`target\`.

- Existe **exatamente uma** resposta.
- Você não pode usar o mesmo elemento duas vezes.
- Pode retornar os índices em qualquer ordem.
`,
  examples: [
    { input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' },
    { input: 'nums = [3, 2, 4], target = 6', output: '[1, 2]' },
    { input: 'nums = [3, 3], target = 6', output: '[0, 1]' },
  ],
  constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i], target <= 10^9', 'Existe exatamente uma solução'],
  starter: {
    js: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {

}
`,
    ts: `function twoSum(nums: number[], target: number): number[] {

}
`,
  },
  compare: 'unordered',
  tests: [
    { input: [[2, 7, 11, 15], 9], expected: [0, 1], label: 'Exemplo 1' },
    { input: [[3, 2, 4], 6], expected: [1, 2], label: 'Exemplo 2 (não use o 3 duas vezes!)' },
    { input: [[3, 3], 6], expected: [0, 1], label: 'Exemplo 3 (valores repetidos)' },
    { input: [[-1, -2, -3, -4, -5], -8], expected: [2, 4], label: 'Negativos' },
    { input: [[0, 4, 3, 0], 0], expected: [0, 3], label: 'Zeros' },
    { input: [[1, 5, 9, 13, 2], 15], expected: [3, 4], label: 'Par no fim' },
  ],
  hints: [
    'Para cada número `x`, qual outro número você precisa encontrar? (pense em `target - x`)',
    'Procurar esse complemento com outro loop deixa O(n²). Como lembrar dos números que já passaram, junto com seus índices?',
    'Use um `Map` de `valor → índice`. Para cada `nums[i]`, primeiro verifique se o complemento já está no Map; só depois adicione `nums[i]`.',
  ],
  explanation: {
    intuition: `
Para cada número \`x\`, o par que você procura é exatamente \`target - x\` (o **complemento**).

A pergunta vira: **"já passei por esse complemento?"** — e um \`Map\` responde isso em O(1). Como precisamos devolver o **índice**, guardamos \`valor → índice\`.

O detalhe importante: **verifique antes de inserir**. Assim você nunca casa um número com ele mesmo (ex.: \`[3, 2, 4]\`, target 6: o 3 não pode virar par dele mesmo).
`,
    steps: [
      'Crie `seen = new Map()` (valor → índice).',
      'Para cada `i`: calcule `need = target - nums[i]`.',
      'Se `seen.has(need)`, a resposta é `[seen.get(need), i]`.',
      'Senão, registre `seen.set(nums[i], i)` e continue.',
    ],
    time: 'O(n)',
    space: 'O(n)',
    complexityWhy: 'Uma passada; cada consulta/inserção no Map é O(1) em média. O Map pode guardar até n elementos.',
    pitfalls: [
      'Inserir no Map **antes** de verificar: com `[3, 2, 4]` e target 6 você retornaria `[0, 0]`.',
      'Testar `if (seen.get(need))`: quando o índice guardado é **0**, isso é falsy! Use `seen.has(need)`.',
      'Usar objeto `{}` com chaves numéricas funciona, mas as chaves viram strings. `Map` é mais correto.',
    ],
  },
  bruteForce: { idea: 'Testar todos os pares (i, j) com j > i.', complexity: 'O(n²) tempo, O(1) espaço' },
  solution: {
    js: `function twoSum(nums, target) {
  const seen = new Map(); // valor -> índice
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}
`,
    ts: `function twoSum(nums: number[], target: number): number[] {
  const seen = new Map<number, number>(); // valor -> índice
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need)!, i];
    seen.set(nums[i], i);
  }
  return [];
}
`,
  },
  perf: {
    gen: (n: number) => [Array.from({ length: n }, (_, i) => i * 2), (n - 1) * 2 + (n - 2) * 2],
    n: 30000,
    limitMs: 2500,
    label: 'n = 30.000 com o par no final',
  },
}

export const groupAnagrams: Problem = {
  id: 'group-anagrams',
  title: 'Group Anagrams',
  difficulty: 'Médio',
  pattern: 'arrays-hashing',
  leetcode: { number: 49, slug: 'group-anagrams' },
  fnName: 'groupAnagrams',
  params: ['strs'],
  description: `
Dado um array de strings \`strs\`, **agrupe os anagramas**. Retorne um array de grupos (cada grupo é um array de strings). A ordem dos grupos e das palavras dentro de cada grupo não importa.
`,
  examples: [
    { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' },
    { input: 'strs = [""]', output: '[[""]]' },
    { input: 'strs = ["a"]', output: '[["a"]]' },
  ],
  constraints: ['1 <= strs.length <= 10^4', '0 <= strs[i].length <= 100', 'Apenas letras minúsculas'],
  starter: {
    js: `/**
 * @param {string[]} strs
 * @return {string[][]}
 */
function groupAnagrams(strs) {

}
`,
    ts: `function groupAnagrams(strs: string[]): string[][] {

}
`,
  },
  compare: 'unorderedNested',
  tests: [
    { input: [['eat', 'tea', 'tan', 'ate', 'nat', 'bat']], expected: [['bat'], ['nat', 'tan'], ['ate', 'eat', 'tea']], label: 'Exemplo 1' },
    { input: [['']], expected: [['']], label: 'String vazia' },
    { input: [['a']], expected: [['a']], label: 'Uma palavra' },
    { input: [['abc', 'bca', 'cab', 'xyz']], expected: [['abc', 'bca', 'cab'], ['xyz']], label: 'Grupo grande + sozinho' },
    { input: [['ab', 'ba', 'abb', 'bab']], expected: [['ab', 'ba'], ['abb', 'bab']], label: 'Mesmas letras, contagens diferentes' },
  ],
  hints: [
    'Duas palavras são anagramas se tiverem a mesma "assinatura". Que assinatura seria igual para "eat" e "tea"?',
    "Ordenar as letras é uma assinatura: `[...'eat'].sort().join('')` → `'aet'`.",
    'Use um `Map<assinatura, string[]>`: para cada palavra, calcule a chave e faça push no grupo. No fim, retorne `[...map.values()]`.',
  ],
  explanation: {
    intuition: `
Precisamos de uma **chave** que seja idêntica para todos os anagramas e diferente para o resto. Com ela, agrupar vira só "jogar cada palavra no balde certo" de um \`Map\`.

Duas chaves comuns:
- **letras ordenadas**: \`"tea" → "aet"\` (custa O(k log k) por palavra)
- **contagem de letras**: 26 contadores viram uma string \`"1#0#0#...#1"\` (O(k) por palavra)
`,
    steps: [
      'Crie `groups = new Map()`.',
      "Para cada palavra `w`: `key = [...w].sort().join('')`.",
      'Se a chave não existe, crie `[]`. Faça `push(w)`.',
      'Retorne `Array.from(groups.values())`.',
    ],
    time: 'O(n · k log k)',
    space: 'O(n · k)',
    complexityWhy: 'n palavras, cada uma de tamanho até k é ordenada. O Map guarda todas as palavras.',
    pitfalls: [
      'Usar o array `[...w].sort()` como chave do Map: arrays são comparados por **referência**, então nunca batem. Transforme em string com `join`.',
      "Usar `w.split('').sort()` sem `join` como chave de objeto vira `\"a,e,t\"` — funciona por acaso, mas entenda o porquê.",
    ],
  },
  solution: {
    js: `function groupAnagrams(strs) {
  const groups = new Map(); // assinatura -> palavras
  for (const w of strs) {
    const key = [...w].sort().join('');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(w);
  }
  return [...groups.values()];
}
`,
    ts: `function groupAnagrams(strs: string[]): string[][] {
  const groups = new Map<string, string[]>(); // assinatura -> palavras
  for (const w of strs) {
    const key = [...w].sort().join('');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(w);
  }
  return [...groups.values()];
}
`,
  },
  perf: {
    gen: (n: number) => [
      Array.from({ length: n }, (_, i) => {
        const w = 'abcdefghij' + String.fromCharCode(97 + (i % 26))
        const r = i % w.length
        return w.slice(r) + w.slice(0, r)
      }),
    ],
    n: 10000,
    limitMs: 3000,
    label: '10.000 palavras',
  },
}

export const topKFrequent: Problem = {
  id: 'top-k-frequent',
  title: 'Top K Frequent Elements',
  difficulty: 'Médio',
  pattern: 'arrays-hashing',
  leetcode: { number: 347, slug: 'top-k-frequent-elements' },
  fnName: 'topKFrequent',
  params: ['nums', 'k'],
  description: `
Dado um array de inteiros \`nums\` e um inteiro \`k\`, retorne os **\`k\` elementos mais frequentes**. A ordem da resposta não importa e a resposta é garantidamente única.

**Desafio:** consiga algo melhor que O(n log n).
`,
  examples: [
    { input: 'nums = [1,1,1,2,2,3], k = 2', output: '[1, 2]' },
    { input: 'nums = [1], k = 1', output: '[1]' },
  ],
  constraints: ['1 <= nums.length <= 10^5', 'k está entre 1 e o número de elementos distintos', 'A resposta é única'],
  starter: {
    js: `/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number[]}
 */
function topKFrequent(nums, k) {

}
`,
    ts: `function topKFrequent(nums: number[], k: number): number[] {

}
`,
  },
  compare: 'unordered',
  tests: [
    { input: [[1, 1, 1, 2, 2, 3], 2], expected: [1, 2], label: 'Exemplo 1' },
    { input: [[1], 1], expected: [1], label: 'Exemplo 2' },
    { input: [[4, 4, 4, 6, 6, 7, 7, 7, 7], 1], expected: [7], label: 'k = 1' },
    { input: [[-1, -1, 2, 2, 2, 3], 2], expected: [2, -1], label: 'Negativos' },
    { input: [[5, 3, 5, 3, 5, 9], 2], expected: [5, 3], label: 'Fora de ordem' },
  ],
  hints: [
    'Primeiro passo óbvio: contar a frequência de cada número com um `Map`.',
    'Ordenar as entradas por frequência resolve em O(n log n). Dá para evitar a ordenação?',
    '**Bucket sort**: uma frequência vai de 1 a n. Crie `buckets[f] = [números com frequência f]` e percorra de trás para frente até juntar k números.',
  ],
  explanation: {
    intuition: `
Dois passos: **contar** e depois **pegar os maiores**.

Contar é fácil com um \`Map\`. Para pegar os maiores sem ordenar, repare: a frequência de qualquer número está entre **1 e n**. Então podemos usar o índice de um array como "frequência" — isso é o **bucket sort**:

\`buckets[3] = [1]\`, \`buckets[2] = [2]\`, \`buckets[1] = [3]\`

Percorrendo os baldes do maior índice para o menor, os primeiros k números encontrados são a resposta.
`,
    steps: [
      'Conte: `freq.set(n, (freq.get(n) ?? 0) + 1)`.',
      'Crie `buckets` com `nums.length + 1` posições, cada uma um array.',
      'Para cada `[num, f]` do Map: `buckets[f].push(num)`.',
      'Percorra `buckets` de trás para frente adicionando números em `res` até `res.length === k`.',
    ],
    time: 'O(n)',
    space: 'O(n)',
    complexityWhy: 'Contagem O(n), distribuição nos baldes O(n) e varredura dos baldes O(n).',
    pitfalls: [
      '`new Array(n).fill([])` coloca o **mesmo array** em todas as posições! Use `Array.from({ length: n }, () => [])`.',
      'Ordenar com `sort((a, b) => b[1] - a[1])` é aceitável em entrevista, mas mencione o O(n log n) e ofereça o bucket sort.',
    ],
  },
  solution: {
    js: `function topKFrequent(nums, k) {
  const freq = new Map();
  for (const n of nums) freq.set(n, (freq.get(n) ?? 0) + 1);

  const buckets = Array.from({ length: nums.length + 1 }, () => []);
  for (const [num, f] of freq) buckets[f].push(num);

  const res = [];
  for (let f = buckets.length - 1; f > 0 && res.length < k; f--) {
    for (const num of buckets[f]) {
      res.push(num);
      if (res.length === k) break;
    }
  }
  return res;
}
`,
    ts: `function topKFrequent(nums: number[], k: number): number[] {
  const freq = new Map<number, number>();
  for (const n of nums) freq.set(n, (freq.get(n) ?? 0) + 1);

  const buckets: number[][] = Array.from({ length: nums.length + 1 }, () => []);
  for (const [num, f] of freq) buckets[f].push(num);

  const res: number[] = [];
  for (let f = buckets.length - 1; f > 0 && res.length < k; f--) {
    for (const num of buckets[f]) {
      res.push(num);
      if (res.length === k) break;
    }
  }
  return res;
}
`,
  },
  perf: { gen: (n: number) => [Array.from({ length: n }, (_, i) => (i * 7919) % 1000).concat(Array(5000).fill(-7)), 1], n: 100000, limitMs: 2500, label: 'n = 100.000' },
}
