import type { Exam } from '../types'
import { starter } from '../js/helpers'

export const PROVA_2: Exam = {
  id: 'prova-2',
  title: 'Prova 2 · Trabalhando com dados',
  stage: 'dados',
  summary: 'Arrays, métodos de array, objetos, Map e Set, e os padrões **Arrays & Hashing** e **Two Pointers** do LeetCode. Aqui entram as primeiras perguntas de complexidade, como numa entrevista técnica.',
  minutes: 45,
  passPct: 70,
  questions: [
    {
      kind: 'choice',
      id: 'p2-splice',
      topic: 'js-fundamentos:arrays',
      prompt: 'Qual destes métodos **altera o array original**?',
      options: ['`splice`', '`slice`', '`map`', '`concat`'],
      answer: 0,
      explain: '`splice` remove/insere no próprio array. `slice`, `map` e `concat` devolvem arrays **novos** e deixam o original intacto.',
    },
    {
      kind: 'choice',
      id: 'p2-map-foreach',
      topic: 'js-fundamentos:arrays-metodos',
      prompt: 'Você tem uma lista de usuários e precisa de uma lista **só com os e-mails**. Qual método expressa melhor essa intenção?',
      options: ['`usuarios.map((u) => u.email)`', '`usuarios.forEach((u) => u.email)`', '`usuarios.filter((u) => u.email)`', '`usuarios.find((u) => u.email)`'],
      answer: 0,
      explain: '`map` transforma cada item e devolve um array do mesmo tamanho. `forEach` devolve `undefined`; `filter` devolveria os **usuários** que têm e-mail; `find` devolveria só o primeiro.',
    },
    {
      kind: 'choice',
      id: 'p2-set-busca',
      topic: 'js-fundamentos:map-set',
      prompt: 'Você precisa conferir, para cada um dos **100 mil pedidos**, se o cliente está numa lista de **50 mil clientes bloqueados** (array de ids). Qual a melhor abordagem?',
      options: [
        'Criar um `Set` com os bloqueados uma vez e usar `bloqueados.has(id)` para cada pedido',
        'Usar `bloqueados.includes(id)` para cada pedido',
        'Ordenar os pedidos antes de comparar',
        'Usar `bloqueados.indexOf(id) !== -1` para cada pedido',
      ],
      answer: 0,
      explain: '`includes`/`indexOf` percorrem o array a cada consulta: 100 mil × 50 mil comparações (O(n·m)). Com um `Set`, cada `has` é O(1) em média: o total cai para O(n + m).',
    },
    {
      kind: 'choice',
      id: 'p2-two-sum-cx',
      topic: 'leetcode:arrays-hashing',
      prompt: 'No **Two Sum** resolvido com um `Map` (guardando "valor → índice" enquanto percorre o array), qual a complexidade?',
      options: ['O(n) de tempo e O(n) de espaço', 'O(n²) de tempo e O(1) de espaço', 'O(n log n) de tempo e O(1) de espaço', 'O(1) de tempo e O(n) de espaço'],
      answer: 0,
      explain: 'Uma passada pelo array (O(n)), com consultas O(1) no Map, que pode guardar até n itens (O(n) de espaço). A força bruta com dois loops é O(n²) de tempo e O(1) de espaço: troca-se memória por tempo.',
    },
    {
      kind: 'choice',
      id: 'p2-two-pointers-req',
      topic: 'leetcode:two-pointers',
      prompt: 'A técnica de **dois ponteiros nas pontas** (`l` no início, `r` no fim) para achar um par com soma igual ao alvo só funciona quando...',
      options: ['o array está **ordenado**', 'o array não tem números negativos', 'o array tem tamanho par', 'os valores são todos diferentes'],
      answer: 0,
      explain: 'Com o array ordenado, se a soma está **pequena** você sabe que precisa andar `l` para a direita (valores maiores); se está **grande**, anda `r` para a esquerda. Sem ordenação, mover um ponteiro não diz nada sobre a soma.',
    },
    {
      kind: 'choice',
      id: 'p2-imutavel',
      topic: 'js-fundamentos:arrays',
      prompt: 'Num componente React, `itens` está no estado. Qual forma de adicionar um item segue a boa prática?',
      options: ['`setItens([...itens, novo])`', '`itens.push(novo); setItens(itens)`', '`setItens(itens.push(novo))`', '`itens[itens.length] = novo`'],
      answer: 0,
      explain: 'O React compara **referências** para saber se o estado mudou. `push` altera o mesmo array (a referência não muda e a tela pode não atualizar). Além disso, `push` devolve o novo **tamanho**, não o array.',
    },
    {
      kind: 'choice',
      id: 'p2-colchetes',
      topic: 'js-fundamentos:objetos',
      prompt: 'Uma função recebe o **nome do campo** numa variável (`campo = "email"`) e precisa ler esse campo do objeto `user`. Como fazer?',
      options: ['`user[campo]`', '`user.campo`', '`user."campo"`', '`user->campo`'],
      answer: 0,
      explain: '`user.campo` procura uma chave chamada literalmente "campo". Com colchetes, o JS usa o **valor** da variável: `user["email"]`.',
    },
    {
      kind: 'output',
      id: 'p2-out-sort',
      topic: 'js-fundamentos:arrays',
      code: `const nums = [3, 1, 2];
const ordenado = [...nums].sort((a, b) => a - b);
console.log(nums[0], ordenado[0]);
console.log(nums === ordenado, nums.length === ordenado.length);`,
      expected: ['3 1', 'false true'],
      explain: 'O spread criou uma **cópia** antes do `sort` (que altera o array em que é chamado). Então `nums` continua `[3, 1, 2]` e `ordenado` é `[1, 2, 3]`: arrays diferentes, mesmo tamanho.',
    },
    {
      kind: 'output',
      id: 'p2-out-chain',
      topic: 'js-fundamentos:arrays-metodos',
      code: `const total = [1, 2, 3, 4]
  .filter((n) => n % 2 === 0)
  .map((n) => n * 10)
  .reduce((acc, n) => acc + n, 0);
console.log(total);
console.log([1, 2, 3].some((n) => n > 2), [1, 2, 3].every((n) => n > 2));`,
      expected: ['60', 'true false'],
      explain: '`filter` → `[2, 4]`; `map` → `[20, 40]`; `reduce` soma → 60. `some` pergunta "algum é maior que 2?" (sim, o 3); `every` pergunta "todos?" (não).',
    },
    {
      kind: 'output',
      id: 'p2-out-map-set',
      topic: 'js-fundamentos:map-set',
      code: `const s = new Set([1, 2, 2, 3, 3, 3]);
const m = new Map();
m.set("a", 1).set("b", 2).set("a", 3);
console.log(s.size, m.size, m.get("a"));
console.log(s.has("1"), m.has("c"));`,
      expected: ['3 2 3', 'false false'],
      explain: 'O Set guarda valores únicos: {1, 2, 3}. No Map, o segundo `set("a", ...)` **substitui** o valor da chave existente: 2 chaves, "a" vale 3. E o Set não converte tipos: `"1"` não é `1`.',
    },
    {
      kind: 'output',
      id: 'p2-out-obj',
      topic: 'js-fundamentos:objetos',
      code: `const user = { nome: "Ana", idade: 28 };
const chaves = Object.keys(user);
user.cidade = "Americana";
console.log(chaves.length, Object.keys(user).length);
console.log("idade" in user, user.email);`,
      expected: ['2 3', 'true undefined'],
      explain: '`Object.keys` devolve um array **novo** no momento da chamada: adicionar `cidade` depois não muda `chaves`. Ler uma chave que não existe dá `undefined` (não lança erro).',
    },
    {
      kind: 'code',
      id: 'p2-code-first-repeated',
      topic: 'leetcode:arrays-hashing',
      problem: {
        id: 'prova-first-repeated',
        title: 'Primeiro repetido',
        difficulty: 'Fácil',
        pattern: 'arrays-hashing',
        fnName: 'firstRepeated',
        params: ['items'],
        description: `
Um sistema de cupons precisa detectar o **primeiro cupom usado duas vezes**.

Escreva \`firstRepeated(items)\` que percorre a lista e retorna o **primeiro item que aparece pela segunda vez** (o primeiro cuja repetição acontece). Se nenhum repetir, retorne \`null\`.

Sua solução deve ser **O(n)**.
`,
        examples: [
          { input: 'firstRepeated(["a", "b", "c", "b", "a"])', output: '"b"', explanation: 'O "b" repete (índice 3) antes do "a" (índice 4).' },
          { input: 'firstRepeated([1, 2, 3])', output: 'null' },
        ],
        constraints: ['0 <= items.length <= 10^5'],
        starter: starter('function firstRepeated(items)', 'function firstRepeated<T>(items: T[]): T | null', '/**\n * @param {any[]} items\n * @return {any}\n */'),
        tests: [
          { input: [['a', 'b', 'c', 'b', 'a']], expected: 'b', label: 'Exemplo 1' },
          { input: [[1, 2, 3]], expected: null, label: 'Sem repetidos' },
          { input: [[]], expected: null, label: 'Vazio' },
          { input: [[5, 5]], expected: 5, label: 'Repetido logo de cara' },
          { input: [[1, 2, 3, 4, 2, 1]], expected: 2, label: 'O que repete primeiro' },
          { input: [['1', 1]], expected: null, label: '"1" e 1 são diferentes' },
        ],
        hints: ['Guarde num `Set` tudo que você já viu. Antes de adicionar, pergunte `visto.has(item)`.'],
        explanation: {
          intuition: 'A pergunta "já vi esse item antes?" é exatamente o que um `Set` responde em O(1). Percorrendo na ordem, o primeiro item que já está no Set é a resposta.',
          steps: ['`const visto = new Set()`.', 'Para cada item: se `visto.has(item)`, retorne o item; senão `visto.add(item)`.', 'Retorne `null`.'],
          time: 'O(n)',
          space: 'O(n)',
          complexityWhy: 'Uma passada; o Set guarda até n itens.',
          pitfalls: ['Dois loops (O(n²)) ou `includes` dentro do loop (também O(n²)).', 'Retornar o primeiro item que **tem** repetição na lista (o "a" no exemplo), em vez do primeiro que **repete**.'],
        },
        solution: {
          js: `function firstRepeated(items) {
  const visto = new Set();
  for (const item of items) {
    if (visto.has(item)) return item;
    visto.add(item);
  }
  return null;
}
`,
          ts: `function firstRepeated<T>(items: T[]): T | null {
  const visto = new Set<T>();
  for (const item of items) {
    if (visto.has(item)) return item;
    visto.add(item);
  }
  return null;
}
`,
        },
      },
    },
    {
      kind: 'code',
      id: 'p2-code-merge',
      topic: 'leetcode:two-pointers',
      problem: {
        id: 'prova-merge-sorted',
        title: 'Juntar duas listas ordenadas',
        difficulty: 'Fácil',
        pattern: 'two-pointers',
        fnName: 'mergeSorted',
        params: ['a', 'b'],
        description: `
Duas filiais mandam os horários de atendimento já **ordenados**. Junte as duas listas numa só, **também ordenada**.

Escreva \`mergeSorted(a, b)\` em **O(n + m)**: não vale juntar e chamar \`sort\` (seria O((n+m) log(n+m))). Use **dois ponteiros**, um em cada lista.
`,
        examples: [
          { input: 'mergeSorted([1, 4, 9], [2, 3, 10])', output: '[1, 2, 3, 4, 9, 10]' },
          { input: 'mergeSorted([], [5])', output: '[5]' },
        ],
        constraints: ['a e b estão em ordem crescente'],
        starter: starter('function mergeSorted(a, b)', 'function mergeSorted(a: number[], b: number[]): number[]', '/**\n * @param {number[]} a\n * @param {number[]} b\n * @return {number[]}\n */'),
        tests: [
          { input: [[1, 4, 9], [2, 3, 10]], expected: [1, 2, 3, 4, 9, 10], label: 'Exemplo 1' },
          { input: [[], [5]], expected: [5], label: 'Uma vazia' },
          { input: [[], []], expected: [], label: 'As duas vazias' },
          { input: [[1, 2, 3], [4, 5]], expected: [1, 2, 3, 4, 5], label: 'Sem intercalar' },
          { input: [[2, 2, 7], [2, 8]], expected: [2, 2, 2, 7, 8], label: 'Repetidos' },
          { input: [[-5, 0], [-10, -1, 20]], expected: [-10, -5, -1, 0, 20], label: 'Negativos' },
        ],
        hints: ['`i` aponta para `a`, `j` para `b`. Enquanto os dois tiverem itens, empurre o menor e avance só o ponteiro dele.', 'No fim, sobra uma das listas: copie o resto dela.'],
        explanation: {
          intuition: 'Como as duas listas estão ordenadas, o menor item restante está sempre na **ponta** de uma delas. Comparando só as duas pontas, você monta o resultado em uma passada (é a etapa "merge" do merge sort).',
          steps: ['`i = 0, j = 0, out = []`.', 'Enquanto `i < a.length && j < b.length`: empurre o menor entre `a[i]` e `b[j]` e avance esse ponteiro.', 'Copie o que sobrou de `a` e de `b`.'],
          time: 'O(n + m)',
          space: 'O(n + m)',
          complexityWhy: 'Cada item é visitado uma vez e copiado para o resultado.',
          pitfalls: ['Esquecer de copiar o resto de uma das listas.', 'Avançar os dois ponteiros em cada volta.'],
        },
        solution: {
          js: `function mergeSorted(a, b) {
  const out = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) out.push(a[i++]);
    else out.push(b[j++]);
  }
  while (i < a.length) out.push(a[i++]);
  while (j < b.length) out.push(b[j++]);
  return out;
}
`,
          ts: `function mergeSorted(a: number[], b: number[]): number[] {
  const out: number[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) out.push(a[i++]);
    else out.push(b[j++]);
  }
  while (i < a.length) out.push(a[i++]);
  while (j < b.length) out.push(b[j++]);
  return out;
}
`,
        },
      },
    },
    {
      kind: 'code',
      id: 'p2-code-ranking',
      topic: 'js-fundamentos:arrays-metodos',
      problem: {
        id: 'prova-top-scorers',
        title: 'Pódio do ranking',
        difficulty: 'Médio',
        pattern: 'arrays-metodos',
        fnName: 'podium',
        params: ['players'],
        description: `
Um jogo mostra o **pódio**: os 3 jogadores com mais pontos.

Escreva \`podium(players)\` que recebe \`[{ nome, pontos }]\` e retorna os **nomes** dos até 3 primeiros, ordenados por pontos (maior primeiro). Em caso de empate, o nome em **ordem alfabética** vem primeiro. **Não altere** o array recebido.
`,
        examples: [
          {
            input: 'podium([{ nome: "Bia", pontos: 50 }, { nome: "Ana", pontos: 80 }, { nome: "Caio", pontos: 50 }, { nome: "Duda", pontos: 10 }])',
            output: '["Ana", "Bia", "Caio"]',
          },
        ],
        constraints: [],
        starter: starter(
          'function podium(players)',
          'interface Player {\n  nome: string;\n  pontos: number;\n}\n\nfunction podium(players: Player[]): string[]',
          '/**\n * @param {{ nome: string, pontos: number }[]} players\n * @return {string[]}\n */',
        ),
        io: {
          harness: `(podium, players) => {
  const antes = JSON.stringify(players);
  const r = podium(players);
  if (JSON.stringify(players) !== antes) throw new Error('Você alterou o array recebido (sort altera o original: copie antes).');
  return r;
}`,
        },
        tests: [
          {
            input: [[{ nome: 'Bia', pontos: 50 }, { nome: 'Ana', pontos: 80 }, { nome: 'Caio', pontos: 50 }, { nome: 'Duda', pontos: 10 }]],
            expected: ['Ana', 'Bia', 'Caio'],
            label: 'Exemplo 1',
          },
          { input: [[{ nome: 'Zé', pontos: 5 }]], expected: ['Zé'], label: 'Um jogador' },
          { input: [[]], expected: [], label: 'Ninguém' },
          {
            input: [[{ nome: 'Caio', pontos: 30 }, { nome: 'Ana', pontos: 30 }, { nome: 'Bia', pontos: 30 }, { nome: 'Abel', pontos: 30 }]],
            expected: ['Abel', 'Ana', 'Bia'],
            label: 'Todos empatados',
          },
          {
            input: [[{ nome: 'A', pontos: 1 }, { nome: 'B', pontos: 2 }, { nome: 'C', pontos: 3 }, { nome: 'D', pontos: 4 }, { nome: 'E', pontos: 5 }]],
            expected: ['E', 'D', 'C'],
            label: 'Em ordem crescente',
          },
        ],
        hints: [
          'Copie antes de ordenar: `[...players].sort(...)` (ou `toSorted`).',
          'Comparador com desempate: `(a, b) => b.pontos - a.pontos || a.nome.localeCompare(b.nome)`.',
          'Depois: `.slice(0, 3).map((p) => p.nome)`.',
        ],
        explanation: {
          intuition: 'Ordenar com um comparador que resolve o empate e pegar os 3 primeiros. O `||` no comparador só usa o segundo critério quando o primeiro dá 0 (empate).',
          steps: ['Copie o array.', 'Ordene por pontos desc e nome asc.', '`slice(0, 3)` e `map` para os nomes.'],
          time: 'O(n log n)',
          space: 'O(n)',
          complexityWhy: 'A ordenação domina. (Com um heap de tamanho 3 daria O(n), mas é exagero aqui.)',
          pitfalls: ['`players.sort(...)` altera o array do chamador.', 'Comparar nomes com `a.nome > b.nome` sem retornar número (o comparador precisa de negativo/0/positivo).'],
        },
        solution: {
          js: `function podium(players) {
  return [...players]
    .sort((a, b) => b.pontos - a.pontos || a.nome.localeCompare(b.nome))
    .slice(0, 3)
    .map((p) => p.nome);
}
`,
          ts: `interface Player {
  nome: string;
  pontos: number;
}

function podium(players: Player[]): string[] {
  return [...players]
    .sort((a, b) => b.pontos - a.pontos || a.nome.localeCompare(b.nome))
    .slice(0, 3)
    .map((p) => p.nome);
}
`,
        },
      },
    },
    {
      kind: 'essay',
      id: 'p2-essay-map-set',
      topic: 'js-fundamentos:map-set',
      prompt: 'Entrevistador: **"Quando você usaria um `Map` em vez de um objeto? E um `Set` em vez de um array?"**',
      model: `
**Map × objeto:** uso \`Map\` para **dicionários dinâmicos**, com chaves que surgem em tempo de execução (contagens, caches, índice por id). Ele aceita **qualquer tipo de chave** sem converter para string, mantém a **ordem de inserção**, tem \`.size\` e não tem chaves herdadas do protótipo. Para dados com **formato fixo** (um usuário, uma config, o JSON de uma API), uso **objeto**.

**Set × array:** uso \`Set\` quando preciso de **valores únicos** ou de **consultas rápidas** ("isso existe?"): \`has\` é **O(1)** em média, enquanto \`includes\` no array é **O(n)**. Um exemplo clássico é trocar \`lista.filter(x => outra.includes(x))\` (O(n·m)) por um Set da outra lista (O(n + m)). Quando a ordem e repetições importam, ou preciso de índice, fico com o array.
`,
      checklist: [
        'Map aceita chaves de qualquer tipo (objeto converte para string)',
        'Map para dicionários dinâmicos; objeto para dados com formato fixo',
        'Set guarda valores únicos',
        'Busca no Set é O(1) e no array (`includes`) é O(n)',
        'Deu um exemplo concreto de uso',
      ],
    },
    {
      kind: 'essay',
      id: 'p2-essay-two-sum',
      topic: 'leetcode:arrays-hashing',
      prompt: 'Entrevistador: **"Como você resolveria o Two Sum (achar os índices de dois números que somam `target`)? Comece pela força bruta e depois otimize, dizendo a complexidade."**',
      model: `
**Força bruta:** dois loops testando todos os pares \`(i, j)\` com \`j > i\`; quando \`nums[i] + nums[j] === target\`, retorno \`[i, j]\`. **O(n²)** de tempo e **O(1)** de espaço.

**Otimizada:** percorro o array uma vez guardando num **Map** "valor → índice". Para cada número, calculo o **complemento** (\`target - nums[i]\`) e pergunto ao Map se já vi esse complemento. Se sim, achei o par; se não, guardo o número atual. **O(n)** de tempo e **O(n)** de espaço: troco memória por velocidade.

Detalhe importante: consultar **antes** de inserir evita usar o mesmo elemento duas vezes (ex.: \`[3]\` com target 6).
`,
      checklist: [
        'Apresentou a força bruta com dois loops e disse O(n²)',
        'Usou hash map com o complemento (`target - x`)',
        'Disse O(n) de tempo e O(n) de espaço na solução otimizada',
        'Comentou a troca de memória por tempo ou o cuidado de não reutilizar o mesmo elemento',
      ],
    },
  ],
}
