# Arquitetura

## Posição no workspace

```
                    ┌──────────────────┐
                    │    hywork-ui     │  componentes · tokens · Storybook
                    └────────┬─────────┘
                 @hywork/ui/ │ @hywork/ui/
                    platform │ builder
                  ┌──────────┴──────────┐
                  ▼                     ▼
       ┌────────────────────┐  ┌────────────────────┐
       │  hywork-plataform  │  │  hw-cloud-builder  │
       │  admin · Next 14   │  │  intranet · Next 14│
       └─────────┬──────────┘  └─────────┬──────────┘
                 └──────────┬────────────┘
                            ▼
                 ┌────────────────────┐
                 │ hywork-cloud-core- │  backend — não consome UI
                 │ api                │
                 └────────────────────┘
```

Este repositório não conhece backend, tenant nem autenticação. Recebe dados e
handlers por props e devolve interface.

## Três camadas

```
src/core/       primitivas comuns aos dois produtos
    │           button · input · select · table · dialog · badge · tabs …
    │           mesma anatomia, mesma API, divergem só por token
    ├──────────────┬──────────────┐
    ▼              ▼              ▼
src/platform/   src/builder/   (futuros consumidores)
padrões do      padrões da
admin           intranet
    │              │
    ▼              ▼
src/platform.ts  src/builder.ts     entradas públicas
```

**A regra de alocação:** entra em `core/` quando os dois produtos concordam na
*anatomia* e divergem apenas em *token*. Se divergem na anatomia, são dois
componentes — não um com props condicionais.

## Primitiva, padrão, domínio

| Camada | Conhece a tarefa? | Conhece o domínio? | Onde |
|---|---|---|---|
| Primitiva | não | não | `core/` |
| Padrão | **sim** | não | `platform/` · `builder/` |
| Domínio | sim | **sim** | consumidor |

`Select` não sabe que está filtrando. `FilterBar` sabe. `TenantSwitcher` sabe o
que é um tenant — e por isso fica no consumidor.

Essa fronteira é o que impede o repositório de virar um segundo produto.

## Fluxo de uma mudança

```
PR aqui ──► CI (tipos · bundle · axe · Playwright×2) ──► tag v* ──► Release
                                                                      │
                          ┌───────────────────────────────────────────┘
                          ▼
              bump no consumidor  ──► preview Vercel ──► merge
                   (manual)
```

O bump é manual por decisão: alteração que muda o botão de 400 telas sem
revisão é incidente, não recurso. Ver [CROSS_STACK_CONVENTIONS.md](../CROSS_STACK_CONVENTIONS.md).

## Tema e multi-tenant

O produto é multi-tenant e cada workspace pode ter cor de marca própria. Por isso
nenhum componente carrega cor literal:

```
cor do workspace (#hex)
   │  brandThemeVars(hex)                       @hywork/ui/theme
   ▼
--hw-brand-primary (+ -foreground, -hover, -active, -ink)    ← única entrada
   │  tokens/core.css
   ▼
--primary · --primary-foreground · --primary-hover · --primary-active
--primary-ink · --ring                ← sem marca: --hw-color-primary-default
   │  preset
   ▼
bg-primary · text-primary-ink · ring-ring …
```

Até 06/10/2026 era o inverso: o preset usava duplo fallback e a variável do
consumidor vencia. O Rick decidiu que o design system vence em todos os
pontos — o consumidor não declara cor nem variável, e
`@hywork/ui/consumer-check` reprova quem declarar. Um componente com
`bg-[#143748]` quebra esse contrato — é a razão da proibição de cor literal.

## O que este repositório deliberadamente não faz

- não chama API nem conhece rota
- não gerencia estado de servidor (React Query fica no consumidor)
- não implementa layout de aplicação nem navegação
- não conhece i18n do produto (recebe texto por props)
- não renderiza blocos do Page Builder
