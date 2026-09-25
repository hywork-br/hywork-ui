# Hywork UI

Design system do produto **HyCloud**: primitivas de interface, padrões de tarefa,
tokens e dois catálogos Storybook.

Consumido por **`hywork-plataform`** (admin) e **`hw-cloud-builder`** (intranet
do colaborador). Nenhum dos dois cria componente genérico próprio.

## Estado

Reestruturação em andamento. O repositório nasceu como extração do
`hywork-plataform` (28 primitivas, revisão `85a66ba`) e está sendo reorganizado
em três camadas para atender os dois consumidores.

| Frente | Situação |
|---|---|
| 28 primitivas extraídas | ✅ existem, em `src/components/` |
| Padrões decididos pela PO | ✅ registrados em [DOMAIN_MODEL.md](DOMAIN_MODEL.md) |
| Estrutura `core` / `platform` / `builder` | 🚧 primeira tarefa |
| Padrões novos (filtro, listagem, card…) | 📋 a criar |
| Storybook por componente | 📋 hoje há um catálogo único |

Acompanhamento em [PLANO_DESIGN_SYSTEM.md](PLANO_DESIGN_SYSTEM.md).

## Para engenharia

```ts
import { FilterBar, Button } from "@hywork/ui/platform";  // no Platform
import { FilterBar, Button } from "@hywork/ui/builder";   // no Builder
```

```ts
// tailwind.config.ts do consumidor
presets: [require("@hywork/ui/tailwind/platform-preset.cjs")],
content: [..., "./node_modules/@hywork/ui/dist/**/*.js"],  // obrigatório
```

Instalação, migração e ciclo de versão: **[CROSS_STACK_CONVENTIONS.md](CROSS_STACK_CONVENTIONS.md)**.

## Antes de escrever código

| Leia | Para |
|---|---|
| [DOMAIN_MODEL.md](DOMAIN_MODEL.md) | saber qual padrão visual já foi decidido |
| [AGENTS.md](AGENTS.md) | saber o que entra e o que não entra aqui |
| [INDEX.md](INDEX.md) | saber se o componente já existe |
| [CLAUDE.md](CLAUDE.md) | comandos, arquitetura e convenções |

## Desenvolvimento

```sh
rtk npm ci
rtk npm run dev:platform     # Storybook do admin      → 6006
rtk npm run dev:builder      # Storybook da intranet   → 6007
rtk npm run check            # integridade + tipos + bundle + testes
rtk npm run build
rtk npm run test:browser
rtk npm run smoke:consumer
```

## Fronteira, em uma linha

> Se o componente sabe o que é um tenant, um workspace ou um colaborador, ele
> pertence ao consumidor. Se não sabe, pertence a este repositório.

[Contribuição](CONTRIBUTING.md) · [Mudanças](CHANGELOG.md) · [Guia visual](docs/design-guide.md)
