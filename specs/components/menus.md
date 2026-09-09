# DropdownMenu e Popover

## Propósito

Dropdown organiza ações; Popover mostra controles ou conteúdo contextual sem trocar de página.

## Quando usar e quando evitar

Use Dropdown para comandos e Popover para pequenos filtros/edições. Evite esconder a ação principal ou fluxos longos.

## Anatomia e slots

Root, Trigger, portal, Content e itens/label/separator ou Close.

## API e defaults

Composição Radix; conteúdos usam `sideOffset` padrão de 8 e aceitam props nativas do primitive.

## Variantes e estados

Fechado, aberto, foco, item disabled, item danger e conteúdo responsivo.

## Tokens consumidos

Floating surface, texto, hover, danger, border, shadow, radius, spacing e z-index.

## Admin, portal e mobile

Mesma API; densidade segue superfície. Em mobile, conteúdo respeita viewport e alvos mínimos.

## Teclado, foco e acessibilidade

Arrow keys e Escape seguem Radix; Trigger mantém nome acessível e foco retorna ao fechar.

## Composição e erros comuns

Separar grupos sem exagero. Não misturar navegação e comando sem rótulos ou usar item danger como destaque visual.

## Proveniência, status, owner e migração

Derivado de dropdown/popover duplicados. Status beta; owners Product Design + Frontend; onda 3 de outubro.
