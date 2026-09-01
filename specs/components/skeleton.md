# Skeleton

## Propósito

Manter a geometria da interface enquanto conteúdo conhecido está carregando.

## Quando usar e quando evitar

Use para loading inicial previsível. Evite para operações instantâneas, erro ou progresso indeterminado sem contexto.

## Anatomia e slots

Bloco visual `aria-hidden` composto dentro de uma região real com `aria-busy` e nome de loading.

## API e defaults

Herda atributos de div; tamanho e composição vêm do contexto por classes ou layout.

## Variantes e estados

Linha, avatar, bloco e composição; respeita `prefers-reduced-motion`.

## Tokens consumidos

Superfícies muted/subtle, raio e duração de motion.

## Admin, portal e mobile

Replica a geometria final da superfície e se adapta ao fluxo sem dimensões fixas globais.

## Teclado, foco e acessibilidade

Não recebe foco nem nome próprio. O container anuncia loading e troca para conteúdo sem duplicação.

## Composição e erros comuns

Use poucos blocos proporcionais ao conteúdo. Não criar uma tela inteira pulsando nem simular dados inexistentes.

## Proveniência, status, owner e migração

Reconcilia skeletons dos dois consumidores. Status beta; owners Product Design + Frontend; onda 2 de outubro.
