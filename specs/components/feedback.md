# Feedback

## Propósito

Avisos recuperáveis e confirmação explícita sem controlar persistência, permissão ou rede.

## Quando usar e quando evitar

Use na composição de fluxos que precisem deste contrato. Evite inventar capacidades remotas ou regras de domínio no componente.

## Anatomia e slots

Exports: `Banner`, `InlineNotice`, `Toast`. Conteúdo e ações são nomeados pelo consumidor; wrappers preservam a semântica nativa.

## API e defaults

Os três recebem `title` obrigatório e `description`, `severity`, `announcement`,
`action`, `onDismiss` e `className` opcionais. severity aceita info (default),
success, warning ou error. announcement aceita polite (default), assertive ou off.
action contém label/onClick e disabled/pending opcionais. Não há temporizador,
fila, prop duration ou persistência; o consumidor monta/desmonta o aviso.

## Variantes e estados

Cada severidade preserva ícone/texto além da cor. Uma ação pending usa o estado
loading do Button e não repete a operação. Dismiss só aparece se onDismiss existir.
Banner, aviso contextual e toast compartilham comportamento, mas têm contextos distintos.

## Tokens consumidos

Papéis `--hw-surface`/`--hw-surface-fg`, `--hw-muted`/`--hw-muted-fg`, `--hw-focus` e tokens de tamanho da superfície; veja `tokens/componentes.css`. Sem cores arbitrárias.

## Admin, portal e mobile

Montserrat preservada. Admin: alvo mínimo de 32px. Portal e mobile: 44px. Inputs estreitos: texto mínimo de 16px. Tabela pode rolar no contêiner, nunca alargar a página.

## Teclado, foco e acessibilidade

polite usa role=status; assertive usa role=alert; off não cria live region.
Severidade não implica urgência: escolha um único dono do anúncio por evento.
Ações e dispensa são botões nomeados com foco visível. Não roubar foco para um toast.

## Composição e erros comuns

Consumidor possui dados, permissões, rede, persistência e regras de negócio. Não interprete ausência como zero nem retry visual como envio confirmado. Fixtures do laboratório não comprovam adoção.

## Proveniência, status, owner e migração

Draft em 2026-09-05. Owners: Hywork Product Design e Hywork Frontend. Justificativa estrutural: Avisos recuperáveis e confirmação explícita sem controlar persistência, permissão ou rede. Zero consumidores comprovados; promoção depende dos pilotos de outubro. Contrato executável: `stories/Feedback.stories.tsx#Recovery`.
