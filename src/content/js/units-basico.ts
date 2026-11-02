import type { Pattern } from '../types'

/** Parte 1 · Primeiros passos: do zero até funções e strings. */
export const BASICO_UNITS: Pattern[] = [
  /* ============================================================ */
  {
    id: 'variaveis',
    title: 'Variáveis, tipos e operações',
    short: 'let, const, os tipos primitivos e as contas do dia a dia.',
    summary: 'Guardar valores com nome, saber de que tipo eles são e fazer contas sem cair nas pegadinhas dos números.',
    color: '#f0db4f',
    problems: ['js-to-fahrenheit', 'js-split-bill', 'js-format-duration'],
    lesson: [
      {
        type: 'analogy',
        title: 'Variável é uma caixa com etiqueta',
        md: `
Pense numa mudança de casa: você guarda as coisas em **caixas** e escreve uma **etiqueta** em cada uma ("cozinha", "livros"). Depois, para achar algo, você procura pela etiqueta, não abre caixa por caixa.

Uma **variável** é exatamente isso: um **nome** (a etiqueta) que aponta para um **valor** (o conteúdo da caixa).

- \`let\` é uma etiqueta escrita a **lápis**: dá para apagar e colocar outro conteúdo na caixa (\`let idade = 20; idade = 21;\`).
- \`const\` é uma etiqueta escrita a **caneta**: aquele nome vai apontar para aquele valor até o fim. Tentar trocar dá erro.
`,
      },
      {
        type: 'text',
        md: `
### Declarando variáveis

\`\`\`
const nome = "Ana";       // não vai mudar
let saldo = 100;          // vai mudar
saldo = saldo - 30;       // agora vale 70
\`\`\`

- Use **\`const\` por padrão**. Só troque para \`let\` quando você **precisar** reatribuir (contadores, acumuladores).
- **Não use \`var\`**: é a forma antiga, com regras de escopo confusas (você vai entender o motivo na aula de escopo).
- Nomes em **camelCase** e que digam o que guardam: \`precoTotal\`, \`usuarioLogado\`. Evite \`x\`, \`aux\`, \`dados2\`.
`,
      },
      {
        type: 'text',
        md: `
### Os tipos primitivos

Todo valor tem um **tipo**. Os que você mais vai usar:

- **\`string\`**: texto, entre aspas: \`"Ana"\`, \`'Americana'\`, \`\` \`Olá, \${nome}\` \`\` (com crase, aceita variáveis dentro).
- **\`number\`**: qualquer número, inteiro ou decimal: \`42\`, \`3.14\`, \`-7\`. Não existe tipo separado para inteiro.
- **\`boolean\`**: \`true\` ou \`false\`.
- **\`undefined\`**: "ainda não tem valor" (variável declarada e não preenchida).
- **\`null\`**: "vazio de propósito" (você decidiu que não há valor).

Para descobrir o tipo, use \`typeof\`: \`typeof "oi"\` é \`"string"\`, \`typeof 42\` é \`"number"\`.
`,
      },
      {
        type: 'analogy',
        title: 'undefined × null',
        md: 'Num formulário de cadastro, o campo **"telefone" em branco porque a pessoa ainda não chegou nele** é `undefined`. O campo **marcado como "não tenho telefone"** é `null`. Os dois significam "sem valor", mas o `null` foi uma **decisão**.',
      },
      {
        type: 'text',
        md: `
### Operações com números

- \`+ - * /\` funcionam como na calculadora. \`**\` é potência: \`2 ** 3\` é 8.
- \`%\` é o **resto da divisão**: \`10 % 3\` é 1. Serve para saber se um número é par (\`n % 2 === 0\`), para "dar a volta" (ponteiro de relógio) e para separar horas, minutos e segundos.
- \`Math.floor\` (arredonda para baixo), \`Math.ceil\` (para cima), \`Math.round\` (para o mais próximo), \`Math.max\`/\`Math.min\`.
- \`x += 5\` é o mesmo que \`x = x + 5\`. \`x++\` soma 1.
`,
      },
      {
        type: 'demo',
        title: 'Calculando o troco',
        caption: 'Avance passo a passo e veja cada variável nascer e mudar. Repare no uso de Math.floor e % para separar notas e moedas.',
        fnName: 'troco',
        input: [87, 100],
        code: `function troco(preco, pago) {
  const total = pago - preco;
  const notasDe10 = Math.floor(total / 10);
  let resto = total % 10;
  const notasDe5 = Math.floor(resto / 5);
  resto = resto % 5;
  return { total, notasDe10, notasDe5, moedasDe1: resto };
}
`,
      },
      {
        type: 'quiz',
        question: 'Qual o valor de `resto`?',
        code: `const minutos = 135;
const horas = Math.floor(minutos / 60);
const resto = minutos % 60;`,
        options: ['15', '2', '2.25', '75'],
        answer: 0,
        explain: '135 / 60 = 2,25, então `horas` é 2 (arredondado para baixo). O resto da divisão de 135 por 60 é 135 − 120 = **15**. É assim que se converte 135 minutos em "2h15".',
      },
      {
        type: 'text',
        md: `
### A pegadinha dos decimais

\`\`\`
0.1 + 0.2          // 0.30000000000000004
\`\`\`

Não é bug do JavaScript: o computador guarda números em **binário**, e 0,1 não tem representação exata em binário (assim como 1/3 não tem em decimal: 0,333...). Acontece em quase todas as linguagens.

Na prática:

- Para **mostrar**, arredonde: \`valor.toFixed(2)\` devolve a **string** \`"0.30"\`.
- Para **calcular dinheiro**, trabalhe em **centavos** (inteiros) ou arredonde no fim: \`Math.round(valor * 100) / 100\`.
`,
      },
      {
        type: 'quiz',
        question: 'O que acontece?',
        code: `const taxa = 0.05;
taxa = 0.07;`,
        options: ['TypeError: Assignment to constant variable', 'taxa passa a valer 0.07', 'taxa continua 0.05 sem erro'],
        answer: 0,
        explain: '`const` não permite **reatribuir**. O erro aparece na hora, o que é bom: se o valor precisa mudar, declare com `let`.',
      },
      {
        type: 'callout',
        tone: 'tip',
        title: 'Boas práticas desde o primeiro dia',
        md: `
- \`const\` por padrão, \`let\` quando precisar, \`var\` nunca.
- Nomes que explicam: \`const PRAZO_EM_DIAS = 30\` é melhor que um \`30\` solto no meio do código (o famoso "número mágico").
- Uma variável, um propósito: não reaproveite \`resultado\` para guardar coisas diferentes ao longo da função.
`,
      },
      {
        type: 'callout',
        tone: 'interview',
        md: '"Qual a diferença entre `let`, `const` e `var`?" é uma das perguntas mais comuns para júnior. Resposta curta: `const` não pode ser reatribuída, `let` pode; as duas têm **escopo de bloco**. `var` tem escopo de **função** e sofre hoisting com valor `undefined`, por isso é evitada. Detalhes na aula de escopo.',
      },
    ],
  },

  /* ============================================================ */
  {
    id: 'condicionais',
    title: 'Comparações e decisões',
    short: 'if/else, operadores lógicos, ternário e switch.',
    summary: 'Fazer o programa escolher caminhos: comparar valores, combinar condições e escrever ifs que dá gosto de ler.',
    color: '#ff9e64',
    problems: ['js-grade-status', 'js-is-leap-year', 'js-shipping-cost'],
    lesson: [
      {
        type: 'analogy',
        title: 'O porteiro da festa',
        md: `
Na porta de uma festa, o porteiro segue regras: **se** a pessoa está na lista **e** é maior de idade, entra. **Senão, se** é convidada do aniversariante, entra também. **Senão**, fica de fora.

Um \`if\` é esse porteiro: ele avalia uma **condição** (algo que vira \`true\` ou \`false\`) e escolhe qual caminho o código segue.
`,
      },
      {
        type: 'text',
        md: `
### Operadores de comparação

- \`===\` igual (valor **e** tipo) e \`!==\` diferente. **Use sempre esses.**
- \`>\`, \`<\`, \`>=\`, \`<=\`.
- \`==\` e \`!=\` existem, mas convertem os tipos antes de comparar (\`"5" == 5\` é \`true\`). Isso causa bugs; a aula de coerção mostra o porquê.

### Operadores lógicos

- \`&&\` (**E**): verdadeiro se os **dois** lados forem.
- \`||\` (**OU**): verdadeiro se **pelo menos um** for.
- \`!\` (**NÃO**): inverte.

\`\`\`
const podeEntrar = naLista && idade >= 18;
const temDesconto = ehEstudante || idade >= 60;
const bloqueado = !ativo;
\`\`\`
`,
      },
      {
        type: 'text',
        md: `
### if, else if, else

\`\`\`
if (nota >= 7) {
  status = "aprovado";
} else if (nota >= 5) {
  status = "recuperação";
} else {
  status = "reprovado";
}
\`\`\`

As condições são testadas **de cima para baixo** e só o **primeiro** bloco verdadeiro roda. Por isso a **ordem importa**: se você testar \`nota >= 5\` antes de \`nota >= 7\`, um 9 cairia em "recuperação".
`,
      },
      {
        type: 'demo',
        title: 'Classificando a temperatura',
        caption: 'Veja quais linhas são executadas: o JS para no primeiro if verdadeiro e pula o resto.',
        fnName: 'classificar',
        input: [24],
        code: `function classificar(graus) {
  let sensacao;
  if (graus < 10) {
    sensacao = 'frio';
  } else if (graus < 20) {
    sensacao = 'fresco';
  } else if (graus < 30) {
    sensacao = 'agradável';
  } else {
    sensacao = 'calor';
  }
  const levarCasaco = graus < 20 ? 'sim' : 'não';
  return { sensacao, levarCasaco };
}
`,
      },
      {
        type: 'text',
        md: `
### Truthy e falsy

O \`if\` aceita qualquer valor, não só booleanos. Os valores que contam como **falso** (falsy) são poucos e vale decorar:

\`false\`, \`0\`, \`""\` (string vazia), \`null\`, \`undefined\` e \`NaN\`.

**Todo o resto é truthy**, inclusive \`"0"\`, \`"false"\`, \`[]\` e \`{}\`. Então \`if (nome)\` significa "se nome não está vazio".

### Ternário e switch

- **Ternário**: um if/else **que devolve um valor**, em uma linha: \`const label = idade >= 18 ? "adulto" : "menor";\`. Ótimo para escolhas simples; evite ternários aninhados.
- **switch**: compara **um valor** com vários casos fixos. Não esqueça o \`break\` (ou \`return\`), senão ele "cai" no próximo caso.

\`\`\`
switch (diaDaSemana) {
  case "sab":
  case "dom":
    return "fim de semana";
  default:
    return "dia útil";
}
\`\`\`
`,
      },
      {
        type: 'quiz',
        question: 'O que é impresso?',
        code: `const itens = [];
if (itens) console.log("tem itens");
else console.log("carrinho vazio");`,
        options: ['"tem itens"', '"carrinho vazio"', 'TypeError'],
        answer: 0,
        explain: 'Um array, **mesmo vazio**, é um objeto, e todo objeto é truthy. Para saber se o array tem itens, teste o tamanho: `if (itens.length > 0)`.',
      },
      {
        type: 'quiz',
        question: 'Qual o valor de `frete`?',
        code: `const total = 250;
const vip = false;
const frete = total > 200 || vip ? 0 : 19.9;`,
        options: ['0', '19.9', 'true'],
        answer: 0,
        explain: '`total > 200` é true, então `true || vip` é true e o ternário escolhe o primeiro valor: **0**.',
      },
      {
        type: 'compare',
        left: {
          title: 'Ifs aninhados (difícil de ler)',
          md: `
\`\`\`
function podeComprar(user, produto) {
  if (user) {
    if (user.ativo) {
      if (produto.estoque > 0) {
        return true;
      }
    }
  }
  return false;
}
\`\`\`
`,
        },
        right: {
          title: 'Guard clauses (retorno antecipado)',
          md: `
\`\`\`
function podeComprar(user, produto) {
  if (!user) return false;
  if (!user.ativo) return false;
  if (produto.estoque <= 0) return false;
  return true;
}
\`\`\`
`,
        },
      },
      {
        type: 'callout',
        tone: 'tip',
        title: 'Boa prática: guard clauses',
        md: 'Trate os casos inválidos **primeiro**, com `return` cedo, e deixe o "caminho feliz" no fim, sem indentação. O código fica plano e cada regra vira uma linha. É uma das recomendações mais citadas de Clean Code.',
      },
      {
        type: 'callout',
        tone: 'interview',
        md: 'Perguntas comuns: "quais valores são falsy?", "diferença entre `==` e `===`?" e exercícios como FizzBuzz, que testam se você ordena as condições certo (o caso mais específico vem primeiro).',
      },
    ],
  },

  /* ============================================================ */
  {
    id: 'loops',
    title: 'Repetição: for, while e for...of',
    short: 'Repetir sem copiar e colar: contadores, acumuladores e break.',
    summary: 'Percorrer listas, repetir até uma condição e os padrões de acumulador que aparecem em todo exercício.',
    color: '#7dcfff',
    problems: ['js-fizzbuzz', 'js-count-vowels', 'js-reverse-string', 'js-months-to-goal'],
    lesson: [
      {
        type: 'analogy',
        title: 'Lavar a louça',
        md: `
Existem dois jeitos de pensar em repetição:

- **"Lavar os 12 pratos da pilha"**: você sabe **quantas vezes** vai repetir. Esse é o \`for\` com contador (ou o \`for...of\`, que passa por cada item de uma lista).
- **"Lavar até a pia ficar vazia"**: você não sabe quantas vezes, só sabe **quando parar**. Esse é o \`while\`.

E o \`break\` é achar a aliança que você perdeu no meio da louça: não precisa lavar o resto para encontrá-la, você **para na hora**.
`,
      },
      {
        type: 'text',
        md: `
### for clássico

\`\`\`
for (let i = 0; i < 5; i++) {
  console.log(i); // 0, 1, 2, 3, 4
}
\`\`\`

São três partes separadas por \`;\`: **início** (\`let i = 0\`), **condição para continuar** (\`i < 5\`) e **passo** (\`i++\`). Ele é ideal quando você precisa do **índice** (posição).

### for...of: um item de cada vez

\`\`\`
const frutas = ["maçã", "banana", "uva"];
for (const fruta of frutas) {
  console.log(fruta);
}
\`\`\`

Mais simples e sem chance de errar o índice. Funciona com arrays, strings (letra por letra), Map e Set. **Prefira o \`for...of\` quando não precisar do índice.**

### while

\`\`\`
let saldo = 1000;
let meses = 0;
while (saldo > 0) {
  saldo -= 300;
  meses++;
}
\`\`\`

Cuidado: se a condição **nunca** ficar falsa, o loop é **infinito** e trava a página. Sempre garanta que algo dentro do loop aproxima o fim. (Aqui no DevForge os testes rodam isolados, então um loop infinito só gera um aviso de tempo esgotado.)
`,
      },
      {
        type: 'demo',
        title: 'Acumulador: somando os números pares',
        caption: 'Repare em soma (o acumulador) crescendo e em continue pulando os ímpares.',
        fnName: 'somaPares',
        input: [[3, 8, 5, 10, 7, 2]],
        code: `function somaPares(nums) {
  let soma = 0;
  for (const n of nums) {
    if (n % 2 !== 0) continue;
    soma += n;
  }
  return soma;
}
`,
      },
      {
        type: 'text',
        md: `
### Os padrões que resolvem 80% dos exercícios

1. **Acumulador**: começa com um valor neutro (\`0\` para soma, \`1\` para produto, \`""\` para texto, \`[]\` para lista) e vai juntando a cada volta.
2. **Contador**: \`let count = 0\` e \`count++\` quando algo acontece.
3. **Melhor até agora**: guarda o maior/menor visto (\`if (n > maior) maior = n\`).
4. **Busca com parada**: percorre até achar e usa \`break\` ou \`return\`.

- \`break\` **sai** do loop.
- \`continue\` **pula** para a próxima volta.
`,
      },
      {
        type: 'quiz',
        question: 'Quantas vezes "oi" é impresso?',
        code: `for (let i = 0; i <= 3; i++) {
  console.log("oi");
}`,
        options: ['4', '3', '5', 'infinitas'],
        answer: 0,
        explain: 'Com `<=`, o `i` passa por 0, 1, 2 e **3**: quatro voltas. Esse "erro por um" (off-by-one) é o bug mais comum em loops. Para repetir N vezes começando do 0, use `i < N`.',
      },
      {
        type: 'quiz',
        question: 'Qual o valor de `resultado`?',
        code: `let resultado = "";
for (const letra of "casa") {
  resultado = letra + resultado;
}`,
        options: ['"asac"', '"casa"', '"aaaa"', '"c"'],
        answer: 0,
        explain: 'A cada volta a letra nova é colocada **na frente**: "c" → "ac" → "sac" → "asac". É um jeito de inverter uma string com loop.',
      },
      {
        type: 'callout',
        tone: 'warn',
        title: 'for...in não é para arrays',
        md: '`for (const i in array)` percorre as **chaves** como **strings** ("0", "1"...) e pode incluir propriedades extras. Use `for...in` só para objetos (e mesmo assim `Object.keys/entries` costuma ser melhor). Para arrays: `for...of` ou `for` clássico.',
      },
      {
        type: 'callout',
        tone: 'interview',
        md: 'FizzBuzz e "inverter uma string sem `.reverse()`" são aquecimentos clássicos de live coding. O entrevistador observa: você testa os limites (0, 1, vazio)? Escolheu o loop certo? Explica enquanto escreve?',
      },
    ],
  },

  /* ============================================================ */
  {
    id: 'funcoes',
    title: 'Funções',
    short: 'Parâmetros, retorno, arrow functions e funções como valores.',
    summary: 'Empacotar lógica com nome, receber dados, devolver resultado e passar funções para outras funções.',
    color: '#bb9af7',
    problems: ['js-apply-discount', 'js-check-password', 'js-apply-n-times'],
    lesson: [
      {
        type: 'analogy',
        title: 'Uma função é uma receita (ou um liquidificador)',
        md: `
Uma receita de bolo tem **ingredientes** (as entradas), um **modo de preparo** (os passos) e um **resultado** (o bolo). Você escreve a receita **uma vez** e faz o bolo quantas vezes quiser, com ingredientes diferentes.

- Os ingredientes são os **parâmetros**.
- Fazer o bolo é **chamar** a função.
- O bolo que sai do forno é o **retorno** (\`return\`).

Um liquidificador também: entra fruta e leite, sai vitamina. Você não precisa saber como o motor funciona para usar, só o que entra e o que sai.
`,
      },
      {
        type: 'text',
        md: `
### Três jeitos de escrever

\`\`\`
// 1. declaração (pode ser chamada antes da linha onde foi escrita)
function somar(a, b) {
  return a + b;
}

// 2. expressão (função guardada numa variável)
const subtrair = function (a, b) {
  return a - b;
};

// 3. arrow function (a mais usada hoje)
const multiplicar = (a, b) => a * b;          // retorno implícito
const dobrar = (n) => n * 2;
const saudacao = () => { return "oi"; };      // com chaves, precisa de return
\`\`\`

### return × console.log

\`console.log\` só **mostra** na tela; quem chamou a função **não recebe** nada. \`return\` **devolve** o valor para quem chamou e **encerra** a função. Uma função sem \`return\` devolve \`undefined\`.

### Parâmetros com valor padrão

\`\`\`
function parcelar(total, vezes = 1) {
  return total / vezes;
}
parcelar(300);     // 300 (vezes = 1)
parcelar(300, 3);  // 100
\`\`\`
`,
      },
      {
        type: 'demo',
        title: 'Uma função chamando outra',
        caption: 'Veja a pilha de chamadas: precoFinal chama aplicarDesconto, que devolve o valor e sai da pilha.',
        fnName: 'precoFinal',
        input: [200, 15],
        code: `function aplicarDesconto(preco, pct) {
  return preco - preco * (pct / 100);
}

function precoFinal(preco, pct) {
  const comDesconto = aplicarDesconto(preco, pct);
  const frete = comDesconto >= 150 ? 0 : 20;
  return comDesconto + frete;
}
`,
      },
      {
        type: 'text',
        md: `
### Funções são valores

Em JavaScript, uma função pode ser guardada em variável, **passada como argumento** e **devolvida** por outra função. Uma função recebida como argumento é chamada de **callback**.

\`\`\`
function repetir(vezes, acao) {
  for (let i = 0; i < vezes; i++) acao(i);
}
repetir(3, (i) => console.log("volta", i));
\`\`\`

Isso é a base de \`map\`, \`filter\`, \`setTimeout\`, eventos de clique e dos hooks do React.
`,
      },
      {
        type: 'quiz',
        question: 'O que é impresso?',
        code: `function dobro(n) {
  n * 2;
}
console.log(dobro(5));`,
        options: ['undefined', '10', '5', 'NaN'],
        answer: 0,
        explain: 'A conta é feita, mas o resultado não é **devolvido**: sem `return`, a função retorna `undefined`. Bug muito comum, principalmente em arrow functions com chaves.',
      },
      {
        type: 'quiz',
        question: 'Qual o resultado de `calcular(10)`?',
        code: `const calcular = (x, taxa = 0.1) => x + x * taxa;`,
        options: ['11', '10', 'NaN', '10.1'],
        answer: 0,
        explain: 'Como `taxa` não foi passada, usa o padrão `0.1`: `10 + 10 * 0.1 = 11`. O padrão vale quando o argumento é `undefined` (não quando é `null` ou `0`).',
      },
      {
        type: 'callout',
        tone: 'tip',
        title: 'Funções boas são pequenas e honestas',
        md: `
- **Nome com verbo** que diz o que faz: \`calcularFrete\`, \`validarEmail\`, \`buscarUsuario\`.
- **Uma responsabilidade**: se o nome precisa de "e" (\`validarESalvar\`), provavelmente são duas funções.
- **Funções puras** quando possível: mesma entrada → mesma saída, sem alterar nada de fora. São fáceis de testar e de entender.
- Poucos parâmetros (até 3). Mais que isso, receba um objeto: \`criarUsuario({ nome, email, idade })\`.
`,
      },
      {
        type: 'callout',
        tone: 'interview',
        md: '"O que é uma função pura?", "o que é um callback?" e "diferença entre function e arrow function?" (arrow não tem `this` próprio nem `arguments`, e não pode ser usada com `new`; veja a aula de `this`).',
      },
    ],
  },

  /* ============================================================ */
  {
    id: 'strings',
    title: 'Strings: trabalhando com texto',
    short: 'Índices, fatiar, buscar, trocar, dividir e juntar texto.',
    summary: 'Os métodos de string que aparecem em validação de formulário, formatação de dados e em metade dos exercícios de entrevista.',
    color: '#9ece6a',
    problems: ['js-capitalize-words', 'js-is-palindrome', 'js-slugify', 'js-mask-card'],
    lesson: [
      {
        type: 'analogy',
        title: 'Uma string é um colar de contas',
        md: `
Imagine um colar em que cada conta é uma letra. Cada conta tem uma **posição** (começando do **0**), e o colar tem um **comprimento** (\`length\`).

Detalhe importante: o colar é **colado**. Você não consegue trocar uma conta no meio. Para "mudar" o texto, você monta um **colar novo**. Por isso **todos os métodos de string devolvem uma string nova** e nunca alteram a original (strings são **imutáveis**).
`,
      },
      {
        type: 'text',
        md: `
### O básico

\`\`\`
const nome = "Americana";
nome.length          // 9
nome[0]              // "A"
nome.at(-1)          // "a" (última letra)
nome.toUpperCase()   // "AMERICANA"
nome.toLowerCase()   // "americana"
\`\`\`

### Buscar

- \`texto.includes("ana")\`: contém? (true/false)
- \`texto.startsWith("Am")\` / \`endsWith("na")\`
- \`texto.indexOf("a")\`: posição da primeira ocorrência (ou -1)

### Recortar e limpar

- \`texto.slice(início, fim)\`: pedaço do início **até antes** do fim. Aceita negativos: \`slice(-4)\` são os 4 últimos.
- \`texto.trim()\`: remove espaços do começo e do fim (essencial para dados de formulário).
- \`texto.padStart(2, "0")\`: completa à esquerda: \`"7".padStart(2, "0")\` é \`"07"\`.

### Trocar, dividir e juntar

- \`texto.replace("a", "b")\` troca a **primeira**; \`replaceAll\` troca **todas**.
- \`texto.split(" ")\`: quebra em **array** pelo separador. \`split("")\` separa letra por letra.
- \`array.join("-")\`: o caminho inverso, junta um array numa string.
`,
      },
      {
        type: 'demo',
        title: 'Formatando o nome para um crachá',
        caption: 'split transforma a string em array, o loop trata cada palavra e join junta de novo. Repare que nome nunca muda.',
        fnName: 'cracha',
        input: ['  ana   maria SOUZA '],
        code: `function cracha(nome) {
  const partes = nome.trim().toLowerCase().split(' ');
  const palavras = [];
  for (const p of partes) {
    if (p === '') continue;
    palavras.push(p[0].toUpperCase() + p.slice(1));
  }
  const primeiro = palavras[0];
  const ultimo = palavras[palavras.length - 1];
  return primeiro + ' ' + ultimo;
}
`,
      },
      {
        type: 'quiz',
        question: 'Qual o valor de `nome` no final?',
        code: `let nome = "ana";
nome.toUpperCase();`,
        options: ['"ana"', '"ANA"', '"Ana"'],
        answer: 0,
        explain: 'Strings são imutáveis: `toUpperCase()` **devolve** uma nova string, mas ninguém guardou o resultado. Correção: `nome = nome.toUpperCase();`.',
      },
      {
        type: 'quiz',
        question: 'Qual o resultado?',
        code: `"2026-10-27".split("-").reverse().join("/")`,
        options: ['"27/10/2026"', '"2026/10/27"', '["27", "10", "2026"]', '"72-01-6202"'],
        answer: 0,
        explain: '`split("-")` → `["2026", "10", "27"]`; `reverse()` → `["27", "10", "2026"]`; `join("/")` → `"27/10/2026"`. Encadear métodos assim é muito comum para formatar dados.',
      },
      {
        type: 'text',
        md: `
### Template literals

Com crase, dá para colocar variáveis e expressões dentro do texto e quebrar linhas:

\`\`\`
const total = 59.9;
const msg = \`Olá, \${nome}! Seu pedido de R$ \${total.toFixed(2)} foi confirmado.\`;
\`\`\`

É muito mais legível que concatenar com \`+\`.
`,
      },
      {
        type: 'callout',
        tone: 'tip',
        title: 'Acentos',
        md: 'Para comparar ou gerar URLs sem acento: `texto.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "")` transforma "ação" em "acao". O `normalize("NFD")` separa a letra do acento, e o `replace` remove os acentos soltos.',
      },
      {
        type: 'callout',
        tone: 'interview',
        md: 'Palíndromo, anagrama, contar caracteres e inverter palavras são os exercícios de string mais cobrados. Quase sempre a solução combina `toLowerCase`, um filtro de caracteres e um loop (ou dois ponteiros, que você vai ver no LeetCode).',
      },
    ],
  },
]
