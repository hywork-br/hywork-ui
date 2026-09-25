# CLAUDE.md

Guia para Claude Code, Codex e demais agentes ao trabalhar neste repositório.

> **Este repositório é a fonte única de design do produto HyCloud.**
> Componentes de interface, tokens e padrões visuais do `hywork-plataform` e do
> `hw-cloud-builder` vivem aqui. Nenhum dos dois consumidores cria componente
> genérico próprio — ver [AGENTS.md](AGENTS.md) para a fronteira exata.

## Comandos

```bash
rtk npm run dev:platform     # Storybook do Platform (porta 6006)
rtk npm run dev:builder      # Storybook do Builder  (porta 6007)
rtk npm run check            # integridade + tipos + bundle + testes
rtk npm run build            # biblioteca + CSS + os dois Storybooks
rtk npm run test             # Vitest
rtk npm run test:browser     # Playwright (Chromium + Firefox)
rtk npm run smoke:consumer   # instala o tarball num consumidor limpo
```

Verificação antes de abrir PR: `rtk npm run check && rtk npm run build`.

Publicação: tag `v*` dispara o workflow `release.yml`, que gera o tarball como
asset do GitHub Release. O pacote **não** vai para o npm (`private: true`).

## Arquitetura

### Três camadas, duas saídas

```
src/
├── core/        Primitivas comuns aos dois produtos
│                button, input, select, checkbox, dialog, table…
│                Mesma anatomia, mesma API. Divergem apenas por token.
│
├── platform/    Padrões e ajustes do admin (hywork-plataform)
│                filter-bar, data-list, item-card, page-title…
│
└── builder/     Padrões e ajustes da intranet (hw-cloud-builder)
```

**A regra que decide onde um componente mora:**

> Entra em `core/` quando os dois produtos concordam na **anatomia** e divergem
> apenas em **token**. Se divergem na anatomia, são dois componentes.

Cada consumidor importa a sua entrada, que reexporta `core` + o que é seu:

```ts
import { FilterBar, Button } from "@hywork/ui/platform";  // no Platform
import { FilterBar, Button } from "@hywork/ui/builder";   // no Builder
```

O tree-shaking garante que um consumidor nunca carrega código do outro.

### Primitiva, padrão e domínio

| Categoria | O que é | Onde mora |
|---|---|---|
| **Primitiva** | tijolo genérico sem noção de tarefa — `Button`, `Input`, `Table` | `src/core/` |
| **Padrão** | receita para uma tarefa recorrente — `FilterBar`, `DataList`, `ItemCard` | `src/platform/` ou `src/builder/` |
| **Domínio** | sabe o que é um tenant, um workspace, um colaborador | **fica no consumidor** |

`Select` não sabe que está filtrando. `FilterBar` sabe. `TenantSwitcher` sabe o
que é um tenant — e por isso nunca entra aqui.

### Tokens

```
tokens/
├── core.css       escala, espaçamento, raio          (comum aos dois)
├── platform.css   cores e tipografia do admin
└── builder.css    cores e tipografia da intranet

tailwind/
├── platform-preset.cjs
└── builder-preset.cjs
```

Variáveis da aplicação (`--primary`, `--background`) **prevalecem** sobre os
defaults `--hw-*`. O tema do cliente sempre vence: nunca force uma cor de marca
sobre uma variável do consumidor.

### Storybook

Dois catálogos, gerados por `npm run build:storybook`:

```
.storybook/platform/   → storybook-static/platform
.storybook/builder/    → storybook-static/builder
```

Este repositório é uma **biblioteca**, não uma aplicação web — não há deploy
contínuo. Para consultar o catálogo, rode `npm run dev:platform` localmente.
**Componente sem story não é design system** — é mais um arquivo. Hoje as 30
primitivas e os 9 padrões têm story, com os estados previstos: repouso, erro,
carregando, desabilitado e vazio, além das combinações que o componente resolve.

A publicação numa URL fixa fica para quando a migração do Platform terminar
(decisão do Rick, 25/09/2026) — o catálogo está pronto e roda com
`npm run dev:platform`.

## Convenções

- Código e nomes de arquivo em **inglês**; documentação interna em **português**.
- Um componente por pasta, com `index.tsx`, `<nome>.stories.tsx` e `<nome>.test.tsx`.
- **Nunca cor literal em componente.** Use token semântico e pares fundo/texto.
- Composição antes de props: um padrão recebe slots (`<FilterBar.Search />`),
  não quinze props opcionais. Se a API passa de ~8 props, a anatomia está errada.
- Preserve APIs e estados ao alterar, incluindo handlers e foco. Registre rupturas
  no [CHANGELOG.md](CHANGELOG.md).
- Responsividade é responsabilidade do componente, nunca da página que o usa.
- Componente genérico recebe dados e handlers por props; **nunca** acessa
  serviços, contexto de auth ou API do produto.

## Antes de criar ou alterar um componente

1. Confira em [DOMAIN_MODEL.md](DOMAIN_MODEL.md) se o padrão visual já foi decidido.
2. Confira em [INDEX.md](INDEX.md) se o componente já existe (em `core`, `platform` ou `builder`).
3. Escreva a story **antes** do componente. Se a story fica confusa, a API está errada.
4. Para um componente novo: ele é primitiva, padrão ou domínio? Domínio não entra.
5. **Não suba na primeira vez que precisar.** Componente nasce no consumidor;
   quando o segundo consumidor precisar do mesmo, aí sobe para cá.

## Documentação adicional (Essencial)

- [Contrato do design system](AGENTS.md) — escopo, fronteiras e regras duras
- [Padrões decididos](DOMAIN_MODEL.md) — o que foi eleito como padrão do produto
- [Adoção e fluxo de trabalho](CROSS_STACK_CONVENTIONS.md) — instalação, versão e
  **os seis cenários do dia a dia** (§9): usar, criar, decidir, domínio, alterar, propagar
- [Índice de estrutura](INDEX.md) — mapa de pastas e componentes
- [Guia visual](docs/design-guide.md) — critérios de tipografia, cor e espaçamento
- [Contribuição](CONTRIBUTING.md) — branches, gates e versionamento
- [Mudanças](CHANGELOG.md) — histórico de versões

<!-- rtk-instructions v2 -->
## RTK — prefixe todo comando

Todo comando neste workspace vai prefixado com `rtk`, inclusive dentro de
cadeias com `&&`:

```bash
# ❌ Errado
npm run check && git commit -m "msg"

# ✅ Correto
rtk npm run check && rtk git commit -m "msg"
```

Se o RTK tem filtro dedicado, ele usa; se não, repassa o comando sem alterar.
Referência completa em `~/.claude/RTK.md`.
<!-- /rtk-instructions -->
