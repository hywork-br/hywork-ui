# Changelog

## Não lançado — componentes do wizard de ciclo (DHO)

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
