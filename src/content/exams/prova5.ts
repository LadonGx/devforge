import type { Exam } from '../types'
import { starter } from '../js/helpers'

const HEAP_DOC = `MinHeap e MaxHeap já estão disponíveis (como a PriorityQueue do LeetCode):
 *   const h = new MaxHeap();            // ou new MinHeap(x => x.dist) para ordenar por uma chave
 *   h.push(x); h.pop(); h.peek(); h.size(); h.isEmpty();`

export const PROVA_5: Exam = {
  id: 'prova-5',
  title: 'Prova 5 · Assincronismo',
  stage: 'async',
  summary: 'Event loop, callbacks, Promises, async/await e concorrência, e os padrões **Heap** e **Backtracking**. Inclui as perguntas de "qual a ordem da saída?" que aparecem em quase toda entrevista de JavaScript.',
  minutes: 50,
  passPct: 70,
  questions: [
    {
      kind: 'choice',
      id: 'p5-single-thread',
      topic: 'js-async:event-loop',
      prompt: 'JavaScript executa o seu código em **uma thread só**. Como, então, um servidor Node consegue esperar várias requisições ao banco ao mesmo tempo?',
      options: [
        'As operações de I/O são entregues ao ambiente (Web APIs / libuv), que avisa quando terminam; o event loop coloca os callbacks na fila para rodar quando a call stack estiver livre',
        'O Node cria uma thread nova de JavaScript para cada `await`',
        'O JavaScript pausa a thread inteira até o banco responder',
        'Os `await` rodam em paralelo dentro da mesma call stack',
      ],
      answer: 0,
      explain: 'O seu JS roda numa thread, mas a **espera** (rede, disco, timers) acontece fora dela. Quando a operação termina, o callback (ou a continuação do `await`) entra numa fila e o event loop o executa quando a pilha esvazia.',
    },
    {
      kind: 'choice',
      id: 'p5-micro-macro',
      topic: 'js-async:event-loop',
      prompt: 'Depois que o código síncrono termina, o que o event loop executa primeiro?',
      options: [
        '**Todas** as microtasks (callbacks de Promise, continuações de `await`, `queueMicrotask`), e só depois uma macrotask (ex.: `setTimeout`)',
        'Uma macrotask (`setTimeout`), depois uma microtask, alternando',
        'O que foi agendado primeiro, independentemente do tipo',
        'Os `setTimeout` com 0ms, porque têm o menor tempo',
      ],
      answer: 0,
      explain: 'A fila de microtasks tem **prioridade** e é esvaziada por completo (inclusive as microtasks criadas no meio do caminho) antes da próxima macrotask. Por isso um `.then` roda antes de um `setTimeout(..., 0)`.',
    },
    {
      kind: 'choice',
      id: 'p5-allsettled',
      topic: 'js-async:concorrencia',
      prompt: 'O painel busca 5 widgets **independentes**. Se um falhar, os outros 4 ainda devem aparecer. Qual combinador usar?',
      options: ['`Promise.allSettled`', '`Promise.all`', '`Promise.race`', '`await` um por um num `for`'],
      answer: 0,
      explain: '`Promise.all` rejeita assim que **uma** falha (e você perde os resultados das outras). `allSettled` espera todas e diz o status de cada uma. `race` fica com a primeira que terminar. E `await` em sequência funciona, mas é lento (soma os tempos).',
    },
    {
      kind: 'choice',
      id: 'p5-await-loop',
      topic: 'js-async:async-await',
      prompt: 'Este código busca 10 produtos **independentes**, cada busca leva ~200ms. Quanto tempo ele leva, aproximadamente, e como melhorar?',
      code: `const produtos = [];
for (const id of ids) {
  produtos.push(await buscarProduto(id));
}`,
      options: [
        '~2s, porque cada `await` espera o anterior; melhorar com `await Promise.all(ids.map(buscarProduto))` (~200ms)',
        '~200ms, porque o `for` dispara tudo em paralelo',
        '~2s, e não há como melhorar em JavaScript',
        '~200ms, mas a ordem dos produtos fica aleatória',
      ],
      answer: 0,
      explain: '`await` dentro do loop **serializa** as buscas: 10 × 200ms. Disparando todas antes (`map` cria as Promises) e esperando com `Promise.all`, o tempo total é o da mais lenta, e a ordem do resultado é a ordem dos ids.',
    },
    {
      kind: 'choice',
      id: 'p5-callback-hell',
      topic: 'js-async:callbacks',
      prompt: 'Qual é o principal problema do "callback hell" que as Promises resolvem?',
      options: [
        'Callbacks aninhados em vários níveis, difíceis de ler e com tratamento de erro repetido em cada nível; Promises permitem encadear com `.then` e tratar erros num `.catch` só',
        'Callbacks são mais lentos que Promises',
        'Callbacks não funcionam com `setTimeout`',
        'Callbacks não podem receber parâmetros',
      ],
      answer: 0,
      explain: 'Com callbacks, cada passo assíncrono entra um nível para dentro, e cada nível precisa checar o erro. Promises "achatam" a cadeia e propagam o erro até o primeiro `.catch` (ou `try/catch` com `await`).',
    },
    {
      kind: 'choice',
      id: 'p5-async-retorna',
      topic: 'js-async:async-await',
      prompt: 'O que uma `async function` retorna quando você a chama?',
      options: [
        'Sempre uma **Promise** (que resolve com o valor do `return`, ou rejeita com o erro lançado)',
        'O valor do `return` diretamente',
        '`undefined` até o `await` terminar',
        'Um callback',
      ],
      answer: 0,
      explain: 'Mesmo `async function f() { return 1 }` devolve `Promise<1>`. Por isso quem chama precisa de `await` (ou `.then`) para pegar o valor, e erros dentro dela viram rejeição.',
    },
    {
      kind: 'choice',
      id: 'p5-heap-topk',
      topic: 'leetcode:heap',
      prompt: 'Para achar os **k maiores** elementos de um array de n números, mantendo um **min-heap de tamanho k**, qual a complexidade?',
      options: ['O(n log k)', 'O(n²)', 'O(k)', 'O(n log n) sempre'],
      answer: 0,
      explain: 'Cada um dos n elementos pode entrar e sair do heap, e cada operação custa O(log k) porque o heap nunca passa de k itens. Ordenar tudo seria O(n log n), pior quando k é pequeno.',
    },
    {
      kind: 'choice',
      id: 'p5-backtracking',
      topic: 'leetcode:backtracking',
      prompt: 'No backtracking (ex.: gerar todos os subconjuntos), por que fazemos `caminho.pop()` depois da chamada recursiva?',
      options: [
        'Para **desfazer a escolha** e voltar ao estado anterior antes de tentar a próxima opção',
        'Para liberar memória do array',
        'Porque o `push` duplica o elemento',
        'Para encerrar a recursão',
      ],
      answer: 0,
      explain: 'Backtracking é "escolhe → explora → desfaz". O mesmo array `caminho` é reaproveitado por todos os ramos, então cada ramo precisa devolvê-lo como encontrou.',
    },
    {
      kind: 'output',
      id: 'p5-out-classico',
      topic: 'js-async:event-loop',
      code: `console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");`,
      expected: ['A', 'D', 'C', 'B'],
      explain: 'Primeiro todo o código síncrono: A e D. Depois as microtasks: o `.then` (C). Por último a macrotask do `setTimeout` (B), mesmo com 0ms.',
    },
    {
      kind: 'output',
      id: 'p5-out-await',
      topic: 'js-async:async-await',
      code: `async function f() {
  console.log("1");
  await null;
  console.log("2");
}
f();
console.log("3");`,
      expected: ['1', '3', '2'],
      explain: 'A função `async` roda **sincronamente** até o primeiro `await` (imprime 1). No `await`, ela sai da pilha e o resto vira uma microtask. O script continua (3) e, com a pilha livre, a função volta (2).',
    },
    {
      kind: 'output',
      id: 'p5-out-chain',
      topic: 'js-async:promises',
      code: `Promise.resolve(1)
  .then((x) => x + 1)
  .then((x) => { throw new Error("ops " + x); })
  .then(() => console.log("não roda"))
  .catch((e) => { console.log(e.message); return 10; })
  .then((x) => console.log("depois", x));`,
      expected: ['ops 2', 'depois 10'],
      explain: 'O erro pula todos os `.then` até o primeiro `.catch`. O `catch` **trata** o erro e o que ele retorna (10) segue para o próximo `.then`, como se nada tivesse acontecido.',
    },
    {
      kind: 'output',
      id: 'p5-out-misto',
      topic: 'js-async:event-loop',
      code: `setTimeout(() => console.log("t1"), 0);
Promise.resolve()
  .then(() => {
    console.log("p1");
    setTimeout(() => console.log("t2"), 0);
  })
  .then(() => console.log("p2"));
queueMicrotask(() => console.log("q1"));`,
      expected: ['p1', 'q1', 'p2', 't1', 't2'],
      explain: 'Fila de microtasks no fim do script: [p1, q1]. Rodando p1, agenda t2 (macrotask) e, ao terminar, coloca p2 no **fim** da fila de microtasks: [q1, p2]. Só com as microtasks vazias vêm as macrotasks, na ordem em que foram agendadas: t1 e depois t2.',
    },
    {
      kind: 'code',
      id: 'p5-code-users',
      topic: 'js-async:concorrencia',
      problem: {
        id: 'prova-fetch-names',
        title: 'Buscar nomes em paralelo',
        difficulty: 'Médio',
        pattern: 'concorrencia',
        fnName: 'fetchNames',
        params: ['api', 'ids'],
        io: {
          harness: `async (fetchNames, ids) => {
  const api = {
    getUser: (id) =>
      new Promise((resolve, reject) =>
        setTimeout(() => (id < 0 ? reject(new Error('usuário ' + id + ' não existe')) : resolve({ id, name: 'user' + id })), 40),
      ),
  };
  const start = Date.now();
  const result = await fetchNames(api, ids);
  const ms = Date.now() - start;
  return { result, parallel: ids.length < 2 || ms < 40 * ids.length * 0.6 };
}`,
        },
        description: `
Escreva \`async function fetchNames(api, ids)\` que busca todos os usuários com \`api.getUser(id)\` **em paralelo** e retorna um array com os \`name\` dos que deram certo, **na mesma ordem dos ids**. Os que falharem são **ignorados** (sem derrubar o resto).

**Como é testado:** \`api.getUser\` leva ~40ms e rejeita para ids negativos. O teste mede o tempo: buscar um por um (com \`await\` dentro do loop) faz \`parallel\` ficar \`false\`.
`,
        examples: [
          { input: 'ids = [1, -2, 3]', output: '{ result: ["user1", "user3"], parallel: true }' },
          { input: 'ids = []', output: '{ result: [], parallel: true }' },
        ],
        constraints: [],
        starter: {
          js: `/**
 * @param {{ getUser: (id: number) => Promise<{ id: number, name: string }> }} api
 * @param {number[]} ids
 * @return {Promise<string[]>}
 */
async function fetchNames(api, ids) {

}
`,
          ts: `interface Api {
  getUser(id: number): Promise<{ id: number; name: string }>;
}

async function fetchNames(api: Api, ids: number[]): Promise<string[]> {

}
`,
        },
        tests: [
          { input: [[1, -2, 3]], expected: { result: ['user1', 'user3'], parallel: true }, label: 'Um falha' },
          { input: [[]], expected: { result: [], parallel: true }, label: 'Nenhum id' },
          { input: [[5, 4, 3, 2, 1]], expected: { result: ['user5', 'user4', 'user3', 'user2', 'user1'], parallel: true }, label: 'Ordem dos ids' },
          { input: [[-1, -2]], expected: { result: [], parallel: true }, label: 'Todos falham' },
        ],
        hints: [
          'Dispare todas as buscas antes de esperar: `ids.map((id) => api.getUser(id))`.',
          '`await Promise.allSettled(promises)` devolve `{ status, value | reason }` para cada uma, na ordem.',
          'Filtre `status === "fulfilled"` e pegue `value.name`.',
        ],
        explanation: {
          intuition: 'As buscas são independentes, então podem acontecer ao mesmo tempo. `allSettled` espera todas sem desistir na primeira falha, e devolve os resultados na ordem das Promises (não na ordem em que terminaram).',
          steps: ['`const results = await Promise.allSettled(ids.map((id) => api.getUser(id)))`.', '`return results.filter((r) => r.status === "fulfilled").map((r) => r.value.name)`.'],
          time: '≈ tempo da busca mais lenta',
          space: 'O(n)',
          complexityWhy: 'Todas as buscas correm juntas.',
          pitfalls: ['`await` dentro do `for` (sequencial: n × 40ms).', '`Promise.all`: uma falha rejeita tudo.', 'Juntar os nomes na ordem em que as respostas chegam (perde a ordem dos ids).'],
        },
        solution: {
          js: `async function fetchNames(api, ids) {
  const results = await Promise.allSettled(ids.map((id) => api.getUser(id)));
  return results.filter((r) => r.status === 'fulfilled').map((r) => r.value.name);
}
`,
          ts: `interface Api {
  getUser(id: number): Promise<{ id: number; name: string }>;
}

async function fetchNames(api: Api, ids: number[]): Promise<string[]> {
  const results = await Promise.allSettled(ids.map((id) => api.getUser(id)));
  return results.flatMap((r) => (r.status === 'fulfilled' ? [r.value.name] : []));
}
`,
        },
      },
    },
    {
      kind: 'code',
      id: 'p5-code-ksmallest',
      topic: 'leetcode:heap',
      problem: {
        id: 'prova-k-smallest',
        title: 'Os k menores preços',
        difficulty: 'Médio',
        pattern: 'heap',
        fnName: 'kSmallest',
        params: ['prices', 'k'],
        description: `
Um comparador de preços precisa mostrar as **k ofertas mais baratas** de uma lista enorme.

Escreva \`kSmallest(prices, k)\` que retorna os \`k\` menores valores **em ordem crescente**. Use um **heap de tamanho k** para ficar em O(n log k). Se \`k\` for maior que a lista, retorne todos (ordenados).
`,
        examples: [
          { input: 'kSmallest([30, 10, 50, 20, 40], 2)', output: '[10, 20]' },
          { input: 'kSmallest([5, 1], 5)', output: '[1, 5]' },
        ],
        constraints: ['0 <= k', '0 <= prices.length <= 10^5'],
        starter: {
          js: `/*
 * ${HEAP_DOC}
 */
/**
 * @param {number[]} prices
 * @param {number} k
 * @return {number[]}
 */
function kSmallest(prices, k) {

}
`,
          ts: `/*
 * ${HEAP_DOC}
 */
function kSmallest(prices: number[], k: number): number[] {

}
`,
        },
        tests: [
          { input: [[30, 10, 50, 20, 40], 2], expected: [10, 20], label: 'Exemplo 1' },
          { input: [[5, 1], 5], expected: [1, 5], label: 'k maior que a lista' },
          { input: [[7, 7, 3, 7], 3], expected: [3, 7, 7], label: 'Repetidos' },
          { input: [[4, 2, 9], 0], expected: [], label: 'k = 0' },
          { input: [[], 3], expected: [], label: 'Lista vazia' },
          { input: [[-1, 8, -5, 0, 3], 3], expected: [-5, -1, 0], label: 'Negativos' },
        ],
        hints: [
          'Use um **MaxHeap** com os k menores vistos até agora: o topo é o **maior** deles (o que sai primeiro se aparecer alguém menor).',
          'Para cada preço: `push`; se o tamanho passar de k, `pop` (remove o maior).',
          'No fim, tire tudo do heap e ordene (ou tire e inverta).',
        ],
        explanation: {
          intuition: 'O heap guarda "os k campeões" até agora. Com um MaxHeap, o pior dos campeões fica no topo, pronto para ser expulso quando chega alguém melhor. O heap nunca passa de k itens, então cada operação é O(log k).',
          steps: ['Se `k === 0`, `[]`.', 'Para cada preço: `heap.push(p)`; se `heap.size() > k`, `heap.pop()`.', 'Esvazie o heap num array e ordene em ordem crescente.'],
          time: 'O(n log k)',
          space: 'O(k)',
          complexityWhy: 'n inserções/remoções num heap de tamanho k.',
          pitfalls: ['Usar MinHeap com todos os n itens (O(n log n), funciona mas perde o ponto).', 'Esquecer o caso k = 0 (o heap ficaria com 1 item).'],
        },
        solution: {
          js: `function kSmallest(prices, k) {
  if (k === 0) return [];
  const heap = new MaxHeap();
  for (const p of prices) {
    heap.push(p);
    if (heap.size() > k) heap.pop();
  }
  const out = [];
  while (!heap.isEmpty()) out.push(heap.pop());
  return out.reverse();
}
`,
          ts: `function kSmallest(prices: number[], k: number): number[] {
  if (k === 0) return [];
  const heap = new MaxHeap();
  for (const p of prices) {
    heap.push(p);
    if (heap.size() > k) heap.pop();
  }
  const out: number[] = [];
  while (!heap.isEmpty()) out.push(heap.pop());
  return out.reverse();
}
`,
        },
      },
    },
    {
      kind: 'code',
      id: 'p5-code-parens',
      topic: 'leetcode:backtracking',
      problem: {
        id: 'prova-generate-parens',
        title: 'Parênteses válidos',
        difficulty: 'Médio',
        pattern: 'backtracking',
        leetcode: { number: 22, slug: 'generate-parentheses' },
        fnName: 'generateParenthesis',
        params: ['n'],
        compare: 'unordered',
        description: `
Escreva \`generateParenthesis(n)\` que retorna **todas** as combinações de \`n\` pares de parênteses **bem formados**. A ordem do resultado não importa.
`,
        examples: [
          { input: 'generateParenthesis(3)', output: '["((()))", "(()())", "(())()", "()(())", "()()()"]' },
          { input: 'generateParenthesis(1)', output: '["()"]' },
        ],
        constraints: ['1 <= n <= 8'],
        starter: starter('function generateParenthesis(n)', 'function generateParenthesis(n: number): string[]', '/**\n * @param {number} n\n * @return {string[]}\n */'),
        tests: [
          { input: [3], expected: ['((()))', '(()())', '(())()', '()(())', '()()()'], label: 'n = 3' },
          { input: [1], expected: ['()'], label: 'n = 1' },
          { input: [2], expected: ['(())', '()()'], label: 'n = 2' },
          {
            input: [4],
            expected: ['(((())))', '((()()))', '((())())', '((()))()', '(()(()))', '(()()())', '(()())()', '(())(())', '(())()()', '()((()))', '()(()())', '()(())()', '()()(())', '()()()()'],
            label: 'n = 4 (14 combinações)',
          },
        ],
        hints: [
          'Construa a string um caractere por vez, contando quantos `(` e `)` já usou.',
          'Pode abrir se `abertos < n`. Pode fechar se `fechados < abertos` (nunca fechar o que não abriu).',
          'Quando a string tiver `2 * n` caracteres, ela é uma resposta.',
        ],
        explanation: {
          intuition: 'Em vez de gerar todas as strings e filtrar as válidas, o backtracking só segue caminhos que **ainda podem** dar certo: as duas regras (abrir até n, fechar só o que abriu) podam os ramos inválidos.',
          steps: ['`back(atual, abertos, fechados)`.', 'Se `atual.length === 2n`, guarde.', 'Se `abertos < n`, `back(atual + "(", abertos + 1, fechados)`.', 'Se `fechados < abertos`, `back(atual + ")", abertos, fechados + 1)`.'],
          time: 'O(4ⁿ / √n)',
          space: 'O(n)',
          complexityWhy: 'Proporcional ao número de respostas (números de Catalan); a pilha tem profundidade 2n.',
          pitfalls: ['Permitir `)` quando `fechados === abertos` (gera ")(" inválidos).', 'Usar a mesma string mutável sem desfazer (com strings imutáveis, `atual + "("` já cria uma nova).'],
        },
        solution: {
          js: `function generateParenthesis(n) {
  const out = [];
  const back = (atual, abertos, fechados) => {
    if (atual.length === 2 * n) {
      out.push(atual);
      return;
    }
    if (abertos < n) back(atual + '(', abertos + 1, fechados);
    if (fechados < abertos) back(atual + ')', abertos, fechados + 1);
  };
  back('', 0, 0);
  return out;
}
`,
          ts: `function generateParenthesis(n: number): string[] {
  const out: string[] = [];
  const back = (atual: string, abertos: number, fechados: number): void => {
    if (atual.length === 2 * n) {
      out.push(atual);
      return;
    }
    if (abertos < n) back(atual + '(', abertos + 1, fechados);
    if (fechados < abertos) back(atual + ')', abertos, fechados + 1);
  };
  back('', 0, 0);
  return out;
}
`,
        },
      },
    },
    {
      kind: 'essay',
      id: 'p5-essay-event-loop',
      topic: 'js-async:event-loop',
      prompt: 'Entrevistador: **"Explique como funciona o event loop do JavaScript."** Fale da call stack, das Web APIs e das filas.',
      model: `
O JavaScript executa o código numa **única thread**, usando a **call stack**: cada função chamada entra na pilha e sai quando termina.

Operações demoradas (timers, requisições de rede, leitura de arquivo) **não** ficam na pilha: são entregues ao ambiente (as **Web APIs** no navegador, a **libuv** no Node). Quando terminam, o callback correspondente vai para uma **fila**.

Existem duas filas principais:

- **microtasks**: callbacks de Promises (\`.then\`, continuação de \`await\`) e \`queueMicrotask\`;
- **macrotasks**: \`setTimeout\`, \`setInterval\`, eventos e I/O.

O **event loop** fica observando: quando a call stack está **vazia**, ele executa **todas** as microtasks e depois **uma** macrotask, e repete. Por isso um \`.then\` roda antes de um \`setTimeout(fn, 0)\`, e por isso código síncrono pesado trava tudo: enquanto a pilha está ocupada, nada da fila roda.
`,
      checklist: [
        'Uma thread com uma call stack',
        'Operações demoradas são delegadas às Web APIs / libuv',
        'Callbacks prontos vão para filas',
        'Diferenciou microtasks (Promises/await) de macrotasks (setTimeout)',
        'O loop só pega da fila quando a pilha está vazia, e microtasks têm prioridade',
        'Mencionou uma consequência prática (ordem da saída, código síncrono pesado trava)',
      ],
    },
    {
      kind: 'essay',
      id: 'p5-essay-combinadores',
      topic: 'js-async:concorrencia',
      prompt: 'Entrevistador: **"Qual a diferença entre `Promise.all`, `Promise.allSettled`, `Promise.race` e `Promise.any`? Dê um caso de uso para cada."**',
      model: `
Todos recebem uma lista de Promises e rodam tudo **em paralelo**; a diferença é **quando** e **com o quê** eles resolvem:

- **\`all\`**: resolve com o array de resultados quando **todas** dão certo; rejeita na **primeira falha**. Uso: carregar dados que dependem uns dos outros para a tela fazer sentido (usuário + permissões).
- **\`allSettled\`**: espera **todas** terminarem e devolve o status de cada uma (\`fulfilled\`/\`rejected\`), nunca rejeita. Uso: painel com widgets independentes, envio de vários e-mails e relatório de quais falharam.
- **\`race\`**: fica com a **primeira que terminar**, dando certo ou errado. Uso: implementar **timeout** (\`race([fetch, sleepEReject(5000)])\`).
- **\`any\`**: fica com a **primeira que der certo**; só rejeita se todas falharem. Uso: buscar o mesmo arquivo em vários servidores/CDNs e usar o mais rápido que responder.
`,
      checklist: [
        '`all`: todas precisam dar certo; rejeita na primeira falha',
        '`allSettled`: espera todas e informa o status de cada uma',
        '`race`: a primeira que terminar (sucesso ou erro)',
        '`any`: a primeira que der certo',
        'Deu pelo menos dois casos de uso concretos (ex.: timeout com race)',
      ],
    },
  ],
}
