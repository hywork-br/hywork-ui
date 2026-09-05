# Seleção pesquisável

## Propósito

Busca e escolha acessível de opções locais, preservando o domínio e seleção controlada.

## Quando usar e quando evitar

Use na composição de fluxos que precisem deste contrato. Evite inventar capacidades remotas ou regras de domínio no componente.

## Anatomia e slots

Exports: `Combobox`, `MultiSelect`. Conteúdo e ações são nomeados pelo consumidor; wrappers preservam a semântica nativa.

## API e defaults

`options`, `value`, `onValueChange` e `aria-label` são obrigatórios; `disabled`,
`placeholder`, `className` e `id` são opcionais. Combobox recebe uma string;
MultiSelect recebe string[]. Opções têm value/label e description/disabled
opcionais. Não há prop `invalid`, busca remota ou carregamento embutido.

## Variantes e estados

A busca filtra labels locais sem diferenciar maiúsculas. Lista vazia tem mensagem;
itens disabled permanecem identificados e não podem ser escolhidos. A seleção
única fecha a lista; a múltipla alterna itens e expõe remoção individual.

## Tokens consumidos

Papéis `--hw-surface`/`--hw-surface-fg`, `--hw-muted`/`--hw-muted-fg`, `--hw-focus` e tokens de tamanho da superfície; veja `tokens/componentes.css`. Sem cores arbitrárias.

## Admin, portal e mobile

Montserrat preservada. Admin: alvo mínimo de 32px. Portal e mobile: 44px. Inputs estreitos: texto mínimo de 16px. Tabela pode rolar no contêiner, nunca alargar a página.

## Teclado, foco e acessibilidade

O input expõe combobox/listbox e opção ativa por aria-activedescendant. Setas
navegam somente opções habilitadas; Enter escolhe; Escape fecha e mantém foco no
input. Sair do componente fecha a lista. Não substituir o nome acessível por placeholder.

## Composição e erros comuns

Consumidor possui dados, permissões, rede, persistência e regras de negócio. Não interprete ausência como zero nem retry visual como envio confirmado. Fixtures do laboratório não comprovam adoção.

## Proveniência, status, owner e migração

Draft em 2026-09-05. Owners: Hywork Product Design e Hywork Frontend. Justificativa estrutural: Busca e escolha acessível de opções locais, preservando o domínio e seleção controlada. Zero consumidores comprovados; promoção depende dos pilotos de outubro. Contrato executável: `stories/SelectionControls.stories.tsx#Interactive`.
