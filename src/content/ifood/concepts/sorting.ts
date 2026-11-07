import type { ConceptQuestion } from '../types'

/** Tema "ordenacao": Ordenação e busca binária. */
export const SORTING_QUESTIONS: ConceptQuestion[] = [
  {
    id: 'ordenacao-merge-quick-pior-caso',
    theme: 'ordenacao',
    prompt:
      'Comparando merge sort e quick sort (com pivô sempre no primeiro elemento) em listas de `n` pedidos, qual afirmação sobre o **pior caso** de tempo é correta?',
    options: [
      'Os dois são O(n log n) no pior caso, pois ambos dividem a lista ao meio',
      'O quick sort é O(n log n) sempre; o merge sort cai para O(n²) em listas já ordenadas',
      'O merge sort é O(n log n) sempre; o quick sort cai para O(n²) quando os pivôs dividem mal',
      'Os dois são O(n²) no pior caso, e só diferem em quanto espaço extra usam',
    ],
    answer: 2,
    explain:
      'O merge sort sempre divide ao meio (log n níveis) e junta em O(n) por nível: **O(n log n) em qualquer entrada**, usando O(n) de espaço extra. O quick sort é O(n log n) em média, mas, com um pivô ruim (por exemplo, o primeiro elemento de uma lista já ordenada), cada partição separa só 1 elemento: n níveis de O(n) cada, ou **O(n²)**. Pivô aleatório ou mediana de três tornam esse caso improvável.',
    whyWrong: [
      'Vale para o merge sort, mas o quick sort divide pelo pivô, não pelo meio: se o pivô é o menor ou o maior valor, uma das partes fica vazia e a recursão tem n níveis, O(n²).',
      'Está invertido: o merge sort não depende da ordem inicial. E o quick sort com pivô fixo é justamente o que sofre numa lista já ordenada.',
      '',
      'O merge sort é O(n log n) até no pior caso. Só o quick sort (com pivôs ruins) chega a O(n²).',
    ],
    review: 'leetcode:binary-search',
  },
  {
    id: 'ordenacao-insertion-quase-ordenada',
    theme: 'ordenacao',
    prompt:
      'O ranking de restaurantes já está quase ordenado: a cada minuto só 2 ou 3 notas mudam, e esses itens ficam perto da posição correta. Qual algoritmo costuma ir melhor para reordenar a lista?',
    options: [
      'Insertion sort, que chega perto de O(n) quando poucos itens estão fora do lugar',
      'Merge sort, pois só ele consegue aproveitar uma entrada que já está quase ordenada',
      'Quick sort com pivô fixo, pois partições desbalanceadas são rápidas em listas ordenadas',
      'Nenhum se beneficia: todo algoritmo por comparação gasta sempre n log n comparações',
    ],
    answer: 0,
    explain:
      'O insertion sort pega cada item e o desliza para trás até a posição certa. Se cada item já está perto do lugar, ele desliza pouco: o custo é cerca de n mais o número de pares fora de ordem, ou seja, **quase O(n)**. Numa lista já ordenada, são só n−1 comparações. O preço é que, no pior caso (lista invertida), ele é O(n²), então não serve para dados embaralhados e grandes.',
    whyWrong: [
      '',
      'O merge sort clássico faz O(n log n) mesmo com a lista já ordenada: ele não aproveita a ordem existente.',
      'Com pivô fixo, entrada ordenada é o **pior** caso do quick sort: partições de tamanho 0 e n−1, O(n²).',
      'O limite de n log n vale para o pior caso geral. Algoritmos adaptativos, como o insertion sort, fazem cerca de n comparações numa lista já ordenada.',
    ],
  },
  {
    id: 'ordenacao-estabilidade',
    theme: 'ordenacao',
    prompt:
      'Os pedidos abaixo já estão em ordem de horário. Você ordena por `status` e quer que, dentro de cada status, a ordem de horário seja mantida. Isso depende de qual propriedade do algoritmo, e o `sort` do JS a tem?',
    code: `const orders = [
  { id: 1, status: 'pronto', at: '10:00' },
  { id: 2, status: 'novo', at: '10:05' },
  { id: 3, status: 'pronto', at: '10:10' },
  { id: 4, status: 'novo', at: '10:15' },
]
orders.sort((a, b) => a.status.localeCompare(b.status))`,
    options: [
      'Complexidade; o `sort` do JS é O(n²), então pode embaralhar os empates',
      'Estabilidade; o `sort` do JS não é estável, então é preciso reordenar por horário',
      'Estabilidade; o `sort` do JS só é estável quando os itens são números',
      'Estabilidade; o `sort` do JS é estável desde o ES2019, então empates mantêm a ordem',
    ],
    answer: 3,
    explain:
      'Um algoritmo é **estável** quando elementos considerados iguais pelo comparador mantêm a ordem relativa que tinham antes. Desde o ES2019, a especificação exige que `Array.prototype.sort` seja estável, então o resultado é os ids 2, 4 (novo, nessa ordem) e depois 1, 3 (pronto, nessa ordem). Isso permite ordenar em duas passadas: primeiro pelo critério secundário e depois pelo principal. Já algoritmos como o quick sort clássico e o heap sort não garantem estabilidade.',
    whyWrong: [
      'Estabilidade não tem a ver com complexidade, e o `sort` dos motores atuais é O(n log n), não O(n²). O ponto aqui é o que acontece com os empates.',
      'Isso era verdade antes do ES2019, quando motores antigos podiam trocar a ordem de empates. Hoje a especificação exige estabilidade, então não precisa reordenar por horário.',
      'A estabilidade do `sort` não depende do tipo dos itens: vale para objetos, strings e números.',
      '',
    ],
  },
  {
    id: 'ordenacao-sort-padrao-string',
    theme: 'ordenacao',
    prompt: 'Sem passar comparador, o que o código abaixo imprime? (Pense em como o `sort` compara os elementos por padrão.)',
    code: `const prices = [25, 5, 100, 1]
prices.sort()
console.log(prices)`,
    options: ['[1, 5, 25, 100]', '[1, 100, 25, 5]', '[100, 25, 5, 1]', '[25, 5, 100, 1]'],
    answer: 1,
    explain:
      'Sem comparador, o `sort` converte os elementos em **texto** e compara caractere a caractere: "1" < "100" < "25" < "5". Por isso sai `[1, 100, 25, 5]`. Para ordenar números, passe um comparador: `prices.sort((a, b) => a - b)` (crescente) ou `(a, b) => b - a` (decrescente). Lembre também que o `sort` altera o próprio array.',
    whyWrong: [
      'Seria o resultado com o comparador numérico `(a, b) => a - b`. Sem comparador, o `sort` não compara números como números.',
      '',
      'Seria a ordem numérica decrescente (`b - a`). Sem comparador, a comparação é de texto, e em texto "100" vem antes de "25".',
      'O `sort` ordena **no próprio array** (muta) e devolve o mesmo array, então a lista não fica intacta. A ordem muda, só que como texto.',
    ],
  },
  {
    id: 'ordenacao-busca-binaria-pre-requisito',
    theme: 'ordenacao',
    prompt:
      'Um colega aplicou busca binária na lista de preços de um cardápio para saber se existe um item de R$ 30, mas a lista está na ordem em que os itens foram cadastrados (sem ordenar). O que acontece?',
    options: [
      'Pode dar resposta errada, pois descarta metade da lista supondo que ela esteja ordenada',
      'Funciona normalmente, só fica mais lenta e passa a custar O(n) como a busca linear',
      'Funciona normalmente, pois a busca binária compara com o meio e testa os dois lados',
      'Dá erro de execução, porque o JavaScript recusa busca binária em listas sem ordem',
    ],
    answer: 0,
    explain:
      'A busca binária compara o alvo com o elemento do meio e descarta uma metade inteira, supondo que todos os valores de um lado são menores e os do outro, maiores. Sem a lista **ordenada**, essa suposição quebra. Exemplo: em `[10, 50, 30, 20]` procurando 30, ela olha o 50 (índice 1), conclui que o 30 só pode estar à esquerda e responde que não existe, embora ele esteja lá.',
    whyWrong: [
      '',
      'Não é só lentidão: ela devolve resultado incorreto. Em `[10, 50, 30, 20]` procurando 30, descarta o lado direito (onde o 30 está) e diz que não existe.',
      'Ela testa só um lado por passo, não os dois. Testar os dois lados seria uma busca em árvore completa, O(n).',
      'O JS não verifica a ordem nem lança erro: o código roda e entrega uma resposta errada sem avisar, o que torna o bug mais perigoso.',
    ],
    review: 'leetcode:binary-search',
  },
  {
    id: 'ordenacao-busca-binaria-laco',
    theme: 'ordenacao',
    prompt:
      'Esta busca binária deveria devolver o índice de `target` num array ordenado de preços, ou `-1`. Ela falha em alguns casos: `binarySearch([7], 7)` devolve `-1`. Qual é o problema e a correção?',
    code: `function binarySearch(prices, target) {
  let lo = 0
  let hi = prices.length - 1
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    if (prices[mid] === target) return mid
    if (prices[mid] < target) lo = mid + 1
    else hi = mid - 1
  }
  return -1
}`,
    options: [
      'O cálculo de `mid` pode estourar o limite de inteiros; use `lo + (hi - lo) / 2`',
      'O `Math.floor` está errado; troque por `Math.ceil` para o meio nunca se repetir',
      'A condição `lo < hi` encerra cedo e ignora o último candidato; o certo é `lo <= hi`',
      'O `return -1` deveria ficar dentro do laço, para sair assim que um palpite falhar',
    ],
    answer: 2,
    explain:
      'Com um elemento só, `lo` e `hi` valem 0, `lo < hi` é falso e o laço nem roda: o único candidato nunca é testado. Com limites **inclusivos** (`hi = length - 1`, `lo = mid + 1`, `hi = mid - 1`), o intervalo `[lo, hi]` ainda tem candidatos enquanto `lo <= hi`. Off-by-one nos limites é o erro mais comum na busca binária. Em JS, `(lo + hi) / 2` não tem problema de overflow, porque os números são de 64 bits e índices de array nunca chegam perto do limite.',
    whyWrong: [
      'Esse estouro existe em linguagens com inteiros de 32 bits. Em JS, `lo + hi` só perderia precisão acima de 2^53, impossível para índices de array. Não é o bug aqui.',
      'Trocar `floor` por `ceil` não resolve: com `lo < hi`, o único elemento continua sem ser testado. E o `floor` combina com `lo = mid + 1` e `hi = mid - 1`.',
      '',
      'Retornar `-1` no primeiro palpite errado diria que o item não existe sem olhar o resto da lista. O `-1` só vale depois que o intervalo esvazia.',
    ],
    review: 'leetcode:binary-search',
  },
  {
    id: 'ordenacao-busca-binaria-na-resposta',
    theme: 'ordenacao',
    prompt:
      'Você tem uma função `canFinish(minutes)` que diz se a cozinha consegue preparar todos os pedidos do dia em `minutes` minutos. Se `canFinish(t)` é verdadeiro, qualquer tempo maior também é. Como achar o **menor** `minutes` que serve, sem testar um por um?',
    options: [
      'Não dá: a busca binária só vale sobre arrays ordenados, então é testar do 1 em diante',
      'Ordenar os pedidos e aplicar a busca binária no array de pedidos já ordenado',
      'Sortear valores de `minutes` até achar um que sirva, pois a resposta não tem ordem',
      'Busca binária no intervalo de respostas, testando `canFinish` no meio e descartando metade',
    ],
    answer: 3,
    explain:
      'A "ordem" que a busca binária exige pode estar nas **respostas**: `canFinish` dá falso, falso, …, verdadeiro, verdadeiro. Escolha um intervalo `[lo, hi]` (com `hi` sabidamente suficiente), teste o meio: se `canFinish(mid)` é verdadeiro, a resposta é `mid` ou menor (`hi = mid`); senão, é maior (`lo = mid + 1`). São cerca de log₂ do intervalo chamadas de `canFinish`, em vez de uma por minuto possível.',
    whyWrong: [
      'A exigência não é "array ordenado", e sim uma propriedade monótona (falso…falso, verdadeiro…verdadeiro). `canFinish` tem essa forma, então dá para buscar binariamente nas respostas.',
      'Ordenar os pedidos não responde à pergunta. O que precisa de ordem é a sequência de respostas possíveis (`canFinish(1)`, `canFinish(2)`…), que já é monótona sem ordenar nada.',
      'Sortear não garante achar o **menor** valor e pode demorar muito. Como a resposta tem estrutura monótona, dá para descartar metade a cada teste.',
      '',
    ],
    review: 'leetcode:binary-search',
  },
  {
    id: 'ordenacao-quando-ordenar-compensa',
    theme: 'ordenacao',
    prompt:
      'Você tem `n` preços de pratos e precisa responder a `q` consultas do tipo "qual o prato mais barato com preço de pelo menos X?". Quando vale a pena ordenar antes e usar busca binária, em vez de varrer a lista a cada consulta?',
    options: [
      'Sempre: ordenar custa O(n log n) uma vez e isso é menor que qualquer busca',
      'Quando `q` é grande: pagar O(n log n) uma vez e O(log n) por consulta compensa',
      'Nunca: a busca linear O(n) é sempre mais rápida que ordenar e depois buscar',
      'Só quando a lista tem menos de 10 itens, pois ordenar listas grandes é caro demais',
    ],
    answer: 1,
    explain:
      'Cada consulta por varredura custa O(n), então `q` consultas custam O(q · n). Ordenando uma vez (O(n log n)), cada consulta vira O(log n), com total O((n + q) log n). Com `q = 1`, a varredura vence (n é menor que n log n). Com `q = 100.000`, a ordenação se paga muitas vezes. Regra prática: ordene quando for consultar muitas vezes, ou quando precisar de ordem, faixas ou vizinho mais próximo.',
    whyWrong: [
      'Não é sempre: para uma única consulta, varrer a lista uma vez custa O(n), menos que ordenar, O(n log n). Ordenar é um investimento que se paga com várias consultas.',
      '',
      'Isso só vale para poucas consultas. Com `q` consultas, a varredura custa O(q · n), e com milhares de consultas o custo de ordenar uma vez já foi pago várias vezes.',
      'O critério é o número de consultas, não um limite de itens. Ordenar uma lista grande e consultá-la muitas vezes é exatamente o caso em que compensa.',
    ],
    review: 'leetcode:binary-search',
  },
]
