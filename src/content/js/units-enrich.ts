import type { Block } from '../types'

/**
 * Analogias do dia a dia (no começo) e dicas de entrevista (no fim)
 * para as 7 aulas originais do módulo. Aplicadas em index.ts.
 */
export const ENRICH: Record<string, { before: Block[]; after: Block[] }> = {
  'tipos-coercao': {
    before: [
      {
        type: 'analogy',
        title: 'O tradutor automático',
        md: `
Imagine um tradutor que, quando duas pessoas falam línguas diferentes, **traduz sozinho** sem perguntar. Na maioria das vezes ajuda. Mas às vezes ele traduz "5 reais" como "texto 5" e a conta vira uma frase.

Isso é a **coerção**: quando um operador recebe tipos diferentes, o JavaScript converte um deles **por conta própria**.

E o \`===\` é o segurança que confere **documento e foto**: tem que ser o mesmo valor **e** o mesmo tipo. O \`==\` aceita "parecido": deixa passar \`"5"\` no lugar de \`5\`.
`,
      },
    ],
    after: [
      {
        type: 'callout',
        tone: 'interview',
        md: '"Diferença entre `==` e `===`?", "quais são os tipos primitivos?", "por que `typeof null` é `object`?" e "o que é NaN?" (o único valor diferente de si mesmo: `NaN === NaN` é false). Responda com a regra **e** com o que você faz na prática: "uso sempre `===` e converto explicitamente com `Number()`".',
      },
    ],
  },
  'escopo-closures': {
    before: [
      {
        type: 'analogy',
        title: 'Vidro espelhado e mochila',
        md: `
**Escopo** é como um prédio com **vidro espelhado**: de dentro de uma sala você enxerga o corredor e a rua (os escopos de fora), mas quem está na rua não enxerga dentro da sala. Uma função vê as variáveis de fora; o código de fora não vê as variáveis de dentro da função.

**Closure** é uma **mochila**: quando uma função nasce dentro de outra, ela leva na mochila as variáveis do lugar onde nasceu. Mesmo depois que a função de fora termina, a de dentro continua com a mochila nas costas, podendo ler e alterar o que está lá.
`,
      },
    ],
    after: [
      {
        type: 'callout',
        tone: 'interview',
        md: '"O que é closure? Dê um exemplo." é provavelmente a pergunta de JS mais feita para júnior. Resposta forte: definição (função + escopo onde foi criada), um exemplo curto (contador ou `debounce`) e onde você usa no dia a dia (estado privado, callbacks, hooks do React). O loop com `var` + `setTimeout` também cai muito.',
      },
    ],
  },
  'this-funcoes': {
    before: [
      {
        type: 'analogy',
        title: 'A palavra "eu"',
        md: `
A palavra **"eu"** não tem um dono fixo: quando a Ana fala "eu", é a Ana; quando o Bruno fala, é o Bruno. Quem é "eu" depende de **quem está falando**.

O \`this\` de uma função comum é igual: depende de **quem chamou** a função (o objeto antes do ponto).

Já a **arrow function** é um **gravador**: ela repete o "eu" de quem gravou a mensagem, não importa quem aperte o play. O \`this\` dela é o do lugar onde ela foi **escrita**.
`,
      },
    ],
    after: [
      {
        type: 'callout',
        tone: 'interview',
        md: '"Como funciona o `this`?", "diferença entre `call`, `apply` e `bind`?" e "por que perdemos o `this` ao passar um método como callback?". Um bom fechamento: "em classes e componentes, uso arrow functions nos callbacks para manter o `this` do método".',
      },
    ],
  },
  'arrays-metodos': {
    before: [
      {
        type: 'analogy',
        title: 'A linha de produção',
        md: `
Numa fábrica, as peças passam por **estações**:

- a estação de **pintura** recebe cada peça e devolve a peça pintada: é o \`map\` (mesma quantidade, cada uma transformada);
- o **controle de qualidade** deixa passar só as boas: é o \`filter\` (menos peças, nenhuma alterada);
- a **embalagem** junta tudo numa caixa só: é o \`reduce\` (muitas peças viram um único resultado);
- o **inspetor** que procura a primeira peça com defeito e para ali: é o \`find\` / \`some\`.

Cada estação entrega uma **esteira nova** para a próxima: a esteira original continua intacta.
`,
      },
    ],
    after: [
      {
        type: 'callout',
        tone: 'interview',
        md: '"Diferença entre `map` e `forEach`?" (`map` devolve um array novo; `forEach` devolve `undefined` e serve para efeitos colaterais), "implemente o seu `map`/`filter`/`reduce`" e "quais métodos alteram o array?". Saber escrever um `reduce` que monta um objeto (agrupar por categoria) impressiona.',
      },
    ],
  },
  'objetos-referencias': {
    before: [
      {
        type: 'analogy',
        title: 'O endereço da casa',
        md: `
Se você passa para um amigo o **endereço** da sua casa, você não deu uma casa para ele: deu um papel que **aponta** para a mesma casa. Se ele for lá e pintar a parede de azul, quando você chegar em casa a parede estará azul.

Variáveis com objetos e arrays guardam esse **endereço** (a referência), não o objeto em si. \`const b = a\` copia o papel com o endereço.

E a **cópia rasa** (\`{ ...obj }\`) é como fazer uma **cópia da pasta de documentos** que tem um **pen drive** dentro: as folhas são novas, mas o pen drive continua sendo o mesmo. Quem alterar o pen drive "da cópia" altera o seu.
`,
      },
    ],
    after: [
      {
        type: 'callout',
        tone: 'interview',
        md: '"Passagem por valor ou referência?" (JS sempre copia o valor; para objetos, o valor é a referência), "cópia rasa × profunda" e "por que não mutar o estado no React?" (o React compara referências para saber se precisa renderizar de novo).',
      },
    ],
  },
  'map-set': {
    before: [
      {
        type: 'analogy',
        title: 'Lista de convidados e chaveiro do manobrista',
        md: `
- **Set** é a **lista de convidados** na porta: cada nome aparece **uma vez só**, e o segurança confere se alguém está na lista **na hora**, sem ler a lista inteira.
- **Map** é o **quadro de chaves do manobrista**: cada gancho (a chave do Map) guarda um carro (o valor). E diferente de um objeto comum, o gancho pode ser **qualquer coisa**: um número, um objeto, até uma função.

Os dois respondem "isso existe aqui?" em tempo **constante**, enquanto procurar num array é ler item por item.
`,
      },
    ],
    after: [
      {
        type: 'callout',
        tone: 'interview',
        md: 'Map e Set são a ferramenta nº 1 do padrão **Arrays & Hashing** do LeetCode (Two Sum, Contains Duplicate, Group Anagrams). Saber dizer "troco a busca O(n) do `includes` por um `Set` com `has` O(1)" é exatamente o raciocínio que o entrevistador quer ouvir.',
      },
    ],
  },
  'sintaxe-moderna': {
    before: [
      {
        type: 'analogy',
        title: 'Desfazer a mala e o estepe',
        md: `
- **Desestruturar** é **desfazer a mala** na chegada: em vez de ficar escrevendo \`mala.camiseta\`, \`mala.escova\`, você tira o que precisa e coloca cada coisa numa gaveta com nome: \`const { camiseta, escova } = mala\`.
- **Spread** (\`...\`) é **despejar** o conteúdo de uma caixa dentro de outra.
- **\`?.\`** é **bater na porta antes de entrar**: se não tem ninguém (\`null\`/\`undefined\`), você vai embora sem arrombar (sem TypeError).
- **\`??\`** é o **estepe**: só é usado quando o pneu **não existe** (\`null\`/\`undefined\`), e não quando ele está "vazio" (\`0\`, \`""\`, \`false\`). Já o \`||\` troca o pneu sempre que ele parece vazio.
`,
      },
    ],
    after: [
      {
        type: 'callout',
        tone: 'interview',
        md: '"Diferença entre `||` e `??`?", "spread × rest?" e leitura de código com desestruturação aninhada. Em projetos React/Node você vai escrever essa sintaxe o dia inteiro: no live coding, usá-la com naturalidade passa a impressão de quem já trabalha com JS moderno.',
      },
    ],
  },
}
