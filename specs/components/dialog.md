# Dialog e AlertDialog

## Propósito

Proteger foco durante uma decisão curta; AlertDialog cobre confirmação destrutiva ou irreversível.

## Quando usar e quando evitar

Use para interrupção curta. Evite para criação longa, fluxo em etapas ou conteúdo que cabe na página.

## Anatomia e slots

Root, Trigger, Overlay, Content, Title, Description, Actions e Close.

## API e defaults

Composição Radix controlada ou não controlada; `DialogContent tone="default"`; AlertDialog fixa `role="alertdialog"`.

## Variantes e estados

Fechado, aberto, saída, alerta e conteúdo que cresce até o limite do viewport.

## Tokens consumidos

Overlay, floating surface, texto, border, shadow, radius, z-index, motion e foco.

## Admin, portal e mobile

Desktop limita a largura; mobile preserva margens e ações podem empilhar. Fluxos extensos usam FocusMode.

## Teclado, foco e acessibilidade

Exige Title, Description contextual, foco contido, Escape quando permitido e retorno ao Trigger.

## Composição e erros comuns

O CTA destrutivo nomeia o objeto. Não empilhar dialogs nem fechar silenciosamente com dados não salvos.

## Proveniência, status, owner e migração

Reconcilia dialogs divergentes de Platform e Builder. Status beta; owners Product Design + Frontend; onda 3 de outubro.
