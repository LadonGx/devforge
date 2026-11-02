import type { Pattern } from '../types'

/** Aulas novas das Partes 2 (arrays e objetos básicos) e 4 (classes, erros e recursão). */
export const EXTRA_UNITS: Pattern[] = [
  /* ============================================================ */
  {
    id: 'arrays',
    title: 'Arrays: listas de valores',
    short: 'Índices, push/pop, slice × splice e percorrer listas.',
    summary: 'Guardar vários valores em ordem, acessar por posição e saber quais métodos alteram a lista original.',
    color: '#2ac3de',
    problems: ['js-min-max', 'js-remove-at', 'js-chunk'],
    lesson: [
      {
        type: 'analogy',
        title: 'A fila do banco',
        md: `
Um array é uma **fila organizada**: cada pessoa tem uma **posição**, e a primeira posição é a **0** (pense no "térreo" de um prédio, que vem antes do 1º andar).

- \`push\`: alguém **entra no fim** da fila.
- \`pop\`: o **último** desiste e sai.
- \`shift\`: o **primeiro** é atendido e sai (todo mundo anda uma posição).
- \`unshift\`: alguém **fura a fila** e entra na frente.
- \`length\`: quantas pessoas estão na fila.
`,
      },
      {
        type: 'text',
        md: `
### Criando e acessando

\`\`\`
const frutas = ["maçã", "banana", "uva"];
frutas[0]               // "maçã"
frutas[2]               // "uva"
frutas[3]               // undefined (não existe)
frutas.length           // 3
frutas.at(-1)           // "uva" (último)
frutas[frutas.length - 1] // "uva" (jeito clássico)
\`\`\`

Um array pode guardar qualquer coisa, inclusive objetos e outros arrays: \`[{ id: 1 }, { id: 2 }]\` (lista de usuários) ou \`[[1, 2], [3, 4]]\` (uma matriz).

### Adicionar e remover

\`\`\`
frutas.push("kiwi");     // no fim      → ["maçã", "banana", "uva", "kiwi"]
frutas.pop();            // tira o fim  → devolve "kiwi"
frutas.unshift("limão"); // no começo
frutas.shift();          // tira o começo → devolve "limão"
\`\`\`

### Buscar

- \`frutas.includes("uva")\` → \`true\`
- \`frutas.indexOf("banana")\` → \`1\` (ou \`-1\` se não achar)
`,
      },
      {
        type: 'demo',
        title: 'Uma fila de atendimento',
        caption: 'Repare no array mudando a cada push e shift. O visualizador desenha o array com os índices embaixo.',
        fnName: 'atendimento',
        input: [],
        code: `function atendimento() {
  const fila = [];
  fila.push('Ana');
  fila.push('Bruno');
  fila.push('Carla');
  const primeiro = fila.shift();
  fila.push('Diego');
  const ultimo = fila[fila.length - 1];
  const temBruno = fila.includes('Bruno');
  return { primeiro, ultimo, temBruno, restantes: fila.length };
}
`,
      },
      {
        type: 'text',
        md: `
### slice × splice (a confusão clássica)

- **\`slice(início, fim)\`** = **fatiar**: devolve uma **cópia** de um pedaço. **Não altera** o original.
- **\`splice(início, quantos, ...novos)\`** = **cirurgia**: remove e/ou insere **no próprio array**. **Altera** o original e devolve o que removeu.

\`\`\`
const nums = [10, 20, 30, 40];
nums.slice(1, 3);   // [20, 30]   nums continua [10, 20, 30, 40]
nums.splice(1, 2);  // [20, 30]   nums agora é [10, 40]
\`\`\`

### Copiar um array

\`const copia = [...nums]\` (spread) ou \`nums.slice()\`. Fazer \`const copia = nums\` **não copia**: as duas variáveis apontam para o **mesmo** array (veja a aula de referências).
`,
      },
      {
        type: 'quiz',
        question: 'Qual o valor de `lista` no final?',
        code: `const lista = [1, 2, 3, 4, 5];
const pedaco = lista.slice(1, 3);
lista.splice(0, 1);`,
        options: ['[2, 3, 4, 5]', '[1, 2, 3, 4, 5]', '[2, 3]', '[1, 4, 5]'],
        answer: 0,
        explain: '`slice` só copiou `[2, 3]` para `pedaco`, sem tocar em `lista`. `splice(0, 1)` removeu **1** item a partir do índice 0 **do próprio array**: sobra `[2, 3, 4, 5]`.',
      },
      {
        type: 'quiz',
        question: 'O que aparece?',
        code: `const a = [1, 2, 3];
const b = a;
b.push(4);
console.log(a.length);`,
        options: ['4', '3', 'undefined'],
        answer: 0,
        explain: '`const b = a` não cria um array novo: `a` e `b` apontam para o **mesmo** array. O `push` em `b` aparece em `a`. Para copiar: `const b = [...a]`.',
      },
      {
        type: 'callout',
        tone: 'tip',
        title: 'Boas práticas',
        md: `
- Prefira métodos que **não alteram** o original quando o array é compartilhado (estado do React, dados que vieram de outra função).
- Use \`for...of\` para percorrer e \`map/filter/reduce\` para transformar (próxima aula).
- Nomes no **plural** para arrays: \`usuarios\`, \`pedidos\`. No loop, o singular: \`for (const usuario of usuarios)\`.
`,
      },
      {
        type: 'callout',
        tone: 'interview',
        md: '"Diferença entre `slice` e `splice`?" e "como copiar um array?" aparecem muito. E nos exercícios de algoritmo, saber que `push`/`pop` são O(1) e `shift`/`unshift` são O(n) (todo mundo precisa andar uma posição) faz diferença na complexidade.',
      },
    ],
  },

  /* ============================================================ */
  {
    id: 'objetos',
    title: 'Objetos: dados com nome',
    short: 'Chaves e valores, acesso com . e [], percorrer e JSON.',
    summary: 'Agrupar informações relacionadas, ler e alterar propriedades e converter de/para JSON, o formato das APIs.',
    color: '#e0af68',
    problems: ['js-pick', 'js-invert-object', 'js-cart-total'],
    lesson: [
      {
        type: 'analogy',
        title: 'A ficha de cadastro',
        md: `
Uma ficha de cadastro tem **campos com nome**: "Nome: Ana", "Cidade: Americana", "Idade: 28". Você não procura "o terceiro campo", procura pelo **nome do campo**.

Um objeto é essa ficha: um conjunto de pares **chave → valor**. Enquanto o array organiza por **posição**, o objeto organiza por **nome**.

E um objeto também pode ter **botões**: funções guardadas nele (os **métodos**), como um controle remoto que tem dados (canal atual, volume) e ações (\`aumentarVolume()\`).
`,
      },
      {
        type: 'text',
        md: `
### Criar, ler e alterar

\`\`\`
const usuario = {
  nome: "Ana",
  idade: 28,
  endereco: { cidade: "Americana", uf: "SP" },
  ativo: true,
};

usuario.nome                 // "Ana"
usuario.endereco.cidade      // "Americana"
usuario["idade"]             // 28 (colchetes: o nome vem de uma string)
const campo = "ativo";
usuario[campo]               // true (nome vindo de uma variável)

usuario.email = "ana@email.com";  // cria a propriedade
usuario.idade = 29;               // altera
delete usuario.ativo;             // remove
usuario.telefone                  // undefined (não existe)
\`\`\`

**Ponto ou colchetes?** Use o **ponto** sempre que souber o nome. Use **colchetes** quando o nome estiver numa **variável** ou tiver caracteres especiais (\`obj["data-nascimento"]\`).
`,
      },
      {
        type: 'text',
        md: `
### Percorrendo um objeto

\`\`\`
Object.keys(usuario)    // ["nome", "idade", "endereco", "email"]
Object.values(usuario)  // ["Ana", 29, {...}, "ana@email.com"]
Object.entries(usuario) // [["nome", "Ana"], ["idade", 29], ...]

for (const [chave, valor] of Object.entries(usuario)) {
  console.log(chave, valor);
}
\`\`\`

Para saber se uma chave existe: \`"email" in usuario\` ou \`Object.hasOwn(usuario, "email")\`.

### Atalhos que você vai ver em todo lugar

\`\`\`
const nome = "Ana", idade = 28;
const pessoa = { nome, idade };          // = { nome: nome, idade: idade }
const chave = "cor";
const produto = { [chave]: "azul" };     // { cor: "azul" }
const conta = {
  saldo: 100,
  depositar(valor) { this.saldo += valor; },  // método
};
\`\`\`
`,
      },
      {
        type: 'demo',
        title: 'Montando o resumo de um pedido',
        caption: 'O visualizador mostra objetos como tabelas de chave e valor. Veja a propriedade nova aparecer.',
        fnName: 'resumo',
        input: [{ cliente: 'Ana', itens: { camiseta: 2, boné: 1 } }],
        code: `function resumo(pedido) {
  const precos = { camiseta: 59.9, boné: 35, meia: 12 };
  let total = 0;
  for (const [produto, qtd] of Object.entries(pedido.itens)) {
    total += precos[produto] * qtd;
  }
  const saida = { cliente: pedido.cliente };
  saida.total = Math.round(total * 100) / 100;
  saida.qtdProdutos = Object.keys(pedido.itens).length;
  return saida;
}
`,
      },
      {
        type: 'text',
        md: `
### JSON: objetos viajando como texto

APIs, \`localStorage\` e arquivos de configuração trocam dados como **texto** no formato **JSON**, que é praticamente a sintaxe de objetos do JS (com aspas duplas obrigatórias nas chaves).

\`\`\`
const texto = JSON.stringify({ nome: "Ana", idade: 28 });
// '{"nome":"Ana","idade":28}'   ← uma string

const obj = JSON.parse('{"nome":"Ana","idade":28}');
// { nome: "Ana", idade: 28 }    ← um objeto de novo
\`\`\`

\`JSON.parse\` **lança erro** se o texto não for JSON válido. Na aula de erros você vai ver como se proteger disso.
`,
      },
      {
        type: 'quiz',
        question: 'O que aparece?',
        code: `const campo = "nome";
const user = { nome: "Ana", campo: "x" };
console.log(user.campo, user[campo]);`,
        options: ['"x" "Ana"', '"Ana" "Ana"', '"Ana" "x"', 'undefined "Ana"'],
        answer: 0,
        explain: '`user.campo` procura a chave **literalmente chamada** "campo" (valor "x"). `user[campo]` usa o **valor da variável** `campo`, que é "nome": vira `user["nome"]` = "Ana".',
      },
      {
        type: 'quiz',
        question: 'Qual o resultado?',
        code: `const config = { tema: "escuro" };
console.log(config.idioma.codigo);`,
        options: ['TypeError: Cannot read properties of undefined', 'undefined', 'null', '""'],
        answer: 0,
        explain: '`config.idioma` é `undefined` (não existe). Ler `.codigo` **de undefined** lança TypeError: é o erro mais comum do JavaScript. A proteção é o optional chaining: `config.idioma?.codigo` (aula de sintaxe moderna).',
      },
      {
        type: 'callout',
        tone: 'tip',
        title: 'Boas práticas',
        md: `
- **Nunca devolva mais dados do que o necessário** numa API: monte um objeto novo só com os campos públicos (nada de senha ou dados internos). É o que o exercício \`pick\` treina.
- Objetos com **formato fixo** (usuário, produto) e chaves conhecidas. Para dicionários dinâmicos (contagens, índices por id), \`Map\` costuma ser melhor (aula de Map e Set).
- Evite objetos "faz-tudo" com 30 campos: agrupe em subobjetos (\`endereco\`, \`contato\`).
`,
      },
      {
        type: 'callout',
        tone: 'interview',
        md: '"Diferença entre ponto e colchetes?", "como percorrer um objeto?" e "o que é JSON?" são perguntas de aquecimento. Em live coding, contar frequências com objeto ou Map (`contagem[x] = (contagem[x] || 0) + 1`) é um padrão que aparece o tempo todo.',
      },
    ],
  },

  /* ============================================================ */
  {
    id: 'classes',
    title: 'Classes e protótipos',
    short: 'constructor, métodos, getters, herança e o que há por baixo.',
    summary: 'Criar vários objetos com o mesmo formato e comportamento, herdar e encapsular, como no NestJS e em toda a orientação a objetos.',
    color: '#f7768e',
    problems: ['js-bank-account', 'js-stack-class', 'js-todo-list'],
    lesson: [
      {
        type: 'analogy',
        title: 'A planta da casa',
        md: `
Uma construtora tem **uma planta** e, a partir dela, constrói **várias casas**. Todas têm o mesmo formato (sala, 2 quartos), mas cada uma tem seu morador, sua cor de parede, seus móveis.

- A **classe** é a planta.
- Cada casa construída é uma **instância** (\`new Casa(...)\`).
- O \`constructor\` é a obra: roda uma vez, quando a casa é criada, e define o estado inicial.
- **Herança**: a planta "casa com piscina" **estende** a planta básica: tem tudo dela e mais a piscina.
`,
      },
      {
        type: 'text',
        md: `
### A sintaxe

\`\`\`
class Produto {
  constructor(nome, preco) {
    this.nome = nome;        // this = o objeto que está sendo criado
    this.preco = preco;
  }

  aplicarDesconto(pct) {     // método: compartilhado por todas as instâncias
    this.preco = this.preco * (1 - pct / 100);
  }

  get precoFormatado() {     // getter: lido como propriedade, sem ()
    return "R$ " + this.preco.toFixed(2);
  }

  static comparar(a, b) {    // static: pertence à classe, não às instâncias
    return a.preco - b.preco;
  }
}

const camiseta = new Produto("Camiseta", 80);
camiseta.aplicarDesconto(10);
camiseta.precoFormatado;     // "R$ 72.00"
Produto.comparar(camiseta, outro);
\`\`\`
`,
      },
      {
        type: 'demo',
        title: 'Herança com extends e super',
        caption: 'Nos métodos, o visualizador mostra os campos do objeto como this.campo. Repare que Gerente reaproveita o constructor de Funcionario via super.',
        fnName: 'folha',
        input: [],
        code: `class Funcionario {
  constructor(nome, salario) {
    this.nome = nome;
    this.salario = salario;
  }
  pagamento() {
    return this.salario;
  }
}

class Gerente extends Funcionario {
  constructor(nome, salario, bonus) {
    super(nome, salario);
    this.bonus = bonus;
  }
  pagamento() {
    return super.pagamento() + this.bonus;
  }
}

function folha() {
  const ana = new Funcionario('Ana', 4000);
  const bia = new Gerente('Bia', 6000, 1500);
  const total = ana.pagamento() + bia.pagamento();
  return { total, biaEhFuncionario: bia instanceof Funcionario };
}
`,
      },
      {
        type: 'text',
        md: `
### Encapsulamento: campos privados

Campos com \`#\` só podem ser lidos e alterados **dentro** da classe. Quem usa a classe só enxerga os métodos públicos:

\`\`\`
class Conta {
  #saldo = 0;
  depositar(v) {
    if (v <= 0) throw new Error("valor inválido");
    this.#saldo += v;
  }
  get saldo() { return this.#saldo; }
}
const c = new Conta();
c.depositar(50);
c.saldo;        // 50
c.#saldo = 1e6; // SyntaxError: não dá para mexer de fora
\`\`\`

Assim ninguém consegue colocar a conta num estado inválido "pulando" as regras do método.

### O que tem por baixo: protótipos

Classes em JS são uma forma mais bonita de escrever **protótipos**. Cada objeto tem um elo escondido para outro objeto (o protótipo). Quando você acessa \`camiseta.aplicarDesconto\`, o JS não acha no próprio objeto e **sobe a corrente**: procura em \`Produto.prototype\`, depois em \`Object.prototype\`. É assim que todas as instâncias compartilham **um único** método, e é assim que \`[].map\` existe em todo array.
`,
      },
      {
        type: 'quiz',
        question: 'O que aparece?',
        code: `class Contador {
  constructor() { this.valor = 0; }
  inc() { this.valor++; return this; }
}
const c = new Contador();
c.inc().inc().inc();
console.log(c.valor);`,
        options: ['3', '1', 'undefined', 'TypeError'],
        answer: 0,
        explain: 'Como `inc` devolve `this` (o próprio objeto), dá para **encadear** chamadas. Cada `inc` soma 1 no mesmo objeto: 3. É o padrão dos "builders" (ex.: query builders de banco).',
      },
      {
        type: 'quiz',
        question: 'O que acontece?',
        code: `class Animal {
  constructor(nome) { this.nome = nome; }
}
class Cachorro extends Animal {
  constructor(nome) {
    this.raca = "vira-lata";
    super(nome);
  }
}
new Cachorro("Rex");`,
        options: ['ReferenceError: precisa chamar super antes de usar this', 'Cria o cachorro normalmente', 'raca fica undefined'],
        answer: 0,
        explain: 'Numa classe filha, o objeto só existe depois do `super(...)`. Usar `this` antes dele lança **ReferenceError**. Regra: `super` na primeira linha do constructor.',
      },
      {
        type: 'callout',
        tone: 'tip',
        title: 'Classe ou função + objeto?',
        md: `
- Use **classe** quando houver **estado + comportamento** juntos e várias instâncias (uma conta, um carrinho, um serviço no NestJS).
- Para transformar dados, prefira **funções** simples. Nem tudo precisa ser classe.
- **Composição antes de herança**: herde só quando a relação for de verdade "é um" (Gerente **é um** Funcionário). Para "tem um" (Pedido **tem um** Cliente), guarde um objeto dentro do outro. Herança profunda (A → B → C → D) fica difícil de mudar.
`,
      },
      {
        type: 'callout',
        tone: 'interview',
        md: '"O que é herança prototípica?", "diferença entre classe e objeto?", "o que faz o `new`?" (cria um objeto vazio, liga ao protótipo, roda o constructor com `this` apontando para ele e o devolve) e "para que servem campos privados?". Os 4 pilares da OO (encapsulamento, herança, polimorfismo, abstração) também aparecem bastante.',
      },
    ],
  },

  /* ============================================================ */
  {
    id: 'erros',
    title: 'Erros e exceções',
    short: 'throw, try/catch/finally, tipos de erro e erros customizados.',
    summary: 'Avisar quando algo deu errado, tratar no lugar certo e nunca deixar o erro sumir em silêncio.',
    color: '#db4b4b',
    problems: ['js-safe-parse', 'js-validate-user', 'js-attempt'],
    lesson: [
      {
        type: 'analogy',
        title: 'O disjuntor da casa',
        md: `
Quando dá um curto-circuito, o **disjuntor desarma**: a energia para na hora, antes de causar um incêndio. Alguém vai até o **quadro de luz**, entende o que aconteceu e decide o que fazer.

- \`throw\` é o disjuntor desarmando: a função **para imediatamente** e avisa que algo deu errado.
- \`try/catch\` é o quadro de luz: o lugar onde alguém **trata** o problema.
- \`finally\` é "apagar a luz ao sair": roda **sempre**, dando certo ou errado.

Engolir o erro (\`catch {}\` vazio) é como colocar um prego no lugar do disjuntor: o problema continua lá, só que agora ninguém fica sabendo.
`,
      },
      {
        type: 'text',
        md: `
### Lançando e capturando

\`\`\`
function sacar(saldo, valor) {
  if (valor > saldo) {
    throw new Error("saldo insuficiente");   // a função para aqui
  }
  return saldo - valor;
}

try {
  const novo = sacar(100, 500);
  console.log(novo);                        // não roda
} catch (erro) {
  console.log("Falhou:", erro.message);     // "Falhou: saldo insuficiente"
} finally {
  console.log("fim da operação");           // roda sempre
}
\`\`\`

Quando um erro é lançado, o JS **sobe pela pilha de chamadas** procurando um \`try/catch\`. Se ninguém tratar, o programa (ou a requisição, no Node) quebra com "Uncaught Error".

### Tipos de erro que você vai ver

- **\`TypeError\`**: usar um valor do jeito errado: \`undefined.nome\`, chamar algo que não é função.
- **\`ReferenceError\`**: variável que não existe (ou usada antes do \`let\`).
- **\`SyntaxError\`**: código (ou JSON) mal escrito.
- **\`RangeError\`**: número fora do permitido (\`new Array(-1)\`, recursão infinita).
`,
      },
      {
        type: 'demo',
        title: 'O caminho do erro',
        caption: 'Avance e veja: quando o throw acontece, as linhas seguintes do try são puladas e a execução vai direto para o catch. O finally roda nos dois casos.',
        fnName: 'processar',
        input: [[50, 500, 20]],
        code: `function sacar(saldo, valor) {
  if (valor > saldo) throw new Error('saldo insuficiente');
  return saldo - valor;
}

function processar(saques) {
  let saldo = 100;
  const log = [];
  for (const valor of saques) {
    try {
      saldo = sacar(saldo, valor);
      log.push('ok ' + valor);
    } catch (e) {
      log.push('erro: ' + e.message);
    } finally {
      log.push('saldo ' + saldo);
    }
  }
  return log;
}
`,
      },
      {
        type: 'text',
        md: `
### Erros customizados

Para diferenciar "o usuário digitou errado" de "o banco caiu", crie suas próprias classes de erro:

\`\`\`
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

try {
  throw new ValidationError("email inválido");
} catch (e) {
  if (e instanceof ValidationError) {
    // responde 400 para o usuário com a mensagem
  } else {
    throw e; // não é meu: deixa subir
  }
}
\`\`\`

No NestJS é exatamente assim que funcionam \`BadRequestException\`, \`NotFoundException\` etc.
`,
      },
      {
        type: 'quiz',
        question: 'O que é impresso?',
        code: `function f() {
  try {
    return "try";
  } finally {
    console.log("finally");
  }
}
console.log(f());`,
        options: ['"finally" e depois "try"', 'só "try"', '"try" e depois "finally"', 'só "finally"'],
        answer: 0,
        explain: 'O `finally` roda **mesmo** com `return` dentro do `try`: o valor de retorno fica "guardado", o `finally` executa (imprime "finally") e só então a função devolve "try", que o `console.log` de fora imprime.',
      },
      {
        type: 'quiz',
        question: 'Qual o problema deste código?',
        code: `try {
  salvarPedido(pedido);
} catch (e) {}`,
        options: ['O erro some em silêncio: ninguém fica sabendo que o pedido não foi salvo', 'Nenhum, é a forma recomendada', 'SyntaxError: catch precisa de código'],
        answer: 0,
        explain: 'Um `catch` vazio **engole** o erro. O usuário acha que o pedido foi salvo e ninguém descobre o bug. No mínimo, registre (`console.error`/logger) e avise quem chamou, ou nem capture e deixe o erro subir até quem sabe tratar.',
      },
      {
        type: 'callout',
        tone: 'tip',
        title: 'Boas práticas',
        md: `
- **Lance \`Error\` (ou subclasses)**, nunca strings: \`throw "falhou"\` não tem stack trace nem \`.message\`.
- **Mensagens úteis**: "email inválido: falta @" é melhor que "erro".
- **Capture onde dá para fazer algo**: mostrar mensagem, tentar de novo, usar um valor padrão. Se não dá, deixe subir.
- **Falhe cedo**: valide as entradas no começo da função (guard clauses com \`throw\`).
- Erro esperado (validação de formulário) pode ser um retorno; erro inesperado (banco fora do ar) deve ser exceção.
`,
      },
      {
        type: 'callout',
        tone: 'interview',
        md: '"Como você trata erros numa API?" é pergunta frequente. Uma boa resposta: erros de domínio com classes próprias (validação, não encontrado), um tratador central que converte em status HTTP (400, 404, 500), log dos erros inesperados e nunca expor stack trace para o cliente.',
      },
    ],
  },

  /* ============================================================ */
  {
    id: 'recursao',
    title: 'Recursão',
    short: 'Funções que chamam a si mesmas: caso base, pilha e árvores.',
    summary: 'Resolver um problema grande resolvendo uma versão menor dele mesmo, a base de árvores, backtracking e programação dinâmica.',
    color: '#73daca',
    problems: ['js-sum-nested', 'js-flatten', 'js-folder-size'],
    lesson: [
      {
        type: 'analogy',
        title: 'A fila do cinema no escuro',
        md: `
Você está numa fila escura e quer saber **em que posição está**. Não dá para contar. Então você pergunta para a pessoa da frente: "qual a sua posição?". Ela não sabe, e pergunta para a da frente dela... até chegar na **primeira pessoa**, que sabe responder: "sou a 1ª".

A resposta volta pela fila: "sou a 2ª", "sou a 3ª"... até chegar em você.

- **Caso base**: a primeira pessoa, que responde **sem perguntar** para ninguém. Sem ele, a pergunta nunca termina.
- **Caso recursivo**: "minha posição = posição da pessoa da frente + 1".

Isso é recursão: resolver o problema **confiando** na resposta de uma versão **menor** do mesmo problema.
`,
      },
      {
        type: 'text',
        md: `
### A receita

\`\`\`
function fatorial(n) {
  if (n <= 1) return 1;            // 1. caso base: para aqui
  return n * fatorial(n - 1);      // 2. caso recursivo: problema menor
}
fatorial(4); // 4 * 3 * 2 * 1 = 24
\`\`\`

Toda função recursiva precisa de:

1. **Caso base**: a situação mais simples, respondida direto.
2. **Passo que aproxima do caso base**: a chamada recursiva com uma entrada **menor** (\`n - 1\`, o resto da lista, o filho da árvore).

Cada chamada fica **esperando** na pilha de chamadas até a de baixo responder. Sem caso base, a pilha cresce até estourar: \`RangeError: Maximum call stack size exceeded\` (o famoso **stack overflow**).
`,
      },
      {
        type: 'demo',
        title: 'Somando um array aninhado',
        caption: 'Veja a árvore de chamadas: cada array interno gera uma nova chamada de soma, e o resultado volta para quem chamou.',
        fnName: 'soma',
        input: [[1, [2, 3], [4, [5]]]],
        code: `function soma(lista) {
  let total = 0;
  for (const item of lista) {
    if (Array.isArray(item)) {
      total += soma(item);
    } else {
      total += item;
    }
  }
  return total;
}
`,
      },
      {
        type: 'text',
        md: `
### Quando recursão brilha

Quando o dado tem **forma de árvore** (algo que contém coisas do mesmo tipo):

- pastas que contêm pastas;
- comentários com respostas que têm respostas;
- menus com submenus;
- o DOM (elementos dentro de elementos);
- JSON aninhado.

Com um loop simples você não sabe quantos níveis existem. Com recursão, cada nível trata o seu e **delega** os filhos.

Para listas simples (somar 1 a 100), o \`for\` é mais claro e não corre risco de estourar a pilha.
`,
      },
      {
        type: 'quiz',
        question: 'O que acontece?',
        code: `function contagem(n) {
  console.log(n);
  contagem(n - 1);
}
contagem(3);`,
        options: ['Imprime 3, 2, 1, 0, -1... até RangeError (stack overflow)', 'Imprime 3, 2, 1', 'Imprime 3 e para', 'SyntaxError'],
        answer: 0,
        explain: 'Não há **caso base**: nada faz a função parar. As chamadas se acumulam na pilha até o limite e o JS lança `RangeError: Maximum call stack size exceeded`. Correção: `if (n < 0) return;` antes de continuar.',
      },
      {
        type: 'quiz',
        question: 'Qual o resultado de `f(3)`?',
        code: `function f(n) {
  if (n === 0) return "";
  return f(n - 1) + n;
}`,
        options: ['"123"', '"321"', '6', '""'],
        answer: 0,
        explain: '`f(3) = f(2) + 3`, `f(2) = f(1) + 2`, `f(1) = f(0) + 1`, `f(0) = ""`. Voltando: `"" + 1 = "1"`, `"1" + 2 = "12"`, `"12" + 3 = "123"`. A ordem vem da **volta** das chamadas.',
      },
      {
        type: 'callout',
        tone: 'tip',
        title: 'Como pensar sem se perder',
        md: `
1. Escreva o **caso base** primeiro (lista vazia, n = 0, nó sem filhos).
2. **Confie** que a chamada recursiva funciona para a entrada menor (o "salto de fé"). Não tente simular todas as chamadas de cabeça.
3. Pergunte: "se eu já tivesse a resposta para o pedaço menor, como eu monto a resposta do todo?".
`,
      },
      {
        type: 'callout',
        tone: 'interview',
        md: 'Recursão é a base dos padrões **Trees**, **Backtracking** e **Dynamic Programming** do módulo de LeetCode. Perguntas comuns: "o que é caso base?", "o que causa stack overflow?" e "recursão ou loop: qual usar?" (recursão para estruturas em árvore; loop quando a profundidade pode ser muito grande).',
      },
    ],
  },
]
