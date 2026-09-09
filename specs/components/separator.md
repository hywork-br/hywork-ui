# Separator

## Propósito

`Separator` cria uma divisão visual ou semântica entre grupos de conteúdo sem transformar cada borda de card em regra local.

## Quando usar e quando evitar

Use entre seções relacionadas, toolbars e colunas. Evite usar para decorar cada campo, substituir espaçamento ou esconder uma hierarquia que precisa de heading.

## Anatomia e slots

O componente é um único `div` sem conteúdo. A orientação é horizontal ou vertical; o consumidor controla o espaço ao redor.

## API e defaults

- `orientation`: `"horizontal"` por padrão; também aceita `"vertical"`.
- `decorative`: `true` por padrão; quando `false`, expõe `role="separator"`.
- Aceita atributos HTML e `ref` de `HTMLDivElement`.

## Variantes e estados

O estado visual vem de `data-orientation`. Não há estado de interação, loading ou disabled.

## Tokens consumidos

`--hw-border`, `--hw-target-min` e as regras `hw-separator` em `tokens/componentes.css`.

## Admin, portal e mobile

O separador é neutro entre superfícies. Em mobile, mantenha a orientação horizontal quando a composição empilha; use vertical somente quando houver largura suficiente para duas regiões lado a lado.

## Teclado, foco e acessibilidade

Separadores decorativos não entram na árvore semântica. Separadores semânticos expõem `role="separator"` e `aria-orientation`; não recebem foco.

## Composição e erros comuns

Não passe texto ou ações dentro do componente. Não use `decorative={false}` sem uma relação estrutural que beneficie tecnologias assistivas.

## Proveniência, status, owner e migração

Extraído do uso recorrente de `separator` no Plataform e no Lab. Status `draft`; owner: Hywork Product Design + Hywork Frontend. A migração de consumidores segue o gate de outubro.
