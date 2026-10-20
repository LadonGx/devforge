import type { Pattern } from '../types'

export const JS_UNITS: Pattern[] = [
  /* ============================================================ */
  {
    id: 'tipos-coercao',
    title: 'Tipos e coerção',
    short: 'Os 7 primitivos, typeof e as regras de == e +.',
    summary: 'Por que "5" + 3 é "53", "5" - 3 é 2 e [] == false é true, e como não cair nisso.',
    color: '#e3a008',
    problems: ['js-get-type', 'js-sum-numeric', 'js-same-value'],
    lesson: [
      {
        type: 'text',
        md: `
### Tipos em JavaScript

Todo valor em JS é de um de dois grupos:

- **Primitivos** (imutáveis, comparados por valor): \`string\`, \`number\`, \`boolean\`, \`undefined\`, \`null\`, \`bigint\` e \`symbol\`.
- **Objetos** (comparados por referência): objetos \`{}\`, arrays, funções, \`Date\`, \`Map\`, \`Set\`...

O operador \`typeof\` diz o tipo, com três pegadinhas que você **precisa** saber de cor:

\`\`\`
typeof null        // "object"   (bug histórico, nunca corrigido)
typeof []          // "object"   (arrays são objetos: use Array.isArray)
typeof NaN         // "number"   (NaN é um número "inválido")
typeof function(){} // "function"
\`\`\`
`,
      },
      {
        type: 'text',
        md: `
### Coerção: quando o JS converte sozinho

JS é **fracamente tipado**: quando um operador recebe tipos que não combinam, ele **converte** um dos lados. Isso se chama **coerção implícita**. As regras não são aleatórias, mas são muitas. As três que mais aparecem:

1. **\`+\` com uma string** de um dos lados vira **concatenação**: \`"5" + 3 → "53"\`.
2. **\`-\`, \`*\`, \`/\`** sempre convertem para **número**: \`"5" - 3 → 2\`.
3. **\`==\`** converte os lados até ficarem do mesmo tipo antes de comparar; **\`===\`** nunca converte.

Use o laboratório abaixo: escolha os valores e veja **cada passo** que o motor do JS executa.
`,
      },
      { type: 'coercion' },
      {
        type: 'quiz',
        question: 'Qual o resultado?',
        code: `console.log("5" + 3, "5" - 3)`,
        options: ['"53" 2', '8 2', '"53" "2"', '8 "53"'],
        answer: 0,
        explain: 'Com `+`, se um lado é string, o JS concatena: `"53"`. O `-` não existe para strings, então os dois lados viram número: `5 - 3 = 2`.',
      },
      {
        type: 'quiz',
        question: '`[] == false` é...',
        options: ['true', 'false', 'TypeError'],
        answer: 0,
        explain:
          'O boolean vira número (`false → 0`); o array vira primitivo (`[] → ""`); a string vira número (`"" → 0`); e `0 == 0` é true. Teste no laboratório com `[]` e `false` para ver os 4 passos. Por isso: **use `===`**.',
      },
      {
        type: 'quiz',
        question: 'O que este `if` faz?',
        code: `const qtd = "0";
if (qtd) console.log("tem itens");
else console.log("vazio");`,
        options: ['"tem itens"', '"vazio"'],
        answer: 0,
        explain: 'A string `"0"` **não é vazia**, então é **truthy**. Só `""` é falsy entre as strings. Esse bug aparece muito com valores vindos de inputs de formulário (sempre strings).',
      },
      {
        type: 'callout',
        tone: 'tip',
        title: 'Regras práticas para o dia a dia',
        md: `
- Use **sempre \`===\`** e \`!==\`. A única exceção aceitável: \`x == null\` (pega \`null\` e \`undefined\` de uma vez).
- Converta **explicitamente**: \`Number(x)\`, \`String(x)\`, \`Boolean(x)\`. Fica claro para quem lê.
- \`Number("")\` e \`Number(" ")\` são **0**, e \`Number(null)\` também. Valide strings vazias antes.
- Use \`Number.isNaN\` e \`Number.isFinite\` (não as versões globais, que convertem antes).
`,
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'E o TypeScript?',
        md: 'O TypeScript evita boa parte desses problemas **em tempo de escrita** (ele reclama de `"5" - 3`). Mas os dados que chegam de APIs e formulários continuam sendo coerçidos em tempo de execução: entender as regras continua essencial.',
      },
    ],
  },

  /* ============================================================ */
  {
    id: 'escopo-closures',
    title: 'Escopo, hoisting e closures',
    short: 'var × let × const, TDZ e funções que lembram do escopo.',
    summary: 'Onde cada variável existe, por que var é problemático e como closures guardam estado privado.',
    color: '#c792ea',
    problems: ['js-create-counter', 'js-once', 'js-memoize'],
    lesson: [
      {
        type: 'text',
        md: `
### Escopo: onde uma variável existe

- **\`let\` e \`const\`** têm escopo de **bloco**: existem só dentro do \`{ }\` onde foram declaradas (if, for, função...).
- **\`var\`** tem escopo de **função**: ignora blocos. Declarar \`var\` dentro de um \`if\` cria a variável na função inteira.
- \`const\` impede **reatribuir** a variável, mas **não** torna o objeto imutável: \`const arr = []; arr.push(1)\` funciona.

Quando o código usa um nome, o JS procura na cadeia de escopos: bloco atual → blocos de fora → função → funções de fora → global. Isso é o **escopo léxico**: decidido pelo **lugar onde o código foi escrito**, não por onde ele é chamado.
`,
      },
      {
        type: 'text',
        md: `
### Hoisting e TDZ

Antes de executar uma função, o JS "registra" todas as declarações dela (**hoisting**):

- \`function soma() {}\` é registrada **completa**: pode ser chamada antes da linha onde foi escrita.
- \`var x\` é registrada valendo \`undefined\`: usar antes não dá erro, só \`undefined\` (fonte de bugs silenciosos).
- \`let\`/\`const\` também são registradas, mas ficam na **Temporal Dead Zone** até a linha da declaração: usar antes lança \`ReferenceError\`. Isso é **bom**: o erro aparece na hora.
`,
      },
      {
        type: 'quiz',
        question: 'O que é impresso?',
        code: `console.log(a);
var a = 1;
console.log(b);
let b = 2;`,
        options: ['undefined, depois ReferenceError', '1, depois 2', 'ReferenceError na primeira linha', 'undefined, undefined'],
        answer: 0,
        explain: '`var a` sofre hoisting com valor `undefined`. `let b` existe, mas está na TDZ até a linha 4: acessar antes lança `ReferenceError: Cannot access \'b\' before initialization`.',
      },
      {
        type: 'text',
        md: `
### Closures

Uma **closure** é uma função junto com o escopo em que ela foi criada. Quando uma função interna usa variáveis da função externa, essas variáveis **continuam vivas** mesmo depois que a externa terminou.

É assim que JS faz **estado privado** (sem classes), callbacks que lembram de contexto, \`debounce\`, memoização, módulos, hooks do React (\`useState\` é uma closure!)...

No visualizador abaixo, repare na função interna: as variáveis com **↑** são as capturadas do escopo externo. \`a\` e \`b\` têm cada um o **seu** \`count\`.
`,
      },
      {
        type: 'demo',
        title: 'Duas closures, dois contadores independentes',
        caption: 'Cada chamada de makeCounter cria um escopo novo. Avance e veja ↑count de cada função interna evoluir separadamente.',
        fnName: 'demo',
        input: [],
        code: `function demo() {
  const makeCounter = () => {
    let count = 0;
    return () => {
      count++;
      return count;
    };
  };
  const a = makeCounter();
  const b = makeCounter();
  a();
  a();
  b();
  return [a(), b()];
}
`,
      },
      {
        type: 'quiz',
        question: 'O que este código imprime?',
        code: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}`,
        options: ['3 3 3', '0 1 2', '0 0 0', '2 2 2'],
        answer: 0,
        explain:
          'Com `var`, existe **um único** `i` para a função inteira. Quando os callbacks rodam (depois do loop), `i` já vale 3. Trocando por `let`, cada iteração ganha o **seu** `i` (escopo de bloco) e a saída vira `0 1 2`. Pergunta clássica de entrevista!',
      },
      {
        type: 'code',
        caption: 'Padrões com closure que você vai ver no trabalho',
        code: `// Estado privado
function createWallet() {
  let balance = 0;
  return {
    deposit: (v) => (balance += v),
    getBalance: () => balance,
  };
}

// Função "configurada" (fábrica)
const multiplier = (factor) => (x) => x * factor;
const double = multiplier(2);
double(5); // 10

// Debounce: só executa depois que as chamadas param por "ms"
function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}`,
      },
      {
        type: 'callout',
        tone: 'warn',
        title: 'Cuidados',
        md: `
- Evite \`var\`. Prefira \`const\` e use \`let\` só quando precisar reatribuir.
- Closures mantêm as variáveis **vivas na memória**: guardar arrays enormes numa closure de longa duração (ex.: event listeners nunca removidos) causa vazamento de memória.
`,
      },
    ],
  },

  /* ============================================================ */
  {
    id: 'this-funcoes',
    title: 'this, call/apply/bind e arrow functions',
    short: 'As 4 regras do this e quando a arrow function muda tudo.',
    summary: 'O this é decidido na chamada. Entenda as regras para não perder o contexto em callbacks e classes.',
    color: '#6ea8fe',
    problems: ['js-calculator-chain', 'js-my-bind'],
    lesson: [
      {
        type: 'text',
        md: `
### O \`this\` é decidido na hora da chamada

Diferente de quase tudo em JS (que é léxico), o \`this\` de uma função comum depende de **como ela é chamada**. São 4 regras, da mais forte para a mais fraca:

1. **\`new Fn()\`**: \`this\` é o objeto novo que está sendo criado.
2. **\`fn.call(obj)\` / \`fn.apply(obj)\` / \`fn.bind(obj)\`**: \`this\` é o \`obj\` que você passou.
3. **\`obj.metodo()\`**: \`this\` é o objeto **antes do ponto**.
4. **\`fn()\`** solta: \`this\` é \`undefined\` (em strict mode, módulos e classes) ou o objeto global.

**Arrow functions não têm \`this\` próprio**: usam o \`this\` do lugar onde foram **escritas**. Nenhuma das regras acima muda isso.
`,
      },
      {
        type: 'demo',
        title: 'this dentro de métodos de classe',
        caption: 'Nos métodos, o visualizador mostra os campos do objeto como this.campo.',
        fnName: 'demo',
        input: [],
        code: `class Account {
  constructor(owner) {
    this.owner = owner;
    this.balance = 0;
  }
  deposit(value) {
    this.balance += value;
    return this.balance;
  }
}

function demo() {
  const acc = new Account('Ana');
  acc.deposit(50);
  acc.deposit(25);
  return acc.balance;
}
`,
      },
      {
        type: 'quiz',
        question: 'O que acontece?',
        code: `const user = {
  name: "Ana",
  hello() { return "Oi, " + this.name; },
};
const fn = user.hello;
fn();`,
        options: ['TypeError (ou "Oi, undefined" fora do strict mode)', '"Oi, Ana"', '"Oi, user"'],
        answer: 0,
        explain:
          'Ao copiar o método para `fn`, ele perde o objeto antes do ponto: é uma chamada solta (regra 4), então `this` é `undefined` em strict mode e `this.name` lança TypeError. Esse é exatamente o bug de passar `user.hello` como callback (`onClick={user.hello}`). Soluções: `user.hello.bind(user)` ou `() => user.hello()`.',
      },
      {
        type: 'quiz',
        question: 'E com arrow function como método?',
        code: `const counter = {
  count: 0,
  inc: () => { this.count++; },
};
counter.inc();`,
        options: ['Não altera counter.count (this não é o objeto)', 'counter.count vira 1', 'SyntaxError'],
        answer: 0,
        explain: 'A arrow não tem `this` próprio: usa o do escopo onde o objeto foi escrito (o módulo/global), não o `counter`. Para métodos, use a sintaxe `inc() { ... }`.',
      },
      {
        type: 'code',
        caption: 'call, apply e bind',
        code: `function greet(greeting, punct) {
  return greeting + ", " + this.name + punct;
}
const ana = { name: "Ana" };

greet.call(ana, "Olá", "!");      // chama agora, args soltos
greet.apply(ana, ["Olá", "!"]);   // chama agora, args em array
const hi = greet.bind(ana, "Oi"); // NÃO chama: devolve função com this fixo
hi("?");                          // "Oi, Ana?"`,
      },
      {
        type: 'callout',
        tone: 'tip',
        title: 'Quando a arrow function é a escolha certa',
        md: 'Dentro de métodos, callbacks com arrow **herdam** o `this` do método: `this.items.forEach(item => this.total += item)` funciona. Com `function` no lugar da arrow, o `this` do callback seria outro. Regra prática: **métodos** com sintaxe de método, **callbacks** com arrow.',
      },
    ],
  },

  /* ============================================================ */
  {
    id: 'arrays-metodos',
    title: 'Arrays: map, filter, reduce e companhia',
    short: 'Transformar, filtrar, agregar e ordenar sem loops manuais.',
    summary: 'Os métodos que aparecem em todo código JS moderno, e quais deles alteram o array original.',
    color: '#3fb950',
    problems: ['js-my-map', 'js-my-reduce', 'js-group-by', 'js-order-summary'],
    lesson: [
      {
        type: 'text',
        md: `
### Um método para cada intenção

Em vez de escrever \`for\` para tudo, os métodos de array **dizem a intenção**:

- \`map(fn)\`: **transforma** cada item → array do **mesmo tamanho**.
- \`filter(fn)\`: **seleciona** os itens em que \`fn\` retorna truthy → array **menor ou igual**.
- \`reduce(fn, inicial)\`: **agrega** tudo num valor só (soma, objeto, Map...).
- \`find(fn)\` / \`findIndex(fn)\`: o **primeiro** que satisfaz (ou \`undefined\` / -1). Para no primeiro.
- \`some(fn)\` / \`every(fn)\`: **existe algum?** / **todos?** → boolean. Também param cedo.
- \`sort(cmp)\`, \`includes(x)\`, \`flat()\`, \`flatMap(fn)\`, \`at(-1)\`...

O pipeline abaixo executa uma cadeia real, **elemento por elemento**, na ordem em que o JS executa: primeiro o \`map\` inteiro, depois o \`filter\` inteiro, depois o \`reduce\`.
`,
      },
      {
        type: 'pipeline',
        title: 'Total com desconto dos produtos acima de R$ 50',
        caption: 'Cada método recebe o array produzido pelo anterior. Repare que é um array novo a cada etapa.',
        input: [30, 80, 120, 45, 200],
        stages: [
          { op: 'map', code: 'p => p * 0.9', fn: (p: number) => Math.round(p * 0.9 * 100) / 100 },
          { op: 'filter', code: 'p => p > 50', fn: (p: number) => p > 50 },
          { op: 'reduce', code: '(acc, p) => acc + p', fn: (acc: number, p: number) => acc + p, initial: 0 },
        ],
      },
      {
        type: 'pipeline',
        title: 'find, some e every param no meio do caminho',
        caption: 'Repare que find e some não olham os elementos depois do primeiro que resolve a pergunta.',
        input: [3, 8, 12, 5, 20],
        stages: [
          { op: 'find', code: 'n => n > 10', fn: (n: number) => n > 10 },
        ],
      },
      {
        type: 'quiz',
        question: 'Qual o resultado?',
        code: `[10, 1, 5, 100].sort()`,
        options: ['[1, 10, 100, 5]', '[1, 5, 10, 100]', '[100, 10, 5, 1]'],
        answer: 0,
        explain: 'Sem comparador, o `sort` converte tudo para **string** e ordena alfabeticamente: "1" < "10" < "100" < "5". Para números: `sort((a, b) => a - b)`. E atenção: `sort` **altera** o array original (use `toSorted` para uma cópia).',
      },
      {
        type: 'quiz',
        question: 'O que `nums` contém depois disso?',
        code: `const nums = [1, 2, 3];
const r = nums.map(n => { n * 2 });`,
        options: ['r é [undefined, undefined, undefined]; nums não muda', 'r é [2, 4, 6]', 'nums vira [2, 4, 6]'],
        answer: 0,
        explain: 'Com chaves, a arrow function precisa de `return` explícito. Sem ele, cada callback retorna `undefined`. E `map` nunca altera o array original. Corrija com `n => n * 2` (sem chaves) ou `{ return n * 2 }`.',
      },
      {
        type: 'compare',
        left: {
          title: 'Alteram o array original',
          md: '`push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`, `fill`, `copyWithin`',
        },
        right: {
          title: 'Retornam um array novo',
          md: '`map`, `filter`, `slice`, `concat`, `flat`, `flatMap`, `toSorted`, `toReversed`, `toSpliced`, `with`, spread `[...arr]`',
        },
      },
      {
        type: 'code',
        caption: 'Receitas do dia a dia',
        code: `const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
const ids = users.map((u) => u.id);
const ativos = users.filter((u) => u.active);
const admin = users.find((u) => u.role === "admin");
const temPendente = orders.some((o) => o.status === "pending");
const todosPagos = orders.every((o) => o.paid);
const porIdade = users.toSorted((a, b) => a.age - b.age);
const porId = Object.fromEntries(users.map((u) => [u.id, u]));`,
      },
      {
        type: 'callout',
        tone: 'warn',
        title: 'Cuidado com performance escondida',
        md: '`arr.filter(x => outro.includes(x))` é O(n·m): `includes` percorre o array toda vez. Para buscas repetidas, transforme em `Set` antes (aula de Map e Set).',
      },
    ],
  },

  /* ============================================================ */
  {
    id: 'objetos-referencias',
    title: 'Objetos, referências e cópias',
    short: 'Valor × referência, cópia rasa × profunda e imutabilidade.',
    summary: 'Por que alterar uma "cópia" às vezes altera o original, e como atualizar estado sem mutar.',
    color: '#f78c6c',
    problems: ['js-deep-clone', 'js-deep-equal', 'js-update-immutable'],
    lesson: [
      {
        type: 'text',
        md: `
### Valor × referência

- **Primitivos** são copiados **por valor**: \`let b = a\` cria uma cópia independente.
- **Objetos e arrays** ficam num lugar da memória (o *heap*); a variável guarda só uma **referência** (um "endereço"). \`const b = a\` copia o **endereço**: \`a\` e \`b\` passam a apontar para o **mesmo** objeto.

Por isso \`{} === {}\` é \`false\` (dois objetos diferentes) e alterar \`b.nome\` também "altera" \`a.nome\` (é o mesmo objeto).
`,
      },
      {
        type: 'demo',
        title: 'Mesma referência × cópia rasa',
        caption: 'O visualizador junta variáveis que apontam para o mesmo objeto e avisa "mesma referência". Repare que a cópia com spread é um objeto novo, mas o array tags dentro dela é o mesmo do original.',
        fnName: 'referencias',
        input: [],
        code: `function referencias() {
  const original = { nome: 'Ana', tags: ['js'] };
  const mesmo = original;
  const raso = { ...original };
  mesmo.nome = 'Bia';
  raso.nome = 'Caio';
  const tagsDoOriginal = original.tags;
  const tagsDoRaso = raso.tags;
  tagsDoRaso.push('ts');
  return original;
}
`,
      },
      {
        type: 'quiz',
        question: 'Qual o valor final de `original`?',
        code: `const original = { nome: "Ana", tags: ["js"] };
const copia = { ...original };
copia.nome = "Bia";
copia.tags.push("ts");`,
        options: ['{ nome: "Ana", tags: ["js", "ts"] }', '{ nome: "Bia", tags: ["js", "ts"] }', '{ nome: "Ana", tags: ["js"] }'],
        answer: 0,
        explain: 'O spread copia o **primeiro nível**: `nome` é primitivo e foi copiado. Mas `tags` é uma referência: `copia.tags` e `original.tags` são o **mesmo** array. Isso é a **cópia rasa** (shallow copy).',
      },
      {
        type: 'compare',
        left: {
          title: 'Cópia rasa',
          md: '`{ ...obj }`, `Object.assign({}, obj)`, `[...arr]`, `arr.slice()`. Rápida, mas objetos internos continuam compartilhados.',
        },
        right: {
          title: 'Cópia profunda',
          md: '`structuredClone(obj)` (nativo, lida com Date, Map, Set e ciclos) ou recursão manual. Nada é compartilhado.',
        },
      },
      {
        type: 'text',
        md: `
### Imutabilidade na prática

React, Redux, NgRx e muitas bibliotecas detectam mudanças comparando **referências** (\`antes === depois\`). Se você **muta** um objeto, a referência não muda e a tela não atualiza.

A regra: **nunca altere o estado existente; crie um novo só onde mudou**:

\`\`\`
// ❌ muta
state.user.name = "Bia";
// ✅ novo objeto em cada nível alterado
const next = { ...state, user: { ...state.user, name: "Bia" } };
// arrays
const added   = [...list, item];
const removed = list.filter((x) => x.id !== id);
const updated = list.map((x) => (x.id === id ? { ...x, done: true } : x));
\`\`\`
`,
      },
      {
        type: 'quiz',
        question: 'Este código funciona?',
        code: `const config = { debug: false };
config.debug = true;`,
        options: ['Sim: const impede reatribuir a variável, não alterar o objeto', 'Não: TypeError porque é const'],
        answer: 0,
        explain: '`const` trava a **variável** (não dá para fazer `config = {...}`), mas o objeto continua mutável. Para congelar o objeto (só o primeiro nível) existe `Object.freeze(config)`.',
      },
    ],
  },

  /* ============================================================ */
  {
    id: 'map-set',
    title: 'Map, Set e quando usar cada um',
    short: 'Chaves de qualquer tipo, valores únicos e buscas O(1).',
    summary: 'As estruturas que trocam loops aninhados por consultas instantâneas.',
    color: '#4dd0e1',
    problems: ['js-unique-by', 'js-word-frequency', 'js-intersection'],
    lesson: [
      {
        type: 'text',
        md: `
### Map × objeto

Os dois guardam pares chave → valor, mas:

- **\`Map\`** aceita **qualquer tipo de chave** (número, objeto, função) **sem converter**; mantém a **ordem de inserção**; tem \`.size\`; é iterável direto (\`for (const [k, v] of map)\`); e não tem chaves herdadas.
- **Objeto \`{}\`** converte chaves para **string** (\`obj[1]\` e \`obj["1"]\` são a mesma coisa) e herda propriedades do protótipo (\`"constructor" in {}\` é true).

Use **objeto** para dados com formato conhecido (um usuário, uma config, JSON de API). Use **Map** para dicionários dinâmicos (contagens, caches, índices por id).

### Set

Coleção de **valores únicos**. \`add\`, \`has\` e \`delete\` são **O(1)** em média, contra O(n) de \`array.includes\`.
`,
      },
      {
        type: 'demo',
        title: 'Contando e deduplicando',
        caption: 'Veja a tabela do Map crescer (verde = nova chave) e o Set ignorar o que já existe.',
        fnName: 'demo',
        input: [['js', 'ts', 'js', 'react', 'ts', 'js']],
        code: `function demo(words) {
  const count = new Map();
  const unique = new Set();
  for (const w of words) {
    count.set(w, (count.get(w) ?? 0) + 1);
    unique.add(w);
  }
  return [...unique];
}
`,
      },
      {
        type: 'quiz',
        question: 'Qual o tamanho do Set?',
        code: `new Set([1, "1", 1, NaN, NaN, {}, {}]).size`,
        options: ['5', '3', '7', '4'],
        answer: 0,
        explain: '`1` e `"1"` são diferentes (sem coerção) → 2. Os dois `NaN` contam como um (Set usa SameValueZero) → 3. Os dois `{}` são objetos **diferentes** na memória → 5.',
      },
      {
        type: 'code',
        caption: 'Receitas',
        code: `// Remover duplicados de primitivos
const unicos = [...new Set(arr)];

// Operações de conjunto
const a = new Set([1, 2, 3]), b = new Set([2, 3, 4]);
const uniao = new Set([...a, ...b]);
const inter = [...a].filter((x) => b.has(x));
const dif   = [...a].filter((x) => !b.has(x));

// Índice por id: busca O(1) em vez de find O(n)
const byId = new Map(users.map((u) => [u.id, u]));
byId.get(42);

// Map <-> objeto
const obj = Object.fromEntries(map);
const map2 = new Map(Object.entries(obj));`,
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'WeakMap e WeakSet',
        md: 'Aceitam só **objetos** como chave e não impedem que esses objetos sejam coletados pelo garbage collector. Servem para associar dados a objetos sem vazar memória (ex.: cache por elemento do DOM). Não são iteráveis e não têm `.size`.',
      },
    ],
  },

  /* ============================================================ */
  {
    id: 'sintaxe-moderna',
    title: 'Desestruturação, spread/rest e ?. / ??',
    short: 'A sintaxe moderna que deixa o código curto e seguro.',
    summary: 'Desestruturar objetos e arrays, espalhar e juntar argumentos, e acessar dados opcionais sem quebrar.',
    color: '#ff6b9a',
    problems: ['js-get-city', 'js-merge-settings', 'js-summarize-rest'],
    lesson: [
      {
        type: 'code',
        caption: 'Desestruturação',
        code: `const user = { id: 1, name: "Ana", address: { city: "Americana" } };

const { name, age = 18 } = user;            // padrão se for undefined
const { name: nome } = user;                // renomeia
const { address: { city } } = user;         // aninhado
const { id, ...resto } = user;              // resto = { name, address }

const [first, second = 0, ...others] = [10, 20, 30, 40];
[a, b] = [b, a];                             // troca sem variável temporária

function createUser({ name, role = "user" } = {}) { /* ... */ }`,
      },
      {
        type: 'code',
        caption: 'Spread (espalha) × rest (junta)',
        code: `// spread: espalha um iterável/objeto
const merged = { ...defaults, ...options };  // o da direita vence
const all = [...listA, ...listB];
Math.max(...nums);

// rest: junta "o que sobrou"
function log(level, ...messages) {
  messages.forEach((m) => console.log(level, m));
}`,
      },
      {
        type: 'text',
        md: `
### \`?.\` e \`??\`

- **Optional chaining \`?.\`**: se o que está à esquerda for \`null\`/\`undefined\`, devolve \`undefined\` em vez de lançar erro. Funciona com propriedades (\`a?.b\`), índices (\`a?.[0]\`) e chamadas (\`fn?.()\`).
- **Nullish coalescing \`??\`**: usa o valor da direita **só** se o da esquerda for \`null\`/\`undefined\`.
- **\`||\`** usa a direita para **qualquer falsy**: \`0\`, \`""\`, \`false\`, \`NaN\`.
`,
      },
      {
        type: 'quiz',
        question: 'Qual a diferença entre as duas linhas?',
        code: `const qtd = 0;
const a = qtd || 10;
const b = qtd ?? 10;`,
        options: ['a = 10, b = 0', 'a = 0, b = 10', 'a = 10, b = 10', 'a = 0, b = 0'],
        answer: 0,
        explain: '`||` troca qualquer falsy, e 0 é falsy: `a = 10` (provavelmente um bug, se 0 era uma quantidade válida). `??` só troca null/undefined: `b = 0`.',
      },
      {
        type: 'demo',
        title: 'Desestruturação e spread em ação',
        caption: 'Repare em cada variável criada pela desestruturação e no objeto novo criado pelo spread.',
        fnName: 'demo',
        input: [{ name: 'Ana', role: 'admin', address: { city: 'Americana' } }],
        code: `function demo(user) {
  const { name, role = 'user', address } = user;
  const city = address?.city ?? 'Desconhecida';
  const zip = address?.zip ?? 'sem CEP';
  const card = { ...user, city, active: true };
  const [first, ...rest] = name.split('');
  return { card, initial: first, restCount: rest.length, zip, role };
}
`,
      },
      {
        type: 'quiz',
        question: 'O que acontece?',
        code: `function f({ a, b }) { return a + b; }
f();`,
        options: ['TypeError: não dá para desestruturar undefined', 'NaN', 'undefined'],
        answer: 0,
        explain: 'Sem argumento, o parâmetro é `undefined`, e desestruturar `undefined` lança TypeError. A correção é um padrão no parâmetro: `function f({ a = 0, b = 0 } = {})`.',
      },
      {
        type: 'callout',
        tone: 'tip',
        title: 'Outras que valem conhecer',
        md: '`Object.entries/fromEntries`, template literals (`` `Olá, ${nome}` ``), shorthand (`{ name, age }`), nomes de propriedade computados (`{ [chave]: valor }`), `Array.prototype.at(-1)`, `structuredClone` e `Object.groupBy`.',
      },
    ],
  },
]
