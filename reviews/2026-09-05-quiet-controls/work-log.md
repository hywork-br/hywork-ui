# Work-log — quiet controls

Data: 2026-09-05. Aprovação: “sim, bora”, após direção com referências públicas
do Mobbin e Linear. Base: `d22de1b`, branch `codex/interface-craft`, checkout
isolado `hywork-ui-maturity`. Esta entrega não encerra a sessão.

## Escopo executado

- Tokens e CSS compartilhados: superfícies neutras existentes, inputs com
  baseline identificável, toolbar aberta, botões quiet nos pilotos, tipografia
  e divisórias mais leves. Montserrat, ação azul e foco laranja preservados.
- Mesmo vocabulário e comportamento dos quatro pilotos; nenhuma migração ou
  alteração de API/persistência. Acrescentados dois papéis de superfície de campo;
  manifesto e preset v3 regenerados, total de tokens atualizado de 144 para 146.
- Campos admin estreitos com 44px/entrada textual de 16px; remoção de chips com
  alvos de 32px/44px. A tabela mantém scroll próprio e recebe foco explícito.
- Specs e orientação do DS atualizadas na origem, sem instalação global de skill.

## Evidência executada

Runtime: Node do pacote local do Codex em
`/Users/vitorferreira/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin`.

| Gate | Resultado |
| --- | --- |
| `npm test` antes das alterações | 20 Node + 54 Vitest passaram |
| `npm run preset` + `npm run manifest` | Artefatos regenerados |
| `npm run check` final | Exit 0; tokens, manifesto, `tsc --noEmit`, biblioteca, 20 Node + 54 Vitest passaram |
| `npm run build` final | Exit 0; biblioteca e Storybook construídos |
| Verificação AST dos imports nos três TSX editados | 0 bindings de import duplicados |
| Gate de cor literal/tokens | Passou; sem hex novo em UI, sem cor arbitrária em feature |

O build ainda emite o aviso de chunks grandes do Storybook; npm avisa sobre a
configuração local `allow-scripts`. Nenhum dos dois foi ocultado ou “corrigido”
alterando limites durante este refinamento.

Uma execução intermediária falhou porque o teste fixava os 144 tokens antigos;
o total foi atualizado para os 146 realmente gerados. Outra execução atingiu
timeout em dois testes de interação e falhou em um teste subsequente. Os nove
testes desses arquivos passaram isolados com `--maxWorkers=1`; a suíte completa
original passou depois, sem aumentar timeouts nem mudar a configuração.

## Revisão no navegador

- Desktop 1280 × 720; mobile 390 × 844. Fonte Montserrat carregada.
- TV: status Ativo retorna 1 item; remover chip restaura 3. Campo de busca e
  menu funcionando. Remoção de chip medida antes em 14 × 14px, depois em
  32 × 32px no desktop e 44 × 44px no mobile.
- Academy: campos e CTAs de 44px no mobile, entradas textuais em 16px, documento
  de 390px sem overflow. Estado disabled permanece no status do novo rascunho.
- Erro de salvamento preserva o nome digitado; retry gera um único item e devolve
  foco ao botão Novo curso. Salvar um novo nome fora da busca mantém o filtro,
  anuncia a exclusão da coleção e devolve foco à busca.
- Busca longa não alarga a página. Conteúdos: viewport da tabela de 358px e
  tabela de 777px dentro de página de 390px; o scroll pertence à tabela.
- Assinaturas: 3 cards preservados, página móvel de 390px, chevrons de 16px.
- Em 320px, o valor “Novas contratações” foi selecionado em um controle de
  140px; página permaneceu com 320px e chevron com 16px, `flex-shrink: 0`.
- Asserções de runtime aprovadas, registradas em [browser-checks.json](browser-checks.json).
  Rechecagem de docs/contratos/manifesto após o relatório: 5 testes passaram.

Uma medição de retorno foi invalidada pelo recarregamento do servidor durante
o build da biblioteca. O fluxo foi repetido após o build e o retorno correto
foi confirmado; a captura final substitui a observação invalidada.

## Revisão independente

O revisor inspecionou diff e screenshots em modo somente leitura. Encontrou:

1. P2: neutralização de borda apagava invalid no foco e na busca contextual.
2. P3: regra de não encolher o chevron mirava um span, não o SVG real.

O P2 foi reproduzido antes de corrigir: borda transparente versus mensagem de
erro `rgb(191, 69, 25)`. Após o ajuste, ambos os campos mantêm essa mesma cor
de linha durante o foco, além do anel laranja de 2px. `FieldContract.play`
exercita as duas composições no navegador, com verificação de estilo computado.
O SVG agora recebe `flex: 0 0 auto`. Rechecagem do revisor: sem pendências
nesses dois achados para o preview local.

## Limites preservados

Nenhum deploy, push, merge ou migração. Nenhum dado real de cliente usado.
Não foi feita validação em aparelho físico, navegador Safari ou com leitor
de tela nesta rodada. O `play` de CSS roda no Storybook real, não integra a
contagem dos 74 testes de Node/Vitest. Acessibilidade não foi certificada.
Gates de distribuição/Changesets e adoção de outubro continuam fora do escopo;
build verde não significa pacote liberado para produção.
