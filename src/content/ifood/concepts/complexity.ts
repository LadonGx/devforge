import type { ConceptQuestion } from '../types'

/** Tema "complexidade": Big O e estruturas de dados (pilha, fila, hash, árvore, heap, grafo). */
export const COMPLEXITY_QUESTIONS: ConceptQuestion[] = [
  {
    id: 'complexidade-includes-no-loop',
    theme: 'complexidade',
    prompt: 'Um sistema de cupons confere, para cada um dos `n` pedidos do dia, se o código do cupom está numa lista de `m` cupons válidos. Qual a complexidade de tempo?',
    code: `function validOrders(orders, coupons) {
  return orders.filter((o) => coupons.includes(o.coupon))
}`,
    options: ['O(n · m)', 'O(n + m)', 'O(n)', 'O(n log m)'],
    answer: 0,
    explain:
      '`filter` passa pelos `n` pedidos, e para cada um o `includes` percorre a lista de cupons até achar (no pior caso, os `m`). Um laço dentro do outro: **O(n · m)**. Trocando a lista por um `Set` (`new Set(coupons)`), cada consulta vira O(1) e o total cai para O(n + m).',
    whyWrong: [
      '',
      'Seria O(n + m) se os cupons estivessem num `Set`: montar o Set custa O(m) e cada consulta O(1). Com array, o `includes` é uma busca linear.',
      'Ignora o custo do `includes`: ele não é O(1) num array, percorre os elementos um a um.',
      'O(log m) por consulta só com busca binária numa lista **ordenada**. O `includes` não faz busca binária.',
    ],
    review: 'leetcode:arrays-hashing',
  },
  {
    id: 'complexidade-pares-aninhados',
    theme: 'complexidade',
    prompt: 'Para achar pedidos duplicados (mesmo cliente e mesmo valor) numa lista de `n` pedidos, o código compara cada pedido com todos os seguintes. Qual a complexidade de tempo no pior caso?',
    code: `function hasDuplicate(orders) {
  for (let i = 0; i < orders.length; i++) {
    for (let j = i + 1; j < orders.length; j++) {
      const a = orders[i]
      const b = orders[j]
      if (a.customerId === b.customerId && a.total === b.total) return true
    }
  }
  return false
}`,
    options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)'],
    answer: 2,
    explain:
      'Sem duplicata, o código faz (n−1) + (n−2) + … + 1 = n(n−1)/2 comparações, que cresce como **n²** (a constante 1/2 some no Big O). Com 1.000 pedidos são cerca de 500 mil comparações; com 10.000, cerca de 50 milhões. Guardando a chave `cliente:valor` de cada pedido num `Set` e consultando antes de inserir, o mesmo problema cai para O(n).',
    whyWrong: [
      'Seria O(n) com um único laço, ou usando um `Set` para lembrar o que já foi visto. Aqui, para cada `i` existe um laço interno que também anda pela lista.',
      'É o custo de ordenar a lista e comparar só os vizinhos. Este código não ordena nem divide nada pela metade: o laço interno anda de forma linear.',
      '',
      'Exponencial aparece ao testar todos os subconjuntos (recursão sem memoização). Dois laços aninhados dão um custo polinomial, não exponencial.',
    ],
    review: 'leetcode:arrays-hashing',
  },
  {
    id: 'complexidade-logaritmo-laco',
    theme: 'complexidade',
    prompt: 'Um código de paginação "pula" posições dobrando o passo até passar do fim da lista de `n` restaurantes. Qual a complexidade de tempo?',
    code: `let steps = 0
for (let i = 1; i < restaurants.length; i *= 2) {
  steps++
}`,
    options: ['O(n)', 'O(log n)', 'O(√n)', 'O(1)'],
    answer: 1,
    explain:
      'O índice `i` vale 1, 2, 4, 8, 16… e dobra a cada volta, então chega em `n` depois de cerca de log₂ n voltas. Com 1.000.000 de restaurantes são só uns 20 passos. É o mesmo raciocínio da busca binária: a cada passo, metade do que falta é descartada (ou, aqui, o passo dobra).',
    whyWrong: [
      'Seria O(n) se `i` crescesse de 1 em 1 (`i++`). Multiplicar por 2 faz o índice crescer de forma exponencial, e o número de voltas, de forma logarítmica.',
      '',
      'O(√n) aparece em laços como `i * i <= n` (por exemplo, testar se um número é primo). Aqui o passo dobra, não é o quadrado de `i`.',
      'Constante seria um número fixo de voltas, independente de `n`. Aqui o número de voltas cresce com `n` (devagar, mas cresce).',
    ],
    review: 'leetcode:binary-search',
  },
  {
    id: 'complexidade-push-amortizado',
    theme: 'complexidade',
    prompt: 'Você chama `push` `n` vezes para montar o array de avaliações de um restaurante. Por que dizemos que cada `push` é O(1) **amortizado**?',
    options: [
      'Porque o `push` sempre grava numa posição livre e nunca precisa copiar elementos',
      'Porque o motor do JS guarda os elementos ordenados e evita cópias na inserção',
      'Porque cada `push` custa O(log n) e a média cai para O(1) conforme o array cresce',
      'Porque copiar tudo para um espaço maior é raro; diluído nos `push`, a média é constante',
    ],
    answer: 3,
    explain:
      'Quando o espaço reservado acaba, o motor aloca um bloco maior e copia tudo (O(n) naquele `push`). Mas a capacidade cresce por um fator, então essa cópia acontece pouquíssimas vezes. Diluindo as cópias raras nos muitos `push` baratos, `n` chamadas custam O(n) no total, ou seja, O(1) por chamada **em média**. Um `push` isolado pode ser lento; o "amortizado" fala da sequência inteira.',
    whyWrong: [
      'Nem sempre: quando o espaço reservado acaba, há realocação e cópia (O(n) naquele `push`). Por isso o termo é "amortizado", e não "sempre O(1)".',
      'O `push` não ordena nada: ele só acrescenta no fim, na ordem das chamadas. Ordem dos elementos não tem relação com o custo de inserir no fim.',
      'O custo não é logarítmico: a maioria dos `push` é O(1) puro e poucos são O(n). É essa mistura que dá média constante, não um O(log n) por chamada.',
      '',
    ],
    review: 'leetcode:arrays-hashing',
  },
  {
    id: 'complexidade-espaco-extra',
    theme: 'complexidade',
    prompt: 'Duas versões de uma função que inverte a lista de `n` entregas do dia. Qual o **espaço extra** de cada uma (sem contar a entrada)?',
    code: `function reverseCopy(list) {
  const out = []
  for (let i = list.length - 1; i >= 0; i--) out.push(list[i])
  return out
}

function reverseInPlace(list) {
  for (let l = 0, r = list.length - 1; l < r; l++, r--) {
    ;[list[l], list[r]] = [list[r], list[l]]
  }
  return list
}`,
    options: [
      '`reverseCopy` usa O(n); `reverseInPlace` usa O(1)',
      '`reverseCopy` usa O(1); `reverseInPlace` usa O(n)',
      'As duas usam O(n), porque as duas percorrem a lista inteira',
      'As duas usam O(1), porque só mudam a ordem e não criam dados',
    ],
    answer: 0,
    explain:
      '`reverseCopy` monta um array novo que cresce até `n` elementos: espaço **O(n)**. `reverseInPlace` troca elementos dentro do próprio array e só usa as variáveis `l` e `r` (mais uma troca temporária de 2 itens): espaço **O(1)**. O tempo das duas é O(n); a diferença está na memória (e em a segunda alterar a lista original).',
    whyWrong: [
      '',
      'Está invertido: quem cria um array novo é a primeira. A segunda apenas troca posições dentro do array recebido.',
      'Mistura tempo com espaço. Percorrer `n` itens é tempo O(n); espaço mede a memória **extra** alocada, e a segunda não aloca nada que cresça com `n`.',
      'A primeira cria um array de saída com `n` elementos, então seu espaço cresce com `n`. Só a segunda é O(1).',
    ],
    review: 'leetcode:two-pointers',
  },
  {
    id: 'complexidade-pilha-fila',
    theme: 'complexidade',
    prompt:
      'Duas funções de um app: (A) o botão "desfazer", que remove o último item adicionado ao carrinho, e (B) a fila de pedidos que o restaurante prepara na ordem em que chegaram. Que estrutura combina com A e com B?',
    options: ['A: fila; B: pilha', 'A: pilha; B: pilha', 'A: pilha; B: fila', 'A: fila; B: fila'],
    answer: 2,
    explain:
      'Pilha é **LIFO** (o último a entrar é o primeiro a sair): `push` ao adicionar ao carrinho e `pop` ao desfazer, ambos O(1). Fila é **FIFO** (o primeiro a chegar é o primeiro a sair): serve para atender pedidos por ordem de chegada. Em JS, uma pilha é um array com `push`/`pop`; uma fila feita com `push`/`shift` pode custar O(n) por `shift` em arrays grandes, então para filas grandes vale usar um índice de cabeça.',
    whyWrong: [
      'Está invertido: "desfazer" tira o item mais recente (LIFO), não o mais antigo; e a cozinha atender o último pedido primeiro seria injusto com quem chegou antes.',
      'A está certo, mas B com pilha atenderia sempre o pedido mais recente primeiro, e os antigos ficariam esperando. Ordem de chegada pede FIFO.',
      '',
      'B está certo, mas A com fila desfaria o item mais antigo do carrinho, não o último adicionado. Desfazer exige LIFO.',
    ],
    review: 'leetcode:stack',
  },
  {
    id: 'complexidade-hash-vs-bst',
    theme: 'complexidade',
    prompt:
      'Um catálogo precisa listar, em ordem crescente, os restaurantes com taxa de entrega entre R$ 3 e R$ 6, e novos restaurantes entram o tempo todo. Qual estrutura atende melhor essa necessidade?',
    options: [
      'Hash map indexado pela taxa, que acha cada taxa exata em O(1)',
      'Árvore binária de busca balanceada, que mantém as taxas ordenadas',
      'Pilha, empilhando cada restaurante conforme ele vai chegando',
      'Fila, guardando os restaurantes na ordem em que foram cadastrados',
    ],
    answer: 1,
    explain:
      'Uma árvore binária de busca **balanceada** mantém as chaves em ordem: inserir é O(log n) e, para uma faixa, desce-se até a taxa 3 e percorre-se em ordem até passar de 6, em O(log n + k) para k resultados. O hash map é ótimo para "dado o `id`, ache o restaurante" (O(1) em média), mas não guarda ordem: para uma faixa seria preciso olhar as n entradas. Sem balanceamento, a árvore pode degenerar em O(n) (por exemplo, inserindo taxas já em ordem).',
    whyWrong: [
      'O hash map acha uma taxa **exata** em O(1), mas não tem ordem nem busca por faixa: seria preciso olhar todas as entradas e ordenar o resultado. Ele é a escolha certa para buscar por `id`.',
      '',
      'A pilha só dá acesso ao topo (o último inserido). Não há como achar uma faixa de taxas sem desempilhar tudo.',
      'A fila só dá acesso ao primeiro elemento, na ordem de cadastro, que não tem relação com o valor da taxa.',
    ],
    review: 'leetcode:trees',
  },
  {
    id: 'complexidade-heap-prioridade',
    theme: 'complexidade',
    prompt:
      'O sistema de despacho recebe pedidos o tempo todo e, a cada instante, precisa retirar o pedido **mais urgente** (o de menor prazo de entrega). Qual estrutura faz inserção e retirada em O(log n)?',
    options: [
      'Array ordenado, inserindo cada pedido na posição certa com `splice`',
      'Fila comum (FIFO), pois os pedidos mais antigos são os mais urgentes',
      'Hash map com o prazo como chave, lendo o menor com `Math.min`',
      'Heap mínimo (min-heap), com o pedido de menor prazo sempre na raiz',
    ],
    answer: 3,
    explain:
      'O min-heap é uma árvore (guardada em um array) em que todo pai é menor ou igual aos filhos, então o menor prazo fica na raiz (olhar o menor é O(1)). Inserir e retirar o menor só "sobem" ou "descem" pela altura da árvore, que é log n: **O(log n)**. Um array ordenado lê o menor em O(1), mas inserir exige deslocar elementos, O(n). O heap é a base da fila de prioridade, do Dijkstra e dos problemas de "top k".',
    whyWrong: [
      'Achar a posição é O(log n) com busca binária, mas o `splice` desloca elementos, e inserir custa O(n). Funciona, só é mais lento que o heap.',
      'A fila respeita a ordem de chegada, não de prazo. Um pedido novo com prazo curto ficaria esperando atrás de pedidos folgados.',
      'O hash map não mantém ordem: achar o menor exige varrer todas as chaves (O(n)). Além disso, dois pedidos com o mesmo prazo colidiriam na chave.',
      '',
    ],
    review: 'leetcode:heap',
  },
  {
    id: 'complexidade-grafo-lista-matriz',
    theme: 'complexidade',
    prompt:
      'Um mapa de entregas tem 100.000 esquinas (nós) e cada esquina se liga a poucas ruas (no máximo uns 4 vizinhos). Qual representação do grafo é a mais indicada?',
    options: [
      'Lista de adjacência, que guarda só as ruas existentes e ocupa O(V + E)',
      'Matriz de adjacência, que ocupa O(V + E) e consulta qualquer rua em O(1)',
      'Matriz de adjacência, porque mapas de ruas são sempre grafos densos',
      'Lista de todas as arestas, pois acha os vizinhos de um nó em O(1)',
    ],
    answer: 0,
    explain:
      'Com poucas ruas por esquina o grafo é **esparso** (E muito menor que V²). A lista de adjacência (um `Map` de nó para a lista de vizinhos) ocupa O(V + E) e percorrer os vizinhos de um nó custa só o seu grau. Uma matriz V×V teria 10 bilhões de células para 100.000 nós, quase todas vazias. A matriz vence em grafos densos, ou quando a pergunta "existe aresta A–B?" é muito frequente e V é pequeno: aí a consulta é O(1).',
    whyWrong: [
      '',
      'A matriz V×V ocupa O(V²), não O(V + E): seriam 10 bilhões de células aqui. A consulta O(1) é verdadeira, mas não compensa o espaço neste caso.',
      'É o contrário: cada esquina liga a poucas outras, então o grafo é esparso. A matriz só compensa em grafos densos (E próximo de V²).',
      'Numa lista de arestas, achar os vizinhos de um nó exige varrer as E arestas, O(E). Ela serve para guardar as ruas, não para percorrer o grafo.',
    ],
    review: 'leetcode:graphs',
  },
]
