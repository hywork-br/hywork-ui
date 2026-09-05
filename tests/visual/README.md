# Baselines visuais

Estas imagens registram os contratos visuais do Storybook em 1 de setembro de 2026. Os dados são ilustrativos e não representam produção. Nenhum produto foi migrado para gerar as capturas.

O arquivo `baselines.json` relaciona cada imagem à story, superfície e viewport de origem. O catálogo cobre:

- os quatro pilotos de features prioritárias no desktop;
- a diferença de densidade entre as superfícies admin e portal;
- as 12 famílias React, incluindo estados abertos de dialog, menu e tooltip;
- componentes estruturais e pilotos simples/complexos no mobile.

## Atualização

1. Execute `npm run storybook`.
2. Abra a story indicada em `baselines.json` com o global `surface` correspondente.
3. Capture em `1440 × 1000` para desktop ou `390 × 844` para mobile.
4. Revise foco, overflow, legibilidade e hierarquia antes de substituir a imagem.
5. Execute `npm run check` para confirmar que o catálogo e os arquivos continuam sincronizados.

Baselines são evidência de revisão, não testes pixel a pixel nem autorização de migração. A promoção dos padrões permanece condicionada aos pilotos reais de outubro.

## Comparação determinística adicionada em 5 de setembro

As 14 imagens acima mantêm sua proveniência e não são reutilizadas como expectativas
do comparador. As novas expectativas ficam em `deterministic/linux-visual/`:
`quality-admin.png`, `collection-admin.png` e `quality-mobile.png`.

Ambiente: imagem oficial `mcr.microsoft.com/playwright:v1.63.0-noble`, Chromium
fornecido pelo Playwright 1.63.0, Node 22, deviceScaleFactor 1, locale pt-BR,
timezone America/Sao_Paulo e tema claro. As fontes Montserrat são locais e devem
estar carregadas. Fixtures têm datas/conteúdo estáveis, busca vazia e paginação
1–5 de 12. A story `Baseline` da coleção não executa a jornada que altera filtros.
Não há sleeps, animações globais desabilitadas ou tolerância de pixels.

Após `npm ci && npm run build`, execute `npm run test:browser:gate` no ambiente
fixado. O comando executa play contracts, interações diretas e comparação.
O job CI separa os três gates para enviar artefatos mesmo se um deles falhar.
Snapshot ausente ou diferente retorna não zero; o CI normal nunca usa update-snapshots.
`browser-evidence-linux` contém actuals, diffs, traces e relatórios HTML de falha,
além de screenshots anexadas dos casos de foco que passaram.

Para a primeira captura, execute o gate normal e recolha as imagens reais produzidas
pela falha de baseline ausente. Revise composição, foco, overflow e fonte; somente
depois copie os actuals revisados para os nomes esperados e faça um commit explícito.
Para alterações posteriores, revise expected/actual/diff antes de substituir qualquer
PNG. Rerode o gate no mesmo ambiente e registre o resultado. Não aceite snapshots
atualizados automaticamente por uma PR ou pixels de macOS como baselines Linux.

Localmente em macOS, `npm run test:stories` e `npm run test:browser` exercitam
Chromium e Firefox reais; `npm run test:comparator` produz uma fixture descartável,
introduz padding de 40px, exige exit 1 e restaura o estado original com exit 0.
Essa prova não aprova nem altera baselines de produto. A captura Linux permanece
pendente até existir execução e revisão documentadas; configurar CI não é essa prova.
