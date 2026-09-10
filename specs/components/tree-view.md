# TreeView

## Propósito

Navegar e selecionar um item em uma hierarquia. Pastas de documentos, camadas do Builder e nós organizacionais compartilham teclado e foco, não entidades, permissões ou ações de negócio.

## Quando usar e quando evitar

Use em hierarquias pequenas e carregadas no cliente. Evite para navegação global simples, edição de linhas, seleção múltipla ou listas virtualizadas: esses contratos não estão incluídos. Não coloque formulários ou botões de negócio em `label`.

## Anatomia e slots

`TreeView` recebe `TreeNode[]`: id único, label textual, description opcional, icon decorativo, disabled e children. Renderiza árvore/listas aninhadas semanticamente; cada item tem nome próprio e descrição separada, sem incorporar nomes dos descendentes.

## API e defaults

Estado controlado: `expandedIds`/`onExpandedChange`, `selectedId`/`onSelectionChange`. `ariaLabel` obrigatório. `readOnly=false` por padrão; somente leitura permite navegar/expandir sem alterar seleção. IDs vazios ou duplicados falham explicitamente. O consumidor mantém identidade estável, carrega dados e mostra loading, erro/retry e empty ao redor da árvore.

## Variantes e estados

Aberto/fechado, selecionado/não selecionado, disabled com motivo em description, read-only e vazio. Foco é separado da seleção. Dados removidos ou ramo recolhido recuperam o foco no ancestral visível ou primeiro item, somente se a árvore estava com foco. Não há animação de altura nem dependência de motion.

## Tokens consumidos

Texto, superfícies, primary-soft/bg-fg, foco, espaçamento, control-height, target-min e control-radius existentes. Nenhum novo valor de cor. A primária só marca a seleção local; o fundo da árvore é herdado.

## Admin, portal e mobile

Herda densidade via data-surface e alvos touch da camada admin. Textos longos quebram; hierarquias profundas devem usar navegação por pasta/voltar em espaço estreito, não uma árvore infinitamente indentada.

## Teclado, foco e acessibilidade

Uma parada Tab. Setas cima/baixo percorrem itens visíveis; direita abre ramo ou entra no primeiro filho; esquerda recolhe ou sobe ao pai; Home/End extremos; letras buscam prefixos sem acentos. Enter/Espaço selecionam, exceto disabled/read-only. Botão de expansão tem alvo próprio e não seleciona. Itens disabled continuam navegáveis para leitura do motivo. Role tree/treeitem/group, expanded apenas nos ramos e selected independente de foco.

## Composição e erros comuns

Não chamar o callback de expansão como seleção; não salvar dados, importar catálogos nem acionar APIs dentro do componente. Drag/drop e reordenação continuam na feature com alternativas de teclado. Árvore não substitui autorização real.

## Proveniência, status, owner e migração

Draft, Hywork Product Design + Hywork Frontend. Necessidade encontrada no censo de jornadas de 2026-09-10 (documentos, estrutura, Builder). Referência de interação inspecionada: 21st.dev ddoemonn/tree-view; implementação própria com tokens e sem copiar marcação/estilos. Consumo nesta onda restrito a hywork-experiments/Storybook, nenhuma migração do Plataform.
