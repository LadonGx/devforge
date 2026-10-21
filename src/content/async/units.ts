import type { Pattern } from '../types'

export const ASYNC_UNITS: Pattern[] = [
  /* ============================================================ */
  {
    id: 'event-loop',
    title: 'O event loop',
    short: 'Call stack, Web APIs, microtasks e macrotasks.',
    summary: 'Como uma linguagem de uma thread só faz várias coisas "ao mesmo tempo" sem travar.',
    color: '#6ea8fe',
    problems: ['async-sleep', 'async-predict-order'],
    lesson: [
      {
        type: 'text',
        md: `
### Uma thread, várias tarefas

O JavaScript executa **uma coisa por vez**: existe uma única **call stack** (pilha de chamadas). Se algo demora (esperar a rede, um timer), a pilha não pode ficar parada esperando, senão a página trava.

A solução é delegar a espera para o **ambiente** (navegador ou Node), que roda fora da thread do JS:

- **Web APIs** (ou APIs do Node): timers, rede (\`fetch\`), disco, eventos de clique... Elas esperam **em paralelo** com o seu código.
- Quando terminam, colocam o callback numa **fila**.
- O **event loop** é o "porteiro": quando a call stack fica **vazia**, ele pega a próxima tarefa da fila e coloca na pilha.

Existem **duas filas**, e a diferença entre elas é a pergunta mais clássica sobre JS assíncrono:

- **Microtasks**: callbacks de Promises (\`then\`, \`catch\`, \`finally\`), continuação de \`await\` e \`queueMicrotask\`. Têm **prioridade**: são **todas** executadas antes da próxima macrotask.
- **Macrotasks** (task queue): \`setTimeout\`, \`setInterval\`, eventos de I/O e de interface. O event loop pega **uma** por vez.
`,
      },
      {
        type: 'eventloop',
        title: 'setTimeout(0) não é imediato',
        caption: 'Avance passo a passo (ou dê play). Repare que o callback só entra na pilha depois que o script inteiro terminou.',
        code: `console.log('A');
setTimeout(() => {
  console.log('B');
}, 0);
console.log('C');
`,
        program: [
          { kind: 'log', line: 1, text: 'A' },
          { kind: 'timeout', line: 2, ms: 0, label: 'callback do setTimeout', body: [{ kind: 'log', line: 3, text: 'B' }] },
          { kind: 'log', line: 5, text: 'C' },
        ],
      },
      {
        type: 'quiz',
        question: 'Qual a saída?',
        code: `console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
queueMicrotask(() => console.log('4'));
console.log('5');`,
        options: ['1 5 3 4 2', '1 2 3 4 5', '1 5 2 3 4', '1 3 4 5 2'],
        answer: 0,
        explain: 'Primeiro todo o síncrono (1, 5). Depois **todas** as microtasks, em ordem de chegada (3, 4). Só então a macrotask do setTimeout (2). Confira no visualizador abaixo.',
      },
      {
        type: 'eventloop',
        title: 'Microtasks furam a fila',
        caption: 'A Promise e o queueMicrotask vão direto para a fila de microtasks; o setTimeout passa pela Web API e vai para a fila de macrotasks.',
        code: `console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
queueMicrotask(() => console.log('4'));
console.log('5');
`,
        program: [
          { kind: 'log', line: 1, text: '1' },
          { kind: 'timeout', line: 2, ms: 0, label: 'timeout → log 2', body: [{ kind: 'log', line: 2, text: '2' }] },
          { kind: 'then', line: 3, chain: [{ label: 'then → log 3', body: [{ kind: 'log', line: 3, text: '3' }] }] },
          { kind: 'microtask', line: 4, label: 'microtask → log 4', body: [{ kind: 'log', line: 4, text: '4' }] },
          { kind: 'log', line: 5, text: '5' },
        ],
      },
      {
        type: 'eventloop',
        title: 'Entre duas macrotasks, todas as microtasks',
        caption: 'O then criado DENTRO do primeiro timeout roda antes do segundo timeout, mesmo os dois timeouts sendo de 0ms.',
        code: `setTimeout(() => console.log('timeout 100'), 100);
setTimeout(() => {
  console.log('timeout 0');
  Promise.resolve().then(() => console.log('then do timeout'));
}, 0);
setTimeout(() => console.log('outro timeout 0'), 0);
`,
        program: [
          { kind: 'timeout', line: 1, ms: 100, label: 'timeout 100', body: [{ kind: 'log', line: 1, text: 'timeout 100' }] },
          {
            kind: 'timeout',
            line: 2,
            ms: 0,
            label: 'timeout 0',
            body: [
              { kind: 'log', line: 3, text: 'timeout 0' },
              { kind: 'then', line: 4, chain: [{ label: 'then do timeout', body: [{ kind: 'log', line: 4, text: 'then do timeout' }] }] },
            ],
          },
          { kind: 'timeout', line: 6, ms: 0, label: 'outro timeout 0', body: [{ kind: 'log', line: 6, text: 'outro timeout 0' }] },
        ],
      },
      {
        type: 'callout',
        tone: 'warn',
        title: 'Nunca bloqueie a call stack',
        md: 'Um loop pesado (ex.: processar 1 milhão de itens) ocupa a pilha e **nada mais roda**: nem cliques, nem timers, nem renderização. Por isso "o setTimeout de 100ms" é **no mínimo** 100ms. Para trabalho pesado no navegador, use Web Workers (é assim que este sistema roda o seu código sem travar a página!).',
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'E no Node.js?',
        md: 'O modelo é o mesmo (call stack + microtasks + fila de tarefas), com fases extras no loop (timers, I/O, `setImmediate`) e o `process.nextTick`, que roda **antes** até das microtasks de Promise. Para entrevistas, a regra "síncrono → microtasks → uma macrotask" responde 95% das perguntas.',
      },
    ],
  },

  /* ============================================================ */
  {
    id: 'callbacks',
    title: 'Callbacks',
    short: 'A forma original de lidar com assincronismo e seus problemas.',
    summary: 'Funções passadas para serem chamadas depois: error-first, callback hell e inversão de controle.',
    color: '#f78c6c',
    problems: ['async-promisify', 'async-after'],
    lesson: [
      {
        type: 'text',
        md: `
### Callback: "me chama quando terminar"

Um **callback** é só uma função passada como argumento para ser chamada depois. Você já usa callbacks síncronos o tempo todo (\`arr.map(x => ...)\`). Os **assíncronos** são chamados quando uma operação termina:

\`\`\`
setTimeout(() => console.log('passou 1s'), 1000);
button.addEventListener('click', (event) => { ... });
fs.readFile('dados.txt', 'utf8', (err, conteudo) => { ... }); // Node
\`\`\`

No Node consolidou-se o padrão **error-first**: o primeiro parâmetro do callback é o erro (ou \`null\`), o segundo é o resultado.
`,
      },
      {
        type: 'eventloop',
        title: 'Operações dependentes com callbacks',
        caption: 'O segundo pedido só pode começar dentro do callback do primeiro. Enquanto isso, o resto do script continua rodando.',
        code: `console.log('pedindo usuário...');
setTimeout(() => {
  console.log('usuário chegou');
  setTimeout(() => {
    console.log('posts chegaram');
  }, 50);
}, 100);
console.log('a tela continua respondendo');
`,
        program: [
          { kind: 'log', line: 1, text: 'pedindo usuário...' },
          {
            kind: 'timeout',
            line: 2,
            ms: 100,
            label: 'resposta do usuário',
            body: [
              { kind: 'log', line: 3, text: 'usuário chegou' },
              { kind: 'timeout', line: 4, ms: 50, label: 'resposta dos posts', body: [{ kind: 'log', line: 5, text: 'posts chegaram' }] },
            ],
          },
          { kind: 'log', line: 8, text: 'a tela continua respondendo' },
        ],
      },
      {
        type: 'code',
        caption: 'Callback hell (a "pirâmide da desgraça")',
        code: `getUser(id, (err, user) => {
  if (err) return handle(err);
  getPosts(user.id, (err, posts) => {
    if (err) return handle(err);
    getComments(posts[0].id, (err, comments) => {
      if (err) return handle(err);
      render(user, posts, comments); // cada passo dependente aumenta a indentação
    });
  });
});`,
      },
      {
        type: 'compare',
        left: {
          title: 'Problemas dos callbacks',
          md: `
- Aninhamento cresce a cada passo dependente
- Tratamento de erro repetido em todo nível
- Difícil fazer coisas em paralelo e esperar todas
- **Inversão de controle**: você entrega sua função para outro código e confia que ele vai chamá-la uma vez só, na hora certa
`,
        },
        right: {
          title: 'O que as Promises resolvem',
          md: `
- Encadeamento linear com \`.then\` (ou \`await\`)
- Um \`.catch\` / \`try/catch\` para tudo
- \`Promise.all\`, \`race\`, \`allSettled\` para combinar
- A promise resolve **uma vez só**: o resultado não muda depois
`,
        },
      },
      {
        type: 'quiz',
        question: 'O que este código imprime?',
        code: `function getNumber(callback) {
  setTimeout(() => callback(42), 0);
}
let result;
getNumber((n) => { result = n; });
console.log(result);`,
        options: ['undefined', '42', 'null', 'TypeError'],
        answer: 0,
        explain: 'O `console.log` roda no script principal, **antes** do callback do setTimeout (que é uma macrotask). Esse é o erro clássico de "retornar" um valor assíncrono para uma variável externa: o valor só existe dentro do callback (ou depois do `await`).',
      },
    ],
  },

  /* ============================================================ */
  {
    id: 'promises',
    title: 'Promises',
    short: 'Estados, then/catch/finally e encadeamento.',
    summary: 'Um objeto que representa um valor futuro, e por que cada .then espera o anterior.',
    color: '#c792ea',
    problems: ['async-post-titles', 'async-promise-all'],
    lesson: [
      {
        type: 'text',
        md: `
### O que é uma Promise

Uma **Promise** é um objeto que representa o resultado **futuro** de uma operação. Ela tem 3 estados:

- **pending** (pendente): ainda não terminou;
- **fulfilled** (resolvida): terminou com um valor;
- **rejected** (rejeitada): falhou com um motivo (erro).

Depois de resolvida ou rejeitada (**settled**), ela **nunca mais muda**. Você reage ao resultado com:

- \`.then(onFulfilled, onRejected?)\`: quando resolver;
- \`.catch(onRejected)\`: quando rejeitar;
- \`.finally(fn)\`: nos dois casos (bom para esconder um "carregando...").

Cada \`.then\` **retorna uma promise nova**, resolvida com o que o callback retornou. Se o callback retorna outra promise, a cadeia espera ela.
`,
      },
      {
        type: 'code',
        caption: 'Criando e consumindo',
        code: `const p = new Promise((resolve, reject) => {
  // código assíncrono aqui
  setTimeout(() => resolve('pronto!'), 1000);
  // em caso de erro: reject(new Error('falhou'))
});

p.then((valor) => console.log(valor))     // "pronto!" depois de 1s
 .catch((erro) => console.error(erro))
 .finally(() => console.log('fim'));

Promise.resolve(42);           // já nasce resolvida
Promise.reject(new Error('x')); // já nasce rejeitada`,
      },
      {
        type: 'eventloop',
        title: 'Cada .then só entra na fila quando o anterior termina',
        caption: 'Mesmo com a promise já resolvida, nenhum then roda antes do script terminar. E o segundo then espera o primeiro.',
        code: `console.log('início');
Promise.resolve(1)
  .then((n) => { console.log('then 1:', n); return n + 1; })
  .then((n) => console.log('then 2:', n));
console.log('fim');
`,
        program: [
          { kind: 'log', line: 1, text: 'início' },
          {
            kind: 'then',
            line: 2,
            chain: [
              { label: 'then 1', body: [{ kind: 'log', line: 3, text: 'then 1: 1' }] },
              { label: 'then 2', body: [{ kind: 'log', line: 4, text: 'then 2: 2' }] },
            ],
          },
          { kind: 'log', line: 5, text: 'fim' },
        ],
      },
      {
        type: 'quiz',
        question: 'Qual a saída?',
        code: `Promise.resolve().then(() => console.log('A1')).then(() => console.log('A2'));
Promise.resolve().then(() => console.log('B1')).then(() => console.log('B2'));`,
        options: ['A1 B1 A2 B2', 'A1 A2 B1 B2', 'B1 B2 A1 A2'],
        answer: 0,
        explain: 'As duas cadeias se **intercalam**: A1 e B1 entram na fila durante o script. Quando A1 termina, A2 entra no **fim** da fila (depois de B1). Veja no visualizador abaixo.',
      },
      {
        type: 'eventloop',
        title: 'Duas cadeias de Promise intercaladas',
        code: `Promise.resolve().then(() => console.log('A1')).then(() => console.log('A2'));
Promise.resolve().then(() => console.log('B1')).then(() => console.log('B2'));
`,
        program: [
          {
            kind: 'then',
            line: 1,
            chain: [
              { label: 'A1', body: [{ kind: 'log', line: 1, text: 'A1' }] },
              { label: 'A2', body: [{ kind: 'log', line: 1, text: 'A2' }] },
            ],
          },
          {
            kind: 'then',
            line: 2,
            chain: [
              { label: 'B1', body: [{ kind: 'log', line: 2, text: 'B1' }] },
              { label: 'B2', body: [{ kind: 'log', line: 2, text: 'B2' }] },
            ],
          },
        ],
      },
      {
        type: 'callout',
        tone: 'warn',
        title: 'Erros comuns com Promises',
        md: `
- **Esquecer o \`return\`** dentro do \`.then\`: a cadeia continua sem esperar a operação interna.
- **Aninhar \`.then\` dentro de \`.then\`** sem necessidade: recria o callback hell. Retorne a promise e encadeie.
- **Não tratar rejeições**: uma promise rejeitada sem \`.catch\` gera "Unhandled promise rejection" (no Node moderno, derruba o processo).
- \`new Promise\` em volta de algo que **já é** promise (anti-padrão "promise constructor"): só retorne a promise existente.
`,
      },
    ],
  },

  /* ============================================================ */
  {
    id: 'async-await',
    title: 'async / await',
    short: 'Código assíncrono com cara de síncrono (e o que acontece por baixo).',
    summary: 'await pausa só a função atual, o resto do programa continua. Erros com try/catch.',
    color: '#3fb950',
    problems: ['async-dashboard', 'async-retry'],
    lesson: [
      {
        type: 'text',
        md: `
### Açúcar sintático sobre Promises

- Uma função \`async\` **sempre retorna uma Promise**. \`return x\` vira \`Promise.resolve(x)\`; \`throw e\` vira uma rejeição.
- \`await promise\` **pausa a função** até a promise resolver e devolve o valor (ou lança o erro, que você trata com \`try/catch\`).

O ponto que mais confunde: o \`await\` **não bloqueia o programa**. Ele tira a função da call stack; o código que chamou continua normalmente, e o resto da função volta depois como uma **microtask**.
`,
      },
      {
        type: 'eventloop',
        title: 'O que o await faz com a call stack',
        caption: 'Repare que "3" é impresso antes de "4": carregar() sai da pilha no await e o script continua.',
        code: `async function carregar() {
  console.log('2: dentro, antes do await');
  await null;
  console.log('4: depois do await');
}
console.log('1: antes');
carregar();
console.log('3: depois da chamada');
`,
        program: [
          { kind: 'log', line: 6, text: '1: antes' },
          {
            kind: 'async',
            line: 7,
            name: 'carregar',
            body: [
              { kind: 'log', line: 2, text: '2: dentro, antes do await' },
              { kind: 'await', line: 3, on: 'value' },
              { kind: 'log', line: 4, text: '4: depois do await' },
            ],
          },
          { kind: 'log', line: 8, text: '3: depois da chamada' },
        ],
      },
      {
        type: 'eventloop',
        title: 'await de uma requisição',
        caption: 'Enquanto fetchUser() espera na Web API (100ms), o timer de 50ms termina e roda primeiro.',
        prelude: `const fetchUser = () => new Promise((r) => setTimeout(() => r('ana'), 100));`,
        code: `async function main() {
  console.log('buscando...');
  const user = await fetchUser(); // ~100ms
  console.log('usuário:', user);
}
main();
setTimeout(() => console.log('timer de 50ms'), 50);
console.log('script terminou');
`,
        program: [
          {
            kind: 'async',
            line: 6,
            name: 'main',
            body: [
              { kind: 'log', line: 2, text: 'buscando...' },
              { kind: 'await', line: 3, on: { io: 'fetchUser()', ms: 100 } },
              { kind: 'log', line: 4, text: 'usuário: ana' },
            ],
          },
          { kind: 'timeout', line: 7, ms: 50, label: 'timer de 50ms', body: [{ kind: 'log', line: 7, text: 'timer de 50ms' }] },
          { kind: 'log', line: 8, text: 'script terminou' },
        ],
      },
      {
        type: 'code',
        caption: 'Tratamento de erro',
        code: `async function salvar(dados) {
  try {
    const res = await fetch('/api/salvar', { method: 'POST', body: JSON.stringify(dados) });
    if (!res.ok) throw new Error('HTTP ' + res.status); // fetch só rejeita em erro de rede!
    return await res.json();
  } catch (e) {
    console.error('não deu para salvar', e);
    throw e; // repassa para quem chamou decidir
  } finally {
    esconderCarregando();
  }
}`,
      },
      {
        type: 'quiz',
        question: 'Quanto tempo leva, aproximadamente?',
        code: `const a = () => sleep(100);
const b = () => sleep(100);
async function main() {
  await a();
  await b();
}`,
        options: ['~200ms', '~100ms', '~0ms'],
        answer: 0,
        explain: 'Cada `await` espera a anterior terminar antes de **começar** a próxima: 100 + 100. Se `a` e `b` são independentes, dispare as duas antes de esperar: `await Promise.all([a(), b()])` leva ~100ms. Veja a próxima aula.',
      },
      {
        type: 'callout',
        tone: 'warn',
        title: 'Armadilhas',
        md: `
- \`arr.forEach(async (x) => { await salvar(x) })\`: o \`forEach\` **não espera** callbacks async; o código depois dele roda antes de salvar. Use \`for...of\` (em sequência) ou \`await Promise.all(arr.map(...))\` (em paralelo).
- Esquecer o \`await\`: você recebe a **promise**, não o valor (\`user.name\` vira \`undefined\`).
- \`try { return promise } catch\` sem \`await\`: a rejeição escapa do \`catch\`. Use \`return await promise\` dentro de try.
- O \`fetch\` **não rejeita** em erro HTTP (404, 500): confira \`res.ok\`.
`,
      },
    ],
  },

  /* ============================================================ */
  {
    id: 'concorrencia',
    title: 'Combinadores e concorrência',
    short: 'Promise.all, allSettled, race, any e limites de paralelismo.',
    summary: 'Fazer várias coisas ao mesmo tempo do jeito certo: paralelo, timeout, pool e debounce.',
    color: '#e3a008',
    problems: ['async-all-settled', 'async-with-timeout', 'async-map-limit', 'async-debounce'],
    lesson: [
      {
        type: 'timeline',
        title: 'Sequencial × paralelo',
        caption: 'Três requisições independentes. Clique em Animar e compare o tempo total.',
        tasks: [
          { label: 'getUser()', ms: 120 },
          { label: 'getPosts()', ms: 200 },
          { label: 'getConfig()', ms: 80 },
        ],
      },
      {
        type: 'eventloop',
        title: 'Promise.all por dentro',
        caption: 'As duas operações ficam na Web API ao mesmo tempo. main() só continua quando a mais lenta termina.',
        prelude: `const fetchUser = () => new Promise((r) => setTimeout(() => r('ana'), 100));
const fetchPosts = () => new Promise((r) => setTimeout(() => r(3), 150));`,
        code: `async function main() {
  const [user, posts] = await Promise.all([fetchUser(), fetchPosts()]);
  console.log('tudo pronto:', user, posts);
}
main();
console.log('main está esperando...');
`,
        program: [
          {
            kind: 'async',
            line: 5,
            name: 'main',
            body: [
              {
                kind: 'await',
                line: 2,
                on: {
                  all: [
                    { io: 'fetchUser()', ms: 100 },
                    { io: 'fetchPosts()', ms: 150 },
                  ],
                },
              },
              { kind: 'log', line: 3, text: 'tudo pronto: ana 3' },
            ],
          },
          { kind: 'log', line: 6, text: 'main está esperando...' },
        ],
      },
      {
        type: 'text',
        md: `
### Os quatro combinadores

- **\`Promise.all(ps)\`**: resolve com **todos** os valores (na ordem de entrada); rejeita na **primeira** rejeição. Use quando você precisa de tudo.
- **\`Promise.allSettled(ps)\`**: espera **todas** e nunca rejeita; devolve \`{ status, value | reason }\` de cada. Use em operações em lote em que algumas podem falhar.
- **\`Promise.race(ps)\`**: assume o resultado da **primeira que terminar**, dando certo ou errado. Base do timeout.
- **\`Promise.any(ps)\`**: a **primeira que der certo**; só rejeita (com \`AggregateError\`) se **todas** falharem. Ex.: o servidor espelho mais rápido.
`,
      },
      {
        type: 'quiz',
        question: 'Você vai enviar 50 e-mails e quer mostrar no fim quais falharam. Qual usar?',
        options: ['Promise.allSettled', 'Promise.all', 'Promise.race', 'Promise.any'],
        answer: 0,
        explain: '`Promise.all` desistiria no primeiro erro (e você perderia o resultado dos outros). `allSettled` espera todos e diz o status de cada um.',
      },
      {
        type: 'text',
        md: `
### Paralelo, mas com limite

\`Promise.all(items.map(fn))\` dispara **tudo de uma vez**. Com 5 itens, ótimo. Com 5000 chamadas a uma API, você toma rate limit (HTTP 429), estoura conexões ou memória. A solução é um **pool**: no máximo N operações ao mesmo tempo, e assim que uma termina a próxima começa (exercício "Concorrência limitada").

Outros padrões de tempo que aparecem em todo front-end:
- **debounce**: espera o usuário parar (busca enquanto digita);
- **throttle**: no máximo uma execução a cada N ms (scroll, resize);
- **timeout**: desiste depois de N ms (\`Promise.race\` ou \`AbortSignal.timeout(ms)\` no fetch).
`,
      },
      {
        type: 'callout',
        tone: 'tip',
        title: 'Na entrevista',
        md: 'Se aparecerem várias chamadas independentes num `async`, pergunte-se: "elas dependem uma da outra?". Se não, `Promise.all`. Se a lista for grande, mencione limitar a concorrência. Se falhas parciais forem aceitáveis, `allSettled`. Essa reflexão em voz alta vale mais que o código.',
      },
    ],
  },
]
