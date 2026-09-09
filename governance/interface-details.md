# Interface details — laboratório draft

Contrato de acabamento de Conteúdos, 2026-09-05. Não representa adoção em produto,
publicação de pacote ou promoção de status; migração depende do gate de outubro.

## Exemplos executáveis

- `lab-interface-details--workspace`: coleção editorial com filtros, seleção,
  preferências contextuais e edição local de título.
- `lab-interface-details--full-journey`: edição com falha e retry, confirmação na
  mesma coleção, seleção e arquivamento da página, visão salva e retorno de foco.
- `lab-interface-details--detail-comparison`: critérios aprovados ao lado de
  contraexemplos inertes, sem ações falsas ou violações deliberadas de acesso.
- `patterns-coleções-operacionais--contents`: jornada anterior preservada,
  incluindo restauração da visão e seleção de outras páginas.

## Composição e detalhe

Conteúdos lidera a página. Busca, status e filtros preservam seu vocabulário;
colunas, densidade e visões ficam em Preferências de visualização, inicialmente
fechadas. No mobile, Status e Mais filtros compartilham a linha quando há espaço;
busca ocupa a largura disponível. Mais filtros mostra a contagem derivada de
autores/período ativos mesmo quando está fechado. Escape fecha as preferências
e devolve foco ao seu acionador. O status da
coleção distingue total, resultado filtrado, página e seleção. Selecionar revela
ações em lote; arquivar afeta somente os selecionados da página visível.

Use as células canônicas: identidade quebra linha, metadados opcionais são
reveláveis por botão nomeado, autores mantêm sua identificação, datas têm formato
local e números usam algarismos tabulares alinhados ao final. Ausência é
“Não informado”, nunca zero inventado. Rótulos e ícones complementam os estados.

Montserrat, pares semânticos de cor e foco laranja permanecem vinculantes. Alvos
usam o mínimo da superfície: 32px admin e 44px portal/admin estreito ou de toque.
Cabeçalhos ordenáveis seguem o mesmo piso. Inputs estreitos têm texto de pelo
menos 16px. Controles quiet não se deslocam no hover; tabela permanece uma tabela
HTML dentro de região horizontal nomeada, sem simular ARIA grid.

## Movimento funcional

`PilotMotionScope` é a única política do laboratório. `PilotMotionPresence`
estende seu adaptador para uma região de ações: altura até a medida natural,
opacidade e deslocamento de `--hw-space-1`. Entrada usa `--hw-duration-base`,
saída `--hw-duration-fast`, ambas com `--hw-ease-standard`. Nenhum valor de timing
ou curva alternativo foi introduzido. O wrapper de resultados mantém o espaço
entre contagem e tabela estável; não há coreografia de linhas.

Nós em saída recebem `inert` e `aria-hidden` no primeiro render da saída.
Limpar/arquivar devolve foco à busca conectada. Teclado e alteração dinâmica de
`prefers-reduced-motion` param a animação corrente e aplicam o estado final no
mesmo commit de layout; alterar apenas a duração é insuficiente. O DOM não
aguarda o próximo frame do Motion para refletir a preferência. Saída reduzida
remove o nó imediatamente. Feedback de salvamento segue a mesma política.

## Limite da fixture de edição

O editor abre por Editar na linha e atualiza o estado de `CollectionDemo`; não
mantém uma segunda coleção. A callback local retorna imediatamente por padrão,
sem rede ou espera artificial. Sucesso só aparece depois da callback resolvida;
rejeição preserva o título, nomeia o erro e permite retry. O botão de salvar
reserva largura, inclusive em loading. Uma promise controlada no teste prova o
estado pendente e impede confirmação antecipada.

Enquanto a edição está aberta, outra linha não pode substituir o rascunho e a
linha em edição não pode ser arquivada. Descartar alterações e fechar é uma ação
explícita. Durante salvamento, texto é somente leitura e fechamento desabilitado.
Ao salvar, o título retém foco; ao fechar, foco retorna à busca. O cenário de falha
é rotulado como demonstração, e nunca simula uma falha de produção.

Consumidores continuam donos de dados, permissões, rede, persistência e regras
de negócio. O laboratório não adiciona dependência de Motion ao pacote exportado.
Screenshots e amostragem de frames ficam na revisão integrada do controller;
testes DOM não substituem essa evidência visual.
