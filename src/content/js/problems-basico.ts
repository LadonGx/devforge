import type { Problem } from '../types'
import { starter } from './helpers'

/* ======================= Variáveis, tipos e operações ======================= */

export const toFahrenheit: Problem = {
  id: 'js-to-fahrenheit',
  title: 'Celsius para Fahrenheit',
  difficulty: 'Fácil',
  pattern: 'variaveis',
  fnName: 'toFahrenheit',
  params: ['celsius'],
  description: `
Um app de previsão do tempo recebe a temperatura em **Celsius** e precisa mostrar em **Fahrenheit** para usuários dos EUA.

Escreva \`toFahrenheit(celsius)\` usando a fórmula:

**F = C × 9 / 5 + 32**
`,
  examples: [
    { input: 'toFahrenheit(0)', output: '32' },
    { input: 'toFahrenheit(100)', output: '212' },
    { input: 'toFahrenheit(37)', output: '98.6', explanation: 'Temperatura do corpo humano.' },
  ],
  constraints: ['-273.15 <= celsius <= 10^4'],
  starter: starter('function toFahrenheit(celsius)', 'function toFahrenheit(celsius: number): number', '/**\n * @param {number} celsius\n * @return {number}\n */'),
  tests: [
    { input: [0], expected: 32, label: 'Água congela' },
    { input: [100], expected: 212, label: 'Água ferve' },
    { input: [37], expected: 98.6, label: 'Corpo humano' },
    { input: [-40], expected: -40, label: 'O ponto onde as escalas se cruzam' },
    { input: [25.5], expected: 77.9, label: 'Decimal' },
  ],
  compare: 'float',
  hints: ['Traduza a fórmula direto para o código: `celsius * 9 / 5 + 32`.', 'Lembre do `return`: sem ele a função devolve `undefined`.'],
  explanation: {
    intuition: 'É só traduzir a fórmula. A ordem das operações do JS é a mesma da matemática: `*` e `/` antes de `+`, da esquerda para a direita.',
    steps: ['Multiplique `celsius` por 9 e divida por 5.', 'Some 32.', 'Retorne o resultado.'],
    time: 'O(1)',
    space: 'O(1)',
    complexityWhy: 'Uma conta, independente do valor.',
    pitfalls: ['Esquecer o `return` (o teste recebe `undefined`).', 'Fazer `celsius * (9 / 5 + 32)`: os parênteses mudam a conta.', '37 °C dá 98.60000000000001 por causa dos decimais binários; por isso este teste compara com tolerância.'],
  },
  solution: {
    js: `function toFahrenheit(celsius) {
  return celsius * 9 / 5 + 32;
}
`,
    ts: `function toFahrenheit(celsius: number): number {
  return celsius * 9 / 5 + 32;
}
`,
  },
}

export const splitBill: Problem = {
  id: 'js-split-bill',
  title: 'Dividindo a conta do restaurante',
  difficulty: 'Fácil',
  pattern: 'variaveis',
  fnName: 'splitBill',
  params: ['total', 'people', 'tipPercent'],
  description: `
A conta do restaurante chegou e o grupo vai dividir igualmente, incluindo a gorjeta.

Escreva \`splitBill(total, people, tipPercent)\` que retorna **quanto cada pessoa paga**:

1. some a gorjeta ao total (\`tipPercent\` é a porcentagem: 10 significa 10%);
2. divida pelo número de pessoas;
3. **arredonde para 2 casas decimais** (centavos), retornando um **número**.
`,
  examples: [
    { input: 'splitBill(100, 4, 10)', output: '27.5', explanation: '100 + 10% = 110; 110 / 4 = 27.5' },
    { input: 'splitBill(120, 7, 10)', output: '18.86', explanation: '132 / 7 = 18.857142... → 18.86' },
  ],
  constraints: ['people >= 1', '0 <= tipPercent <= 100'],
  starter: starter(
    'function splitBill(total, people, tipPercent)',
    'function splitBill(total: number, people: number, tipPercent: number): number',
    '/**\n * @param {number} total\n * @param {number} people\n * @param {number} tipPercent\n * @return {number}\n */',
  ),
  tests: [
    { input: [100, 4, 10], expected: 27.5, label: 'Exemplo 1' },
    { input: [120, 7, 10], expected: 18.86, label: 'Precisa arredondar' },
    { input: [89.9, 3, 0], expected: 29.97, label: 'Sem gorjeta' },
    { input: [250, 1, 10], expected: 275, label: 'Uma pessoa só' },
    { input: [57.3, 2, 12], expected: 32.09, label: 'Gorjeta de 12%' },
  ],
  compare: 'float',
  hints: [
    'Calcule em variáveis com nome: `const comGorjeta = total + total * (tipPercent / 100)`.',
    'Para arredondar em 2 casas: multiplique por 100, use `Math.round` e divida por 100.',
    '`toFixed(2)` também arredonda, mas devolve uma **string**. Se usar, converta de volta com `Number(...)`.',
  ],
  explanation: {
    intuition: 'Dinheiro tem centavos, então o resultado precisa de 2 casas. O truque `Math.round(valor * 100) / 100` "anda" a vírgula duas casas, arredonda para o inteiro mais próximo e volta.',
    steps: ['`comGorjeta = total * (1 + tipPercent / 100)`.', '`porPessoa = comGorjeta / people`.', '`return Math.round(porPessoa * 100) / 100`.'],
    time: 'O(1)',
    space: 'O(1)',
    complexityWhy: 'Algumas contas.',
    pitfalls: ['Retornar `toFixed(2)` direto: o teste espera o número 27.5, não a string "27.50".', '`Math.floor` em vez de `Math.round`: 18.857 viraria 18.85.', 'Esquecer de dividir a porcentagem por 100.'],
  },
  solution: {
    js: `function splitBill(total, people, tipPercent) {
  const comGorjeta = total * (1 + tipPercent / 100);
  const porPessoa = comGorjeta / people;
  return Math.round(porPessoa * 100) / 100;
}
`,
    ts: `function splitBill(total: number, people: number, tipPercent: number): number {
  const comGorjeta = total * (1 + tipPercent / 100);
  const porPessoa = comGorjeta / people;
  return Math.round(porPessoa * 100) / 100;
}
`,
  },
}

export const formatDuration: Problem = {
  id: 'js-format-duration',
  title: 'Duração em HH:MM:SS',
  difficulty: 'Fácil',
  pattern: 'variaveis',
  fnName: 'formatDuration',
  params: ['seconds'],
  description: `
Um player de vídeo guarda a duração em **segundos** e precisa mostrar no formato **HH:MM:SS**.

Escreva \`formatDuration(seconds)\` que retorna a string formatada, sempre com **2 dígitos** em cada parte (horas podem ter mais de 2 se passarem de 99).

Dica de formatação: \`String(7).padStart(2, "0")\` devolve \`"07"\`.
`,
  examples: [
    { input: 'formatDuration(3725)', output: '"01:02:05"', explanation: '3725 s = 1 h, 2 min e 5 s' },
    { input: 'formatDuration(59)', output: '"00:00:59"' },
  ],
  constraints: ['0 <= seconds <= 10^7', 'seconds é inteiro'],
  starter: starter('function formatDuration(seconds)', 'function formatDuration(seconds: number): string', '/**\n * @param {number} seconds\n * @return {string}\n */'),
  tests: [
    { input: [3725], expected: '01:02:05', label: 'Exemplo 1' },
    { input: [59], expected: '00:00:59', label: 'Só segundos' },
    { input: [0], expected: '00:00:00', label: 'Zero' },
    { input: [3600], expected: '01:00:00', label: 'Uma hora exata' },
    { input: [86399], expected: '23:59:59', label: 'Um segundo antes de 24 h' },
    { input: [360000], expected: '100:00:00', label: 'Mais de 99 horas' },
  ],
  hints: [
    'Horas: `Math.floor(seconds / 3600)`. Uma hora tem 3600 segundos.',
    'O que sobra depois de tirar as horas é `seconds % 3600`. Desse resto, os minutos são `Math.floor(resto / 60)` e os segundos `resto % 60`.',
    'Monte com template literal e `padStart(2, "0")` em cada parte.',
  ],
  explanation: {
    intuition: '`/` com `Math.floor` responde "quantas unidades inteiras cabem" e `%` responde "quanto sobra". Aplicando os dois em cascata (horas → minutos → segundos), você decompõe o número, igual a separar notas de troco.',
    steps: ['`h = Math.floor(seconds / 3600)`.', '`m = Math.floor((seconds % 3600) / 60)`.', '`s = seconds % 60`.', 'Formate cada um com `String(x).padStart(2, "0")` e junte com `:`.'],
    time: 'O(1)',
    space: 'O(1)',
    complexityWhy: 'Número fixo de contas.',
    pitfalls: ['Esquecer o `Math.floor`: 3725 / 3600 = 1.03...', 'Calcular minutos com `seconds / 60` sem tirar as horas antes (daria 62 minutos).', 'Tentar `padStart` num número: ele é método de **string**; converta com `String(n)`.'],
  },
  solution: {
    js: `function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const two = (n) => String(n).padStart(2, '0');
  return \`\${two(h)}:\${two(m)}:\${two(s)}\`;
}
`,
    ts: `function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const two = (n: number) => String(n).padStart(2, '0');
  return \`\${two(h)}:\${two(m)}:\${two(s)}\`;
}
`,
  },
}

/* ======================= Comparações e decisões ======================= */

export const gradeStatus: Problem = {
  id: 'js-grade-status',
  title: 'Situação do aluno',
  difficulty: 'Fácil',
  pattern: 'condicionais',
  fnName: 'gradeStatus',
  params: ['grade', 'attendance'],
  description: `
O sistema da faculdade calcula a situação do aluno a partir da **nota** (0 a 10) e da **frequência** (porcentagem de presença).

Escreva \`gradeStatus(grade, attendance)\` seguindo as regras **nesta prioridade**:

1. nota menor que 0 ou maior que 10 → \`"nota inválida"\`
2. frequência abaixo de 75 → \`"reprovado por falta"\` (mesmo com nota 10)
3. nota 7 ou mais → \`"aprovado"\`
4. nota 5 ou mais → \`"recuperação"\`
5. senão → \`"reprovado"\`
`,
  examples: [
    { input: 'gradeStatus(8.5, 90)', output: '"aprovado"' },
    { input: 'gradeStatus(10, 60)', output: '"reprovado por falta"' },
    { input: 'gradeStatus(5, 80)', output: '"recuperação"' },
  ],
  constraints: [],
  starter: starter(
    'function gradeStatus(grade, attendance)',
    'function gradeStatus(grade: number, attendance: number): string',
    '/**\n * @param {number} grade\n * @param {number} attendance\n * @return {string}\n */',
  ),
  tests: [
    { input: [8.5, 90], expected: 'aprovado', label: 'Aprovado' },
    { input: [10, 60], expected: 'reprovado por falta', label: 'Nota alta, mas faltou' },
    { input: [5, 80], expected: 'recuperação', label: 'Exatamente 5' },
    { input: [7, 75], expected: 'aprovado', label: 'Exatamente 7 e 75%' },
    { input: [4.9, 100], expected: 'reprovado', label: 'Quase 5' },
    { input: [6.9, 74.9], expected: 'reprovado por falta', label: 'Frequência 74.9' },
    { input: [11, 50], expected: 'nota inválida', label: 'Nota inválida vem antes da falta' },
    { input: [-1, 100], expected: 'nota inválida', label: 'Nota negativa' },
  ],
  hints: [
    'Escreva os `if`s **na ordem de prioridade** do enunciado e use `return` em cada um (guard clauses).',
    'Repare nos limites: "7 ou mais" é `>= 7`; "abaixo de 75" é `< 75`.',
  ],
  explanation: {
    intuition: 'Quando as regras têm prioridade, a ordem dos `if`s é a própria regra. Com `return` em cada caso, cada linha trata uma situação e o resto do código nem roda.',
    steps: ['`if (grade < 0 || grade > 10) return "nota inválida"`.', '`if (attendance < 75) return "reprovado por falta"`.', '`if (grade >= 7) return "aprovado"`.', '`if (grade >= 5) return "recuperação"`.', '`return "reprovado"`.'],
    time: 'O(1)',
    space: 'O(1)',
    complexityWhy: 'No máximo 5 comparações.',
    pitfalls: ['Testar `grade >= 5` antes de `grade >= 7`: todo aprovado cairia em recuperação.', 'Usar `>` onde o enunciado diz "ou mais" (7 exato ficaria de fora).', 'Checar falta antes da nota inválida.'],
  },
  solution: {
    js: `function gradeStatus(grade, attendance) {
  if (grade < 0 || grade > 10) return 'nota inválida';
  if (attendance < 75) return 'reprovado por falta';
  if (grade >= 7) return 'aprovado';
  if (grade >= 5) return 'recuperação';
  return 'reprovado';
}
`,
    ts: `function gradeStatus(grade: number, attendance: number): string {
  if (grade < 0 || grade > 10) return 'nota inválida';
  if (attendance < 75) return 'reprovado por falta';
  if (grade >= 7) return 'aprovado';
  if (grade >= 5) return 'recuperação';
  return 'reprovado';
}
`,
  },
}

export const isLeapYear: Problem = {
  id: 'js-is-leap-year',
  title: 'Ano bissexto',
  difficulty: 'Fácil',
  pattern: 'condicionais',
  fnName: 'isLeapYear',
  params: ['year'],
  description: `
Um calendário precisa saber se fevereiro tem 28 ou 29 dias. Um ano é **bissexto** quando:

- é divisível por **4**,
- **exceto** se for divisível por **100**,
- **a não ser que** também seja divisível por **400**.

Escreva \`isLeapYear(year)\` que retorna \`true\` ou \`false\`.
`,
  examples: [
    { input: 'isLeapYear(2024)', output: 'true' },
    { input: 'isLeapYear(1900)', output: 'false', explanation: 'Divisível por 100 e não por 400.' },
    { input: 'isLeapYear(2000)', output: 'true', explanation: 'Divisível por 400.' },
  ],
  constraints: ['1 <= year <= 9999'],
  starter: starter('function isLeapYear(year)', 'function isLeapYear(year: number): boolean', '/**\n * @param {number} year\n * @return {boolean}\n */'),
  tests: [
    { input: [2024], expected: true, label: 'Divisível por 4' },
    { input: [2023], expected: false, label: 'Ano comum' },
    { input: [1900], expected: false, label: 'Divisível por 100' },
    { input: [2000], expected: true, label: 'Divisível por 400' },
    { input: [2100], expected: false, label: '2100' },
    { input: [1600], expected: true, label: '1600' },
    { input: [4], expected: true, label: 'Ano 4' },
  ],
  hints: [
    '"Divisível por X" em código é `year % X === 0` (resto zero).',
    'Comece pelo caso mais específico: se é divisível por 400, já é bissexto. Depois o 100, depois o 4.',
    'Também dá em uma linha: `(year % 4 === 0 && year % 100 !== 0) || year % 400 === 0`.',
  ],
  explanation: {
    intuition: 'As exceções vêm em camadas. Testar da regra mais específica (400) para a mais geral (4) evita ter que combinar tudo numa condição só.',
    steps: ['Se `year % 400 === 0` → true.', 'Se `year % 100 === 0` → false.', 'Retorne `year % 4 === 0`.'],
    time: 'O(1)',
    space: 'O(1)',
    complexityWhy: 'Até três restos de divisão.',
    pitfalls: ['Testar só o `% 4` (erra 1900 e 2100).', 'Testar o 100 antes do 400 com return false (erra 2000).', 'Retornar `"true"` (string) em vez do boolean.'],
  },
  solution: {
    js: `function isLeapYear(year) {
  if (year % 400 === 0) return true;
  if (year % 100 === 0) return false;
  return year % 4 === 0;
}
`,
    ts: `function isLeapYear(year: number): boolean {
  if (year % 400 === 0) return true;
  if (year % 100 === 0) return false;
  return year % 4 === 0;
}
`,
  },
}

export const shippingCost: Problem = {
  id: 'js-shipping-cost',
  title: 'Calculando o frete',
  difficulty: 'Fácil',
  pattern: 'condicionais',
  fnName: 'shippingCost',
  params: ['total', 'region'],
  description: `
Uma loja online cobra o frete por região, com frete grátis em compras grandes.

Escreva \`shippingCost(total, region)\`:

1. se a região **não** for atendida, retorne \`null\` (a loja não entrega lá);
2. se \`total\` for **200 ou mais**, o frete é **0**;
3. senão, o frete depende da região:

- \`"sudeste"\` → 15
- \`"sul"\` → 18
- \`"centro-oeste"\` → 22
- \`"nordeste"\` → 25
- \`"norte"\` → 30

A região sempre vem em letras minúsculas.
`,
  examples: [
    { input: 'shippingCost(120, "sul")', output: '18' },
    { input: 'shippingCost(350, "norte")', output: '0' },
    { input: 'shippingCost(350, "lua")', output: 'null' },
  ],
  constraints: [],
  starter: starter(
    'function shippingCost(total, region)',
    'function shippingCost(total: number, region: string): number | null',
    '/**\n * @param {number} total\n * @param {string} region\n * @return {number | null}\n */',
  ),
  tests: [
    { input: [120, 'sul'], expected: 18, label: 'Sul' },
    { input: [350, 'norte'], expected: 0, label: 'Frete grátis' },
    { input: [350, 'lua'], expected: null, label: 'Região não atendida' },
    { input: [200, 'nordeste'], expected: 0, label: 'Exatamente 200' },
    { input: [199.99, 'nordeste'], expected: 25, label: 'Quase 200' },
    { input: [10, 'sudeste'], expected: 15, label: 'Sudeste' },
    { input: [10, 'centro-oeste'], expected: 22, label: 'Centro-oeste' },
    { input: [10, 'norte'], expected: 30, label: 'Norte' },
  ],
  hints: [
    'Um `switch (region)` com um `case` por região, devolvendo o preço, organiza bem a tabela. O `default` trata a região desconhecida.',
    'Atenção à prioridade: região inválida retorna `null` **mesmo** com total alto. Descubra o preço da região primeiro, depois aplique o frete grátis.',
  ],
  explanation: {
    intuition: 'São duas decisões independentes: "quanto custa para essa região?" e "a compra ganhou frete grátis?". Separando as duas (primeiro o preço, depois o desconto), cada regra fica numa parte clara do código.',
    steps: ['Use `switch` para descobrir o preço da região (ou `null` no `default`).', 'Se o preço for `null`, retorne `null`.', 'Se `total >= 200`, retorne 0.', 'Retorne o preço.'],
    time: 'O(1)',
    space: 'O(1)',
    complexityWhy: 'Uma comparação por região, número fixo.',
    pitfalls: ['Esquecer o `break` num `switch` com atribuição: o código "cai" no próximo caso.', 'Aplicar frete grátis antes de validar a região (a lua ganharia frete 0).', 'Usar `> 200` em vez de `>= 200`.'],
  },
  solution: {
    js: `function shippingCost(total, region) {
  let price;
  switch (region) {
    case 'sudeste': price = 15; break;
    case 'sul': price = 18; break;
    case 'centro-oeste': price = 22; break;
    case 'nordeste': price = 25; break;
    case 'norte': price = 30; break;
    default: return null;
  }
  if (total >= 200) return 0;
  return price;
}
`,
    ts: `function shippingCost(total: number, region: string): number | null {
  let price: number;
  switch (region) {
    case 'sudeste': price = 15; break;
    case 'sul': price = 18; break;
    case 'centro-oeste': price = 22; break;
    case 'nordeste': price = 25; break;
    case 'norte': price = 30; break;
    default: return null;
  }
  if (total >= 200) return 0;
  return price;
}
`,
  },
}

/* ======================= Repetição ======================= */

export const fizzBuzz: Problem = {
  id: 'js-fizzbuzz',
  title: 'FizzBuzz',
  difficulty: 'Fácil',
  pattern: 'loops',
  leetcode: { number: 412, slug: 'fizz-buzz' },
  fnName: 'fizzBuzz',
  params: ['n'],
  description: `
O aquecimento mais famoso das entrevistas. Escreva \`fizzBuzz(n)\` que retorna um **array de strings** de 1 até \`n\`, onde:

- múltiplos de **3 e 5** viram \`"FizzBuzz"\`;
- múltiplos só de **3** viram \`"Fizz"\`;
- múltiplos só de **5** viram \`"Buzz"\`;
- os outros viram o próprio número como string (\`"1"\`, \`"2"\`...).
`,
  examples: [
    { input: 'fizzBuzz(5)', output: '["1", "2", "Fizz", "4", "Buzz"]' },
    { input: 'fizzBuzz(15)', output: '[..., "13", "14", "FizzBuzz"]' },
  ],
  constraints: ['0 <= n <= 10^4'],
  starter: starter('function fizzBuzz(n)', 'function fizzBuzz(n: number): string[]', '/**\n * @param {number} n\n * @return {string[]}\n */'),
  tests: [
    { input: [5], expected: ['1', '2', 'Fizz', '4', 'Buzz'], label: 'Exemplo 1' },
    { input: [15], expected: ['1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8', 'Fizz', 'Buzz', '11', 'Fizz', '13', '14', 'FizzBuzz'], label: 'Até 15' },
    { input: [1], expected: ['1'], label: 'n = 1' },
    { input: [0], expected: [], label: 'n = 0' },
  ],
  hints: [
    'Um `for` de `i = 1` até `i <= n`, empurrando (`push`) uma string em um array a cada volta.',
    'A ordem dos `if`s importa: teste "múltiplo de 3 **e** de 5" (ou de 15) **primeiro**.',
    'Não esqueça de converter o número: `String(i)`.',
  ],
  explanation: {
    intuition: 'O exercício testa se você ordena as condições do caso mais específico para o mais geral. 15 é múltiplo de 3, de 5 e de 15: se o teste do 3 vier antes, ele "rouba" o 15.',
    steps: ['Crie `const result = []`.', 'Para `i` de 1 até `n`: se `i % 15 === 0` → "FizzBuzz"; senão se `i % 3 === 0` → "Fizz"; senão se `i % 5 === 0` → "Buzz"; senão `String(i)`.', 'Retorne `result`.'],
    time: 'O(n)',
    space: 'O(n)',
    complexityWhy: 'Uma volta por número, e o array de saída tem n itens.',
    pitfalls: ['Começar em 0 ou ir até `i < n` (off-by-one).', 'Testar o 3 antes do 15.', 'Empurrar o número `i` em vez da string `"i"`.'],
  },
  solution: {
    js: `function fizzBuzz(n) {
  const result = [];
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) result.push('FizzBuzz');
    else if (i % 3 === 0) result.push('Fizz');
    else if (i % 5 === 0) result.push('Buzz');
    else result.push(String(i));
  }
  return result;
}
`,
    ts: `function fizzBuzz(n: number): string[] {
  const result: string[] = [];
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) result.push('FizzBuzz');
    else if (i % 3 === 0) result.push('Fizz');
    else if (i % 5 === 0) result.push('Buzz');
    else result.push(String(i));
  }
  return result;
}
`,
  },
}

export const countVowels: Problem = {
  id: 'js-count-vowels',
  title: 'Contando vogais',
  difficulty: 'Fácil',
  pattern: 'loops',
  fnName: 'countVowels',
  params: ['text'],
  description: `
Escreva \`countVowels(text)\` que conta quantas **vogais** existem no texto.

- Conte maiúsculas e minúsculas.
- Vogais acentuadas também contam: \`á à â ã é ê í ó ô õ ú\`.
`,
  examples: [
    { input: 'countVowels("Americana")', output: '5' },
    { input: 'countVowels("ÔNIBUS está lá")', output: '6' },
  ],
  constraints: ['0 <= text.length <= 10^4'],
  starter: starter('function countVowels(text)', 'function countVowels(text: string): number', '/**\n * @param {string} text\n * @return {number}\n */'),
  tests: [
    { input: ['Americana'], expected: 5, label: 'Exemplo 1' },
    { input: ['ÔNIBUS está lá'], expected: 6, label: 'Acentos e maiúsculas' },
    { input: [''], expected: 0, label: 'Vazio' },
    { input: ['rhythm 123!'], expected: 0, label: 'Sem vogais' },
    { input: ['AEIOU aeiou'], expected: 10, label: 'Só vogais' },
    { input: ['Programação em JavaScript'], expected: 9, label: 'Frase' },
  ],
  hints: [
    'Guarde as vogais numa string: `const vogais = "aeiouáàâãéêíóôõú"` e percorra o texto com `for...of`.',
    'Para ignorar maiúsculas, converta o texto (ou cada letra) com `toLowerCase()` antes de comparar.',
    '`vogais.includes(letra)` responde se a letra é vogal.',
  ],
  explanation: {
    intuition: 'Padrão **contador**: percorre cada letra e soma 1 quando ela pertence ao conjunto de vogais. Normalizar para minúscula antes evita listar cada vogal duas vezes.',
    steps: ['`let count = 0`.', 'Para cada `ch` de `text.toLowerCase()`: se `vogais.includes(ch)`, `count++`.', 'Retorne `count`.'],
    time: 'O(n)',
    space: 'O(1)',
    complexityWhy: 'Uma passada pelo texto; a lista de vogais tem tamanho fixo.',
    pitfalls: ['Esquecer as maiúsculas ("A" não é igual a "a").', 'Contar espaços e números por usar uma condição "não é consoante".'],
  },
  solution: {
    js: `function countVowels(text) {
  const vogais = 'aeiouáàâãéêíóôõú';
  let count = 0;
  for (const ch of text.toLowerCase()) {
    if (vogais.includes(ch)) count++;
  }
  return count;
}
`,
    ts: `function countVowels(text: string): number {
  const vogais = 'aeiouáàâãéêíóôõú';
  let count = 0;
  for (const ch of text.toLowerCase()) {
    if (vogais.includes(ch)) count++;
  }
  return count;
}
`,
  },
}

export const reverseString: Problem = {
  id: 'js-reverse-string',
  title: 'Invertendo uma string sem reverse()',
  difficulty: 'Fácil',
  pattern: 'loops',
  fnName: 'reverseString',
  params: ['text'],
  io: {
    harness: `(reverseString, text) => {
  const original = Array.prototype.reverse;
  Array.prototype.reverse = function () {
    throw new Error('Neste exercício não vale usar .reverse(): faça com um loop.');
  };
  try {
    return reverseString(text);
  } finally {
    Array.prototype.reverse = original;
  }
}`,
  },
  description: `
Escreva \`reverseString(text)\` que retorna o texto de trás para frente.

**Regra:** não vale usar \`.reverse()\` (o teste bloqueia). Use um loop.
`,
  examples: [
    { input: 'reverseString("devforge")', output: '"egrofved"' },
    { input: 'reverseString("ana")', output: '"ana"' },
  ],
  constraints: ['0 <= text.length <= 10^4'],
  starter: starter('function reverseString(text)', 'function reverseString(text: string): string', '/**\n * @param {string} text\n * @return {string}\n */'),
  tests: [
    { input: ['devforge'], expected: 'egrofved', label: 'Exemplo 1' },
    { input: ['ana'], expected: 'ana', label: 'Palíndromo' },
    { input: [''], expected: '', label: 'Vazia' },
    { input: ['a'], expected: 'a', label: 'Uma letra' },
    { input: ['Olá, mundo!'], expected: '!odnum ,álO', label: 'Com pontuação' },
  ],
  hints: [
    'Opção 1: percorra do **último** índice (`text.length - 1`) até o 0 e vá concatenando.',
    'Opção 2: percorra normalmente e coloque cada letra **na frente** do resultado: `result = ch + result`.',
  ],
  explanation: {
    intuition: 'Para inverter, basta ler as letras na ordem contrária. Um `for` decrescente faz isso direto: o índice começa no fim e anda para trás.',
    steps: ['`let result = ""`.', '`for (let i = text.length - 1; i >= 0; i--) result += text[i]`.', 'Retorne `result`.'],
    time: 'O(n)',
    space: 'O(n)',
    complexityWhy: 'Uma volta por letra; a string nova tem n letras.',
    pitfalls: ['Começar em `text.length` (esse índice não existe: `undefined`).', 'Usar `i > 0` e perder a primeira letra.'],
  },
  solution: {
    js: `function reverseString(text) {
  let result = '';
  for (let i = text.length - 1; i >= 0; i--) {
    result += text[i];
  }
  return result;
}
`,
    ts: `function reverseString(text: string): string {
  let result = '';
  for (let i = text.length - 1; i >= 0; i--) {
    result += text[i];
  }
  return result;
}
`,
  },
}

export const monthsToGoal: Problem = {
  id: 'js-months-to-goal',
  title: 'Meses até a meta de economia',
  difficulty: 'Médio',
  pattern: 'loops',
  fnName: 'monthsToGoal',
  params: ['goal', 'monthly', 'ratePercent'],
  description: `
Você quer juntar dinheiro para um notebook novo. Todo mês você guarda \`monthly\` reais numa aplicação que rende \`ratePercent\`% ao mês.

A simulação de cada mês é:

1. o saldo atual rende juros: \`saldo = saldo * (1 + ratePercent / 100)\`;
2. você deposita \`monthly\`;
3. conta mais um mês.

O saldo começa em 0. Escreva \`monthsToGoal(goal, monthly, ratePercent)\` que retorna **quantos meses** leva até o saldo ser **maior ou igual** à meta. Se a meta for 0 ou menos, retorne 0.
`,
  examples: [
    { input: 'monthsToGoal(1000, 300, 0)', output: '4', explanation: '300, 600, 900, 1200 → 4 meses' },
    { input: 'monthsToGoal(2000, 100, 1)', output: '19', explanation: 'Sem juros seriam 20 meses; os juros adiantam um.' },
  ],
  constraints: ['monthly > 0', '0 <= ratePercent <= 10'],
  starter: starter(
    'function monthsToGoal(goal, monthly, ratePercent)',
    'function monthsToGoal(goal: number, monthly: number, ratePercent: number): number',
    '/**\n * @param {number} goal\n * @param {number} monthly\n * @param {number} ratePercent\n * @return {number}\n */',
  ),
  tests: [
    { input: [1000, 300, 0], expected: 4, label: 'Sem juros' },
    { input: [2000, 100, 1], expected: 19, label: '1% ao mês' },
    { input: [12000, 500, 1.5], expected: 21, label: '1,5% ao mês' },
    { input: [1000, 100, 0], expected: 10, label: 'Chega exatamente na meta' },
    { input: [0, 100, 1], expected: 0, label: 'Meta zero' },
    { input: [100, 100, 5], expected: 1, label: 'Um mês basta' },
  ],
  hints: [
    'Você não sabe quantas voltas vão ser: é um caso clássico de `while (saldo < goal)`.',
    'Dentro do loop, faça as três etapas na ordem: juros, depósito, `meses++`.',
    'Trate o caso `goal <= 0` antes do loop (ou repare que o `while` nem entra).',
  ],
  explanation: {
    intuition: 'Quando a pergunta é "quantas vezes até acontecer X", o `while` é a ferramenta natural: ele repete enquanto a meta não foi atingida e um contador registra as voltas.',
    steps: ['`let saldo = 0, meses = 0`.', '`while (saldo < goal) { saldo = saldo * (1 + ratePercent / 100) + monthly; meses++; }`.', 'Retorne `meses`.'],
    time: 'O(goal / monthly)',
    space: 'O(1)',
    complexityWhy: 'No pior caso (sem juros) são goal/monthly voltas.',
    pitfalls: ['Usar `<=` no while (conta um mês a mais quando bate exatamente a meta).', 'Aplicar os juros depois do depósito (o enunciado define a ordem).', 'Esquecer de incrementar o contador (loop infinito).'],
  },
  solution: {
    js: `function monthsToGoal(goal, monthly, ratePercent) {
  let saldo = 0;
  let meses = 0;
  while (saldo < goal) {
    saldo = saldo * (1 + ratePercent / 100);
    saldo += monthly;
    meses++;
  }
  return meses;
}
`,
    ts: `function monthsToGoal(goal: number, monthly: number, ratePercent: number): number {
  let saldo = 0;
  let meses = 0;
  while (saldo < goal) {
    saldo = saldo * (1 + ratePercent / 100);
    saldo += monthly;
    meses++;
  }
  return meses;
}
`,
  },
}

/* ======================= Funções ======================= */

export const applyDiscount: Problem = {
  id: 'js-apply-discount',
  title: 'Desconto com valor padrão',
  difficulty: 'Fácil',
  pattern: 'funcoes',
  fnName: 'applyDiscount',
  params: ['price', 'percent'],
  description: `
Escreva \`applyDiscount(price, percent)\` que aplica um desconto percentual e retorna o novo preço **arredondado em 2 casas**.

- Se \`percent\` **não for informado**, o desconto padrão é de **10%** (use um parâmetro com valor padrão).
- Se \`percent\` for menor que 0 ou maior que 100, o desconto é inválido: retorne o **preço original**.
`,
  examples: [
    { input: 'applyDiscount(100)', output: '90', explanation: 'Sem percent: usa 10%.' },
    { input: 'applyDiscount(59.9, 25)', output: '44.93' },
    { input: 'applyDiscount(80, 150)', output: '80', explanation: 'Desconto inválido.' },
  ],
  constraints: [],
  starter: starter(
    'function applyDiscount(price, percent)',
    'function applyDiscount(price: number, percent?: number): number',
    '/**\n * @param {number} price\n * @param {number} [percent]\n * @return {number}\n */',
  ),
  tests: [
    { input: [100], expected: 90, label: 'Sem percent (padrão 10%)' },
    { input: [59.9, 25], expected: 44.93, label: '25% com arredondamento' },
    { input: [80, 150], expected: 80, label: 'Acima de 100%' },
    { input: [80, -5], expected: 80, label: 'Negativo' },
    { input: [80, 0], expected: 80, label: '0% (não é o padrão!)' },
    { input: [80, 100], expected: 0, label: '100%' },
  ],
  compare: 'float',
  hints: [
    'Valor padrão: `function applyDiscount(price, percent = 10)`. Ele só é usado quando o argumento é `undefined`.',
    'Cuidado: `percent || 10` transformaria o 0 em 10! O parâmetro padrão não tem esse problema.',
    'Arredonde com `Math.round(x * 100) / 100`.',
  ],
  explanation: {
    intuition: 'Parâmetros com valor padrão deixam a função mais fácil de chamar no caso comum (`applyDiscount(preco)`) sem perder a flexibilidade. A validação vem primeiro, como guard clause.',
    steps: ['Declare `percent = 10` na assinatura.', 'Se `percent < 0 || percent > 100`, retorne `price`.', 'Calcule `price * (1 - percent / 100)` e arredonde.'],
    time: 'O(1)',
    space: 'O(1)',
    complexityWhy: 'Algumas contas.',
    pitfalls: ['Usar `percent || 10`: 0 é falsy e viraria 10%.', 'Esquecer o arredondamento (44.925 em vez de 44.93).'],
  },
  solution: {
    js: `function applyDiscount(price, percent = 10) {
  if (percent < 0 || percent > 100) return price;
  const final = price * (1 - percent / 100);
  return Math.round(final * 100) / 100;
}
`,
    ts: `function applyDiscount(price: number, percent: number = 10): number {
  if (percent < 0 || percent > 100) return price;
  const final = price * (1 - percent / 100);
  return Math.round(final * 100) / 100;
}
`,
  },
}

export const checkPassword: Problem = {
  id: 'js-check-password',
  title: 'Validador de senha',
  difficulty: 'Fácil',
  pattern: 'funcoes',
  fnName: 'checkPassword',
  params: ['password'],
  description: `
A tela de cadastro precisa dizer **todos** os problemas da senha de uma vez (e não um por vez, que irrita o usuário).

Escreva \`checkPassword(password)\` que retorna um **array com as mensagens** das regras que **falharam**, nesta ordem:

1. \`"mínimo 8 caracteres"\`
2. \`"precisa de um número"\`
3. \`"precisa de uma letra maiúscula"\`
4. \`"precisa de uma letra minúscula"\`

Se a senha passar em tudo, retorne \`[]\`.

**Desafio de organização:** crie funções pequenas como \`hasNumber(text)\` e \`hasUppercase(text)\` e use-as dentro de \`checkPassword\`.
`,
  examples: [
    { input: 'checkPassword("Devforge2026")', output: '[]' },
    { input: 'checkPassword("abc")', output: '["mínimo 8 caracteres", "precisa de um número", "precisa de uma letra maiúscula"]' },
  ],
  constraints: ['As letras dos testes são de A a Z (sem acento)'],
  starter: starter('function checkPassword(password)', 'function checkPassword(password: string): string[]', '/**\n * @param {string} password\n * @return {string[]}\n */'),
  tests: [
    { input: ['Devforge2026'], expected: [], label: 'Senha boa' },
    { input: ['abc'], expected: ['mínimo 8 caracteres', 'precisa de um número', 'precisa de uma letra maiúscula'], label: 'Curta e só minúsculas' },
    { input: ['12345678'], expected: ['precisa de uma letra maiúscula', 'precisa de uma letra minúscula'], label: 'Só números' },
    { input: ['SENHAFORTE1'], expected: ['precisa de uma letra minúscula'], label: 'Só maiúsculas' },
    { input: [''], expected: ['mínimo 8 caracteres', 'precisa de um número', 'precisa de uma letra maiúscula', 'precisa de uma letra minúscula'], label: 'Vazia' },
    { input: ['Abcdefg1'], expected: [], label: 'Exatamente 8' },
  ],
  hints: [
    'Uma letra `ch` é número se `ch >= "0" && ch <= "9"`. Maiúscula: `ch >= "A" && ch <= "Z"`.',
    'Crie `const hasNumber = (text) => { for (const ch of text) if (ch >= "0" && ch <= "9") return true; return false; }` e faça o mesmo para as letras.',
    'Em `checkPassword`, comece com `const errors = []` e faça um `if` por regra, com `errors.push(...)`. Não use `else`: todas as regras são testadas.',
  ],
  explanation: {
    intuition: 'Cada regra vira uma função pequena com nome claro. A função principal fica parecendo o próprio enunciado: "se não tem número, adiciona a mensagem". Isso é decompor um problema em funções.',
    steps: ['Funções auxiliares: `hasNumber`, `hasUpper`, `hasLower` (percorrem a string e retornam ao achar).', 'Em `checkPassword`: `errors = []`.', 'Quatro `if`s independentes, na ordem do enunciado, fazendo `push`.', 'Retorne `errors`.'],
    time: 'O(n)',
    space: 'O(1)',
    complexityWhy: 'Cada auxiliar percorre a senha no máximo uma vez.',
    pitfalls: ['Usar `else if` e parar no primeiro erro.', 'Mudar a ordem das mensagens.', 'Comparar letras com `toUpperCase() === ch`: números e símbolos também passam nesse teste.'],
  },
  solution: {
    js: `const hasNumber = (text) => {
  for (const ch of text) if (ch >= '0' && ch <= '9') return true;
  return false;
};
const hasUpper = (text) => {
  for (const ch of text) if (ch >= 'A' && ch <= 'Z') return true;
  return false;
};
const hasLower = (text) => {
  for (const ch of text) if (ch >= 'a' && ch <= 'z') return true;
  return false;
};

function checkPassword(password) {
  const errors = [];
  if (password.length < 8) errors.push('mínimo 8 caracteres');
  if (!hasNumber(password)) errors.push('precisa de um número');
  if (!hasUpper(password)) errors.push('precisa de uma letra maiúscula');
  if (!hasLower(password)) errors.push('precisa de uma letra minúscula');
  return errors;
}
`,
    ts: `const hasNumber = (text: string): boolean => {
  for (const ch of text) if (ch >= '0' && ch <= '9') return true;
  return false;
};
const hasUpper = (text: string): boolean => {
  for (const ch of text) if (ch >= 'A' && ch <= 'Z') return true;
  return false;
};
const hasLower = (text: string): boolean => {
  for (const ch of text) if (ch >= 'a' && ch <= 'z') return true;
  return false;
};

function checkPassword(password: string): string[] {
  const errors: string[] = [];
  if (password.length < 8) errors.push('mínimo 8 caracteres');
  if (!hasNumber(password)) errors.push('precisa de um número');
  if (!hasUpper(password)) errors.push('precisa de uma letra maiúscula');
  if (!hasLower(password)) errors.push('precisa de uma letra minúscula');
  return errors;
}
`,
  },
}

export const applyNTimes: Problem = {
  id: 'js-apply-n-times',
  title: 'Aplicar uma função N vezes',
  difficulty: 'Fácil',
  pattern: 'funcoes',
  fnName: 'applyNTimes',
  params: ['fn', 'times', 'value'],
  io: {
    harness: `(applyNTimes, fnName, times, value) => {
  const fns = {
    dobrar: (x) => x * 2,
    incrementar: (x) => x + 1,
    exclamar: (s) => s + '!',
    metade: (x) => x / 2,
  };
  return applyNTimes(fns[fnName], times, value);
}`,
  },
  description: `
Funções são valores: dá para recebê-las como parâmetro (callback).

Escreva \`applyNTimes(fn, times, value)\` que aplica \`fn\` sobre \`value\` **\`times\` vezes seguidas**, usando o resultado de cada chamada como entrada da próxima. Com \`times = 0\`, retorne \`value\` sem chamar \`fn\`.

**Como é testado:** o teste passa funções prontas como \`dobrar\` (\`x => x * 2\`), \`incrementar\` (\`x => x + 1\`) e \`exclamar\` (\`s => s + "!"\`). A coluna de entrada mostra o **nome** da função usada.
`,
  examples: [
    { input: 'applyNTimes(x => x * 2, 3, 1)', output: '8', explanation: '1 → 2 → 4 → 8' },
    { input: 'applyNTimes(s => s + "!", 2, "oi")', output: '"oi!!"' },
  ],
  constraints: ['0 <= times <= 1000'],
  starter: starter(
    'function applyNTimes(fn, times, value)',
    'function applyNTimes<T>(fn: (x: T) => T, times: number, value: T): T',
    '/**\n * @param {(x: any) => any} fn\n * @param {number} times\n * @param {any} value\n * @return {any}\n */',
  ),
  tests: [
    { input: ['dobrar', 3, 1], expected: 8, label: 'dobrar 3x a partir de 1' },
    { input: ['exclamar', 2, 'oi'], expected: 'oi!!', label: 'exclamar 2x' },
    { input: ['incrementar', 0, 7], expected: 7, label: 'zero vezes' },
    { input: ['incrementar', 100, 0], expected: 100, label: '100 vezes' },
    { input: ['metade', 3, 80], expected: 10, label: 'metade 3x' },
  ],
  hints: ['Guarde o valor atual numa variável `let atual = value`.', 'Num `for` de `times` voltas, faça `atual = fn(atual)`.'],
  explanation: {
    intuition: '`fn` é só mais uma variável, que por acaso guarda uma função. Chamar `fn(atual)` funciona igual a chamar qualquer função pelo nome. O padrão é o do acumulador: o resultado de uma volta alimenta a próxima.',
    steps: ['`let atual = value`.', '`for (let i = 0; i < times; i++) atual = fn(atual)`.', 'Retorne `atual`.'],
    time: 'O(times)',
    space: 'O(1)',
    complexityWhy: 'Uma chamada de `fn` por volta.',
    pitfalls: ['Chamar `fn(value)` todas as vezes (sempre com o valor inicial).', 'Escrever `fn()` sem passar o valor.'],
  },
  solution: {
    js: `function applyNTimes(fn, times, value) {
  let atual = value;
  for (let i = 0; i < times; i++) {
    atual = fn(atual);
  }
  return atual;
}
`,
    ts: `function applyNTimes<T>(fn: (x: T) => T, times: number, value: T): T {
  let atual = value;
  for (let i = 0; i < times; i++) {
    atual = fn(atual);
  }
  return atual;
}
`,
  },
}

/* ======================= Strings ======================= */

export const capitalizeWords: Problem = {
  id: 'js-capitalize-words',
  title: 'Nome próprio formatado',
  difficulty: 'Fácil',
  pattern: 'strings',
  fnName: 'capitalizeWords',
  params: ['text'],
  description: `
Usuários digitam o nome de todo jeito: \`"  ana   maria SOUZA "\`. Antes de salvar, o cadastro precisa padronizar.

Escreva \`capitalizeWords(text)\` que:

- remove os espaços do começo e do fim;
- troca **vários espaços seguidos** por um só;
- deixa cada palavra com a **primeira letra maiúscula** e o resto minúsculo.
`,
  examples: [
    { input: 'capitalizeWords("  ana   maria SOUZA ")', output: '"Ana Maria Souza"' },
    { input: 'capitalizeWords("jOÃO")', output: '"João"' },
  ],
  constraints: ['As palavras são separadas por espaços'],
  starter: starter('function capitalizeWords(text)', 'function capitalizeWords(text: string): string', '/**\n * @param {string} text\n * @return {string}\n */'),
  tests: [
    { input: ['  ana   maria SOUZA '], expected: 'Ana Maria Souza', label: 'Exemplo 1' },
    { input: ['jOÃO'], expected: 'João', label: 'Uma palavra com acento' },
    { input: [''], expected: '', label: 'Vazio' },
    { input: ['   '], expected: '', label: 'Só espaços' },
    { input: ['guilherme de souza'], expected: 'Guilherme De Souza', label: 'Já minúsculo' },
    { input: ['a b c'], expected: 'A B C', label: 'Letras soltas' },
  ],
  hints: [
    '`text.trim().split(" ")` gera um array de palavras, mas espaços repetidos geram strings vazias `""` no meio. Filtre (ou pule) as vazias.',
    'Para uma palavra: `p[0].toUpperCase() + p.slice(1).toLowerCase()`.',
    'No fim, `palavras.join(" ")`.',
  ],
  explanation: {
    intuition: 'Texto vira array (split), cada item é tratado, e o array volta a ser texto (join). Esse "split → transforma → join" é o padrão mais usado para mexer em palavras.',
    steps: ['`text.trim().split(" ")`.', 'Ignore os pedaços vazios.', 'Capitalize cada palavra.', 'Junte com `" "`.'],
    time: 'O(n)',
    space: 'O(n)',
    complexityWhy: 'Cada caractere é visitado um número constante de vezes; o array de palavras tem tamanho proporcional ao texto.',
    pitfalls: ['`p[0]` numa string vazia é `undefined` e `undefined.toUpperCase()` quebra: filtre as vazias antes.', 'Esquecer o `toLowerCase` no resto ("SOUZA" ficaria "SOUZA").'],
  },
  solution: {
    js: `function capitalizeWords(text) {
  const palavras = [];
  for (const p of text.trim().split(' ')) {
    if (p === '') continue;
    palavras.push(p[0].toUpperCase() + p.slice(1).toLowerCase());
  }
  return palavras.join(' ');
}
`,
    ts: `function capitalizeWords(text: string): string {
  const palavras: string[] = [];
  for (const p of text.trim().split(' ')) {
    if (p === '') continue;
    palavras.push(p[0].toUpperCase() + p.slice(1).toLowerCase());
  }
  return palavras.join(' ');
}
`,
  },
}

export const isPalindrome: Problem = {
  id: 'js-is-palindrome',
  title: 'É palíndromo?',
  difficulty: 'Fácil',
  pattern: 'strings',
  leetcode: { number: 125, slug: 'valid-palindrome' },
  fnName: 'isPalindrome',
  params: ['text'],
  description: `
Um **palíndromo** é lido igual de trás para frente: "arara", "Socorram-me, subi no ônibus em Marrocos".

Escreva \`isPalindrome(text)\` que retorna \`true\` se o texto for palíndromo **considerando apenas letras e números** e **ignorando maiúsculas/minúsculas**.

(Nos testes não há acentos.)
`,
  examples: [
    { input: 'isPalindrome("A man, a plan, a canal: Panama")', output: 'true' },
    { input: 'isPalindrome("race a car")', output: 'false' },
  ],
  constraints: ['0 <= text.length <= 10^5'],
  starter: starter('function isPalindrome(text)', 'function isPalindrome(text: string): boolean', '/**\n * @param {string} text\n * @return {boolean}\n */'),
  tests: [
    { input: ['A man, a plan, a canal: Panama'], expected: true, label: 'Exemplo 1' },
    { input: ['race a car'], expected: false, label: 'Exemplo 2' },
    { input: [''], expected: true, label: 'Vazio' },
    { input: ['Socorram-me, subi no onibus em Marrocos'], expected: true, label: 'Frase em português' },
    { input: ['0P'], expected: false, label: 'Número e letra' },
    { input: ['12321'], expected: true, label: 'Só números' },
  ],
  hints: [
    'Primeiro "limpe" o texto: percorra cada caractere, converta para minúsculo e guarde só os que são letra (`a`–`z`) ou número (`0`–`9`).',
    'Depois compare a string limpa com ela invertida, **ou** use dois índices: um no começo e outro no fim, andando para o meio.',
  ],
  explanation: {
    intuition: 'O problema tem duas partes: **normalizar** (só letras e números, tudo minúsculo) e **comparar** as pontas. Com dois índices (`i` no começo, `j` no fim) você compara par a par e para no primeiro par diferente, sem criar uma string invertida.',
    steps: ['Monte `limpo` com os caracteres alfanuméricos em minúsculo.', '`i = 0`, `j = limpo.length - 1`.', 'Enquanto `i < j`: se `limpo[i] !== limpo[j]` retorne false; senão `i++`, `j--`.', 'Retorne true.'],
    time: 'O(n)',
    space: 'O(n)',
    complexityWhy: 'Uma passada para limpar e no máximo n/2 comparações. A string limpa ocupa O(n) (dá para fazer O(1) pulando caracteres direto no original).',
    pitfalls: ['Esquecer de ignorar pontuação e espaços.', 'Comparar sem passar para minúsculo ("A" !== "a").', 'Esse é o problema 125 do LeetCode: a técnica de dois ponteiros volta no módulo de algoritmos.'],
  },
  solution: {
    js: `function isPalindrome(text) {
  let limpo = '';
  for (const ch of text.toLowerCase()) {
    if ((ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9')) limpo += ch;
  }
  let i = 0;
  let j = limpo.length - 1;
  while (i < j) {
    if (limpo[i] !== limpo[j]) return false;
    i++;
    j--;
  }
  return true;
}
`,
    ts: `function isPalindrome(text: string): boolean {
  let limpo = '';
  for (const ch of text.toLowerCase()) {
    if ((ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9')) limpo += ch;
  }
  let i = 0;
  let j = limpo.length - 1;
  while (i < j) {
    if (limpo[i] !== limpo[j]) return false;
    i++;
    j--;
  }
  return true;
}
`,
  },
}

export const slugify: Problem = {
  id: 'js-slugify',
  title: 'Gerando o slug da URL',
  difficulty: 'Médio',
  pattern: 'strings',
  fnName: 'slugify',
  params: ['title'],
  description: `
Blogs e lojas transformam o título numa URL amigável, o **slug**: \`"Promoção: 50% OFF!"\` vira \`"promocao-50-off"\`.

Escreva \`slugify(title)\`:

1. remova os acentos (\`ç\` vira \`c\`, \`ã\` vira \`a\`...);
2. tudo em minúsculo;
3. cada sequência de caracteres que **não** são letra (a–z) nem número vira **um** hífen \`-\`;
4. sem hífen no começo nem no fim.

Para remover acentos: \`texto.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "")\`.
`,
  examples: [
    { input: 'slugify("Olá, Mundo do JavaScript!")', output: '"ola-mundo-do-javascript"' },
    { input: 'slugify("  Promoção: 50% OFF  ")', output: '"promocao-50-off"' },
  ],
  constraints: [],
  starter: starter('function slugify(title)', 'function slugify(title: string): string', '/**\n * @param {string} title\n * @return {string}\n */'),
  tests: [
    { input: ['Olá, Mundo do JavaScript!'], expected: 'ola-mundo-do-javascript', label: 'Exemplo 1' },
    { input: ['  Promoção: 50% OFF  '], expected: 'promocao-50-off', label: 'Espaços e símbolos' },
    { input: ['React + TypeScript = ❤'], expected: 'react-typescript', label: 'Símbolos no fim' },
    { input: ['---'], expected: '', label: 'Só separadores' },
    { input: ['Ação & Reação'], expected: 'acao-reacao', label: 'Cedilha e til' },
    { input: ['node.js_v20'], expected: 'node-js-v20', label: 'Ponto e underline' },
  ],
  hints: [
    'Faça em etapas, guardando em variáveis: sem acento → minúsculo → trocar separadores → aparar hífens.',
    'Sem regex: percorra as letras; se for letra/número, adicione; senão, adicione um `-` **só se** o último caractere do resultado não for `-`.',
    'Com regex: `.replace(/[^a-z0-9]+/g, "-")` troca cada sequência de "não letra/número" por um hífen; depois `.replace(/^-|-$/g, "")` tira as pontas.',
  ],
  explanation: {
    intuition: 'Pipeline de transformações de string, cada uma resolvendo uma regra. A parte sutil é que **sequências** de símbolos viram **um** hífen: por isso o regex usa `+` (um ou mais), ou o loop confere se o último caractere já é hífen.',
    steps: ['`normalize("NFD")` e remova os acentos.', '`toLowerCase()`.', '`replace(/[^a-z0-9]+/g, "-")`.', '`replace(/^-+|-+$/g, "")`.'],
    time: 'O(n)',
    space: 'O(n)',
    complexityWhy: 'Cada etapa percorre o texto uma vez.',
    pitfalls: ['Remover acentos depois de trocar os símbolos: o acento separado viraria hífen.', 'Trocar cada símbolo por hífen (sem o `+`) e gerar "promocao--50--off".', 'Esquecer de aparar o hífen do fim.'],
  },
  solution: {
    js: `function slugify(title) {
  const semAcento = title.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '');
  return semAcento
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
`,
    ts: `function slugify(title: string): string {
  const semAcento = title.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '');
  return semAcento
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
`,
  },
}

export const maskCard: Problem = {
  id: 'js-mask-card',
  title: 'Mascarando o cartão',
  difficulty: 'Fácil',
  pattern: 'strings',
  fnName: 'maskCard',
  params: ['cardNumber'],
  description: `
Na tela "Meus pagamentos", o número do cartão nunca aparece inteiro: só os **4 últimos dígitos**.

Escreva \`maskCard(cardNumber)\`:

1. remova espaços e hífens;
2. troque todos os dígitos, menos os 4 últimos, por \`*\`;
3. se sobrar 4 dígitos ou menos, retorne-os sem máscara.
`,
  examples: [
    { input: 'maskCard("1234 5678 9012 3456")', output: '"************3456"' },
    { input: 'maskCard("4111-1111-1111-1111")', output: '"************1111"' },
  ],
  constraints: [],
  starter: starter('function maskCard(cardNumber)', 'function maskCard(cardNumber: string): string', '/**\n * @param {string} cardNumber\n * @return {string}\n */'),
  tests: [
    { input: ['1234 5678 9012 3456'], expected: '************3456', label: 'Com espaços' },
    { input: ['4111-1111-1111-1111'], expected: '************1111', label: 'Com hífens' },
    { input: ['378282246310005'], expected: '***********0005', label: '15 dígitos' },
    { input: ['1234'], expected: '1234', label: 'Só 4 dígitos' },
    { input: ['12'], expected: '12', label: 'Menos de 4' },
  ],
  hints: [
    'Limpe com `replaceAll(" ", "")` e `replaceAll("-", "")`.',
    'Os 4 últimos: `digits.slice(-4)`.',
    '`ultimos.padStart(digits.length, "*")` completa a esquerda com asteriscos até o tamanho original.',
  ],
  explanation: {
    intuition: '`slice(-4)` pega o final e `padStart` preenche o começo até o tamanho certo: duas chamadas resolvem a máscara, sem loop.',
    steps: ['`digits = cardNumber.replaceAll(" ", "").replaceAll("-", "")`.', 'Se `digits.length <= 4`, retorne `digits`.', 'Retorne `digits.slice(-4).padStart(digits.length, "*")`.'],
    time: 'O(n)',
    space: 'O(n)',
    complexityWhy: 'Cada operação percorre a string uma vez.',
    pitfalls: ['Mascarar antes de limpar (os espaços contariam no tamanho).', '`replace` sem `All` troca só a primeira ocorrência.'],
  },
  solution: {
    js: `function maskCard(cardNumber) {
  const digits = cardNumber.replaceAll(' ', '').replaceAll('-', '');
  if (digits.length <= 4) return digits;
  return digits.slice(-4).padStart(digits.length, '*');
}
`,
    ts: `function maskCard(cardNumber: string): string {
  const digits = cardNumber.replaceAll(' ', '').replaceAll('-', '');
  if (digits.length <= 4) return digits;
  return digits.slice(-4).padStart(digits.length, '*');
}
`,
  },
}

export const BASICO_PROBLEMS: Problem[] = [
  toFahrenheit,
  splitBill,
  formatDuration,
  gradeStatus,
  isLeapYear,
  shippingCost,
  fizzBuzz,
  countVowels,
  reverseString,
  monthsToGoal,
  applyDiscount,
  checkPassword,
  applyNTimes,
  capitalizeWords,
  isPalindrome,
  slugify,
  maskCard,
]
