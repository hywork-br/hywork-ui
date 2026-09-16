# Escolha

## Propósito

Inputs nativos para escolhas booleanas, exclusivas e alternância; estado controlado pelo consumidor.

## Quando usar e quando evitar

Use na composição de fluxos que precisem deste contrato. Evite inventar capacidades remotas ou regras de domínio no componente.

## Anatomia e slots

Exports: `Checkbox`, `Radio`, `Switch`. Conteúdo e ações são nomeados pelo consumidor; wrappers preservam a semântica nativa.

## API e defaults

`checked`, `onChange`, `disabled` e atributos nativos como `aria-invalid`;
Checkbox também recebe `indeterminate` (default false); Radio usa `name` e
`value`. Não há prop `invalid`. A fonte completa é `src/index.ts` e as
declarações TypeScript do pacote; esta spec não amplia a API.

## Variantes e estados

Exercite vazio, marcado, parcial (`indeterminate`), inválido (`aria-invalid`), desabilitado e recuperação quando aplicáveis; a matriz executável é `ChoiceStateMatrix` em `stories/SelectionControls.stories.tsx`. A marca do checkbox e o ponto do radio são geometria recortada sobre `--hw-primary-fg`, não imagem com cor própria. Estado controlado deve refletir a fonte de dados do consumidor.

## Tokens consumidos

Papéis `--hw-surface`/`--hw-surface-fg`, `--hw-input-border` (limite do controle), `--hw-primary`/`--hw-primary-fg` (marcado), `--hw-danger-strong` (`aria-invalid`), `--hw-focus` e tokens de tamanho da superfície; veja `tokens/selection.css`. Sem cores arbitrárias e sem `accent-color`: o controle é desenhado pelo DS.

## Admin, portal e mobile

Montserrat preservada. Admin: alvo mínimo de 32px. Portal e mobile: 44px. Inputs estreitos: texto mínimo de 16px. Tabela pode rolar no contêiner, nunca alargar a página.

Checkbox, radio e switch são desenhados pelo DS com `appearance: none`. Com aparência nativa, o limite do controle era decisão do navegador e ninguém media: no pixel, Chromium pintava 4,13:1 sobre a superfície sutil e Firefox 2,90:1, abaixo do piso de 3:1 da WCAG 1.4.11. Agora o limite é `--hw-input-border`, medido pelo gate de token contra `--hw-surface` e `--hw-surface-subtle`, e conferido no navegador por computed style.

O alvo do PRÓPRIO controle vai a 24×24 por pseudo-elemento, sem mexer nos 16px de desenho — a mesma técnica do switch —, e é verificado por `elementsFromPoint` nos dois navegadores. Ele fica em 24 e não em 44 de propósito: medido em 16/09/2026, o rótulo vizinho começa a 16px do centro da caixa, então um alvo de 44px roubaria 6px do clique do controle anterior. O alvo CONFORTÁVEL de 32px no admin e 44px no portal, mobile ou ponteiro grosso continua sendo o rótulo clicável, que ocupa a linha inteira. Os números são medidos em `tests/browser/interactions.spec.ts`, em 390 e 1440. Envolver a caixa num rótulo clicável continua sendo obrigação do consumidor: sem ele, sobra a caixa de 16px com alvo de 24px.

## Teclado, foco e acessibilidade

Controles nomeados usam teclado nativo; foco laranja permanece visível. Busca navegável usa setas, Enter e Escape, quando aplicável. Estados trazem texto além da cor; movimento reduzido não impede operação.

## Composição e erros comuns

Consumidor possui dados, permissões, rede, persistência e regras de negócio. Não interprete ausência como zero nem retry visual como envio confirmado. Fixtures do laboratório não comprovam adoção.

## Proveniência, status, owner e migração

Draft em 2026-09-05. Owners: Hywork Product Design e Hywork Frontend. Justificativa estrutural: Inputs nativos para escolhas booleanas, exclusivas e alternância; estado controlado pelo consumidor. Zero consumidores comprovados; promoção depende dos pilotos de outubro. Contrato executável: `stories/SelectionControls.stories.tsx#Interactive`.
