/**
 * Guia "Primeira vaga júnior": etapas que intercalam aulas de JavaScript,
 * assincronismo e padrões de LeetCode, com uma prova no fim de cada etapa.
 */

export type GuideStep =
  /** aula + exercícios de um curso (JS, Async) ou padrão do LeetCode */
  | { kind: 'unit'; course: string; unit: string; why?: string }
  /** prova da etapa */
  | { kind: 'exam'; exam: string }
  /** módulo que ainda não existe */
  | { kind: 'soon'; module: string; label: string; why?: string }
  /** item de checklist marcado à mão (preparação para candidatura) */
  | { kind: 'check'; id: string; label: string; why?: string }

export interface GuideStage {
  id: string
  title: string
  /** o que você consegue fazer ao terminar a etapa */
  goal: string
  steps: GuideStep[]
}

export const STAGES: GuideStage[] = [
  {
    id: 'base',
    title: 'Etapa 1 · Base da linguagem',
    goal: 'Escrever funções pequenas com variáveis, decisões, loops e strings: o nível do aquecimento de qualquer live coding (FizzBuzz, palíndromo).',
    steps: [
      { kind: 'unit', course: 'js-fundamentos', unit: 'variaveis' },
      { kind: 'unit', course: 'js-fundamentos', unit: 'condicionais' },
      { kind: 'unit', course: 'js-fundamentos', unit: 'loops' },
      { kind: 'unit', course: 'js-fundamentos', unit: 'funcoes' },
      { kind: 'unit', course: 'js-fundamentos', unit: 'strings' },
      { kind: 'exam', exam: 'prova-1' },
    ],
  },
  {
    id: 'dados',
    title: 'Etapa 2 · Trabalhando com dados',
    goal: 'Manipular listas e objetos com fluência e resolver os primeiros problemas de LeetCode com hash map e dois ponteiros.',
    steps: [
      { kind: 'unit', course: 'js-fundamentos', unit: 'arrays' },
      { kind: 'unit', course: 'js-fundamentos', unit: 'arrays-metodos' },
      { kind: 'unit', course: 'js-fundamentos', unit: 'objetos' },
      { kind: 'unit', course: 'js-fundamentos', unit: 'map-set' },
      { kind: 'unit', course: 'leetcode', unit: 'arrays-hashing', why: 'Usa direto o Map e o Set da aula anterior.' },
      { kind: 'unit', course: 'leetcode', unit: 'two-pointers', why: 'Índices de array, como no palíndromo da etapa 1.' },
      { kind: 'exam', exam: 'prova-2' },
    ],
  },
  {
    id: 'mente-js',
    title: 'Etapa 3 · Como o JavaScript pensa',
    goal: 'Responder as perguntas conceituais mais comuns (coerção, closures, this, referências) e dominar janela deslizante e pilha.',
    steps: [
      { kind: 'unit', course: 'js-fundamentos', unit: 'tipos-coercao' },
      { kind: 'unit', course: 'js-fundamentos', unit: 'escopo-closures' },
      { kind: 'unit', course: 'leetcode', unit: 'sliding-window', why: 'Dois ponteiros + Map: junta as etapas anteriores.' },
      { kind: 'unit', course: 'js-fundamentos', unit: 'this-funcoes' },
      { kind: 'unit', course: 'js-fundamentos', unit: 'objetos-referencias' },
      { kind: 'unit', course: 'leetcode', unit: 'stack', why: 'Arrays como pilha (push/pop).' },
      { kind: 'unit', course: 'js-fundamentos', unit: 'sintaxe-moderna' },
      { kind: 'exam', exam: 'prova-3' },
    ],
  },
  {
    id: 'alem',
    title: 'Etapa 4 · Classes, erros e recursão',
    goal: 'Modelar com classes, tratar erros como em uma API de verdade e usar recursão em listas ligadas e árvores.',
    steps: [
      { kind: 'unit', course: 'js-fundamentos', unit: 'classes' },
      { kind: 'unit', course: 'leetcode', unit: 'binary-search' },
      { kind: 'unit', course: 'js-fundamentos', unit: 'erros' },
      { kind: 'unit', course: 'js-fundamentos', unit: 'recursao' },
      { kind: 'unit', course: 'leetcode', unit: 'linked-list', why: 'Nós são objetos ligados por referência (etapa 3) e a reversão pode ser recursiva.' },
      { kind: 'unit', course: 'leetcode', unit: 'trees', why: 'DFS é recursão pura.' },
      { kind: 'exam', exam: 'prova-4' },
    ],
  },
  {
    id: 'async',
    title: 'Etapa 5 · Assincronismo',
    goal: 'Explicar o event loop, prever a ordem da saída e escrever código com Promises e async/await como no dia a dia de um back-end Node.',
    steps: [
      { kind: 'unit', course: 'js-async', unit: 'event-loop' },
      { kind: 'unit', course: 'js-async', unit: 'callbacks' },
      { kind: 'unit', course: 'js-async', unit: 'promises' },
      { kind: 'unit', course: 'leetcode', unit: 'heap' },
      { kind: 'unit', course: 'js-async', unit: 'async-await' },
      { kind: 'unit', course: 'js-async', unit: 'concorrencia' },
      { kind: 'unit', course: 'leetcode', unit: 'backtracking', why: 'Recursão + árvore de chamadas, revisando a etapa 4.' },
      { kind: 'exam', exam: 'prova-5' },
    ],
  },
  {
    id: 'ts',
    title: 'Etapa 6 · TypeScript',
    goal: 'Tipar funções, objetos e código assíncrono, que é o que as vagas de React e Node pedem hoje.',
    steps: [
      { kind: 'soon', module: 'ts-tipagem', label: 'Tipagem com TypeScript' },
      { kind: 'unit', course: 'leetcode', unit: 'graphs', why: 'BFS/DFS em grade e listas de adjacência.' },
      { kind: 'soon', module: 'ts-tipagem', label: 'Prova da etapa 6' },
    ],
  },
  {
    id: 'web',
    title: 'Etapa 7 · Web, APIs e autenticação',
    goal: 'Entender o que acontece numa requisição HTTP, desenhar uma API REST e autenticar com JWT e OAuth2.',
    steps: [
      { kind: 'soon', module: 'http', label: 'Rede & HTTP' },
      { kind: 'soon', module: 'rest', label: 'REST API' },
      { kind: 'unit', course: 'leetcode', unit: 'dp-1d', why: 'Memoização: a recursão da etapa 4 com cache.' },
      { kind: 'soon', module: 'jwt', label: 'JWT' },
      { kind: 'soon', module: 'oauth2', label: 'OAuth2 & OpenID Connect' },
      { kind: 'soon', module: 'http', label: 'Prova da etapa 7' },
    ],
  },
  {
    id: 'qualidade',
    title: 'Etapa 8 · Código profissional',
    goal: 'Escrever código que outra pessoa entende e consegue mudar: o que diferencia um júnior que só "faz funcionar".',
    steps: [
      { kind: 'soon', module: 'clean-code', label: 'Clean Code' },
      { kind: 'soon', module: 'solid', label: 'SOLID' },
      { kind: 'soon', module: 'clean-arch', label: 'Clean Architecture' },
      { kind: 'soon', module: 'clean-code', label: 'Prova da etapa 8' },
    ],
  },
  {
    id: 'front',
    title: 'Etapa 9 · Front-end com React',
    goal: 'Montar interfaces com componentes, estado e efeitos, e o CSS que sustenta o layout.',
    steps: [
      { kind: 'soon', module: 'css', label: 'CSS para React' },
      { kind: 'soon', module: 'react', label: 'React' },
      { kind: 'soon', module: 'react', label: 'Prova da etapa 9' },
    ],
  },
  {
    id: 'pronto',
    title: 'Etapa 10 · Pronto para aplicar',
    goal: 'Transformar o estudo em candidatura: revisar os pontos fracos e ter o que mostrar.',
    steps: [
      {
        kind: 'check',
        id: 'revisar-provas',
        label: 'Refazer as provas com nota abaixo de 85%',
        why: 'Use a seção "O que revisar" de cada prova para escolher as aulas.',
      },
      {
        kind: 'check',
        id: 'leetcode-sem-dica',
        label: 'Resolver de novo, sem dicas, 1 problema de cada padrão do LeetCode',
        why: 'Fale em voz alta enquanto resolve, como no live coding.',
      },
      {
        kind: 'check',
        id: 'projeto-github',
        label: 'Ter 1 ou 2 projetos no GitHub com README (o que faz, stack, como rodar, prints)',
        why: 'O recrutador olha o README antes do código.',
      },
      {
        kind: 'check',
        id: 'pitch-projeto',
        label: 'Saber explicar um projeto seu em 2 minutos: problema, decisões técnicas e o que faria diferente',
      },
      {
        kind: 'check',
        id: 'discursivas',
        label: 'Treinar em voz alta as respostas das questões discursivas das provas',
      },
    ],
  },
]

/** Chave usada no progresso para os itens de checklist do guia. */
export const checkKey = (id: string) => `guia:${id}`
