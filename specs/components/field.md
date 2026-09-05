# Input, Field e Label

## Propósito

Capturar dados com label, ajuda e erro associados ao mesmo controle.

## Quando usar e quando evitar

Use `Field` para entrada textual curta. Evite placeholder como substituto do label ou erro distante do campo.

## Anatomia e slots

Field agrupa Label, Input, FieldHint e FieldError; IDs ligam conteúdo auxiliar ao controle.

## API e defaults

Input herda a API nativa e adiciona `invalid=false`; os demais slots preservam seus elementos HTML.

## Variantes e estados

Default, placeholder, hover, focus, disabled, read-only, invalid e preenchido.

O campo usa preenchimento neutro e uma linha inferior identificável (3:1 sobre
o próprio preenchimento), sem perímetro azul em repouso. Foco mantém anel
laranja de 2px com offset; invalid conserva a linha de erro inclusive no foco
e dentro da busca contextual. A regra de busca só remove o limite de repouso,
nunca erro ou foco. Label e mensagem continuam obrigatórios quando aplicáveis.
Read-only usa linha tracejada; disabled preserva semântica nativa e reduz opacidade.

## Tokens consumidos

Papéis de superfície, texto, placeholder, input border, danger, foco, altura, raio e espaçamento.

## Admin, portal e mobile

Admin é mais denso; portal e mobile mantêm texto de 16px e alvo de toque confortável.

Até 640px, admin adota controles de 44px e entrada textual de 16px. O desktop
mantém 36px. A aparência discreta não reduz o alvo interativo.

## Teclado, foco e acessibilidade

Label usa `htmlFor`; ajuda/erro usam `aria-describedby`; invalid expõe `aria-invalid` e o erro usa `role="alert"`.

## Composição e erros comuns

Preserve a ordem label → controle → ajuda/erro. Não codifique validação de domínio no componente.

## Proveniência, status, owner e migração

Reconcilia inputs/form fields de Platform e Builder. Status beta; owners Product Design + Frontend; onda 1 de outubro.
