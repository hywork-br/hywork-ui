# Progress

`Progress` comunica o avanço de uma operação cujo estado é fornecido pelo consumidor. Aceita `value` e `max`, normaliza valores fora da faixa e expõe `role="progressbar"` com `aria-valuemin`, `aria-valuemax` e `aria-valuenow`.

Use para upload, importação, processamento ou alcance de uma campanha. Não use para substituir status textuais, uma etapa do `Stepper` ou uma estimativa de tempo. O componente não faz polling, não persiste dados e não anuncia conclusão por conta própria.

Estados visuais: `idle` para zero, `loading` para valores intermediários e `complete` ao atingir o máximo. Os três estados são expostos em `data-state` para stories e composição, sem cores arbitrárias.

O consumidor deve fornecer um nome acessível quando o contexto não for óbvio e combinar a barra com texto de estado quando o número sozinho não explicar a operação.

## Propósito

Dar feedback contínuo de uma operação sem transformar a barra em uma promessa de conclusão.

## Quando usar e quando evitar

Use em uploads, importações e progresso de campanhas. Evite para status binário, etapas sequenciais ou estimativas de tempo.

## Anatomia e slots

Uma faixa semântica com indicador interno; o texto de contexto fica no consumidor.

## API e defaults

`value` inicia em `0`, `max` em `100` e `state` é inferido (`idle`, `loading` ou `complete`). Valores são limitados ao intervalo.

## Variantes e estados

Estados: `idle`, `loading` e `complete`; o estado é exposto em `data-state`.

## Tokens consumidos

Usa tokens semânticos de superfície, borda, ação primária e sucesso em `tokens/componentes.css`.

## Admin, portal e mobile

Mantém a mesma gramática nas duas superfícies e ocupa a largura disponível em telas estreitas.

## Teclado, foco e acessibilidade

Não é interativo; expõe `role="progressbar"` e valores ARIA. O consumidor fornece nome acessível.

## Composição e erros comuns

Combine com texto de estado e não use como substituto de `Stepper` ou de uma mensagem de erro.

## Proveniência, status, owner e migração

Contrato draft, owner Hywork Product Design + Hywork Frontend; adoção prevista para a wave 2 após validação nos consumidores.
