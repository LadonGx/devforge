import type { Course } from '../types'

/** Seções do treino. A ordem é a da prova (problemas, RAG, API, conceitos, SQL e o simulado). */
export type IfoodSectionId = 'problemas' | 'rag' | 'api' | 'conceitos' | 'sql' | 'simulado'

export interface IfoodSection {
  id: IfoodSectionId
  title: string
  icon: string
  /** uma linha para o card */
  short: string
  /** parágrafo da página da seção */
  summary: string
  /** como o tema aparece no teste do HackerRank */
  inTest: string
  /** o que a seção vai ter (aparece enquanto ela estiver em construção) */
  planned: string[]
  /** temas que a seção cobre, em chips */
  topics: string[]
}

export const IFOOD_SECTIONS: IfoodSection[] = [
  {
    id: 'problemas',
    title: 'Resolução de problemas',
    icon: '{ }',
    short: 'Problemas no formato HackerRank, com testes visíveis e ocultos.',
    summary:
      'Problemas originais do fácil ao médio, na ordem dos temas que as empresas mais cobram no HackerRank. Cada um tem enunciado com entrada, saída e restrições, testes visíveis e ocultos (com os casos de borda) e, no fim, a solução explicada passo a passo com a complexidade.',
    inTest: 'Uma questão 100% de código: você só vê alguns testes, e a nota vem dos testes ocultos.',
    planned: [
      '10 a 12 problemas originais: arrays, hash map, ordenação, strings, guloso, busca binária, DP básica, pilha e fila, BFS e DFS',
      'Testes visíveis e ocultos, com casos de borda (vazio, um elemento, repetidos, limites)',
      'Execução isolada num Web Worker, com limite de tempo para pegar loop infinito',
      'Explicação visual da solução e do Big O, com link para o padrão do NeetCode no DevForge',
    ],
    topics: ['Arrays', 'Hash map', 'Ordenação', 'Strings', 'Guloso', 'Busca binária', 'DP', 'Pilha e fila', 'BFS e DFS'],
  },
  {
    id: 'rag',
    title: 'RAG na prática',
    icon: '⌕',
    short: 'O pipeline de RAG por dentro, implementado por você em TypeScript.',
    summary:
      'Como um assistente responde com base nos seus documentos: dividir o texto em pedaços, transformar cada pedaço em vetor, achar os mais parecidos com a pergunta e montar o prompt com esse contexto. Você implementa cada etapa e vê o pipeline animado.',
    inTest: 'Um candidato relatou uma questão de implementar um RAG. No HackerRank, a entrada tem `context` e `question`, e a saída tem `reasoning` e `response`.',
    planned: [
      'Aula visual do pipeline: chunking, embeddings, similaridade de cosseno, top-k e montagem do prompt',
      'Exercícios em TypeScript: chunk(), cosineSimilarity(), topK() e buildPrompt()',
      'Embeddings com TF-IDF calculado no navegador; depois, opcional, embeddings reais com transformers.js',
      'Geração opcional com a sua chave do Groq, guardada só neste navegador',
      'Exercício no formato do HackerRank (context + question → reasoning + response), com avaliação',
    ],
    topics: ['Chunking', 'Embeddings', 'TF-IDF', 'Cosseno', 'Top-k', 'Prompt'],
  },
  {
    id: 'api',
    title: 'Consumo de API REST',
    icon: '⇄',
    short: 'Funções assíncronas contra uma API paginada simulada.',
    summary:
      'A questão de API do HackerRank quase sempre é a mesma ideia: buscar dados de uma API paginada, juntar as páginas e responder uma pergunta sobre eles. Aqui a API roda no próprio navegador, e uma linha do tempo mostra cada requisição que o seu código fez.',
    inTest: 'Uma questão de REST API: a resposta vem em páginas (`page`, `per_page`, `total`, `total_pages`, `data`).',
    planned: [
      'API simulada local, no formato paginado do HackerRank',
      '6 a 8 exercícios: todas as páginas, filtrar e agregar, combinar duas rotas, erro HTTP e nova tentativa no 429',
      'Linha do tempo de cada requisição: página pedida, status e tempo',
    ],
    topics: ['Paginação', 'async / await', 'Promise.all', 'Status HTTP', 'Retry no 429'],
  },
  {
    id: 'conceitos',
    title: 'Conceitos',
    icon: '?',
    short: 'Banco de questões de alternativa, com o porquê de cada resposta.',
    summary:
      'As questões de alternativa do teste cobrem o básico de computação e de IA aplicada. Cada questão explica por que a certa está certa e por que cada errada está errada: é aí que o conceito fixa.',
    inTest: 'Questões de alternativa sobre computação: grafos, algoritmos, estruturas de dados e afins.',
    planned: [
      'Pelo menos 40 questões de múltipla escolha, com filtro por tema',
      'Explicação da certa e de cada alternativa errada',
      'Temas: Big O e estruturas de dados, grafos, ordenação e busca, banco de dados, HTTP e REST, IA aplicada',
    ],
    topics: ['Big O', 'Estruturas de dados', 'Grafos', 'Ordenação', 'Banco de dados', 'HTTP', 'IA aplicada'],
  },
  {
    id: 'sql',
    title: 'SQL',
    icon: '▦',
    short: 'PostgreSQL de verdade no navegador, num banco de delivery.',
    summary:
      'Consultas num banco de delivery (clientes, restaurantes, pedidos, itens, entregadores e avaliações) rodando em PostgreSQL dentro do navegador. A correção compara o seu resultado com o de uma consulta de referência, e o visual mostra as tabelas e quais linhas se combinam nos JOINs.',
    inTest: 'Uma questão de SQL, em geral com JOIN, agregação e às vezes funções de janela.',
    planned: [
      'Banco PostgreSQL (PGlite) rodando no navegador, sem servidor',
      'Schema de delivery com dados suficientes para as consultas fazerem sentido',
      '12 a 15 exercícios em três níveis: básico, intermediário (JOINs, HAVING, subconsultas, UNION) e avançado (janela e CTE)',
      'Correção automática contra uma consulta de referência, ignorando a ordem quando não há ORDER BY',
      'Visual das tabelas envolvidas e das linhas que se combinam no JOIN',
    ],
    topics: ['SELECT e WHERE', 'Agregação', 'JOINs', 'GROUP BY / HAVING', 'Subconsultas', 'Janela', 'CTE'],
  },
  {
    id: 'simulado',
    title: 'Simulado',
    icon: '⏱',
    short: 'Prova cronometrada no formato do teste real.',
    summary:
      'Treine nas condições da prova: cronômetro, sem dicas e sem ver a solução até o fim. No final, um relatório com a nota por área, o tempo gasto em cada questão e o que revisar no DevForge.',
    inTest: 'O teste é feito no HackerRank com a tela gravada, sem poder usar IA nem consultar nada.',
    planned: [
      '"Formato Software Engineer": 1h15, uma questão de problemas, uma de SQL e uma de API REST, sem refazer',
      '"Formato iFood": 90 minutos, as 3 questões acima, 10 de alternativa e, opcional, uma de RAG',
      'Modo livre com tempo configurável, misturando todas as seções',
      'Relatório com nota por área, tempo por questão e links para revisar',
    ],
    topics: ['Cronômetro', 'Sem dicas', 'Nota por área', 'Tempo por questão'],
  },
]

export const ifoodSection = (id: string) => IFOOD_SECTIONS.find((s) => s.id === id)
export const ifoodSectionPath = (id: IfoodSectionId) => `/ifood/${id}`

/**
 * Temas mais cobrados pelas empresas, segundo o Interview Preparation Kit do HackerRank.
 * É a ordem de prioridade dos problemas da seção 1.
 */
export const HACKERRANK_TOPICS = [
  { label: 'Arrays', pct: 70 },
  { label: 'Dicionários e hash maps', pct: 40 },
  { label: 'Ordenação', pct: 40 },
  { label: 'Manipulação de strings', pct: 40 },
  { label: 'Algoritmos gulosos', pct: 31 },
  { label: 'Busca', pct: 30 },
  { label: 'Programação dinâmica', pct: 27 },
  { label: 'Pilhas e filas', pct: 17 },
  { label: 'Grafos', pct: 15 },
  { label: 'Árvores', pct: 12 },
]

/** Formatos de referência da prova (certificações do HackerRank). */
export const TEST_FORMATS = [
  { title: 'Software Engineer', detail: '1h15 · 3 questões: resolução de problemas, SQL e REST API', main: true },
  { title: 'REST API (Intermediate)', detail: '1h30 · 2 questões' },
  { title: 'Problem Solving (Intermediate)', detail: '1h30 · 2 questões' },
  { title: 'SQL (Intermediate)', detail: '35 min · 2 questões' },
]

/**
 * O treino também é um curso: as aulas (RAG, API) usam a UnitPage e os exercícios de código
 * usam a ProblemPage, nas rotas /ifood/aula/:id e /ifood/p/:id. A página inicial é própria (IfoodHome).
 */
export const IFOOD: Course = {
  id: 'ifood',
  title: 'Treinamento iFood GenAI',
  basePath: '/ifood',
  unitSegment: 'aula',
  unitLabel: 'Aula',
  volumeLabel: 'Processos seletivos',
  intro: '',
  how: [],
  units: [],
  problems: [],
}
