import type { Exam } from '../types'
import { starter } from '../js/helpers'

export const PROVA_3: Exam = {
  id: 'prova-3',
  title: 'Prova 3 · Como o JavaScript pensa',
  stage: 'mente-js',
  summary: 'Coerção, escopo e closures, `this`, referências e cópias, sintaxe moderna, e os padrões **Sliding Window** e **Stack**. É a prova com mais perguntas "clássicas" de entrevista de JavaScript.',
  minutes: 50,
  passPct: 70,
  questions: [
    {
      kind: 'choice',
      id: 'p3-igualdade',
      topic: 'js-fundamentos:tipos-coercao',
      prompt: 'Por que a recomendação é usar `===` em vez de `==`?',
      options: [
        '`===` compara valor **e** tipo sem converter nada; `==` converte os tipos antes e gera resultados como `"" == 0` ser `true`',
        '`===` é mais rápido, mas os dois dão sempre o mesmo resultado',
        '`==` não funciona com strings',
        '`===` compara objetos pelo conteúdo e `==` pela referência',
      ],
      answer: 0,
      explain: 'O `==` aplica as regras de coerção (`"" → 0`, `false → 0`...). O `===` nunca converte. Os dois comparam objetos **por referência**. A única exceção útil do `==` é `x == null`, que pega `null` e `undefined`.',
    },
    {
      kind: 'choice',
      id: 'p3-closure',
      topic: 'js-fundamentos:escopo-closures',
      prompt: 'Qual frase define melhor uma **closure**?',
      options: [
        'Uma função que continua acessando as variáveis do escopo onde foi **criada**, mesmo depois que esse escopo terminou de executar',
        'Uma função que é chamada imediatamente depois de declarada',
        'Uma função que fecha (encerra) o programa',
        'Uma função sem parâmetros',
      ],
      answer: 0,
      explain: 'Closure = função + o escopo léxico em que ela nasceu. É o que permite estado privado (`createCounter`), `debounce`, memoização e os hooks do React.',
    },
    {
      kind: 'choice',
      id: 'p3-this-callback',
      topic: 'js-fundamentos:this-funcoes',
      prompt: 'O método `relogio.tick()` usa `this.segundos`. O que acontece com `setInterval(relogio.tick, 1000)` e como corrigir?',
      options: [
        'O método perde o `this` (vira chamada solta); corrigir com `relogio.tick.bind(relogio)` ou `() => relogio.tick()`',
        'Funciona normalmente, o `this` é sempre o objeto onde o método foi escrito',
        'Lança SyntaxError; não dá para passar métodos como callback',
        'O `this` vira o próprio `setInterval`; corrigir com `call`',
      ],
      answer: 0,
      explain: 'Ao passar `relogio.tick` você entrega só a função: quem chama depois é o timer, sem objeto antes do ponto. `bind` fixa o `this`; a arrow chama o método **no** objeto.',
    },
    {
      kind: 'choice',
      id: 'p3-spread-raso',
      topic: 'js-fundamentos:objetos-referencias',
      prompt: '`const copia = { ...pedido }` e depois `copia.itens.push(x)`. O que acontece com `pedido.itens`?',
      options: [
        'Também recebe `x`: o spread copia só o primeiro nível, e `itens` continua sendo o mesmo array',
        'Não muda: o spread faz uma cópia profunda',
        'Lança erro, porque `copia` é imutável',
        '`pedido.itens` vira `undefined`',
      ],
      answer: 0,
      explain: 'Cópia **rasa**: valores primitivos são copiados, mas objetos e arrays internos continuam compartilhados por referência. Para uma cópia completa: `structuredClone(pedido)`, ou copiar o nível que vai mudar: `{ ...pedido, itens: [...pedido.itens, x] }`.',
    },
    {
      kind: 'choice',
      id: 'p3-nullish',
      topic: 'js-fundamentos:sintaxe-moderna',
      prompt: 'A quantidade em estoque pode ser `0` (esgotado) ou não vir na resposta da API. Qual expressão mostra `"?"` **só** quando o campo não veio?',
      options: ['`produto.estoque ?? "?"`', '`produto.estoque || "?"`', '`produto.estoque && "?"`', '`produto?.estoque || "?"`'],
      answer: 0,
      explain: '`??` só troca `null`/`undefined`. Com `||`, o `0` (que é falsy) também seria trocado por `"?"`, escondendo a informação "esgotado".',
    },
    {
      kind: 'choice',
      id: 'p3-sliding-signal',
      topic: 'leetcode:sliding-window',
      prompt: 'Qual enunciado é um sinal clássico de **Sliding Window**?',
      options: [
        '"Encontre a maior **substring contígua** sem caracteres repetidos"',
        '"Encontre todas as permutações de um array"',
        '"Encontre o k-ésimo maior elemento"',
        '"Verifique se a árvore é simétrica"',
      ],
      answer: 0,
      explain: 'Janela deslizante resolve problemas de **subarray/substring contígua** com alguma condição: a janela cresce pela direita e encolhe pela esquerda, em O(n). Permutações são backtracking; k-ésimo maior é heap; árvore é DFS/BFS.',
    },
    {
      kind: 'choice',
      id: 'p3-stack-parenteses',
      topic: 'leetcode:stack',
      prompt: 'Para validar se `"({[]})"` tem os parênteses balanceados, qual estrutura é a ideal e por quê?',
      options: [
        'Pilha: o último que abriu precisa ser o primeiro a fechar (LIFO)',
        'Fila: o primeiro que abriu precisa ser o primeiro a fechar (FIFO)',
        'Set: basta saber quais símbolos apareceram',
        'Heap: para fechar sempre o menor símbolo',
      ],
      answer: 0,
      explain: 'Cada fechamento precisa casar com a **abertura mais recente** ainda aberta: exatamente o topo da pilha. Abriu → `push`; fechou → `pop` e compara.',
    },
    {
      kind: 'output',
      id: 'p3-out-coercao',
      topic: 'js-fundamentos:tipos-coercao',
      code: `console.log("3" + 4 + 5);
console.log(3 + 4 + "5");
console.log("10" - "4");
console.log(null == undefined, null === undefined);`,
      expected: ['345', '75', '6', 'true false'],
      explain: 'A avaliação é da esquerda para a direita: `"3" + 4` já é string `"34"`, depois `"345"`. No segundo, `3 + 4 = 7` primeiro, depois `7 + "5" = "75"`. O `-` sempre converte para número: 6. E `null == undefined` é true por regra especial, mas são tipos diferentes para o `===`.',
    },
    {
      kind: 'output',
      id: 'p3-out-closure-loop',
      topic: 'js-fundamentos:escopo-closures',
      code: `const fns = [];
for (var i = 0; i < 3; i++) fns.push(() => i);
const gs = [];
for (let j = 0; j < 3; j++) gs.push(() => j);
console.log(fns[0](), fns[2]());
console.log(gs[0](), gs[2]());`,
      expected: ['3 3', '0 2'],
      explain: 'Com `var` existe **um único** `i` compartilhado por todas as funções; quando elas rodam, o loop já terminou e `i` vale 3. Com `let`, cada volta do loop cria um `j` novo, e cada função captura o seu.',
    },
    {
      kind: 'output',
      id: 'p3-out-ref',
      topic: 'js-fundamentos:objetos-referencias',
      code: `const a = { n: 1, tags: ["x"] };
const b = { ...a };
b.n = 2;
b.tags.push("y");
console.log(a.n, a.tags.length);
console.log(a === b, a.tags === b.tags);`,
      expected: ['1 2', 'false true'],
      explain: '`n` é primitivo e foi copiado: mudar `b.n` não afeta `a`. `tags` é um array compartilhado (cópia rasa): o push aparece nos dois. `a` e `b` são objetos diferentes, mas `tags` é a **mesma** referência.',
    },
    {
      kind: 'output',
      id: 'p3-out-this',
      topic: 'js-fundamentos:this-funcoes',
      code: `const conta = { saldo: 100, ver() { return this.saldo; } };
const outra = { saldo: 5, ver: conta.ver };
console.log(conta.ver());
console.log(outra.ver());
console.log(conta.ver.call({ saldo: 42 }));`,
      expected: ['100', '5', '42'],
      explain: 'O `this` é decidido **na chamada**: é o objeto antes do ponto. `outra.ver()` usa `outra` (5), mesmo a função tendo sido escrita em `conta`. Com `call`, você escolhe o `this` explicitamente.',
    },
    {
      kind: 'output',
      id: 'p3-out-sintaxe',
      topic: 'js-fundamentos:sintaxe-moderna',
      code: `const cfg = { tema: "escuro", fonte: 0 };
const { tema, fonte = 14, idioma = "pt" } = cfg;
console.log(tema, fonte, idioma);
console.log(cfg.fonte || 16, cfg.fonte ?? 16);
console.log(cfg.usuario?.nome);`,
      expected: ['escuro 0 pt', '16 0', 'undefined'],
      explain: 'O valor padrão da desestruturação só entra quando o valor é `undefined`: `fonte` é 0 e continua 0; `idioma` não existe e vira "pt". `||` troca o 0, `??` não. E `?.` devolve `undefined` em vez de lançar TypeError.',
    },
    {
      kind: 'code',
      id: 'p3-code-idgen',
      topic: 'js-fundamentos:escopo-closures',
      problem: {
        id: 'prova-id-generator',
        title: 'Gerador de ids com closure',
        difficulty: 'Fácil',
        pattern: 'escopo-closures',
        fnName: 'createIdGenerator',
        params: ['prefixes', 'calls'],
        io: {
          harness: `(createIdGenerator, prefixes, calls) => {
  const gens = prefixes.map((p) => createIdGenerator(p));
  return calls.map((i) => gens[i]());
}`,
        },
        description: `
Escreva \`createIdGenerator(prefix)\` que retorna uma **função**. Cada chamada dessa função devolve o próximo id: \`"prefix-1"\`, \`"prefix-2"\`...

Cada gerador tem **sua própria contagem**, e o contador não pode ficar acessível de fora (use closure).

**Como é testado:** o teste cria um gerador para cada prefixo de \`prefixes\` e chama, na ordem, os geradores indicados em \`calls\` (pelo índice).
`,
        examples: [
          { input: 'prefixes = ["user"], calls = [0, 0, 0]', output: '["user-1", "user-2", "user-3"]' },
          { input: 'prefixes = ["user", "order"], calls = [0, 1, 0]', output: '["user-1", "order-1", "user-2"]' },
        ],
        constraints: [],
        starter: starter('function createIdGenerator(prefix)', 'function createIdGenerator(prefix: string): () => string', '/**\n * @param {string} prefix\n * @return {() => string}\n */'),
        tests: [
          { input: [['user'], [0, 0, 0]], expected: ['user-1', 'user-2', 'user-3'], label: 'Exemplo 1' },
          { input: [['user', 'order'], [0, 1, 0]], expected: ['user-1', 'order-1', 'user-2'], label: 'Geradores independentes' },
          { input: [['a', 'a'], [0, 0, 1]], expected: ['a-1', 'a-2', 'a-1'], label: 'Mesmo prefixo, contagens separadas' },
          { input: [['x'], []], expected: [], label: 'Nenhuma chamada' },
        ],
        hints: ['Declare `let count = 0` dentro de `createIdGenerator` e retorne uma arrow que incrementa e monta a string.'],
        explanation: {
          intuition: 'Cada chamada de `createIdGenerator` cria um escopo novo com o seu `count`. A função devolvida "carrega" esse escopo (closure), então os geradores não se misturam e ninguém de fora consegue mexer no contador.',
          steps: ['`let count = 0`.', '`return () => { count++; return prefix + "-" + count; }`.'],
          time: 'O(1) por chamada',
          space: 'O(1) por gerador',
          complexityWhy: 'Só um contador por gerador.',
          pitfalls: ['Declarar `count` fora da função (todos os geradores compartilhariam a contagem).', 'Retornar o resultado em vez de uma função.'],
        },
        solution: {
          js: `function createIdGenerator(prefix) {
  let count = 0;
  return () => {
    count++;
    return prefix + '-' + count;
  };
}
`,
          ts: `function createIdGenerator(prefix: string): () => string {
  let count = 0;
  return () => {
    count++;
    return prefix + '-' + count;
  };
}
`,
        },
      },
    },
    {
      kind: 'code',
      id: 'p3-code-window',
      topic: 'leetcode:sliding-window',
      problem: {
        id: 'prova-best-week',
        title: 'Melhor sequência de vendas',
        difficulty: 'Fácil',
        pattern: 'sliding-window',
        fnName: 'bestWindow',
        params: ['sales', 'k'],
        description: `
Você tem as vendas diárias de uma loja e quer saber qual foi a **maior soma de vendas em \`k\` dias seguidos**.

Escreva \`bestWindow(sales, k)\` em **O(n)** usando uma janela deslizante. Se houver menos de \`k\` dias, retorne \`null\`.
`,
        examples: [
          { input: 'bestWindow([2, 1, 5, 1, 3, 2], 3)', output: '9', explanation: '[5, 1, 3]' },
          { input: 'bestWindow([4, 2], 3)', output: 'null' },
        ],
        constraints: ['1 <= k', '0 <= sales.length <= 10^5'],
        starter: starter('function bestWindow(sales, k)', 'function bestWindow(sales: number[], k: number): number | null', '/**\n * @param {number[]} sales\n * @param {number} k\n * @return {number | null}\n */'),
        tests: [
          { input: [[2, 1, 5, 1, 3, 2], 3], expected: 9, label: 'Exemplo 1' },
          { input: [[4, 2], 3], expected: null, label: 'Poucos dias' },
          { input: [[7], 1], expected: 7, label: 'k = 1' },
          { input: [[1, 2, 3], 3], expected: 6, label: 'Janela do tamanho do array' },
          { input: [[-1, -2, -3, -4], 2], expected: -3, label: 'Negativos' },
          { input: [[0, 0, 10, 0, 0, 10, 10], 2], expected: 20, label: 'Melhor no fim' },
        ],
        hints: ['Some os primeiros `k`. Depois, a cada passo, **some** o que entra e **subtraia** o que sai da janela.', 'Comece o "melhor" com a soma da primeira janela (não com 0: pode ser tudo negativo).'],
        explanation: {
          intuition: 'Recalcular a soma de cada janela custaria O(n·k). Mas duas janelas vizinhas só diferem em um elemento que sai e um que entra: atualizar a soma é O(1).',
          steps: ['Se `sales.length < k`, `null`.', '`soma` = soma dos `k` primeiros; `melhor = soma`.', 'Para `i` de `k` até o fim: `soma += sales[i] - sales[i - k]`; atualize `melhor`.'],
          time: 'O(n)',
          space: 'O(1)',
          complexityWhy: 'Cada elemento entra e sai da janela uma vez.',
          pitfalls: ['`melhor = 0` com valores negativos.', 'Erro de índice no elemento que sai (`i - k`).'],
        },
        solution: {
          js: `function bestWindow(sales, k) {
  if (sales.length < k) return null;
  let soma = 0;
  for (let i = 0; i < k; i++) soma += sales[i];
  let melhor = soma;
  for (let i = k; i < sales.length; i++) {
    soma += sales[i] - sales[i - k];
    if (soma > melhor) melhor = soma;
  }
  return melhor;
}
`,
          ts: `function bestWindow(sales: number[], k: number): number | null {
  if (sales.length < k) return null;
  let soma = 0;
  for (let i = 0; i < k; i++) soma += sales[i];
  let melhor = soma;
  for (let i = k; i < sales.length; i++) {
    soma += sales[i] - sales[i - k];
    if (soma > melhor) melhor = soma;
  }
  return melhor;
}
`,
        },
      },
    },
    {
      kind: 'code',
      id: 'p3-code-backspace',
      topic: 'leetcode:stack',
      problem: {
        id: 'prova-backspace',
        title: 'Digitação com backspace',
        difficulty: 'Fácil',
        pattern: 'stack',
        fnName: 'typed',
        params: ['keys'],
        leetcode: { number: 844, slug: 'backspace-string-compare' },
        description: `
Um campo de texto registra as teclas apertadas. O caractere \`#\` representa o **backspace** (apaga o último caractere, se houver).

Escreva \`typed(keys)\` que retorna o **texto final** que aparece no campo.
`,
        examples: [
          { input: 'typed("ab#c")', output: '"ac"' },
          { input: 'typed("a##b")', output: '"b"', explanation: 'O segundo # não tem o que apagar.' },
        ],
        constraints: ['0 <= keys.length <= 10^4'],
        starter: starter('function typed(keys)', 'function typed(keys: string): string', '/**\n * @param {string} keys\n * @return {string}\n */'),
        tests: [
          { input: ['ab#c'], expected: 'ac', label: 'Exemplo 1' },
          { input: ['a##b'], expected: 'b', label: 'Backspace a mais' },
          { input: ['###'], expected: '', label: 'Só backspace' },
          { input: [''], expected: '', label: 'Vazio' },
          { input: ['olá mundo#####devforge'], expected: 'olá devforge', label: 'Apagando uma palavra' },
        ],
        hints: ['Use um array como pilha: letra → `push`; `#` → `pop` (se não estiver vazia).', 'No fim, `join("")`.'],
        explanation: {
          intuition: 'O backspace sempre apaga **o último** caractere digitado: comportamento de pilha (LIFO). O array guarda o texto atual e o topo é o fim do texto.',
          steps: ['`const pilha = []`.', 'Para cada tecla: `#` → `pilha.pop()`; senão `pilha.push(tecla)`.', '`return pilha.join("")`.'],
          time: 'O(n)',
          space: 'O(n)',
          complexityWhy: 'Uma operação O(1) por tecla.',
          pitfalls: ['Montar a string com `slice(0, -1)` a cada `#` (cria strings novas: O(n²) no pior caso).', '`pop` numa pilha vazia é seguro em JS (devolve undefined), mas em outras linguagens não: vale checar.'],
        },
        solution: {
          js: `function typed(keys) {
  const pilha = [];
  for (const k of keys) {
    if (k === '#') pilha.pop();
    else pilha.push(k);
  }
  return pilha.join('');
}
`,
          ts: `function typed(keys: string): string {
  const pilha: string[] = [];
  for (const k of keys) {
    if (k === '#') pilha.pop();
    else pilha.push(k);
  }
  return pilha.join('');
}
`,
        },
      },
    },
    {
      kind: 'essay',
      id: 'p3-essay-closure',
      topic: 'js-fundamentos:escopo-closures',
      prompt: 'Entrevistador: **"O que é closure? Me dê um exemplo de onde você usaria no dia a dia."**',
      model: `
Closure é quando uma função **lembra das variáveis do escopo onde foi criada**, mesmo depois que esse escopo terminou. Em JS isso acontece sempre que uma função é criada dentro de outra e usa variáveis dela.

Exemplo:

\`\`\`
function createCounter() {
  let count = 0;
  return () => ++count;
}
const next = createCounter();
next(); // 1
next(); // 2
\`\`\`

\`count\` não é acessível de fora, mas a função devolvida continua lendo e alterando ele: é **estado privado**.

No dia a dia: \`debounce\`/\`throttle\` (guardam o timer), memoização (guardam o cache), funções "fábrica" (\`multiplicador(2)\`), callbacks que lembram de um id, e os **hooks do React**, que dependem de closures (inclusive o famoso problema de "closure velha" num \`useEffect\` sem as dependências certas).
`,
      checklist: [
        'Função que lembra/acessa variáveis do escopo onde foi criada',
        'Mesmo depois que a função externa terminou',
        'Deu um exemplo em código (contador, fábrica, etc.)',
        'Citou um uso real (estado privado, debounce, memoização, hooks do React...)',
      ],
    },
    {
      kind: 'essay',
      id: 'p3-essay-copias',
      topic: 'js-fundamentos:objetos-referencias',
      prompt: 'Entrevistador: **"Qual a diferença entre cópia rasa e cópia profunda? Por que isso importa quando você atualiza o estado no React?"**',
      model: `
Objetos e arrays são guardados **por referência**: a variável aponta para o objeto na memória.

- **Cópia rasa** (\`{ ...obj }\`, \`[...arr]\`, \`Object.assign\`) cria um objeto novo, mas só copia o **primeiro nível**: objetos e arrays internos continuam **compartilhados**.
- **Cópia profunda** (\`structuredClone\`, ou recursão) copia todos os níveis: nada é compartilhado.

No React, o estado é comparado **por referência** (\`antes === depois\`). Se eu **muto** o objeto existente, a referência não muda e o componente pode não renderizar de novo; e se eu fizer só uma cópia rasa e mutar algo interno, altero também o estado anterior. Por isso atualizo de forma **imutável**, criando objetos novos em cada nível que muda: \`setUser({ ...user, endereco: { ...user.endereco, cidade } })\`.
`,
      checklist: [
        'Objetos e arrays são guardados/copiados por referência',
        'Cópia rasa copia só o primeiro nível (internos compartilhados)',
        'Cópia profunda copia todos os níveis (ex.: `structuredClone`)',
        'React compara referências: mutar não dispara nova renderização',
        'Mostrou a atualização imutável com spread em cada nível',
      ],
    },
  ],
}
