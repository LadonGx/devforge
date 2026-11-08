import { starter } from '../../js/helpers'
import type { IfoodProblemEntry } from './index'

// Obs.: os geradores de `perf` precisam ser autocontidos (são enviados como texto ao worker).

/** Problemas 1 a 6: arrays, hash map, ordenação e strings. */
export const BASIC_PROBLEMS: IfoodProblemEntry[] = [
  /* ------------------------------ 1. Arrays: soma de prefixos ------------------------------ */
  {
    topic: 'Arrays',
    problem: {
      id: 'ifood-revenue-ranges',
      title: 'Faturamento por período',
      difficulty: 'Fácil',
      pattern: 'problemas-hackerrank',
      related: ['leetcode:arrays-hashing'],
      fnName: 'rangeRevenue',
      params: ['sales', 'queries'],
      description: `
Uma rede de restaurantes guarda em \`sales\` o faturamento (em reais) de cada dia do ano. O financeiro faz muitas consultas do tipo: **"quanto faturamos do dia \`l\` ao dia \`r\`, inclusive?"**.

Responda a todas as consultas, na mesma ordem em que foram feitas.
`,
      format: {
        input:
          '`sales`: array de inteiros; `sales[i]` é o faturamento do dia `i` (o dia 0 é o primeiro).\n`queries`: array de pares `[l, r]`, cada um com os índices (inclusivos) do primeiro e do último dia da consulta.',
        output: 'Um array com um inteiro por consulta: a soma de `sales[l] + ... + sales[r]`, na ordem das consultas.',
      },
      examples: [
        {
          input: 'sales = [120, 80, 150, 200, 90]\nqueries = [[0, 2], [1, 3], [4, 4]]',
          output: '[350, 430, 90]',
          explanation: 'Dias 0 a 2: 120 + 80 + 150 = 350. Dias 1 a 3: 80 + 150 + 200 = 430. Dia 4 sozinho: 90.',
        },
      ],
      constraints: ['1 ≤ sales.length ≤ 10^5', '0 ≤ sales[i] ≤ 10^4', '1 ≤ queries.length ≤ 10^5', '0 ≤ l ≤ r < sales.length'],
      starter: starter(
        'function rangeRevenue(sales, queries)',
        'function rangeRevenue(sales: number[], queries: number[][]): number[]',
        `/**
 * @param {number[]} sales
 * @param {number[][]} queries
 * @return {number[]}
 */`,
      ),
      tests: [
        { input: [[120, 80, 150, 200, 90], [[0, 2], [1, 3], [4, 4]]], expected: [350, 430, 90], label: 'Exemplo 1' },
        { input: [[5, 5, 5, 5], [[0, 3], [2, 3]]], expected: [20, 10], label: 'Valores repetidos' },
        { input: [[7], [[0, 0]]], expected: [7], label: 'Um dia só', hidden: true },
        { input: [[0, 0, 0], [[0, 2], [1, 1]]], expected: [0, 0], label: 'Dias sem faturamento (zeros)', hidden: true },
        { input: [[10, 20, 30], [[0, 0], [2, 2], [0, 2]]], expected: [10, 30, 60], label: 'Primeiro dia, último dia e tudo', hidden: true },
        { input: [[3, 1, 4, 1, 5], [[0, 4], [0, 4], [2, 2]]], expected: [14, 14, 4], label: 'Consultas repetidas', hidden: true },
        {
          input: [Array.from({ length: 100000 }, (_, i) => i % 10), [[0, 99999], [5, 14], [3, 3]]],
          expected: [450000, 45, 3],
          label: 'Caso grande: 10^5 dias',
          hidden: true,
        },
      ],
      hints: [
        'Se cada consulta somar os dias um a um, com 10^5 consultas em 10^5 dias são 10^10 somas. Dá para preparar algo antes de responder?',
        'Monte um array `prefix` em que `prefix[i]` é a soma dos `i` primeiros dias. Como a soma de `l` a `r` se relaciona com dois valores de `prefix`?',
        'Soma de `l` a `r` = `prefix[r + 1] - prefix[l]`. Com `prefix[0] = 0`, o dia 0 também funciona.',
      ],
      explanation: {
        intuition: `
Somar o mesmo trecho várias vezes é trabalho repetido. A **soma de prefixos** paga o custo uma vez: depois de montar \`prefix\` (a soma acumulada até cada dia), qualquer intervalo vira uma subtração de dois números.

Pense no odômetro de um carro: para saber quantos km rodou entre dois pontos, você não refaz o trajeto, só subtrai as duas leituras.
`,
        steps: [
          'Crie `prefix = [0]`.',
          'Para cada valor de `sales`, acrescente `último prefixo + valor`. Assim `prefix[i]` é a soma dos `i` primeiros dias.',
          'Para cada consulta `[l, r]`, calcule `prefix[r + 1] - prefix[l]` e guarde na resposta.',
          'Devolva a lista de respostas.',
        ],
        time: 'O(n + q)',
        space: 'O(n)',
        complexityWhy:
          'Montar o prefixo custa O(n) e cada consulta O(1). Com n e q até 10^5, são uns 2 · 10^5 passos. Somar cada intervalo na mão seria O(n · q) = 10^10, que não cabe no tempo.',
        pitfalls: [
          'Somar o intervalo com um laço dentro do laço das consultas: passa nos exemplos e dá *Time Limit Exceeded* nos testes grandes.',
          'Erro de um (*off-by-one*): como `prefix` tem uma posição a mais, o fim é `prefix[r + 1]`, não `prefix[r]`.',
          'Esquecer o `0` inicial do prefixo: a consulta que começa no dia 0 ficaria sem `prefix[0]`.',
        ],
      },
      bruteForce: {
        idea: 'Para cada consulta, percorrer os dias de l a r somando um a um.',
        complexity: 'O(n · q) tempo, O(1) espaço extra',
      },
      solution: {
        js: `function rangeRevenue(sales, queries) {
  const prefix = [0];
  for (const value of sales) {
    prefix.push(prefix[prefix.length - 1] + value);
  }
  const answers = [];
  for (const [l, r] of queries) {
    answers.push(prefix[r + 1] - prefix[l]);
  }
  return answers;
}
`,
        ts: `function rangeRevenue(sales: number[], queries: number[][]): number[] {
  const prefix: number[] = [0];
  for (const value of sales) {
    prefix.push(prefix[prefix.length - 1] + value);
  }
  const answers: number[] = [];
  for (const [l, r] of queries) {
    answers.push(prefix[r + 1] - prefix[l]);
  }
  return answers;
}
`,
      },
      perf: {
        gen: (n: number) => [
          Array.from({ length: n }, (_, i) => i % 100),
          Array.from({ length: n }, (_, i) => [i % 10, n - 1 - (i % 10)]),
        ],
        n: 100000,
        limitMs: 2500,
        label: '10^5 dias e 10^5 consultas',
      },
    },
  },

  /* ------------------------------ 2. Arrays: janela deslizante ------------------------------ */
  {
    topic: 'Arrays',
    problem: {
      id: 'ifood-longest-prep-window',
      title: 'Maior sequência dentro do tempo',
      difficulty: 'Médio',
      pattern: 'problemas-hackerrank',
      related: ['leetcode:sliding-window'],
      fnName: 'longestWithinBudget',
      params: ['prepTimes', 'budget'],
      description: `
Uma cozinha recebe pedidos em fila. O pedido \`i\` leva \`prepTimes[i]\` minutos para ficar pronto. No horário de pico, a cozinha consegue trabalhar **no máximo \`budget\` minutos seguidos**.

Qual é o maior número de pedidos **consecutivos da fila** que cabem nesse tempo? Ou seja, o tamanho do maior trecho contínuo de \`prepTimes\` cuja soma é no máximo \`budget\`. Se nem um único pedido cabe, a resposta é \`0\`.
`,
      format: {
        input:
          '`prepTimes`: array de inteiros positivos; `prepTimes[i]` é o tempo (em minutos) do pedido `i`.\n`budget`: inteiro, o tempo máximo disponível em minutos.',
        output: 'Um inteiro: o tamanho do maior trecho contínuo de `prepTimes` com soma ≤ `budget` (ou `0`).',
      },
      examples: [
        {
          input: 'prepTimes = [3, 1, 2, 7, 4, 2, 1, 1, 5]\nbudget = 8',
          output: '4',
          explanation: 'O trecho [4, 2, 1, 1] soma 8 e tem 4 pedidos. Nenhum trecho de 5 pedidos soma 8 ou menos.',
        },
        { input: 'prepTimes = [4, 4, 4]\nbudget = 7', output: '1', explanation: 'Dois pedidos já somam 8, mais que 7. Só cabe um.' },
      ],
      constraints: ['1 ≤ prepTimes.length ≤ 10^5', '1 ≤ prepTimes[i] ≤ 10^4', '1 ≤ budget ≤ 10^9'],
      starter: starter(
        'function longestWithinBudget(prepTimes, budget)',
        'function longestWithinBudget(prepTimes: number[], budget: number): number',
        `/**
 * @param {number[]} prepTimes
 * @param {number} budget
 * @return {number}
 */`,
      ),
      tests: [
        { input: [[3, 1, 2, 7, 4, 2, 1, 1, 5], 8], expected: 4, label: 'Exemplo 1' },
        { input: [[4, 4, 4], 7], expected: 1, label: 'Exemplo 2' },
        { input: [[5], 5], expected: 1, label: 'Um pedido que cabe justo', hidden: true },
        { input: [[10, 20], 5], expected: 0, label: 'Nenhum pedido cabe', hidden: true },
        { input: [[1, 1, 1, 1], 100], expected: 4, label: 'Tudo cabe', hidden: true },
        { input: [[2, 3, 5], 10], expected: 3, label: 'Soma igual ao orçamento', hidden: true },
        { input: [[9, 1, 1, 1, 9], 3], expected: 3, label: 'Pedidos grandes nas pontas', hidden: true },
        { input: [Array.from({ length: 100000 }, () => 1), 50000], expected: 50000, label: 'Caso grande: 10^5 pedidos de 1 minuto', hidden: true },
        { input: [Array.from({ length: 100000 }, () => 10000), 1000000000], expected: 100000, label: 'Caso grande: soma exatamente 10^9', hidden: true },
      ],
      hints: [
        'Testar todos os trechos possíveis (começo e fim) é O(n²). Como a soma só cresce quando o trecho aumenta (os tempos são positivos), dá para evitar refazer contas.',
        'Mantenha um trecho `[left, right]` e a soma dele. Avance `right` sempre; quando a soma passar de `budget`, o que fazer com `left`?',
        'Enquanto `sum > budget`, subtraia `prepTimes[left]` e avance `left`. Depois atualize a melhor resposta com `right - left + 1`.',
      ],
      explanation: {
        intuition: `
É uma **janela deslizante**. Como todo tempo é positivo, aumentar o trecho só aumenta a soma e diminuir só reduz. Então, quando a janela estoura o orçamento, não precisa recomeçar: basta **encolher pela esquerda** até caber de novo.

Cada pedido entra na janela uma vez (pela direita) e sai no máximo uma vez (pela esquerda).
`,
        steps: [
          'Comece com `left = 0`, `sum = 0` e `best = 0`.',
          'Para cada `right`, some `prepTimes[right]` em `sum`.',
          'Enquanto `sum > budget`, subtraia `prepTimes[left]` e avance `left`.',
          'Atualize `best` com `right - left + 1` e continue.',
        ],
        time: 'O(n)',
        space: 'O(1)',
        complexityWhy:
          'Os dois ponteiros só andam para a frente, então o total de movimentos é no máximo 2n. Com n = 10^5, o testador exige algo como O(n) ou O(n log n): testar todos os trechos (O(n²)) daria 5 · 10^9 contas.',
        pitfalls: [
          'Reiniciar a soma do zero a cada começo de trecho: vira O(n²) e estoura o tempo.',
          'Usar `if` no lugar de `while` para encolher: um pedido novo e grande pode exigir tirar vários pedidos da esquerda.',
          'Esquecer o caso em que nenhum pedido cabe: a janela fica vazia (`left = right + 1`) e o tamanho é 0, o que o cálculo `right - left + 1` já devolve.',
        ],
      },
      bruteForce: {
        idea: 'Para cada começo possível, estender o fim somando até passar do orçamento e guardar o maior tamanho.',
        complexity: 'O(n²) tempo, O(1) espaço',
      },
      solution: {
        js: `function longestWithinBudget(prepTimes, budget) {
  let left = 0;
  let sum = 0;
  let best = 0;
  for (let right = 0; right < prepTimes.length; right++) {
    sum += prepTimes[right];
    while (sum > budget) {
      sum -= prepTimes[left];
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}
`,
        ts: `function longestWithinBudget(prepTimes: number[], budget: number): number {
  let left = 0;
  let sum = 0;
  let best = 0;
  for (let right = 0; right < prepTimes.length; right++) {
    sum += prepTimes[right];
    while (sum > budget) {
      sum -= prepTimes[left];
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}
`,
      },
      perf: {
        gen: (n: number) => [Array.from({ length: n }, (_, i) => (i % 7) + 1), 1000000000],
        n: 100000,
        limitMs: 2500,
        label: '10^5 pedidos, tudo cabe no orçamento',
      },
    },
  },

  /* ------------------------------ 3. Hash map: frequência ------------------------------ */
  {
    topic: 'Hash map',
    problem: {
      id: 'ifood-top-dish',
      title: 'Prato mais pedido',
      difficulty: 'Fácil',
      pattern: 'problemas-hackerrank',
      related: ['leetcode:arrays-hashing'],
      fnName: 'topDish',
      params: ['orders'],
      description: `
O app registrou os pratos pedidos em um restaurante ao longo do dia, um nome por pedido. Descubra qual foi o **prato mais pedido**.

Se mais de um prato empatar com a maior quantidade, devolva o que vem **primeiro em ordem alfabética** (a comparação usual de strings, como \`a < b\` em JavaScript).
`,
      format: {
        input: '`orders`: array de strings; cada elemento é o nome de um prato pedido.',
        output: 'Uma string: o nome do prato mais pedido (no empate, o menor em ordem alfabética).',
      },
      examples: [
        {
          input: "orders = ['pizza', 'sushi', 'pizza', 'temaki', 'sushi', 'pizza']",
          output: "'pizza'",
          explanation: 'Pizza apareceu 3 vezes, sushi 2 e temaki 1.',
        },
        {
          input: "orders = ['sushi', 'pizza', 'sushi', 'pizza']",
          output: "'pizza'",
          explanation: 'Pizza e sushi empatam com 2 pedidos. "pizza" vem antes de "sushi" no alfabeto.',
        },
      ],
      constraints: ['1 ≤ orders.length ≤ 10^5', 'Cada nome tem de 1 a 20 caracteres: letras minúsculas e dígitos'],
      starter: starter(
        'function topDish(orders)',
        'function topDish(orders: string[]): string',
        `/**
 * @param {string[]} orders
 * @return {string}
 */`,
      ),
      tests: [
        { input: [['pizza', 'sushi', 'pizza', 'temaki', 'sushi', 'pizza']], expected: 'pizza', label: 'Exemplo 1' },
        { input: [['sushi', 'pizza', 'sushi', 'pizza']], expected: 'pizza', label: 'Exemplo 2: empate' },
        { input: [['x']], expected: 'x', label: 'Um pedido só', hidden: true },
        { input: [['burger', 'burger', 'burger']], expected: 'burger', label: 'Todos iguais', hidden: true },
        { input: [['c', 'b', 'a']], expected: 'a', label: 'Três empatados', hidden: true },
        { input: [['p10', 'p9', 'p10', 'p9']], expected: 'p10', label: 'Empate com dígitos', hidden: true },
        {
          input: [Array.from({ length: 100000 }, (_, i) => 'p' + (i % 100))],
          expected: 'p0',
          label: 'Caso grande: 100 pratos empatados',
          hidden: true,
        },
        {
          input: [Array.from({ length: 100000 }, (_, i) => (i % 5 < 3 ? 'zebra' : 'a' + i))],
          expected: 'zebra',
          label: 'Caso grande: um prato domina',
          hidden: true,
        },
      ],
      hints: [
        'Você precisa saber, para cada prato, quantas vezes ele apareceu. Que estrutura associa um nome a um número?',
        'Percorra `orders` uma vez com um `Map`: `counts.set(dish, (counts.get(dish) || 0) + 1)`.',
        'Depois escolha o prato com a maior contagem. No empate (`count === bestCount`), fique com o menor nome (`dish < bestDish`).',
      ],
      explanation: {
        intuition: `
É o clássico **contador de frequência**: um \`Map\` de "prato → quantas vezes". Cada pedido atualiza uma entrada em O(1), então uma passada resolve. Na segunda passada (sobre os pratos distintos), escolhemos o campeão e resolvemos o empate pelo nome.
`,
        steps: [
          'Crie um `Map` vazio `counts`.',
          'Para cada prato em `orders`, some 1 na contagem dele.',
          'Percorra o `Map` guardando o melhor prato e a melhor contagem.',
          'Troque o melhor se a contagem for maior, ou se for igual e o nome vier antes na ordem alfabética.',
        ],
        time: 'O(n)',
        space: 'O(k), com k pratos distintos',
        complexityWhy:
          'Cada pedido custa O(1) no Map, e a segunda passada percorre no máximo n pratos distintos. Para n = 10^5 isso é imediato; contar com um `filter` para cada prato (O(n · k)) pode chegar a 10^10.',
        pitfalls: [
          'Contar com `orders.filter(x => x === dish).length` dentro de um laço: O(n²) no pior caso.',
          'Esquecer o desempate alfabético: o resultado muda conforme a ordem de chegada dos pedidos.',
          'Comparar nomes com `-` ou ordenar números como texto: use `<` entre strings. Em texto, `"p10" < "p9"` é verdadeiro.',
        ],
      },
      bruteForce: {
        idea: 'Para cada pedido, contar quantas vezes o mesmo prato aparece na lista inteira e guardar o maior.',
        complexity: 'O(n²) tempo, O(1) espaço',
      },
      solution: {
        js: `function topDish(orders) {
  const counts = new Map();
  for (const dish of orders) {
    counts.set(dish, (counts.get(dish) || 0) + 1);
  }
  let bestDish = '';
  let bestCount = 0;
  for (const [dish, count] of counts) {
    if (count > bestCount || (count === bestCount && dish < bestDish)) {
      bestDish = dish;
      bestCount = count;
    }
  }
  return bestDish;
}
`,
        ts: `function topDish(orders: string[]): string {
  const counts = new Map<string, number>();
  for (const dish of orders) {
    counts.set(dish, (counts.get(dish) || 0) + 1);
  }
  let bestDish = '';
  let bestCount = 0;
  for (const [dish, count] of counts) {
    if (count > bestCount || (count === bestCount && dish < bestDish)) {
      bestDish = dish;
      bestCount = count;
    }
  }
  return bestDish;
}
`,
      },
      perf: {
        gen: (n: number) => [Array.from({ length: n }, (_, i) => 'prato' + (i % 5000))],
        n: 100000,
        limitMs: 2500,
        label: '10^5 pedidos, 5.000 pratos diferentes',
      },
    },
  },

  /* ------------------------------ 4. Hash map: complemento ------------------------------ */
  {
    topic: 'Hash map',
    problem: {
      id: 'ifood-combo-pairs',
      title: 'Pares de itens para o combo',
      difficulty: 'Médio',
      pattern: 'problemas-hackerrank',
      related: ['leetcode:arrays-hashing'],
      fnName: 'countComboPairs',
      params: ['prices', 'target'],
      description: `
Um restaurante quer montar combos de **dois itens** do cardápio cujo preço somado seja exatamente \`target\` reais (o valor do cupom do combo). O cardápio é a lista \`prices\`; pode haver preços repetidos, e itens diferentes (posições diferentes) com o mesmo preço contam como combos diferentes.

Conte quantos pares de posições \`(i, j)\`, com \`i < j\`, cumprem \`prices[i] + prices[j] === target\`.
`,
      format: {
        input: '`prices`: array de inteiros; `prices[i]` é o preço do item `i`.\n`target`: inteiro, a soma desejada.',
        output: 'Um inteiro: a quantidade de pares `(i, j)` com `i < j` e `prices[i] + prices[j] = target`.',
      },
      examples: [
        {
          input: 'prices = [10, 20, 10, 30, 20]\ntarget = 30',
          output: '4',
          explanation: 'Os pares de posições são (0,1), (0,4), (1,2) e (2,4): cada um junta um 10 com um 20.',
        },
        { input: 'prices = [15, 15, 15]\ntarget = 30', output: '3', explanation: 'Qualquer par de posições serve: (0,1), (0,2) e (1,2).' },
      ],
      constraints: ['1 ≤ prices.length ≤ 10^5', '1 ≤ prices[i] ≤ 10^6', '2 ≤ target ≤ 2 · 10^6'],
      starter: starter(
        'function countComboPairs(prices, target)',
        'function countComboPairs(prices: number[], target: number): number',
        `/**
 * @param {number[]} prices
 * @param {number} target
 * @return {number}
 */`,
      ),
      tests: [
        { input: [[10, 20, 10, 30, 20], 30], expected: 4, label: 'Exemplo 1' },
        { input: [[15, 15, 15], 30], expected: 3, label: 'Exemplo 2: preços iguais' },
        { input: [[5], 10], expected: 0, label: 'Um item só', hidden: true },
        { input: [[1, 2, 3], 100], expected: 0, label: 'Nenhum par', hidden: true },
        { input: [[5, 5], 10], expected: 1, label: 'Dois itens iguais', hidden: true },
        { input: [[4, 6, 4, 6, 5, 5], 10], expected: 5, label: 'Pares com repetidos', hidden: true },
        { input: [Array.from({ length: 100000 }, () => 5), 10], expected: 4999950000, label: 'Caso grande: todos iguais (resposta > 10^9)', hidden: true },
        { input: [Array.from({ length: 100000 }, (_, i) => i + 1), 100001], expected: 50000, label: 'Caso grande: 1..10^5', hidden: true },
      ],
      hints: [
        'Testar todos os pares é O(n²): 5 · 10^9 pares para n = 10^5. Para cada preço `p`, que valor você precisa encontrar antes?',
        'O parceiro de `p` é `target - p`. Guarde num `Map` quantas vezes cada preço já apareceu.',
        'Percorra os preços: some `seen.get(target - p) || 0` à resposta e só depois registre `p`. Assim cada par `(i, j)` com `i < j` é contado uma única vez.',
      ],
      explanation: {
        intuition: `
Para cada item novo \`p\`, só um preço completa o combo: \`target - p\`. Se você já guardou **quantas vezes** cada preço apareceu *antes* da posição atual, a resposta para \`p\` é essa contagem, em O(1).

Registrar \`p\` só **depois** de consultar garante que um item não forme par consigo mesmo e que cada par seja contado uma vez.
`,
        steps: [
          'Crie `seen` (um `Map` de preço → quantidade) e `pairs = 0`.',
          'Para cada preço `p`, some `seen.get(target - p) || 0` em `pairs`.',
          'Depois, incremente `seen` para `p`.',
          'Devolva `pairs`.',
        ],
        time: 'O(n)',
        space: 'O(n)',
        complexityWhy:
          'Uma passada com operações O(1) no Map. Para n = 10^5, são ~10^5 passos. A força bruta compara 5 · 10^9 pares. A resposta pode passar de 10^9 (todos iguais dá cerca de 5 · 10^9), e o `number` do JS guarda isso sem perda.',
        pitfalls: [
          'Usar um `Set` em vez de contar: perde os pares repetidos (três preços 15 com alvo 30 dão 3 pares, não 1).',
          'Registrar `p` antes de consultar: o item formaria par consigo mesmo quando `p * 2 === target`.',
          'Contar o par duas vezes (como (i, j) e (j, i)): a consulta só olha para trás.',
        ],
      },
      bruteForce: {
        idea: 'Dois laços aninhados testando a soma de todo par (i, j) com i < j.',
        complexity: 'O(n²) tempo, O(1) espaço',
      },
      solution: {
        js: `function countComboPairs(prices, target) {
  const seen = new Map();
  let pairs = 0;
  for (const price of prices) {
    pairs += seen.get(target - price) || 0;
    seen.set(price, (seen.get(price) || 0) + 1);
  }
  return pairs;
}
`,
        ts: `function countComboPairs(prices: number[], target: number): number {
  const seen = new Map<number, number>();
  let pairs = 0;
  for (const price of prices) {
    pairs += seen.get(target - price) || 0;
    seen.set(price, (seen.get(price) || 0) + 1);
  }
  return pairs;
}
`,
      },
      perf: {
        gen: (n: number) => [Array.from({ length: n }, (_, i) => ((i * 7919) % 1000) + 1), 1001],
        n: 100000,
        limitMs: 2500,
        label: '10^5 itens com 1.000 preços diferentes',
      },
    },
  },

  /* ------------------------------ 5. Ordenação: mesclar intervalos ------------------------------ */
  {
    topic: 'Ordenação',
    problem: {
      id: 'ifood-merge-rush-hours',
      title: 'Horários de pico unificados',
      difficulty: 'Médio',
      pattern: 'problemas-hackerrank',
      related: ['leetcode:arrays-hashing'],
      fnName: 'mergeRushHours',
      params: ['periods'],
      description: `
Cada restaurante parceiro informa seus períodos de pico como pares \`[início, fim]\` (em minutos, contados a partir da meia-noite). Os períodos chegam **fora de ordem** e muitos se sobrepõem.

Junte os períodos que se sobrepõem ou se **encostam** (o fim de um é igual ao início do outro) e devolva a lista final de períodos, **ordenada pelo início**.
`,
      format: {
        input: '`periods`: array de pares `[início, fim]` com `início ≤ fim`, em qualquer ordem. Pode ser vazio.',
        output: 'Um array de pares `[início, fim]` sem sobreposição, ordenado pelo início.',
      },
      examples: [
        {
          input: 'periods = [[60, 90], [0, 30], [80, 120], [30, 45]]',
          output: '[[0, 45], [60, 120]]',
          explanation: '[0,30] encosta em [30,45] e vira [0,45]. [60,90] se sobrepõe a [80,120] e vira [60,120].',
        },
      ],
      constraints: ['0 ≤ periods.length ≤ 10^5', '0 ≤ início ≤ fim ≤ 10^9'],
      starter: starter(
        'function mergeRushHours(periods)',
        'function mergeRushHours(periods: number[][]): number[][]',
        `/**
 * @param {number[][]} periods
 * @return {number[][]}
 */`,
      ),
      tests: [
        { input: [[[60, 90], [0, 30], [80, 120], [30, 45]]], expected: [[0, 45], [60, 120]], label: 'Exemplo 1' },
        { input: [[[1, 4], [5, 6]]], expected: [[1, 4], [5, 6]], label: 'Sem sobreposição' },
        { input: [[]], expected: [], label: 'Lista vazia', hidden: true },
        { input: [[[3, 3]]], expected: [[3, 3]], label: 'Um período de um minuto', hidden: true },
        { input: [[[2, 5], [2, 5], [2, 5]]], expected: [[2, 5]], label: 'Períodos idênticos', hidden: true },
        { input: [[[0, 100], [10, 20], [30, 40]]], expected: [[0, 100]], label: 'Períodos dentro de outro', hidden: true },
        { input: [[[3, 4], [1, 2], [2, 3]]], expected: [[1, 4]], label: 'Encostam em cadeia, fora de ordem', hidden: true },
        { input: [[[10, 11], [0, 1]]], expected: [[0, 1], [10, 11]], label: 'Separados e invertidos', hidden: true },
        {
          input: [Array.from({ length: 50000 }, (_, i) => [(49999 - i) * 3, (49999 - i) * 3 + 1])],
          expected: Array.from({ length: 50000 }, (_, i) => [i * 3, i * 3 + 1]),
          label: 'Caso grande: 50.000 períodos separados, em ordem inversa',
          hidden: true,
        },
        {
          input: [Array.from({ length: 100000 }, (_, i) => [99999 - i, 100001 - i])],
          expected: [[0, 100001]],
          label: 'Caso grande: 10^5 períodos em cadeia',
          hidden: true,
        },
      ],
      hints: [
        'Se os períodos estivessem ordenados pelo início, só os vizinhos poderiam se sobrepor. O que você faz primeiro?',
        'Ordene uma cópia por início: `[...periods].sort((a, b) => a[0] - b[0])`. Depois percorra mantendo o último período já montado.',
        'Se o início do período atual for ≤ ao fim do último montado, estenda o fim com `Math.max`. Senão, comece um novo período.',
      ],
      explanation: {
        intuition: `
Sem ordem, qualquer período pode se sobrepor a qualquer outro. **Ordenando pelo início**, a sobreposição vira um problema local: o período atual só pode encostar no último que você montou, nunca em um mais antigo.

Pense em juntar fitas de tecido numa mesa: arrume da esquerda para a direita e vá emendando a ponta da fita anterior.
`,
        steps: [
          'Faça uma cópia dos períodos e ordene pelo início.',
          'Percorra a lista; mantenha `merged` com os períodos já unificados.',
          'Se `merged` não está vazio e `início ≤ fim do último`, atualize o fim do último para `max(fim do último, fim atual)`.',
          'Caso contrário, acrescente `[início, fim]` a `merged`. Devolva `merged`.',
        ],
        time: 'O(n log n)',
        space: 'O(n)',
        complexityWhy:
          'A ordenação domina: O(n log n), cerca de 1,7 milhão de comparações para n = 10^5. A varredura é O(n). Comparar todos os pares de períodos repetidamente seria O(n²), 10^10 passos.',
        pitfalls: [
          'Usar `sort()` sem comparador: ordena como texto e coloca `[100, ...]` antes de `[20, ...]`. Use `(a, b) => a[0] - b[0]`.',
          'Atribuir o fim do último período sem `Math.max`: um período que está dentro de outro (`[0,100]` e `[10,20]`) encolheria o resultado.',
          'Usar `<` em vez de `<=` na comparação: períodos que apenas encostam (`[1,2]` e `[2,3]`) ficariam separados.',
          'Ordenar e alterar `periods` diretamente: o `sort` muda o array recebido. Copie antes.',
        ],
      },
      bruteForce: {
        idea: 'Repetir: procurar qualquer par de períodos que se sobrepõem, juntá-los e recomeçar, até nenhum se sobrepor.',
        complexity: 'O(n²) ou pior, tempo; O(n) espaço',
      },
      solution: {
        js: `function mergeRushHours(periods) {
  const sorted = [...periods].sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const [start, end] of sorted) {
    const last = merged[merged.length - 1];
    if (last && start <= last[1]) {
      last[1] = Math.max(last[1], end);
    } else {
      merged.push([start, end]);
    }
  }
  return merged;
}
`,
        ts: `function mergeRushHours(periods: number[][]): number[][] {
  const sorted = [...periods].sort((a, b) => a[0] - b[0]);
  const merged: number[][] = [];
  for (const [start, end] of sorted) {
    const last = merged[merged.length - 1];
    if (last && start <= last[1]) {
      last[1] = Math.max(last[1], end);
    } else {
      merged.push([start, end]);
    }
  }
  return merged;
}
`,
      },
      perf: {
        gen: (n: number) => [
          Array.from({ length: n }, (_, i) => {
            const start = (i * 7919) % 100003
            return [start, start + 2]
          }),
        ],
        n: 100000,
        limitMs: 2500,
        label: '10^5 períodos fora de ordem',
      },
    },
  },

  /* ------------------------------ 6. Strings: código espelhado ------------------------------ */
  {
    topic: 'Strings',
    problem: {
      id: 'ifood-mirror-code',
      title: 'Código de retirada espelhado',
      difficulty: 'Médio',
      pattern: 'problemas-hackerrank',
      related: ['leetcode:two-pointers'],
      fnName: 'isMirrorCode',
      params: ['code'],
      description: `
O código de retirada de um pedido é digitado pelo cliente com espaços, hífens e letras maiúsculas e minúsculas misturadas. Para validar, considere **apenas letras (a–z) e dígitos (0–9)**, ignorando maiúsculas e minúsculas; os demais caracteres são descartados.

O código é **espelhado** quando, lido de trás para frente, fica igual. Como o cliente pode errar uma tecla, aceite também o código que se torna espelhado **removendo no máximo um caractere**.

Retorne \`true\` se o código é aceito e \`false\` caso contrário.
`,
      format: {
        input: '`code`: string com letras, dígitos, espaços e símbolos ASCII.',
        output: 'Um booleano: `true` se, depois de limpar o código, ele é espelhado ou fica espelhado removendo um único caractere.',
      },
      examples: [
        { input: "code = 'Ana'", output: 'true', explanation: 'Limpo, vira "ana", que é igual de trás para frente.' },
        { input: "code = 'abca'", output: 'true', explanation: 'Removendo o "c" (ou o "b") sobra um código espelhado.' },
        { input: "code = 'abc'", output: 'false', explanation: 'Remover qualquer caractere deixa "bc", "ac" ou "ab": nenhum é espelhado.' },
      ],
      constraints: ['1 ≤ code.length ≤ 10^5', 'code só tem caracteres ASCII imprimíveis'],
      starter: starter(
        'function isMirrorCode(code)',
        'function isMirrorCode(code: string): boolean',
        `/**
 * @param {string} code
 * @return {boolean}
 */`,
      ),
      tests: [
        { input: ['Ana'], expected: true, label: 'Exemplo 1' },
        { input: ['abca'], expected: true, label: 'Exemplo 2: um caractere a mais' },
        { input: ['abc'], expected: false, label: 'Exemplo 3' },
        { input: ['x'], expected: true, label: 'Um caractere', hidden: true },
        { input: ['- - -'], expected: true, label: 'Só símbolos (código limpo vazio)', hidden: true },
        { input: ['Ab-C-bXa'], expected: true, label: 'Misturado, com um erro', hidden: true },
        { input: ['A1 b2 2B 1a'], expected: true, label: 'Dígitos e maiúsculas, já espelhado', hidden: true },
        { input: ['abcdeba'], expected: false, label: 'Erros demais', hidden: true },
        { input: ['ab'], expected: true, label: 'Dois caracteres: remove um', hidden: true },
        { input: ['a'.repeat(50000) + 'bc' + 'a'.repeat(50000)], expected: true, label: 'Caso grande: um erro no meio', hidden: true },
        { input: ['a'.repeat(50000) + 'bcd' + 'a'.repeat(50000)], expected: false, label: 'Caso grande: dois erros no meio', hidden: true },
      ],
      hints: [
        'Primeiro limpe o texto: fique só com letras e dígitos, em minúsculas. Depois pense em como comparar o começo com o fim.',
        'Use dois ponteiros, `left` no começo e `right` no fim, andando para o centro enquanto os caracteres forem iguais.',
        'No primeiro par diferente, você pode pular o da esquerda ou o da direita. Teste os dois casos: o trecho restante precisa ser espelhado (sem mais nenhum erro).',
      ],
      explanation: {
        intuition: `
Um texto espelhado se verifica de fora para dentro: o primeiro caractere precisa ser igual ao último, o segundo ao penúltimo, e assim por diante. Isso são **dois ponteiros** andando um em direção ao outro.

Com a tolerância de um erro, o primeiro par diferente é o único ponto em que algo pode ter sobrado: ou o caractere da esquerda, ou o da direita. Basta testar as duas hipóteses; cada uma é uma checagem simples do trecho que sobra.
`,
        steps: [
          'Limpe o código: minúsculas, mantendo só `a–z` e `0–9`.',
          'Com `left = 0` e `right = última posição`, avance enquanto os caracteres forem iguais.',
          'No primeiro par diferente, retorne `isMirror(left + 1, right) || isMirror(left, right - 1)`.',
          'Se os ponteiros se cruzarem sem diferença, retorne `true`.',
        ],
        time: 'O(n)',
        space: 'O(n)',
        complexityWhy:
          'A limpeza é O(n). Os dois ponteiros andam no máximo n/2 passos e, no primeiro erro, há duas conferências de O(n). Para n = 10^5, são poucos passos. Tentar remover cada caractere e conferir tudo seria O(n²) = 10^10.',
        pitfalls: [
          'Remover cada posição e testar o texto inteiro: correto, mas O(n²) e estoura o tempo.',
          'Esquecer de limpar símbolos e maiúsculas (`"Ab-C-bXa"`).',
          'Depois de pular um caractere, permitir um segundo erro: a tolerância é de um único caractere removido.',
          'Testar só uma das hipóteses: em `"abbca"` só funciona pular o da direita (o "c"); em `"acbba"`, só o da esquerda.',
        ],
      },
      bruteForce: {
        idea: 'Se não for espelhado, remover cada caractere, um por vez, e conferir se o texto restante é espelhado.',
        complexity: 'O(n²) tempo, O(n) espaço',
      },
      solution: {
        js: `function isMirrorCode(code) {
  const clean = [];
  for (const ch of code.toLowerCase()) {
    if ((ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9')) {
      clean.push(ch);
    }
  }
  let left = 0;
  let right = clean.length - 1;
  while (left < right) {
    if (clean[left] !== clean[right]) {
      return isMirror(clean, left + 1, right) || isMirror(clean, left, right - 1);
    }
    left++;
    right--;
  }
  return true;
}

function isMirror(chars, left, right) {
  while (left < right) {
    if (chars[left] !== chars[right]) return false;
    left++;
    right--;
  }
  return true;
}
`,
        ts: `function isMirrorCode(code: string): boolean {
  const clean: string[] = [];
  for (const ch of code.toLowerCase()) {
    if ((ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9')) {
      clean.push(ch);
    }
  }
  let left = 0;
  let right = clean.length - 1;
  while (left < right) {
    if (clean[left] !== clean[right]) {
      return isMirror(clean, left + 1, right) || isMirror(clean, left, right - 1);
    }
    left++;
    right--;
  }
  return true;
}

function isMirror(chars: string[], left: number, right: number): boolean {
  while (left < right) {
    if (chars[left] !== chars[right]) return false;
    left++;
    right--;
  }
  return true;
}
`,
      },
      perf: {
        gen: (n: number) => {
          const k = Math.floor(n / 2) - 1
          return ['a'.repeat(k) + 'bc' + 'a'.repeat(k)]
        },
        n: 100000,
        limitMs: 2500,
        label: 'código com 10^5 caracteres e um erro no meio',
      },
    },
  },
]
