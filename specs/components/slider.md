# Slider

`Slider` é um controle de faixa nativo para valores contínuos. `value` e `defaultValue` são arrays para preservar compatibilidade com uma ou várias alças; cada alça recebe um nome derivado de `aria-label`. Valores são ordenados, arredondados pelo `step` e limitados entre `min` e `max`.

Use para ajustes visuais ou numéricos que o usuário possa explorar continuamente, como posição, escala e opacidade. Para uma escolha discreta com rótulos, prefira `Select` ou `Radio`. O componente não salva configuração nem dispara efeitos remotos.

`onValueChange` acompanha a interação e `onValueCommit` sinaliza o fim por teclado ou ponteiro. O consumidor deve expor uma unidade ou valor textual quando o número não for autoexplicativo. O foco usa o mesmo anel dos demais controles e a alça mantém alvo confortável em touch.

## Propósito

Permitir ajustes graduais com resposta imediata e limites claros.

## Quando usar e quando evitar

Use para escala, posição, volume ou opacidade. Evite quando o conjunto de opções for pequeno ou precisar de rótulos precisos.

## Anatomia e slots

Uma faixa nativa com uma ou mais alças, cada uma com nome acessível derivado do `aria-label`.

## API e defaults

`min=0`, `max=100`, `step=1` e `defaultValue` vazio; `value` torna o componente controlado.

## Variantes e estados

Suporta uma ou duas alças, estado desabilitado e valores ordenados e normalizados.

## Tokens consumidos

Usa tokens de ação, superfície, borda e foco; nenhuma cor de domínio é embutida no componente.

## Admin, portal e mobile

Compartilha a mesma faixa nas duas superfícies e mantém alça com alvo mínimo confortável em touch.

## Teclado, foco e acessibilidade

Cada alça é um `input[type=range]` com `aria-valuemin`, `aria-valuemax`, `aria-valuenow` e foco visível.

## Composição e erros comuns

Mostre valor e unidade fora do controle; não use para substituir `Select` ou `Radio` quando as opções forem discretas.

## Proveniência, status, owner e migração

Contrato draft, owner Hywork Product Design + Hywork Frontend; adoção prevista para a wave 3 após validação nos consumidores.
