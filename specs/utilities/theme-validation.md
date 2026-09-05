# Validação de tema — utility draft

Não é família de componentes React. Exports: `parseOpaqueCssColor`,
`contrastRatio`, `validateTenantTheme`, `NORMAL_TEXT_CONTRAST` (4.5) e
`NON_TEXT_CONTRAST` (3). Owners: Hywork Product Design e Hywork Frontend.

Parser aceita hex curto/completo e rgb opaco com canais inteiros; rejeita
formatos não resolvidos. Ratio inválido retorna null. Validação retorna valid,
checks, focusChecks e failures; decisão usa ratio sem arredondar. Texto exige
4.5:1; foco exige 3:1 contra cada superfície adjacente informada. O consumidor
deve fornecer todas as superfícies relevantes e possui aplicação, persistência
e permissão do tema. Não é um verificador universal de CSS nem de dark mode.

Justificativa estrutural: pares semânticos seguros antes de aplicar marca do
tenant. Draft em 2026-09-05, zero consumidores comprovados; piloto outubro
necessário para promoção. Story executável:
`stories/Themes.stories.tsx#ValidationLab`; testes numéricos em `src/test/`.
