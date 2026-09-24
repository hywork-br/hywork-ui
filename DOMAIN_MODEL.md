# Padrões do produto

Decisões tomadas pela PO em **23/09/2026**, a partir do catálogo comparativo
levantado sobre 63 telas e 664 arquivos do `hywork-plataform`.

**Este documento é normativo.** Antes de criar ou alterar qualquer tela, confira
aqui se o padrão já foi decidido. Divergir de uma linha desta tabela exige
decisão registrada da PO — não é escolha de quem implementa.

Status: `✅ existe` · `🔧 ajustar` · `📋 criar`

---

## Estrutura de tela

### Título de página — 24px, bold

| | |
|---|---|
| Decisão | 24px · peso 700 · cor de texto principal |
| Token | `--hw-text-2xl` · `--hw-weight-bold` · `--hw-color-foreground` |
| Componente | `platform/page-title` |
| Status | ✅ feito |

Substitui as **9 combinações** em uso, que iam de 20px/semibold a 30px/black e
incluíam uma tela com família tipográfica própria (`font-ltwave`).

### Abas — sublinhado

| | |
|---|---|
| Decisão | altura 48 · borda inferior 1px · indicador de 2px na cor primária no item ativo · fundo transparente |
| Componente | `core/tabs` |
| Status | ✅ feito — sublinhado, altura 48, indicador de 2px |

O formato de pílula sai. 33 dos 59 arquivos que hoje montam abas à mão migram
para este componente.

### Modal — largo com rolagem

| | |
|---|---|
| Decisão | largura máxima ampla · altura máxima 90% da viewport · rolagem interna |
| Rodapé | **botões com o tamanho padrão** (altura 40, largura pelo conteúdo), alinhados à direita, espaçamento de 8px entre eles |
| Componente | `core/dialog` |
| Status | 🔧 ajustar |

**O rodapé nunca tem botão de largura total.** Por mais largo que seja o
diálogo, a ação principal mantém a mesma altura e o mesmo respiro horizontal de
qualquer outro botão do produto — o diálogo cresce, o botão não.

Ordem no rodapé: ação secundária (Cancelar) à esquerda da principal.

### Trilha de navegação — separador em seta

| | |
|---|---|
| Decisão | separador `›` · último item em peso 600 e cor de texto principal · demais em cor esmaecida |
| Componente | `core/breadcrumb` |
| Status | ✅ já conforme — o componente sempre usou seta; o que falta é adoção, já que **nenhum arquivo do Platform o importa** |

---

## Listagem e conteúdo

### Listagem de dados — Table do design system

| | |
|---|---|
| Decisão | tabela do design system, com cabeçalho em 11px maiúsculo e linhas divididas por borda |
| Componente | `core/table`, composto em `platform/data-list` |
| Status | ✅ feito — colunas declaradas, carregamento e vazio embutidos |

**A maior migração do projeto: 44 telas.** 17 usam `<table>` cru e 27 montam a
listagem com `div` e grid.

### Card de item — raio 12, respiro 24

| | |
|---|---|
| Decisão | raio 12px · respiro interno 24px · borda 1px · **sem sombra** |
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
| `positive` | `--hw-status-success` | active · published · completed · approved · finished · success |
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

### Estado vazio — respiro 64

| | |
|---|---|
| Decisão | centralizado · respiro vertical 64px · texto 14px em cor esmaecida |
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
| Componente | `core/carousel` (embla) |
| Status | ✅ existe, com **1 uso** |

As outras 11 implementações escritas à mão migram para este componente.

### Carregamento — pulso

| | |
|---|---|
| Decisão | blocos que imitam o formato do conteúdo, com pulso |
| Componente | `core/skeleton` |
| Status | ✅ feito — pulso em cinza neutro |

A forma eleita é a versão escrita à mão (`bg-gray-200 rounded animate-pulse`),
não o `Skeleton` atual. O componente do design system é ajustado para entregar
esse resultado; as telas não passam a escrever à mão.

O pulso respeita `prefers-reduced-motion`.

### Ações de linha — menu suspenso

| | |
|---|---|
| Decisão | gatilho de 32px com reticências · menu suspenso |
| Componente | `core/dropdown-menu`, composto em `platform/row-actions` |
| Status | ✅ existe · 📋 `row-actions` a criar |

Botões soltos na linha saem de uso (15 telas).

---

## Entrada de dados

### Filtro de listagem — barra com fundo suave

| | |
|---|---|
| Decisão | barra horizontal · fundo neutro a 50% · raio 12 · respiro 16 · campos alinhados pela base |
| Componente | `platform/filter-bar` |
| Status | ✅ feito — 6 stories, 11 testes; tela de Usuários migrada |

Substitui **9 implementações** com sete padrões de interação diferentes. A
anatomia: região de busca (0..n), região de dimensões (0..n), ação de limpar
(aparece quando há filtro ativo).

**Quatro telas migradas:** Usuários, Desafios, Submissões e Lixeira.

### Exceções registradas (Rick, 24/09/2026)

Duas telas **não** usam este padrão, por decisão, e assim devem permanecer:

| Tela | Forma | Por quê |
|---|---|---|
| **HyStore** | painel lateral | painel lateral é a forma esperada numa loja; converter para barra reformularia a tela inteira sem ganho |
| **Dashboard Conarh** | barra com colapso | já colapsa os filtros num botão "Filtros (2)"; fica como está |

Não são pendências. Um agente ou desenvolvedor que encontrar essas telas com
filtro próprio **não deve migrá-las** — a divergência ali é deliberada.

Composição por slots, nunca por props acumuladas:

```tsx
<FilterBar onClear={clearAll}>
  <FilterBar.Search placeholder="Buscar por nome" value={name} onChange={setName} />
  <FilterBar.Select label="Status" options={statusOptions} value={status} onChange={setStatus} />
</FilterBar>
```

### Botão de ação principal — token do design system

| | |
|---|---|
| Decisão | cor primária vinda do token · raio 6 · altura 40 |
| Token | `--primary` com fallback `--hw-color-primary-default` |
| Componente | `core/button` |
| Status | ✅ existe |

**Elimina os três hex fixos em uso** (`#143748`, `#9333ea`, `#072c66`). Botão
primário nunca carrega cor literal — assim o tema do cliente funciona.

### Rótulo de campo — semibold

| | |
|---|---|
| Decisão | 14px · peso 600 · cor de texto principal |
| Componente | `core/label` |
| Status | ✅ feito |

Substitui 7 combinações, incluindo um hex fixo (`#111928`) e uma versão em
caixa alta.

### Mensagem de erro — colada ao campo

| | |
|---|---|
| Decisão | 14px · vermelho de erro · sem espaçamento adicional acima |
| Token | `--hw-color-error-text` (valor eleito: `red-500`) |
| Componente | `core/form-message` |
| Status | 📋 criar |

A escolha visual foi o `text-red-500` literal. No design system esse valor vira
**token**, para que o componente não carregue cor literal — a aparência é a
eleita, a implementação é tokenizada.

### Campo de busca — arredondado

| | |
|---|---|
| Decisão | altura 40 · raio total · ícone de lupa à esquerda |
| Componente | `core/search-input` |
| Status | 📋 criar |

Vale para a busca. **Não muda o `Input` geral**, que mantém o raio 4.

### Área de upload — borda 2px, horizontal

| | |
|---|---|
| Decisão | borda tracejada de 2px · raio 16 · ícone à esquerda e texto à direita |
| Componente | `platform/upload-area` |
| Status | 📋 criar |

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
