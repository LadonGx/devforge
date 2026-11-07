import type { ConceptQuestion } from '../types'

/** Tema "grafos": Grafos: BFS, DFS, caminho mínimo e ciclos. */
export const GRAPH_QUESTIONS: ConceptQuestion[] = [
  {
    id: 'grafos-bfs-menor-caminho',
    theme: 'grafos',
    prompt:
      'Num mapa de ruas em que todas têm o mesmo custo (1 quadra), você quer o caminho com **menos quadras** entre o restaurante e o cliente. Qual percurso encontra isso, e com qual estrutura?',
    options: [
      'DFS com pilha: o primeiro caminho encontrado até o destino já é o mais curto',
      'BFS com fila: visita por camadas, então a primeira chegada ao destino é a mais curta',
      'BFS com pilha: trocar a fila por uma pilha mantém a ordem por camadas',
      'Só Dijkstra funciona; a BFS nunca garante o menor caminho em nenhum grafo',
    ],
    answer: 1,
    explain:
      'A BFS usa uma **fila** (FIFO): visita primeiro todos os nós a 1 quadra, depois os a 2 quadras, e assim por diante. Por isso, a primeira vez que alcança o destino é pelo caminho com menos arestas. Marque os nós em `visited` para não repetir e guarde o "pai" de cada nó para reconstruir o trajeto. Custo: O(V + E).',
    whyWrong: [
      'A DFS mergulha por um ramo até o fim e pode chegar ao destino por um caminho comprido antes de testar um de 2 quadras. Ela acha **um** caminho, não o mais curto.',
      '',
      'Com pilha (LIFO) o percurso vira uma DFS: o último vizinho empilhado é o primeiro visitado, e a ordem por camadas se perde. É a fila que garante as camadas.',
      'O Dijkstra também acharia (com todos os pesos iguais a 1), mas só é necessário quando as arestas têm pesos diferentes. Sem pesos, a BFS acha o mínimo e é mais simples.',
    ],
    review: 'leetcode:graphs',
  },
  {
    id: 'grafos-dfs-componentes',
    theme: 'grafos',
    prompt:
      'Uma rede de amizades entre os `n` usuários do app é um grafo não dirigido. Você quer contar quantos **grupos isolados** (componentes conexos) existem. Qual estratégia está certa?',
    options: [
      'Rodar uma BFS ou DFS a partir do nó 0 e contar quantos nós ela visita',
      'Rodar uma DFS a partir de cada nó, zerando o `visited` antes de cada uma',
      'Contar os nós com grau 1, pois cada grupo termina em um desses nós',
      'Percorrer os nós; ao achar um não visitado, rodar DFS nele e somar 1 ao contador',
    ],
    answer: 3,
    explain:
      'Uma busca a partir de um nó visita **todo** o seu componente e o marca em `visited`. Percorra os nós de 0 a n−1: se o nó ainda não foi visitado, ele é de um grupo novo, então dispare a DFS (recursiva ou com pilha) e some 1. Nós já visitados pertencem a grupos já contados. O `visited` é compartilhado entre as buscas, e o total é O(V + E), porque cada nó e cada aresta são vistos uma vez.',
    whyWrong: [
      'Uma busca a partir do nó 0 só alcança o componente do 0. Isso dá o tamanho de **um** grupo, não o número de grupos.',
      'Zerar o `visited` a cada DFS refaz o trabalho e conta um grupo por nó (o resultado seria sempre `n`), além de custar O(V · (V + E)). O `visited` precisa ser compartilhado.',
      'Grau 1 não define grupo: um grupo pode ser um ciclo (todos com grau 2) ou um usuário sozinho (grau 0), e outro pode ter várias pontas com grau 1.',
      '',
    ],
    review: 'leetcode:graphs',
  },
  {
    id: 'grafos-dijkstra-pesos',
    theme: 'grafos',
    prompt:
      'No mapa de entregas, cada rua tem um tempo de viagem diferente (2 min, 7 min, 15 min…). Por que a BFS comum **não** serve para achar o trajeto mais rápido?',
    options: [
      'Porque a BFS minimiza o número de ruas, e menos ruas pode somar mais minutos',
      'Porque a BFS só funciona em grafos sem ciclos, e mapas de ruas têm ciclos',
      'Porque a BFS visita cada nó mais de uma vez e acaba somando tempos repetidos',
      'Porque a BFS usa uma fila, e para considerar pesos seria preciso usar uma pilha',
    ],
    answer: 0,
    explain:
      'A BFS conta **arestas**, não soma pesos. Se ir de A até B direto leva 15 min (1 rua) e passar por C leva 2 + 3 = 5 min (2 ruas), a BFS devolve a rota de 1 rua, que é a mais lenta. O Dijkstra resolve isso trocando a fila comum por uma **fila de prioridade** (heap) ordenada pelo custo acumulado, em O((V + E) log V). Ele exige pesos não negativos.',
    whyWrong: [
      '',
      'A BFS funciona em grafos com ciclos, graças ao `visited`. O problema não é o ciclo, e sim ela ignorar os pesos.',
      'Com `visited`, a BFS visita cada nó uma única vez. O defeito é outro: ela decide pela quantidade de ruas, não pela soma dos tempos.',
      'Uma pilha viraria uma DFS, que também ignora os pesos. Para pesos, usa-se uma **fila de prioridade** (heap) ordenada pelo custo acumulado: é o Dijkstra.',
    ],
    review: 'leetcode:graphs',
  },
  {
    id: 'grafos-pesos-negativos',
    theme: 'grafos',
    prompt:
      'Num grafo de custos em que algumas arestas têm peso **negativo** (um cupom abate valor ao passar de uma etapa para outra), o Dijkstra pode devolver um caminho que não é o mínimo. Por quê?',
    options: [
      'Porque o heap usado pelo Dijkstra não consegue guardar prioridades negativas, só positivas',
      'Porque pesos negativos sempre criam ciclos, e o Dijkstra não consegue lidar com ciclos',
      'Porque ele considera o custo de um nó definitivo ao retirá-lo, e uma aresta negativa pode baixá-lo depois',
      'Porque somar pesos negativos passa do limite dos números do JavaScript e gera erro',
    ],
    answer: 2,
    explain:
      'O Dijkstra é **guloso**: quando o nó de menor custo sai do heap, ele assume que nenhum outro caminho chegará mais barato até ali, o que só vale se somar arestas nunca diminui o custo (pesos ≥ 0). Exemplo: A→B custa 4 direto, e A→C custa 5, mas C→B custa −3 (total 2). O Dijkstra fecha o B com 4 antes de explorar o C. Com pesos negativos, usa-se o Bellman-Ford (O(V · E)), que ainda detecta ciclos de peso negativo.',
    whyWrong: [
      'Um heap compara números e aceita negativos sem problema. A falha está na lógica gulosa do algoritmo, não na estrutura.',
      'Ciclos de peso positivo são tratados normalmente (nó já fechado não é refeito), e peso negativo não implica ciclo. O problema é o fechamento precoce do nó.',
      '',
      'Números do JS têm faixa enorme (inteiros exatos até 2^53 − 1), então somas de custos pequenos não estouram. O erro é do algoritmo, não do tipo numérico.',
    ],
    review: 'leetcode:graphs',
  },
  {
    id: 'grafos-ciclo-dirigido',
    theme: 'grafos',
    prompt:
      'Em grafos **não dirigidos**, achar um vizinho já visitado (que não seja o pai) indica ciclo. Por que essa regra simples não vale em grafos **dirigidos** (como dependências entre tarefas)?',
    options: [
      'Porque em grafos dirigidos a DFS não tem como marcar nós como visitados durante o percurso',
      'Porque grafos dirigidos nunca têm ciclos, e por isso nenhuma verificação de ciclo é necessária',
      'Porque em grafos dirigidos qualquer vizinho já visitado é sempre o pai do nó atual na DFS',
      'Porque revisitar um nó pode ser só outro caminho até ele; ciclo é achar um nó ainda em andamento na recursão',
    ],
    answer: 3,
    explain:
      'Considere A→B, A→C, B→D e C→D. Ao chegar em D pelo C, ele já foi visitado (via B), mas não existe ciclo: são dois caminhos até D. Em grafos dirigidos, use três estados: não visitado, **em andamento** (está na pilha de recursão da DFS) e concluído. Só há ciclo quando uma aresta aponta para um nó em andamento (volta a um ancestral). Em grafos não dirigidos, as mesmas arestas A–B, A–C, B–D e C–D formariam o ciclo A–B–D–C–A.',
    whyWrong: [
      'A DFS marca nós visitados normalmente em qualquer grafo. A diferença é que "visitado" sozinho não basta: é preciso distinguir "em andamento" de "concluído".',
      'Grafos dirigidos têm ciclos sim (A→B→C→A). É justamente o que torna uma dependência circular um problema. Os que não têm ciclos são os DAGs.',
      'Nada obriga o vizinho visitado a ser o pai. No exemplo A→B, A→C, B→D, C→D, o D é alcançado por B e depois por C, sem relação de pai, e não há ciclo.',
      '',
    ],
    review: 'leetcode:graphs',
  },
  {
    id: 'grafos-ordenacao-topologica',
    theme: 'grafos',
    prompt:
      'Num curso, cada módulo tem pré-requisitos (`[a, b]` significa "faça `a` antes de `b`"). Você quer uma ordem em que todos os módulos possam ser feitos. Qual técnica resolve, e quando é impossível?',
    options: [
      'Ordenação alfabética pelo nome do módulo; é impossível se houver nomes repetidos',
      'Ordenação topológica; é impossível se houver um ciclo nos pré-requisitos',
      'BFS a partir do primeiro módulo; é impossível se um módulo tiver dois pré-requisitos',
      'Dijkstra entre todos os pares de módulos; é impossível se houver pesos iguais',
    ],
    answer: 1,
    explain:
      'A ordenação topológica gera uma ordem linear em que, para toda aresta `a → b`, o `a` vem antes do `b`. Ela só existe em grafos dirigidos **sem ciclo** (DAG): se `a` exige `b` e `b` exige `a`, ninguém começa. No algoritmo de Kahn, calcule quantos pré-requisitos cada módulo tem, enfileire os que têm 0 e, ao retirar um, reduza o contador dos seus dependentes, enfileirando os que zerarem. Se sobrar módulo sem processar, há ciclo. Custo: O(V + E).',
    whyWrong: [
      'A ordem alfabética ignora as dependências: "Async" poderia vir antes de "Promises" mesmo dependendo dela. A ordem precisa respeitar as arestas.',
      '',
      'A BFS visita por distância e não garante que todos os pré-requisitos de um módulo apareçam antes dele. Além disso, ter dois pré-requisitos é perfeitamente possível.',
      'Aqui não há distâncias nem pesos: o que importa é a precedência. O Dijkstra calcula custo mínimo, não uma ordem de dependências.',
    ],
    review: 'leetcode:graphs',
  },
  {
    id: 'grafos-complexidade-v-mais-e',
    theme: 'grafos',
    prompt:
      'Qual a complexidade de tempo desta BFS com lista de adjacência, num grafo com `V` nós e `E` arestas?',
    code: `function bfs(graph, start) {
  const visited = new Set([start])
  const queue = [start]
  let head = 0
  while (head < queue.length) {
    const node = queue[head++]
    for (const next of graph.get(node) ?? []) {
      if (!visited.has(next)) {
        visited.add(next)
        queue.push(next)
      }
    }
  }
  return visited
}`,
    options: ['O(V · E)', 'O(V²)', 'O(V + E)', 'O(E log V)'],
    answer: 2,
    explain:
      'Cada nó entra na fila uma única vez (o `visited` impede repetição), então há no máximo V retiradas. Para cada nó retirado, o `for` percorre só os **seus** vizinhos, e a soma do tamanho de todas essas listas é E. Total: **O(V + E)**. O laço interno não é "V vezes E": o trabalho somado sobre todas as listas é E.',
    whyWrong: [
      'Multiplicar supõe que cada um dos V nós varre as E arestas inteiras. Cada nó só varre as suas arestas, e a soma delas é E.',
      'O(V²) é o custo com matriz de adjacência (cada nó varre uma linha de V células). Com lista de adjacência, é V + E.',
      '',
      'O(E log V) é típico do Dijkstra com heap. A BFS usa uma fila comum com operações O(1), sem o fator log.',
    ],
    review: 'leetcode:graphs',
  },
  {
    id: 'grafos-dfs-recursao-profunda',
    theme: 'grafos',
    prompt:
      'Esta DFS recursiva funciona em testes pequenos, mas num grafo em forma de cadeia com 200.000 nós lança `RangeError: Maximum call stack size exceeded`. Qual a correção mais adequada?',
    code: `function dfs(graph, node, visited) {
  visited.add(node)
  for (const next of graph.get(node) ?? []) {
    if (!visited.has(next)) dfs(graph, next, visited)
  }
}`,
    options: [
      'Trocar a recursão por um laço com uma pilha explícita (array com `push`/`pop`)',
      'Trocar o `Set` do `visited` por um array, que ocupa menos espaço na pilha',
      'Remover o `visited`, já que a pilha de chamadas impede visitar um nó duas vezes',
      'Envolver a chamada em `try/catch` e repetir a chamada quando o erro acontecer',
    ],
    answer: 0,
    explain:
      'Cada chamada recursiva ocupa um quadro na **pilha de chamadas** do JS, que tem limite (algumas dezenas de milhares de quadros, variando conforme o motor). Uma cadeia de 200.000 nós aninha chamadas demais. A versão iterativa troca a pilha de chamadas por uma pilha própria (um array): empilha o início, e a cada volta faz `pop`, pula se já visitado, marca e empilha os vizinhos. A ordem de custo continua O(V + E), mas o limite passa a ser a memória, não a profundidade de chamadas.',
    whyWrong: [
      '',
      'O tipo do `visited` não muda a profundidade da recursão: o estouro vem do número de chamadas aninhadas. E o `Set` continua sendo a melhor opção (`has`/`add` em O(1)).',
      'Sem o `visited`, a DFS voltaria a nós já vistos e, em grafos com ciclo, entraria em recursão infinita. Também não reduz a profundidade da cadeia.',
      'O erro vem do estouro da pilha de chamadas; repetir a mesma chamada falha no mesmo ponto. É preciso mudar o algoritmo para não aninhar chamadas.',
    ],
    review: 'js-fundamentos:recursao',
  },
]
