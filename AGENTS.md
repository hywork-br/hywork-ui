# Contrato do design system

## Escopo

Este repositório atende somente o hywork-plataform. Não implementa produto, backend,
autenticação, páginas de negócio ou navegação de aplicação.

O Platform fornece o comportamento e a referência visual existente; ele não possui
um design system consolidado que possa ser simplesmente copiado. A biblioteca deve
padronizar sem reproduzir inconsistências como se fossem decisões de design.

## Fontes e precedência

1. Pedido vigente do Vitor e limites de migração do produto.
2. `docs/design-guide.md`: critérios visuais selecionados para esta biblioteca.
3. `docs/platform-handoff.md`: integração, evidências e limitações.
4. `src/`, `tokens/platform.css`, `tailwind/platform-preset.cjs` e `manifest.json`.
5. `provenance/platform/`: referência técnica fixada, não aprovação estética.

## Ao alterar

- Preserve APIs e estados, incluindo handlers e foco; registre qualquer ruptura.
- Não introduza cores literais em componentes. Use tokens semânticos e pares fundo/texto.
- Montserrat para produto. Não importar receitas de materiais comerciais.
- Controles principais seguem escala comum; não encolher alvo para parecer minimalista.
- Mantenha o tema do cliente. Não force uma cor de marca sobre uma variável do consumidor.
- Componente genérico recebe dados/handlers por props; nunca acessa serviços do produto.
- Documento antigo e código existente não são mandato para manter um defeito.
- Mudança visual deliberada exige registro da diferença e captura após a última edição.

## Verificação

`npm run check`, `npm run build`, `npm run test:browser` e `npm run smoke:consumer`.
O teste de paridade compara componentes com a fonte fixada, não com produção.
A migração do consumidor exige evidência própria por fluxo e tenant.
Não declarar cobertura total de produto ou acessibilidade por um catálogo verde.
