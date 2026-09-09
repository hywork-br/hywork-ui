# Auditoria inicial — produto consumidor × `@hywork/ui`

Data: 09/09/2026. Baseline do produto: `hywork-plataform` em `f176ed3c1730b2f24553c92534805edfb7605894`. Baseline do UI: `hywork-ui` em `215346aaa5acaf8ccc71115f1c6c79c6e15abcdf`.

Este é um diagnóstico inicial da Fase 2, não uma declaração de adoção. O produto foi lido como referência; nenhuma alteração foi feita nele.

## Evidências

| Medição | Resultado | Leitura |
| --- | ---: | --- |
| Arquivos `src/components/ui/*.tsx` no produto | 76 | Incluem primitivos, layouts, widgets e componentes de domínio; não são 76 famílias que devam entrar no DS |
| Famílias registradas no `component-contracts.json` | 25 | 12 beta + 13 draft; exports internos não foram contados como famílias |
| Componentes locais `src/lab/hw/*.tsx` no Experiments | 9 | São uma camada de composição/padrões do sandbox e precisam de auditoria de dependência, não de cópia automática para a biblioteca |
| Tokens `--hw-*` no contrato do UI | registrados em camadas primitivas/semânticas/superfície | A presença de tokens não prova que consumidores reais estejam usando-os |
| Artefato do UI no Experiments | `0.6.0`, source `215346a…`, digest `d09ad844…` | Proveniência agora passa no gate com 62 arquivos; consumo local continua separado de adoção em produto |

## Decisões de classificação

### Reutilizar/refinar primeiro

- Button, Field/Input, Label, Textarea, Badge, Avatar, Card, Dialog, menus, Tooltip, Select e Tabs: são fundamentos já registrados; o trabalho é provar comportamento, visual e uso nas jornadas.
- Shell, ListPage, FilterBar, DataTable e FocusMode: são padrões draft prioritários para Conteúdos, Academy, Documentos, TV e Assinaturas; devem manter filtros, colunas e ações do domínio no consumidor.
- Choice, searchable selection, date, upload, table cells, collection controls e feedback: validar contra os fluxos de Academy, documentos, integrações e administração antes de promoção.

### Auditar como possível domínio, não promover automaticamente

- `hystore-card`, `recognition-icon`, `organizational-structure-selector`, `eduvem-header-button`, editor rich text, image uploader e widgets de analytics: verificar se existe semântica reutilizável além do produto de origem.
- `admin-panel-layout`, `content-layout`, `page-layout`, sidebars e switchers: comparar com `AdminShell`, shell de portal e contratos de tema para eliminar anatomias paralelas sem quebrar contextos.
- `carousel`, `floating-dock`, `3d-card`, efeitos de texto, tour e widgets de marketing: só entram se houver uma jornada atual que exija o comportamento e um contrato acessível; não são prioridade de cobertura operacional.

### Permanecer composição no consumidor

- Regras de autorização, query/filtros efetivos, persistência, APIs, seleção entre páginas, dados de integração e taxonomias de Academy/Conteúdos.
- Editor completo de cursos, campanhas, builder, documentos e assinaturas. O DS fornece peças e padrões de fluxo; não absorve a regra de negócio.
- “HyStore” como marketplace de apps. Pontos, estoque e resgate de recompensas permanecem fora desse domínio e só serão inventariados se a disponibilidade atual for comprovada.

## Lacunas de contrato para fechar

1. Evidenciar superfície e comportamento de `AdminShell`/portal em todos os breakpoints, incluindo menu móvel, skip link e retorno de foco.
2. Formalizar FilterBar + ListPage + DataTable com busca, filtros específicos, URL/query, chips, limpar, contagem, loading, vazio, sem resultado, erro/retry, ações em lote e overflow de tabela.
3. Completar contratos de formulário: validação, campo somente leitura, dirty state, salvar/descartar, erro de rede, retry e retorno ao contexto.
4. Provar escolhas pesquisáveis, datas, upload e células semânticas com dados longos, ausentes e inválidos.
5. Definir feedback e status por texto/ícone/estrutura, sem depender apenas de cor; revisar contraste e estados de foco.
6. Definir tokens de superfície e tema para admin/portal e white-label, sem misturar `--hw-*` com variáveis legadas do consumidor.
7. Registrar gráficos e calendários como lacunas condicionais de domínio; não criar abstração genérica antes dos fluxos Analytics/agenda serem validados.
8. Registrar o comportamento de movimento e reduced motion no nascimento da animação; evitar testes que dependam de polling tardio.

## Próxima ordem de trabalho

1. Usar o registro `governance/product-coverage.json` para ligar essas lacunas aos 98 cenários candidatos e marcar quais são realmente atuais.
2. Construir os quatro pilotos de Fase 3 no Experiments com o artefato versionado.
3. Promover para beta apenas o que tiver contrato, story, teste de comportamento/teclado, screenshot e owner — não por quantidade de exports.
4. Repetir a auditoria contra os imports reais após cada onda; qualquer `Hw*` local restante deve ter justificativa explícita.

## Limite desta evidência

O levantamento de arquivos mede superfície de código, não uso em produção. Não foram inferidas permissões, tenants, APIs ou disponibilidade de features ausentes da árvore. O relatório final precisa cruzar esta auditoria com a disponibilidade do produto e com jornadas testadas no Experiments.

## Referências de pesquisa desta rodada

- Mobbin: [Shopify — gerenciamento de páginas](https://mobbin.com/screens/c913d209-7c60-4c78-9e7c-3c991de3f04d), usado como referência de hierarquia compacta, busca e filtros em uma coleção web administrativa.
- 21st.dev: [Origin UI Table](https://21st.dev/@originui/components/table) e [Table with Filters](https://21st.dev/@felipemenezes098/components/table-12), registrados como candidatos de estudo; nenhum código foi recuperado ou incorporado.
- Appllama: busca semântica de aprendizagem mobile em 09/09/2026. Resultados de referência: `ELSA Speak` / `Progress Activity` (`oth_i4o4u`), `Mimo` / `Practice Tab` (`oth_6yea0`) e `Imprint` / `Visual Courses Intro` (`onb_5m021`). Foram usados apenas para observar prioridade de progresso, próxima ação e descoberta; não são especificação de implementação Hywork.
