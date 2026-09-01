# Badge

## Propósito

Comunicar uma classificação ou estado curto com texto explícito além da cor.

## Quando usar e quando evitar

Use para status compacto. Evite como botão, contador sem contexto ou única evidência de estado.

## Anatomia e slots

Span de conteúdo curto com tom semântico aplicado por `data-tone`.

## API e defaults

`tone="neutral"`; tons info, success, warning e danger; aceita atributos nativos de span.

## Variantes e estados

Neutral, info, success, warning e danger; suporta labels extensos sem largura fixa.

## Tokens consumidos

Pares semânticos de superfície/foreground, tipografia, raio e espaçamento compacto.

## Admin, portal e mobile

A densidade segue a superfície; labels quebram apenas quando o contexto não permite largura suficiente.

## Teclado, foco e acessibilidade

É conteúdo estático, não recebe foco. O texto deve nomear o estado; não depender apenas da cor.

## Composição e erros comuns

Use junto do objeto que qualifica. Não usar emoji como ícone nem tom danger para decoração.

## Proveniência, status, owner e migração

Reconcilia badges de Platform e Builder. Status beta; owners Product Design + Frontend; onda 2 de outubro.
