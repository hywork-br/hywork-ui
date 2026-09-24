# Contexto de Negócio

## Por que este repositório existe

O HyCloud tem dois frontends — `hywork-plataform` (admin) e `hw-cloud-builder`
(intranet do colaborador) — que nasceram do mesmo shadcn/ui e divergiram.

Medição de 22/09/2026 sobre a `develop` dos dois:

| Divergência | Número |
|---|---|
| Componentes homônimos que divergem entre os fronts | 28 de 28 |
| Implementações independentes de filtro | 9 |
| Implementações de card de item | 21 |
| Telas que listam dados sem o componente de tabela | 44 |
| Cores diferentes de botão primário | 3 |
| Definições de cor primária no produto | 2 |

Nenhuma dessas divergências foi decidida. Todas nasceram de pressa: sem código
compartilhado, cada tela resolveu a mesma tarefa do seu jeito.

## O problema que o produto relatou

O time de produto relatou "diferença visual entre páginas": filtros que mudam de
formato de tela para tela, cards e listagens com layouts distintos, a sensação de
que cada página tem um layout próprio em vez de um padrão de produto.

A varredura confirmou e quantificou. O diagnóstico central: **não faltavam
componentes — faltava padrão.** O Builder tem `Table` e `Tabs` no repositório e
nenhum arquivo os importa; o `Carousel` do Platform tem um único uso.

## O que este repositório resolve

1. **Uma origem** para componente e token, em vez de duas cópias que divergem.
2. **Padrões** para tarefas recorrentes (filtrar, listar, apresentar um item) —
   a categoria que nunca existiu e que causou a divergência relatada.
3. **Um catálogo consultável** por front, para que a próxima tela não precise
   inventar a resposta.

## Decisões de produto

Os 18 padrões visuais do produto foram decididos pela PO em 23/09/2026, a partir
de um catálogo comparativo montado sobre 63 telas. Estão em
[DOMAIN_MODEL.md](DOMAIN_MODEL.md) — documento normativo.

## Quem decide o quê

| Decisão | Quem |
|---|---|
| Padrão visual de um componente | PO |
| Anatomia e API de um padrão | design + engenharia |
| O que é primitiva, padrão ou domínio | este repositório ([AGENTS.md](AGENTS.md)) |
| Quando um consumidor migra uma tela | time do consumidor |
