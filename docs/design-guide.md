# Guia de design do Platform

Decisão de escopo: Vitor, 17/09/2026. O produto existente não tem design system
consolidado. Ele fornece anatomia, comportamento e restrições; este pacote estabelece
consistência. Minimalismo significa menos ruído e escolhas repetidas, não menos clareza.

## Origem e seleção

Este guia recupera os fundamentos do documento interno **Guia de design —
hywork-plataform**, mantido por UX/UI em agosto de 2026, e a decisão de Montserrat de
18/08/2026. As regras foram selecionadas, não copiadas integralmente: prescrições de
outros contextos não se tornam requisito do produto por estarem num documento antigo.

O código de referência está fixado em `provenance/platform/`. Sua existência não
transforma cada valor ou exceção em decisão aprovada.

## Padrão

| Eixo | Regra |
| --- | --- |
| Tipografia | Montserrat no corpo e títulos; hierarquia por peso e escala, não por troca de família |
| Corpo de controles | 14px, com rótulo legível e sem caixa-alta ornamental |
| Altura | Controles principais de 40px; 44px em contexto de toque; 36px é variante compacta explícita, não novo default |
| Espaçamento | Base de 4px; relações próximas com 8px; grupos com 16/24px |
| Raios | Escala pequena e consistente: 4/8/12px; não transformar todos os controles em pills |
| Cor | Superfícies neutras; primária para ação/seleção; estado por papel semântico e texto/ícone |
| Ênfase | Uma ação principal por região; variantes de estado não servem de decoração |
| Campos | Borda discreta em repouso; foco e erro distintos e visíveis; não aninhar molduras sem função |
| Elevação | Sombra só para sobreposição; borda para estrutura, não para duplicar a mesma separação |
| Movimento | Não necessário para conteúdo aparecer; feedback curto e contextual |

Os valores são uma escala, não permissão para uniformizar componentes de naturezas
diferentes. Checkbox e switch têm geometria própria; o rótulo e a área clicável devem
compor um alvo confortável no fluxo que os usa.

## O que preservamos nesta entrega

Default de botão/campo em 40px, texto de controles em 14px, raios existentes,
Montserrat e tema do cliente. O preset concentra os valores em tokens sem trocar
automaticamente todos os seletores por uma estética nova.

As variantes compactas, a borda histórica do Input e matizes de status existentes
continuam explícitos. Texto sobre preenchimentos de status, texto de badges/alerts e
caption da tabela receberam correções de contraste, sem alterar a geometria.
Não se força a antiga regra de controle administrativo em
32px nem se converte sucesso/erro em cores de marca sem validar o fluxo.
O catálogo de variantes não é exemplo de quantas cores usar juntas numa tela.

## Referência visual e limite da prova

Lendo isto como: controles de operação administrativa, linguagem discreta, herdando
o produto existente e normalizando sua escala. Modo: **Operate**.
Viewport de trabalho: 1440px; reflow verificado em 390px. Evidência do contexto:
`provenance/platform/tailwind.json:201` define sidebar de 18rem e
`provenance/platform/tailwind.json:203` define header de 4rem;
`provenance/platform/components/table.tsx:12` define tabela com rolagem horizontal.
Essas larguras de teste não são uma afirmação sobre a resolução de todos os usuários.

O teste fonte × pacote protege a extração. A comparação de pixels exclui somente
as seis regiões de contraste deliberadamente corrigidas no catálogo (quatro botões,
badge de sucesso e caption); sua geometria continua comparada e suas cores passam
por auditoria separada. Todas as capturas sem máscara ficam como evidência.
Movimento reduzido, headings, scroll por teclado e Slider têm verificações próprias.
A tela integrada ainda precisa de revisão com dados e tema reais.
