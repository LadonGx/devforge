# DevForge · treino visual de programação

Sistema de estudo com **explicação por partes**, **prática com testes** e **visualização passo a passo do seu próprio código** (estilo Python Tutor), focado na stack JavaScript / TypeScript / Node / React.

## Como rodar

Requisitos: Node.js 20+.

```bash
npm install
npm run dev
```

Abra o endereço que aparecer no terminal (normalmente http://localhost:5173).

| Comando | O que faz |
| --- | --- |
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | checa os tipos e gera a versão de produção em `dist/` |
| `npm run validate` | roda todas as soluções de referência contra os testes de cada problema (use ao criar conteúdo) |

O progresso (problemas resolvidos, aulas concluídas e o código que você escreveu) fica salvo no `localStorage` do navegador.

## O que já existe

- **Vitrine** com os módulos separados por volume (JavaScript → TypeScript → Node/Web → Arquitetura → React + CSS) e **trilhas sugeridas**.
- **Guia: rumo à primeira vaga júnior** (`/guia`): 10 etapas que intercalam as aulas de JavaScript e Async com os padrões do LeetCode (cada padrão entra logo depois da aula que ele usa), com uma **prova** no fim de cada etapa e um checklist final de candidatura. As etapas dos módulos que ainda não existem aparecem como "em breve".
- **Provas** (`/provas`): 5 provas (etapas 1 a 5) com 4 tipos de questão:
  - múltipla escolha (conceitos e boas práticas), com explicação de cada resposta;
  - **prever a saída** do console (a resposta é conferida com a execução real pelo `npm run validate`);
  - **código com testes** (nota proporcional aos testes que passam, inclusive testes escondidos; depois dá para abrir no editor com visualizador);
  - **discursiva de entrevista**, com resposta modelo e checklist para autoavaliação.
  Nota mínima de 70% (não bloqueia o guia, a prova fica marcada como pendente), tempo sugerido, rascunho salvo no navegador e uma seção "O que revisar" com as aulas dos assuntos em que você errou.
- **Fundamentos de JavaScript** (`/js`): 17 aulas e 53 exercícios, do zero ao avançado, em 4 partes: primeiros passos (variáveis, decisões, loops, funções, strings), dados (arrays, map/filter/reduce, objetos, Map e Set), como o JS pensa (coerção, escopo e closures, `this`, referências, sintaxe moderna) e indo além (classes, erros, recursão). Cada aula começa com uma **analogia do dia a dia**, tem exemplos animados, perguntas rápidas, dicas de **como o assunto cai na entrevista**, um **laboratório de coerção** e um **pipeline de arrays** animado.
- **Assincronismo** (`/async`): 5 aulas e 12 exercícios: event loop, callbacks, Promises, async/await e concorrência (`Promise.all`, `allSettled`, timeout, limite de concorrência, debounce). As aulas têm um **simulador do event loop** (call stack, Web APIs, fila de microtasks, fila de macrotasks e console, passo a passo) e uma **linha do tempo** sequencial × paralelo. No visualizador, cada `await` aparece como "a função sai da pilha" e "volta para a pilha", e os testes medem o tempo para conferir se o código roda em paralelo.
- **Módulo LeetCode / NeetCode** com 11 padrões e 37 problemas, cada padrão com aula + animação:
  - parte 1: Arrays & Hashing, Two Pointers, Sliding Window, Stack, Binary Search;
  - parte 2: Linked List, Trees, Heap / Priority Queue, Backtracking, Graphs, 1-D DP.
- `ListNode`, `TreeNode`, `MinHeap` e `MaxHeap` já disponíveis no editor (como no LeetCode). Entradas no formato do LeetCode (`[1,2,3]`, árvores em ordem de nível) são convertidas automaticamente.
- Problemas de **design** (classes com várias operações, ex.: Kth Largest in a Stream) com tabela de operações esperado × recebido.
- Em cada problema:
  - editor JS ou TS (Ctrl+Enter roda os testes);
  - testes rodando num Web Worker isolado (loop infinito não trava a página);
  - diff visual do caso que falhou + diagnóstico em português ("retornou undefined", "tamanho diferente"...);
  - teste de desempenho com entrada grande (Time Limit Exceeded quando a solução é O(n²));
  - **visualizador passo a passo** do seu código (variáveis de closure aparecem com ↑ e variáveis que apontam para o mesmo objeto são marcadas como "mesma referência") e da solução de referência: linha atual no editor, variáveis que mudaram, ponteiros (`i`, `l`, `r`, `lo`, `hi`, `mid`...) desenhados sob o array, janela `[l, r]`, Map/Set como tabela, pilha na vertical, listas ligadas com setas, árvores desenhadas, heap como árvore, fila de BFS e a **árvore de chamadas** da recursão (backtracking, DFS, memoização);
  - dicas progressivas e solução explicada (intuição, passo a passo, complexidade, erros comuns).

## Estrutura

```
src/
  engine/            motor de execução
    runner.ts          API usada pela interface (testes, trace, desempenho)
    runner.worker.ts   executa o código do usuário isolado
    instrument.ts      instrumenta o código (acorn) para gerar o passo a passo
    serialize.ts       snapshot de qualquer valor JS para o visualizador
    compare.ts         comparação de resultados (exata, sem ordem...)
  components/viz/    visualizador (arrays, matriz, Map, Set, pilha, listas, árvores, heap, chamadas)
  components/widgets/ quiz, laboratório de coerção, pipeline de arrays, event loop, linha do tempo
  lib/exam.ts        correção das provas e rascunho salvo
  lib/guide.ts       status e próximo passo do guia
  content/
    modules.ts         catálogo de módulos, volumes e trilhas
    courses.ts         registro dos cursos (rotas, aulas, exercícios)
    js/                Fundamentos de JS (aulas e exercícios)
    async/             Assincronismo (aulas e exercícios)
    guide.ts           etapas do guia
    exams/             provas (uma por etapa)
    leetcode/          padrões (aulas) e problemas
  pages/             telas (vitrine, guia, provas, trilhas, módulo, aula, problema)
scripts/validate-content.ts
```

## Como adicionar conteúdo

Os módulos com aulas e exercícios são **cursos** registrados em `src/content/courses.ts` (hoje: `js-fundamentos` em `src/content/js/`, `js-async` em `src/content/async/` e `leetcode` em `src/content/leetcode/`).

1. Crie o objeto `Problem` (enunciado, testes, dicas, explicação, solução JS e TS, `perf` opcional) no arquivo de problemas do curso.
2. Registre no `index.ts` do curso e adicione o `id` na lista `problems` da aula/padrão.
3. Rode `npm run validate`.

Para testar funções de alta ordem, closures ou imutabilidade, use `io.harness`: o código de uma função `(funcaoDoUsuario, ...entrada) => resultado` que monta o cenário do teste (veja `src/content/js/problems1.ts`). O harness pode ser `async` (veja `src/content/async/problems.ts`).

Cenários do bloco `eventloop` são conferidos pelo `npm run validate`: a saída final do simulador precisa ser igual à do JavaScript real.

> Os geradores de `perf.gen` são enviados como texto para o worker: precisam ser autocontidos (não podem usar variáveis de fora da função).

### Provas

Cada prova fica em `src/content/exams/provaN.ts` e é registrada em `src/content/exams/index.ts`. O campo `topic` de cada questão (`"idDoCurso:idDaAula"`) liga a questão à aula da seção "O que revisar". Nas questões de "prever a saída", imprima só valores primitivos: o `npm run validate` roda o código de verdade e confere com `expected`.

## Próximas features

TypeScript com checagem de tipos → HTTP/REST, JWT, OAuth2 → SOLID, Clean Code, Clean Architecture → React + CSS.
