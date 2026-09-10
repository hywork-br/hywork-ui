# Upload controlado

## Propósito

Exibição de seleção, progresso, cancelamento e retry; transporte permanece no consumidor.

## Quando usar e quando evitar

Use na composição de fluxos que precisem deste contrato. Evite inventar capacidades remotas ou regras de domínio no componente.

## Anatomia e slots

Exports: `FileUpload`. Conteúdo e ações são nomeados pelo consumidor; wrappers preservam a semântica nativa.

## API e defaults

label, items, onFilesChange, onCancel, onRetry, disabled, multiple, accept; cada item tem id, name, progress, status e erro opcional. A fonte completa é `src/index.ts` e as declarações TypeScript do pacote; esta spec não amplia a API.

## Variantes e estados

Exercite vazio, preenchido, desabilitado e recuperação quando aplicáveis. Estado controlado deve refletir a fonte de dados do consumidor.

## Tokens consumidos

Cada arquivo usa `Progress` do próprio pacote, com nome acessível e valor limitado a 0–100, em vez do progresso visual nativo do navegador. Nomes sem espaços quebram dentro da largura disponível. Estado textual permanece visível além da cor; o consumidor continua responsável pela operação.

Papéis `--hw-surface`/`--hw-surface-fg`, `--hw-muted`/`--hw-muted-fg`, `--hw-focus` e tokens de tamanho da superfície; veja `tokens/componentes.css`. Sem cores arbitrárias.

## Admin, portal e mobile

Montserrat preservada. Admin: alvo mínimo de 32px. Portal e mobile: 44px. Inputs estreitos: texto mínimo de 16px. Tabela pode rolar no contêiner, nunca alargar a página.

## Teclado, foco e acessibilidade

Controles nomeados usam teclado nativo; foco laranja permanece visível. Busca navegável usa setas, Enter e Escape, quando aplicável. Estados trazem texto além da cor; movimento reduzido não impede operação.

A seleção usa `Button outline` nomeado com a ação e o rótulo do campo. Enter ou Espaço abrem o seletor nativo por um input oculto, sem duplicar o alvo de Tab. `disabled` bloqueia ambos. O input mantém accept/multiple e limpa seu valor após seleção, permitindo escolher novamente o mesmo arquivo. Essa ação não inicia transporte: `onFilesChange` continua sendo a fronteira controlada pelo consumidor.

Após seleção ou cancelamento, o foco retorna ao botão quando ficou perdido no documento ou no contêiner. Se o consumidor desabilitar temporariamente o campo durante leitura, o retorno aguarda sua reabilitação. Não desloca foco que já esteja em outro controle. A story `LocalSelectionFocus` exercita leitura local e continuidade por Tab, sem transporte remoto.

## Composição e erros comuns

Consumidor possui dados, permissões, rede, persistência e regras de negócio. Não interprete ausência como zero nem retry visual como envio confirmado. Fixtures do laboratório não comprovam adoção.

## Proveniência, status, owner e migração

Draft em 2026-09-05. Owners: Hywork Product Design e Hywork Frontend. Justificativa estrutural: Exibição de seleção, progresso, cancelamento e retry; transporte permanece no consumidor. Zero consumidores comprovados; promoção depende dos pilotos de outubro. Contrato executável: `stories/SelectionControls.stories.tsx#Interactive`.
