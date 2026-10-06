# Changelog

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

A paridade de pixels (`source/package parity`) falha igual na v0.8.0 quando
roda no macOS; no Linux do CI é o gate que vale.

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
