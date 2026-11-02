import type { Exam } from '../types'
import { starter } from '../js/helpers'

export const PROVA_1: Exam = {
  id: 'prova-1',
  title: 'Prova 1 · Base da linguagem',
  stage: 'base',
  summary: 'Variáveis, operadores, decisões, loops, funções e strings. O mesmo nível do aquecimento de um live coding: ler código com atenção, escrever funções pequenas e explicar conceitos básicos com clareza.',
  minutes: 35,
  passPct: 70,
  questions: [
    {
      kind: 'choice',
      id: 'p1-let-const',
      topic: 'js-fundamentos:variaveis',
      prompt: 'Você precisa de uma variável para contar quantos itens válidos existem numa lista, somando 1 a cada item. Qual declaração usar?',
      options: ['`let total = 0`', '`const total = 0`', '`var total = 0`', 'Tanto faz: as três se comportam igual'],
      answer: 0,
      explain: 'O contador vai ser **reatribuído** (`total++`), então precisa de `let`. `const` lançaria TypeError no primeiro `++`. `var` funciona, mas tem escopo de função e hoisting, por isso é evitado em código moderno.',
    },
    {
      kind: 'choice',
      id: 'p1-truthy',
      topic: 'js-fundamentos:condicionais',
      prompt: 'Qual destes valores é **truthy** (faz um `if` entrar no bloco)?',
      options: ['`"0"`', '`0`', '`""`', '`null`'],
      answer: 0,
      explain: 'Os falsy são só `false`, `0`, `""`, `null`, `undefined` e `NaN`. A string `"0"` **não é vazia**, então é truthy. Pegadinha comum com valores vindos de formulário, que sempre chegam como string.',
    },
    {
      kind: 'choice',
      id: 'p1-guard',
      topic: 'js-fundamentos:condicionais',
      prompt: 'Numa revisão de código, qual sugestão deixa esta função mais legível, segundo as boas práticas?',
      code: `function podeComprar(user, produto) {
  if (user) {
    if (user.ativo) {
      if (produto.estoque > 0) {
        return true;
      }
    }
  }
  return false;
}`,
      options: [
        'Usar guard clauses: tratar cada caso inválido com `return` no começo e deixar o caminho feliz no fim',
        'Transformar os ifs num `switch`',
        'Juntar tudo num ternário aninhado em uma linha',
        'Adicionar comentários explicando cada `if`',
      ],
      answer: 0,
      explain: 'Guard clauses (retorno antecipado) removem o aninhamento: cada regra vira uma linha (`if (!user) return false;`). Ternários aninhados pioram a leitura e comentários não resolvem a estrutura.',
    },
    {
      kind: 'choice',
      id: 'p1-return',
      topic: 'js-fundamentos:funcoes',
      prompt: 'Qual a diferença entre `return` e `console.log` dentro de uma função?',
      options: [
        '`return` devolve o valor para quem chamou e encerra a função; `console.log` só mostra o valor no console',
        'Nenhuma: os dois devolvem o valor',
        '`console.log` encerra a função; `return` não',
        '`return` só funciona em arrow functions',
      ],
      answer: 0,
      explain: 'Uma função que só faz `console.log` devolve `undefined` para quem chamou. É por isso que testes automáticos (e o resto do seu programa) não "enxergam" valores apenas impressos.',
    },
    {
      kind: 'choice',
      id: 'p1-nome-funcao',
      topic: 'js-fundamentos:funcoes',
      prompt: 'Qual o **melhor nome** para uma função que recebe um pedido e devolve o valor do frete?',
      options: ['`calcularFrete(pedido)`', '`frete(p)`', '`processar(dados)`', '`calcularFreteESalvarPedido(pedido)`'],
      answer: 0,
      explain: 'Verbo + o que faz + parâmetro com nome claro. `frete(p)` não diz que é um cálculo e `p` não diz o que é; `processar(dados)` é genérico demais; e um nome com "E" indica duas responsabilidades numa função só.',
    },
    {
      kind: 'choice',
      id: 'p1-string-imutavel',
      topic: 'js-fundamentos:strings',
      prompt: 'Depois deste código, qual o valor de `nome`?',
      code: `let nome = "ana";
nome.toUpperCase();
nome.trim();`,
      options: ['`"ana"`', '`"ANA"`', '`"Ana"`', '`undefined`'],
      answer: 0,
      explain: 'Strings são **imutáveis**: os métodos devolvem uma string nova, e aqui ninguém guardou o retorno. Correção: `nome = nome.toUpperCase();`.',
    },
    {
      kind: 'output',
      id: 'p1-out-loop',
      topic: 'js-fundamentos:loops',
      code: `for (let i = 1; i <= 6; i++) {
  if (i % 2 === 0) continue;
  if (i > 4) break;
  console.log(i);
}`,
      expected: ['1', '3'],
      explain: 'Os pares são pulados pelo `continue` (2, 4, 6 nunca chegam ao log). O 1 e o 3 são impressos. No 5, `i > 4` é verdadeiro e o `break` encerra o loop antes do log.',
    },
    {
      kind: 'output',
      id: 'p1-out-math',
      topic: 'js-fundamentos:variaveis',
      code: `const minutos = 135;
console.log(Math.floor(minutos / 60), minutos % 60);
console.log(0.1 + 0.2 === 0.3);
console.log(typeof (5 + ""));`,
      expected: ['2 15', 'false', 'string'],
      explain: '135 / 60 = 2,25 → `Math.floor` dá 2; o resto é 15 (o `console.log` com dois argumentos separa por espaço). `0.1 + 0.2` é `0.30000000000000004`, então a comparação é false. E `5 + ""` concatena: vira a string `"5"`.',
    },
    {
      kind: 'output',
      id: 'p1-out-strings',
      topic: 'js-fundamentos:strings',
      code: `const s = "  JavaScript  ";
console.log(s.trim().length);
console.log(s.trim().slice(0, 4).toUpperCase());
console.log("a-b-c".split("-").join(""));`,
      expected: ['10', 'JAVA', 'abc'],
      explain: '`trim()` tira os espaços das pontas: "JavaScript" tem 10 letras. `slice(0, 4)` pega do índice 0 até antes do 4: "Java". E `split("-")` + `join("")` remove os hífens.',
    },
    {
      kind: 'output',
      id: 'p1-out-if',
      topic: 'js-fundamentos:condicionais',
      code: `function tamanho(n) {
  if (n > 10) return "grande";
  else if (n > 5) return "médio";
  return "pequeno";
}
console.log(tamanho(10));
console.log(tamanho(5));
console.log(tamanho(11));`,
      expected: ['médio', 'pequeno', 'grande'],
      explain: 'Atenção aos limites: 10 **não** é maior que 10, mas é maior que 5 → "médio". 5 não é maior que 5 → "pequeno". 11 → "grande".',
    },
    {
      kind: 'code',
      id: 'p1-code-words',
      topic: 'js-fundamentos:strings',
      problem: {
        id: 'prova-count-words',
        title: 'Contar palavras',
        difficulty: 'Fácil',
        pattern: 'strings',
        fnName: 'countWords',
        params: ['text'],
        description: `
Um editor de texto mostra a contagem de palavras do documento.

Escreva \`countWords(text)\` que retorna quantas **palavras** o texto tem. Palavras são separadas por **um ou mais espaços**, e pode haver espaços no começo e no fim.
`,
        examples: [
          { input: 'countWords("Olá mundo do JS")', output: '4' },
          { input: 'countWords("   muitos    espaços   aqui ")', output: '3' },
        ],
        constraints: [],
        starter: starter('function countWords(text)', 'function countWords(text: string): number', '/**\n * @param {string} text\n * @return {number}\n */'),
        tests: [
          { input: ['Olá mundo do JS'], expected: 4, label: 'Exemplo 1' },
          { input: ['   muitos    espaços   aqui '], expected: 3, label: 'Espaços extras' },
          { input: [''], expected: 0, label: 'Vazio' },
          { input: ['     '], expected: 0, label: 'Só espaços' },
          { input: ['palavra'], expected: 1, label: 'Uma palavra' },
          { input: ['a b c d e f g h'], expected: 8, label: 'Letras soltas' },
        ],
        hints: ['`text.trim().split(" ")` gera strings vazias quando há espaços repetidos: ignore as vazias.'],
        explanation: {
          intuition: 'Quebrar o texto com `split` e contar só os pedaços não vazios. Os espaços repetidos geram pedaços vazios, e um texto vazio gera `[""]`, que também não é palavra.',
          steps: ['`text.split(" ")`.', 'Conte os pedaços com `p !== ""`.'],
          time: 'O(n)',
          space: 'O(n)',
          complexityWhy: 'Uma passada pelo texto.',
          pitfalls: ['`"".split(" ").length` é 1, não 0.', 'Contar espaços + 1 falha com espaços repetidos.'],
        },
        solution: {
          js: `function countWords(text) {
  let count = 0;
  for (const p of text.split(' ')) {
    if (p !== '') count++;
  }
  return count;
}
`,
          ts: `function countWords(text: string): number {
  let count = 0;
  for (const p of text.split(' ')) {
    if (p !== '') count++;
  }
  return count;
}
`,
        },
      },
    },
    {
      kind: 'code',
      id: 'p1-code-digits',
      topic: 'js-fundamentos:loops',
      problem: {
        id: 'prova-sum-digits',
        title: 'Soma dos dígitos',
        difficulty: 'Fácil',
        pattern: 'loops',
        fnName: 'sumDigits',
        params: ['n'],
        description: `
Escreva \`sumDigits(n)\` que retorna a **soma dos dígitos** de um número inteiro. Para negativos, ignore o sinal.

Tente fazer **sem** converter para string: use \`% 10\` para pegar o último dígito e \`Math.floor(n / 10)\` para removê-lo.
`,
        examples: [
          { input: 'sumDigits(1234)', output: '10' },
          { input: 'sumDigits(-505)', output: '10' },
        ],
        constraints: ['-10^9 <= n <= 10^9'],
        starter: starter('function sumDigits(n)', 'function sumDigits(n: number): number', '/**\n * @param {number} n\n * @return {number}\n */'),
        tests: [
          { input: [1234], expected: 10, label: 'Exemplo 1' },
          { input: [-505], expected: 10, label: 'Negativo' },
          { input: [0], expected: 0, label: 'Zero' },
          { input: [7], expected: 7, label: 'Um dígito' },
          { input: [999999999], expected: 81, label: 'Nove noves' },
          { input: [1000000], expected: 1, label: 'Muitos zeros' },
        ],
        hints: ['`n = Math.abs(n)` primeiro.', '`while (n > 0) { soma += n % 10; n = Math.floor(n / 10); }`.'],
        explanation: {
          intuition: '`n % 10` é sempre o último dígito e `Math.floor(n / 10)` "corta" esse dígito. Repetindo até o número zerar, você visita todos os dígitos da direita para a esquerda.',
          steps: ['`n = Math.abs(n)`.', 'Enquanto `n > 0`: some `n % 10` e faça `n = Math.floor(n / 10)`.', 'Retorne a soma.'],
          time: 'O(d)',
          space: 'O(1)',
          complexityWhy: 'd = quantidade de dígitos.',
          pitfalls: ['Esquecer o `Math.abs`: com negativos o `while (n > 0)` nem entra.', '`n / 10` sem `Math.floor` gera decimais e o loop não termina como esperado.'],
        },
        solution: {
          js: `function sumDigits(n) {
  n = Math.abs(n);
  let soma = 0;
  while (n > 0) {
    soma += n % 10;
    n = Math.floor(n / 10);
  }
  return soma;
}
`,
          ts: `function sumDigits(n: number): number {
  n = Math.abs(n);
  let soma = 0;
  while (n > 0) {
    soma += n % 10;
    n = Math.floor(n / 10);
  }
  return soma;
}
`,
        },
      },
    },
    {
      kind: 'essay',
      id: 'p1-essay-let-const-var',
      topic: 'js-fundamentos:variaveis',
      prompt: 'Entrevistador: **"Qual a diferença entre `let`, `const` e `var`? Qual você usa no dia a dia?"**',
      model: `
\`const\` e \`let\` têm **escopo de bloco**: só existem dentro do \`{ }\` onde foram declaradas. A diferença entre elas é que \`const\` **não pode ser reatribuída** e \`let\` pode.

\`var\` é a forma antiga: tem **escopo de função** (ignora blocos como \`if\` e \`for\`) e sofre **hoisting** com valor \`undefined\`, então dá para usar antes da declaração sem erro, o que esconde bugs.

No dia a dia uso **\`const\` por padrão** e \`let\` só quando preciso reatribuir (contadores, acumuladores). Não uso \`var\`. Vale lembrar que \`const\` não deixa o **objeto** imutável: \`const lista = []; lista.push(1)\` funciona.
`,
      checklist: [
        '`const` não pode ser reatribuída; `let` pode',
        '`let` e `const` têm escopo de bloco',
        '`var` tem escopo de função',
        'Mencionou hoisting do `var` (vale `undefined` antes da declaração)',
        'Disse o que usa na prática (`const` por padrão, `let` quando precisa, sem `var`)',
        '`const` não torna objetos/arrays imutáveis',
      ],
    },
    {
      kind: 'essay',
      id: 'p1-essay-pura',
      topic: 'js-fundamentos:funcoes',
      prompt: 'Entrevistador: **"O que é uma função pura? Por que ela é mais fácil de testar?"** Se quiser, dê um exemplo.',
      model: `
Uma função **pura** é aquela que:

1. para a **mesma entrada**, sempre devolve a **mesma saída**;
2. **não tem efeitos colaterais**: não altera variáveis de fora, não muda os parâmetros recebidos, não faz requisição nem escreve no console ou no banco.

Exemplo: \`const somar = (a, b) => a + b\` é pura. Já uma função que lê a hora atual (\`new Date()\`) ou faz \`lista.push(x)\` num array recebido não é.

Ela é fácil de testar porque o teste só precisa **chamar com uma entrada e conferir a saída**: não precisa preparar estado, banco ou mocks, e o resultado não muda de uma execução para outra. Também é mais fácil de entender e reaproveitar.
`,
      checklist: [
        'Mesma entrada → mesma saída',
        'Sem efeitos colaterais (não altera nada de fora nem os parâmetros)',
        'Deu um exemplo de função pura (ou de uma que não é)',
        'Explicou que o teste só compara entrada e saída, sem preparar estado/mocks',
      ],
    },
  ],
}
