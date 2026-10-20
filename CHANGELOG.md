# Changelog

## 0.16.1 — `StatCard`: valores alinhados numa fileira quando o rótulo quebra

Lançada em 20/10/2026 para o DHO, pelo aval permanente do Rick (14/10). Nenhuma
API muda.

### `StatCard`: cabeçalho de duas linhas com ícone (DHO, HCK-255 C1 e HCK-259 L4/L5, conferência de 20/10)

- Com `icon`, o cabeçalho (ícone + rótulo) tem sempre a altura de duas linhas do
  rótulo (`2 × --hw-leading-sm`), com os dois centralizados. Numa fileira de
  cartões, o valor começa na mesma altura em todos, quer o rótulo caiba numa
  linha, quer quebre em duas. Antes, em 1280px com o menu aberto (cartão de
  226px), "Acima do esperado" e "Abaixo do esperado" quebravam e o valor descia
  8px em relação aos vizinhos.
- O rótulo nunca é cortado; um rótulo de três linhas faz o cabeçalho crescer.
  Sem `icon`, nada muda.
- Teste de navegador novo (`tests/fixtures/indicators.html?cards=226|266`):
  fileiras de 4 `StatCard` com o topo do valor na mesma altura.

## 0.16.0 — `StatCard` com cor do ícone e destaque, marca de referência em `Progress` e `BarList`, `RatingScale` de 1 a 10

Lançada em 19/10/2026 para o DHO, pelo aval permanente do Rick (14/10) para os
componentes que o DHO usa. O **aval visual da PO segue pendente**. Nenhuma API
existente quebra: sem as props novas, os quatro componentes ficam como estavam.

### `StatCard`: cor do ícone, cartão de destaque, detalhe e barra (DHO, HCK-255 C1 e HCK-259 L5, validação da PO de 19/10)

- Nova prop `iconTone?: "primary" | "info" | "success" | "warning" | "danger" | "neutral"`:
  o quadradinho do ícone no papel de estado, com fundo suave e traço (os pares
  suaves do `Badge`). Sem ela, a primária (o aviso em `attention`), como antes.
- `tone` ganha `"highlight"`: o cartão escuro da nota final, com fundo na tinta
  do texto (`--foreground`) e valor na superfície (`--background`); rótulo,
  detalhe e nota a 80%. APCA |Lc| ≥ 77 nos temas claro e escuro (no escuro o par
  se inverte). Ícone e variação usam os pares preenchidos do `Badge`.
- Nova prop `valueDetail?: ReactNode`: texto menor ao lado do valor ("4,2 / 5,0"),
  pela linha de base, descendo de linha se faltar espaço.
- Nova prop `progress?: number` (0–100): barra fina sob o valor, só desenho;
  aviso em `attention`, trilha e preenchimento próprios no destaque.
- Novos tipos: `StatCardTone`, `StatCardIconTone`. 13 testes novos (com axe e o
  contraste APCA calculado dos tokens) e 8 stories.

### `Progress`: marca de referência e tom de atenção (HCK-259 L6)

- Novas props `marker?: number` (0–100; marca vertical fina, mais alta que a
  barra), `markerLabel?: string` (descrição da barra para o leitor de tela;
  padrão "Referência: N%") e `tone?: "default" | "attention"` (preenchimento na
  cor de aviso). Novo tipo exportado: `ProgressProps`.
- **O `Progress` passa de derivado a autoral** (`authoredNames`; `status:
  "authored"` no `manifest.json`) e sai da página de paridade fonte × pacote:
  a captura corta tudo o que passa da barra. Sem `marker` e sem `tone`, a barra
  é a mesma, nó a nó. 7 testes novos e 5 stories.

### `BarList`: marca de referência e atenção por item (HCK-259 L4)

- `BarListItem` ganha `marker?: number` (na unidade do `value`, sobre o mesmo
  denominador), `markerLabel?: string` (lido depois do texto da direita e, na
  linha clicável, parte do nome do botão; padrão "Referência: N") e
  `tone?: "default" | "attention"` (barra na cor de aviso). 8 testes novos e 3
  stories, entre elas "Time vs. empresa".

### `RatingScale`: escala de 1 a 10 com o rótulo embaixo (HCK-235 M1)

- Nova prop `labelDisplay?: "auto" | "inline" | "selected"` (padrão `"auto"`:
  `inline` até 5 notas, `selected` acima). Em `selected`, as notas ficam numa
  linha compacta (alvo de 44px de altura, ≥ 24px de largura em 320px) e o
  rótulo aparece embaixo: o da nota sob o cursor ou em foco, senão o da
  escolhida, senão a legenda dos extremos. Nome acessível, teclado, `readOnly`,
  referência e erro iguais aos de antes. 17 testes novos e 8 stories.

### Testes

- Nova página `tests/fixtures/indicators.html` no Playwright (Chromium e
  Firefox): axe com contraste, APCA do destaque nos temas claro e escuro,
  geometria da marca e escala de 10 em 320/360px sem rolagem horizontal.

## 0.15.0 — `DistributionBar` com legenda em lista

Lançada em 16/10/2026 para o DHO, pelo aval permanente do Rick (14/10) para os
componentes que o DHO usa. O **aval visual da PO segue pendente**. Nenhuma API
existente quebra: o padrão continua `legend="auto"`.

### `DistributionBar`: `legend="list"` (DHO, HCK-256, validação da PO de 15/10, R7)

- Nova prop `legend?: "auto" | "list"` (padrão `"auto"`, o comportamento de
  antes). `"list"` segue o protótipo: barra de 12px e, embaixo, uma linha por
  faixa com borda superior fina — cor, rótulo, `note` (ex.: "1 pessoa"),
  percentual e, com `onSelect`, a linha inteira como botão.
- Nova prop `selectLabel?: string` (padrão "Ver"), o texto da ação da linha no
  modo lista, para o consumidor traduzir.
- Acessibilidade igual à de antes: a barra fica fora da árvore e a lista é o
  texto do gráfico. 5 testes novos (com axe) e 2 stories.
- **Consumidor:** substitui a cópia temporária de lista que o plataform criaria
  para a "Distribuição dos resultados" do DHO.

## 0.14.0 — `DonutChart` em `@hywork/ui/charts` e `Breadcrumb` em pt-BR

Lançada em 15/10/2026 para o DHO, pelo aval permanente do Rick (14/10) para os
componentes que o DHO usa. O **aval visual da PO segue pendente**: o visual do
`DonutChart` é proposta e fica em `DOMAIN_MODEL.md`, "Componentes novos
aguardando o aval da PO". Nenhuma API existente quebra.

### `DonutChart` (DHO, HCK-256, validação da PO de 15/10, R6)

- Rosca com um segmento por item (`segments: { id, label, value, color? }[]`),
  fração `value / soma`, valor e rótulo opcionais no centro (`centerValue`,
  `centerLabel`), tamanho por `size` (padrão 140px, a geometria do protótipo:
  raio 54, traço 18). Soma zero desenha só o trilho neutro.
- Cores só por token de gráfico (`chart-1..5`), na ordem das séries de
  `shared/scale.ts`; do 6º segmento em diante a ordem se repete a 55% de
  opacidade. `donutColors(segments)` devolve as mesmas cores para a lista ao
  lado, que é da tela (`legend` opcional, padrão desligado).
- Acessibilidade: `role="img"` com nome gerado ("label: valor") ou
  `aria-label` + descrição; com `onSegmentClick`, cada fatia vira botão, com
  Tab/Enter/Espaço e anel de foco em `stroke-ring`.
- **Para a PO:** com 6 itens, as cores `chart-2..4` (verde, âmbar, vermelho)
  podem ser lidas como estado; a paleta de gráficos continua pendente.

### `Breadcrumb`: níveis ocultos em pt-BR

- O `BreadcrumbEllipsis` tinha o texto de leitor de tela "More", em inglês,
  nos produtos em pt-BR (QA do DHO, 14/10/2026). Ganha `label`, com padrão
  "Mais", no padrão do `closeLabel` do `Sheet` e do `Dialog` da 0.13.0. Visual
  idêntico: o texto é só do leitor de tela.
- O `Breadcrumb` é autoral (`authoredNames` do derive), então a troca está no
  próprio componente, sem passar pelo derive. Testes: 2 do `BreadcrumbEllipsis`
  (os primeiros do `Breadcrumb`).
- **Consumidor:** teste que acha o texto "More" passa a achá-lo por "Mais".

## 0.13.0 — gráficos, `BarList`, `ProgressRing` e `RatingScale` para o DHO

Lançada em 14/10/2026 por decisão do Rick, para o DHO usar a versão publicada
no lugar das cópias temporárias do plataform. O **aval visual da PO segue
pendente**: o visual dos componentes novos continua proposta, e eles continuam
em `DOMAIN_MODEL.md`, "Componentes novos aguardando o aval da PO". Nenhuma API
existente quebra; a única dependência nova é o `recharts`, peer opcional e só
da entrada `@hywork/ui/charts`.

### Gráficos em `@hywork/ui/charts` (DHO, HCK-256)

Os gráficos da Etapa 3 do DHO (Resultados do ciclo), pela decisão D1-23 do
Rick (13/10/2026): nascem no design system. O **visual é proposta** e aguarda
o aval da PO, e a **cor de cada faixa** da distribuição é decisão dela — ver
`DOMAIN_MODEL.md`, "Gráficos". Nenhuma API existente muda.

- **Entrada nova `@hywork/ui/charts`** (`src/charts.ts`, no `tsup` e no
  `exports`), com `"use client"`. É a única que importa o `recharts`, agora
  **peer opcional** (`>=3.1 <4`; 3.10.1 no desenvolvimento, a versão do lock
  do admin). `@hywork/ui`, `/platform` e `/builder` não o carregam: o
  `smoke:consumer` percorre os imports do tarball instalado e confere, e
  `scripts/charts-entry.test.mjs` barra import de `recharts` fora de
  `src/charts`, dependência direta e cor literal nos gráficos.
- **`ChartFrame`:** título (h2), base, botão "Como é calculado" com popover,
  controles, rodapé; `state` `loading` (esqueleto, `aria-busy`) e `empty`
  ("Sem dados suficientes" ou `emptyMessage`).
- **`RadarChart`:** uma série por polígono; nome do eixo com nota e marcador
  em linhas próprias; `onSelect` pelo nome do eixo (botão) e pelo setor.
  `null` abre o polígono em vez de levar o ponto ao centro. Vira
  `GroupedBarChart` com menos de 3 categorias ou abaixo de 360px.
- **`GroupedBarChart`:** barras agrupadas na horizontal, valor na ponta, nome
  que quebra numa coluna nunca mais estreita que a palavra mais longa; altura
  pela quantidade de categorias. `onSelect` pelo clique na linha e por um botão
  de teclado por linha.
- **`LineChart`:** uma série; `provisional` deixa o ponto vazado e o trecho até
  ele tracejado, `flag` vira losango; só o último valor escrito; `null`
  interrompe a linha.
- **`DistributionBar`:** barra empilhada 100% só em CSS; legenda com rótulo e
  "25% · 1 pessoa", numa linha, em duas ou em uma coluna; `onSelect` pela
  legenda (botão) e pela fatia. Cor padrão: rampa de `--chart-1`; `color`
  aceita um token `chart-1..5` por faixa.
- **Comum:** cores só por token (`--chart-1..5`, séries na ordem `1, 5, 2, 3,
  4`); números chegam arredondados e `formatValue` formata (padrão
  `Intl` pt-BR); tabela do leitor de tela em cada gráfico e desenho fora da
  árvore de acessibilidade; animação de 400ms, desligada por
  `prefers-reduced-motion`; com `width` fixo não há medição nem animação — é
  o modo de impressão.
- Testes: 55 no Vitest (axe sem contraste, `ResizeObserver` e
  `prefers-reduced-motion` simulados em `tests/resize-observer.ts`) e 18 no
  Playwright, em Chromium e Firefox (`tests/browser/charts.spec.ts`): axe com
  contraste, sem rolagem horizontal em 1440/390/320px, teclado com anel de
  foco, clique e dica, movimento reduzido e impressão. 37 stories no catálogo
  do admin, em "Gráficos".
- `recharts` e `react-is` entram nas `devDependencies`, na versão fixa.

### `BarList`, `ProgressRing` e o `aria-valuenow` do `Progress` (DHO, HCK-255)

Dois componentes genéricos que a Etapa 2 do DHO precisa (HCK-255, decisão
D1-23 do Rick, 08/10/2026), e a correção de acessibilidade do
`Progress` apontada no §10 do plano da Fase 1. O **visual dos dois novos é
proposta** e aguarda o aval da PO — ver `DOMAIN_MODEL.md`, "Componentes novos
aguardando o aval da PO". Nenhuma API existente muda; sem dependência nova
(SVG e CSS com tokens, sem `recharts`).

- **`BarList` em `platform`:** uma linha por item — rótulo, texto à direita
  (`valueLabel`, ex. "92% · 78 de 85") e barra proporcional. Largura
  `value / max` limitada a 0–100%; o `max` do item vence o da lista, que vence
  o maior valor. `max` zero, negativo ou inválido dá barra vazia, nunca NaN.
  Sem `valueLabel`, a direita mostra o `value` (pt-BR); `null` a deixa vazia.
  Lista semântica (`ul`/`li`); a barra é desenho (`aria-hidden`). Linha com
  `onSelect` vira `button` com anel de foco; o texto quebra dentro da linha.
  Barra na tinta da marca (`--primary-ink`), trilha neutra (`--muted`).
- **`ProgressRing` em `core`:** anel de progresso em SVG, `role="progressbar"`
  com `aria-valuenow`/`aria-valuemin`/`aria-valuemax`. `value` limitado a
  `[0, max]` (`max` padrão 100; zero dá valor 0 e anel vazio). Tamanhos de 48,
  72 e 96px; o centro mostra a porcentagem arredondada ou o `label` da tela, que
  também vira `aria-valuetext` quando é texto. Nome padrão "Progresso", que cede
  ao `aria-label`/`aria-labelledby`. Arco na tinta da marca, trilha neutra.
- **`Progress` expõe `aria-valuenow`:** o `value` passa a chegar ao Radix (antes
  só posicionava o indicador). A correção está na derivação
  (`extractComponent`), como a do `Slider`; o componente segue derivado e a
  paridade de pixels não muda. Um `aria-valuenow` passado à mão pela tela
  continua valendo — o front do DHO pode tirá-lo quando subir de versão.
- `progress-ring` entra em `nativeNames` do derive e no `manifest.json`.
- Testes com axe-core (sem contraste, que o jsdom não mede): `BarList` 16,
  `ProgressRing` 11, `Progress` 6 (o primeiro teste dele). No navegador, as
  stories novas e as do `Progress` passaram no axe com contraste, sem rolagem
  horizontal em 390px. A única reprovação é a da story `Vazio` do `BarList`,
  que mostra o `EmptyState`: o texto gray-400 eleito pela PO dá 2,53:1 sobre
  branco — pendência daquele componente, não deste.

### `RatingScale` — escala de resposta (formulário de avaliação do DHO)

Componente genérico que o formulário de avaliação do líder precisa (D-16 da
Fase 0). O **visual é proposta** e aguarda o aval da PO — ver
`DOMAIN_MODEL.md`, "Componentes novos aguardando o aval da PO". Nenhuma API
existente muda e não há dependência nova.

- **`RatingScale` em `core`** (sai nas duas entradas, `platform` e `builder`;
  o Builder vai usá-la na fase da intranet). Notas de 1 a N em linha, cada uma
  com o número e o rótulo; `labels` define a escala (índice 0 = nota 1; sem
  rótulos, 5 notas). API: `name`, `value` (`number | null`), `onChange`,
  `labels`, `disabled`, `readOnly`, `error`, `aria-label`,
  `showSelectedLabel`, `compareValue` — e, opcionais, `aria-labelledby` (para
  apontar o texto visível da pergunta) e `className`.
- **Grupo de rádio de verdade:** `role="radiogroup"`, uma parada de Tab por
  escala; setas mudam **e marcam** em qualquer velocidade de tecla (dão a
  volta nas pontas), Home/End vão à primeira e à última, Espaço marca, Enter
  não. `readOnly` é focável e anunciado como só leitura — as setas passeiam
  pelas notas sem marcar; `disabled` sai da ordem do Tab. `error` liga a
  mensagem ao grupo por `aria-describedby` e marca `aria-invalid`. `name` vai
  num campo oculto, para o formulário nativo.
- **`compareValue`:** um segundo valor marcado com um ponto discreto no canto
  da nota, que o leitor de tela ouve como "valor de referência". Não é uma
  escolha; o que a referência é, a tela diz.
- **Responsiva no componente:** a partir de 640px, número e rótulo em cada
  nota; abaixo, só o número (alvo de 44px) e uma legenda dos dois extremos. O
  nome acessível é sempre "número, rótulo".
- `rating-scale` entra em `nativeNames` do derive e no `manifest.json`.

### `RadioGroup`: as setas marcam também na tecla rápida

- O Radix move o foco num `setTimeout` e só marca se a tecla ainda estiver
  apertada quando o foco chega — uma tecla rápida (ou automatizada) movia o
  foco sem marcar, e o DHO teve de escrever um hook
  (`use-radio-arrow-select`) para contornar. Agora o `RadioGroup` clica o
  rádio que ficou com o foco depois daquele timeout: `onValueChange` dispara,
  também no grupo não controlado. Sem mudança de API; o `onKeyDown` da tela
  continua sendo chamado. **O hook do consumidor pode sair** ao subir a versão.
- A correção está na transformação do derive (`checkRadioOnArrow`), não só na
  saída, e reprova se o trecho da captura mudar. Visual idêntico: a paridade
  não muda.

### Testes do `RatingScale` e do `RadioGroup`

- Vitest: 25 testes do `RatingScale` e 6 do `RadioGroup` (que não tinha
  nenhum), todos com o axe-core; o do `RadioGroup` reprova sem a correção.
- `test:browser` ganha `rating-scale.spec.ts` (Chromium e Firefox): axe com
  contraste nos temas claro e com marca, teclado real (a tecla do Playwright é
  a "tecla rápida" — sem a correção, o `RadioGroup` reprova no Chromium) e a
  largura de 320px sem rolagem horizontal. A mensagem de erro fica fora do
  contraste pelo mesmo motivo da 0.11.0 (red-500 da PO, 3,76:1).
- `smoke:consumer` confere o `RatingScale` no tarball instalado, nas entradas
  `@hywork/ui` e `@hywork/ui/builder`.

### `Sheet` e `Dialog`: botão de fechar em pt-BR

- O botão de fechar do `Sheet` e do `Dialog` tinha o nome acessível "Close",
  em inglês, nos produtos em pt-BR (QA, 14/10/2026). `SheetContent` e
  `DialogContent` ganham `closeLabel`, com padrão "Fechar", como o
  `clearLabel` do `SearchInput` e o `triggerLabel` do `RowActions`. Visual
  idêntico: o texto é só do leitor de tela.
- O `Sheet` é derivado da captura, então a troca está no derive
  (`labelSheetClose`) e reprova se o trecho da captura mudar; o `Dialog` é
  autoral. Testes: 2 do `Sheet` (o primeiro dele), 2 do `Dialog` e 1 do derive.
- **Consumidor:** teste que acha o botão pelo nome "Close" passa a achá-lo por
  "Fechar".

## 0.12.1 — corpo de 14px no admin

- **Corpo do admin em 14px** (Rick, 08/10/2026). Tokens novos
  `--hw-text-body`/`--hw-leading-body` (16px no padrão; 14px/20px em
  `tokens/platform.css`), aplicados ao `body` por uma regra base do
  `platform-preset`. O texto sem classe — conteúdo de card, modal e popover,
  células e itens soltos — deixa de sair em 16px ao lado dos controles de 14px.
  A escala `text-*` e o rem não mudam.
- **`CardTitle` de 24px para 18px** (`text-lg`): era o mesmo tamanho do título
  de página. Hierarquia: página 24, card e modal 18, corpo 14, apoio 12.
- **Consumidor:** onde o admin mostra conteúdo da intranet (canvas do Page
  Builder, prévias), fixe `text-base` no contêiner — a intranet segue em 16px.

## 0.12.0 — design system 2.0: o DS vence, marca do workspace e ajustes da PO

A linha `feat/ds-autoridade-tokens` (validada pela PO na branch
`docs/design-system-hywork-ui` do Platform) chamava a si mesma de 0.11.0 e
0.11.1, mas nunca ganhou tag; a `v0.11.0` publicada é a do wizard do DHO.
A 0.12.0 junta as duas e traz os ajustes da validação da PO de 07/10/2026.

### Ajustes da validação da PO (07/10/2026)

- **Texto sobre a cor do workspace pelo contraste perceptual (APCA).**
  `brandThemeVars` escolhe entre branco e slate-900 o de maior contraste APCA
  (0.0.98G, o modelo do rascunho da WCAG 3). A PO reprovou o texto escuro sobre
  um workspace laranja: a WCAG 2 escolhia escuro em laranja, vermelho e azul
  médio porque o branco fica entre 2,8:1 e 3,7:1. Agora esses tons dão branco;
  amarelo, lima, âmbar e branco seguem escuros. O preto puro saiu do cálculo.
  Cursor e clique escurecem a marca e nunca levam o texto abaixo de Lc 50.
  Quando escurecer apagaria o texto, eles clareiam, e se faltar espaço para
  dois degraus os dois dividem o que há. A tinta (`--primary-ink`) continua em
  4.5:1 sobre o branco. Novo export: `apcaContrast` e `MIN_TEXT_LC` em
  `@hywork/ui/theme`.
- **`#edf1f5` no cabeçalho e no menu do admin** (`--hw-color-admin-bg`, era
  `#EFF0F1`) e **na borda** (`--hw-color-border`, era `217 20% 82%`). No modo
  escuro a borda não muda.
- **`#edf1f5` a 40%** no fundo da `FilterBar` (novo `--hw-filter-surface`,
  classe `bg-hw-filter-surface`, no lugar de `bg-muted/50`) e no cabeçalho,
  rodapé e listra da `Table`/`DataList` (`--hw-table-surface` e
  `--hw-table-stripe`, eram gray-50). O alfa vem no token, então essas três
  classes não aceitam `/NN`. Cursor (gray-100) e seleção (gray-200) não mudam.
- **Paridade de pixels:** a referência congelada recebe a borda decidida, como
  já recebia a marca; `test:browser` segue 24/24.
- **Campo de busca com raio 4** (Rick, 07/10/2026). O `SearchInput` deixa o
  `rounded-full` e passa a `rounded-sm`, o mesmo raio dos campos, selects,
  gatilhos e botões da `FilterBar`. A pílula destoava de tudo ao lado dela no
  filtro.


### Tom suave no selo de estado, e a 0.10.3 dentro da linha do DS 2.0

- **`Badge` `tone="subtle"`** (HCK-136): o mesmo papel num preenchimento claro —
  a cor do papel a 15% — com o texto na tinta do papel (4,8:1 a 5,5:1). Para
  separar duas colunas de estado na mesma linha; o tom cheio continua o padrão.
  Regra em `DOMAIN_MODEL.md` ("Indicador de status").
- **A linha 0.11 traz a 0.10.2 e a 0.10.3**, que saíram da `develop` depois que
  ela foi aberta. O que muda para quem usava a branch: o selo `positive`/`success`
  passa a texto escuro (`--hw-on-status`, 7:1) em vez de branco (2,5:1), e as
  peers `cmdk`, `embla-carousel-react` e `@tiptap/*` (2.x) ficam obrigatórias.
- **`test:browser` verde na linha 0.11** (24/24; a branch tinha 12 falhas de
  paridade). Os componentes estavam certos: a referência congelada é que ainda
  montava o contrato antigo. Agora ela expressa as decisões de 06/10 — anel sem
  cor é `--ring` (o `ring-0` do polegar do `Switch` diferia no Firefox) e, no
  tema `tenant`, o anel recebe a marca (o X do `Sheet` diferia no Chromium).

### O design system vence: tokens, marca do workspace e listras

Decisões do Rick de 06/10/2026, em `DOMAIN_MODEL.md` ("Cor e token").

- **O design system declara todas as variáveis da aplicação.**
  `tokens/core.css` passa a declarar `--background`, `--foreground`,
  `--card`, `--popover`, `--primary`, `--secondary`, `--muted`, `--accent`,
  `--destructive`, `--success`, `--warning`, `--error`, `--info` (com os
  `-foreground`), `--border`, `--input`, `--ring`, `--radius` e
  `--chart-1..5`; `platform.css`, `--admin-bg/-surface/-sidebar`. Mesmos
  valores que o admin declarava. O preset as lê **sem** o fallback
  `var(--primary, var(--hw-…))`.
- **Ruptura para o consumidor:** ele não declara mais essas variáveis nem
  chaves em `theme.extend.colors`. Um `:root { --primary: … }` deixado no
  `globals.css` continua vencendo pela ordem do CSS e anula a marca do
  workspace — remova-o. A trava `@hywork/ui/consumer-check` reprova.
- **Cor de marca do workspace:** gancho `--hw-brand-primary` (+
  `-foreground`, `-hover`, `-active`, `-ink`), calculado por
  `brandThemeVars(hex)` — em `@hywork/ui/theme` (sem "use client") e nas
  entradas `platform`/`builder`. Texto sobre a marca com contraste AA
  garantido; `--primary-ink` é a marca legível sobre o branco. Novos
  `<BrandTheme color>` e `useBrandTheme(hex)`.
- **Componentes seguem a marca:** Button `default` (cursor e clique agora
  em `--primary-hover`/`--primary-active`, que escurecem; antes `/90`, que
  clareava) e `link`; aba ativa; anel de foco (o `ring-2` sem cor também);
  checkbox, rádio, switch, progresso, slider, spinner, upload ao arrastar.
  Estado e destrutivo não seguem a marca.
- **Tabela listrada por padrão:** `Table striped` e `DataList striped`
  (padrão `true`). Cursor passa de gray-50 a gray-100
  (`--hw-table-hover`) e linha selecionada de gray-100 a gray-200
  (`--hw-table-selected`), para os três estados não se confundirem.
- **Cor literal → token:** campos (`hw-field*`), trilho do slider, véu de
  diálogo/folha/alerta (`hw-overlay`), toast destrutivo, RichTextEditor e
  MultiSelect. Diferenças visíveis pequenas: borda do gatilho do
  IconSelect (gray-300 → slate-300), borda da lista do Select (gray-300 →
  `border`), texto das pílulas do MultiSelect (gray-700 → foreground),
  botão "OK" do editor (azul → marca).
- **`Select` `focusColor` ignorado** (marcado `@deprecated`, continua no
  tipo): a tela não escolhe a cor do foco.
- Nova entrada `@hywork/ui/consumer-check` — `assertNoTokenOverrides`,
  `findTokenOverrides`.

## 0.11.0 — componentes do wizard de ciclo (DHO)

Três componentes genéricos que a tela "Criar ciclo de avaliação" do DHO precisa
(D-16 da Fase 0). A estrutura vem do protótipo da PO; o **visual é proposta** e
aguarda o aval dela — ver `DOMAIN_MODEL.md`, "Componentes novos aguardando o
aval da PO". Nenhuma API existente muda.

- **`DatePicker` em `core`:** data única. Mostra dd/mm/aaaa e devolve
  `'YYYY-MM-DD'`, sem fuso (toda a aritmética em `Date.UTC`). Digitação com
  máscara (colar ISO também vale) e calendário em popover com o teclado do
  WAI-ARIA (setas, Home/End, PageUp/PageDown, Shift para ano, Alt+↓ para abrir).
  Datas fora de `min`/`max` desabilitadas; texto inválido ou fora do intervalo
  devolve `null` e mostra o motivo colado ao campo, ligado por
  `aria-describedby`. Calendário próprio, **sem dependência nova**: o
  `react-day-picker` viraria peer obrigatória (política da 0.10.2) e o Builder
  tem a 8.x, de API incompatível com a 9.x.
- **`Stepper` em `platform`:** trilha de passos de wizard. `horizontal` são
  segmentos preenchidos até o passo atual (só leitura); `vertical` é a lista com
  número em círculo, ✓ nos concluídos, cadeado nos `locked` (`aria-disabled`,
  sem clique) e o atual com `aria-current="step"`. Clicável só com `onSelect`.
- **`StatCard` em `platform`:** cartão de indicador — ícone, rótulo, valor, nota
  e variação já formatada (`delta`) com tom `positive`/`negative`/`neutral`, que
  o leitor de tela ouve por extenso. `tone="attention"` destaca o cartão.
- `date-picker` entra em `nativeNames` do derive e no `manifest.json`.
- Os testes dos três passam também pelo axe-core (sem contraste, que o jsdom não
  mede); no navegador, o contraste das stories novas foi conferido com o axe.
  A única reprovação é a da mensagem de erro do `DatePicker`, que é o
  `FormMessage`: o red-500 eleito pela PO dá 3,76:1 sobre branco, como em todo
  campo do pacote — pendência de decisão, não deste componente.

## 0.10.3 — `test:browser` verde

- **Selo de sucesso com contraste:** o verde da PO (emerald-500) fica, e o texto
  do `Badge` `positive`/`success` passa de branco (2,5:1) para `--hw-on-status`
  (7:1), como nos botões de status. Exceção registrada no DOMAIN_MODEL. Os selos
  `attention`, `negative` e `info` seguem com texto branco (6,5:1 ou mais).
- **Paridade só das primitivas derivadas:** a comparação exata de pixels passa a
  usar uma página só com as primitivas `source-derived` do manifesto, em repouso
  e com cada sobreposição aberta, uma aba por lado e os dois com movimento. Antes,
  a página inteira misturava as autorais, e qualquer decisão da PO (rótulo
  semibold, abas de largura igual) deslocava o resto — vermelho no CI desde 25/09.
  O teste de mutação agora prova também uma troca sutil de cor de borda.

## 0.10.2 — gates verdes de novo

Resolve as pendências técnicas com que a 0.10.1 saiu. Nada muda no que os
componentes renderizam.

- **Peers declaradas como o pacote as usa:** `cmdk`, `embla-carousel-react` e
  sete pacotes `@tiptap/*` estavam como opcionais, mas as entradas do pacote os
  importam de forma estática — um consumidor sem eles quebrava no primeiro
  `import`. Passam a obrigatórios (o npm os instala junto). O
  `@tiptap/extension-highlight` segue opcional: vai embutido no `dist`.
- **Tiptap limitado à 2.x** (`>=2.0.0 <3`): a faixa aberta deixava o npm instalar
  o 3.x, que não exporta mais o `BubbleMenu` do editor de texto rico.
- **`smoke:consumer` volta a passar:** procurava a cor primária no preset do
  Platform, que desde a divisão em camadas a herda do preset do core. Falhava
  desde antes da 0.8.0.
- **`derive` conhece as primitivas nativas** (`nativeNames`): carousel, command,
  form, form-message, search-input, spinner e toast ficam no barrel, e o
  manifesto lista as nativas e passa a refletir o `authoredNames` atual (sete
  componentes estavam marcados como derivados). Dois testes novos travam essa
  defasagem.
- **`audit:gate` no lugar do `npm audit --audit-level=high`** no CI e no release.
  O `npm audit fix` resolveu undici, source-map-js, fast-glob e brace-expansion;
  sobra o `braces` (GHSA-vfj7-8cjw-p6xm), sem versão corrigida em nenhum 3.x e
  só resolvido pelo Tailwind 4. Fica como exceção com motivo e revisão até
  31/12/2026 — vencida a data, o gate volta a falhar.

Continua aberto no `test:browser`:

- o contraste do selo de sucesso escolhido pela PO (ver 0.10.1), que mantém o
  `accessible catalogue` vermelho até a decisão dela;
- a paridade de pixels, vermelha desde 25/09 (ver 0.10.1).

## 0.10.1

- **`Badge` não quebra linha:** em coluna estreita o texto passava para duas
  linhas e a pílula virava um "ovo" (tabela de usuários, "Convite não enviado").
- **`Table` com barra horizontal sempre visível:** no macOS a barra é
  sobreposta e só aparecia durante a rolagem; a tabela larga parecia cortada.
- **`manifest.json` na mesma versão do pacote** (estava em 0.10.0 e derrubava o
  `npm run check`).

**Publicada com duas pendências conhecidas (06/10, aval do Rick):**

- **Contraste do selo de sucesso:** a escolha literal da PO
  (`--hw-status-success-fill` = emerald-500 com texto branco) dá ~2,5:1, abaixo
  dos 4,5:1 da WCAG. O teste `accessible catalogue` (light e tenant) fica
  vermelho até a PO decidir entre escurecer o verde ou o texto.
- **`npm run derive` desatualizado:** o script ainda não conhece os sete
  componentes trazidos na 0.10.0 (carousel, command, form, form-message,
  search-input, spinner, toast) e os tiraria do barrel do core. Não rode o
  `derive` antes de atualizá-lo.

A paridade de pixels (`source/package parity`, 12 casos) está vermelha no CI
desde 25/09, já na v0.8.0 — no macOS e no Linux. As decisões visuais aplicadas
desde então divergem da captura de procedência e ainda não foram registradas
como diferenças deliberadas.

## 0.10.0 — genéricos que ainda moravam no Platform

- **Novos em `core`:** `Toast`/`Toaster`/`toast`/`useToast`, `Form` (camada do
  react-hook-form), `Command` (cmdk) e `Spinner` (sem framer-motion; é para
  ação em andamento — conteúdo carregando segue sendo `Skeleton`).
- **Novos em `platform`:** `MultiSelect`, `FontAwesomeIconSelect` e
  `RichTextEditor` (tiptap).
- **`FormMessage` é um só:** dentro de um `FormItem` mostra o erro do campo no
  react-hook-form; solto, mostra o texto recebido. O rótulo com erro usa o token
  de erro, e o asterisco de obrigatório também.
- Peers novos: `@radix-ui/react-toast`, `react-hook-form`, e — opcionais —
  `cmdk`, `@tiptap/*`, `embla-carousel-react`.

## 0.9.1

- **Diálogo:** o invólucro interno do `DialogContent` ganhou `gap-4`. O gap do
  conteúdo só alcançava esse invólucro, e cabeçalho, corpo e rodapé ficavam
  colados em todo diálogo de formulário.

## 0.9.0 — escolhas da PO aplicadas ao pé da letra

Referência: artefato Catálogo de Divergências. Ver `DOMAIN_MODEL.md`, "Fonte da
verdade".

- **Abas:** a lista ocupa a linha e divide a largura em partes iguais; aba ativa
  com texto na cor primária. Telas que passavam `className` para imitar isso
  podem remover a sobrescrita.
- **Filtros:** seleções com forma de campo (raio 4) e o nome da dimensão dentro
  do campo; sem rótulo acima. `FilterBar.Chips` está obsoleto e desenha um
  select — chips não são o padrão eleito.
- **Select:** o gatilho passa a ter a forma do `Input` (raio 4, borda
  `slate-300/80`, fundo branco). Antes tinha raio 8 e não casava com os campos
  ao lado.
- **Cores eleitas:** título em slate-900, rótulo em slate-800, estado vazio em
  gray-400 e badge `positive` em emerald-500 — novos tokens `--hw-text-heading`,
  `--hw-text-label`, `--hw-text-subtle`, `--hw-status-success-fill`.
- **Medidas:** botão com raio 6 (estava 8), card com raio 12 (estava 16), upload
  com raio 16 e respiro 16/32 (estava 24 e 16), modal `max-w-4xl`, trilha com
  separador `›` e item atual em peso 600, esqueleto em gray-200.
- **Carrossel:** novo `core/carousel`, com a mesma API do que existia no
  Platform. Requer `embla-carousel-react` (peer).
- **Tabelas rolam na horizontal:** `DataList` aplica uma largura mínima
  proporcional às colunas e o contêiner encolhe dentro de flex. Antes a
  rolagem do `Table` nunca aparecia e o layout da página cortava as colunas.

## 0.7.0 — em preparação

- Escopo exclusivo do hywork-plataform.
- 28 famílias extraídas da revisão técnica fixada do produto, com APIs preservadas.
- Tokens e preset Tailwind 3 gerados; tema do consumidor tem precedência.
- Guia de design distingue referência existente de padrão visual desejado.
- Catálogo de componentes, procedência e teste fonte × pacote.
- Slider preserva uso controlado e corrige thumb com defaultValue e nome acessível.
- Contraste corrigido em texto de estado e caption; scroll por teclado, headings
  e preferência de movimento reduzido explícitos.

Esta versão muda a API e os caminhos de CSS/preset de 0.6.x. Não é atualização
automática: seguir [o handoff](docs/platform-handoff.md).
