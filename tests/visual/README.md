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
