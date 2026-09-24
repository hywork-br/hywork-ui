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

---

## Estrutura de Diretórios

> **A estrutura abaixo já existe.** As 28 primitivas estão em `src/core/`, uma
> pasta por componente. `src/platform/` e `src/builder/` estão criadas e vazias:
> recebem os padrões conforme forem construídos —
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
│   ├── dialog/
│   ├── badge/
│   ├── tabs/
│   ├── breadcrumb/
│   ├── pagination/
│   ├── skeleton/
│   ├── carousel/
│   ├── label/
│   ├── search-input/
│   ├── form-message/
│   └── …                  demais primitivas
│
├── platform/              Padrões do admin (hywork-plataform)
│   ├── filter-bar/        ✅  substitui 9 implementações
│   ├── data-list/         ✅  substitui 44 telas
│   ├── item-card/         ✅  substitui 21 implementações
│   ├── list-pagination/   ✅  substitui 3
│   ├── empty-state/       ✅  substitui 8 variações
│   ├── page-title/        ✅  substitui 9 combinações
│   ├── row-actions/       📋
│   └── upload-area/       📋
│
├── builder/               Padrões da intranet (hw-cloud-builder)
│
├── lib/
│   └── cn.ts              merge de classes (clsx + tailwind-merge)
│
├── platform.ts            entrada pública → core + platform
└── builder.ts             entrada pública → core + builder

tokens/
├── core.css               escala, espaçamento, raio  (comum)
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
| `tokens/core.css` | tokens comuns — obrigatório nos dois consumidores |
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
| `npm run derive` | regenera a partir de `provenance/` (extração original) |

---

## Testes

- **Vitest** — comportamento de componente, colocalizado (`<nome>.test.tsx`)
- **Playwright** — interação real em dois navegadores, em `tests/browser/`
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
