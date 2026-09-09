# Card

## Propósito

Agrupar um objeto coerente quando a superfície precisa de limite e hierarquia próprios.

## Quando usar e quando evitar

Use para uma unidade independente. Evite cards dentro de cards ou cards como scaffold universal da página.

## Anatomia e slots

Article raiz, Header, Title, Description, Content e Footer opcionais.

## API e defaults

Slots herdam atributos HTML; `CardTitle` usa `as="h3"` e aceita h2/h3/h4 conforme a hierarquia real.

## Variantes e estados

Default, interativo apenas quando contém um controle real, conteúdo curto/longo e ação no footer.

## Tokens consumidos

Card surface, texto, border, raio, espaçamento e elevação.

## Admin, portal e mobile

Padding segue densidade da superfície; mobile vira fluxo vertical e permite quebra de conteúdo.

## Teclado, foco e acessibilidade

Mantém article e headings válidos; o card inteiro não vira botão implícito.

## Composição e erros comuns

Uma ação principal pode viver no Footer. Evite duplicar borda e sombra ou esconder hierarquia em divs semânticas.

## Proveniência, status, owner e migração

Derivado dos cards duplicados dos consumidores. Status beta; owners Product Design + Frontend; onda 2 de outubro.
