# Hywork UI — Mapa do Repositório

## Visão Geral

**hywork-ui** é o design system do produto HyCloud: primitivas de interface,
padrões de tarefa, tokens e dois catálogos Storybook. Consumido por
`hywork-plataform` (admin) e `hw-cloud-builder` (intranet do colaborador).

Distribuído como pacote `@hywork/ui`, instalado por versão fixa. Não vai para o
npm (`private: true`); o release por tag gera o tarball como asset do GitHub.

---

## Stack

| Tecnologia | Uso |
|---|---|
| React 18 | biblioteca alvo (peer dependency) |
| TypeScript 5.9 | tipagem e declarações `.d.ts` |
| Radix UI | primitivos de acessibilidade |
| Tailwind CSS 3.4 | estilização via preset e tokens |
| CVA + tailwind-merge | variantes de componente |
| tsup | bundler da biblioteca (ESM + dts) |
| Storybook 10 | catálogos, com `addon-a11y` e `addon-docs` |
| Vitest | testes unitários |
| Playwright | testes de comportamento em Chromium e Firefox |
| Lucide | ícones |
| Recharts 3 | radar, barras agrupadas e linha — só na entrada `charts`, como peer opcional |

---

## Estrutura de Diretórios

> **A estrutura abaixo já existe.** As primitivas estão em `src/core/`, uma
> pasta por componente: as 28 derivadas do Platform e as nativas listadas em
> `nativeNames` (`scripts/derive-platform.mjs`). Os padrões do admin estão em
> `src/platform/`; `src/builder/` está criada e vazia —
> ver [PLANO_DESIGN_SYSTEM.md](PLANO_DESIGN_SYSTEM.md).
>
> **O Builder ainda não consome o pacote.** A camada existe e está preparada,
> mas a migração dele é uma rodada posterior.

```
src/
├── core/                  Primitivas comuns aos dois consumidores
│   ├── button/            index.tsx · button.stories.tsx · button.test.tsx
│   ├── input/
│   ├── select/
│   ├── table/
│   ├── dialog/            ✅  botão de fechar "Fechar" (`closeLabel`), como o `Sheet`
│   ├── badge/
│   ├── tabs/              ✅  sublinhado (PO); 📋 `orientation="vertical"` — lista à esquerda em 240px, selo à direita, ativa no par suave da marca (HCK-308) — aval da PO pendente
│   ├── breadcrumb/        ✅  níveis ocultos "Mais" (`label`), como o `closeLabel` do `Dialog`
│   ├── pagination/
│   ├── skeleton/
│   ├── carousel/
│   ├── label/
│   ├── search-input/      ✅  raio 4, o mesmo dos campos e botões do filtro
│   ├── form-message/      ✅  token --hw-error-text
│   ├── brand-theme/       ✅  <BrandTheme> e useBrandTheme — cor do workspace; par suave `primary-soft` (fundo/texto do item selecionado, 4.5:1) desde a HCK-308
│   ├── date-picker/       📋  data única, calendário próprio — aguarda aval da PO
│   ├── progress/          📋  autoral desde a 0.16.0: marca de referência (`marker`, `markerLabel`) e `tone="attention"` (HCK-259) — aval da PO pendente
│   ├── progress-ring/     📋  anel de progresso, SVG — lançado na 0.13.0, aval da PO pendente
│   ├── rating-scale/      📋  escala de resposta 1–N com rótulos — lançado na 0.13.0; `labelDisplay` (rótulo embaixo, escala de 1 a 10, HCK-235) na 0.16.0 — aval da PO pendente
│   ├── radio-group/       ✅  setas mudam e marcam, também na tecla rápida
│   └── …                  demais primitivas — todas com story
│
├── platform/              Padrões do admin (hywork-plataform)
│   ├── filter-bar/        ✅  substitui 9 implementações
│   ├── data-list/         ✅  substitui 44 telas
│   ├── item-card/         ✅  substitui 21 implementações
│   ├── list-pagination/   ✅  substitui 3
│   ├── empty-state/       ✅  substitui 8 variações
│   ├── error-state/       ✅  substitui 6 linhas de erro escritas à mão
│   ├── page-title/        ✅  substitui 9 combinações
│   ├── row-actions/       ✅  substitui botões soltos em 15 telas
│   ├── upload-area/       ✅
│   ├── stepper/           📋  trilha de passos de wizard — aguarda aval da PO
│   ├── stat-card/         📋  cartão de indicador; `iconTone`, `tone="highlight"`, `valueDetail` e `progress` na 0.16.0 (HCK-255, HCK-259); cabeçalho de 2 linhas com ícone na 0.16.1 — aguarda aval da PO
│   ├── bar-list/          📋  lista de barras proporcionais — lançado na 0.13.0; `marker`, `markerLabel` e `tone` por item na 0.16.0 (HCK-259) — aval da PO pendente
│   ├── description-list/  📋  lista de leitura rótulo/valor (`<dl>`), 1 a 3 colunas com `span`, "—" no valor vazio — HCK-308, aval da PO pendente
│   └── …                  multi-select, icon-select, rich-text-editor
│
├── builder/               Padrões da intranet (hw-cloud-builder)
│
├── charts/                Gráficos — entrada própria, @hywork/ui/charts (D1-23, DHO)
│   ├── chart-frame/       📋  moldura: título, base, "Como é calculado", rodapé, vazio — lançado na 0.13.0, aval da PO pendente
│   ├── radar-chart/       📋  radar; vira barras com < 3 eixos ou < 360px — lançado na 0.13.0, aval da PO pendente
│   ├── grouped-bar-chart/ 📋  barras agrupadas na horizontal — lançado na 0.13.0, aval da PO pendente
│   ├── line-chart/        📋  linha com ponto provisório e marcador — lançado na 0.13.0, aval da PO pendente
│   ├── distribution-bar/  📋  barra empilhada 100%, só CSS — lançado na 0.13.0, aval da PO pendente; legend="list" (HCK-256, R7) lançado na 0.15.0
│   ├── donut-chart/       📋  rosca com valor e rótulo no centro, SVG — HCK-256 (R6), lançado na 0.14.0
│   └── shared/            cores por token, escala, quebra de rótulo, tabela do leitor de tela
│
├── lib/
│   └── cn.ts              merge de classes (clsx + tailwind-merge)
│
├── theme/
│   └── brand.ts           brandThemeVars(hex) — puro, sem React
│
├── platform.ts            entrada pública → core + platform
├── builder.ts             entrada pública → core + builder
├── charts.ts              entrada pública → gráficos; a única que importa o recharts
├── theme.ts               entrada pura (sem "use client") → brandThemeVars
└── consumer-check.ts      entrada pura → trava contra sobrescrita de token

tokens/
├── core.css               escala, espaçamento, raio e o contrato das
│                          variáveis da aplicação (--primary, --background…)
├── platform.css           cores e tipografia do admin
└── builder.css            cores e tipografia da intranet

tailwind/
├── platform-preset.cjs
└── builder-preset.cjs

.storybook/
├── platform/              config e stories do admin      → 6006
└── builder/               config e stories da intranet   → 6007
```


---

## Entry Points

| Entry Point | Descrição |
|---|---|
| `src/platform.ts` | API pública para o `hywork-plataform` |
| `src/builder.ts` | API pública para o `hw-cloud-builder` |
| `src/charts.ts` | `@hywork/ui/charts` — gráficos; exige `recharts` (`>=3.1 <4`) no consumidor, e só esta entrada o importa |
| `src/theme.ts` | `@hywork/ui/theme` — `brandThemeVars`, sem "use client" (Server Component, Node) |
| `src/consumer-check.ts` | `@hywork/ui/consumer-check` — `assertNoTokenOverrides`, para o teste do consumidor |
| `tokens/core.css` | tokens comuns e as variáveis da aplicação — obrigatório nos dois consumidores, que não declaram cor própria |
| `tailwind/<produto>-preset.cjs` | preset Tailwind por consumidor |
| `.storybook/<produto>/` | configuração de cada catálogo |

---

## Padrão de Componente

```
<nome>/
├── index.tsx              implementação e variantes (CVA)
├── <nome>.stories.tsx     story com TODOS os estados previstos
├── <nome>.test.tsx        comportamento, foco e acessibilidade
└── <nome>.types.ts        contratos exportados (quando não cabem no index)
```

Estados obrigatórios na story: repouso, foco, erro, carregando, desabilitado e
vazio — quando aplicáveis ao componente.

---

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev:platform` | Storybook do admin na porta 6006 |
| `npm run dev:builder` | Storybook da intranet na porta 6007 |
| `npm run check` | integridade + TypeScript + bundle + Vitest |
| `npm run build` | biblioteca + CSS + os dois Storybooks |
| `npm run test:browser` | Playwright em Chromium e Firefox |
| `npm run smoke:consumer` | instala o tarball num consumidor limpo e valida exports |
| `npm run audit:gate` | `npm audit` alto/crítico, com exceções datadas em `scripts/audit-gate.mjs` |
| `npm run derive` | regenera a partir de `provenance/` (extração original) |

---

## Testes

- **Vitest** — comportamento de componente, colocalizado (`<nome>.test.tsx`)
- **Playwright** — interação real em dois navegadores, em `tests/browser/`
  (os gráficos têm página própria, `tests/fixtures/charts.html`, com os números
  do exemplo da HCK-256; os indicadores do DHO — `StatCard`, marcas do
  `Progress` e do `BarList`, escala de 1 a 10 — têm `tests/fixtures/indicators.html`,
  com contraste APCA do destaque nos temas claro e escuro, a escala em 320/360px e,
  com `?cards=226` ou `?cards=266`, fileiras de 4 `StatCard` com o valor na mesma altura;
  o perfil da pessoa da HCK-308 tem `tests/fixtures/profile.html` — abas verticais ao lado
  e acima do conteúdo, a horizontal intacta, a `DescriptionList` em 3, 2 e 1 colunas e o
  contraste da aba ativa com marcas claras, por `?brand=f97316`)
- **axe-core** — auditoria de acessibilidade, via `@storybook/addon-a11y` e nos testes
- **smoke-consumer** — instala o tarball num projeto limpo e valida exports,
  declarações, diretiva de cliente e preset

O catálogo verde não prova cobertura de produto: cada fluxo migrado no consumidor
exige evidência própria.

---

## Documentação

| Arquivo | Conteúdo |
|---|---|
| [CLAUDE.md](CLAUDE.md) | diretrizes para agentes, comandos e arquitetura |
| [AGENTS.md](AGENTS.md) | contrato normativo: escopo, fronteiras, proibições |
| [DOMAIN_MODEL.md](DOMAIN_MODEL.md) | **padrões decididos pela PO** — consulta obrigatória |
| [CROSS_STACK_CONVENTIONS.md](CROSS_STACK_CONVENTIONS.md) | instalação, migração e ciclo de versão |
| [docs/design-guide.md](docs/design-guide.md) | critérios visuais |
| [CONTRIBUTING.md](CONTRIBUTING.md) | branches, gates e versionamento |
| [CHANGELOG.md](CHANGELOG.md) | histórico de versões |

---

## Consumidores

| Repositório | Entrada | Papel |
|---|---|---|
| `hywork-plataform` | `@hywork/ui/platform` | admin, configurações, Page Builder |
| `hw-cloud-builder` | `@hywork/ui/builder` | intranet vista pelo colaborador |

Os demais repositórios do workspace (`hywork-cloud-core-api`, `hycloud-academy`,
`hywork-cloud-autenticator`, `hywork-dora-ai`) são backends, e `hycloud-community`
é um fork do NodeBB — nenhum consome este pacote.
