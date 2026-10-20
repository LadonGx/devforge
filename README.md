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
- **Fundamentos de JavaScript** (`/js`): 7 aulas e 21 exercícios: tipos e coerção, escopo/hoisting/closures, `this` e bind, métodos de array, objetos/referências/imutabilidade, Map e Set, desestruturação/spread/`?.`/`??`. As aulas têm perguntas rápidas, um **laboratório de coerção** (mostra cada regra que o `==` e o `+` aplicam) e um **pipeline de arrays** animado (map → filter → reduce elemento por elemento).
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
  components/widgets/ quiz, laboratório de coerção, pipeline de arrays
  content/
    modules.ts         catálogo de módulos, volumes e trilhas
    courses.ts         registro dos cursos (rotas, aulas, exercícios)
    js/                Fundamentos de JS (aulas e exercícios)
    leetcode/          padrões (aulas) e problemas
  pages/             telas (vitrine, trilhas, módulo, aula, problema)
scripts/validate-content.ts
```

## Como adicionar conteúdo

Os módulos com aulas e exercícios são **cursos** registrados em `src/content/courses.ts` (hoje: `js-fundamentos` em `src/content/js/` e `leetcode` em `src/content/leetcode/`).

1. Crie o objeto `Problem` (enunciado, testes, dicas, explicação, solução JS e TS, `perf` opcional) no arquivo de problemas do curso.
2. Registre no `index.ts` do curso e adicione o `id` na lista `problems` da aula/padrão.
3. Rode `npm run validate`.

Para testar funções de alta ordem, closures ou imutabilidade, use `io.harness`: o código de uma função `(funcaoDoUsuario, ...entrada) => resultado` que monta o cenário do teste (veja `src/content/js/problems1.ts`).

> Os geradores de `perf.gen` são enviados como texto para o worker: precisam ser autocontidos (não podem usar variáveis de fora da função).

## Próximas features

Assincronismo (event loop visual) → TypeScript com checagem de tipos → HTTP/REST, JWT, OAuth2 → SOLID, Clean Code, Clean Architecture → React + CSS.
