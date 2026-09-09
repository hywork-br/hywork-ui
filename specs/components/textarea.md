# Textarea

## Propósito

Capturar conteúdo multilinha sem impor regra de negócio ou editor rico.

## Quando usar e quando evitar

Use para mensagens e descrições. Evite para uma linha curta ou conteúdo formatado complexo.

## Anatomia e slots

Textarea nativo dentro de Field, acompanhado por Label e texto auxiliar quando necessário.

## API e defaults

Herda props nativas e adiciona `invalid=false`; altura inicial vem do contrato visual e continua redimensionável.

## Variantes e estados

Default, placeholder, focus, disabled, read-only, invalid, conteúdo curto e conteúdo longo.

## Tokens consumidos

Compartilha superfície, texto, placeholder, input border, danger, foco, raio e tipografia com Input.

## Admin, portal e mobile

Ocupa a largura do contexto e quebra texto; mobile preserva 16px e não usa largura fixa.

## Teclado, foco e acessibilidade

Mantém semântica nativa, label programático, foco visível e descrição de erro associada.

## Composição e erros comuns

Use dentro de Field. Não aplique auto-resize que mova ações sem limite ou remova o resize sem necessidade.

## Proveniência, status, owner e migração

Derivado dos textareas duplicados dos consumidores. Status beta; owners Product Design + Frontend; onda 1 de outubro.
