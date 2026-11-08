import type { Pattern } from '../../types'
import { PROBLEM_IDS } from '../problems'

/** Seção 1: como ler e atacar um problema no formato do HackerRank. */
export const PROBLEMS_LESSON: Pattern = {
  id: 'problemas-hackerrank',
  title: 'Como atacar um problema do HackerRank',
  short: 'Restrições → Big O → padrão → casos de borda.',
  summary:
    'Antes de escrever código: ler o enunciado no formato do HackerRank, usar as restrições para descobrir qual complexidade cabe no tempo, reconhecer o padrão e listar os casos de borda que os testes ocultos vão cobrar.',
  color: '#ea1d2c',
  lesson: [
    {
      type: 'analogy',
      title: 'O entregador olha o pedido antes de sair',
      md: 'Antes de aceitar uma corrida, o entregador olha **distância e prazo**: 800 metros em 30 minutos dá para ir de bicicleta; 12 km em 20 minutos exige moto, e pelo caminho mais curto. Num problema de código é igual: as **restrições** (o tamanho da entrada) dizem quanto tempo você tem, e isso decide o algoritmo antes da primeira linha de código.',
    },
    {
      type: 'text',
      md: `### A anatomia do enunciado
No HackerRank, todo problema de código tem as mesmas partes:

- **Descrição**: a história e o que deve ser calculado.
- **Formato de entrada**: o que a sua função recebe (tipos e significado de cada parâmetro).
- **Restrições**: os limites da entrada, como \`1 ≤ n ≤ 10^5\`. É a parte mais importante e a mais ignorada.
- **Formato de saída**: o que a função deve devolver.
- **Exemplos** (*sample input/output*): poucos casos, para conferir que você entendeu.

Você completa uma função, e o próprio HackerRank lê a entrada e imprime o resultado. A nota vem dos **testes ocultos**: passar nos exemplos não garante nada.`,
    },
    {
      type: 'text',
      md: `### Das restrições para o Big O
Um computador faz algo como **10^8 operações simples por segundo**, e o limite costuma ser de 1 a 2 segundos. Dá para estimar a complexidade que cabe olhando o tamanho máximo de \`n\`:

- \`n ≤ 10\`: até O(n!) — testar todas as permutações.
- \`n ≤ 20\`: O(2ⁿ) — testar todos os subconjuntos (backtracking).
- \`n ≤ 500\`: O(n³) — três laços aninhados.
- \`n ≤ 5.000\`: O(n²) — dois laços aninhados.
- \`n ≤ 10^5\` ou \`10^6\`: O(n log n) ou O(n) — ordenar, hash map, dois ponteiros, uma passada.
- \`n\` até \`10^9\` ou mais: O(log n) ou O(1) — busca binária ou fórmula; não dá nem para percorrer.

Se a sua ideia for O(n²) e \`n\` chega a \`10^5\`, são 10^10 operações: os testes pequenos passam e os ocultos grandes estouram o tempo (*Time Limit Exceeded*).`,
    },
    {
      type: 'quiz',
      question: 'As restrições dizem `1 ≤ n ≤ 2 · 10^5`. Qual a complexidade mais lenta que ainda deve passar no tempo?',
      options: ['O(n²)', 'O(n log n)', 'O(2ⁿ)', 'O(n³)'],
      answer: 1,
      explain:
        'Com n = 2 · 10^5, O(n log n) dá uns 3,6 milhões de operações: folgado. O(n²) daria 4 · 10^10, centenas de segundos. O(n³) e O(2ⁿ) nem se fala.',
    },
    {
      type: 'signals',
      title: 'Sinais no enunciado → padrão',
      items: [
        '"Existe um par que soma X?", "quantas vezes aparece?", "agrupe por..." → **hash map / Set** (Arrays & Hashing)',
        '"Lista ordenada", "menor valor que ainda funciona" → **busca binária** (no array ou na resposta)',
        '"Subarray / trecho contínuo", "janela de k dias" → **dois ponteiros / sliding window** ou soma de prefixos',
        '"Ordene por...", "intervalos que se sobrepõem" → **ordenação** com comparador',
        '"Escolha local que parece melhor agora" e dá para provar que não atrapalha depois → **guloso**',
        '"Quantas formas", "máximo/mínimo com escolhas que dependem das anteriores" → **programação dinâmica**',
        '"Parênteses", "desfazer", "próximo maior" → **pilha**; "na ordem de chegada" → **fila**',
        '"Menor número de passos" num mapa ou rede → **BFS**; "explore tudo", "componentes", árvore → **DFS**',
      ],
    },
    {
      type: 'demo',
      title: 'Uma passada, com os casos de borda tratados',
      caption: 'Maior sequência de dias seguidos em que o entregador bateu a meta. Repare que a mesma lógica já cobre lista vazia e um dia só.',
      code: `function bestStreak(deliveries, goal) {
  let best = 0
  let current = 0
  for (const count of deliveries) {
    if (count >= goal) {
      current++
      best = Math.max(best, current)
    } else {
      current = 0
    }
  }
  return best
}`,
      fnName: 'bestStreak',
      input: [[9, 12, 3, 10, 11, 15, 2], 8],
    },
    {
      type: 'callout',
      tone: 'warn',
      title: 'Os casos de borda que os testes ocultos cobram',
      md: `Antes de enviar, rode de cabeça (ou escreva um teste) para:

- **entrada vazia** (\`[]\`, \`""\`) e **um elemento só**;
- **todos iguais** e **valores repetidos**;
- **zero e negativos**, quando as restrições permitem;
- **já ordenado** e **em ordem inversa**;
- os **limites** das restrições: o \`n\` máximo (tempo) e os valores máximos (somas grandes).`,
    },
    {
      type: 'text',
      md: `### Um roteiro para os 30 a 45 minutos de cada questão
1. **Leia tudo uma vez** e marque as restrições. Reescreva o objetivo numa frase.
2. **Resolva os exemplos à mão.** Se não consegue fazer no papel, não vai conseguir no código.
3. **Escolha a abordagem** pela tabela de restrições e pelos sinais. Sem ideia melhor, escreva a força bruta correta: ela já garante parte dos pontos.
4. **Codifique e rode os exemplos.**
5. **Pense nos ocultos**: casos de borda e o \`n\` máximo. Otimize se a complexidade não cabe.`,
    },
    {
      type: 'quiz',
      question: 'Sua solução passa nos 3 exemplos, mas 4 dos 12 testes ocultos dão *Time Limit Exceeded*. O que isso indica?',
      options: [
        'A lógica está errada para entradas grandes',
        'A resposta está certa, mas a complexidade é alta demais para o n máximo',
        'O HackerRank está lento e vale reenviar a mesma solução',
        'Faltou tratar a entrada vazia',
      ],
      answer: 1,
      explain:
        'TLE quer dizer que a função **não terminou no tempo**, não que respondeu errado. Os ocultos grandes testam o n máximo: é hora de comparar a sua complexidade com a tabela das restrições. Entrada vazia que quebra daria erro ou resposta errada, não TLE.',
    },
    {
      type: 'callout',
      tone: 'interview',
      md: 'Resultado parcial conta: **envie cedo** uma versão correta (mesmo que lenta) e depois otimize. E fale a complexidade da sua solução nos comentários ou na explicação, se a plataforma pedir: quem avalia quer ver que você sabe por que ela é O(n log n).',
    },
    {
      type: 'text',
      md: `### Os padrões no DevForge
Cada problema desta seção indica o padrão do NeetCode que a solução usa. Se travar, revise a aula do padrão: [Arrays & Hashing](#/leetcode/padrao/arrays-hashing), [Two Pointers](#/leetcode/padrao/two-pointers), [Sliding Window](#/leetcode/padrao/sliding-window), [Stack](#/leetcode/padrao/stack), [Binary Search](#/leetcode/padrao/binary-search), [Trees](#/leetcode/padrao/trees), [Graphs](#/leetcode/padrao/graphs) e [1-D DP](#/leetcode/padrao/dp-1d).`,
    },
  ],
  problems: PROBLEM_IDS,
}
