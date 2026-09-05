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

O acabamento usa uma barra aberta, não um formulário dentro de um cartão.
Busca tem superfície suave; filtros rápidos usam texto/chevron e opções em
popover. Foco, invalid e semântica permanecem explícitos. Remover um chip tem
alvo próprio de 32px no desktop e 44px no admin estreito ou de toque. “Mais
filtros” e ações repetidas da coleção usam Button quiet nos pilotos.

No mobile estreito, os filtros rápidos compartilham duas colunas e a ação de filtros avançados
ocupa uma linha própria. A comparação de referência mantém o mesmo conteúdo e muda somente
essa disposição. Em dispositivo de ponteiro grosseiro, os tokens admin aumentam os controles
para 44px; desktop preserva densidade. Os campos desta tabela são exemplos de pilotos, não
uma promessa de capacidade da API dos produtos.

O consumidor serializa busca e filtros na URL. Os pilotos do Storybook usam
query params por feature e demonstram que abrir/fechar `FocusMode` não desmonta
a lista, não perde filtros e não move o scroll do contexto pai.

Os pilotos de prioridade salvam fixtures em `sessionStorage`, com namespace e validação próprios;
não usam backend. Erro mantém o formulário para retry; saída suja confirma descarte. Se um item
editado deixa de corresponder ao filtro, ele não é forçado na coleção: a mensagem explica o
resultado e o foco retorna à busca. A edição demonstrada é de metadados, não o editor completo
de cursos, distribuição de telas ou implantação de assinaturas dos produtos.

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
