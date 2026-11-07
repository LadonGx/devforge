# DevForge · guia para agentes

## Objetivo

Sistema pessoal de estudos para a **primeira vaga júnior full stack**. Só a stack do autor: **JavaScript, TypeScript, Node e React** (nada de outras linguagens, nem em exemplos). O aprendizado é a parte mais importante: toda feature e todo conteúdo devem ajudar a entender e fixar, não só "ter mais coisa".

Stack do app: React 19 + Vite 8 + TypeScript 6, `HashRouter` (rotas em `/#/...`), sem backend: o progresso fica no `localStorage`.

## Comandos

| Comando | O que faz |
| --- | --- |
| `npm run dev` | servidor de desenvolvimento (Vite, normalmente http://localhost:5173) |
| `npm run typecheck` | `tsc -b` em app, scripts e e2e |
| `npm run validate` | roda **todas** as soluções de referência (JS e TS, normal e instrumentado), os demos das aulas, os cenários do event loop contra o JS real e as saídas das provas |
| `npm run build` | typecheck + build de produção em `dist/` |
| `npm run lint` | oxlint (`.oxlintrc.json`) |
| `npm run e2e` | Playwright (chromium) em `e2e/`; sobe o Vite na porta 5180 sozinho (ou reaproveita um já rodando) |

Rodar só uma parte do e2e: `npx playwright test lessons`, `npx playwright test exercises -g two-sum`. Se mais de um agente rodar e2e ao mesmo tempo, cada um usa uma pasta própria: `--output test-results/<nome>` (senão um apaga os artefatos do outro).

## Arquitetura

```
src/
  engine/              motor de execução do código do aluno
    runner.ts            API da interface: prepare, runTests, runTrace, runPerf (sucrase transpila TS → JS)
    runner.worker.ts     executa o código num Web Worker isolado (loop infinito não trava a página)
    instrument.ts        instrumenta o código com acorn/acorn-walk para gerar o passo a passo do visualizador
    serialize.ts         snapshot de qualquer valor JS para o visualizador (V)
    compare.ts           comparação de resultados (exata, sem ordem...)
    ds.ts                ListNode, TreeNode, MinHeap, MaxHeap (GLOBALS no editor), build/convert de listas e árvores, runDesign
    types.ts             TestCase, IOSpec, TraceResult, Step...
  content/
    types.ts             Block, Pattern (aula), Problem, Course, Exam, ExamQuestion
    courses.ts           registro dos cursos (js-fundamentos, js-async, leetcode) + unitPath/problemPath/lessonKey
    modules.ts           catálogo da vitrine (volumes, módulos "em breve") e trilhas
    guide.ts             etapas do guia "rumo à primeira vaga" (unit / exam / soon / check)
    exams/               provaN.ts + index.ts (EXAMS, topicRef, EXAM_COURSE)
    js/                  Fundamentos de JS: units*.ts (aulas), problems*.ts (exercícios), index.ts (ORDER, partes, ENRICH), helpers.ts (starter)
    async/               Assincronismo: units.ts, problems.ts
    leetcode/            patterns.ts, patterns2.ts (aulas dos padrões) e problems/ (um arquivo por padrão)
  lib/
    progress.ts          estado salvo (`devforge:progress:v1`): solved, lessons, code[`${id}:${lang}`], lang, exams
    exam.ts              correção das provas (nota, discursivas por checklist) e rascunho salvo
    guide.ts             status de cada passo do guia e próximo passo
    stats.ts             progresso por aula/módulo/trilha e "próxima ação" da vitrine
    theme.ts             tema claro/escuro
  pages/               Home (vitrine), GuidePage, ExamPage, Trails, CourseHome, UnitPage, ProblemPage, ModuleSoon
  components/
    LessonBlocks.tsx     renderiza os blocos de uma aula
    viz/                 visualizador passo a passo (arrays com ponteiros, Map/Set, pilha, listas, árvores, heap, árvore de chamadas)
    widgets/             Quiz, CoercionLab, Pipeline, EventLoop (+ eventLoopSim.ts), Timeline
scripts/validate-content.ts   o `npm run validate`
e2e/                          testes Playwright (fixtures.ts + um spec por área)
```

## Como criar conteúdo

### Aula (`Pattern`)

`{ id, title, short, summary, color, lesson: Block[], problems: string[] }`. Blocos disponíveis (`src/content/types.ts`):

- `analogy` (título + md): **toda aula começa com uma**, algo do dia a dia;
- `text`, `code`, `compare` (lado a lado), `signals` (sinais no enunciado);
- `demo`: código que roda no visualizador (`code`, `fnName`, `input`, `io?`);
- `quiz`: pergunta rápida com `options`, `answer` e `explain`;
- `callout` com `tone: 'tip' | 'warn' | 'info' | 'interview'` (`interview` aparece como "Na entrevista");
- widgets: `coercion`, `pipeline` (map/filter/reduce animado), `eventloop` (cenário com `program`; `prelude` só para o validate), `timeline` (sequencial × paralelo).

Registre a aula no curso (em `js/index.ts` ela também entra no `ORDER`) e coloque os ids dos exercícios em `problems`.

### Exercício (`Problem`)

Enunciado, exemplos, restrições, `starter` e `solution` **em JS e TS**, `tests` (com `label`; `hidden` para testes escondidos), `hints` progressivas, `explanation` (intuição, passos, complexidade, armadilhas) e `perf` opcional (os geradores precisam ser autocontidos: vão como texto para o worker).

- `starter(jsSig, tsSig, jsDoc?)` em `src/content/js/helpers.ts` gera o código inicial com o corpo vazio.
- `io.harness`: código de `(fnDoAluno, ...entrada) => resultado` para testar funções de alta ordem, closures, imutabilidade e código async.
- `io.design`: o `fnName` é uma classe (ou `'factory'`), e a entrada é `[ops, args]`.
- `io.args` / `io.ret` convertem listas e árvores no formato do LeetCode.

Registre no `index.ts` do curso e adicione o id em `problems` da aula.

### Prova (`Exam`)

`src/content/exams/provaN.ts`, registrada em `exams/index.ts` e ligada a uma etapa do guia. Questões:

- `choice`: múltipla escolha com `explain`;
- `output`: prever a saída (uma linha por `console.log`). **Só imprima primitivos**: o validate roda o código e confere `expected`;
- `code`: um `Problem` completo (nota proporcional aos testes, inclusive escondidos);
- `essay`: discursiva com resposta modelo e `checklist` para autoavaliação.

Toda questão tem `topic: "curso:aula"` (ex.: `js-fundamentos:loops`), usado na seção "O que revisar".

## Padrão de conteúdo

- Tudo em **PT-BR**.
- Cada aula: analogia do dia a dia no começo, demo animada, perguntas rápidas e um callout "Na entrevista".
- Exercícios com contexto real (frete, carrinho, cadastro, notas...), não só "some dois números".

## Regras

- `npm run validate` **precisa passar** depois de qualquer mudança de conteúdo; `npm run typecheck` e `npm run e2e` também.
- Em `useEffect`, **sempre use chaves no corpo** (`useEffect(() => { window.scrollTo(0, 0) }, [x])`). No navegador do autor, `scrollTo` retorna uma Promise, e uma arrow sem chaves faz o React receber a Promise como cleanup: isso já causou uma tela preta. O e2e simula esse comportamento (init script em `e2e/fixtures.ts`).
- Teste cada feature no navegador e corrija os bugs antes de passar para a próxima.
- Os specs do e2e importam `test`/`expect` de `e2e/fixtures.ts` (não de `@playwright/test`): ele falha o teste em qualquer `pageerror` ou `console.error`.
- **Não faça commit sem aprovação do autor.**
