# Escolha

## Propósito

Inputs nativos para escolhas booleanas, exclusivas e alternância; estado controlado pelo consumidor.

## Quando usar e quando evitar

Use na composição de fluxos que precisem deste contrato. Evite inventar capacidades remotas ou regras de domínio no componente.

## Anatomia e slots

Exports: `Checkbox`, `Radio`, `Switch`. Conteúdo e ações são nomeados pelo consumidor; wrappers preservam a semântica nativa.

## API e defaults

checked, onChange, disabled, invalid; Checkbox também indeterminate; Radio usa name e value. A fonte completa é `src/index.ts` e as declarações TypeScript do pacote; esta spec não amplia a API.

## Variantes e estados

Exercite vazio, preenchido, desabilitado e recuperação quando aplicáveis. Estado controlado deve refletir a fonte de dados do consumidor.

## Tokens consumidos

Papéis `--hw-surface`/`--hw-surface-fg`, `--hw-muted`/`--hw-muted-fg`, `--hw-focus` e tokens de tamanho da superfície; veja `tokens/componentes.css`. Sem cores arbitrárias.

## Admin, portal e mobile

Montserrat preservada. Admin: alvo mínimo de 32px. Portal e mobile: 44px. Inputs estreitos: texto mínimo de 16px. Tabela pode rolar no contêiner, nunca alargar a página.

## Teclado, foco e acessibilidade

Controles nomeados usam teclado nativo; foco laranja permanece visível. Busca navegável usa setas, Enter e Escape, quando aplicável. Estados trazem texto além da cor; movimento reduzido não impede operação.

## Composição e erros comuns

Consumidor possui dados, permissões, rede, persistência e regras de negócio. Não interprete ausência como zero nem retry visual como envio confirmado. Fixtures do laboratório não comprovam adoção.

## Proveniência, status, owner e migração

Draft em 2026-09-05. Owners: Hywork Product Design e Hywork Frontend. Justificativa estrutural: Inputs nativos para escolhas booleanas, exclusivas e alternância; estado controlado pelo consumidor. Zero consumidores comprovados; promoção depende dos pilotos de outubro. Contrato executável: `stories/SelectionControls.stories.tsx#Interactive`.
