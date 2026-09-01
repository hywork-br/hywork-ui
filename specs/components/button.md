# Button

## Propósito

Executar uma ação nomeada com prioridade, estado e resultado previsíveis.

## Quando usar e quando evitar

Use para ações; use link semântico com `asChild` para navegação. Evite empilhar duas ações primárias no mesmo contexto.

## Anatomia e slots

Raiz interativa, indicador opcional de loading, ícone Lucide opcional e label obrigatório.

## API e defaults

`variant="primary"`, `size="md"`, `type="button"`, `loading=false`; aceita props nativas e `asChild`.

## Variantes e estados

Primary, secondary, outline, quiet e danger; tamanhos sm/md/lg/icon; hover, active, focus, disabled e loading.

## Tokens consumidos

Papéis de ação, foreground, hover, borda, foco, altura, raio, espaçamento, duração e easing.

## Admin, portal e mobile

A API é única; `data-surface` ajusta densidade. Ações móveis mantêm alvo mínimo e podem ocupar a largura disponível.

## Teclado, foco e acessibilidade

Mantém semântica de button/link, foco visível e `aria-busy`; loading e disabled bloqueiam ativação.

## Composição e erros comuns

Ícone acompanha texto ou tem nome acessível. Não usar div clicável, ação sem label ou botão fake.

## Proveniência, status, owner e migração

Derivado dos Buttons divergentes de Platform e Builder. Status beta; owners Product Design + Frontend; onda 1 de outubro.
