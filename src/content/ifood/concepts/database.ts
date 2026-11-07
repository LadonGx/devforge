import type { ConceptQuestion } from '../types'

/** Tema "banco": Banco de dados: índices, transações e normalização. */
export const DATABASE_QUESTIONS: ConceptQuestion[] = [
  {
    id: 'banco-indice-seletividade',
    theme: 'banco',
    prompt:
      'Numa tabela `customers` com 100.000 linhas você pode criar só um índice. A coluna `plan_tier` tem 3 valores possíveis (`basic`, `premium`, `family`) e a `email` é praticamente única. Em qual coluna o índice vai render de verdade, e por quê?',
    options: [
      'email, porque é altamente seletivo: a busca isola quase uma linha por valor',
      'plan_tier, porque é a coluna que mais aparece nas consultas do painel',
      'email, porque índice em coluna de texto é sempre mais rápido que em número',
      'plan_tier, porque uma coluna com poucos valores distintos mantém o índice menor',
    ],
    answer: 0,
    explain:
      'Um índice vale quando reduz drasticamente as linhas visitadas, ou seja, quando a coluna tem **alta seletividade**. Com `email`, o B-tree salta direto para as poucas linhas daquele valor; com `plan_tier`, uma busca por `basic` ainda aponta dezenas de milhares de linhas, e o planejador do PostgreSQL decide que ler a tabela inteira (seq scan) é mais rápido que atravessar o índice.',
    whyWrong: [
      '',
      'Estar em muitas consultas não compensa a baixa seletividade: mesmo sendo a busca mais frequente, devolver dezenas de milhares de linhas deixa o seq scan como melhor plano.',
      'O tipo da coluna não importa: o que decide é quantas linhas sobrevivem ao filtro. Um índice em coluna numérica repetitiva (ex.: código da loja) seria tão inútil quanto.',
      'Poucos valores distintos até deixam o índice menor, mas ele ainda devolve dezenas de milhares de linhas por consulta, então o planejador continua preferindo o seq scan.',
    ],
    review: 'ifood:sql',
  },
  {
    id: 'banco-indice-custo-escrita',
    theme: 'banco',
    prompt:
      'A tabela `order_events` recebe cerca de 1.000 INSERT por segundo, mas a coluna `city` é consultada uma única vez por dia. Ao criar um índice em `city`, qual efeito você deve esperar nas escritas?',
    options: [
      'O INSERT fica mais rápido, porque o índice organiza as linhas no momento da gravação',
      'O INSERT fica mais lento: além da linha, o banco precisa gravar uma entrada nova em cada índice da tabela',
      'Nada muda: o índice só recebe atualização quando alguém executa um SELECT',
      'A tabela é fisicamente reordenada por `city` a cada INSERT, o que torna tudo mais caro',
    ],
    answer: 1,
    explain:
      'Cada índice é uma estrutura à parte (uma B-tree) que o banco precisa manter em **toda escrita**: cada INSERT, UPDATE e DELETE também escreve no índice. Nesse cenário, o ganho de uma consulta diária não paga o custo de desacelerar 1.000 inserções por segundo — por isso a decisão de criar índice olha a proporção entre leitura e escrita.',
    whyWrong: [
      'O índice não organiza nada na gravação: ele só recebe entradas novas. Gravar em mais estruturas torna o INSERT mais lento, nunca mais rápido.',
      '',
      'O índice é mantido a cada escrita (INSERT, UPDATE, DELETE), consultado ou não; se não fosse, ficaria desatualizado e inútil.',
      'A tabela continua como está (heap); o índice é uma B-tree à parte que insere a entrada nova na posição certa, sem reordenar a tabela em nenhum INSERT.',
    ],
    review: 'ifood:sql',
  },
  {
    id: 'banco-indice-composto-ordem',
    theme: 'banco',
    prompt:
      'Em PostgreSQL, você criou o índice composto `CREATE INDEX idx_orders_rest ON orders (restaurant_id, created_at);`. Qual consulta tira o máximo proveito dele?',
    options: [
      "WHERE created_at >= '2026-11-01'",
      'WHERE customer_id = 42 ORDER BY created_at DESC',
      "WHERE restaurant_id = 42 AND created_at >= '2026-11-01'",
      'WHERE delivery_fee > 0',
    ],
    answer: 2,
    explain:
      'Num índice composto, os valores são ordenados por `restaurant_id` e, dentro do mesmo restaurante, por `created_at`. A consulta que filtra pelas duas colunas faz um range scan usando as duas condições. Como a ordem do índice começa em `restaurant_id`, filtrar só por `created_at` desperdiça o índice (a regra do **prefixo mais à esquerda**).',
    whyWrong: [
      'Filtra só pela segunda coluna: pela regra do "prefixo mais à esquerda", as datas estão espalhadas entre todos os restaurantes na ordenação do índice, então ele quase não ajuda aqui.',
      'Nem `customer_id` está no índice, nem um `ORDER BY created_at DESC` isolado segue a ordem dele (que intercala por restaurante); sobra uma ordenação extra.',
      '',
      '`delivery_fee` não está no índice: sem nenhuma coluna indexada no filtro, resta o seq scan.',
    ],
    review: 'ifood:sql',
  },
  {
    id: 'banco-transacao-atomicidade',
    theme: 'banco',
    prompt:
      'Num pagamento, uma transação debita o saldo do cliente e marca o pedido como pago. A conexão cai entre as duas UPDATE, antes do COMMIT. O que ficou gravado no banco?',
    code: `BEGIN;

UPDATE accounts
   SET balance = balance - 35.90
 WHERE id = 101;

UPDATE orders
   SET paid = true
 WHERE id = 900;
-- a conexão cai bem aqui

COMMIT;`,
    options: [
      'Nada: na queda a transação é desfeita (rollback), e o saldo e o pedido ficam como estavam',
      'O débito, porque a primeira UPDATE executou com sucesso; só o pedido fica sem `paid`',
      'O débito em estado "pendente", que o banco refaz quando a conexão volta',
      'As duas alterações, porque dentro do BEGIN cada UPDATE é commitada no momento da execução',
    ],
    answer: 0,
    explain:
      'A **atomicidade** (o A de ACID) trata a transação como tudo ou nada: sem COMMIT, as mudanças ficam visíveis só para a própria transação, e a queda da conexão gera rollback automático. Assim, ou o cliente é debitado **e** o pedido fica pago, ou nada acontece — sem débito sem pedido correspondente.',
    whyWrong: [
      '',
      'Isso seria exatamente o que a atomicidade impede numa transação explícita: só ficaria gravado assim se cada UPDATE rodasse em autocommit, fora do BEGIN.',
      'O banco não guarda "intenção de refazer" de uma transação morta: sem COMMIT, as mudanças nunca se tornam visíveis e são descartadas no rollback.',
      'Dentro de um `BEGIN`, as UPDATE ficam pendentes até o COMMIT; autocommit é o que acontece quando não há transação aberta.',
    ],
    review: 'ifood:sql',
  },
  {
    id: 'banco-transacao-isolamento',
    theme: 'banco',
    prompt:
      'Durante uma transferência de saldo (uma UPDATE na conta A e outra na conta B, ainda sem COMMIT), um relatório executa uma única consulta: `SELECT sum(balance) FROM accounts;`. No PostgreSQL (READ COMMITTED, o padrão), o que ele enxerga?',
    options: [
      'Pode enxergar a conta A debitada e a B sem o crédito, porque a primeira UPDATE já gravou no disco',
      'A transferência fica bloqueada até o relatório terminar, para não ler dado em alteração',
      'Um valor consistente: a consulta lê um snapshot com os dados de transações já confirmadas, nunca o estado pela metade',
      'Um erro, porque a tabela está em alteração no momento da leitura',
    ],
    answer: 2,
    explain:
      'O **isolamento** evita ler alterações de transações não confirmadas. No PostgreSQL (MVCC), leitores não bloqueiam escritores nem o contrário, e a consulta lê apenas dados commitados até o instante dela: vê os saldos de antes completos, ou os de depois completos, nunca a transferência pela metade — sem "dinheiro sumido" no relatório.',
    whyWrong: [
      'Não existe leitura suja em nenhum nível de isolamento do PostgreSQL: mudanças sem COMMIT ficam invisíveis para as outras transações, mesmo já no disco.',
      'No MVCC, leitor não bloqueia escrita: leitores e escritores convivem sem um esperar o outro, que é justamente a vantagem do modelo.',
      '',
      'Ler dados commitados é sempre válido; nenhuma escrita em curso é motivo de erro para o leitor.',
    ],
    review: 'ifood:sql',
  },
  {
    id: 'banco-normalizacao-3fn',
    theme: 'banco',
    prompt:
      'A tabela abaixo guarda, junto da entrega, o nome do entregador e o endereço completos, copiados de outras tabelas. Qual a leitura correta sobre a normalização?',
    code: `CREATE TABLE deliveries (
  id           bigserial PRIMARY KEY,
  courier_id   int NOT NULL,
  courier_name text,      -- copiado da tabela de entregadores
  address_id   int NOT NULL,
  address_line text,      -- copiado da tabela de enderecos
  delivered_at timestamptz
);`,
    options: [
      'Não está em 1FN, porque guarda chaves estrangeiras de duas entidades diferentes na mesma tabela',
      'Viola a 3FN: `courier_name` depende de `courier_id` (e não só do `id`)',
      'A solução é transformar `address_line` num array de linhas dentro da própria célula',
      'Basta criar um índice em `courier_name` para manter os valores copiados sempre iguais aos originais',
    ],
    answer: 1,
    explain:
      'A **1FN** pede valores atômicos, a **2FN** pede dependência completa da chave (quando composta) e a **3FN** proíbe dependências transitivas: coluna que depende de outra coluna não-chave. Aqui `id → courier_id → courier_name`; se o entregador mudar de nome, a atualização teria de varrer todas as entregas dele — anomalia de atualização (ou sobrevivem nomes velhos junto dos novos).',
    whyWrong: [
      '1FN é sobre valores atômicos em cada célula, e chave estrangeira não tem nada a ver com isso: é normal referenciar outras entidades.',
      '',
      'Array dentro da célula é o oposto da 1FN (valores atômicos) e não resolve a dependência transitiva dos dados copiados.',
      'Índice só acelera busca: os valores copiados continuam podendo dessincronizar (ficar velhos) quando a origem muda.',
    ],
    review: 'ifood:sql',
  },
  {
    id: 'banco-fk-on-delete',
    theme: 'banco',
    prompt:
      'Alguém tenta `DELETE FROM restaurants WHERE id = 7`, mas este restaurante tem pedidos registrados. O que acontece com `ON DELETE RESTRICT`?',
    code: `CREATE TABLE orders (
  id            bigserial PRIMARY KEY,
  restaurant_id int NOT NULL REFERENCES restaurants (id) ON DELETE RESTRICT,
  total         numeric(10, 2) NOT NULL
);`,
    options: [
      'O restaurante é apagado e os pedidos ficam "órfãos", apontando para um restaurante que não existe mais',
      'Os pedidos do restaurante 7 são apagados junto com ele, em cascata, porque já dependem do restaurante',
      'O DELETE funciona, e a coluna `restaurant_id` dos pedidos fica `NULL`',
      'O DELETE falha com erro de violação de chave estrangeira, enquanto existirem pedidos do restaurante 7',
    ],
    answer: 3,
    explain:
      'A chave estrangeira garante **integridade referencial**: não pode existir pedido apontando para um restaurante inexistente. Com `RESTRICT`, o banco recusa a exclusão enquanto houver pedidos daquele restaurante; cabe à aplicação decidir o que fazer antes (remapear os pedidos para outro restaurante, por exemplo). Cascata e `NULL` só acontecem com `ON DELETE CASCADE` / `ON DELETE SET NULL` declarados.',
    whyWrong: [
      'Órfãos é justamente o que a FK existe para impedir: sem a FK isso seria possível, mas com RESTRICT o banco barra a exclusão.',
      'Cascata em cadeia é o comportamento de `ON DELETE CASCADE`, que não foi declarado nessa FK.',
      'Trocar para `NULL` automático exigiria `ON DELETE SET NULL` e uma coluna que aceita `NULL`; aqui ela é `NOT NULL` e a regra é RESTRICT.',
      '',
    ],
    review: 'ifood:sql',
  },
  {
    id: 'banco-where-vs-having',
    theme: 'banco',
    prompt:
      'Num relatório de restaurantes, a consulta abaixo lista só restaurantes com 50+ pedidos entregues, com o ticket médio de cada um. Duas filtragens diferentes acontecem aqui. Qual a descrição correta?',
    code: `SELECT  restaurant_id,
        count(*)             AS order_count,
        round(avg(total), 2) AS avg_total
FROM    orders
WHERE   status = 'delivered'
GROUP BY restaurant_id
HAVING  count(*) >= 50
ORDER BY avg_total DESC;`,
    options: [
      'Ambas as cláusulas fazem a mesma coisa; `HAVING` é apenas uma forma alternativa de escrever `WHERE`',
      '`WHERE` filtra linhas antes do `GROUP BY`; `HAVING` filtra grupos depois, podendo usar agregados',
      '`WHERE` filtra grupos inteiros; `HAVING` filtra as linhas de cada grupo individualmente',
      'Não faz sentido juntar `WHERE` e `HAVING`: uma consulta só usa uma delas',
    ],
    answer: 1,
    explain:
      'São fases diferentes do pipeline da consulta. O `WHERE` roda antes da agregação (por isso só enxerga colunas, como `status`), o `GROUP BY` monta os grupos por restaurante e o `HAVING` descarta grupos com menos de 50 pedidos. Mover `count(*) >= 50` para o `WHERE` dá erro ("aggregate functions are not allowed in WHERE"), porque o agregado ainda não existia ali.',
    whyWrong: [
      'Não são equivalentes: cada uma atua numa fase diferente (linhas antes do GROUP BY vs. grupos depois). Tentar agregado no `WHERE` vira erro de sintaxe.',
      '',
      'É o contrário: filtrar linhas (`status = delivered`) é papel do `WHERE`, que roda primeiro; o `HAVING` só enxerga o grupo pronto (`restaurant_id`, `count(*)`, `avg_total`).',
      'As duas convivem normalmente na mesma consulta: uma prepara as linhas, a outra escolhe os grupos; relatórios de vendas costumam usar as duas juntas.',
    ],
    review: 'ifood:sql',
  },
]
