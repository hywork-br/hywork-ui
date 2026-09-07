# Select

## Propósito

Escolher um valor em uma lista curta e conhecida com comportamento consistente de teclado.

## Quando usar e quando evitar

Use para escolha única. Evite para busca em milhares de opções, múltipla seleção ou alternativas binárias.

## Anatomia e slots

Root, Trigger, Value, Icon, portal, Content, Viewport, Item e indicador.

## API e defaults

`ariaLabel` e `options` obrigatórios; aceita value controlado, placeholder,
`name`, `disabled`, `required` e `onValueChange`. `id`, `aria-describedby` e
`aria-invalid` são encaminhados ao trigger focável. A ref pública aponta para
esse `HTMLButtonElement`.

## Variantes e estados

Placeholder, valor selecionado, aberto, focus, disabled e opção disabled.

Em formulário, compartilha o preenchimento neutro e limite inferior do Input.
Dentro de FilterBar, o trigger é contextual: texto e chevron sem caixa em
repouso; hover/aberto usam superfície neutra. O portal não herda esse tratamento
de toolbar. O chevron mantém seu tamanho mesmo quando o valor precisa truncar.
`aria-invalid="true"` troca a linha inferior pelo mesmo papel semântico do
FieldError e conserva essa linha durante foco. O anel continua sendo o canal de
foco; o erro não depende somente dele nem é apagado pelo contexto de filtro.

## Tokens consumidos

Input surface/border, texto, placeholder, hover, focus, floating surface, shadow e z-index.

## Admin, portal e mobile

Altura segue superfície; menu respeita viewport e Trigger ocupa a largura do contexto quando necessário.

## Teclado, foco e acessibilidade

Combobox nomeado, setas navegam opções, Enter seleciona e Escape fecha com retorno de foco.
Em formulários, `name` serializa o valor pelo controle nativo mantido pelo
Radix e `required` preserva sua validação nativa. Label visível usa `htmlFor`
com o `id` do trigger; ajuda e erro usam os IDs literais de
`aria-describedby`, e o estado inválido chega ao mesmo trigger por
`aria-invalid`.

O item focado pelas setas recebe o anel `--hw-focus`, além do fundo de destaque.
O anel usa offset interno para permanecer inteiro dentro do viewport rolável do popup.

## Composição e erros comuns

Label visível vem de Field quando o contexto exige. Não usar placeholder como nome acessível.

## Proveniência, status, owner e migração

Derivado dos selects divergentes de Platform e Builder. Status beta; owners Product Design + Frontend; onda 4 de outubro.
