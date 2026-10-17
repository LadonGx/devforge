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

## O que já existe (feature 1)

- **Vitrine** com os módulos separados por volume (JavaScript → TypeScript → Node/Web → Arquitetura → React + CSS) e **trilhas sugeridas**.
- **Módulo LeetCode / NeetCode, parte 1**: 5 padrões (Arrays & Hashing, Two Pointers, Sliding Window, Stack, Binary Search), cada um com aula + animação, e 17 problemas.
- Em cada problema:
  - editor JS ou TS (Ctrl+Enter roda os testes);
  - testes rodando num Web Worker isolado (loop infinito não trava a página);
  - diff visual do caso que falhou + diagnóstico em português ("retornou undefined", "tamanho diferente"...);
  - teste de desempenho com entrada grande (Time Limit Exceeded quando a solução é O(n²));
  - **visualizador passo a passo** do seu código e da solução de referência: linha atual no editor, variáveis que mudaram, ponteiros (`i`, `l`, `r`, `lo`, `hi`, `mid`...) desenhados sob o array, janela `[l, r]`, Map/Set como tabela, pilha na vertical, pilha de chamadas para recursão;
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
  components/viz/    visualizador (arrays, matriz, Map, Set, pilha, frames)
  content/
    modules.ts         catálogo de módulos, volumes e trilhas
    leetcode/          padrões (aulas) e problemas
  pages/             telas (vitrine, trilhas, módulo, aula, problema)
scripts/validate-content.ts
```

## Como adicionar um problema

1. Crie o objeto `Problem` em `src/content/leetcode/problems/<padrão>.ts` (enunciado, testes, dicas, explicação, solução JS e TS, `perf` opcional).
2. Registre em `src/content/leetcode/index.ts` e adicione o `id` na lista `problems` do padrão em `patterns.ts`.
3. Rode `npm run validate`.

> Os geradores de `perf.gen` são enviados como texto para o worker: precisam ser autocontidos (não podem usar variáveis de fora da função).

## Próximas features

LeetCode parte 2 (listas ligadas, árvores, heap, backtracking, grafos, DP) → Fundamentos de JS → Assincronismo (event loop visual) → TypeScript com checagem de tipos → HTTP/REST, JWT, OAuth2 → SOLID, Clean Code, Clean Architecture → React + CSS.
