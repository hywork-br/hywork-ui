# Breadcrumb

`Breadcrumb` contextualiza a localização atual em coleções, integrações e detalhes aninhados. Use `BreadcrumbLink` para destinos navegáveis e `BreadcrumbPage` apenas para a localização atual, que recebe `aria-current="page"`. Separadores e reticências são decorativos e ficam fora da árvore de leitura.

O componente não conhece rotas, permissões ou histórico. Em mobile, o consumidor decide quando reduzir a trilha ou substituir itens intermediários por `BreadcrumbEllipsis`; não remova a página atual nem o caminho de retorno sem alternativa.

## Propósito

Expor orientação espacial e um retorno claro em fluxos administrativos aninhados.

## Quando usar e quando evitar

Use em coleções, integrações e detalhes profundos. Evite em telas de primeiro nível ou quando a navegação já é plana.

## Anatomia e slots

`BreadcrumbList` contém `BreadcrumbItem`, links, página atual, separadores e, quando necessário, elipse.

## API e defaults

Links recebem `href`; a página atual não navega e recebe `aria-current="page"`. O consumidor escolhe a estratégia de truncamento.

## Variantes e estados

Suporta trilha completa, item intermediário colapsado e estado atual sem link.

## Tokens consumidos

Usa tokens de texto secundário, ação, separador e foco definidos em `tokens/componentes.css`.

## Admin, portal e mobile

Preserva a hierarquia entre admin e portal e permite reduzir itens intermediários em mobile.

## Teclado, foco e acessibilidade

Links são navegáveis por teclado; separadores e elipse são ocultos da árvore de acessibilidade.

## Composição e erros comuns

Não transforme a página atual em link nem remova o caminho de volta ao compactar a trilha.

## Proveniência, status, owner e migração

Contrato draft, owner Hywork Product Design + Hywork Frontend; adoção prevista para a wave 3 após validação nos consumidores.
