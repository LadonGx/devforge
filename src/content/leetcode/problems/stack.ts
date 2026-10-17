import type { Problem } from '../../types'

export const validParentheses: Problem = {
  id: 'valid-parentheses',
  title: 'Valid Parentheses',
  difficulty: 'Fácil',
  pattern: 'stack',
  leetcode: { number: 20, slug: 'valid-parentheses' },
  fnName: 'isValid',
  params: ['s'],
  description: `
Dada uma string \`s\` contendo apenas \`(\`, \`)\`, \`{\`, \`}\`, \`[\` e \`]\`, determine se ela é **válida**:

1. Todo símbolo aberto é fechado pelo **mesmo tipo**.
2. Os símbolos são fechados na **ordem correta** (o último aberto fecha primeiro).
3. Todo fechamento tem uma abertura correspondente.
`,
  examples: [
    { input: 's = "()"', output: 'true' },
    { input: 's = "()[]{}"', output: 'true' },
    { input: 's = "(]"', output: 'false' },
    { input: 's = "([])"', output: 'true' },
  ],
  constraints: ['1 <= s.length <= 10^4', "s contém apenas '()[]{}'"],
  starter: {
    js: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {

}
`,
    ts: `function isValid(s: string): boolean {

}
`,
  },
  tests: [
    { input: ['()'], expected: true, label: 'Exemplo 1' },
    { input: ['()[]{}'], expected: true, label: 'Exemplo 2' },
    { input: ['(]'], expected: false, label: 'Exemplo 3' },
    { input: ['([])'], expected: true, label: 'Aninhado' },
    { input: ['([)]'], expected: false, label: 'Cruzado' },
    { input: ['(('], expected: false, label: 'Sobrou aberto' },
    { input: ['){'], expected: false, label: 'Fecha sem abrir' },
    { input: ['{[()()]}'], expected: true, label: 'Profundo' },
  ],
  hints: [
    'Quando aparece um fechamento, com qual abertura ele precisa casar?',
    'Com a **última abertura ainda não fechada**. "Último que entrou, primeiro que sai" = pilha.',
    'Empilhe aberturas. Num fechamento, desempilhe e confira o par. No fim, a pilha precisa estar vazia.',
  ],
  explanation: {
    intuition: `
O fechamento sempre precisa casar com a abertura **mais recente** que ainda está pendente. Isso é a definição de uma **pilha**.

Use um mapa \`fechamento → abertura\` para conferir os pares rapidamente.
`,
    steps: [
      "`pairs = { ')': '(', ']': '[', '}': '{' }`, `stack = []`.",
      'Para cada caractere: se for abertura, `push`.',
      'Se for fechamento: se `stack.pop() !== pairs[ch]`, retorne `false`.',
      'No fim: retorne `stack.length === 0`.',
    ],
    time: 'O(n)',
    space: 'O(n)',
    complexityWhy: 'Cada caractere entra e sai da pilha no máximo uma vez.',
    pitfalls: ['Esquecer de checar a pilha vazia no fim (`"(("`).', 'Contar parênteses com um contador simples: não detecta `"([)]"`.'],
  },
  solution: {
    js: `function isValid(s) {
  const pairs = { ')': '(', ']': '[', '}': '{' };
  const stack = [];
  for (const ch of s) {
    if (ch in pairs) {
      if (stack.pop() !== pairs[ch]) return false;
    } else {
      stack.push(ch);
    }
  }
  return stack.length === 0;
}
`,
    ts: `function isValid(s: string): boolean {
  const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
  const stack: string[] = [];
  for (const ch of s) {
    if (ch in pairs) {
      if (stack.pop() !== pairs[ch]) return false;
    } else {
      stack.push(ch);
    }
  }
  return stack.length === 0;
}
`,
  },
  perf: { gen: (n: number) => ['('.repeat(n) + ')'.repeat(n)], n: 50000, limitMs: 2500, label: '100.000 parênteses' },
}

export const evalRPN: Problem = {
  id: 'eval-rpn',
  title: 'Evaluate Reverse Polish Notation',
  difficulty: 'Médio',
  pattern: 'stack',
  leetcode: { number: 150, slug: 'evaluate-reverse-polish-notation' },
  fnName: 'evalRPN',
  params: ['tokens'],
  description: `
Avalie uma expressão em **notação polonesa reversa** (RPN), dada como array de tokens.

- Operadores válidos: \`+\`, \`-\`, \`*\`, \`/\`.
- Cada operando é um inteiro ou o resultado de outra expressão.
- A divisão **trunca em direção a zero** (\`7 / -2 = -3\`).
- A expressão é sempre válida e não há divisão por zero.

Em RPN, o operador vem **depois** dos operandos: \`["2","1","+","3","*"]\` significa \`(2 + 1) * 3\`.
`,
  examples: [
    { input: 'tokens = ["2","1","+","3","*"]', output: '9', explanation: '((2 + 1) * 3) = 9' },
    { input: 'tokens = ["4","13","5","/","+"]', output: '6', explanation: '(4 + (13 / 5)) = 4 + 2 = 6' },
  ],
  constraints: ['1 <= tokens.length <= 10^4', 'tokens[i] é um operador ou um inteiro entre -200 e 200'],
  starter: {
    js: `/**
 * @param {string[]} tokens
 * @return {number}
 */
function evalRPN(tokens) {

}
`,
    ts: `function evalRPN(tokens: string[]): number {

}
`,
  },
  tests: [
    { input: [['2', '1', '+', '3', '*']], expected: 9, label: 'Exemplo 1' },
    { input: [['4', '13', '5', '/', '+']], expected: 6, label: 'Exemplo 2' },
    { input: [['10', '6', '9', '3', '+', '-11', '*', '/', '*', '17', '+', '5', '+']], expected: 22, label: 'Longo' },
    { input: [['7', '-2', '/']], expected: -3, label: 'Divisão negativa trunca para zero' },
    { input: [['3', '4', '-']], expected: -1, label: 'Ordem da subtração' },
    { input: [['42']], expected: 42, label: 'Só um número' },
  ],
  hints: [
    'Ao ler um número, ainda não sabe o que fazer com ele. Guarde-o. Onde?',
    'Ao ler um operador, ele se aplica aos **dois últimos** números guardados. Pilha!',
    'Cuidado com a ordem: `b = pop()`, `a = pop()`, resultado `a op b`. Para a divisão use `Math.trunc(a / b)`.',
  ],
  explanation: {
    intuition: `
Em RPN, cada operador usa os **dois resultados mais recentes**. Uma pilha guarda exatamente isso:

- número → \`push\`
- operador → \`pop\` dois, calcula, \`push\` do resultado

No fim sobra um único valor: a resposta.
`,
    steps: [
      'Para cada token: se for operador, `b = stack.pop()`, `a = stack.pop()`.',
      'Calcule `a + b`, `a - b`, `a * b` ou `Math.trunc(a / b)` e faça `push`.',
      'Se for número, `push(Number(token))`.',
      'Retorne `stack.pop()`.',
    ],
    time: 'O(n)',
    space: 'O(n)',
    complexityWhy: 'Cada token é processado uma vez com operações O(1) na pilha.',
    pitfalls: [
      'Inverter a ordem: `pop()` devolve primeiro o operando da **direita**. `["3","4","-"]` é `3 - 4`.',
      '`Math.floor(-3.5)` dá -4; a divisão pedida trunca para zero: `Math.trunc` (ou `| 0`).',
      'Tokens são strings: `"2" + "1"` vira `"21"`. Converta com `Number()`.',
    ],
  },
  solution: {
    js: `function evalRPN(tokens) {
  const stack = [];
  for (const t of tokens) {
    if (t === '+' || t === '-' || t === '*' || t === '/') {
      const b = stack.pop();
      const a = stack.pop();
      if (t === '+') stack.push(a + b);
      else if (t === '-') stack.push(a - b);
      else if (t === '*') stack.push(a * b);
      else stack.push(Math.trunc(a / b));
    } else {
      stack.push(Number(t));
    }
  }
  return stack.pop();
}
`,
    ts: `function evalRPN(tokens: string[]): number {
  const stack: number[] = [];
  for (const t of tokens) {
    if (t === '+' || t === '-' || t === '*' || t === '/') {
      const b = stack.pop()!;
      const a = stack.pop()!;
      if (t === '+') stack.push(a + b);
      else if (t === '-') stack.push(a - b);
      else if (t === '*') stack.push(a * b);
      else stack.push(Math.trunc(a / b));
    } else {
      stack.push(Number(t));
    }
  }
  return stack.pop()!;
}
`,
  },
}

export const dailyTemperatures: Problem = {
  id: 'daily-temperatures',
  title: 'Daily Temperatures',
  difficulty: 'Médio',
  pattern: 'stack',
  leetcode: { number: 739, slug: 'daily-temperatures' },
  fnName: 'dailyTemperatures',
  params: ['temperatures'],
  description: `
Dado um array \`temperatures\` com a temperatura de cada dia, retorne um array \`answer\` onde \`answer[i]\` é **quantos dias você precisa esperar** depois do dia \`i\` até uma temperatura **mais quente**.

Se não houver dia futuro mais quente, \`answer[i] = 0\`.
`,
  examples: [
    { input: 'temperatures = [73,74,75,71,69,72,76,73]', output: '[1,1,4,2,1,1,0,0]' },
    { input: 'temperatures = [30,40,50,60]', output: '[1,1,1,0]' },
    { input: 'temperatures = [30,60,90]', output: '[1,1,0]' },
  ],
  constraints: ['1 <= temperatures.length <= 10^5', '30 <= temperatures[i] <= 100'],
  starter: {
    js: `/**
 * @param {number[]} temperatures
 * @return {number[]}
 */
function dailyTemperatures(temperatures) {

}
`,
    ts: `function dailyTemperatures(temperatures: number[]): number[] {

}
`,
  },
  tests: [
    { input: [[73, 74, 75, 71, 69, 72, 76, 73]], expected: [1, 1, 4, 2, 1, 1, 0, 0], label: 'Exemplo 1' },
    { input: [[30, 40, 50, 60]], expected: [1, 1, 1, 0], label: 'Exemplo 2 (sempre sobe)' },
    { input: [[30, 60, 90]], expected: [1, 1, 0], label: 'Exemplo 3' },
    { input: [[90, 80, 70]], expected: [0, 0, 0], label: 'Sempre desce' },
    { input: [[50, 50, 51]], expected: [2, 1, 0], label: 'Iguais não contam como mais quente' },
    { input: [[70]], expected: [0], label: 'Um dia' },
  ],
  hints: [
    'Força bruta: para cada dia, ande para frente até achar um mais quente. O(n²) no pior caso (`[90, 80, 70, ...]`).',
    'Ao contrário: quando chega um dia quente, ele "resolve" vários dias anteriores mais frios que estavam esperando. Quais?',
    'Guarde numa pilha os **índices** dos dias ainda sem resposta. Enquanto a temperatura de hoje for maior que a do topo, desempilhe e preencha `answer[topo] = i - topo`.',
  ],
  explanation: {
    intuition: `
Mantemos uma pilha de **dias pendentes** (que ainda não encontraram um dia mais quente). As temperaturas nessa pilha ficam sempre **decrescentes** do fundo para o topo — por isso é chamada de **pilha monotônica**.

Quando chega o dia \`i\`, ele é a resposta para todos os pendentes **mais frios** que ele que estão no topo. Desempilhamos esses, calculamos a distância \`i - j\` e, por fim, empilhamos \`i\` (agora ele é que está esperando).
`,
    steps: [
      '`answer = new Array(n).fill(0)`, `stack = []` (índices).',
      'Para cada `i`: enquanto a pilha não estiver vazia e `temperatures[i] > temperatures[topo]`: `j = stack.pop()`, `answer[j] = i - j`.',
      '`stack.push(i)`.',
      'Quem sobrar na pilha nunca esquentou: já está 0.',
    ],
    time: 'O(n)',
    space: 'O(n)',
    complexityWhy: 'Apesar do while dentro do for, cada índice é empilhado e desempilhado **no máximo uma vez**: 2n operações no total.',
    pitfalls: ['Empilhar **temperaturas** em vez de **índices**: aí não dá para calcular a distância.', 'Usar `>=`: temperatura igual não é "mais quente".'],
  },
  bruteForce: { idea: 'Para cada i, procurar o primeiro j > i com temperatura maior.', complexity: 'O(n²)' },
  solution: {
    js: `function dailyTemperatures(temperatures) {
  const answer = new Array(temperatures.length).fill(0);
  const stack = []; // índices de dias pendentes
  for (let i = 0; i < temperatures.length; i++) {
    while (stack.length && temperatures[i] > temperatures[stack[stack.length - 1]]) {
      const j = stack.pop();
      answer[j] = i - j;
    }
    stack.push(i);
  }
  return answer;
}
`,
    ts: `function dailyTemperatures(temperatures: number[]): number[] {
  const answer: number[] = new Array(temperatures.length).fill(0);
  const stack: number[] = []; // índices de dias pendentes
  for (let i = 0; i < temperatures.length; i++) {
    while (stack.length && temperatures[i] > temperatures[stack[stack.length - 1]]) {
      const j = stack.pop()!;
      answer[j] = i - j;
    }
    stack.push(i);
  }
  return answer;
}
`,
  },
  perf: { gen: (n: number) => [Array.from({ length: n }, (_, i) => 100 - Math.floor((i * 70) / n))], n: 100000, limitMs: 2500, label: 'n = 100.000, temperaturas caindo' },
}
