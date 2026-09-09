# Tooltip

## Propósito

Complementar um controle já compreensível com uma explicação curta.

## Quando usar e quando evitar

Use para ícones e contexto secundário. Evite para informação essencial, erro, confirmação ou conteúdo interativo.

## Anatomia e slots

Provider, Root, Trigger e Content em portal.

## API e defaults

Composição Radix; Content usa `sideOffset=6` e aceita posicionamento do primitive.

## Variantes e estados

Fechado, hover/focus, aberto e atraso do Provider.

## Tokens consumidos

Floating foreground/surface, shadow, radius, spacing, z-index e motion.

## Admin, portal e mobile

Não é a única forma de descobrir ação em touch; mobile precisa de label persistente quando a ação não for óbvia.

## Teclado, foco e acessibilidade

Abre em hover e foco, associa descrição ao Trigger e fecha em Escape.

## Composição e erros comuns

Texto curto e direto. Não colocar botões ou parágrafos longos dentro do Tooltip.

## Proveniência, status, owner e migração

Reconcilia tooltips divergentes. Status beta; owners Product Design + Frontend; onda 3 de outubro.
