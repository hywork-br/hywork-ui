# Tabs

## Propósito

Alternar painéis pares dentro do mesmo contexto sem simular navegação de página.

## Quando usar e quando evitar

Use para conteúdos relacionados e de prioridade equivalente. Evite para etapas, filtros globais ou rotas sem estado compartilhado.

## Anatomia e slots

Root, List nomeada, Trigger por valor e Content correspondente.

## API e defaults

Composição Radix controlada ou não controlada; cada Trigger e Content compartilha `value`.

## Variantes e estados

Ativa, inativa, hover, focus, disabled e conteúdo longo.

## Tokens consumidos

Texto, interactive hover, border, selected indicator, spacing, focus e motion.

## Admin, portal e mobile

Admin é compacto; em mobile a lista pode rolar horizontalmente sem cortar o foco.

## Teclado, foco e acessibilidade

List tem nome acessível; setas navegam tabs e relações tab/tabpanel vêm do primitive.

## Composição e erros comuns

Labels curtos e painéis equivalentes. Não usar Tabs como substituto de Stepper ou menu principal.

## Proveniência, status, owner e migração

Reconcilia tabs dos consumidores. Status beta; owners Product Design + Frontend; onda 4 de outubro.
