# Contratos dos padrões de produto

## ListPage

O pacote é dono de:

- título, descrição e ação principal;
- slot de busca e filtros;
- contagem com atualização anunciada;
- loading, vazio, sem resultado e erro com retry;
- layout de lista ou grade.

O consumidor é dono de `items`, chave, célula/card, permissões e ações do
domínio por `renderItem`.

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

## Stepper

Etapa futura é desabilitada. Etapa concluída pode ser reaberta via
`onStepChange`. O texto dos CTAs continua no fluxo: o Stepper não inventa
“Avançar” nem executa submit.
