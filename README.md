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
import { ChartFrame, RadarChart } from "@hywork/ui/charts"; // gráficos — exige o recharts
```

```ts
// tailwind.config.ts do consumidor
presets: [require("@hywork/ui/tailwind/platform-preset.cjs")],
content: [..., "./node_modules/@hywork/ui/dist/**/*.js"],  // obrigatório
```

```css
/* globals.css — e nenhuma variável de cor própria */
@import "@hywork/ui/tokens/core.css";
@import "@hywork/ui/tokens/platform.css";
```

A cor do workspace entra por `brandThemeVars(hex)` (`@hywork/ui/theme`); a trava
que impede o consumidor de redefinir cor é `@hywork/ui/consumer-check`.

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

## Claude Code neste repositório

O `.claude/settings.json` deste repositório liga o plugin **`hycloud`**, que vem do repositório
[hywork-skills](https://github.com/hywork-br/hywork-skills). Ao abrir o projeto no Claude Code, ele
oferece instalar o plugin. O guia completo, com o que cada peça faz, fica em
[hywork-skills → Guia do dev](https://github.com/hywork-br/hywork-skills#guia-do-dev).

**Instalar (uma vez por máquina):**

1. GitHub: `gh auth login -h github.com -s repo,workflow,read:org` e `gh auth setup-git`.
2. Abra este repositório no Claude Code e aceite instalar o plugin `hycloud`. Se ele não oferecer:
   `/plugin marketplace add hywork-br/hywork-skills` e `/plugin install hycloud@hywork-skills`.
3. Peça ao Claude **"confere meus acessos"**. Ele diz o que falta (GitHub, AWS, token do Jira) e como resolver.

**O que você chama:**

| Como chamar | O que faz |
|---|---|
| `/hycloud:tarefa HCK-123` | Desenvolve uma tarefa do Jira do card ao QA: lê o card, os anexos e o protótipo, mostra o que entendeu e espera o seu ok, cria as worktrees, despacha os agentes de back e de front, confere a tela e comenta no card. |
| `/hycloud:deploy`, ou "faz a release", "como está o deploy?" | Release para produção, status do deploy, migration que falhou, rollback e hotfix. |
| `/hycloud:envs`, ou "grava a variável X na core-api" | Variável de ambiente no SSM. O valor é digitado numa janela com campo oculto e não passa pelo chat. |

**O que roda sozinho:**

| Quando | O que acontece |
|---|---|
| A cada mensagem que você manda | O plugin barra token ou chave colada no chat (`ghp_`, `sk-`, `AKIA`, chave privada...) antes de ela chegar ao modelo. |
| Quando o assunto da conversa casa com uma skill | O Claude carrega a skill sozinho (as deste repositório, abaixo, e as do plugin). Você também pode chamar pelo nome. |

**Skills deste repositório** (em `.claude/skills/`; o Claude usa sozinho quando o assunto aparece, ou `/nome`):

| Skill | Quando entra |
|---|---|
| `/release-ds` | Ao publicar uma versão nova do design system (bump por PR, PR `develop` → `main` e tag `vX.Y.Z`), conferir se uma tag saiu ou subir a versão do pacote no `hywork-plataform`. |

## Fronteira, em uma linha

> Se o componente sabe o que é um tenant, um workspace ou um colaborador, ele
> pertence ao consumidor. Se não sabe, pertence a este repositório.

[Contribuição](CONTRIBUTING.md) · [Mudanças](CHANGELOG.md) · [Guia visual](docs/design-guide.md) ·
[Release](.claude/skills/release-ds/SKILL.md)
