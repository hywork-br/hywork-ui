# Guia de adoção

Como `hywork-plataform` e `hw-cloud-builder` instalam, consomem e migram para
este design system.

## 1. O modelo, em uma frase

O pacote entra em **tempo de build**, com versão fixa no lockfile. Nada é
buscado em runtime, e **nada se propaga sozinho**: uma correção aqui só chega ao
produto quando alguém sobe a versão no consumidor e abre PR.

```
hywork-ui                    tag v0.8.0 → release com tarball
    │
    │  npm install (versão fixa)
    ▼
node_modules/@hywork/ui      o código, agora local
    │
    │  import { FilterBar } from "@hywork/ui/platform"
    ▼
next build                   vira parte do bundle do consumidor
```

## 2. Instalação

O `package.json` tem `private: true`, o que bloqueia `npm publish`. O
repositório é público e tem `prepare`, então a via mais simples funciona sem
infraestrutura adicional:

```jsonc
"@hywork/ui": "github:hywork-br/hywork-ui#v0.8.0"
```

Alternativas: baixar o tarball do GitHub Release (`gh release download`) ou
publicar no GitHub Packages — esta última exige token no CI e na Vercel.
Em qualquer caso, **versão fixa e lockfile versionado**. Nunca aponte um
consumidor para branch flutuante.

## 3. Configuração

```ts
// tailwind.config.ts — adaptar o existente, NÃO substituir
presets: [require("@hywork/ui/tailwind/platform-preset.cjs")],
content: [
  "./src/**/*.{ts,tsx}",
  "./node_modules/@hywork/ui/dist/**/*.js",   // ← sem isto, os componentes vêm sem estilo
],
```

```css
/* globals.css */
@import "@hywork/ui/tokens/core.css";
@import "@hywork/ui/tokens/platform.css";   /* ou builder.css */
```

No Builder, trocar `platform` por `builder` nas duas linhas.

### O contrato de cor: o design system vence

Decisão do Rick (06/10/2026). O consumidor **importa** os dois CSS, **usa** o
preset e **não define cor nem variável própria**. Até a 0.10 era o inverso — o
admin declarava `--primary`, `--background`… no próprio `:root` e o preset
deixava a variável da aplicação vencer. Isso acabou.

| O consumidor faz | O consumidor não faz |
|---|---|
| `@import` de `tokens/core.css` + `tokens/platform.css` | declarar `--primary`, `--background`, `--border`, `--radius`, `--chart-*`, `--admin-*` ou qualquer `--hw-*` no seu CSS, em qualquer seletor |
| `presets: [platform-preset]` | criar chave em `theme.colors` ou `theme.extend.colors` — nem para sombrear, nem cor nova |
| escrever a cor do workspace pelo gancho de marca | redefinir `borderRadius`, `spacing`, `fontSize`, `fontWeight`, `fontFamily.sans` do preset |

Cor que o design system não tem é **pedido de token aqui**, não chave local.

As variáveis que o design system declara, e de onde vêm (`tokens/core.css`,
`tokens/platform.css`):

| Variável | Token de origem | Valor (claro) |
|---|---|---|
| `--background` | `--hw-color-background` | `217 0% 100%` |
| `--foreground` | `--hw-color-foreground` | `217 0% 10%` |
| `--card` / `--card-foreground` | `--hw-color-card-default` / `-foreground` | `217 0% 100%` / `217 0% 15%` |
| `--popover` / `--popover-foreground` | `--hw-color-popover-default` / `-foreground` | `217 0% 100%` / `217 95% 10%` |
| `--primary` | `--hw-brand-primary`, senão `--hw-color-primary-default` | `200 57% 18%` |
| `--primary-foreground` | `--hw-brand-primary-foreground`, senão `--hw-color-primary-foreground` | `0 0% 100%` |
| `--primary-hover` | `--hw-brand-primary-hover`, senão `--hw-color-primary-600` | `200 57% 15%` |
| `--primary-active` | `--hw-brand-primary-active`, senão `--hw-color-primary-700` | `200 57% 12%` |
| `--primary-ink` | `--hw-brand-primary-ink`, senão a marca, senão `--hw-color-primary-default` | `200 57% 18%` |
| `--secondary` / `-foreground` | `--hw-color-secondary-default` / `-foreground` | `217 10% 90%` / `0 0% 0%` |
| `--muted` / `-foreground` | `--hw-color-muted-default` / `-foreground` | `179 10% 95%` / `217 0% 40%` |
| `--accent` / `-foreground` | `--hw-color-accent-default` / `-foreground` | `179 10% 90%` / `217 0% 15%` |
| `--destructive` / `-foreground` | `--hw-color-destructive-default` / `-foreground` | `0 50% 50%` / `217 0% 100%` |
| `--success` / `-foreground` | `--hw-color-success-default` / `-foreground` | `142 76% 36%` / `0 0% 100%` |
| `--warning` / `-foreground` | `--hw-color-warning-default` / `-foreground` | `38 92% 50%` / `0 0% 100%` |
| `--error` / `-foreground` | `--hw-color-error-default` / `-foreground` | `0 84% 60%` / `0 0% 100%` |
| `--info` / `-foreground` | `--hw-color-info-default` / `-foreground` | `199 89% 48%` / `0 0% 100%` |
| `--border` | `--hw-color-border` | `217 20% 82%` |
| `--input` | `--hw-color-input` | `217 20% 50%` |
| `--ring` | tinta da marca, senão a marca, senão `--hw-color-ring` | `217 87.2% 21.4%` |
| `--radius` | — | `0.5rem` |
| `--chart-1`…`--chart-5` | `--hw-color-chart-1`…`5` | `200 57% 18%` · `142 76% 36%` · `38 92% 50%` · `0 84% 60%` · `199 89% 48%` |
| `--admin-bg` / `-surface` / `-sidebar` (RGB) | `--hw-color-admin-*` | `239 240 241` · `255 255 255` · `30 58 95` |

São os mesmos valores que o admin declarava até 06/10 — remover o `:root`
dele não muda pixel nenhum sem marca (há um teste aqui provando isso). No
`.dark` valem os `--hw-color-*` do modo escuro de `platform.css`.

O preset declara todas as chaves que o consumidor usa, com `<alpha-value>`:
`background`, `foreground`, `card`, `popover`, `primary` (com `50`…`900`,
`foreground`, `hover`, `active`, `ink`), `secondary`, `muted`, `accent`,
`destructive`, `success`, `warning`, `error`, `info`, `border`, `input`,
`ring`, `chart`, `admin.*`, as paletas tokenizadas (`slate`, `gray`, `zinc`,
`red`, `emerald`, `yellow`, `blue`) e as `hw-*` de papel.

### Cor do workspace — o único gancho

A marca do workspace é a **única** cor que o consumidor informa. Ela entra por
`--hw-brand-primary` (canais HSL) e companhia, calculados por `brandThemeVars`:

```tsx
// app/[locale]/(plataform)/layout.tsx — Server Component, sem piscar
import { brandThemeVars } from "@hywork/ui/theme";      // entrada sem "use client"

<html style={brandThemeVars(workspace?.color_primary_hex)}>
```

```tsx
// troca de workspace sem recarregar — Client Component
import { useBrandTheme } from "@hywork/ui/platform";
useBrandTheme(workspaceAtual?.color_primary_hex);
```

```tsx
// só um trecho (prévia, cartão do workspace)
import { BrandTheme } from "@hywork/ui/platform";
<BrandTheme color="#434cad">…</BrandTheme>
```

`brandThemeVars(hex)` aceita `#rgb` ou `#rrggbb`; qualquer outra coisa devolve
`{}` e vale o primário do design system. Devolve cinco variáveis:

| Gancho | O que é |
|---|---|
| `--hw-brand-primary` | a marca, em canais HSL |
| `--hw-brand-primary-foreground` | texto sobre a marca: branco se passa 4.5:1; senão slate-900; senão preto |
| `--hw-brand-primary-hover` / `-active` | preenchimento no cursor e pressionado, afastando-se do texto (contraste nunca cai abaixo de 4.5:1) |
| `--hw-brand-primary-ink` | a marca como texto/linha sobre o branco: a própria marca se já tem 4.5:1, escurecida até ter |

Escreva no `<html>`: é o único lugar que alcança também os portais (Dialog,
Select, DropdownMenu, Toast), que o Radix monta fora da árvore da página.
`<BrandTheme>` é para trecho, não para a aplicação.

Estado (sucesso, atenção, erro, informação) e destrutivo **não** seguem a
marca. O modo escuro continua referência técnica: a tinta é calculada contra o
fundo branco.

### A trava — `@hywork/ui/consumer-check`

Para a regra não depender de revisão, o consumidor a cobra num teste:

```ts
// src/design-system.test.ts
import { readFileSync } from "node:fs";
import loadConfig from "tailwindcss/loadConfig";
import { assertNoTokenOverrides } from "@hywork/ui/consumer-check";

test("o design system é a única fonte de cor e token", () => {
  assertNoTokenOverrides({
    tailwindConfig: loadConfig("tailwind.config.ts"),        // o config como escrito, não resolvido
    css: { "globals.css": readFileSync("src/app/styles/globals.css", "utf8") },
  });
});
```

`loadConfig` (do próprio Tailwind 3) carrega o `tailwind.config.ts` como foi
escrito, sem resolver o preset — é o que a trava precisa. O teste só lê arquivos;
se o padrão do projeto for jsdom, `// @vitest-environment node` no topo basta.

O que ela reprova:

- **Tailwind:** toda chave em `theme.colors`/`theme.extend.colors`; chaves de
  `borderRadius`, `spacing`, `fontSize`, `fontWeight`, `fontFamily` e
  `ringColor` que o preset já define. Presets são ignorados.
- **CSS:** declaração, em qualquer seletor (inclusive dentro de `@layer`), de
  variável do contrato acima ou de qualquer `--hw-*` — exceto o gancho
  `--hw-brand-*`. Variáveis próprias de feature (`--tv-accent`,
  `--sidebar-width`) passam.

`assertNoTokenOverrides` lança com a lista (`--primary  (globals.css:16
:root)`); `findTokenOverrides` devolve a mesma lista como dados, se o teste
quiser formatar.

### Três armadilhas conhecidas

**① O CSS não vem pronto.** O pacote entrega JavaScript contendo strings de
classe, não CSS. Quem gera o CSS é o Tailwind do consumidor — e ele não olha
dentro de `node_modules` por padrão. Sem a linha de `content` acima, o
componente renderiza, funciona e aparece sem formatação nenhuma.

**② Chaves duplicadas vencem o preset.** Se o consumidor redefine `colors`,
`spacing` ou `borderRadius` em `theme.extend`, essas definições vencem o preset
e ele fica inerte. O mesmo vale para `--primary` & cia. declarados no CSS do
consumidor depois do `@import`. Desde 06/10/2026 isso é proibido, não só
desaconselhado — a trava acima reprova.

**③ Tudo vira client component.** O bundle carrega `"use client"` no topo,
necessário para o App Router aceitar componentes com estado vindos de um pacote.
O efeito colateral é que componentes hoje renderizados no servidor passam a ser
de cliente. Não quebra nada; aumenta um pouco o JS enviado.

## 4. Desenvolvimento local

Esperar uma tag a cada ajuste é inviável. Durante o desenvolvimento, aponte para
a pasta local:

```jsonc
// package.json do consumidor — apenas na máquina do dev, nunca commitado
"@hywork/ui": "file:../hywork-ui"
```

Com `rtk npm run build:lib -- --watch` rodando no `hywork-ui`, o Next recarrega
a cada salvamento. O ciclo de tag e release só entra quando o trabalho vai para
`develop`.

## 5. Migrar uma tela

O caminho mais barato no Platform usa o arquivo existente como **casca de
re-export**, para não abrir um PR que toca 462 arquivos:

```tsx
// src/components/ui/button.tsx — o arquivo continua existindo, sem implementação
export { Button, buttonVariants } from "@hywork/ui/platform";
export type { ButtonProps } from "@hywork/ui/platform";
```

Os imports existentes continuam funcionando sem alteração. A migração fica
reversível arquivo por arquivo.

> **Atenção ao `Input`:** 151 arquivos do Platform usam `import Input from ...`
> (default). Como `export *` não repassa default, o shim precisa reexportar os
> dois:
> ```tsx
> import { Input } from "@hywork/ui/platform";
> export { Input };
> export default Input;
> ```

### Regras da migração

1. **Nunca migrar sem apagar.** Se o `FilterBar` entra, o `users-filters.tsx`
   sai no mesmo PR. Deixar os dois convivendo é como se chega a 12 implementações.
2. **Uma tela por PR.**
3. Para cada fluxo: captura anterior → migração → tipos e build → teclado e foco
   → estados de carregando, desabilitado e erro → submissão real → captura
   posterior com os mesmos dados, largura e tema.
4. Conferir retorno de foco dos portais, contraste e área de toque.

## 6. Versão entre os dois consumidores

**Os dois sobem de versão na mesma sprint.** Sem essa regra, o Builder trava
numa versão antiga e a divergência volta — desta vez por versão, não por código.

Quando não for possível, o limite é **uma minor de atraso**, registrado no PR.

## 7. Ciclo completo de uma mudança

```
1. PR no hywork-ui        altera o componente e a story
2. CI                     tipos, bundle, axe, Playwright em 2 navegadores
3. Merge → tag v0.8.1     release com tarball
4. Bump no consumidor     PR com a nova versão            ← passo manual
5. Preview na Vercel      validação visual do fluxo
6. Merge
```

O passo 4 é manual de propósito: um design system que altera o botão de 400
telas sem revisão é incidente, não recurso.

## 8. O que continua no consumidor

Componentes de domínio (`TenantSwitcher`, `UserNav`, `WorkspaceSwitcher`),
layout de aplicação (`AdminPanelLayout`, `ContentLayout`), navegação, blocos do
Page Builder e renderizadores estáticos. A fronteira exata está em
[AGENTS.md](AGENTS.md) §2.

---

## 9. Fluxo de trabalho no dia a dia

Como desenvolver e manter interface agora que o design system é
centralizado. Vale para pessoas e para agentes.

Como desenvolver e manter interface a partir de 24/09/2026, agora que o design
system é centralizado. Vale para pessoas e para agentes.


### A pergunta que abre qualquer tarefa de UI

```
Vou mexer em interface.
│
├─ O componente que eu preciso já existe?
│  → consulte INDEX.md ou rode `npm run dev:platform` (Storybook, porta 6006)
│
├─ SIM  ────────────────────────────► CENÁRIO 1 · usar
│
└─ NÃO
   │
   ├─ Ele conhece tenant, workspace ou colaborador?
   │
   ├─ SIM ──────────────────────────► CENÁRIO 4 · criar no consumidor
   │
   └─ NÃO
      │
      ├─ O padrão visual já foi decidido? → DOMAIN_MODEL.md
      │
      ├─ SIM ───────────────────────► CENÁRIO 2 · criar no hywork-ui
      │
      └─ NÃO ───────────────────────► CENÁRIO 3 · decidir antes de criar
```


### Cenário 1 · O componente existe

O caso mais comum. Importe e use.

```tsx
import { Button, FilterBar, Badge } from "@hywork/ui/platform";
```

Nos arquivos já migrados, o caminho antigo continua funcionando — eles são
cascas de re-export:

```tsx
import { Button } from "@/components/ui/button";   // continua válido
```

**Não copie o componente para ajustar.** Se ele não atende, o caminho é o
cenário 5 — alterar no design system, para que a correção valha para todos.

**Não envolva o componente numa casca com estilo próprio.** `<div className="[...]"><Button/></div>`
para mudar aparência é a forma disfarçada de criar mais uma variante.


### Cenário 2 · Componente novo, genérico, padrão já decidido

Ele nasce no `hywork-ui`.

```bash
rtk git -C hywork-ui fetch origin develop
rtk git -C hywork-ui worktree add --no-track -b feat/<nome> \
    ../.worktrees/ui-<nome> origin/develop
cd ../.worktrees/ui-<nome> && ln -s ../../hywork-ui/node_modules node_modules
```

Na worktree, **nesta ordem**:

1. `src/<camada>/<nome>/<nome>.stories.tsx` — a story, **antes** do componente.
   Se ela fica confusa de escrever, a API está errada.
2. `src/<camada>/<nome>/index.tsx` — a implementação que a story pede.
3. `src/<camada>/<nome>/<nome>.test.tsx` — comportamento, foco, acessibilidade.
4. Exportar em `src/<camada>/index.ts`.

A camada: `core/` se os dois produtos concordam na anatomia; `platform/` ou
`builder/` se o padrão é de um só.

```bash
rtk npm run check && rtk npm run build
rtk git push -u origin feat/<nome>
```

Depois do merge na `develop`, publique a versão — cenário 6.


### Cenário 3 · Componente novo sem padrão decidido

Pare antes de escrever código.

O `DOMAIN_MODEL.md` registra os 18 padrões que a PO decidiu. Se o que você
precisa não está lá, **a decisão não é de quem implementa**.

1. Levante como o produto resolve isso hoje: quantas telas, quantas formas.
2. Separe o essencial (aparece em quase todas) do acidental (aparece numa só).
3. Leve à PO e ao design a comparação, não a sua preferência.
4. Registre a decisão em `DOMAIN_MODEL.md`, com data.
5. Aí sim, cenário 2.

Pular esta etapa é como o produto chegou a nove filtros diferentes.


### Cenário 4 · Componente de domínio

Fica no consumidor, sempre.

**Teste decisivo:** se ele sabe o que é um tenant, um workspace, um colaborador
ou uma campanha, ele é de domínio.

```
hywork-plataform/src/components/    TenantSwitcher · UserNav · AdminPanelLayout
hw-cloud-builder/components/        renderizadores estáticos · feed · reconhecimentos
```

Um componente de domínio **usa** os do design system por dentro — é assim que
ele fica alinhado sem subir para a biblioteca.

**Regra do segundo consumidor:** componente genérico que nasceu no consumidor só
sobe para o `hywork-ui` quando o **segundo** consumidor precisar do mesmo.
Subir na primeira vez congela uma API antes de se saber a forma certa.


### Cenário 5 · Alterar um componente existente

Aqui está a mudança maior de hábito: **a alteração não é no repositório onde a
tela está.**

```
tela com problema no Button
        │
        ├─ ❌ editar src/components/ui/button.tsx no Platform
        │     (é uma casca de re-export; o próximo desenvolvedor perde a mudança)
        │
        └─ ✅ alterar src/core/button/ no hywork-ui
              → a correção vale para toda tela dos dois produtos
```

O ciclo:

1. Worktree no `hywork-ui`, a partir de `origin/develop`.
2. Alterar o componente **e a story**, que passa a mostrar o novo estado.
3. Preservar a API pública. Ruptura vai no `CHANGELOG.md` com a versão.
4. `rtk npm run check && rtk npm run build`.
5. PR, merge na `develop`, tag.
6. Bump da versão nos consumidores — cenário 6.

### Componente derivado × autoral

As primitivas vieram de uma extração do Platform e são **regeneradas** a partir
de `provenance/`. Editar só a saída é perda garantida: a próxima derivação
apaga.

```
derivado   → altere a transformação em scripts/derive-platform.mjs
autoral    → altere o arquivo direto
```

Quando a PO decide um padrão visual para um componente, ele **deixa de ser
derivado**: entre em `authoredNames` no derive e a fonte da verdade passa a ser
a decisão, não a extração. Foi o que aconteceu com o `Badge`.

O `manifest.json` diz o status de cada um.


### Cenário 6 · Levar a mudança para os consumidores

**Nada se propaga sozinho.** Uma correção no design system só chega ao produto
quando alguém sobe a versão.

```
PR no hywork-ui
   → CI (tipos · bundle · axe · Playwright ×2)
   → merge na develop
   → tag v0.8.x                      ← aqui o pacote existe
   → PR no consumidor trocando a versão   ← passo manual, de propósito
   → preview da Vercel
   → merge
```

No consumidor:

```jsonc
"@hywork/ui": "github:hywork-br/hywork-ui#v0.8.1"
```

```bash
rtk npm install "github:hywork-br/hywork-ui#v0.8.1"
rtk next build          # confirme antes de abrir o PR
```

> **Atenção:** o npm guarda a resolução do git no lockfile. Só trocar a linha e
> rodar `npm install` pode servir a versão anterior do cache — instale passando
> a referência explícita, como acima, e confira o commit em `package-lock.json`.

**Os dois consumidores sobem na mesma sprint.** Atraso máximo tolerado: uma
minor, registrado no PR. Sem isso a divergência volta — desta vez por versão,
não por código.


### O que um agente deve fazer

Ordem de leitura antes de escrever qualquer UI:

| Passo | Arquivo | Para quê |
|---|---|---|
| 1 | `hywork-ui/DOMAIN_MODEL.md` | o padrão já foi decidido? |
| 2 | `hywork-ui/INDEX.md` | o componente já existe? |
| 3 | `hywork-ui/AGENTS.md` | isso entra aqui ou fica no consumidor? |
| 4 | este arquivo | qual cenário se aplica |

**Sinais de que a tarefa mudou de repositório.** O pedido menciona filtro, card,
listagem, tabela, modal, badge, abas, carrossel, estado vazio, carregamento,
rótulo, mensagem de erro, busca, upload, paginação ou trilha — nesses casos o
trabalho quase sempre é no `hywork-ui`, e não na tela.

**Sinais de que algo está errado no que você ia fazer:**

- ✋ criar um arquivo `*-filters.tsx` dentro de `_components/` de uma tela
- ✋ escrever `className="rounded-lg border bg-white p-4"` para montar um card
- ✋ usar cor literal (`bg-[#143748]`, `text-red-500`) em vez de token
- ✋ declarar `--primary`, `--background` ou qualquer `--hw-*` no `globals.css`,
  ou criar chave em `theme.extend.colors` — a cor do workspace entra por
  `brandThemeVars`, e cor que falta se pede aqui
- ✋ copiar um componente do design system para alterar
- ✋ adicionar a nona prop opcional num componente — a anatomia está errada
- ✋ editar um arquivo em `src/components/ui/` que é casca de re-export


### Verificação, por repositório

```bash
# hywork-ui
rtk npm run check && rtk npm run build

# hywork-plataform
rtk npm run lint && rtk vitest && rtk next build
```

O catálogo verde não prova cobertura de produto: cada fluxo migrado exige
evidência própria, com captura antes e depois nos mesmos dados, largura e tema.
