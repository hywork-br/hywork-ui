# Padrões do produto

Decisões tomadas pela PO em **23/09/2026**, a partir do catálogo comparativo
levantado sobre 63 telas e 664 arquivos do `hywork-plataform`.

**Este documento é normativo.** Antes de criar ou alterar qualquer tela, confira
aqui se o padrão já foi decidido. Divergir de uma linha desta tabela exige
decisão registrada da PO — não é escolha de quem implementa.

Status: `✅ existe` · `🔧 ajustar` · `📋 criar`

### Fonte da verdade — o artefato, não esta página

As escolhas da PO estão no artefato **Catálogo de Divergências**
(claude.ai/artifact/R3pRZxJgiZTsixNC9Jzr1U). Cada opção lá traz as classes
exatas que a amostra reproduz. **Quando esta página e o artefato divergem, vale
o artefato.** Em 29/09/2026 a PO apontou que título, rótulo, estado vazio, abas
e filtros não estavam como ela escolheu: tínhamos traduzido slate-900, slate-800
e gray-400 para os tokens neutros do tema, trocado as abas de largura igual por
abas do tamanho do texto e redesenhado os selects da barra de filtros. Tudo foi
corrigido para o valor literal da escolha.

| Elemento | Opção eleita | Classes da amostra | Componente |
|---|---|---|---|
| Filtro de listagem | A — barra com fundo suave | `flex flex-wrap gap-3 p-4 bg-muted/50 rounded-lg items-end` (fundo trocado por `#edf1f566` em 07/10/2026); campos altura 40, raio 4 | `platform/filter-bar` |
| Título de página | B — 24px · bold · slate-900 | `text-2xl font-bold text-slate-900` | `platform/page-title` |
| Card de item | A — raio 12 · respiro 24 | `Card · rounded-lg p-6` | `core/card`, `platform/item-card` |
| Botão de ação principal | A — token do design system | `bg-primary`, raio 6, altura 40 | `core/button` |
| Indicador de status | D — preenchido por cor de estado | `rounded-full bg-emerald-500 px-2.5 py-1 text-white` | `core/badge` |
| Estado vazio | C — respiro 64 · cinza claro | `text-center text-sm text-gray-400 py-16` | `platform/empty-state` |
| Listagem de dados | A — Table do design system | `<Table>` | `core/table`, `platform/data-list` |
| Abas | B — sublinhado | `grid h-12 rounded-none border-b bg-transparent p-0`; abas de largura igual; ativa na primária, peso 600 | `core/tabs` |
| Modal | D — largo com rolagem | `max-w-4xl max-h-[90vh] overflow-y-auto` | `core/dialog` |
| Carregamento | B — pulso escrito à mão | `bg-gray-200 rounded animate-pulse` | `core/skeleton` |
| Paginação | B — intervalo e setas | "1–20 de 143" + ‹ › | `platform/list-pagination` |
| Trilha de navegação | B — separador em seta | `flex items-center gap-2 text-sm`, separador `›` | `core/breadcrumb` |
| Ações de linha | A — menu suspenso | `<DropdownMenu>` com gatilho de 32px | `platform/row-actions` |
| Rótulo de campo | B — semibold · slate-800 | `text-sm font-semibold text-slate-800` | `core/label` |
| Mensagem de erro | B — red-500 · colado no campo | `text-sm text-red-500` | `core/form-message` |
| Campo de busca | B — arredondado | `rounded-full px-4` | `core/search-input` |
| Área de upload | C — borda 2px · horizontal | `border-2 border-dashed rounded-xl flex items-center gap-4`, respiro 16/32 | `platform/upload-area` |
| Carrossel | A — setas nas laterais | setas circulares de 28px, brancas, com borda, na linha do trilho | `core/carousel` |

Cor literal não entra em componente: os valores acima viram tokens
(`--hw-text-heading`, `--hw-text-label`, `--hw-text-subtle`,
`--hw-status-success-fill`) **com o valor exato da escolha**.

**Exceção registrada no indicador de status (06/10/2026, Rick):** o verde da
escolha fica, mas o texto do selo `positive`/`success` usa `--hw-on-status`
(quase preto) em vez de branco. Branco sobre emerald-500 dá 2,5:1 e reprova a
WCAG AA (4,5:1); o texto escuro dá 7:1. É a mesma correção que os botões de
status já tinham. Os selos `attention`, `negative` e `info` têm fundo escuro e
seguem com texto branco (6,5:1 ou mais).

---

## Cor e token — o design system vence (Rick, 06/10/2026)

Os usuários seguiam relatando que o produto está "tudo muito branco". Na
mesma conversa apareceu a causa de fundo: o contrato dizia que as variáveis da
aplicação venciam as do design system, e o admin mantinha a própria cópia de
`--primary`, `--background` e companhia. Nas palavras do Rick: *"Não tem essa
de 'o plataform vence do DS', isso não tem que acontecer. Se criamos o
hywork-ui pra centralizar tudo isso, ele tem que vencer em todos os pontos. O
design system precisa ser aplicado de forma correta, coerente e eficiente,
sem falhas."*

Três decisões do Rick, de 06/10/2026:

| # | Decisão | Como está no design system |
|---|---|---|
| 1 | **O design system vence.** O consumidor não redefine cor nem token: nada de chave em `theme.extend.colors`, nada de `:root` com variável que sombreia as do design system. | `tokens/core.css` declara todas as variáveis da aplicação; o preset as lê sem fallback; `@hywork/ui/consumer-check` reprova a sobrescrita no CI do consumidor |
| 2 | **Botão principal, aba ativa, anel de foco e link usam a cor do workspace.** Sem cor, ou cor inválida, vale o primário do design system (`200 57% 18%`). O texto sobre a marca é calculado sozinho — desde 07/10/2026 pelo contraste perceptual (APCA), ver "Validação do DS 2.0". | gancho `--hw-brand-primary`, escrito por `brandThemeVars(hex)`; `<BrandTheme>` e `useBrandTheme()` |
| 3 | **Tabelas e listagens são listradas por padrão.** | `Table striped` e `DataList striped`, ligados por padrão |

**O que segue a marca e o que não segue.** A marca é a única cor que o
consumidor informa. Seguem: botão `default` (preenchimento, cursor e clique),
`link`, aba ativa, anel de foco, checkbox, rádio, switch, progresso, slider,
spinner, badge `default`. **Não seguem**: os papéis de estado (sucesso,
atenção, erro, informação), o destrutivo e as escolhas literais da PO que não
eram "primária" — título slate-900, rótulo slate-800, estado vazio gray-400,
badge positivo emerald-500, esqueleto gray-200, seta branca do carrossel.

**A marca sobre o fundo branco.** Uma marca clara (amarelo, verde-limão) passa
no preenchimento — o texto do botão vira escuro — mas não serve como texto ou
linha sobre o branco: a aba ativa e o link ficariam ilegíveis. Por isso há a
tinta da marca (`--primary-ink`): é a própria marca quando ela já tem 4.5:1
sobre o branco, e a marca escurecida, mesma matiz, quando não tem. Aba, link,
anel de foco, borda do checkbox e trilho do switch usam a tinta; preenchimentos
com texto em cima usam a marca. Para o default e para marcas escuras, as duas
são a mesma cor.

**Listras, cursor e seleção.** Três degraus de cinza, cada um vencendo o
anterior: listra `#edf1f5` a 40% (`--hw-table-stripe`, gray-50 até 07/10), cursor gray-100
(`--hw-table-hover`) e linha selecionada gray-200 (`--hw-table-selected`). O
cursor era gray-50 e sumiria nas linhas listradas; a seleção era gray-100 e
empataria com o cursor novo — por isso os dois subiram um degrau.

### Validação do DS 2.0 — ajustes da PO (Luiza, 07/10/2026)

Documento "Design system v2 ajustes", sobre o preview da branch
`docs/design-system-hywork-ui` do Platform. Valores literais, como sempre:

| Ponto | Decisão | Onde está |
|---|---|---|
| Texto do botão sobre a cor do workspace | "A cor do texto do botão deve corresponder à cor de fundo": num workspace laranja o texto escuro não tinha contraste. O texto passa a ser o de **maior contraste perceptual (APCA)** entre branco e slate-900. A WCAG 2 dava escuro para laranja, vermelho e azul médio (o branco fica em 2,8:1–3,7:1 nesses tons); o APCA dá branco, que é como se lê. Amarelo, lima, âmbar e branco seguem com texto escuro. A tinta da marca sobre o branco (aba, link, foco) continua em 4.5:1 | `brandThemeVars` → `--hw-brand-primary-foreground` |
| Menu administrativo | `#edf1f5` — "está tudo muito cinza" | `--hw-color-admin-bg` = `237 241 245` (cabeçalho e menu lateral) |
| Cor de borda | `#edf1f5` | `--hw-color-border` = `210 28.6% 94.5%` |
| Fundo do filtro | `#edf1f566` (`#edf1f5` a 40%) | `--hw-filter-surface`, classe `bg-hw-filter-surface` |
| Fundo de tabela/listagem | `#edf1f566` | `--hw-table-surface` (cabeçalho e rodapé) e `--hw-table-stripe` (listra) |

Os tokens a 40% trazem o alfa no próprio valor (`237 241 245 / 0.4`): sobre o
branco dão ≈ `#f8f9fb`. Por isso as classes `bg-hw-filter-surface`,
`bg-hw-table-surface` e `bg-hw-table-stripe` não aceitam `/NN`.

Os outros pontos do documento eram de tela, não de componente, e foram
corrigidos no Platform: fundo e card cortado do Analytics, cor do workspace em
Configurações, item selecionado da troca de visualização de Campanhas em cinza
da paleta (`Button` `secondary`) e a capa do formulário de usuário.

---

## Estrutura de tela

### Título de página — 24px, bold

| | |
|---|---|
| Decisão | 24px · peso 700 · slate-900 |
| Token | `--hw-text-2xl` · `--hw-weight-bold` · `--hw-text-heading` (slate-900) |
| Componente | `platform/page-title` |
| Status | ✅ feito |

Substitui as **9 combinações** em uso, que iam de 20px/semibold a 30px/black e
incluíam uma tela com família tipográfica própria (`font-ltwave`).

### Abas — sublinhado

| | |
|---|---|
| Decisão | altura 48 · a lista ocupa a linha e divide a largura em partes iguais · borda inferior 1px · item ativo com texto na cor primária, peso 600 e indicador de 2px na primária · inativos em cor esmaecida, peso normal · fundo transparente |
| Primária | a marca do workspace, na tinta legível sobre o fundo (`--primary-ink`) — ver "Cor e token" |
| Componente | `core/tabs` |
| Status | ✅ feito (29/09) — até então as abas tinham o tamanho do texto e o ativo em cor de texto, fora da escolha |

O formato de pílula sai. 33 dos 59 arquivos que hoje montam abas à mão migram
para este componente.

### Modal — largo com rolagem

| | |
|---|---|
| Decisão | largura máxima `max-w-4xl` · altura máxima 90% da viewport · rolagem interna |
| Rodapé | **botões com o tamanho padrão** (altura 40, largura pelo conteúdo), alinhados à direita, espaçamento de 8px entre eles |
| Componente | `core/dialog` |
| Status | ✅ feito — o rodapé esticava os botões ao empilhar |

O que estava errado era o `align-items` padrão do flex em coluna: `stretch`.
Numa tela estreita os botões iam de ponta a ponta, e era esse o "enorme". O
rodapé passou a `items-end`, que devolve a largura ao conteúdo, e o `dialog`
saiu da derivação — a partir de uma decisão de produto, o original do consumidor
deixa de ser a referência.

**O rodapé nunca tem botão de largura total.** Por mais largo que seja o
diálogo, a ação principal mantém a mesma altura e o mesmo respiro horizontal de
qualquer outro botão do produto — o diálogo cresce, o botão não.

Ordem no rodapé: ação secundária (Cancelar) à esquerda da principal.

### Trilha de navegação — separador em seta

| | |
|---|---|
| Decisão | separador `›` · último item em peso 600 e cor de texto principal · demais em cor esmaecida |
| Componente | `core/breadcrumb` |
| Status | ✅ feito — 13 usos no Platform |

---

## Listagem e conteúdo

### Listagem de dados — Table do design system

| | |
|---|---|
| Decisão | tabela do design system, com cabeçalho em 11px maiúsculo e linhas divididas por borda |
| Listras | linhas pares em `#edf1f5` a 40% (PO, 07/10/2026; era gray-50), por padrão; cursor gray-100; selecionada gray-200 (Rick, 06/10/2026) |
| Componente | `core/table`, composto em `platform/data-list` |
| Status | ✅ feito — colunas declaradas, carregamento e vazio embutidos; listras desde a 0.11.0 |

**A maior migração do projeto: 44 telas.** 17 usam `<table>` cru e 27 montam a
listagem com `div` e grid.

### Card de item — raio 12, respiro 24

| | |
|---|---|
| Decisão | raio 12px · respiro interno 24px · borda 1px · **sem sombra** |
| Base | `core/card` — a moldura vale para todo cartão, não só o de listagem |
| Token | `--hw-radius-lg` · `--hw-space-6` · `--hw-color-border` |
| Componente | `platform/item-card` |
| Status | ✅ feito |

Substitui **21 implementações**, com raios de 8 a 24px e respiros de 12 a 24px.
Sombra deixa de ser usada para estrutura — fica reservada a sobreposições.

### Indicador de status — preenchido por cor de estado

| | |
|---|---|
| Decisão | pílula preenchida · raio total · texto 12px peso 600 sobre o preenchimento |
| Componente | `core/badge` |
| Status | ✅ feito — componente passou a autoral |

**Os cinco papéis de estado.** Levantamos os 18 valores de status em uso nos dois
frontends e agrupamos por papel semântico. O componente expõe o papel, nunca a
cor — a tela diz `<Badge variant="positive">`, não `<Badge className="bg-green-500">`.

| Papel | Token | Estados que cobre |
|---|---|---|
| `positive` | `--hw-status-success-fill` (emerald-500, o "Ativo" da amostra) | active · published · completed · approved · finished · success |
| `attention` | `--hw-status-warning` | pending · running · scheduled · expired |
| `negative` | `--hw-status-danger` | error · failed · rejected · cancelled |
| `info` | `--hw-status-info` | estados informativos sem juízo de valor |
| `neutral` | `--hw-color-muted` | draft · inactive · archived |

Os quatro tokens de status já existem em `tokens/` e foram calibrados para
contraste: o texto sobre o preenchimento usa `--hw-on-status`, não branco puro —
branco sobre âmbar reprova em contraste, e foi uma das correções da extração.

Estado novo no produto entra em um dos cinco papéis. Se não couber em nenhum,
é sinal de que não é estado — é categoria, e categoria não usa cor de status.

**Sem ponto interno.** A cor já é o indicador; o ponto que existia antes
duplicava a informação e, como só algumas variantes o tinham, produzia dois
desenhos de badge lado a lado na mesma tabela.

**Vale para todas as variantes.** Numa primeira versão preservei `default`,
`secondary` e `outline` como estavam, para não mexer em 107 dos 124 badges.
O resultado na tela de Usuários foi "Ativo" preenchido ao lado de "Inativo"
sem cor e com ponto — a inconsistência que a decisão existia para encerrar.
Só `outline` continua vazado, porque é o que o nome descreve.

`success`, `warning`, `destructive` e `info` seguem válidos como nomes
anteriores dos mesmos papéis.

**Tom suave — para duas colunas de estado na mesma linha** (HCK-136, pedido da
PO em 05/10/2026, proposta de 06/10/2026 aguardando validação). Na tela de
Usuários, "Ativo" (a conta) e "Acesso configurado" (o convite) eram o mesmo
verde lado a lado, e a PO perguntou se a paleta tinha outra variação para
diferenciá-los. Não tinha: `positive` é um verde só. O `Badge` ganhou
`tone="subtle"`:

| Tom | Preenchimento | Texto | Contraste |
|---|---|---|---|
| `solid` (padrão) | a cor do papel (`--hw-status-success-fill` no verde) | `--hw-on-status` no verde, branco nos outros | 6,5:1 a 7:1 |
| `subtle` | a cor do papel a 15% | a tinta do papel (`--hw-status-success` = emerald-700 no verde) | 4,8:1 a 5,5:1 |

A regra: **o estado principal da linha fica no tom cheio; uma segunda coluna de
estado vai inteira no suave** — inclusive os outros papéis dela, para a coluna
não misturar os dois tons. Continua sendo o mesmo papel: o tom não cria um
sexto estado, e não serve para categoria. `neutral`, `outline` e os genéricos
não têm tom.

### Estado vazio — respiro 64, e sem moldura

| | |
|---|---|
| Decisão | centralizado · respiro vertical 64px · texto 14px em gray-400 (`--hw-text-subtle`) |
| Regra | **sem itens, a tabela inteira sai** — cabeçalho incluído |
| Componente | `platform/empty-state` |
| Status | ✅ feito |

Substitui 8 variações, com respiros de 16 a 64px e quatro tons de cinza.

### Paginação — intervalo e setas

| | |
|---|---|
| Decisão | "1–20 de 143" à esquerda, setas anterior/próxima à direita |
| Componente | `platform/list-pagination` |
| Status | ✅ feito — o `core/pagination` numerado segue disponível como primitiva |

A forma eleita é a `smart-pagination`, que hoje existe **fora** do design
system, na tela de Usuários. O `Pagination` atual (numerado) é substituído por
ela — não o contrário.

### Carrossel — setas nas laterais

| | |
|---|---|
| Decisão | setas circulares nas laterais · sem indicadores de posição |
| Decisão (forma) | círculo de 28px, fundo branco, borda do tema, na linha do trilho — não solto fora dele |
| Componente | `core/carousel` (embla) |
| Status | ✅ feito (29/09) — o componente estava registrado como feito, mas só existia dentro do `hywork-plataform` |

As outras 11 implementações escritas à mão migram para este componente.

### Carregamento — pulso

| | |
|---|---|
| Decisão | blocos que imitam o formato do conteúdo, com pulso |
| Componente | `core/skeleton` |
| Status | ✅ feito — pulso em gray-200, como a amostra |

A forma eleita é a versão escrita à mão (`bg-gray-200 rounded animate-pulse`),
não o `Skeleton` atual. O componente do design system é ajustado para entregar
esse resultado; as telas não passam a escrever à mão.

O pulso respeita `prefers-reduced-motion`.

### Ações de linha — menu suspenso

| | |
|---|---|
| Decisão | gatilho de 32px com reticências · menu suspenso |
| Componente | `core/dropdown-menu`, composto em `platform/row-actions` |
| Status | ✅ feito — 4 stories, 4 testes |

Botões soltos na linha saem de uso.

**A exceção é a ação que dá razão à listagem.** Na fila de moderação do fórum,
aprovar e rejeitar são o motivo de a tela existir; escondê-las num menu
acrescenta um clique ao único trabalho que se faz ali. O mesmo vale para um
único botão rotulado, como o "Editar" da tela de addons.

A regra prática: **duas ou mais ações acessórias viram menu; a ação principal
da linha continua botão.** O que a decisão elimina é a fileira de ícones sem
rótulo, cada um de um tamanho, que não diz o que faz até o cursor parar em cima.

---

## Entrada de dados

### Filtro de listagem — barra com fundo suave

| | |
|---|---|
| Decisão | barra horizontal · fundo `#edf1f5` a 40% (PO, 07/10/2026; era neutro a 50%) · raio 12 · respiro 16 · campos alinhados pela base · seleções com forma de campo (altura 40, raio 4) e o nome da dimensão dentro do campo · busca arredondada (decisão do campo de busca) |
| Componente | `platform/filter-bar` |
| Status | ✅ feito — 7 stories, 15 testes; 20 implementações migradas |

A anatomia: região de busca (0..n), região de dimensões (0..n), ação de limpar
(aparece quando há filtro ativo).

**Onde este padrão se aplica:** filtro que estreita uma **listagem** — tabela,
grade de cards ou lista — exibido acima dela. É esse o caso que o produto tinha
espalhado em nove formas diferentes.

**Doze implementações migradas:** Usuários, Administração, Lixeira, Campanhas,
Desafios, Submissões, Fontes de Dados, Fonte de Dados (registros), Documentos,
Modelos de página, Reconhecimentos e Logs do Senior (RH/HCM).

Para conferir a lista a qualquer momento, sem depender deste texto:
`grep -rln "<FilterBar" src` no `hywork-plataform`.

### Três casos que este padrão não cobre

Não são pendências nem dívida: são anatomias diferentes, e forçá-las na barra
pioraria a tela. Quem encontrar uma delas **não deve migrá-la**.

| Caso | Exemplo | Por quê |
|---|---|---|
| **Filtro de dashboard** | Analytics de Engajamento, Dashboard Conarh | alimenta gráficos e indicadores, não uma listagem; vive no cabeçalho, junto ao título, e não acima de uma tabela |
| **Busca dentro de diálogo** | inserir colaboradores, adicionar registro | é campo de um formulário modal, não filtro de tela; o padrão próprio ainda não foi decidido |
| **Busca de navegação** | hierarquia, páginas recentes, marketplace | leva a um destino em vez de estreitar um conjunto |
| **Listagem sem dimensão na API** | TV Corporativa | a tela mostra três estados e `GET /tv` só separa o booleano `is_active`: um filtro "Inativas" devolveria os rascunhos junto. Filtrar no cliente parece funcionar até a listagem paginar |

A última linha é a pergunta a fazer antes de implementar um filtro numa tela que
não tem: **a API filtra pela mesma dimensão que a tela mostra?** Se não filtra,
o filtro não entra — e a razão vai escrita no serviço, não só aqui.

### Exceções de tela registradas (Rick, 24/09/2026)

| Tela | Forma | Por quê |
|---|---|---|
| **HyStore** | painel lateral | painel lateral é a forma esperada numa loja; converter para barra reformularia a tela inteira sem ganho |
| **Dashboard Conarh** | barra com colapso | já colapsa os filtros num botão "Filtros (2)"; fica como está |

Composição por slots, nunca por props acumuladas:

```tsx
<FilterBar onClear={clearAll}>
  <FilterBar.Search placeholder="Buscar por nome" value={name} onChange={setName} />
  <FilterBar.Select label="Status" options={statusOptions} value={status} onChange={setStatus} />
</FilterBar>
```

### Paginação — duas formas, um componente

A decisão da PO (intervalo à esquerda, setas à direita) pressupõe que o servidor
saiba o total. Duas listagens do produto não sabem: Notícias só responde se
existe próxima página, e Modelos de página só devolve o número de páginas.

`ListPagination` aceita as duas formas:

| Forma | O servidor sabe | A esquerda mostra |
|---|---|---|
| Contada | `total` e `perPage` | `1–20 de 137 colaboradores` |
| Sequencial | só se há mais (`hasNext`) | `Página 3` |

Derivar um total a partir do número de páginas **não** vale: `totalPages *
perPage` erra na última página, e a listagem passa a mentir a contagem.

### Falha ao carregar uma listagem — estado próprio, ao lado do vazio

| | |
|---|---|
| Decisão | mesma caixa central do estado vazio, título no papel `danger`, detalhe em texto esmaecido, ação opcional |
| Componente | `platform/error-state`, e `DataList` recebe por `error` |
| Status | ✅ feito — 4 stories, 4 testes |

Vazio e erro ocupam o mesmo lugar na tela e dizem coisas diferentes: vazio é um
resultado, erro é uma promessa quebrada. Seis listagens escreviam a própria
linha de erro — de `text-red-500` solto num `colSpan` a um cartão de borda
vermelha — e duas chegaram a usar o estado vazio para isso, o que apaga a falha
no cinza do texto esmaecido.

No `DataList` o erro tem precedência sobre o vazio e sobre as linhas: se a carga
falhou, o que está em tela é velho e não deve ser apresentado como atual.

### Altura da linha — esqueleto e dado medem o mesmo

`DataList` aceita `rowHeight` e aplica a **mesma** classe na linha de esqueleto e
na de dados. É o que impede a listagem de pular quando os dados chegam (critério
P-14). Sem ela a altura vem do conteúdo, e o esqueleto quase sempre sai mais
baixo que a linha real.

Pela mesma razão `minWidth` existe: seis listagens declaravam largura mínima por
conta, cada uma com um valor, para rolar na horizontal em vez de espremer as
colunas.

### Aviso na tela — a forma que o componente já tinha

| | |
|---|---|
| Decisão | raio 6 · respiro 16/12 · texto 14 · ícone fixo no canto, texto recuado |
| Ação | opcional, **à direita** do texto, na mesma linha |
| Componente | `core/alert` |
| Status | ✅ feito — 5 stories, 4 testes |
| Decidido por | Rick, 25/09/2026 |

Esta família **não estava no artefato que a PO validou** — meu levantamento das
telas não a cobriu, e por isso as 18 decisões não a incluíam.

O produto tinha 52 caixas desenhadas à mão em três raios (6, 8 e 12) e cinco
espaçamentos, contra 29 telas usando o componente. E não foi por falta de
variante: as seis — `default`, `info`, `success`, `warning`, `error`,
`destructive` — já existiam e suas cores já resolviam no preset. **Foi adoção.**

`action` é o que faltava de verdade: seis caixas carregavam botão ("Baixar
erros", "Tentar novamente") e não havia onde pô-lo.

### Cor de categoria — fica como está (Rick, 25/09/2026)

Nem toda cor no produto é papel de status. Há mapas que dão uma cor fixa a cada
**categoria**, só para distinguir uma da outra:

```tsx
const TYPE_COLORS = {
  department: "bg-blue-500/10 text-blue-700 ring-blue-500/20",
  team:       "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20",
  unit:       "bg-violet-500/10 text-violet-700 ring-violet-500/20",
};
```

Azul não quer dizer "ok" nem roxo "atenção" — é a mesma função das cores de um
gráfico. São 64 casos em 18 arquivos (tipos de nó da estrutura, tipos de
documento, tipos de app na HyStore, tipos de conteúdo no Academy), mais 18
ladrilhos de ícone com fundo claro.

**Decisão: ficam como estão.** As cores já foram escolhidas e cumprem o que
precisam. Tokenizar exigiria uma paleta de categorias que o design system não
tem e que ninguém pediu.

**Não confundir com status.** Se a cor diz se algo está certo, errado, pendente
ou desligado, ela é papel semântico e usa `Badge` ou `--hw-status-*`.

### Botão de ação principal — token do design system

| | |
|---|---|
| Decisão | cor primária vinda do token · raio 6 · altura 40 |
| Token | `--primary`, derivado da marca do workspace (`--hw-brand-primary`) e, sem ela, de `--hw-color-primary-default`; cursor e clique em `--primary-hover`/`--primary-active` |
| Componente | `core/button` |
| Status | ✅ existe — segue a marca desde a 0.11.0 |

**Elimina os três hex fixos em uso** (`#143748`, `#9333ea`, `#072c66`). Botão
primário nunca carrega cor literal — a cor do workspace chega pelo gancho de
marca, e só por ele (Rick, 06/10/2026).

### Rótulo de campo — semibold

| | |
|---|---|
| Decisão | 14px · peso 600 · slate-800 (`--hw-text-label`) |
| Componente | `core/label` |
| Status | ✅ feito |

Substitui 7 combinações, incluindo um hex fixo (`#111928`) e uma versão em
caixa alta.

### Mensagem de erro — colada ao campo

| | |
|---|---|
| Decisão | 14px · vermelho de erro · sem espaçamento adicional acima |
| Token | `--hw-error-text` (valor eleito: `red-500`) |
| Componente | `core/form-message` |
| Status | ✅ feito — 3 stories, 4 testes |

A escolha visual foi o `text-red-500` literal. No design system esse valor vira
**token**, para que o componente não carregue cor literal — a aparência é a
eleita, a implementação é tokenizada.

### Campo de busca — arredondado

| | |
|---|---|
| Decisão | altura 40 · raio total · ícone de lupa à esquerda |
| Componente | `core/search-input` |
| Status | ✅ feito — 4 stories, 5 testes |

Vale para a busca. **Não muda o `Input` geral**, que mantém o raio 4.

A `FilterBar.Search` passou a usá-lo: até então a barra desenhava um `Input`
comum de raio 4, ou seja, o padrão mais visível do produto não seguia a decisão.

Dentro da barra o botão de limpar do campo fica desligado — quem desfaz é o
"Limpar" da barra. Dois botões para a mesma ação, lado a lado, é uma escolha a
mais sem ganho. Solto (num seletor, num diálogo) ele aparece.

**Dentro da barra de filtros:** a busca é arredondada — a própria decisão do
campo de busca diz que vale "isolado e dentro de filtros". As seleções seguem a
amostra da Opção A do filtro: forma de campo, raio 4, com o nome da dimensão
dentro. Chips são a Opção B do filtro, que não foi eleita: `FilterBar.Chips`
continua na API só para não quebrar quem o usa, e desenha um select.

### Área de upload — borda 2px, horizontal

| | |
|---|---|
| Decisão | borda tracejada de 2px · raio 16 · ícone à esquerda e texto à direita |
| Componente | `platform/upload-area` |
| Status | ✅ feito — 4 stories, 4 testes |

---

## Componentes novos aguardando o aval da PO

Nasceram para o módulo DHO (decisão D-16 da Fase 0: componente genérico que o
DHO precisa entra aqui, com o protótipo da PO como referência de **estrutura** e
o aval visual dela depois). O visual abaixo é proposta, não escolha: até o aval,
estes componentes não são precedente para outra tela. Quando a PO decidir, a
linha vira uma seção como as de cima, com a data.

| Componente | Camada | Estrutura (do protótipo) | Proposta visual | Status |
|---|---|---|---|---|
| `Stepper` | `platform/stepper` | wizard de ciclo: 5 segmentos no topo, preenchidos até o passo atual; lista lateral com número em círculo, ✓ nos anteriores e o atual destacado | segmento de 6px na primária (trilha em `primary/20`, como o `Progress`); linha de 40px, círculo de 28px, atual com fundo `primary/10`, rótulo semibold e círculo preenchido; bloqueado com cadeado e borda tracejada | 📋 aguardando aval (07/10/2026) — 6 stories, 13 testes |
| `DatePicker` | `core/date-picker` | campos "Início" e "Encerramento" do wizard (o protótipo tem só texto dd/mm/aaaa) | campo do `Input` com o botão de calendário à direita; calendário em popover, semana de domingo a sábado, dia de 40px, escolhido na primária, hoje sublinhado | 📋 aguardando aval (07/10/2026) — 6 stories, 30 testes |
| `StatCard` | `platform/stat-card` | 4 indicadores no topo da lista de ciclos e dos resultados: ícone, rótulo, valor, nota; chip de variação; um card "em destaque" | moldura do `Card` (raio 12, respiro 24); valor de 24px bold em `--hw-text-heading`; variação nos pares fundo/texto do `Alert` (sucesso, erro, neutro); atenção com fundo e borda de aviso | 📋 aguardando aval (07/10/2026) — 11 stories, 8 testes |

`DatePicker` entra em `core` porque os dois consumidores têm campo de data (34
arquivos do Platform e 8 do Builder com `type="date"`, levantados em 07/10). `Stepper` e `StatCard` ficam em `platform`: hoje só o admin tem
assistente de passos e painel de indicadores. Subir para `core` depois não quebra
quem importa de `@hywork/ui/platform`.

---

## Espaçamento entre os padrões

Os padrões que emolduram uma listagem carregam o próprio respiro, para não
depender de a tela lembrar:

| Padrão | Respiro | Por quê |
|---|---|---|
| `FilterBar` | `mb-6` (24px) | precede a listagem |
| `ListPagination` | `mt-6` (24px) | sucede a listagem |
| `PageTitle` | `mb-6` (24px) | precede o conteúdo |

Sobrescrevível por `className` quando o layout já cuida do espaçamento —
`<FilterBar className="mb-0">`.

**Por que no componente e não na tela:** a barra de filtros sem respiro cola na
tabela, e foi exatamente o que aconteceu na primeira tela migrada. Espaçamento
que depende de cada tela lembrar é espaçamento que diverge.

## Definições de responsividade

Não são escolha entre opções existentes: são regras a definir uma vez e aplicar
ao componente. **A página nunca decide** — se decidir, a divergência volta.

| Componente | A definir |
|---|---|
| `data-list` | abaixo de qual largura a tabela vira lista e quais colunas sobrevivem |
| `filter-bar` | se colapsa em "Filtros (2)" e a partir de qual largura |
| `dialog` | se ocupa a tela inteira em telas estreitas |
| `tabs` | se rolam na horizontal ou viram seletor quando não cabem |
| `carousel` | quantos itens por largura e se os controles mudam |
| `row-actions` | se o menu vira folha inferior em telas estreitas |

---

## Regras de uso

Casos em que mais de uma forma continua válida, mas a escolha deixa de ser da
página e passa a ter regra escrita.

| Tema | Regra a definir |
|---|---|
| Carregamento | quando usar skeleton (formato conhecido) e quando usar spinner (ação pontual) |
| Paginação | a partir de quantos itens a listagem pagina |
| Estado vazio | quando basta a frase e quando cabe ação sugerida |

---

## Histórico

| Data | O que mudou |
|---|---|
| 23/09/2026 | 18 padrões decididos pela PO a partir do catálogo comparativo |
| 06/10/2026 | Rick: o design system vence em cor e token; a marca do workspace é a única entrada de cor; tabelas listradas por padrão |
| 06/10/2026 | HCK-136: `Badge` com tom suave para a segunda coluna de estado da linha (pedido da PO de 05/10; aguardando validação) |
| 07/10/2026 | `Stepper`, `DatePicker` e `StatCard` entram como proposta para o DHO, aguardando o aval visual da PO |
| 07/10/2026 | Validação do DS 2.0 pela PO: texto sobre a marca pelo contraste perceptual (APCA); `#edf1f5` no cabeçalho e menu do admin e na borda; `#edf1f5` a 40% no filtro e no cabeçalho/listra da tabela |
