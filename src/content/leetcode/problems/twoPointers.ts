import type { Problem } from '../../types'

export const validPalindrome: Problem = {
  id: 'valid-palindrome',
  title: 'Valid Palindrome',
  difficulty: 'Fácil',
  pattern: 'two-pointers',
  leetcode: { number: 125, slug: 'valid-palindrome' },
  fnName: 'isPalindrome',
  params: ['s'],
  description: `
Uma frase é um **palíndromo** se, depois de converter tudo para minúsculas e **remover tudo que não for letra ou número**, ela for lida igual de trás para frente.

Dada uma string \`s\`, retorne \`true\` se ela for um palíndromo e \`false\` caso contrário.
`,
  examples: [
    { input: 's = "A man, a plan, a canal: Panama"', output: 'true', explanation: '"amanaplanacanalpanama" é palíndromo.' },
    { input: 's = "race a car"', output: 'false', explanation: '"raceacar" não é palíndromo.' },
    { input: 's = " "', output: 'true', explanation: 'Sem caracteres alfanuméricos sobra "", que é palíndromo.' },
  ],
  constraints: ['1 <= s.length <= 2 * 10^5', 's tem apenas caracteres ASCII imprimíveis'],
  starter: {
    js: `/**
 * @param {string} s
 * @return {boolean}
 */
function isPalindrome(s) {

}
`,
    ts: `function isPalindrome(s: string): boolean {

}
`,
  },
  tests: [
    { input: ['A man, a plan, a canal: Panama'], expected: true, label: 'Exemplo 1' },
    { input: ['race a car'], expected: false, label: 'Exemplo 2' },
    { input: [' '], expected: true, label: 'Só espaço' },
    { input: ['0P'], expected: false, label: 'Número e letra (pegadinha do 0 e P)' },
    { input: ['ab_a'], expected: true, label: 'Underscore não é alfanumérico' },
    { input: ['.,'], expected: true, label: 'Só pontuação' },
    { input: ['Was it a car or a cat I saw?'], expected: true, label: 'Frase longa' },
  ],
  hints: [
    'O jeito fácil: limpar a string e comparar com ela invertida. Funciona, mas usa O(n) de memória extra. Dá para fazer com O(1)?',
    'Use dois ponteiros: `l` no começo e `r` no fim. Pule os caracteres que não são alfanuméricos.',
    "Para checar se é alfanumérico: `/[a-z0-9]/i.test(ch)`. Compare `s[l].toLowerCase()` com `s[r].toLowerCase()`.",
  ],
  explanation: {
    intuition: `
Palíndromo = a primeira letra bate com a última, a segunda com a penúltima, e assim por diante. Isso é exatamente **dois ponteiros convergindo**.

A única complicação é **ignorar o lixo**: antes de comparar, cada ponteiro pula caracteres que não são letra/número.
`,
    steps: [
      '`l = 0`, `r = s.length - 1`.',
      'Enquanto `l < r`: avance `l` enquanto `s[l]` não for alfanumérico; recue `r` enquanto `s[r]` não for.',
      'Compare `s[l]` e `s[r]` em minúsculas. Se diferirem, retorne `false`.',
      '`l++`, `r--`. Se o loop terminar, retorne `true`.',
    ],
    time: 'O(n)',
    space: 'O(1)',
    complexityWhy: 'Cada caractere é visitado no máximo uma vez por um dos ponteiros; não criamos uma string nova.',
    pitfalls: [
      'Esquecer o `l < r` dentro dos loops internos de "pular": em `".,"` o ponteiro passa do fim.',
      'Usar `/\\w/` para alfanumérico: `\\w` inclui o `_`!',
      'Comparar sem `toLowerCase()`: "A" !== "a".',
    ],
  },
  bruteForce: { idea: "Limpar com regex, inverter (`[...t].reverse().join('')`) e comparar.", complexity: 'O(n) tempo, O(n) espaço' },
  solution: {
    js: `function isPalindrome(s) {
  const ok = (ch) => /[a-z0-9]/i.test(ch);
  let l = 0;
  let r = s.length - 1;
  while (l < r) {
    while (l < r && !ok(s[l])) l++;
    while (l < r && !ok(s[r])) r--;
    if (s[l].toLowerCase() !== s[r].toLowerCase()) return false;
    l++;
    r--;
  }
  return true;
}
`,
    ts: `function isPalindrome(s: string): boolean {
  const ok = (ch: string) => /[a-z0-9]/i.test(ch);
  let l = 0;
  let r = s.length - 1;
  while (l < r) {
    while (l < r && !ok(s[l])) l++;
    while (l < r && !ok(s[r])) r--;
    if (s[l].toLowerCase() !== s[r].toLowerCase()) return false;
    l++;
    r--;
  }
  return true;
}
`,
  },
  perf: {
    gen: (n: number) => {
      const half = Array.from({ length: n }, (_, i) => String.fromCharCode(97 + (i % 26))).join('')
      return [half + ', ' + half.split('').reverse().join('')]
    },
    n: 100000,
    limitMs: 2500,
    label: 'string com 200.000 caracteres',
  },
}

export const twoSumII: Problem = {
  id: 'two-sum-ii',
  title: 'Two Sum II (array ordenado)',
  difficulty: 'Médio',
  pattern: 'two-pointers',
  leetcode: { number: 167, slug: 'two-sum-ii-input-array-is-sorted' },
  fnName: 'twoSum',
  params: ['numbers', 'target'],
  description: `
Dado um array \`numbers\` **ordenado em ordem crescente** (indexado a partir de **1**), encontre dois números que somam \`target\`.

Retorne \`[index1, index2]\` com \`1 <= index1 < index2\`. Existe exatamente uma solução e você **não** pode usar o mesmo elemento duas vezes.

**Restrição:** use apenas **O(1)** de memória extra (sem Map!).
`,
  examples: [
    { input: 'numbers = [2, 7, 11, 15], target = 9', output: '[1, 2]', explanation: '2 + 7 = 9 → índices 1 e 2 (base 1).' },
    { input: 'numbers = [2, 3, 4], target = 6', output: '[1, 3]' },
    { input: 'numbers = [-1, 0], target = -1', output: '[1, 2]' },
  ],
  constraints: ['2 <= numbers.length <= 3 * 10^4', 'numbers está em ordem crescente', 'Exatamente uma solução'],
  starter: {
    js: `/**
 * @param {number[]} numbers
 * @param {number} target
 * @return {number[]}
 */
function twoSum(numbers, target) {

}
`,
    ts: `function twoSum(numbers: number[], target: number): number[] {

}
`,
  },
  tests: [
    { input: [[2, 7, 11, 15], 9], expected: [1, 2], label: 'Exemplo 1' },
    { input: [[2, 3, 4], 6], expected: [1, 3], label: 'Exemplo 2' },
    { input: [[-1, 0], -1], expected: [1, 2], label: 'Exemplo 3' },
    { input: [[1, 2, 3, 4, 4, 9, 56, 90], 8], expected: [4, 5], label: 'Duplicados' },
    { input: [[-5, -3, 0, 2, 8, 12], 7], expected: [1, 6], label: 'Pontas' },
    { input: [[5, 25, 75], 100], expected: [2, 3], label: 'Fim do array' },
  ],
  hints: [
    'O array está ordenado. Se a soma das pontas é pequena demais, qual ponteiro mover?',
    'Comece com `l = 0` e `r = n - 1`. Se `soma < target`, só aumentando o menor: `l++`. Se `soma > target`, `r--`.',
    'Não esqueça: a resposta é **base 1** → `[l + 1, r + 1]`.',
  ],
  explanation: {
    intuition: `
Com o array ordenado, a soma \`numbers[l] + numbers[r]\` diz para onde ir:

- **soma < target** → precisamos de mais. \`r\` já é o maior possível para esse \`l\`, então **\`numbers[l]\` nunca fará par com ninguém**: descarte-o (\`l++\`).
- **soma > target** → precisamos de menos. Pelo mesmo raciocínio, descarte \`r\` (\`r--\`).

Cada passo elimina um elemento com segurança: O(n) de tempo e O(1) de memória.
`,
    steps: ['`l = 0`, `r = n - 1`.', 'Enquanto `l < r`: calcule `sum`.', 'Igual → retorne `[l + 1, r + 1]`. Menor → `l++`. Maior → `r--`.'],
    time: 'O(n)',
    space: 'O(1)',
    complexityWhy: 'Os ponteiros só andam em direção um ao outro: no máximo n movimentos no total.',
    pitfalls: ['Retornar índices base 0.', 'Usar Map: funciona, mas viola o O(1) de memória pedido (e ignora que o array está ordenado — o entrevistador vai perguntar).'],
  },
  solution: {
    js: `function twoSum(numbers, target) {
  let l = 0;
  let r = numbers.length - 1;
  while (l < r) {
    const sum = numbers[l] + numbers[r];
    if (sum === target) return [l + 1, r + 1];
    if (sum < target) l++;
    else r--;
  }
  return [];
}
`,
    ts: `function twoSum(numbers: number[], target: number): number[] {
  let l = 0;
  let r = numbers.length - 1;
  while (l < r) {
    const sum = numbers[l] + numbers[r];
    if (sum === target) return [l + 1, r + 1];
    if (sum < target) l++;
    else r--;
  }
  return [];
}
`,
  },
  perf: { gen: (n: number) => [Array.from({ length: n }, (_, i) => i), n - 2 + (n - 1)], n: 30000, limitMs: 2500, label: 'n = 30.000, par no final' },
}

export const containerWater: Problem = {
  id: 'container-with-most-water',
  title: 'Container With Most Water',
  difficulty: 'Médio',
  pattern: 'two-pointers',
  leetcode: { number: 11, slug: 'container-with-most-water' },
  fnName: 'maxArea',
  params: ['height'],
  description: `
Você recebe um array \`height\` de tamanho n. Imagine n linhas verticais: a linha \`i\` vai de \`(i, 0)\` até \`(i, height[i])\`.

Escolha **duas linhas** que, junto com o eixo x, formem um recipiente que guarde **a maior quantidade de água**. Retorne essa quantidade.

A água de um recipiente entre \`l\` e \`r\` é \`(r - l) * Math.min(height[l], height[r])\` (não dá para inclinar o recipiente).
`,
  examples: [
    { input: 'height = [1,8,6,2,5,4,8,3,7]', output: '49', explanation: 'Linhas nos índices 1 (altura 8) e 8 (altura 7): largura 7 × altura 7 = 49.' },
    { input: 'height = [1,1]', output: '1' },
  ],
  constraints: ['2 <= n <= 10^5', '0 <= height[i] <= 10^4'],
  starter: {
    js: `/**
 * @param {number[]} height
 * @return {number}
 */
function maxArea(height) {

}
`,
    ts: `function maxArea(height: number[]): number {

}
`,
  },
  tests: [
    { input: [[1, 8, 6, 2, 5, 4, 8, 3, 7]], expected: 49, label: 'Exemplo 1' },
    { input: [[1, 1]], expected: 1, label: 'Exemplo 2' },
    { input: [[4, 3, 2, 1, 4]], expected: 16, label: 'Pontas iguais' },
    { input: [[1, 2, 1]], expected: 2, label: 'Pequeno' },
    { input: [[0, 0, 0]], expected: 0, label: 'Zeros' },
    { input: [[2, 3, 10, 5, 7, 8, 9]], expected: 36, label: 'Meio alto' },
  ],
  hints: [
    'Comece com o recipiente mais largo possível: `l = 0`, `r = n - 1`. Agora você só pode perder largura. Como compensar?',
    'A altura é limitada pela linha **mais baixa**. Mover a linha mais alta pode aumentar a área?',
    'Nunca! Então sempre mova o ponteiro da linha **mais baixa**.',
  ],
  explanation: {
    intuition: `
Começamos com a **largura máxima** (\`l = 0\`, \`r = n - 1\`). A cada passo a largura diminui 1, então a única esperança de área maior é **ganhar altura**.

A área é limitada pela linha mais **baixa**. Se movermos a mais alta, a altura continua limitada pela baixa (ou fica pior) e a largura diminui: **nunca melhora**. Então descartamos a linha mais baixa — ela já deu o melhor que podia com a maior largura possível.
`,
    steps: [
      '`l = 0`, `r = n - 1`, `best = 0`.',
      'Calcule `area = (r - l) * Math.min(height[l], height[r])` e atualize `best`.',
      'Se `height[l] < height[r]`, `l++`; senão `r--`.',
      'Repita enquanto `l < r`.',
    ],
    time: 'O(n)',
    space: 'O(1)',
    complexityWhy: 'Uma passada com dois ponteiros convergindo.',
    pitfalls: ['Mover o ponteiro da linha mais alta: perde a resposta ótima.', 'Calcular largura como `r - l + 1`: aqui a largura é a distância entre as linhas, `r - l`.'],
  },
  bruteForce: { idea: 'Testar todos os pares (l, r).', complexity: 'O(n²)' },
  solution: {
    js: `function maxArea(height) {
  let l = 0;
  let r = height.length - 1;
  let best = 0;
  while (l < r) {
    const area = (r - l) * Math.min(height[l], height[r]);
    best = Math.max(best, area);
    if (height[l] < height[r]) l++;
    else r--;
  }
  return best;
}
`,
    ts: `function maxArea(height: number[]): number {
  let l = 0;
  let r = height.length - 1;
  let best = 0;
  while (l < r) {
    const area = (r - l) * Math.min(height[l], height[r]);
    best = Math.max(best, area);
    if (height[l] < height[r]) l++;
    else r--;
  }
  return best;
}
`,
  },
  perf: { gen: (n: number) => [Array.from({ length: n }, (_, i) => (i * 7919) % 10000)], n: 100000, limitMs: 2500, label: 'n = 100.000' },
}
