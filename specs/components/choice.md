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

Exercite vazio, preenchido, desabilitado e recuperação quando aplicáveis. Estado controlado deve refletir a fonte de dados do consumidor.

## Tokens consumidos

Papéis `--hw-surface`/`--hw-surface-fg`, `--hw-muted`/`--hw-muted-fg`, `--hw-focus` e tokens de tamanho da superfície; veja `tokens/componentes.css`. Sem cores arbitrárias.

## Admin, portal e mobile

Montserrat preservada. Admin: alvo mínimo de 32px. Portal e mobile: 44px. Inputs estreitos: texto mínimo de 16px. Tabela pode rolar no contêiner, nunca alargar a página.

O alvo de toque da caixa é o RÓTULO clicável, que ocupa a linha inteira e carrega o mínimo da superfície; a caixa nativa fica com os 16px que ela desenha. Checkbox e radio com aparência nativa ignoram borda, padding e pseudo-elemento — medido em Chromium e Firefox em 15/09/2026 —, então ampliar o alvo do próprio controle exigiria `appearance: none` e desenho à mão, perdendo `accent-color`. O que sustenta a WCAG 2.5.8 ali é a exceção de espaçamento: a margem de 8px mantém 32px entre centros, contra os 24px do círculo da regra. O switch, que já é `appearance: none`, leva o alvo a 24px por pseudo-elemento. Os três números são medidos em `tests/browser/interactions.spec.ts`, em 390 e 1440. Envolver a caixa num rótulo clicável é obrigação do consumidor: sem ele, sobra só a caixa de 16px.

## Teclado, foco e acessibilidade

Controles nomeados usam teclado nativo; foco laranja permanece visível. Busca navegável usa setas, Enter e Escape, quando aplicável. Estados trazem texto além da cor; movimento reduzido não impede operação.

## Composição e erros comuns

Consumidor possui dados, permissões, rede, persistência e regras de negócio. Não interprete ausência como zero nem retry visual como envio confirmado. Fixtures do laboratório não comprovam adoção.

## Proveniência, status, owner e migração

Draft em 2026-09-05. Owners: Hywork Product Design e Hywork Frontend. Justificativa estrutural: Inputs nativos para escolhas booleanas, exclusivas e alternância; estado controlado pelo consumidor. Zero consumidores comprovados; promoção depende dos pilotos de outubro. Contrato executável: `stories/SelectionControls.stories.tsx#Interactive`.
