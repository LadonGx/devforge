import type { ConceptQuestion } from '../types'

/** Tema "http": HTTP e REST: métodos, status codes e idempotência. */
export const HTTP_QUESTIONS: ConceptQuestion[] = [
  {
    id: 'http-idempotencia-retry',
    theme: 'http',
    prompt:
      'No app, "salvar endereço do cliente" pode ser reenviada por retry automático (a conexão caiu e o cliente tenta de novo, sem saber se a primeira chegou). Qual chamada garante o mesmo estado final mesmo executada várias vezes?',
    options: [
      'POST /customers/17/address com o endereço no corpo: repetir termina no mesmo estado, porque POST também é idempotente',
      'GET /customers/17/address, que é seguro e idempotente',
      'PUT /customers/17/address com o endereço completo no corpo',
      'PATCH /customers/17/address com {"city": "Osasco"}, porque o PATCH é **sempre** idempotente por definição',
    ],
    answer: 2,
    explain:
      'Idempotente é o método cuja repetição não muda o resultado: aplicada 1 vez ou 10, o estado final é o mesmo. `GET`, `PUT` e `DELETE` são idempotentes; `POST` não é (cada chamada pode criar um recurso novo — o clássico "retry que cria pedido duplicado"). Por isso atualização que pode ter retry fica em PUT (ou em POST acompanhado de uma chave de idempotência).',
    whyWrong: [
      'POST não é idempotente: cada repetição pode criar um recurso novo (vários endereços duplicados). É justamente o método que precisa de proteção extra (ex.: chave de idempotência) para sobreviver ao retry.',
      'GET é seguro e idempotente justamente porque não altera nada — usado aqui, ele não registraria o endereço novo.',
      '',
      'O padrão (RFC 5789) não define PATCH como idempotente: pode até se comportar assim quando a mudança é "coloque o valor X", mas não é semântica garantida do método; a substituição completa via PUT é idempotente por definição.',
    ],
    review: 'ifood:api',
  },
  {
    id: 'http-status-201-created',
    theme: 'http',
    prompt:
      '`POST /restaurants/7/menus` cria o item de cardápio "Combo Family", que ficou com o id 382. Qual a resposta ideal do servidor?',
    options: [
      '200 OK, com o item criado no corpo (o id 382 já está nele)',
      '201 Created, com Location: /restaurants/7/menus/382 e o item no corpo',
      '204 No Content, que evita reenviar o item que o app acabou de cadastrar',
      '202 Accepted, porque a criação pode ser concluída depois, de forma assíncrona',
    ],
    answer: 1,
    explain:
      'Criação concluída merece **201 Created**: além de dizer "sucedeu", informa que nasceu um recurso novo e onde ele está (cabeçalho `Location`). O 204 fica para sucesso sem corpo (ex.: DELETE aceito); o 202 é para processamento que ainda está em curso.',
    whyWrong: [
      '200 diz "requisição atendida", mas não informa criação nem dá a URL do recurso novo; em REST, criação sincronizada usa 201.',
      '',
      '204 significa sucesso sem corpo nenhum; numa criação o cliente espera no mínimo o `Location` (em geral, também o item criado).',
      '202 Accepted é para quem entra numa fila e ainda será processado; aqui o item já nasceu nesta chamada, então não é assíncrono.',
    ],
    review: 'ifood:api',
  },
  {
    id: 'http-401-vs-403',
    theme: 'http',
    prompt:
      'No painel do parceiro, uma requisição `GET /payment-dashboard` chega com **token expirado**. A outra chega com token válido, mas a conta é de entregador, sem permissão para o painel financeiro. Quais status codes correspondem?',
    options: [
      '401 para o token expirado; 403 para a conta sem permissão',
      '403 para o token expirado; 401 para a conta sem permissão',
      '401 para os dois, porque os dois são problemas de autenticação',
      '404 para os dois, para não revelar a existência do endpoint',
    ],
    answer: 0,
    explain:
      '`401 Unauthorized` é para quem **não se identificou** ou trouxe credenciais inválidas/expiradas: o problema é a autenticação, o cliente volta a logar (a resposta costuma trazer `WWW-Authenticate`). `403 Forbidden` é quando o servidor sabe exatamente quem é o cliente e **ainda assim nega** o acesso (autorização): logar de novo não muda nada.',
    whyWrong: [
      '',
      'Está trocado: credencial ruim/expirada é 401; identificado e mesmo assim vetado é 403.',
      'No segundo caso a autenticação já passou: o servidor sabe quem é o cliente; o veto é de permissão (403), não de identidade.',
      'Esconder com 404 existe no mundo real para recursos privados (o GitHub faz isso em repositórios privados); aqui o painel é conhecido e o cliente precisa de 401/403 para saber se deve logar de novo ou se não tem permissão.',
    ],
    review: 'ifood:api',
  },
  {
    id: 'http-status-409-conflict',
    theme: 'http',
    prompt:
      'O app manda `PATCH /orders/42 {"status": "delivered"}`. A requisição está bem formada e autenticada, mas o pedido 42 já foi **cancelado** pelo cliente. Qual o status code correto?',
    options: [
      '400 Bad Request: `status` não é um valor que o corpo aceita',
      '404 Not Found: o pedido 42 foi removido da base',
      '503 Service Unavailable: o serviço está fora do ar no momento',
      '409 Conflict: o estado atual do pedido não permite a transição',
    ],
    answer: 3,
    explain:
      '**409 Conflict** é o código para conflito com o estado atual do recurso: a requisição em si está correta, mas o pedido cancelado não pode ser entregue. O cliente precisa recuperar o estado atual (ex.: `GET /orders/42`) e decidir o próximo passo. Não é erro de sintaxe (400), inexistência (404) nem indisponibilidade (503).',
    whyWrong: [
      'A requisição está bem formada (JSON válido, campo existente); 400 é para payload malformado, ex.: JSON que não parseia ou campo obrigatório ausente.',
      'O pedido 42 existe (foi cancelado, não removido); 404 não orienta o cliente sobre o conflito de transição.',
      'O serviço de pedidos está saudável: recusar uma transição de negócio não é indisponibilidade.',
      '',
    ],
    review: 'ifood:api',
  },
  {
    id: 'http-status-429-retry-after',
    theme: 'http',
    prompt:
      'Numa promoção, a API pública permite 60 requisições/min por conta. O bot de um parceiro acabou de ultrapassar esse limite na requisição seguinte. Qual a resposta adequada?',
    options: [
      '500 Internal Server Error, porque o servidor falhou ao concluir a requisição',
      '429 Too Many Requests, com Retry-After: 30 s',
      '503 Service Unavailable, porque o serviço está lotado de requisições',
      '403 Forbidden, porque o acesso do bot ao endpoint foi negado',
    ],
    answer: 1,
    explain:
      '**429 Too Many Requests** é o código para limite de taxa: o servidor está saudável, mas este cliente passou da cota — e o útil é o cabeçalho `Retry-After`, que diz quando tentar de novo. É caso esperado e documentado, não falha. 500 é erro interno inesperado; 503 é indisponibilidade geral; 403 é veto de autorização.',
    whyWrong: [
      '500 significa falha inesperada do servidor (bug, exceção não tratada). Aqui o servidor aplicou uma regra conhecida; mascarar como erro interno confunde o monitoring.',
      '',
      '503 indica serviço indisponível para todos (sobrecarga global, manutenção); aqui os demais clientes continuam atendidos, só esta conta excedeu a própria cota.',
      '403 é estrutural: sem permissão, não adianta esperar. Aqui o acesso volta após o Retry-After, por isso o par 429 + Retry-After.',
    ],
    review: 'ifood:api',
  },
  {
    id: 'http-status-500-vs-503',
    theme: 'http',
    prompt:
      'À meia-noite, o serviço de pagamentos está em manutenção programada. O gateway da API de pedidos detectou isso e pode responder em nome dele. Qual a resposta certa?',
    options: [
      '200 OK com o corpo {"error": "pagamentos indisponíveis"}, para não alarmar o app',
      '500 Internal Server Error, porque a requisição falhou no caminho',
      '503 Service Unavailable, com o cabeçalho Retry-After estimando quando o pagamento volta',
      '404 Not Found, porque o recurso de pagamento não está acessível agora',
    ],
    answer: 2,
    explain:
      '**503 Service Unavailable** diz "o servidor (ou uma dependência dele) está temporariamente incapaz de atender" — por isso costuma vir com `Retry-After`, convidando a tentar de novo depois. O 500 é para erro inesperado dentro do código; o 404 é inexistência de recurso; e 200 com erro no corpo engana caches, balancers e alertas, que só leem o status.',
    whyWrong: [
      'O status é o que a infraestrutura lê primeiro: 200 com erro no corpo faz cache, monitoring e o próprio cliente tratarem a falha como sucesso.',
      '500 é para exceção inesperada/bug; aqui a causa é conhecida, temporária e anunciada — semântica de 503.',
      '',
      'O recurso existe e voltará em minutos; 404 significa "não existe" e não dá nenhuma pista de retry.',
    ],
    review: 'ifood:api',
  },
  {
    id: 'http-etag-304',
    theme: 'http',
    prompt:
      'O app já baixou o menu do restaurante 7 e guardou com tag `ETag: "m382-x"`. O menu não mudou desde então. Qual o round-trip ideal agora?',
    options: [
      'GET com If-None-Match: "m382-x"; o servidor responde 304 Not Modified, sem corpo, e o app reutiliza a cópia local',
      'GET sem cabeçalho especial; o servidor responde 200 com o menu completo, para garantir frescor absoluto',
      'O app só reutiliza a cópia local sem perguntar nada ao servidor, pois o que foi baixado hoje vale para sempre',
      'O servidor responde 301 com Location apontando para uma versão nova do endpoint de menu',
    ],
    answer: 0,
    explain:
      'O **ETag** é a "digital" da versão do recurso. O app revalida mandando `If-None-Match`; se nada mudou, o servidor responde **304 Not Modified** sem corpo, e o app usa sua cópia — economizando banda e latência. É o round-trip canônico de cache HTTP (e, com `Cache-Control: max-age`, o app nem pergunta dentro dessa janela).',
    whyWrong: [
      '',
      'Funciona, mas reenvia todo o payload inalterado: banda, latência e custo desperdiçados — para isso existem ETag/revalidação/304.',
      'Sem revalidação pode exibir cardápio ou preço velho; cache sem revalidar exige uma regra (como `max-age`) para decidir quando checar, nunca "para sempre".',
      '301 é redirecionamento permanente de URL, que não é mecanismo de cache de conteúdo.',
    ],
    review: 'ifood:api',
  },
  {
    id: 'http-paginacao-cursor',
    theme: 'http',
    prompt:
      'A listagem de pedidos no painel usa paginação por `page` e `limit` (offset: `LIMIT 20 OFFSET 40`). O usuário está na página 3 quando entram pedidos novos no topo. O que acontece, e qual o padrão usual para resolver?',
    options: [
      'Nada se move: o LIMIT do PostgreSQL trava a página em 20 itens e o OFFSET garante sempre os mesmos itens',
      'Só a página 1 muda; das demais, o conteúdo fica estável porque o OFFSET é numerado de trás para frente',
      'Trocar o `ORDER BY` para `id DESC` resolve, porque os pedidos antigos deixam de mudar de sequência',
      'Os itens escorregam entre as páginas; a solução padrão é o cursor, que continua após o último item visto',
    ],
    answer: 3,
    explain:
      'Offset posiciona por **posição na lista**: quando um pedido entra antes, todos "escorregam" e as páginas seguintes passam a exibir pedidos diferentes (duplicados no scroll, pulados entre duas visitas). A paginação por **cursor** ancora num item real ("continue depois do pedido 9001"), que não muda de número — por isso é o padrão de feeds infinitos e listagens com inserção concorrente.',
    whyWrong: [
      'LIMIT só corta a quantidade por página; OFFSET conta posição na lista, e a posição de cada pedido muda quando um novo entra antes dele.',
      'A renumeração atinge todas as posições seguintes à inserção: pedidos da página 3 escorregam para a página 2, e a mesma página passou a mostrar outros itens.',
      'A direção (ASC/DESC) só decide em que ponta entram os novos; OFFSET segue contando posição, que se move com inserção nos dois casos.',
      '',
    ],
    review: 'ifood:api',
  },
]
