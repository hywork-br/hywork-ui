# Changelog

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
