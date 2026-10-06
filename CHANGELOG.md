# Changelog

## 0.11.0 — o design system vence: tokens, marca do workspace e listras

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

## 0.10.1

- **`Badge` não quebra linha:** em coluna estreita o texto passava para duas
  linhas e a pílula virava um "ovo" (tabela de usuários, "Convite não enviado").
- **`Table` com barra horizontal sempre visível:** no macOS a barra é
  sobreposta e só aparecia durante a rolagem; a tabela larga parecia cortada.

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
