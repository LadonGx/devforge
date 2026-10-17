import type { Problem } from '../../types'

export const bestTimeStock: Problem = {
  id: 'best-time-stock',
  title: 'Best Time to Buy and Sell Stock',
  difficulty: 'Fácil',
  pattern: 'sliding-window',
  leetcode: { number: 121, slug: 'best-time-to-buy-and-sell-stock' },
  fnName: 'maxProfit',
  params: ['prices'],
  description: `
\`prices[i]\` é o preço de uma ação no dia \`i\`. Você quer **comprar em um dia** e **vender em um dia futuro**.

Retorne o **maior lucro** possível. Se não der para lucrar, retorne \`0\`.
`,
  examples: [
    { input: 'prices = [7,1,5,3,6,4]', output: '5', explanation: 'Compra no dia 1 (preço 1), vende no dia 4 (preço 6): 6 - 1 = 5.' },
    { input: 'prices = [7,6,4,3,1]', output: '0', explanation: 'O preço só cai: não compre.' },
  ],
  constraints: ['1 <= prices.length <= 10^5', '0 <= prices[i] <= 10^4'],
  starter: {
    js: `/**
 * @param {number[]} prices
 * @return {number}
 */
function maxProfit(prices) {

}
`,
    ts: `function maxProfit(prices: number[]): number {

}
`,
  },
  tests: [
    { input: [[7, 1, 5, 3, 6, 4]], expected: 5, label: 'Exemplo 1' },
    { input: [[7, 6, 4, 3, 1]], expected: 0, label: 'Exemplo 2 (só cai)' },
    { input: [[1]], expected: 0, label: 'Um dia só' },
    { input: [[2, 4, 1]], expected: 2, label: 'Mínimo depois do máximo' },
    { input: [[3, 2, 6, 5, 0, 3]], expected: 4, label: 'Novo mínimo no meio' },
    { input: [[1, 2]], expected: 1, label: 'Dois dias' },
  ],
  hints: [
    'Não dá para vender antes de comprar. Para cada dia de venda, qual o melhor dia de compra?',
    'O melhor dia de compra é o **menor preço visto até agora**.',
    'Janela: `l` = dia de compra (mínimo até aqui), `r` = dia de venda. Se `prices[r] < prices[l]`, mova `l` para `r`.',
  ],
  explanation: {
    intuition: `
Para vender no dia \`r\`, o ideal é ter comprado no **dia mais barato antes de \`r\`**.

Pense numa janela \`[l, r]\`: \`l\` é o dia de compra e \`r\` o de venda. Avançamos \`r\` todo dia. Se encontrarmos um preço **menor** que \`prices[l]\`, não faz sentido manter a compra antiga: **pulamos \`l\` para \`r\`**.
`,
    steps: ['`l = 0`, `best = 0`.', 'Para `r` de 1 até n-1: se `prices[r] < prices[l]`, faça `l = r`.', 'Senão, `best = max(best, prices[r] - prices[l])`.'],
    time: 'O(n)',
    space: 'O(1)',
    complexityWhy: 'Uma passada pelos preços.',
    pitfalls: ['Pegar o mínimo global e o máximo global: o máximo pode vir **antes** do mínimo (`[2, 4, 1]`).', 'Retornar lucro negativo quando o preço só cai.'],
  },
  bruteForce: { idea: 'Para cada dia de compra i, testar todo dia de venda j > i.', complexity: 'O(n²)' },
  solution: {
    js: `function maxProfit(prices) {
  let l = 0; // dia de compra
  let best = 0;
  for (let r = 1; r < prices.length; r++) {
    if (prices[r] < prices[l]) {
      l = r; // achou compra mais barata
    } else {
      best = Math.max(best, prices[r] - prices[l]);
    }
  }
  return best;
}
`,
    ts: `function maxProfit(prices: number[]): number {
  let l = 0; // dia de compra
  let best = 0;
  for (let r = 1; r < prices.length; r++) {
    if (prices[r] < prices[l]) {
      l = r; // achou compra mais barata
    } else {
      best = Math.max(best, prices[r] - prices[l]);
    }
  }
  return best;
}
`,
  },
  perf: { gen: (n: number) => [Array.from({ length: n }, (_, i) => (i * 7919) % 10001)], n: 100000, limitMs: 2500, label: 'n = 100.000' },
}

export const longestSubstring: Problem = {
  id: 'longest-substring',
  title: 'Longest Substring Without Repeating Characters',
  difficulty: 'Médio',
  pattern: 'sliding-window',
  leetcode: { number: 3, slug: 'longest-substring-without-repeating-characters' },
  fnName: 'lengthOfLongestSubstring',
  params: ['s'],
  description: `
Dada uma string \`s\`, retorne o **tamanho da maior substring sem caracteres repetidos**.

Substring é um trecho **contíguo** (diferente de subsequência).
`,
  examples: [
    { input: 's = "abcabcbb"', output: '3', explanation: '"abc" tem tamanho 3.' },
    { input: 's = "bbbbb"', output: '1' },
    { input: 's = "pwwkew"', output: '3', explanation: '"wke". Note que "pwke" é subsequência, não substring.' },
  ],
  constraints: ['0 <= s.length <= 5 * 10^4', 'Letras, dígitos, símbolos e espaços'],
  starter: {
    js: `/**
 * @param {string} s
 * @return {number}
 */
function lengthOfLongestSubstring(s) {

}
`,
    ts: `function lengthOfLongestSubstring(s: string): number {

}
`,
  },
  tests: [
    { input: ['abcabcbb'], expected: 3, label: 'Exemplo 1' },
    { input: ['bbbbb'], expected: 1, label: 'Exemplo 2' },
    { input: ['pwwkew'], expected: 3, label: 'Exemplo 3' },
    { input: [''], expected: 0, label: 'String vazia' },
    { input: [' '], expected: 1, label: 'Espaço' },
    { input: ['dvdf'], expected: 3, label: 'dvdf (encolher só o necessário)' },
    { input: ['abba'], expected: 2, label: 'abba (l não pode voltar)' },
  ],
  hints: [
    'Mantenha uma janela `[l, r]` que **nunca** tem repetidos. Que estrutura diz rápido se um caractere já está na janela?',
    'Use um `Set` com os caracteres da janela. Ao entrar `s[r]` repetido, remova `s[l]` do Set e avance `l` até o repetido sair.',
    'A resposta é o maior `r - l + 1` visto.',
  ],
  explanation: {
    intuition: `
Janela variável clássica. A janela \`[l, r]\` é **válida** quando não tem repetidos, e um \`Set\` guarda o que está dentro dela.

- Expanda \`r\` sempre.
- Se \`s[r]\` já está no Set, a janela ficou inválida: **encolha pela esquerda** (remova \`s[l]\`, \`l++\`) até \`s[r]\` sair.
- Agora adicione \`s[r]\` e atualize o melhor tamanho.
`,
    steps: [
      '`l = 0`, `best = 0`, `window = new Set()`.',
      'Para cada `r`: enquanto `window.has(s[r])`, `window.delete(s[l])` e `l++`.',
      '`window.add(s[r])`; `best = max(best, r - l + 1)`.',
    ],
    time: 'O(n)',
    space: 'O(min(n, alfabeto))',
    complexityWhy: 'Cada caractere entra e sai do Set no máximo uma vez.',
    pitfalls: [
      'Recomeçar a janela do zero ao achar repetido (`l = r`): em `"dvdf"` perde a resposta `"vdf"`.',
      'Na versão com Map de última posição, esquecer o `Math.max` ao pular `l`: em `"abba"` o `l` voltaria para trás.',
    ],
  },
  solution: {
    js: `function lengthOfLongestSubstring(s) {
  const window = new Set();
  let l = 0;
  let best = 0;
  for (let r = 0; r < s.length; r++) {
    while (window.has(s[r])) {
      window.delete(s[l]);
      l++;
    }
    window.add(s[r]);
    best = Math.max(best, r - l + 1);
  }
  return best;
}
`,
    ts: `function lengthOfLongestSubstring(s: string): number {
  const window = new Set<string>();
  let l = 0;
  let best = 0;
  for (let r = 0; r < s.length; r++) {
    while (window.has(s[r])) {
      window.delete(s[l]);
      l++;
    }
    window.add(s[r]);
    best = Math.max(best, r - l + 1);
  }
  return best;
}
`,
  },
  perf: {
    gen: (n: number) => [Array.from({ length: n }, (_, i) => String.fromCharCode(33 + (i % 90))).join('')],
    n: 50000,
    limitMs: 2500,
    label: 'string com 50.000 caracteres',
  },
}

export const charReplacement: Problem = {
  id: 'char-replacement',
  title: 'Longest Repeating Character Replacement',
  difficulty: 'Médio',
  pattern: 'sliding-window',
  leetcode: { number: 424, slug: 'longest-repeating-character-replacement' },
  fnName: 'characterReplacement',
  params: ['s', 'k'],
  description: `
Você recebe uma string \`s\` (só letras **maiúsculas**) e um inteiro \`k\`. Você pode trocar **no máximo \`k\`** caracteres por qualquer outra letra maiúscula.

Retorne o tamanho da **maior substring com todas as letras iguais** que dá para obter.
`,
  examples: [
    { input: 's = "ABAB", k = 2', output: '4', explanation: 'Troque os dois A por B (ou vice-versa).' },
    { input: 's = "AABABBA", k = 1', output: '4', explanation: 'Troque o A do meio: "AABBBBA" → "BBBB".' },
  ],
  constraints: ['1 <= s.length <= 10^5', 's tem apenas letras maiúsculas', '0 <= k <= s.length'],
  starter: {
    js: `/**
 * @param {string} s
 * @param {number} k
 * @return {number}
 */
function characterReplacement(s, k) {

}
`,
    ts: `function characterReplacement(s: string, k: number): number {

}
`,
  },
  tests: [
    { input: ['ABAB', 2], expected: 4, label: 'Exemplo 1' },
    { input: ['AABABBA', 1], expected: 4, label: 'Exemplo 2' },
    { input: ['AAAA', 0], expected: 4, label: 'Já iguais' },
    { input: ['ABCDE', 0], expected: 1, label: 'k = 0' },
    { input: ['ABBB', 2], expected: 4, label: 'k sobrando' },
    { input: ['ABCABCAA', 2], expected: 5, label: 'Misturado' },
  ],
  hints: [
    'Para uma janela qualquer, quantas trocas são necessárias para deixá-la toda igual? (pense na letra mais frequente da janela)',
    'Trocas necessárias = `tamanho da janela - frequência da letra mais comum`. A janela é válida se isso for `<= k`.',
    'Mantenha um contador de letras da janela e `maxFreq`. Enquanto `(r - l + 1) - maxFreq > k`, encolha pela esquerda.',
  ],
  explanation: {
    intuition: `
Numa janela, a estratégia ótima é manter a letra **mais frequente** e trocar todas as outras. Então:

**trocas = tamanho - maxFreq**

A janela é válida se \`trocas <= k\`. Expandimos \`r\`, atualizamos a contagem e, se ficar inválida, encolhemos \`l\`.

Truque fino: \`maxFreq\` **não precisa diminuir** quando encolhemos. Só uma janela com \`maxFreq\` maior pode bater o recorde, então um valor "velho" nunca gera resposta errada.
`,
    steps: [
      '`count = new Map()`, `l = 0`, `maxFreq = 0`, `best = 0`.',
      'Para cada `r`: incremente `count[s[r]]` e atualize `maxFreq`.',
      'Enquanto `(r - l + 1) - maxFreq > k`: decremente `count[s[l]]` e `l++`.',
      '`best = max(best, r - l + 1)`.',
    ],
    time: 'O(n)',
    space: 'O(26) = O(1)',
    complexityWhy: 'Cada índice entra e sai da janela uma vez; o contador tem no máximo 26 letras.',
    pitfalls: ['Testar cada letra de A a Z separadamente funciona (O(26·n)), mas explique por que a versão com `maxFreq` é suficiente.', 'Esquecer de decrementar a contagem ao encolher.'],
  },
  solution: {
    js: `function characterReplacement(s, k) {
  const count = new Map();
  let l = 0;
  let maxFreq = 0;
  let best = 0;
  for (let r = 0; r < s.length; r++) {
    count.set(s[r], (count.get(s[r]) ?? 0) + 1);
    maxFreq = Math.max(maxFreq, count.get(s[r]));
    while (r - l + 1 - maxFreq > k) {
      count.set(s[l], count.get(s[l]) - 1);
      l++;
    }
    best = Math.max(best, r - l + 1);
  }
  return best;
}
`,
    ts: `function characterReplacement(s: string, k: number): number {
  const count = new Map<string, number>();
  let l = 0;
  let maxFreq = 0;
  let best = 0;
  for (let r = 0; r < s.length; r++) {
    count.set(s[r], (count.get(s[r]) ?? 0) + 1);
    maxFreq = Math.max(maxFreq, count.get(s[r])!);
    while (r - l + 1 - maxFreq > k) {
      count.set(s[l], count.get(s[l])! - 1);
      l++;
    }
    best = Math.max(best, r - l + 1);
  }
  return best;
}
`,
  },
  perf: {
    gen: (n: number) => [Array.from({ length: n }, (_, i) => String.fromCharCode(65 + ((i * 7) % 26))).join(''), 50],
    n: 100000,
    limitMs: 2500,
    label: 'n = 100.000',
  },
}
