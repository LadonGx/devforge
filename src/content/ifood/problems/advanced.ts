import { starter } from '../../js/helpers'
import type { IfoodProblemEntry } from './index'

// Obs.: os geradores de `perf` precisam ser autocontidos (são enviados como texto ao worker).

const TREE_DOC_JS = `/**
 * TreeNode já está disponível (não precisa declarar):
 * class TreeNode { constructor(val = 0, left = null, right = null) { ... } }
 *
 * @param {TreeNode | null} root
 * @return {number}
 */`

/** Problemas 7 a 12: guloso, busca binária, DP, pilha/fila, BFS e DFS. */
export const ADVANCED_PROBLEMS: IfoodProblemEntry[] = [
  /* ------------------------------ 7. Guloso: mochilas de entrega ------------------------------ */
  {
    topic: 'Guloso',
    problem: {
      id: 'ifood-delivery-bags',
      title: 'Mochilas de entrega',
      difficulty: 'Médio',
      pattern: 'problemas-hackerrank',
      related: ['leetcode:two-pointers'],
      fnName: 'minBags',
      params: ['weights', 'limit'],
      description: `
Os entregadores usam mochilas térmicas. Cada mochila leva **no máximo 2 pedidos** e suporta um peso total de no máximo \`limit\` gramas. Todo pedido, sozinho, cabe numa mochila (\`weights[i] ≤ limit\`).

Qual é o **menor número de mochilas** necessário para levar todos os pedidos?
`,
      format: {
        input: '`weights`: array de inteiros; `weights[i]` é o peso (em gramas) do pedido `i`.\n`limit`: inteiro, o peso máximo de uma mochila.',
        output: 'Um inteiro: a quantidade mínima de mochilas.',
      },
      examples: [
        {
          input: 'weights = [3, 2, 2, 1]\nlimit = 3',
          output: '3',
          explanation: 'Mochilas: (1 + 2), (2) e (3). Ninguém mais cabe junto com o pedido de peso 3.',
        },
        { input: 'weights = [3, 5, 3, 4]\nlimit = 5', output: '4', explanation: 'Nenhum par soma 5 ou menos, então cada pedido vai sozinho.' },
      ],
      constraints: ['1 ≤ weights.length ≤ 10^5', '1 ≤ weights[i] ≤ limit ≤ 3 · 10^4'],
      starter: starter(
        'function minBags(weights, limit)',
        'function minBags(weights: number[], limit: number): number',
        `/**
 * @param {number[]} weights
 * @param {number} limit
 * @return {number}
 */`,
      ),
      tests: [
        { input: [[3, 2, 2, 1], 3], expected: 3, label: 'Exemplo 1' },
        { input: [[3, 5, 3, 4], 5], expected: 4, label: 'Exemplo 2: ninguém faz par' },
        { input: [[7], 7], expected: 1, label: 'Um pedido só', hidden: true },
        { input: [[1, 1, 1, 1], 10], expected: 2, label: 'Todos leves', hidden: true },
        { input: [[5, 5, 5], 5], expected: 3, label: 'Todos no limite', hidden: true },
        { input: [[1, 9, 1, 9], 10], expected: 2, label: 'Pares exatos', hidden: true },
        { input: [[10, 1, 1, 1, 1], 10], expected: 3, label: 'Um pesado e vários leves', hidden: true },
        { input: [Array.from({ length: 99999 }, () => 1), 2], expected: 50000, label: 'Caso grande: quantidade ímpar', hidden: true },
        { input: [Array.from({ length: 100000 }, (_, i) => (i % 2 === 0 ? 1 : 9)), 10], expected: 50000, label: 'Caso grande: pares 1 + 9', hidden: true },
      ],
      hints: [
        'Pense no pedido mais pesado: ele vai para alguma mochila. Com quem faz mais sentido dividi-la, se for dividir?',
        'Ordene os pesos. O mais pesado só pode ser acompanhado por alguém leve. Se nem o mais leve cabe com ele, ele vai sozinho.',
        'Dois ponteiros: `light` no começo e `heavy` no fim. A cada mochila, o `heavy` sai; o `light` sai junto se `sorted[light] + sorted[heavy] <= limit`.',
      ],
      explanation: {
        intuition: `
A escolha local: **o pedido mais pesado que ainda falta** precisa de uma mochila de qualquer forma. A melhor companhia possível para ele é o **mais leve**.

Por que isso nunca atrapalha? Se o mais leve não cabe com o mais pesado, nenhum outro cabe (todos são mais pesados que o leve), então o pesado vai sozinho. Se cabe, usar o mais leve ali é tão bom quanto qualquer outro: qualquer par que o resto pudesse formar com ele também funciona com ele de fora. É uma troca que nunca piora a resposta, e é isso que torna a escolha gulosa correta.
`,
        steps: [
          'Ordene uma cópia dos pesos em ordem crescente.',
          'Comece com `light = 0`, `heavy = último` e `bags = 0`.',
          'Enquanto `light <= heavy`: se `light < heavy` e `sorted[light] + sorted[heavy] <= limit`, avance `light`.',
          'Sempre retire o pesado (`heavy--`) e conte uma mochila (`bags++`).',
        ],
        time: 'O(n log n)',
        space: 'O(n)',
        complexityWhy:
          'A ordenação é O(n log n) e os dois ponteiros fazem uma passada O(n). Para n = 10^5, são ~1,7 milhão de comparações. Procurar um parceiro para cada pedido na lista toda seria O(n²).',
        pitfalls: [
          'Emparelhar o mais pesado com qualquer pedido que caiba: pode desperdiçar um pedido leve que serviria para outro pesado.',
          'Esquecer `light < heavy` ao somar: quando os ponteiros se encontram, o mesmo pedido seria contado duas vezes.',
          'Ordenar sem comparador numérico (`sort()` sem `(a, b) => a - b`): compara como texto.',
        ],
      },
      bruteForce: {
        idea: 'Para cada pedido ainda sem mochila, procurar na lista o maior parceiro que caiba junto e formar o par.',
        complexity: 'O(n²) tempo, O(n) espaço',
      },
      solution: {
        js: `function minBags(weights, limit) {
  const sorted = [...weights].sort((a, b) => a - b);
  let light = 0;
  let heavy = sorted.length - 1;
  let bags = 0;
  while (light <= heavy) {
    if (light < heavy && sorted[light] + sorted[heavy] <= limit) {
      light++;
    }
    heavy--;
    bags++;
  }
  return bags;
}
`,
        ts: `function minBags(weights: number[], limit: number): number {
  const sorted = [...weights].sort((a, b) => a - b);
  let light = 0;
  let heavy = sorted.length - 1;
  let bags = 0;
  while (light <= heavy) {
    if (light < heavy && sorted[light] + sorted[heavy] <= limit) {
      light++;
    }
    heavy--;
    bags++;
  }
  return bags;
}
`,
      },
      perf: {
        gen: (n: number) => [Array.from({ length: n }, (_, i) => (i % 2 === 0 ? 1 : 9)), 10],
        n: 100000,
        limitMs: 2500,
        label: '10^5 pedidos de 1 g e 9 g',
      },
    },
  },

  /* ------------------------------ 8. Busca binária na resposta ------------------------------ */
  {
    topic: 'Busca binária',
    problem: {
      id: 'ifood-min-kitchen-minutes',
      title: 'Tempo mínimo para preparar os pedidos',
      difficulty: 'Médio',
      pattern: 'problemas-hackerrank',
      related: ['leetcode:binary-search'],
      fnName: 'minMinutes',
      params: ['times', 'orders'],
      description: `
Uma dark kitchen tem várias cozinhas trabalhando **ao mesmo tempo**. A cozinha \`i\` prepara um pedido a cada \`times[i]\` minutos, sem parar (no minuto \`times[i]\` termina o primeiro, no \`2 · times[i]\` o segundo, e assim por diante).

Qual é o **menor número de minutos** para que, juntas, as cozinhas terminem pelo menos \`orders\` pedidos?
`,
      format: {
        input: '`times`: array de inteiros positivos; `times[i]` é o tempo (em minutos) que a cozinha `i` leva por pedido.\n`orders`: inteiro, quantidade de pedidos a preparar.',
        output: 'Um inteiro: o menor número de minutos `t` tal que a soma de `⌊t / times[i]⌋` seja ≥ `orders`.',
      },
      examples: [
        {
          input: 'times = [2, 3]\norders = 5',
          output: '6',
          explanation: 'Em 6 minutos: ⌊6/2⌋ + ⌊6/3⌋ = 3 + 2 = 5 pedidos. Em 5 minutos: 2 + 1 = 3, não basta.',
        },
        { input: 'times = [5]\norders = 3', output: '15', explanation: 'Uma cozinha só: 3 pedidos × 5 minutos.' },
      ],
      constraints: ['1 ≤ times.length ≤ 10^5', '1 ≤ times[i] ≤ 10^6', '1 ≤ orders ≤ 10^9'],
      starter: starter(
        'function minMinutes(times, orders)',
        'function minMinutes(times: number[], orders: number): number',
        `/**
 * @param {number[]} times
 * @param {number} orders
 * @return {number}
 */`,
      ),
      tests: [
        { input: [[2, 3], 5], expected: 6, label: 'Exemplo 1' },
        { input: [[5], 3], expected: 15, label: 'Exemplo 2: uma cozinha' },
        { input: [[7], 1], expected: 7, label: 'Um pedido, uma cozinha', hidden: true },
        { input: [[9, 3, 6], 1], expected: 3, label: 'Um pedido: ganha a mais rápida', hidden: true },
        { input: [[4, 4, 4], 12], expected: 16, label: 'Cozinhas iguais', hidden: true },
        { input: [[2, 5], 7], expected: 10, label: 'Cozinhas diferentes', hidden: true },
        { input: [[1000000], 1000000000], expected: 1000000000000000, label: 'Caso grande: resposta 10^15', hidden: true },
        { input: [Array.from({ length: 100000 }, () => 1), 1000000000], expected: 10000, label: 'Caso grande: 10^5 cozinhas rápidas', hidden: true },
        { input: [Array.from({ length: 100000 }, () => 1000000), 1000000000], expected: 10000000000, label: 'Caso grande: 10^5 cozinhas lentas', hidden: true },
      ],
      hints: [
        'A resposta pode chegar a 10^15: testar minuto por minuto é impossível. Mas, dado um tempo `t`, é fácil saber quantos pedidos saem em `t` minutos.',
        'Se `t` minutos bastam, `t + 1` também bastam. Essa regra "não → não → ... → sim → sim" permite busca binária sobre o próprio tempo.',
        'Faça `low = 1` e `high = (menor tempo) * orders` (só a cozinha mais rápida já resolve). Teste `mid`: se `sum(floor(mid / time)) >= orders`, `high = mid`; senão `low = mid + 1`.',
      ],
      explanation: {
        intuition: `
Em vez de procurar *dentro de um array*, procure **na resposta**. Dado um número de minutos \`t\`, contar os pedidos prontos é fácil: some \`⌊t / times[i]⌋\` de todas as cozinhas. E essa contagem só cresce com \`t\`, então a pergunta "\`t\` minutos bastam?" tem respostas \`não, não, ..., sim, sim\`.

Onde muda de "não" para "sim" está a resposta, e a busca binária encontra essa fronteira em poucas dezenas de passos.
`,
        steps: [
          'Calcule o menor tempo `fastest`. Com só essa cozinha, `fastest * orders` minutos sempre bastam: é o limite superior `high`.',
          'Comece com `low = 1`.',
          'Enquanto `low < high`: `mid = floor((low + high) / 2)`. Se `canFinish(mid)`, `high = mid`; senão, `low = mid + 1`.',
          '`canFinish(t)` soma `floor(t / time)` das cozinhas e compara com `orders` (pode parar assim que passar).',
          'Devolva `low`.',
        ],
        time: 'O(n · log(fastest · orders))',
        space: 'O(1)',
        complexityWhy:
          'O intervalo vai até 10^15, então a busca faz cerca de 50 passos, cada um custando O(n) = 10^5: uns 5 · 10^6 operações. Testar cada minuto de 1 a 10^15 é inviável.',
        pitfalls: [
          'Usar `Math.min(...times)` com 10^5 elementos: espalhar um array grande como argumentos pode estourar a pilha. Use um laço.',
          'Usar `high = mid - 1` junto com `while (low < high)`: pode pular a resposta. Quando `canFinish(mid)` é verdadeiro, `mid` ainda pode ser a resposta, então `high = mid`.',
          'Esquecer de usar `Math.floor` ao dividir: cozinhas só contam pedidos completos.',
        ],
      },
      bruteForce: {
        idea: 'Testar t = 1, 2, 3, ... até a soma de pedidos prontos chegar em `orders`.',
        complexity: 'O(n · resposta) tempo: com respostas de até 10^15, inviável',
      },
      solution: {
        js: `function minMinutes(times, orders) {
  let fastest = times[0];
  for (const time of times) {
    if (time < fastest) fastest = time;
  }
  let low = 1;
  let high = fastest * orders;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (canFinish(times, orders, mid)) {
      high = mid;
    } else {
      low = mid + 1;
    }
  }
  return low;
}

function canFinish(times, orders, minutes) {
  let done = 0;
  for (const time of times) {
    done += Math.floor(minutes / time);
    if (done >= orders) return true;
  }
  return false;
}
`,
        ts: `function minMinutes(times: number[], orders: number): number {
  let fastest = times[0];
  for (const time of times) {
    if (time < fastest) fastest = time;
  }
  let low = 1;
  let high = fastest * orders;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (canFinish(times, orders, mid)) {
      high = mid;
    } else {
      low = mid + 1;
    }
  }
  return low;
}

function canFinish(times: number[], orders: number, minutes: number): boolean {
  let done = 0;
  for (const time of times) {
    done += Math.floor(minutes / time);
    if (done >= orders) return true;
  }
  return false;
}
`,
      },
      perf: {
        gen: (n: number) => [Array.from({ length: n }, (_, i) => (i % 1000) + 1), 1000000000],
        n: 100000,
        limitMs: 2500,
        label: '10^5 cozinhas e 10^9 pedidos',
      },
    },
  },

  /* ------------------------------ 9. DP 1-D: troco ------------------------------ */
  {
    topic: 'Programação dinâmica',
    problem: {
      id: 'ifood-min-change',
      title: 'Troco com menos notas',
      difficulty: 'Médio',
      pattern: 'problemas-hackerrank',
      related: ['leetcode:dp-1d'],
      fnName: 'minBills',
      params: ['bills', 'amount'],
      description: `
O entregador precisa devolver o troco de \`amount\` centavos ao cliente usando as cédulas e moedas que carrega, de valores \`bills\`. Ele tem **quantidade ilimitada** de cada valor.

Qual é o **menor número de cédulas/moedas** que soma exatamente \`amount\`? Se for impossível formar o valor, retorne \`-1\`.
`,
      format: {
        input: '`bills`: array de inteiros positivos distintos, os valores disponíveis.\n`amount`: inteiro não negativo, o troco a devolver.',
        output: 'Um inteiro: a menor quantidade de cédulas/moedas que soma `amount`, ou `-1` se não existe combinação.',
      },
      examples: [
        { input: 'bills = [1, 2, 5]\namount = 11', output: '3', explanation: '11 = 5 + 5 + 1: três peças.' },
        { input: 'bills = [2]\namount = 3', output: '-1', explanation: 'Só com peças de 2 nunca se forma um valor ímpar.' },
      ],
      constraints: ['1 ≤ bills.length ≤ 12', '1 ≤ bills[i] ≤ 10^4', '0 ≤ amount ≤ 10^4'],
      starter: starter(
        'function minBills(bills, amount)',
        'function minBills(bills: number[], amount: number): number',
        `/**
 * @param {number[]} bills
 * @param {number} amount
 * @return {number}
 */`,
      ),
      tests: [
        { input: [[1, 2, 5], 11], expected: 3, label: 'Exemplo 1' },
        { input: [[2], 3], expected: -1, label: 'Exemplo 2: impossível' },
        { input: [[1], 0], expected: 0, label: 'Troco zero', hidden: true },
        { input: [[7], 14], expected: 2, label: 'Uma peça só, repetida', hidden: true },
        { input: [[5, 10], 7], expected: -1, label: 'Valor impossível', hidden: true },
        { input: [[1, 3, 4], 6], expected: 2, label: 'Armadilha do guloso: 3 + 3', hidden: true },
        { input: [[1, 5, 12], 15], expected: 3, label: 'Armadilha do guloso: 5 + 5 + 5', hidden: true },
        { input: [[1, 5, 10, 25, 50, 100], 10000], expected: 100, label: 'Caso grande: 10^4 com moedas comuns', hidden: true },
        { input: [[2], 10000], expected: 5000, label: 'Caso grande: só peças de 2', hidden: true },
        { input: [[2], 9999], expected: -1, label: 'Caso grande: impossível', hidden: true },
      ],
      hints: [
        'Pegar sempre a maior peça que cabe (guloso) parece natural, mas falha: com peças [1, 3, 4] e valor 6, ele escolhe 4 + 1 + 1 (3 peças) e o melhor é 3 + 3.',
        'Chame de `dp[a]` o menor número de peças para formar o valor `a`. Para formar `a`, a última peça pode ser qualquer valor `bill`: sobra `a - bill`.',
        '`dp[0] = 0`. Para `a` de 1 até `amount`: `dp[a] = min(dp[a - bill] + 1)` para cada `bill ≤ a`. Comece com `Infinity` e converta para `-1` no fim.',
      ],
      explanation: {
        intuition: `
O valor \`a\` pode ser montado escolhendo uma última peça \`bill\`; o resto, \`a - bill\`, é **o mesmo problema, menor**. Como o menor número de peças de \`a - bill\` já foi calculado quando chegamos em \`a\`, guardamos tudo numa tabela \`dp\` e nunca recalculamos: é a **programação dinâmica 1-D**.

Sem a tabela, a recursão repete os mesmos subproblemas milhões de vezes (cresce de forma exponencial).
`,
        steps: [
          'Crie `dp` com `amount + 1` posições, todas `Infinity`, e `dp[0] = 0`.',
          'Para cada valor `a` de 1 a `amount`, teste cada `bill` com `bill <= a`.',
          'Atualize `dp[a] = min(dp[a], dp[a - bill] + 1)`.',
          'Se `dp[amount]` continuou `Infinity`, devolva `-1`; senão, devolva `dp[amount]`.',
        ],
        time: 'O(amount · bills.length)',
        space: 'O(amount)',
        complexityWhy:
          'São no máximo 10^4 valores × 12 peças = 1,2 · 10^5 passos. A recursão sem memória testaria todas as sequências de peças: exponencial, inviável para amount = 10^4.',
        pitfalls: [
          'Aplicar o guloso (sempre a maior peça): falha em conjuntos como [1, 3, 4].',
          'Inicializar `dp` com 0 em vez de `Infinity`: o `min` nunca atualiza e o resultado fica errado.',
          'Esquecer o caso `amount = 0` (resposta 0) e o `-1` quando é impossível.',
          'Não checar `bill <= a`: o índice `a - bill` ficaria negativo.',
        ],
      },
      bruteForce: {
        idea: 'Recursão: para o valor restante, tentar cada peça e escolher o menor total, sem guardar resultados.',
        complexity: 'Exponencial no tempo (cerca de bills^(amount / menor peça))',
      },
      solution: {
        js: `function minBills(bills, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const bill of bills) {
      if (bill <= a && dp[a - bill] + 1 < dp[a]) {
        dp[a] = dp[a - bill] + 1;
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}
`,
        ts: `function minBills(bills: number[], amount: number): number {
  const dp: number[] = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const bill of bills) {
      if (bill <= a && dp[a - bill] + 1 < dp[a]) {
        dp[a] = dp[a - bill] + 1;
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}
`,
      },
      perf: {
        gen: (n: number) => [[7, 11, 13, 17, 19], n],
        n: 10000,
        limitMs: 1500,
        label: 'troco de 10^4 com 5 valores',
      },
    },
  },

  /* ------------------------------ 10. Pilha: próximo maior ------------------------------ */
  {
    topic: 'Pilha e fila',
    problem: {
      id: 'ifood-wait-for-bigger-order',
      title: 'Espera até um pedido maior',
      difficulty: 'Médio',
      pattern: 'problemas-hackerrank',
      related: ['leetcode:stack'],
      fnName: 'waitUntilBigger',
      params: ['totals'],
      description: `
Um restaurante recebe pedidos em sequência, e \`totals[i]\` é o valor (em reais) do pedido \`i\`. O gerente quer saber, para cada pedido, **quantos pedidos depois** chega o primeiro de valor **estritamente maior**.

Se nenhum pedido posterior for maior, a resposta daquele pedido é \`0\`.
`,
      format: {
        input: '`totals`: array de inteiros positivos, os valores dos pedidos na ordem de chegada. Pode ser vazio.',
        output: 'Um array do mesmo tamanho: em `i`, a distância até o próximo pedido de valor estritamente maior, ou `0` se não existir.',
      },
      examples: [
        { input: 'totals = [30, 40, 50, 60]', output: '[1, 1, 1, 0]', explanation: 'Cada pedido é seguido logo por um maior. O último não tem sucessor.' },
        {
          input: 'totals = [73, 74, 75, 71, 69, 72, 76, 73]',
          output: '[1, 1, 4, 2, 1, 1, 0, 0]',
          explanation: 'Para o 75 (posição 2), o próximo maior é o 76 (posição 6): 4 pedidos depois.',
        },
      ],
      constraints: ['0 ≤ totals.length ≤ 10^5', '1 ≤ totals[i] ≤ 10^6'],
      starter: starter(
        'function waitUntilBigger(totals)',
        'function waitUntilBigger(totals: number[]): number[]',
        `/**
 * @param {number[]} totals
 * @return {number[]}
 */`,
      ),
      tests: [
        { input: [[30, 40, 50, 60]], expected: [1, 1, 1, 0], label: 'Exemplo 1' },
        { input: [[73, 74, 75, 71, 69, 72, 76, 73]], expected: [1, 1, 4, 2, 1, 1, 0, 0], label: 'Exemplo 2' },
        { input: [[]], expected: [], label: 'Sem pedidos', hidden: true },
        { input: [[5]], expected: [0], label: 'Um pedido só', hidden: true },
        { input: [[5, 5, 5]], expected: [0, 0, 0], label: 'Valores iguais não contam como maiores', hidden: true },
        { input: [[9, 7, 5, 3]], expected: [0, 0, 0, 0], label: 'Em ordem decrescente', hidden: true },
        { input: [[3, 1, 2, 4]], expected: [3, 1, 1, 0], label: 'Maior só no fim', hidden: true },
        {
          input: [Array.from({ length: 100000 }, (_, i) => 100000 - i)],
          expected: Array.from({ length: 100000 }, () => 0),
          label: 'Caso grande: decrescente, todos 0',
          hidden: true,
        },
        {
          input: [Array.from({ length: 100000 }, (_, i) => i + 1)],
          expected: Array.from({ length: 100000 }, (_, i) => (i === 99999 ? 0 : 1)),
          label: 'Caso grande: crescente',
          hidden: true,
        },
      ],
      hints: [
        'Para cada pedido, olhar todos os seguintes até achar um maior é O(n²) quando a lista está em ordem decrescente. Dá para aproveitar o que já foi visto?',
        'Percorra da esquerda para a direita guardando numa pilha os índices dos pedidos que ainda **esperam** um maior.',
        'Ao ver `totals[i]`, enquanto o pedido do topo da pilha for menor que ele, tire-o: sua resposta é `i - índiceDele`. Depois empilhe `i`.',
      ],
      explanation: {
        intuition: `
Imagine uma fila de pessoas procurando alguém mais alto à frente. Quem chega e é mais alto "resolve" todas as pessoas anteriores que eram mais baixas e ainda esperavam.

A pilha guarda os pedidos **ainda sem resposta**, e os valores deles ficam em ordem não crescente da base para o topo: o topo é sempre o menor. Quando chega um valor maior, ele resolve o topo, depois o próximo, até encontrar um que não é menor. Esse é o padrão da **pilha monotônica**.
`,
        steps: [
          'Crie `result` cheio de 0 e uma pilha vazia `stack` de índices.',
          'Para cada `i`, enquanto a pilha não estiver vazia e `totals[topo] < totals[i]`: tire `j` do topo e faça `result[j] = i - j`.',
          'Empilhe `i`.',
          'Quem sobrar na pilha no fim não tem pedido maior depois, e já está com 0.',
        ],
        time: 'O(n)',
        space: 'O(n)',
        complexityWhy:
          'Cada índice entra na pilha uma vez e sai no máximo uma vez, então o total de operações é no máximo 2n (o laço interno não multiplica). Em ordem decrescente a força bruta faria 5 · 10^9 comparações.',
        pitfalls: [
          'Procurar o próximo maior com dois laços: O(n²) e *Time Limit Exceeded* em listas decrescentes.',
          'Usar `<=` ao comparar: valores iguais passariam a contar como "maiores", mas o enunciado pede estritamente maior.',
          'Guardar os valores na pilha em vez dos índices: sem o índice não dá para calcular a distância.',
        ],
      },
      bruteForce: {
        idea: 'Para cada pedido, avançar pelos seguintes até achar um valor maior, contando os passos.',
        complexity: 'O(n²) tempo, O(1) espaço extra',
      },
      solution: {
        js: `function waitUntilBigger(totals) {
  const result = new Array(totals.length).fill(0);
  const stack = [];
  for (let i = 0; i < totals.length; i++) {
    while (stack.length > 0 && totals[stack[stack.length - 1]] < totals[i]) {
      const j = stack.pop();
      result[j] = i - j;
    }
    stack.push(i);
  }
  return result;
}
`,
        ts: `function waitUntilBigger(totals: number[]): number[] {
  const result: number[] = new Array(totals.length).fill(0);
  const stack: number[] = [];
  for (let i = 0; i < totals.length; i++) {
    while (stack.length > 0 && totals[stack[stack.length - 1]] < totals[i]) {
      const j = stack.pop() as number;
      result[j] = i - j;
    }
    stack.push(i);
  }
  return result;
}
`,
      },
      perf: {
        gen: (n: number) => [Array.from({ length: n }, (_, i) => n - i)],
        n: 100000,
        limitMs: 2500,
        label: '10^5 pedidos em ordem decrescente',
      },
    },
  },

  /* ------------------------------ 11. BFS: menor rota na grade ------------------------------ */
  {
    topic: 'Grafos (BFS)',
    problem: {
      id: 'ifood-shortest-route',
      title: 'Rota mais curta do entregador',
      difficulty: 'Médio',
      pattern: 'problemas-hackerrank',
      related: ['leetcode:graphs'],
      fnName: 'shortestRoute',
      params: ['grid'],
      description: `
O mapa do bairro é uma grade de ruas. O entregador sai do restaurante (\`'S'\`) e vai até a casa do cliente (\`'D'\`). Cada quarteirão é uma célula:

- \`'.'\` é rua livre;
- \`'#'\` é um quarteirão bloqueado (obra, rio, muro).

Ele anda um passo por vez para **cima, baixo, esquerda ou direita** (nada de diagonais), sem sair da grade nem passar por \`'#'\`. Qual é o **menor número de passos** de \`'S'\` até \`'D'\`? Se não houver caminho, retorne \`-1\`.
`,
      format: {
        input: '`grid`: array de strings, todas com o mesmo tamanho. Cada caractere é `S`, `D`, `.` ou `#`. Existe exatamente um `S` e um `D`.',
        output: 'Um inteiro: o menor número de passos de `S` até `D`, ou `-1` se for impossível.',
      },
      examples: [
        {
          input: "grid = [\n  'S.#.',\n  '..#D',\n  '....'\n]",
          output: '6',
          explanation: 'O muro na coluna 2 obriga a descer até a última linha: (0,0) → (1,0)... → (2,1) → (2,2) → (2,3) → (1,3), em 6 passos.',
        },
        { input: "grid = ['S.D']", output: '2' },
      ],
      constraints: ['1 ≤ linhas, colunas ≤ 300', 'Exatamente um `S` e um `D`, em células diferentes'],
      starter: starter(
        'function shortestRoute(grid)',
        'function shortestRoute(grid: string[]): number',
        `/**
 * @param {string[]} grid
 * @return {number}
 */`,
      ),
      tests: [
        { input: [['S.#.', '..#D', '....']], expected: 6, label: 'Exemplo 1' },
        { input: [['S.D']], expected: 2, label: 'Exemplo 2: uma linha' },
        { input: [['SD']], expected: 1, label: 'Lado a lado', hidden: true },
        { input: [['S#D']], expected: -1, label: 'Bloqueado por um muro', hidden: true },
        { input: [['S.', '.D']], expected: 2, label: 'Grade 2x2', hidden: true },
        { input: [['S..', '##.', 'D..']], expected: 6, label: 'Caminho em U', hidden: true },
        { input: [['S.#', '.##', '##D']], expected: -1, label: 'Destino isolado', hidden: true },
        {
          input: [
            Array.from({ length: 300 }, (_, r) =>
              r === 0 ? 'S' + '.'.repeat(299) : r === 299 ? '.'.repeat(299) + 'D' : '.'.repeat(300),
            ),
          ],
          expected: 598,
          label: 'Caso grande: grade 300x300 livre',
          hidden: true,
        },
        {
          input: [
            Array.from({ length: 300 }, (_, r) =>
              r === 0
                ? 'S' + '.'.repeat(149) + '#' + '.'.repeat(149)
                : r === 299
                  ? '.'.repeat(150) + '#' + '.'.repeat(148) + 'D'
                  : '.'.repeat(150) + '#' + '.'.repeat(149),
            ),
          ],
          expected: -1,
          label: 'Caso grande: muro de ponta a ponta',
          hidden: true,
        },
      ],
      hints: [
        'Explorar todos os caminhos possíveis cresce exponencialmente. Você quer o caminho com **menos passos**: que busca explora o mapa em "ondas" de distância 0, 1, 2...?',
        'Use uma BFS com fila a partir de `S`. A primeira vez que você tira `D` da fila, a distância dele já é a menor possível.',
        'Guarde a distância de cada célula (começa em `-1`, o que também serve de "já visitei"). Para cada célula, empilhe os 4 vizinhos válidos que não são `#` e ainda não foram visitados.',
      ],
      explanation: {
        intuition: `
Uma **BFS** (busca em largura) é como uma gota de tinta caindo no mapa: ela se espalha por todas as células a 1 passo, depois a 2 passos, depois a 3... A primeira vez que a tinta toca o cliente, o número de passos é o mínimo.

A fila guarda a "frente da onda". Marcar cada célula como visitada no momento em que entra na fila evita que ela seja processada de novo.
`,
        steps: [
          'Ache a posição de `S` e crie a matriz `dist` com `-1` em todas as células; `dist` de `S` é 0.',
          'Coloque `S` na fila. Enquanto houver células na fila, retire a próxima `(r, c)` (use um índice `head` em vez de `shift`).',
          'Se a célula for `D`, retorne `dist[r][c]`.',
          'Para cada vizinho dentro da grade, que não seja `#` e tenha `dist = -1`, defina `dist = dist[r][c] + 1` e enfileire.',
          'Se a fila esvaziar sem alcançar `D`, retorne `-1`.',
        ],
        time: 'O(linhas · colunas)',
        space: 'O(linhas · colunas)',
        complexityWhy:
          'Cada célula entra na fila no máximo uma vez e olha 4 vizinhos: ~4 · 90.000 = 360.000 passos na grade 300 × 300. Testar todos os caminhos possíveis (DFS sem parar) é exponencial.',
        pitfalls: [
          'Usar DFS para achar o menor caminho: ela acha *um* caminho, não necessariamente o mais curto.',
          'Marcar como visitado só ao **retirar** da fila: a mesma célula entra várias vezes e a busca fica lenta (ou até incorreta).',
          'Usar `queue.shift()` em filas grandes: reindexa o array a cada retirada. Um índice `head` é mais seguro.',
          'Esquecer de checar os limites da grade antes de ler `grid[nr][nc]`.',
        ],
      },
      bruteForce: {
        idea: 'DFS recursiva que testa todos os caminhos sem repetir células na rota atual e guarda o menor comprimento.',
        complexity: 'Exponencial no tempo (número de caminhos simples da grade)',
      },
      solution: {
        js: `function shortestRoute(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const dist = Array.from({ length: rows }, () => new Array(cols).fill(-1));
  const queue = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 'S') {
        dist[r][c] = 0;
        queue.push([r, c]);
      }
    }
  }
  const moves = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let head = 0;
  while (head < queue.length) {
    const [r, c] = queue[head++];
    if (grid[r][c] === 'D') return dist[r][c];
    for (const [dr, dc] of moves) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (grid[nr][nc] === '#' || dist[nr][nc] !== -1) continue;
      dist[nr][nc] = dist[r][c] + 1;
      queue.push([nr, nc]);
    }
  }
  return -1;
}
`,
        ts: `function shortestRoute(grid: string[]): number {
  const rows = grid.length;
  const cols = grid[0].length;
  const dist: number[][] = Array.from({ length: rows }, () => new Array(cols).fill(-1));
  const queue: number[][] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 'S') {
        dist[r][c] = 0;
        queue.push([r, c]);
      }
    }
  }
  const moves = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let head = 0;
  while (head < queue.length) {
    const [r, c] = queue[head++];
    if (grid[r][c] === 'D') return dist[r][c];
    for (const [dr, dc] of moves) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (grid[nr][nc] === '#' || dist[nr][nc] !== -1) continue;
      dist[nr][nc] = dist[r][c] + 1;
      queue.push([nr, nc]);
    }
  }
  return -1;
}
`,
      },
      perf: {
        gen: (n: number) => [
          Array.from({ length: n }, (_, r) => (r === 0 ? 'S' + '.'.repeat(n - 1) : r === n - 1 ? '.'.repeat(n - 1) + 'D' : '.'.repeat(n))),
        ],
        n: 300,
        limitMs: 2500,
        label: 'grade 300 × 300 livre',
      },
    },
  },

  /* ------------------------------ 12. DFS em árvore: rota de maior lucro ------------------------------ */
  {
    topic: 'Árvores (DFS)',
    problem: {
      id: 'ifood-best-route-profit',
      title: 'Rota de maior lucro',
      difficulty: 'Médio',
      pattern: 'problemas-hackerrank',
      related: ['leetcode:trees'],
      fnName: 'bestRouteProfit',
      params: ['root'],
      io: { args: ['tree'] },
      description: `
A malha de entregas de uma região é uma **árvore binária**: a raiz é a central e cada nó é um ponto de entrega que se ramifica em até dois pontos seguintes. O valor de um nó é o **lucro** (ou prejuízo, se negativo) de passar por ele.

O entregador sai da raiz e **desce até uma folha** (um nó sem filhos), somando o valor de todos os nós do caminho. Qual é a **maior soma** possível? Para uma árvore vazia, o resultado é \`0\`.

As árvores dos testes estão em **ordem de nível** (como no LeetCode): \`[10, -2, 7, 8, -4]\` lê a árvore linha por linha, da esquerda para a direita; \`null\` marca um filho que não existe.
`,
      format: {
        input: '`root`: a raiz da árvore binária (ou `null` se vazia). Cada nó tem `val`, `left` e `right`.',
        output: 'Um inteiro: a maior soma entre os caminhos da raiz até uma folha (`0` se a árvore for vazia).',
      },
      examples: [
        {
          input: 'root = [10, -2, 7, 8, -4]',
          output: '17',
          explanation: 'Caminhos até folhas: 10 → -2 → 8 = 16; 10 → -2 → -4 = 4; 10 → 7 = 17. O melhor é 17.',
        },
        {
          input: 'root = [1, -9]',
          output: '-8',
          explanation: 'A raiz tem um único filho e o caminho só termina numa folha: 1 + (-9) = -8. Parar na raiz não vale, pois ela não é folha.',
        },
      ],
      constraints: ['0 ≤ quantidade de nós ≤ 1000', '-1000 ≤ Node.val ≤ 1000'],
      starter: {
        js: `${TREE_DOC_JS}
function bestRouteProfit(root) {

}
`,
        ts: `/*
 * TreeNode já está disponível (não precisa declarar):
 * class TreeNode { val: number; left: TreeNode | null; right: TreeNode | null }
 */
function bestRouteProfit(root: TreeNode | null): number {

}
`,
      },
      tests: [
        { input: [[10, -2, 7, 8, -4]], expected: 17, label: 'Exemplo 1' },
        { input: [[1, -9]], expected: -8, label: 'Exemplo 2: filho único negativo' },
        { input: [[]], expected: 0, label: 'Árvore vazia', hidden: true },
        { input: [[-3]], expected: -3, label: 'Um nó só (negativo)', hidden: true },
        { input: [[-1, -2, -3]], expected: -3, label: 'Tudo negativo: -1 + -2', hidden: true },
        { input: [[5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1]], expected: 27, label: 'Árvore média', hidden: true },
        { input: [[1, 2, null, 3, null, 4]], expected: 10, label: 'Caminho só pela esquerda', hidden: true },
        {
          input: [[1, ...Array.from({ length: 999 }, (_, i) => [null, i + 2]).flat()]],
          expected: 500500,
          label: 'Caso grande: cadeia de 1000 nós pela direita',
          hidden: true,
        },
      ],
      hints: [
        'Um caminho da raiz até a folha é a raiz mais o melhor caminho de algum dos dois filhos. Isso lembra uma recursão.',
        'Caso base: se o nó é uma folha (sem filhos), o melhor caminho é o próprio valor. Atenção: se só um filho existe, o caminho é obrigado a continuar por ele.',
        'Calcule o melhor entre os filhos que existem (`Math.max` só dos filhos presentes) e some o valor do nó. Árvore vazia devolve 0.',
      ],
      explanation: {
        intuition: `
Cada filho é a raiz de uma árvore menor, e o enunciado se repete nela: *o melhor caminho até uma folha*. Então:

> melhor(nó) = valor do nó + o maior entre melhor(esquerda) e melhor(direita)

Só que o caminho **precisa terminar numa folha**. Por isso, um nó com um único filho não pode "parar ali": ele tem que seguir pelo filho que existe, mesmo que seja negativo. Essa é a diferença para o "melhor caminho qualquer".

Abra o visualizador e veja a árvore de chamadas: cada nó vira uma chamada, e os valores sobem das folhas até a raiz.
`,
        steps: [
          'Caso base 1: se `root` é `null`, retorne `0`.',
          'Caso base 2: se o nó não tem filhos (folha), retorne `root.val`.',
          'Comece com `best = -Infinity`; se há filho esquerdo, `best = max(best, bestRouteProfit(left))`; o mesmo para o direito.',
          'Retorne `root.val + best`.',
        ],
        time: 'O(n)',
        space: 'O(h)',
        complexityWhy:
          'Visitamos cada nó uma vez. A pilha de recursão tem a altura h da árvore: até 1000 no pior caso (cadeia), que a pilha do JS comporta, e O(log n) em árvores equilibradas.',
        pitfalls: [
          'Tratar um filho ausente como valor 0: com nós negativos, o caminho "pararia" num nó que não é folha e daria uma soma maior que a real (no exemplo `[1, -9]`, daria 1 em vez de -8).',
          'Chamar a recursão com `null` e usar `Math.max(esquerda, direita)` com 0 para o ausente: mesmo erro.',
          'Esquecer o caso da folha: sem ele, `-Infinity` vazaria para a soma.',
        ],
      },
      bruteForce: {
        idea: 'Montar a lista de todos os caminhos da raiz até as folhas (DFS guardando o caminho) e somar cada um no final.',
        complexity: 'O(n · h) tempo e espaço, copiando os caminhos',
      },
      solution: {
        js: `function bestRouteProfit(root) {
  if (!root) return 0;
  if (!root.left && !root.right) return root.val;
  let best = -Infinity;
  if (root.left) best = Math.max(best, bestRouteProfit(root.left));
  if (root.right) best = Math.max(best, bestRouteProfit(root.right));
  return root.val + best;
}
`,
        ts: `function bestRouteProfit(root: TreeNode | null): number {
  if (!root) return 0;
  if (!root.left && !root.right) return root.val;
  let best = -Infinity;
  if (root.left) best = Math.max(best, bestRouteProfit(root.left));
  if (root.right) best = Math.max(best, bestRouteProfit(root.right));
  return root.val + best;
}
`,
      },
    },
  },
]
