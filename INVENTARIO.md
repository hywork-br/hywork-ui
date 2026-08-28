# Inventário de componentes

Cruzamento entre o catálogo público do `shadcn-ui/ui` e o que os frontends da
Hywork já executam, para responder a uma pergunta só: **o que vale consolidar
neste pacote.**

- **Fonte shadcn:** `github.com/shadcn-ui/ui` @ `ee628d75`
- **Consumidores:** `hywork-plataform` @ `f7fa653`, `hw-cloud-builder` @ `17e742e`
- **Medido em:** 25/08/2026. **Completo.**

> **Decidido durante este levantamento:** o alvo é a **geração nova, em Tailwind
> v4**, e a primeira leva já está no pacote (`button`, `input`, `label`, `badge`
> — ver `CHANGELOG` 0.6.0). Os três papéis ausentes apontados abaixo — `accent`,
> `popover`, `card` — **foram declarados**; os dois ambíguos foram resolvidos
> por reuso, sem token novo.

Números aqui são contados por script sobre o repositório clonado, não estimados.

---

## Resumo para quem tem pressa

0. **Os dois consumidores estão em Tailwind v3.4.1, geração clássica, Radix.**
   A camada de componentes da 0.6.0 é v4: migrar o consumidor é pré-requisito
   para usá-la. Dos 61 componentes clássicos, **32 estão nos dois**, e **17
   desses divergem entre si** — a mesma peça mantida duas vezes, diferente.
   Nenhum dos 32 é o upstream intocado.
1. **Existem duas gerações de shadcn no mesmo repositório**, e elas se portam de
   maneiras completamente diferentes. Descobrir em qual cada consumidor está é a
   primeira pergunta do inventário, não um detalhe.
2. **A geração nova separa componente de estilo** — e essa costura é exatamente
   o encaixe que este design system precisa: o estilo vira **um arquivo CSS**,
   não 62 componentes reescritos.
3. **Mas a geração nova é Tailwind v4 puro.** Se o produto está em v3, ela não
   entra sem migrar o consumidor antes.
4. **Três papéis de cor que o shadcn assume não existem aqui** (`accent`,
   `popover`, `card`). Não é tradução pendente — é token faltando, e entra por
   decisão humana.

---

## As duas gerações

| | Geração clássica | Geração nova (jan/2026) |
|---|---|---|
| Caminho | `apps/v4/registry/new-york-v4/ui/` | `apps/v4/registry/bases/{base,radix,aria}/ui/` |
| Componentes | 61 | 62 · 61 · 59 |
| Onde mora o estilo | **inline no `.tsx`**, via `cva` | **num CSS separado**, `registry/styles/style-*.css` |
| Headless | Radix | Base UI · Radix · React Aria |
| Tailwind | v3-ish | **v4 obrigatório** |

### Como o mesmo botão se parece nas duas

Clássica — o estilo está preso ao componente:

```tsx
variant: {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
}
```

Nova — o componente só nomeia o papel; quem pinta é a folha de estilo:

```tsx
variant: {
  default: "cn-button-variant-default",
  outline: "cn-button-variant-outline",
}
```

```css
/* registry/styles/style-nova.css */
.cn-button-variant-default { @apply bg-primary text-primary-foreground hover:bg-primary/80; }
```

**Por que isso importa aqui:** na geração nova, o shadcn publica **8 folhas de
estilo intercambiáveis** (`luma`, `lyra`, `maia`, `mira`, `nova`, `rhea`, `sera`,
`vega`) sobre os mesmos componentes. É uma costura de tema já pronta — a Hywork
seria a nona folha. O porte deixa de ser "reescrever 62 componentes" e vira
"escrever `style-hywork.css`", com o `.tsx` vindo do upstream praticamente
verbatim, e rebase futuro possível.

### O custo que vem junto: v4 obrigatório

As folhas de estilo (~1.750 linhas cada) são Tailwind v4 de ponta a ponta.
Contagem de sintaxe que **o v3 não compila**, somando as 8 folhas:

| Sintaxe | Ocorrências |
|---|---|
| `dark:` | 650 |
| `aria-invalid:` | 494 |
| `data-open:` | 484 |
| `has-data-[…]` | 442 |
| `data-closed:` | 368 |
| `**:data-[…]` (variante descendente) | 176 |
| `in-data-[…]` | 80 |
| `color-mix(in oklch, …)` | 24 |
| `not-last:` | 8 |

O README deste pacote indica **produto em v3 e Labs em v4**. Se isso se
confirmar no inventário, a geração nova não serve ao produto hoje — e a escolha
real é entre portar a geração clássica agora ou migrar o consumidor para v4
primeiro. Essa decisão é humana e não está tomada.

---

## Catálogo: 63 componentes

União das quatro árvores. **58 existem em todas as quatro** — esse é o núcleo
estável, e é dele que sai qualquer primeira leva:

```
accordion · alert · alert-dialog · aspect-ratio · attachment · avatar · badge
breadcrumb · bubble · button · button-group · calendar · card · carousel · chart
checkbox · collapsible · combobox · command · context-menu · dialog · direction
drawer · dropdown-menu · empty · field · hover-card · input · input-group
input-otp · item · kbd · label · marker · message · message-scroller
native-select · pagination · popover · progress · radio-group · resizable
scroll-area · select · separator · sheet · sidebar · skeleton · slider · sonner
spinner · switch · table · tabs · textarea · toggle · toggle-group · tooltip
```

Os 5 restantes, que é onde as árvores divergem:

| Componente | base | radix | aria | clássica | |
|---|:--:|:--:|:--:|:--:|---|
| `menubar` | ✓ | ✓ | · | ✓ | Aria ainda não tem |
| `navigation-menu` | ✓ | ✓ | · | ✓ | Aria ainda não tem |
| `toast` | ✓ | · | · | · | novo, só Base UI (as quatro têm `sonner`) |
| `questionnaire` | ✓ | ✓ | ✓ | · | novo na geração nova |
| `form` | · | · | · | ✓ | **removido** na geração nova — virou `field` |
| **Total** | **62** | **61** | **59** | **61** | |

Duas leituras que importam:

- Entre as três variantes novas o roster é praticamente o mesmo, então
  **catalogar as três dá no mesmo**. A escolha de headless é decisão de stack,
  não de catálogo, e pode esperar.
- **`form` → `field` é a única remoção**, e é a que morde num porte: consumidor
  que usa `<Form>` com `react-hook-form` não tem equivalente direto na geração
  nova. Se platform ou builder usam `form`, isso é migração de código de tela,
  não troca de componente.

---

## O contrato de cor: shadcn × `@hywork/ui`

Papéis de cor que os componentes da geração clássica consomem, por frequência
(61 arquivos), cruzados com o que a camada semântica deste pacote publica:

| Papel shadcn | Usos | Token daqui | Situação |
|---|--:|---|---|
| `destructive` | 78 | `--hw-danger` / `--hw-danger-strong` | ✅ traduz |
| `muted-foreground` | 63 | `--hw-text-muted` | ✅ traduz |
| `ring` | 47 | `--hw-focus` (+ `-width`, `-offset`) | ✅ traduz, e **melhora** |
| `accent` + `accent-foreground` | 79 | — | ❌ **token faltando** |
| `input` | 33 | `--hw-border` | ⚠️ aproximação |
| `foreground` | 32 | `--hw-text` / `--hw-surface-fg` | ✅ traduz |
| `primary` + `primary-foreground` | 41 | `--hw-primary` / `--hw-primary-fg` | ✅ traduz |
| `muted` (fundo) | 28 | `--hw-surface-subtle` ou `--hw-neutral-soft` | ⚠️ ambíguo |
| `background` | 24 | `--hw-surface` | ✅ traduz |
| `border` | 23 | `--hw-border` | ✅ traduz |
| `popover` + `popover-foreground` | 27 | — | ❌ **token faltando** |
| `sidebar*` (6 variações) | 49 | `--hw-chrome` / `--hw-chrome-fg` | ⚠️ cobre 2 de 6 |
| `secondary` + `secondary-foreground` | 9 | `--hw-secondary` / `--hw-secondary-fg` | ✅ traduz |
| `card` + `card-foreground` | 8 | — | ❌ **token faltando** |

### Três decisões que precisam de gente

`accent`, `popover` e `card` não são tradução pendente — são **papéis que este
design system nunca declarou**. Pelo `AGENTS.md`, a saída não é inventar em
silêncio. Cada um precisa entrar por PR com o papel escrito, ou o componente que
depende dele fica fora da primeira leva:

- **`accent`** (79 usos, o mais frequente de todos) — é o fundo de *hover* e de
  item ativo em menu, dropdown, command, sidebar. Sem ele, quase todo componente
  de navegação fica sem estado de hover. É o mais urgente.
- **`popover`** (27 usos) — superfície flutuante. Hoje resolveria em
  `--hw-surface`, mas aí popover e página têm o mesmo fundo, e o que separa os
  dois vira só a sombra.
- **`card`** (8 usos) — superfície de cartão. Mesmo caso.

Dois papéis ambíguos, que também são decisão e não tradução: **`input`** (o
shadcn distingue a borda de campo da borda geral; aqui é uma só) e **`muted`
como fundo** (`--hw-surface-subtle` é azulado, `--hw-neutral-soft` é cinza — são
intenções diferentes).

### A armadilha da opacidade

A geração clássica usa modificador de opacidade **114 vezes**
(`hover:bg-primary/90`, `ring-ring/50`, `bg-destructive/10`…). O preset v3 deste
pacote publica cor como string `var(--hw-primary)` crua, **sem o placeholder
`<alpha-value>`** — então esses 114 usos não se comportam como no upstream.

Onde existe token dedicado (`--hw-primary-hover`), a tradução é direta e fica
melhor que o original. Onde não existe (`bg-destructive/10`, `ring-ring/50`), é
token novo ou `color-mix` à mão. **Isto precisa de build real para confirmar o
comportamento exato antes de portar em série** — é a mesma classe de falha
silenciosa que o `CHANGELOG` já registra: propriedade que resolve vazia sem
quebrar build nem lint.

### Por que não um shim de compatibilidade

A tentação óbvia é publicar `--background`, `--ring`, `--radius` etc. mapeados
para `--hw-*`, e deixar os componentes caírem sem edição. Duas razões para não:

1. Cria um **segundo vocabulário** para as mesmas decisões — literalmente o que
   o `AGENTS.md` descreve como origem de "uma dúzia de versões do mesmo
   componente".
2. Os nomes do shadcn são **nus** (`var(--secondary)`, `var(--radius-md)`,
   confirmado nas folhas de estilo). Namespace nu pertence à **aplicação**, e em
   produto white-label é onde a cor do cliente é aplicada em runtime.
   Reivindicá-lo aqui apaga a marca do cliente conforme a ordem dos imports —
   o contrato em `tokens/white-label.css` existe justamente por isso.

---

## Os consumidores

Medido em 25/08/2026 sobre `hywork-plataform` @ `f7fa653` e `hw-cloud-builder`
@ `17e742e`.

| | platform | builder |
|---|---|---|
| Tailwind | **3.4.1** | **3.4.1** |
| React · Next | 18.3 · 14.2.11 | 18 · 14.2.11 |
| Geração shadcn | clássica | clássica |
| Headless | Radix | Radix |
| Arquivos em `components/ui` | 74 | 55 |

### ⚠️ Os dois estão em v3

Isto responde, com número, a pergunta que estava em aberto quando a primeira
metade deste documento foi escrita — e responde contra a camada de componentes
que a 0.6.0 entregou: **ela é v4, e nenhum dos dois consumidores é v4 hoje.**

Não é acidente, é a ordem escolhida (registrada no `CHANGELOG` 0.6.0), mas o
custo agora está medido em vez de estimado: **migrar o consumidor para Tailwind
v4 é pré-requisito de consumir qualquer componente daqui**, e não há caminho
mais curto — a folha de estilo do shadcn usa ~2.700 construções que o v3 não
compila.

### A matriz

Contra os **61** componentes da geração clássica:

| | |
|---|--:|
| Presentes nos **dois** | **32** |
| Só no platform | 2 (`carousel`, `sidebar`) |
| Só no builder | 0 |
| Em nenhum dos dois | 27 |

**Nenhum dos 32 é o upstream intocado.** Todos divergem do shadcn — o que
significa que "atualizar do upstream" já não é uma operação disponível em
nenhum dos dois repositórios. É o problema que esta camada existe para resolver.

E **17 dos 32 divergem também entre si** — a mesma peça, mantida duas vezes,
diferente. É o sinal mais valioso do inventário, porque é onde o custo já está
sendo pago em duplicado:

| Componente | platform | builder |
|---|--:|--:|
| `input` | 1375 b · 144 usos | 728 b · 14 usos |
| `avatar` | 1333 b · 33 usos | 4619 b · 36 usos |
| `select` | 4823 b · 40 usos | 4186 b · 3 usos |
| `dropdown-menu` | 7386 b · 32 usos | 6943 b · 12 usos |
| `slider` | 1374 b · 38 usos | 990 b · 0 usos |
| `button` | 1868 b · 209 usos | 1625 b · 66 usos |
| `badge` | 1360 b · 79 usos | 1125 b · 11 usos |
| `alert` · `dialog` · `pagination` · `popover` · `progress` · `skeleton` · `switch` · `table` · `tabs` · `textarea` | | |

### O que mais se usa, somando os dois

```
 275  button        158  input         114  label         90  badge
  89  dialog         83  switch         82  card          69  avatar
  59  accordion      44  dropdown-menu  43  select        41  skeleton
```

**A primeira leva da 0.6.0 — `button`, `input`, `label`, `badge` — é exatamente
o topo desta lista.** Foi escolhida antes deste levantamento existir, por serem
"os óbvios"; o inventário confirma a escolha por outro caminho. E três dos
quatro (`button`, `input`, `badge`) estão na tabela de divergência acima, ou
seja: são peças onde a duplicação já custa.

### Duas coisas que mudam escopo

- **`form` é usado nos dois** (19 no platform, 2 no builder). É o único
  componente que a geração nova **removeu** — virou `field`. Migrar isso é
  mexer em código de tela com `react-hook-form`, não trocar um componente.
- **`breadcrumb` existe nos dois e tem zero import.** Scaffold morto: presença
  de arquivo não é sinal de uso, e é por isso que este inventário conta import
  em vez de contar arquivo.

### O que não existe em nenhum dos dois

27 do catálogo, entre eles os que arrastam dependência pesada (`chart`,
`combobox`, `calendar`, `drawer`, `resizable`) e os que são novos da geração de
2026 (`attachment`, `bubble`, `empty`, `field`, `item`, `kbd`, `marker`,
`message`, `message-scroller`, `input-group`, `button-group`). Nenhum deles é
candidato a consolidação — não há o que consolidar.

E a coluna de veredito por componente: `consolidar` · `só um usa` · `divergiu` ·
`não usado` · `ausente nos dois`.

---

## Como reproduzir

```bash
git clone --depth 1 --filter=blob:none --sparse https://github.com/shadcn-ui/ui
cd ui && git sparse-checkout set apps/v4/registry

# roster por variante
for v in base radix aria; do
  ls apps/v4/registry/bases/$v/ui/*.tsx | xargs -n1 basename | sed 's/\.tsx$//'
done

# papéis de cor na geração clássica
grep -ohE '(bg|text|border|ring|fill|stroke|outline)-(background|foreground|card|popover|primary|secondary|muted|accent|destructive|border|input|ring|sidebar)(-[a-z]+)*(/[0-9]+)?' \
  apps/v4/registry/new-york-v4/ui/*.tsx | sort | uniq -c | sort -rn
```
