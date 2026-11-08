import { starter } from '../../js/helpers'
import type { IfoodProblemEntry } from './index'

// Obs.: os geradores de `perf`, o `harness` e as soluções vão como texto para o worker: precisam ser autocontidos
// (nada de importar de src/lib/rag). A referência para conferir os esperados é src/lib/rag/core.ts.

/** Seção 2: o pipeline de RAG, do chunking até a resposta com fontes (o último exercício é no formato HackerRank). */
export const RAG_PROBLEM_LIST: IfoodProblemEntry[] = [
  /* ------------------------------ 1. Chunking ------------------------------ */
  {
    topic: 'Chunking',
    problem: {
      id: 'ifood-rag-chunk',
      title: 'Dividindo a política em trechos',
      difficulty: 'Médio',
      pattern: 'rag-pipeline',
      related: ['ifood:rag-pipeline'],
      fnName: 'chunk',
      params: ['text', 'size', 'overlap'],
      description: `
A central de ajuda do app tem políticas longas (cancelamento, reembolso, cupons...). Para o assistente de suporte (RAG) buscar só o pedaço certo, o texto é dividido em **trechos** (*chunks*) de tamanho parecido.

Escreva \`chunk(text, size, overlap)\`, que divide \`text\` em **janelas de \`size\` palavras**. Cada janela repete as \`overlap\` últimas palavras da anterior, para que uma frase cortada no meio de um trecho apareça inteira no seguinte.

- Palavras são separadas por **qualquer espaço em branco** (espaços, quebras de linha, tabs; vários seguidos contam como um só).
- A janela seguinte começa \`size - overlap\` palavras depois da anterior.
- **Pare assim que uma janela alcançar o fim do texto**: não gere um trecho a mais só com palavras que já apareceram.
- A última janela pode ter menos de \`size\` palavras.
- Texto vazio (ou só espaços) devolve \`[]\`.

Cada trecho é devolvido como as palavras juntas por **um espaço**.
`,
      format: {
        input:
          '`text`: string com a política.\n`size`: inteiro, quantas palavras cabem em cada trecho.\n`overlap`: inteiro, quantas palavras do fim de um trecho se repetem no início do próximo (`0 ≤ overlap < size`).',
        output: 'Um array de strings: os trechos, na ordem em que aparecem no texto.',
      },
      examples: [
        {
          input: 'text = "Pedido atrasado mais de 30 minutos pode ser cancelado sem custo pelo cliente no app"\nsize = 5\noverlap = 2',
          output:
            '["Pedido atrasado mais de 30", "de 30 minutos pode ser", "pode ser cancelado sem custo", "sem custo pelo cliente no", "cliente no app"]',
          explanation:
            'O texto tem 15 palavras e a janela anda 5 - 2 = 3 palavras por vez (começa nas palavras 0, 3, 6, 9 e 12). A última janela, a partir da palavra 12, já chega ao fim e só tem 3 palavras.',
        },
      ],
      constraints: [
        '0 ≤ text.length ≤ 2 · 10^6 caracteres',
        '1 ≤ size ≤ 10^5',
        '0 ≤ overlap < size',
        'O texto tem até 2 · 10^5 palavras.',
      ],
      starter: starter(
        'function chunk(text, size, overlap)',
        'function chunk(text: string, size: number, overlap: number): string[]',
        `/**
 * @param {string} text
 * @param {number} size
 * @param {number} overlap
 * @return {string[]}
 */`,
      ),
      tests: [
        {
          input: ['Pedido atrasado mais de 30 minutos pode ser cancelado sem custo pelo cliente no app', 5, 2],
          expected: ['Pedido atrasado mais de 30', 'de 30 minutos pode ser', 'pode ser cancelado sem custo', 'sem custo pelo cliente no', 'cliente no app'],
          label: 'Exemplo 1',
        },
        { input: ['a b c d e f g h i j', 4, 1], expected: ['a b c d', 'd e f g', 'g h i j'], label: 'A última janela fecha justo no fim' },
        { input: ['um dois', 5, 2], expected: ['um dois'], label: 'Texto menor que uma janela' },
        { input: ['', 3, 1], expected: [], label: 'Texto vazio', hidden: true },
        { input: ['   \n\t  ', 3, 1], expected: [], label: 'Só espaços em branco', hidden: true },
        { input: ['a b c d', 3, 2], expected: ['a b c', 'b c d'], label: 'Sem trecho repetido no final', hidden: true },
        { input: ['a b c d e f', 3, 0], expected: ['a b c', 'd e f'], label: 'Sem sobreposição', hidden: true },
        { input: ['a b c d e', 2, 1], expected: ['a b', 'b c', 'c d', 'd e'], label: 'Janela de 2 palavras, passo 1', hidden: true },
        { input: ['  frete   grátis\nacima de\tR$ 40  ', 2, 1], expected: ['frete grátis', 'grátis acima', 'acima de', 'de R$', 'R$ 40'], label: 'Espaços, quebras e tabs misturados', hidden: true },
        { input: ['x y z', 3, 2], expected: ['x y z'], label: 'Tamanho igual ao número de palavras', hidden: true },
        {
          input: [Array.from({ length: 10000 }, (_, i) => 'p' + i).join(' '), 1, 0],
          expected: Array.from({ length: 10000 }, (_, i) => 'p' + i),
          label: 'Caso grande: 10^4 palavras, uma por trecho',
          hidden: true,
        },
        {
          input: [Array.from({ length: 20000 }, (_, i) => 'p' + i).join(' '), 20000, 19999],
          expected: [Array.from({ length: 20000 }, (_, i) => 'p' + i).join(' ')],
          label: 'Caso grande: uma janela com todas as palavras',
          hidden: true,
        },
      ],
      hints: [
        'Primeiro separe o texto em palavras (qualquer espaço em branco, e ignore pedaços vazios). Depois pense em janelas de índices: uma começa em `start` e vai até `start + size`.',
        'O passo entre o início de uma janela e o da próxima é `size - overlap`. Use `words.slice(start, start + size)` e `join(" ")` para montar cada trecho.',
        'Depois de guardar um trecho, se `start + size` já alcançou `words.length`, pare com `break`: a janela seguinte só repetiria palavras.',
      ],
      explanation: {
        intuition: `
É uma **janela deslizante** sobre a lista de palavras. Sem sobreposição, uma frase que cai na fronteira de dois trechos fica partida ao meio e nenhum dos dois a responde bem. Repetir as últimas \`overlap\` palavras do trecho anterior dá uma "rede de segurança": o contexto da fronteira aparece nos dois lados.

Pense em tirar fotos de uma faixa de pedestres andando só um pouco a cada foto: duas fotos seguidas mostram parte da mesma cena.
`,
        steps: [
          'Separe `text` em palavras com `split(/\\s+/)` e descarte os pedaços vazios (`filter(Boolean)`): texto vazio vira lista vazia.',
          'Calcule `step = size - overlap`.',
          'Percorra `start = 0, step, 2 · step...` enquanto `start < words.length`.',
          'Em cada passo, guarde `words.slice(start, start + size).join(" ")`.',
          'Se `start + size >= words.length`, a janela já chegou ao fim: dê `break` para não gerar trechos repetidos.',
        ],
        time: 'O(n · size / step)',
        space: 'O(n · size / step)',
        complexityWhy:
          'Cada palavra é copiada para no máximo `ceil(size / step)` trechos, então o trabalho é proporcional ao tamanho da saída. Com `overlap = 0` isso é O(n); com `overlap` quase igual a `size`, cada palavra aparece em quase `size` trechos (é o preço da sobreposição, não um erro). O que não pode acontecer é refazer o `split` ou o `join` do texto inteiro a cada janela: aí seriam O(n) por janela e O(n²) no total.',
        pitfalls: [
          'Chamar `text.split(...)` (ou `slice` no texto original) dentro do laço: com 2 · 10^5 palavras vira bilhões de operações. Separe as palavras uma vez, fora do laço.',
          'Esquecer o `break`: o laço geraria mais janelas só com o final do texto repetido (ex.: `"a b c d"` com `size = 3` e `overlap = 2` ganharia um `"c d"` sobrando).',
          'Usar `text.split(" ")`: dois espaços seguidos ou uma quebra de linha criam "palavras" vazias ou grudadas. Use `/\\s+/` e filtre os vazios; `"".split(/\\s+/)` devolve `[""]`, que não é o mesmo que `[]`.',
          'Trocar `step` por `size`: sem o passo `size - overlap`, a sobreposição deixa de existir.',
        ],
      },
      bruteForce: {
        idea: 'Para cada janela, refazer o `split` do texto inteiro e fatiar as palavras da posição atual.',
        complexity: 'O(n · janelas) tempo, O(n) espaço extra por janela',
      },
      solution: {
        js: String.raw`function chunk(text, size, overlap) {
  const words = text.split(/\s+/).filter(Boolean);
  const step = size - overlap;
  const chunks = [];
  for (let start = 0; start < words.length; start += step) {
    const end = start + size;
    chunks.push(words.slice(start, end).join(' '));
    if (end >= words.length) break;
  }
  return chunks;
}
`,
        ts: String.raw`function chunk(text: string, size: number, overlap: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const step = size - overlap;
  const chunks: string[] = [];
  for (let start = 0; start < words.length; start += step) {
    const end = start + size;
    chunks.push(words.slice(start, end).join(' '));
    if (end >= words.length) break;
  }
  return chunks;
}
`,
      },
      perf: {
        gen: (n: number) => [Array.from({ length: n }, (_, i) => 'palavra' + (i % 500)).join(' '), 50, 10],
        n: 200000,
        limitMs: 2500,
        label: '2 · 10^5 palavras, janelas de 50 com sobreposição de 10',
      },
    },
  },

  /* ------------------------------ 2. Embeddings: TF-IDF ------------------------------ */
  {
    topic: 'Embeddings',
    problem: {
      id: 'ifood-rag-tfidf',
      title: 'Vetores TF-IDF dos trechos',
      difficulty: 'Médio',
      pattern: 'rag-pipeline',
      related: ['ifood:rag-pipeline'],
      fnName: 'tfidf',
      params: ['docs'],
      description: `
Para o assistente de suporte comparar a pergunta do cliente com os trechos da política, cada trecho vira um **vetor de números**. A versão mais simples é o **TF-IDF**: cada posição do vetor é uma palavra, e o valor diz o quanto aquela palavra **caracteriza** o trecho (aparece bastante nele e pouco nos outros).

Escreva \`tfidf(docs)\`. Cada documento já vem **tokenizado** (lista de palavras). Monte:

1. **Vocabulário**: as palavras únicas de todos os documentos, em ordem alfabética com o \`.sort()\` padrão. Cada palavra é uma posição dos vetores.
2. **tf** (frequência no documento): \`quantas vezes a palavra aparece no documento / total de palavras do documento\`.
3. **idf** (raridade da palavra): \`Math.log((N + 1) / (df + 1)) + 1\`, onde \`N\` é o número de documentos e \`df\` é em **quantos documentos** a palavra aparece (conta uma vez por documento, mesmo que se repita).
4. O valor de cada posição é \`tf · idf\`. Um documento vazio vira um vetor só de zeros.

Devolva um vetor por documento, na mesma ordem de \`docs\`, todos com o tamanho do vocabulário.
`,
      format: {
        input: '`docs`: array de documentos; cada documento é um array de strings (palavras já em minúsculas, sem acento e sem pontuação).',
        output: 'Um array com um vetor (array de números) por documento. Todos têm o mesmo tamanho: o número de palavras únicas.',
      },
      examples: [
        {
          input: 'docs = [["reembolso", "pix"], ["reembolso", "cartao"], ["cupom"]]',
          output: '[[0, 0, 0.8466, 0.6438], [0.8466, 0, 0, 0.6438], [0, 1.6931, 0, 0]]',
          explanation:
            'Vocabulário ordenado: ["cartao", "cupom", "pix", "reembolso"]. "reembolso" aparece em 2 dos 3 documentos: idf = ln(4/3) + 1 ≈ 1,2877, e tf = 1/2, então 0,6438. "pix" aparece em 1: idf = ln(4/2) + 1 ≈ 1,6931, tf = 1/2, então 0,8466. "cupom" é o único do terceiro documento: tf = 1, idf ≈ 1,6931. (Os valores do teste são comparados com pequena tolerância.)',
        },
      ],
      constraints: ['1 ≤ docs.length ≤ 200', '0 ≤ docs[i].length ≤ 500', 'O vocabulário tem até 2000 palavras.', 'Cada palavra é uma string não vazia.'],
      starter: starter(
        'function tfidf(docs)',
        'function tfidf(docs: string[][]): number[][]',
        `/**
 * @param {string[][]} docs  documentos já tokenizados
 * @return {number[][]}      um vetor TF-IDF por documento
 */`,
      ),
      compare: 'float',
      tests: [
        {
          input: [[['reembolso', 'pix'], ['reembolso', 'cartao'], ['cupom']]],
          expected: [
            [0, 0, 0.8465735902799727, 0.6438410362258904],
            [0.8465735902799727, 0, 0, 0.6438410362258904],
            [0, 1.6931471805599454, 0, 0],
          ],
          label: 'Exemplo 1',
        },
        {
          input: [[['entrega', 'gratis'], ['entrega', 'taxa', 'taxa'], ['cupom', 'entrega']]],
          expected: [
            [0, 0.5, 0.8465735902799727, 0],
            [0, 0.3333333333333333, 0, 1.1287647870399635],
            [0.8465735902799727, 0.5, 0, 0],
          ],
          label: 'Palavra presente em todos os documentos pesa menos',
        },
        { input: [[['pizza', 'pizza', 'pizza']]], expected: [[1]], label: 'Um documento, uma palavra repetida' },
        {
          input: [[['pizza', 'queijo', 'pizza'], ['sushi', 'queijo'], []]],
          expected: [
            [1.1287647870399635, 0.42922735748392693, 0],
            [0, 0.6438410362258904, 0.8465735902799727],
            [0, 0, 0],
          ],
          label: 'Documento vazio vira vetor de zeros',
          hidden: true,
        },
        { input: [[[], []]], expected: [[], []], label: 'Todos os documentos vazios (vocabulário vazio)', hidden: true },
        { input: [[['a1', 'b2'], ['a1', 'b2']]], expected: [[0.5, 0.5], [0.5, 0.5]], label: 'Documentos idênticos', hidden: true },
        {
          input: [[['30', '5'], ['10', '5', '30']]],
          expected: [
            [0, 0.5, 0.5],
            [0.4684883693, 0.3333333333, 0.3333333333],
          ],
          label: 'Vocabulário em ordem de texto: "10" < "30" < "5"',
          hidden: true,
        },
        {
          input: [[['cupom'], ['frete'], ['pedido']]],
          expected: [
            [1.6931471805599454, 0, 0],
            [0, 1.6931471805599454, 0],
            [0, 0, 1.6931471805599454],
          ],
          label: 'Documentos sem palavra em comum',
          hidden: true,
        },
        {
          input: [[['taxa', 'taxa', 'entrega', 'taxa']]],
          expected: [[0.25, 0.75]],
          label: 'Um documento só: idf vale 1 para todas as palavras',
          hidden: true,
        },
      ],
      hints: [
        'Divida em duas fases: primeiro descubra o vocabulário e o `df` de cada palavra (olhando todos os documentos), depois monte o vetor de cada documento.',
        'Para o `df`, percorra cada documento com `new Set(doc)` (cada palavra conta uma vez por documento). Guarde também a posição de cada palavra do vocabulário em um `Map`.',
        'No vetor de um documento: some 1 na posição de cada ocorrência, depois multiplique cada posição por `idf[i] / doc.length`. Documento vazio: devolva zeros antes de dividir por `doc.length`.',
      ],
      explanation: {
        intuition: `
Palavras como "pedido" aparecem em quase todo trecho e não ajudam a distinguir um do outro; "reembolso" aparece em poucos e diz muito. O **TF-IDF** formaliza isso: o **tf** mede o quanto o trecho fala da palavra, o **idf** mede o quanto a palavra é rara no conjunto, e o produto dá o peso.

É como um índice de livro: a palavra que aparece em todas as páginas não ajuda a achar nada; a que aparece em duas páginas leva você direto ao assunto.
`,
        steps: [
          'Monte o vocabulário: `[...new Set(docs.flat())].sort()`, e um `Map` palavra → posição.',
          'Calcule `df`: para cada documento, para cada palavra única dele, some 1 em `df[posição]`.',
          'Calcule `idf[i] = Math.log((N + 1) / (df[i] + 1)) + 1` para cada palavra do vocabulário.',
          'Para cada documento: se estiver vazio, devolva um vetor de zeros; senão conte as ocorrências de cada palavra.',
          'Divida cada contagem pelo tamanho do documento (tf) e multiplique pelo idf da posição.',
        ],
        time: 'O(V · D + L · log L)',
        space: 'O(V · D)',
        complexityWhy:
          'O vetor de cada documento tem V posições (V = palavras únicas), então a matriz toda tem V · D números, e só montá-la já custa isso. Contar as ocorrências é proporcional ao total de palavras L, e ordenar o vocabulário custa O(V log V). Com os limites (D ≤ 200, V ≤ 2000) são uns 4 · 10^5 números.',
        pitfalls: [
          'Contar o `df` pelas ocorrências em vez de pelos documentos: uma palavra repetida 3 vezes no mesmo documento ainda tem `df = 1`. Use `new Set(doc)`.',
          'Dividir por `doc.length` num documento vazio: dá `NaN` (`0 / 0`). Trate esse caso antes.',
          'Ordenar o vocabulário como número: o `.sort()` padrão compara como texto, então `"10" < "30" < "5"`. A ordem do vetor tem que seguir esse padrão.',
          'Usar `Math.log(N / df)` sem o `+ 1`: uma palavra presente em todos os documentos ficaria com peso 0 e sumiria do vetor. A versão suavizada garante peso positivo.',
        ],
      },
      solution: {
        js: `function tfidf(docs) {
  const vocab = [...new Set(docs.flat())].sort();
  const position = new Map();
  vocab.forEach((term, i) => position.set(term, i));

  // df: em quantos documentos cada palavra aparece (uma vez por documento)
  const df = new Array(vocab.length).fill(0);
  for (const doc of docs) {
    for (const term of new Set(doc)) {
      df[position.get(term)]++;
    }
  }

  const n = docs.length;
  const idf = df.map((d) => Math.log((n + 1) / (d + 1)) + 1);

  return docs.map((doc) => {
    const vector = new Array(vocab.length).fill(0);
    if (doc.length === 0) return vector;
    for (const term of doc) {
      vector[position.get(term)] += 1;
    }
    return vector.map((count, i) => (count / doc.length) * idf[i]);
  });
}
`,
        ts: `function tfidf(docs: string[][]): number[][] {
  const vocab: string[] = [...new Set(docs.flat())].sort();
  const position = new Map<string, number>();
  vocab.forEach((term, i) => position.set(term, i));

  // df: em quantos documentos cada palavra aparece (uma vez por documento)
  const df: number[] = new Array(vocab.length).fill(0);
  for (const doc of docs) {
    for (const term of new Set(doc)) {
      df[position.get(term)!]++;
    }
  }

  const n = docs.length;
  const idf: number[] = df.map((d) => Math.log((n + 1) / (d + 1)) + 1);

  return docs.map((doc) => {
    const vector: number[] = new Array(vocab.length).fill(0);
    if (doc.length === 0) return vector;
    for (const term of doc) {
      vector[position.get(term)!] += 1;
    }
    return vector.map((count, i) => (count / doc.length) * idf[i]);
  });
}
`,
      },
    },
  },

  /* ------------------------------ 3. Similaridade ------------------------------ */
  {
    topic: 'Similaridade',
    problem: {
      id: 'ifood-rag-cosine',
      title: 'Similaridade de cosseno',
      difficulty: 'Fácil',
      pattern: 'rag-pipeline',
      related: ['ifood:rag-pipeline'],
      fnName: 'cosineSimilarity',
      params: ['a', 'b'],
      description: `
Para saber qual trecho da política mais se parece com a pergunta do cliente, o RAG compara **vetores**. A medida mais usada é a **similaridade de cosseno**: o cosseno do ângulo entre os dois vetores. Ela olha para a **direção** (do que o texto fala), não para o tamanho do vetor (o quanto ele repete).

\`cos(a, b) = (a · b) / (|a| · |b|)\`, onde \`a · b\` é a soma dos produtos \`a[i] * b[i]\` e \`|a|\` é a raiz da soma dos quadrados de \`a\`.

- Vetores na mesma direção dão \`1\`; perpendiculares, \`0\`; opostos, \`-1\`.
- Se **algum dos vetores for nulo** (todos os valores zero), não existe direção para comparar: devolva \`0\` (e não \`NaN\`).
`,
      format: {
        input: '`a` e `b`: arrays de números do **mesmo tamanho**.',
        output: 'Um número entre `-1` e `1`: a similaridade de cosseno (`0` se algum vetor for nulo).',
      },
      examples: [
        {
          input: 'a = [1, 1, 0]\nb = [1, 0, 0]',
          output: '0.7071067811865475',
          explanation: 'a · b = 1. |a| = √2 e |b| = 1. Então 1 / √2 ≈ 0,7071 (o ângulo entre eles é de 45°). O teste compara com pequena tolerância.',
        },
      ],
      constraints: ['1 ≤ a.length = b.length ≤ 10^5', '-10^4 ≤ a[i], b[i] ≤ 10^4 (podem ser decimais)'],
      starter: starter(
        'function cosineSimilarity(a, b)',
        'function cosineSimilarity(a: number[], b: number[]): number',
        `/**
 * @param {number[]} a
 * @param {number[]} b
 * @return {number}
 */`,
      ),
      compare: 'float',
      tests: [
        { input: [[1, 1, 0], [1, 0, 0]], expected: 0.7071067811865475, label: 'Exemplo 1' },
        { input: [[3, 4], [4, 3]], expected: 0.96, label: 'Vetores parecidos' },
        { input: [[1, 2, 3], [2, 4, 6]], expected: 1, label: 'Proporcionais (mesma direção)' },
        { input: [[1, 0], [0, 5]], expected: 0, label: 'Ortogonais', hidden: true },
        { input: [[1, -2, 3], [-1, 2, -3]], expected: -1, label: 'Opostos', hidden: true },
        { input: [[-1, -2], [-3, -1]], expected: 0.7071067811865475, label: 'Valores negativos', hidden: true },
        { input: [[4], [9]], expected: 1, label: 'Um elemento, mesmo sinal', hidden: true },
        { input: [[4], [-9]], expected: -1, label: 'Um elemento, sinais opostos', hidden: true },
        { input: [[0, 0, 0], [1, 2, 3]], expected: 0, label: 'Primeiro vetor nulo', hidden: true },
        { input: [[1, 2, 3], [0, 0, 0]], expected: 0, label: 'Segundo vetor nulo', hidden: true },
        { input: [[0, 0], [0, 0]], expected: 0, label: 'Os dois vetores nulos', hidden: true },
        { input: [[0.5, 0.5, 0], [0, 0.5, 0.5]], expected: 0.5, label: 'Decimais', hidden: true },
        {
          input: [Array.from({ length: 1000 }, (_, i) => (i % 7) + 1), Array.from({ length: 1000 }, (_, i) => ((i % 7) + 1) * 3)],
          expected: 1,
          label: 'Caso grande: 1000 posições, proporcionais',
          hidden: true,
        },
        {
          input: [Array.from({ length: 1000 }, (_, i) => (i % 2 === 0 ? 1 : 0)), Array.from({ length: 1000 }, (_, i) => (i % 2 === 0 ? 0 : 1))],
          expected: 0,
          label: 'Caso grande: 1000 posições, ortogonais',
          hidden: true,
        },
      ],
      hints: [
        'Você precisa de três somas: `a · b`, a soma dos quadrados de `a` e a soma dos quadrados de `b`. Dá para calcular as três no mesmo laço.',
        'No final, o resultado é `dot / (Math.sqrt(normA) * Math.sqrt(normB))`. O que acontece quando `normA` ou `normB` é 0?',
        'Antes de dividir, se algum dos dois quadrados somados for 0, devolva `0`: dividir por zero daria `NaN`.',
      ],
      explanation: {
        intuition: `
Dois textos que falam do mesmo assunto apontam para a mesma "direção" no espaço de palavras, mesmo que um seja mais longo (e portanto tenha números maiores). O cosseno do ângulo entre os vetores ignora o comprimento e mede só a direção.

Pense em duas pessoas apontando para o mesmo prédio de lugares diferentes: se os braços apontam para o mesmo lugar, o ângulo é zero e o cosseno é 1, não importa o quanto estão longe do prédio.
`,
        steps: [
          'Comece com `dot = 0`, `normA = 0`, `normB = 0`.',
          'Para cada posição `i`, some `a[i] * b[i]` em `dot`, `a[i] * a[i]` em `normA` e `b[i] * b[i]` em `normB`.',
          'Se `normA === 0` ou `normB === 0`, devolva `0`.',
          'Devolva `dot / (Math.sqrt(normA) * Math.sqrt(normB))`.',
        ],
        time: 'O(n)',
        space: 'O(1)',
        complexityWhy:
          'Uma passada pelos dois vetores, com três somas por posição. Não precisa de espaço extra. Em um RAG real isso roda uma vez por trecho do banco, e é por isso que o custo por comparação importa.',
        pitfalls: [
          'Não tratar o vetor nulo: `0 / 0` é `NaN`, que contamina a ordenação do top-k mais adiante. Devolva `0`.',
          'Esquecer as raízes quadradas (usar `normA * normB` direto): o resultado deixa de ficar entre -1 e 1.',
          'Comparar o resultado com `=== 1` ou `=== 0.5`: números decimais têm erro de arredondamento (ex.: `0.9999999999999999`). Compare com tolerância, como o teste faz.',
          'Calcular três laços separados: funciona, mas é mais lento e mais código do que precisa.',
        ],
      },
      bruteForce: {
        idea: 'Três laços separados (produto escalar e as duas normas), cada um percorrendo o vetor inteiro.',
        complexity: 'O(n) tempo, O(1) espaço (só com mais passadas)',
      },
      solution: {
        js: `function cosineSimilarity(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
`,
        ts: `function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
`,
      },
    },
  },

  /* ------------------------------ 4. Busca: top-k ------------------------------ */
  {
    topic: 'Busca',
    problem: {
      id: 'ifood-rag-topk',
      title: 'Os k trechos mais parecidos',
      difficulty: 'Médio',
      pattern: 'rag-pipeline',
      related: ['ifood:rag-pipeline'],
      fnName: 'topK',
      params: ['query', 'vectors', 'k'],
      description: `
Com a pergunta do cliente e os trechos da política já transformados em vetores, falta **buscar**: quais são os \`k\` trechos mais parecidos com a pergunta? Esses trechos vão para o prompt do assistente.

Escreva \`topK(query, vectors, k)\`, que devolve os **índices** (posição em \`vectors\`) dos \`k\` vetores com maior **similaridade de cosseno** com \`query\`:

- ordem do **mais parecido para o menos**;
- em caso de **empate** de similaridade, vem primeiro o **menor índice**;
- se \`k\` for maior que a quantidade de vetores, devolva todos;
- um vetor nulo (tudo zero) tem similaridade \`0\` com qualquer coisa (inclusive se a \`query\` for nula): ele não quebra a busca, só fica no meio, abaixo dos positivos e acima dos negativos.

Implemente o cosseno dentro da sua solução: \`cos(a, b) = (a · b) / (|a| · |b|)\`.
`,
      format: {
        input: '`query`: array de números (a pergunta como vetor).\n`vectors`: array de vetores (arrays de números), todos do mesmo tamanho de `query`.\n`k`: inteiro, quantos resultados devolver.',
        output: 'Um array com até `k` índices de `vectors`, do mais parecido para o menos parecido com `query`.',
      },
      examples: [
        {
          input: 'query = [1, 0, 1]\nvectors = [[0, 1, 0], [1, 0, 1], [1, 1, 1], [2, 0, 1]]\nk = 2',
          output: '[1, 3]',
          explanation: 'Similaridades: índice 0 → 0, índice 1 → 1,00, índice 2 → 0,82, índice 3 → 0,95. Os dois maiores são os índices 1 e 3.',
        },
      ],
      constraints: ['1 ≤ vectors.length ≤ 2 · 10^4', '1 ≤ query.length ≤ 64', '1 ≤ k ≤ 10^5', 'Os valores são números entre -10^3 e 10^3.', 'Empates de verdade só acontecem entre vetores idênticos (ou na mesma direção, com scores exatamente iguais).'],
      starter: starter(
        'function topK(query, vectors, k)',
        'function topK(query: number[], vectors: number[][], k: number): number[]',
        `/**
 * @param {number[]} query
 * @param {number[][]} vectors
 * @param {number} k
 * @return {number[]}  índices, do mais parecido para o menos
 */`,
      ),
      tests: [
        { input: [[1, 0, 1], [[0, 1, 0], [1, 0, 1], [1, 1, 1], [2, 0, 1]], 2], expected: [1, 3], label: 'Exemplo 1' },
        { input: [[1, 0], [[0, 1], [1, 0], [2, 0], [1, 1]], 3], expected: [1, 2, 3], label: 'Empate: o menor índice vem primeiro' },
        { input: [[0, 1], [[1, 0], [1, 1]], 5], expected: [1, 0], label: 'k maior que a quantidade de vetores' },
        { input: [[1, 0], [[1, 0], [0, 1], [1, 0], [3, 0]], 2], expected: [0, 2], label: 'Empate corta em k: ficam os menores índices', hidden: true },
        { input: [[1, 0], [[-1, 0], [0, 0], [0, 1], [1, 0.1]], 4], expected: [3, 1, 2, 0], label: 'Vetor nulo fica entre positivos e negativos', hidden: true },
        { input: [[0, 0], [[1, 0], [0, 1], [1, 1]], 2], expected: [0, 1], label: 'Pergunta nula: tudo empata em 0', hidden: true },
        { input: [[1, 0], [[-1, 0.1], [-1, -1], [-0.1, -1]], 3], expected: [2, 1, 0], label: 'Só similaridades negativas', hidden: true },
        { input: [[1, 2, 3], [[3, 2, 1], [1, 2, 3.5], [-1, -2, -3], [0, 0, 1]], 1], expected: [1], label: 'k = 1', hidden: true },
        { input: [[1], [[5]], 1], expected: [0], label: 'Um vetor só', hidden: true },
        {
          input: [[0, 1], Array.from({ length: 3000 }, (_, i) => [1, i]), 3],
          expected: [2999, 2998, 2997],
          label: 'Caso grande: 3000 vetores, os melhores estão no final',
          hidden: true,
        },
      ],
      hints: [
        'Primeiro calcule a similaridade de cosseno da `query` com cada vetor e guarde junto com o índice: `{ index, score }`.',
        'Ordene esses pares por `score` decrescente e, se o `score` for igual, por `index` crescente. Calcule os scores **uma vez** antes de ordenar, não dentro do comparador.',
        'Corte com `slice(0, k)` (se `k` for maior que o tamanho, o `slice` já devolve tudo) e transforme em lista de índices com `map`. Lembre do vetor nulo: o cosseno dele é 0.',
      ],
      explanation: {
        intuition: `
É a etapa de **busca** do RAG: dar uma nota para cada trecho e ficar com os melhores. A nota é o cosseno entre a pergunta e o trecho; o resto é ordenar e cortar.

Pense numa fila de candidatos a uma vaga: primeiro dá-se uma nota a cada um (uma vez só), depois ordena-se pela nota e chamam-se os \`k\` primeiros. O desempate pelo menor índice faz o resultado ser sempre o mesmo para a mesma entrada.
`,
        steps: [
          'Crie um helper `cosine(a, b)` (produto escalar dividido pelo produto das normas; `0` se algum vetor for nulo).',
          'Monte `scored = vectors.map((v, index) => ({ index, score: cosine(query, v) }))`.',
          'Ordene com `(x, y) => y.score - x.score || x.index - y.index`.',
          'Pegue os `k` primeiros com `slice(0, k)` e devolva só os índices.',
        ],
        time: 'O(n · d + n log n)',
        space: 'O(n)',
        complexityWhy:
          'Calcular os n scores custa O(d) cada (d é a dimensão do vetor), e a ordenação custa O(n log n). Com n = 2 · 10^4 e d = 32 são uns 6 · 10^5 contas para os scores e uns 3 · 10^5 comparações. Existe uma versão com heap em O(n log k) para k pequeno, mas a ordenação simples já cabe com folga.',
        pitfalls: [
          'Calcular o cosseno dentro do comparador do `sort`: cada comparação refaz duas contas de O(d), multiplicando o custo por uns 17 (log n) sem necessidade. Calcule os scores antes.',
          'Esquecer o desempate pelo índice: o resultado fica correto "em média", mas diferente do esperado quando há scores iguais.',
          'Não tratar o vetor nulo: o cosseno vira `NaN`, o comparador devolve `NaN` e a ordenação fica imprevisível. Devolva 0.',
          'Ordenar o array original de vetores: você perde os índices. Ordene pares `{ index, score }` (ou um array de índices).',
          'Usar `splice`/`slice(0, k)` achando que erra quando `k > n`: o `slice` aceita e devolve tudo, então não precisa de `if`.',
        ],
      },
      bruteForce: {
        idea: 'Escolher o melhor vetor k vezes (varrendo todos e removendo o escolhido a cada rodada), recalculando scores quando precisa.',
        complexity: 'O(k · n · d) tempo',
      },
      solution: {
        js: `function cosine(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function topK(query, vectors, k) {
  const scored = vectors.map((vector, index) => ({ index, score: cosine(query, vector) }));
  scored.sort((x, y) => y.score - x.score || x.index - y.index);
  return scored.slice(0, k).map((item) => item.index);
}
`,
        ts: `function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function topK(query: number[], vectors: number[][], k: number): number[] {
  const scored = vectors.map((vector, index) => ({ index, score: cosine(query, vector) }));
  scored.sort((x, y) => y.score - x.score || x.index - y.index);
  return scored.slice(0, k).map((item) => item.index);
}
`,
      },
      perf: {
        gen: (n: number) => {
          let seed = 12345
          const rnd = () => {
            seed = (seed * 48271) % 2147483647
            return seed / 2147483647 - 0.5
          }
          const query = Array.from({ length: 32 }, () => rnd())
          const vectors = Array.from({ length: n }, () => Array.from({ length: 32 }, () => rnd()))
          return [query, vectors, 5]
        },
        n: 20000,
        limitMs: 2500,
        label: '20 000 vetores de dimensão 32, k = 5',
      },
    },
  },

  /* ------------------------------ 5. Prompt ------------------------------ */
  {
    topic: 'Prompt',
    problem: {
      id: 'ifood-rag-prompt',
      title: 'Prompt com regras e fontes',
      difficulty: 'Fácil',
      pattern: 'rag-pipeline',
      related: ['ifood:rag-pipeline'],
      fnName: 'buildPrompt',
      params: ['question', 'passages'],
      description: `
Achados os trechos mais parecidos com a pergunta, é hora de montar o **prompt** que vai para o modelo. Um bom prompt de RAG diz o que fazer (usar só o contexto, citar a fonte, recusar quando não souber), entrega os trechos **numerados** e termina com a pergunta.

Escreva \`buildPrompt(question, passages)\`, que devolve **uma string** (as linhas separadas por \`\\n\`) que respeite **todas** estas regras:

1. **Trechos:** cada trecho aparece **numa linha própria**, exatamente como \`[id] texto\`, e **na ordem em que foram recebidos** (use o \`id\` do trecho, não a posição).
2. **Regras antes do contexto:** todas as instruções vêm **antes** da primeira linha de trecho.
3. **Recusa:** as regras trazem a frase exata \`Não encontrei essa informação no contexto.\` (com o ponto final) como o que o modelo deve responder quando o contexto não tem a resposta.
4. **Citar a fonte:** as regras pedem para o modelo **citar** o trecho (a palavra *cite* ou *citar*) e trazem um **exemplo com colchetes e número**, como \`[2]\`.
5. **Pergunta no fim:** a **última linha não vazia** é \`Pergunta: \` seguido da pergunta, sem alterar nada.
6. **Contexto vazio:** se não houver trechos, o lugar deles mostra a linha \`(vazio)\`. Havendo trechos, \`(vazio)\` não pode aparecer.

O resto (saudação, linhas em branco, o cabeçalho "Contexto:") é livre. O teste não compara o texto inteiro: ele lista as **regras quebradas**, e você passa quando a lista é vazia (\`[]\`).
`,
      format: {
        input:
          '`question`: string, a pergunta do cliente.\n`passages`: array de objetos `{ id, text }`: o `id` é o número do trecho (inteiro, pode ser qualquer um) e `text`, o texto, em uma única linha.',
        output: 'Uma string com o prompt completo, respeitando as 6 regras acima.',
      },
      examples: [
        {
          input: 'question = "Qual o prazo do reembolso no Pix?"\npassages = [{ id: 2, text: "O reembolso no Pix cai em até 1 hora." }]',
          output:
            'Você é o assistente de suporte de um app de delivery.\nResponda usando APENAS o contexto abaixo.\nCite o trecho de onde veio cada informação, com o número entre colchetes, como [2].\nSe a resposta não estiver no contexto, responda exatamente: "Não encontrei essa informação no contexto."\n\nContexto:\n[2] O reembolso no Pix cai em até 1 hora.\n\nPergunta: Qual o prazo do reembolso no Pix?',
          explanation: 'Este é um prompt válido (há outros). As regras vêm antes da linha `[2] ...`, a recusa e o exemplo `[2]` estão nelas, e a última linha não vazia é a pergunta.',
        },
      ],
      constraints: ['0 ≤ passages.length ≤ 20', '0 ≤ id ≤ 1000 (não é preciso ser sequencial nem único em ordem crescente)', 'Cada `text` e a `question` têm uma linha só, com até 300 caracteres.'],
      starter: starter(
        'function buildPrompt(question, passages)',
        'function buildPrompt(question: string, passages: { id: number; text: string }[]): string',
        `/**
 * @param {string} question
 * @param {{ id: number, text: string }[]} passages
 * @return {string}
 */`,
      ),
      io: {
        harness: String.raw`(buildPrompt, question, passages) => {
  const REFUSAL = 'Não encontrei essa informação no contexto.';
  const problems = [];
  let prompt;
  try {
    prompt = buildPrompt(question, passages);
  } catch (error) {
    return ['a função lançou um erro: ' + error.message];
  }
  if (typeof prompt !== 'string') return ['a função precisa devolver uma string (devolveu ' + typeof prompt + ')'];

  const lines = prompt.split('\n');

  // 1. cada trecho numa linha própria, "[id] texto", na ordem recebida
  const found = [];
  for (const p of passages) {
    const line = '[' + p.id + '] ' + p.text;
    const at = lines.indexOf(line);
    if (at === -1) problems.push('o trecho ' + p.id + ' não aparece numa linha própria como "' + line + '"');
    else found.push(at);
  }
  for (let i = 1; i < found.length; i++) {
    if (found[i] <= found[i - 1]) {
      problems.push('os trechos não estão na ordem em que foram recebidos');
      break;
    }
  }

  // 6. contexto vazio
  const emptyAt = lines.findIndex((l) => l.trim() === '(vazio)');
  if (passages.length === 0 && emptyAt === -1) problems.push('sem trechos, o contexto precisa mostrar a linha "(vazio)"');
  if (passages.length > 0 && emptyAt !== -1) problems.push('há trechos, então "(vazio)" não deve aparecer');

  // onde o contexto começa: tudo antes disso são as regras
  let start = lines.length;
  if (found.length > 0) start = Math.min(...found);
  else if (emptyAt !== -1) start = emptyAt;
  const rules = lines.slice(0, start).join('\n');

  // 2. regras antes do contexto
  if (rules.trim() === '') problems.push('as regras precisam vir antes do contexto');
  // 3. frase exata de recusa
  if (!rules.includes(REFUSAL)) problems.push('antes do contexto, falta a frase exata de recusa: "' + REFUSAL + '"');
  // 4. citar a fonte
  if (!/cit(e|ar)/i.test(rules)) problems.push('antes do contexto, falta pedir para citar a fonte (use "cite" ou "citar")');
  if (!/\[\d+\]/.test(rules)) problems.push('antes do contexto, falta o exemplo de citação com colchetes e número, como [2]');

  // 5. a última linha não vazia é a pergunta
  const filled = lines.filter((l) => l.trim() !== '');
  const last = filled.length ? filled[filled.length - 1].trimEnd() : '';
  if (last !== 'Pergunta: ' + question) problems.push('a última linha não vazia deve ser "Pergunta: ' + question + '"');

  return problems;
}`,
      },
      tests: [
        {
          input: ['Qual o prazo do reembolso no Pix?', [{ id: 2, text: 'O reembolso no Pix cai em até 1 hora.' }]],
          expected: [],
          label: 'Exemplo 1',
        },
        { input: ['Vocês aceitam vale-refeição?', []], expected: [], label: 'Sem trechos: contexto vazio' },
        {
          input: [
            'Posso cancelar depois que o restaurante aceitou?',
            [
              { id: 1, text: 'O cancelamento é grátis até o restaurante aceitar o pedido.' },
              { id: 2, text: 'Depois disso, a taxa é de 50% do valor.' },
            ],
          ],
          expected: [],
          label: 'Dois trechos em ordem',
        },
        {
          input: [
            'Como funciona o cupom?',
            [
              { id: 7, text: 'Cada cupom vale para um único uso por conta.' },
              { id: 3, text: 'O cupom de primeira compra expira 30 dias depois do cadastro.' },
            ],
          ],
          expected: [],
          label: 'Ids fora de ordem: use o id do trecho, não a posição',
          hidden: true,
        },
        {
          input: ['Qual o frete?', [{ id: 12, text: 'Frete grátis [exceto ilhas e áreas rurais]: veja o mapa de cobertura.' }]],
          expected: [],
          label: 'Texto do trecho com colchetes e dois-pontos',
          hidden: true,
        },
        {
          input: ['O cupom de R$ 10 vale para pedidos de $5 ou menos?', [{ id: 1, text: 'Cupons só valem para pedidos acima de R$ 20.' }]],
          expected: [],
          label: 'Pergunta com R$ e $ (nada de substituir no template)',
          hidden: true,
        },
        {
          input: [
            'Quanto tempo leva o repasse?',
            [
              { id: 10, text: 'O repasse semanal cai toda quarta-feira.' },
              { id: 11, text: 'Em feriado, o pagamento vai para o dia útil seguinte.' },
              { id: 12, text: 'A conta cadastrada precisa estar no nome do entregador.' },
              { id: 13, text: 'Mudanças de conta levam até 2 dias úteis para valer.' },
              { id: 14, text: 'O extrato fica disponível no app, em Ganhos.' },
            ],
          ],
          expected: [],
          label: 'Cinco trechos, ids de dois dígitos',
          hidden: true,
        },
        { input: ['Pergunta qualquer', [{ id: 0, text: 'Trecho com id zero.' }]], expected: [], label: 'Trecho com id 0', hidden: true },
      ],
      hints: [
        'Monte primeiro o bloco de contexto: cada trecho vira `"[" + id + "] " + text`, e os blocos são unidos com `"\\n"`. Se não houver trechos, o bloco é `(vazio)`.',
        'A ordem das linhas do prompt: regras (inclua a frase de recusa, o pedido de citação com um exemplo `[2]` e o "só use o contexto"), uma linha em branco, `Contexto:`, o bloco de contexto, outra linha em branco e `Pergunta: ...`.',
        'Junte tudo com `[linha1, linha2, ...].join("\\n")`. Cuidado para a pergunta ser a **última** linha, sem nada depois dela.',
      ],
      explanation: {
        intuition: `
O prompt de RAG é um "briefing" para o modelo: o que ele pode usar (só o contexto), como deve responder (citando a fonte), o que fazer se não souber (recusar com uma frase combinada) e, por fim, o que perguntar. Quanto mais claro e previsível o formato, mais fácil validar a resposta depois (é o que o último exercício do pipeline faz).

É como o formulário de um pedido: as instruções ficam no topo, os itens numerados no meio e o campo da pergunta por último, sempre no mesmo lugar.
`,
        steps: [
          'Transforme cada trecho em `"[" + id + "] " + text` e junte as linhas com `"\\n"`. Sem trechos, use `"(vazio)"`.',
          'Escreva as linhas de regra: papel do assistente, "só o contexto", "cite o trecho com [n]" (com um exemplo `[2]`) e a frase exata de recusa.',
          'Monte o array de linhas: regras, linha vazia, `Contexto:`, bloco de contexto, linha vazia, `Pergunta: ` + `question`.',
          'Devolva `linhas.join("\\n")`.',
        ],
        time: 'O(total de caracteres)',
        space: 'O(total de caracteres)',
        complexityWhy:
          'Cada trecho é copiado uma vez para a string final (com até 20 trechos de 300 caracteres, são poucos milhares de caracteres). O que importa aqui é a correção do formato, não o desempenho.',
        pitfalls: [
          'Numerar pela posição (`index + 1`) em vez do `id` recebido: se os trechos chegam como 7 e 3 depois do top-k, a citação `[1]` não aponta para o trecho certo.',
          'Colocar a pergunta no meio, ou deixar algo (uma instrução extra) depois dela: a última linha não vazia tem que ser `Pergunta: ...`.',
          'Esquecer a frase exata de recusa. Ela precisa ser igual em todo lugar (prompt, verificador, resposta do modelo) para o código reconhecer quando o modelo recusou.',
          'Juntar os trechos com espaço em vez de `\\n`: o modelo não distingue onde um termina e o outro começa, e o teste não os encontra em linhas próprias.',
          'Deixar o contexto vazio sem aviso: o modelo pode "inventar" o que não vê. O `(vazio)` deixa claro que não há nada.',
        ],
      },
      solution: {
        js: `function buildPrompt(question, passages) {
  const context = passages.map((p) => '[' + p.id + '] ' + p.text).join('\\n');
  return [
    'Você é o assistente de suporte de um app de delivery.',
    'Responda usando APENAS o contexto abaixo.',
    'Cite o trecho de onde veio cada informação, com o número entre colchetes, como [2].',
    'Se a resposta não estiver no contexto, responda exatamente: "Não encontrei essa informação no contexto."',
    '',
    'Contexto:',
    context || '(vazio)',
    '',
    'Pergunta: ' + question,
  ].join('\\n');
}
`,
        ts: `function buildPrompt(question: string, passages: { id: number; text: string }[]): string {
  const context = passages.map((p) => '[' + p.id + '] ' + p.text).join('\\n');
  return [
    'Você é o assistente de suporte de um app de delivery.',
    'Responda usando APENAS o contexto abaixo.',
    'Cite o trecho de onde veio cada informação, com o número entre colchetes, como [2].',
    'Se a resposta não estiver no contexto, responda exatamente: "Não encontrei essa informação no contexto."',
    '',
    'Contexto:',
    context || '(vazio)',
    '',
    'Pergunta: ' + question,
  ].join('\\n');
}
`,
      },
    },
  },

  /* ------------------------------ 6. Formato HackerRank ------------------------------ */
  {
    topic: 'Formato HackerRank',
    problem: {
      id: 'ifood-rag-answer',
      title: 'Assistente de suporte com fontes',
      difficulty: 'Difícil',
      pattern: 'rag-hackerrank',
      related: ['ifood:rag-hackerrank', 'ifood:rag-pipeline'],
      fnName: 'answerQuestion',
      params: ['input'],
      compare: 'rag',
      description: `
Este é o formato que costuma aparecer em avaliações de RAG: você recebe um **contexto** (trechos numerados) e uma **pergunta**, e devolve um objeto \`{ reasoning, response }\`. O teste **não compara texto exato**: ele confere critérios.

Escreva \`answerQuestion({ context, question })\` **sem chamar nenhum modelo**: uma resposta *extrativa*, usando o que você aprendeu no pipeline.

1. **Leia o contexto**: cada linha é \`[n] texto\`.
2. **Ache o trecho mais parecido** com a pergunta (tokenize sem acento e sem stopwords, TF-IDF dos trechos, cosseno com a pergunta).
3. Se a maior similaridade for **menor que 0,1** (ou não houver trechos), **recuse**: \`response\` = \`Não encontrei essa informação no contexto.\` (sem citar nenhum trecho) e \`reasoning\` explicando o motivo.
4. Caso contrário, escolha a **frase do trecho** (separadas por \`. ! ?\`) que mais repete palavras da pergunta e responda com ela **seguida da fonte**, como \`... [2]\`. O \`reasoning\` explica qual trecho foi usado.

**O que o teste verifica** (para cada pergunta):

- **Formato:** \`reasoning\` e \`response\` são strings **não vazias**;
- se o contexto **tem** a resposta: a \`response\` traz a informação esperada, **cita** (\`[n]\`) um trecho que a contém e **não** recusa;
- se o contexto **não tem**: a \`response\` recusa (ex.: "Não encontrei essa informação no contexto.") e **não cita** nenhum trecho.

Para os testes, uma "palavra" é uma sequência de letras e números, em minúsculas e sem acento (\`tokenize\`), e as *stopwords* ("o", "de", "para", "você", "qual"...) são ignoradas.
`,
      format: {
        input:
          '`input`: objeto com\n- `context`: string com os trechos, um por linha, no formato `"[1] texto\\n[2] texto"`;\n- `question`: string, a pergunta do cliente.',
        output:
          'Um objeto `{ reasoning, response }`, ambos strings não vazias. `response` é a resposta com a fonte (ex.: `"... [2]"`) ou a recusa `"Não encontrei essa informação no contexto."`; `reasoning` explica a escolha.',
      },
      examples: [
        {
          input:
            'context = "[1] Cupons de desconto não podem ser combinados com outros cupons no mesmo pedido.\\n[2] O cupom de primeira compra dá R$ 15 de desconto em pedidos acima de R$ 40."\nquestion = "Qual o desconto do cupom de primeira compra?"',
          output:
            '{ reasoning: "O trecho [2] é o mais parecido com a pergunta...", response: "O cupom de primeira compra dá R$ 15 de desconto em pedidos acima de R$ 40. [2]" }',
          explanation: 'O trecho [2] tem as palavras "cupom", "primeira", "compra" e "desconto". A resposta traz o "R$ 15" e cita [2], então passa nos critérios. A redação do `reasoning` é livre.',
        },
      ],
      constraints: [
        '1 ≤ número de trechos ≤ 20 (o contexto pode, no caso extremo, estar vazio)',
        'Cada trecho está em uma linha, no formato `[n] texto`, com `n` único.',
        'Cada trecho tem até 400 caracteres; a pergunta, até 200.',
      ],
      starter: starter(
        'function answerQuestion(input)',
        'function answerQuestion(input: { context: string; question: string }): { reasoning: string; response: string }',
        `/**
 * @param {{ context: string, question: string }} input
 *   context: trechos numerados, um por linha: "[1] texto\\n[2] texto"
 * @return {{ reasoning: string, response: string }}
 *   response: a frase do trecho certo + a fonte, ex.: "... [2]";
 *             ou "Não encontrei essa informação no contexto." (sem fonte)
 *   reasoning: por que escolheu esse trecho (ou por que recusou)
 */`,
      ),
      tests: [
        {
          input: [
            {
              context:
                '[1] Cupons de desconto não podem ser combinados com outros cupons no mesmo pedido. Cada cupom vale para um único uso por conta.\n[2] O cupom de primeira compra dá R$ 15 de desconto em pedidos acima de R$ 40. Ele expira 30 dias depois do cadastro.\n[3] A taxa de entrega varia conforme a distância entre o restaurante e o endereço. Pedidos acima de R$ 80 têm entrega grátis nos restaurantes parceiros.\n[4] Para falar com o suporte, abra o chat do app em Ajuda. O atendimento funciona todos os dias, das 8h às 22h.',
              question: 'Qual o desconto do cupom de primeira compra?',
            },
          ],
          expected: { answerable: true, facts: ['R$ 15'], sources: [2] },
          label: 'Exemplo 1: a resposta está no segundo trecho',
        },
        {
          input: [
            {
              context:
                '[1] Cupons de desconto não podem ser combinados com outros cupons no mesmo pedido. Cada cupom vale para um único uso por conta.\n[2] O cupom de primeira compra dá R$ 15 de desconto em pedidos acima de R$ 40. Ele expira 30 dias depois do cadastro.\n[3] A taxa de entrega varia conforme a distância entre o restaurante e o endereço. Pedidos acima de R$ 80 têm entrega grátis nos restaurantes parceiros.\n[4] Para falar com o suporte, abra o chat do app em Ajuda. O atendimento funciona todos os dias, das 8h às 22h.',
              question: 'Aceita pagamento em dinheiro?',
            },
          ],
          expected: { answerable: false },
          label: 'Pergunta fora do contexto: recusar, sem citar trecho',
        },
        {
          input: [
            {
              context: '[1] O entregador pode recusar uma corrida sem penalidade até 3 vezes por dia. Na quarta recusa seguida, a conta fica em análise por 24 horas.',
              question: 'Quantas corridas o entregador pode recusar por dia?',
            },
          ],
          expected: { answerable: true, facts: ['3 vezes'], sources: [1] },
          label: 'Contexto com um trecho só',
        },
        {
          input: [
            {
              context:
                '[1] Cupons de desconto não podem ser combinados com outros cupons no mesmo pedido. Cada cupom vale para um único uso por conta.\n[2] O cupom de primeira compra dá R$ 15 de desconto em pedidos acima de R$ 40. Ele expira 30 dias depois do cadastro.\n[3] A taxa de entrega varia conforme a distância entre o restaurante e o endereço. Pedidos acima de R$ 80 têm entrega grátis nos restaurantes parceiros.\n[4] Para falar com o suporte, abra o chat do app em Ajuda. O atendimento funciona todos os dias, das 8h às 22h.',
              question: 'QUAL É O HORÁRIO DO ATENDIMENTO?',
            },
          ],
          expected: { answerable: true, facts: ['8h às 22h'], sources: [4] },
          label: 'Maiúsculas e acentos diferentes do texto; o trecho certo é o último',
          hidden: true,
        },
        {
          input: [
            {
              context:
                '[1] Cupons de desconto não podem ser combinados com outros cupons no mesmo pedido. Cada cupom vale para um único uso por conta.\n[2] O cupom de primeira compra dá R$ 15 de desconto em pedidos acima de R$ 40. Ele expira 30 dias depois do cadastro.\n[3] A taxa de entrega varia conforme a distância entre o restaurante e o endereço. Pedidos acima de R$ 80 têm entrega grátis nos restaurantes parceiros.\n[4] Para falar com o suporte, abra o chat do app em Ajuda. O atendimento funciona todos os dias, das 8h às 22h.',
              question: 'Qual o valor mínimo para entrega grátis?',
            },
          ],
          expected: { answerable: true, facts: ['R$ 80'], sources: [3] },
          label: 'A frase certa é a segunda do trecho [3]',
          hidden: true,
        },
        {
          input: [
            {
              context:
                '[1] Cupons de desconto não podem ser combinados com outros cupons no mesmo pedido. Cada cupom vale para um único uso por conta.\n[2] O cupom de primeira compra dá R$ 15 de desconto em pedidos acima de R$ 40. Ele expira 30 dias depois do cadastro.\n[3] A taxa de entrega varia conforme a distância entre o restaurante e o endereço. Pedidos acima de R$ 80 têm entrega grátis nos restaurantes parceiros.\n[4] Para falar com o suporte, abra o chat do app em Ajuda. O atendimento funciona todos os dias, das 8h às 22h.',
              question: 'Posso usar DOIS CUPONS no mesmo pedido?',
            },
          ],
          expected: { answerable: true, facts: ['não podem ser combinados'], sources: [1] },
          label: 'Pergunta em caixa alta; a resposta é um "não"',
          hidden: true,
        },
        {
          input: [
            {
              context: '[1] O entregador pode recusar uma corrida sem penalidade até 3 vezes por dia. Na quarta recusa seguida, a conta fica em análise por 24 horas.',
              question: 'Qual o valor do repasse por quilômetro?',
            },
          ],
          expected: { answerable: false },
          label: 'Contexto de um trecho que não responde',
          hidden: true,
        },
        {
          input: [
            {
              context:
                '[1] O repasse semanal cai toda quarta-feira, direto na conta cadastrada. Se cair em feriado, o pagamento vai para o dia útil seguinte.\n[2] A mochila térmica é obrigatória e pode ser retirada nos pontos de apoio. A primeira é gratuita; a reposição custa R$ 60.\n[3] Em caso de acidente durante uma corrida, acione o botão de emergência no app. O seguro cobre despesas médicas até R$ 10 mil.',
              question: 'Em que dia da semana cai o repasse?',
            },
          ],
          expected: { answerable: true, facts: ['quarta-feira'], sources: [1] },
          label: 'FAQ do entregador: repasse',
          hidden: true,
        },
        {
          input: [
            {
              context:
                '[1] O repasse semanal cai toda quarta-feira, direto na conta cadastrada. Se cair em feriado, o pagamento vai para o dia útil seguinte.\n[2] A mochila térmica é obrigatória e pode ser retirada nos pontos de apoio. A primeira é gratuita; a reposição custa R$ 60.\n[3] Em caso de acidente durante uma corrida, acione o botão de emergência no app. O seguro cobre despesas médicas até R$ 10 mil.',
              question: 'Quanto custa a reposição da mochila?',
            },
          ],
          expected: { answerable: true, facts: ['R$ 60'], sources: [2] },
          label: 'FAQ do entregador: a frase com o preço é a segunda do trecho',
          hidden: true,
        },
        {
          input: [
            {
              context:
                '[1] O repasse semanal cai toda quarta-feira, direto na conta cadastrada. Se cair em feriado, o pagamento vai para o dia útil seguinte.\n[2] A mochila térmica é obrigatória e pode ser retirada nos pontos de apoio. A primeira é gratuita; a reposição custa R$ 60.\n[3] Em caso de acidente durante uma corrida, acione o botão de emergência no app. O seguro cobre despesas médicas até R$ 10 mil.',
              question: 'Existe bônus por chuva?',
            },
          ],
          expected: { answerable: false },
          label: 'FAQ do entregador: assunto que não está no contexto',
          hidden: true,
        },
        {
          input: [
            {
              context:
                '[1] O cardápio do restaurante é atualizado pelo próprio parceiro no painel. Itens esgotados saem da lista em até 5 minutos.\n[2] Alergias e ingredientes ficam na descrição de cada prato. Em dúvida, fale com o restaurante pelo chat do pedido.',
              question: 'Quem atualiza o cardápio do restaurante?',
            },
          ],
          expected: { answerable: true, facts: ['parceiro'], sources: [1] },
          label: 'Cardápio: dois trechos, resposta no primeiro',
          hidden: true,
        },
        {
          input: [
            {
              context:
                '[1] O cardápio do restaurante é atualizado pelo próprio parceiro no painel. Itens esgotados saem da lista em até 5 minutos.\n[2] Alergias e ingredientes ficam na descrição de cada prato. Em dúvida, fale com o restaurante pelo chat do pedido.',
              question: 'Qual a taxa de serviço?',
            },
          ],
          expected: { answerable: false },
          label: 'Cardápio: pergunta sem nenhuma palavra em comum',
          hidden: true,
        },
      ],
      hints: [
        'Divida o problema nas mesmas etapas do pipeline: ler o contexto (`[n] texto` → lista de `{ id, text }`), tokenizar, calcular o TF-IDF dos trechos e da pergunta, achar o trecho com maior cosseno.',
        'Compare a melhor similaridade com o limiar `0.1`: abaixo dele (ou sem trechos), devolva a recusa `Não encontrei essa informação no contexto.` **sem** citar trecho, e escreva um `reasoning` explicando.',
        'Para a frase: separe o trecho vencedor em frases com `split(/(?<=[.!?])\\s+/)`, tokenize cada frase e conte quantas palavras estão na pergunta. Fique com a de mais acertos e devolva `frase + " [" + id + "]"`.',
      ],
      explanation: {
        intuition: `
É o pipeline de RAG inteiro em pequeno, **sem o modelo de linguagem**: um sistema *extrativo* devolve a frase que já está no texto, em vez de gerar uma nova. É a "linha de base" de qualquer RAG: se o seu sistema com LLM não passa nem a versão extrativa nos critérios, algo no pipeline (chunking, busca, prompt) está errado.

O formato \`{ reasoning, response }\` é o do HackerRank. O verificador não olha o estilo do texto: confere se usou o contexto (o fato aparece), se indicou a fonte e se **recusou quando devia**.
`,
        steps: [
          'Leia o contexto: cada linha `[n] texto` vira `{ id: n, text }`. Sem trechos, recuse.',
          'Tokenize os trechos e a pergunta (minúsculas, sem acento, sem stopwords, sem palavras de 1 letra).',
          'Monte o vocabulário e o `idf` com os trechos; vetorize cada trecho (tf · idf) e a pergunta (palavras fora do vocabulário são ignoradas).',
          'Calcule o cosseno da pergunta com cada trecho e fique com o maior (empate: menor índice).',
          'Se a maior similaridade for menor que 0,1, recuse com a frase exata e um `reasoning` que cita o score, sem citar trecho.',
          'Senão, escolha no trecho vencedor a frase que mais repete palavras da pergunta e devolva `frase + " [id]"`, com o `reasoning` dizendo qual trecho foi usado.',
        ],
        time: 'O(V · P + L)',
        space: 'O(V · P)',
        complexityWhy:
          'Com P trechos e V palavras únicas, cada vetor tem V posições, então montar e comparar os P vetores custa O(V · P). Tokenizar o contexto e a pergunta é proporcional ao total de caracteres L. Com 20 trechos de até 400 caracteres, tudo é muito pequeno.',
        pitfalls: [
          'Recusar citando um trecho (ex.: "Não encontrei essa informação [1]"): o verificador exige que a recusa **não cite** nada.',
          'Responder sem a fonte: o verificador exige `[n]` de um trecho que tenha a resposta (na `response` ou no `reasoning`). Cite o trecho certo, não "o primeiro".',
          'Deixar `reasoning` ou `response` vazios, ou devolver outro formato (só uma string): já reprova no critério de formato.',
          'Não tirar acento e caixa: "Cartão" e "cartao" viram palavras diferentes e a busca falha. Normalize (`normalize("NFD")` e remova os acentos) antes de comparar.',
          'Escolher o trecho só pelo número de palavras em comum, sem o idf: palavras comuns ("pedido", "app") passam a pesar tanto quanto as raras.',
          'Armadilha lexical do TF-IDF: ele casa palavras, não significado. "Vocês aceitam vale-refeição?" tem a palavra "vale", que aparece em "a entrega grátis vale para pedidos acima de...": um sistema puramente léxico responde errado em vez de recusar. É um limite real dessa abordagem (e uma das razões para usar embeddings semânticos e um limiar bem calibrado).',
        ],
      },
      solution: {
        js: String.raw`const REFUSAL = 'Não encontrei essa informação no contexto.';
const THRESHOLD = 0.1;
const STOPWORDS = new Set(
  ('a o as os um uma uns umas de do da dos das em no na nos nas por pelo pela pelos pelas para pra com sem ' +
    'e ou mas que se como ao aos à às é ser são foi era está estão tem têm ter há meu minha seu sua seus suas ' +
    'eu você voce ele ela nós eles elas isso isto esse essa este esta lhe me te nos já não nao sim mais menos muito ' +
    'qual quais quando onde quanto quanta quantos quantas porque pois então entao também tambem só so ' +
    'até após entre sobre num numa dele dela deles delas')
    .split(' ')
    .map((word) => removeAccents(word)),
);

function removeAccents(text) {
  return text.normalize('NFD').replace(/\p{M}/gu, '');
}

function tokenize(text) {
  return removeAccents(text.toLowerCase())
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1 && !STOPWORDS.has(token));
}

function parseContext(context) {
  const passages = [];
  for (const line of context.split('\n')) {
    const match = line.match(/^\s*\[(\d+)\]\s*(.*)$/);
    if (match && match[2].trim() !== '') {
      passages.push({ id: Number(match[1]), text: match[2].trim() });
    }
  }
  return passages;
}

function cosine(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function answerQuestion(input) {
  const passages = parseContext(input.context);
  if (passages.length === 0) {
    return { reasoning: 'O contexto está vazio.', response: REFUSAL };
  }

  // TF-IDF dos trechos
  const docs = passages.map((p) => tokenize(p.text));
  const vocab = [...new Set(docs.flat())].sort();
  const position = new Map();
  vocab.forEach((term, i) => position.set(term, i));
  const df = new Array(vocab.length).fill(0);
  for (const doc of docs) {
    for (const term of new Set(doc)) df[position.get(term)]++;
  }
  const idf = df.map((d) => Math.log((docs.length + 1) / (d + 1)) + 1);
  const vectorize = (tokens) => {
    const vector = new Array(vocab.length).fill(0);
    if (tokens.length === 0) return vector;
    for (const token of tokens) {
      if (position.has(token)) vector[position.get(token)] += 1;
    }
    return vector.map((count, i) => (count / tokens.length) * idf[i]);
  };

  // trecho mais parecido com a pergunta (empate: o primeiro)
  const queryTokens = tokenize(input.question);
  const queryVector = vectorize(queryTokens);
  let bestIndex = 0;
  let bestScore = -1;
  docs.forEach((doc, i) => {
    const score = cosine(queryVector, vectorize(doc));
    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  });

  if (bestScore < THRESHOLD) {
    return {
      reasoning:
        'Nenhum trecho fala do assunto da pergunta: a maior similaridade foi ' + bestScore.toFixed(2) + ', abaixo do limiar ' + THRESHOLD + '.',
      response: REFUSAL,
    };
  }

  // frase do trecho que mais repete palavras da pergunta
  const passage = passages[bestIndex];
  const wanted = new Set(queryTokens);
  const sentences = passage.text.split(/(?<=[.!?])\s+/).filter(Boolean);
  let sentence = sentences[0] || passage.text;
  let bestHits = -1;
  for (const candidate of sentences) {
    const hits = tokenize(candidate).filter((token) => wanted.has(token)).length;
    if (hits > bestHits) {
      bestHits = hits;
      sentence = candidate;
    }
  }

  return {
    reasoning:
      'O trecho [' + passage.id + '] é o mais parecido com a pergunta (similaridade ' + bestScore.toFixed(2) + '), e a frase escolhida é a que mais repete os termos dela.',
    response: sentence.trim() + ' [' + passage.id + ']',
  };
}
`,
        ts: String.raw`const REFUSAL = 'Não encontrei essa informação no contexto.';
const THRESHOLD = 0.1;
const STOPWORDS = new Set<string>(
  ('a o as os um uma uns umas de do da dos das em no na nos nas por pelo pela pelos pelas para pra com sem ' +
    'e ou mas que se como ao aos à às é ser são foi era está estão tem têm ter há meu minha seu sua seus suas ' +
    'eu você voce ele ela nós eles elas isso isto esse essa este esta lhe me te nos já não nao sim mais menos muito ' +
    'qual quais quando onde quanto quanta quantos quantas porque pois então entao também tambem só so ' +
    'até após entre sobre num numa dele dela deles delas')
    .split(' ')
    .map((word) => removeAccents(word)),
);

interface Passage {
  id: number;
  text: string;
}

function removeAccents(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '');
}

function tokenize(text: string): string[] {
  return removeAccents(text.toLowerCase())
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1 && !STOPWORDS.has(token));
}

function parseContext(context: string): Passage[] {
  const passages: Passage[] = [];
  for (const line of context.split('\n')) {
    const match = line.match(/^\s*\[(\d+)\]\s*(.*)$/);
    if (match && match[2].trim() !== '') {
      passages.push({ id: Number(match[1]), text: match[2].trim() });
    }
  }
  return passages;
}

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function answerQuestion(input: { context: string; question: string }): { reasoning: string; response: string } {
  const passages = parseContext(input.context);
  if (passages.length === 0) {
    return { reasoning: 'O contexto está vazio.', response: REFUSAL };
  }

  // TF-IDF dos trechos
  const docs = passages.map((p) => tokenize(p.text));
  const vocab = [...new Set(docs.flat())].sort();
  const position = new Map<string, number>();
  vocab.forEach((term, i) => position.set(term, i));
  const df: number[] = new Array(vocab.length).fill(0);
  for (const doc of docs) {
    for (const term of new Set(doc)) df[position.get(term)!]++;
  }
  const idf = df.map((d) => Math.log((docs.length + 1) / (d + 1)) + 1);
  const vectorize = (tokens: string[]): number[] => {
    const vector: number[] = new Array(vocab.length).fill(0);
    if (tokens.length === 0) return vector;
    for (const token of tokens) {
      if (position.has(token)) vector[position.get(token)!] += 1;
    }
    return vector.map((count, i) => (count / tokens.length) * idf[i]);
  };

  // trecho mais parecido com a pergunta (empate: o primeiro)
  const queryTokens = tokenize(input.question);
  const queryVector = vectorize(queryTokens);
  let bestIndex = 0;
  let bestScore = -1;
  docs.forEach((doc, i) => {
    const score = cosine(queryVector, vectorize(doc));
    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  });

  if (bestScore < THRESHOLD) {
    return {
      reasoning:
        'Nenhum trecho fala do assunto da pergunta: a maior similaridade foi ' + bestScore.toFixed(2) + ', abaixo do limiar ' + THRESHOLD + '.',
      response: REFUSAL,
    };
  }

  // frase do trecho que mais repete palavras da pergunta
  const passage = passages[bestIndex];
  const wanted = new Set(queryTokens);
  const sentences = passage.text.split(/(?<=[.!?])\s+/).filter(Boolean);
  let sentence = sentences[0] || passage.text;
  let bestHits = -1;
  for (const candidate of sentences) {
    const hits = tokenize(candidate).filter((token) => wanted.has(token)).length;
    if (hits > bestHits) {
      bestHits = hits;
      sentence = candidate;
    }
  }

  return {
    reasoning:
      'O trecho [' + passage.id + '] é o mais parecido com a pergunta (similaridade ' + bestScore.toFixed(2) + '), e a frase escolhida é a que mais repete os termos dela.',
    response: sentence.trim() + ' [' + passage.id + ']',
  };
}
`,
      },
    },
  },
]
