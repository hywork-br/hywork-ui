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

Em `asChild`, a indisponibilidade bloqueia clique, ponteiro e Enter/Espaço na
fase de captura, antes dos handlers do filho ou dos descendentes. Handlers de
captura de ativação fornecidos pelo consumidor também ficam bloqueados. Tab
continua funcionando. Habilitado, preserva a composição do Radix: handler do
filho e depois do Button, uma vez cada; refs continuam no elemento interativo.

Loading mantém o rótulo no layout e na árvore acessível, com spinner sobreposto
sem acrescentar largura. O consumidor deve manter o mesmo texto para preservar
as dimensões; trocar “Salvar” por uma frase longa ainda muda a largura. Com
movimento reduzido o indicador fica estático e `aria-busy` mantém o estado.
Hover é restrito a ponteiro preciso, exclui controles indisponíveis e não move
o botão.

`aria-busy` explícito é preservado tanto no Button nativo quanto em `asChild`;
quando o filho define o atributo, ele tem precedência. `loading=true` sempre
impõe `aria-busy=true`. O atributo visual `data-loading` acompanha apenas a prop
`loading`: marcar busy externamente não deve ocultar o rótulo nem criar spinner.

## Composição e erros comuns

Ícone acompanha texto ou tem nome acessível. Não usar div clicável, ação sem label ou botão fake.

## Proveniência, status, owner e migração

Derivado dos Buttons divergentes de Platform e Builder. Status beta; owners Product Design + Frontend; onda 1 de outubro.
