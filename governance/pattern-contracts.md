# Contratos dos padrões de produto

## ListPage

O pacote é dono de:

- título, descrição e ação principal;
- slot de busca e filtros;
- contagem com atualização anunciada;
- loading, vazio, sem resultado e erro com retry;
- layout de lista ou grade.

O consumidor é dono de `items`, chave, célula/card, permissões e ações do
domínio por `renderItem`. Tabelas usam `renderCollection`, preservando a contagem
e os estados da casca sem transformar linhas em cards.

## Filtros por feature

A gramática é compartilhada; a taxonomia não:

| Feature | Sempre visível | “Mais filtros” |
|---|---|---|
| Academy | busca, status, tipo | trilha, responsável, período |
| Conteúdos | busca, status, tipo | autor, período |
| TV corporativa | busca, status, unidade | tela, período |
| Assinaturas | busca, status, público | template, unidade |
| Campanhas | busca, status, canal | público, período, responsável |

O `FilterBar` não conhece esses campos. Ele organiza controles passados pela
feature e oferece chips/limpeza com comportamento previsível.

O consumidor serializa busca e filtros na URL. Os pilotos do Storybook usam
query params por feature e demonstram que abrir/fechar `FocusMode` não desmonta
a lista, não perde filtros e não move o scroll do contexto pai.

## DataTable

A tabela é semântica, responsiva por scroll e usa ação nomeada para ordenação.
Colunas, células, paginação remota, seleção e regras de permissão ficam no
consumidor.

## FocusMode

- usa diálogo modal fullscreen para conter e devolver foco;
- saída sempre nomeada (`Sair de {fluxo}`);
- Escape chama `onExit`;
- o consumidor preserva rota-pai, filtros, scroll e rascunho;
- confirmação de descarte é responsabilidade do fluxo, não do shell.

O opener é capturado em `onOpenAutoFocus`, antes do autofocus do modal. X,
Escape, dismiss e fechamento controlado devolvem o foco ao opener conectado.
`returnFocusRef?: React.RefObject<HTMLElement | null>` permite indicar um
destino preferido (por exemplo, a busca após salvar e remover a linha filtrada).
Se esse destino não aceita foco, tenta o opener. O destino deve ser focável,
como um input ou heading com `tabIndex={-1}`; `body` nunca é um fallback válido.
Se o opener desaparecer, o consumidor precisa fornecer um destino persistente.

`exitDisabled?: boolean` bloqueia X, Escape e dismiss durante o salvamento.
O consumidor ainda pode encerrar pela prop `open`, após concluir a operação.
Formulário sujo e confirmação de descarte continuam no fluxo. A descrição
opcional só é associada quando existe; o foco continua contido pelo Radix.

O cabeçalho ocupa apenas sua altura natural e o corpo usa o espaço restante
com scroll próprio. Portais usam a família tipográfica do design system.
Indicadores de loading de ListPage e Skeleton ficam estáticos com movimento
reduzido, preservando sua identificação acessível.

## Stepper

Etapa futura é desabilitada. Etapa concluída pode ser reaberta via
`onStepChange`. O texto dos CTAs continua no fluxo: o Stepper não inventa
“Avançar” nem executa submit.

## Status antes da migração

Os seis padrões permanecem `draft` em setembro. Testes, stories e revisão visual
provam o contrato no pacote; promoção a `beta` exige os pilotos reais de outubro.
