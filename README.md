# @hywork/ui

Design system da Hywork: **tokens** — cor, tipografia, espaçamento, movimento e
densidade por superfície, em CSS variables puras — e, desde a 0.6.0, uma
**primeira leva de componentes**.

Os tokens servem a todo mundo. Os componentes, hoje, **só a quem está em
Tailwind v4** — o que significa o Labs, não o produto. Isso é escolha, não
esquecimento: está explicado em [Componentes](#componentes).

## Instalar

Distribuído por **tag git**, como o `@hywork/eslint-config`. Sem npm registry.

```bash
npm i github:hywork-br/hywork-ui#v0.5.0
```

## Usar

No CSS global da aplicação:

```css
@import "@hywork/ui/tokens/tema.css";
```

E no elemento raiz, declare qual superfície é esta aplicação:

```html
<html data-surface="admin">   <!-- ou "portal" -->
```

Pronto:

```css
.meu-botao {
  background: var(--hw-primary);
  color: var(--hw-primary-fg);
  border-radius: var(--hw-control-radius);
  min-height: var(--hw-control-height);
  transition: background var(--hw-duration-base) var(--hw-ease-standard);
}
```

### Tailwind v3 (o produto, hoje)

Use o preset — ele é **gerado** da camada semântica, então não desatualiza:

```ts
// tailwind.config.ts
presets: [require("@hywork/ui/tailwind/v3-preset.cjs")],
```

Junto com o `@import` do tema no CSS global. Aí `bg-primary`, `text-text-muted`
e `rounded-md` funcionam.

### Tailwind v4 (o Labs)

```css
@import "@hywork/ui/tokens/tema.css";
@import "@hywork/ui/tailwind/v4.css";
```

## Componentes

Quatro, por ora: `Button`, `Input`, `Label` e `Badge`. Vêm do
[`shadcn-ui/ui`](https://github.com/shadcn-ui/ui) `@ee628d75`, variante Base UI.

```tsx
import { Button } from "@hywork/ui/componentes/ui/button";
```

```css
@import "@hywork/ui/tokens/tema.css";
@import "@hywork/ui/tailwind/v4.css";
@import "@hywork/ui/tailwind/style-hywork.css";
```

Três coisas que economizam uma tarde:

1. **Tailwind v4 obrigatório.** Desde jan/2026 o shadcn separa componente de
   estilo, e a folha usa sintaxe que o v3 não compila. Por isso o produto (v3)
   ainda não consome esta camada — ele entra quando migrar. O
   [`INVENTARIO.md`](./INVENTARIO.md) tem a conta.
2. **Consumidor Next.js precisa de `transpilePackages: ["@hywork/ui"]`.** A
   distribuição é TSX fonte, e sem isso o bundler não transpila o que está em
   `node_modules`.
3. **As dependências são `peerDependencies` opcionais** — `react`,
   `@base-ui/react`, `class-variance-authority`, `clsx`, `tailwind-merge`. São
   opcionais para quem usa só tokens não ser obrigado a instalar React; se você
   importa componente, instale-as.

### Onde estes componentes divergem do shadcn

Cada arquivo traz o porquê no cabeçalho. O resumo:

| O quê | Aqui | Por quê |
|---|---|---|
| Altura | `var(--hw-control-height)` | 36px no admin, 48px no portal, **sem prop** |
| Foco | `outline` com `--hw-focus-*` | o `ring-ring/50` do upstream reprova o piso de 3:1 da WCAG 2.4.11 |
| Hover | token (`bg-primary-hover`) | decisão declarada, não `bg-primary/80` calculado |
| Borda de campo | `--hw-border-strong` | `--hw-border` dá 1,23:1 e reprova a WCAG 1.4.11 |
| `dark:` | removido | esta camada não tem modo escuro; apontar para token inexistente some sem erro |
| Tamanhos `xs`/`lg` | fora | a superfície declara duas alturas; inventar as outras furaria o `--hw-target-min` |

A guarda dessas regras é o `npm run check` — ele reprova vocabulário do shadcn
que não publicamos, opacidade sobre cor de token, `var()` com nome nu e altura
fixa em controle.

### White-label (aplicação com tema de cliente)

```css
@import "@hywork/ui/tokens/white-label.css";
```

Só em aplicação onde o cliente escolhe as próprias cores. Ver o contrato logo
abaixo.

## As três camadas

| Camada | Arquivo | O que é | Muda quando |
|---|---|---|---|
| Primitivos | `primitivos.css` | as 12 cores da marca + escalas | a marca mudar |
| Semântica | `semantico.css` | que papel cada primitivo faz | uma decisão de produto mudar |
| Superfície | `admin.css` · `portal.css` | densidade e tamanho | quase nunca |

A separação existe por um motivo prático: **trocar a cor primária do produto
inteiro se resolve na camada semântica — nenhuma tela é reescrita.** Quantas
linhas é outra pergunta, e ela está respondida com número no bloco da primária
em `semantico.css`: são quatro linhas ali, mais a secundária (que colide), mais
uma por consumidor que espelha a camada em código.

Componentes consomem **só a camada semântica**. Componente que referencia
`--hw-blue-mid` direto está pulando a decisão e vai divergir na primeira
mudança.

## Superfícies

O produto tem duas, com ergonomias diferentes:

- **admin** — quem administra a comunicação. Denso: alvo de 32px, corpo 14px.
- **portal** — o colaborador, muitas vezes no celular. Confortável: alvo de
  44px, corpo 16px.

Elas mudam **densidade e tamanho**. Nunca cor, forma ou papel semântico — isso é
comum às duas, e bifurcar ali é como se acabam com dois design systems.

## Namespace: `--hw-*` e `--color-*`

Regra que evita um bug visível para o cliente:

| Prefixo | Dono | Quem escreve |
|---|---|---|
| `--hw-*` | o design system | só este repositório |
| `--color-*` | a aplicação | o tema do tenant, em runtime |

No produto white-label o cliente escolhe as próprias cores, aplicadas em runtime
sob `--color-*`. Se o design system
reivindicasse esse namespace, importar os tokens depois do tema do cliente
**apagaria a marca dele** — e o que decidiria isso seria a ordem dos imports.

`tokens/white-label.css` faz a ponte explícita: publica o default do design
system em `--color-*`, de onde o tenant sobrescreve por cima.

⚠️ A cor escolhida pelo cliente **não passa** pelo nosso check de contraste —
ela chega do banco, em runtime. Validar no cadastro do tema é trabalho da
aplicação, e hoje não existe.

## Verificar

```bash
npm run check
```

Silencioso quando está tudo certo. Ele pega:

- hex escrito fora da camada de primitivos;
- referência a token inexistente, e **auto-referência** (`--x: var(--x)`), que
  não quebra build nenhum e deixa a propriedade vazia em runtime;
- **contraste abaixo do piso WCAG** nos pares declarados — se alguém trocar a
  primária por uma cor que reprova, o CI avisa antes do usuário. Par que não
  resolve é falha dura: par não verificado é pior que par reprovado;
- **as duas pontes** desatualizadas em relação à camada semântica. São duas —
  preset do v3 e tema do v4 — e as duas são geradas: foi mantendo o v4 à mão que
  ele ficou 34 tokens atrás sem ninguém notar;
- **vocabulário alheio na camada de componentes** — utility do shadcn que não
  publicamos (`bg-background`, `ring-ring`, `border-input`…), cor com
  modificador de opacidade, `var()` com nome nu e altura fixa em controle.

O que ele **não** cobre, e vale saber: os componentes não são typechecked no
CI. Rodar `tsc` exigiria instalar dependências num pacote que hoje se verifica
com zero instalação, e essa troca é decisão do mantenedor. Foram conferidos à
mão contra `@base-ui/react` 1.6 quando entraram.

## Regras para agentes

Estão em [`AGENTS.md`](./AGENTS.md), e viajam com o pacote de propósito: regra
que mora em um repositório só não protege os outros.

## A primária é o azul (decidido 13/08/2026, por ora)

A **cor primária do tema default** é o azul que o produto já executa. A
alternativa era o laranja do guideline de marca, e a decisão é **revisável** —
"por ora" está no registro de propósito. O valor não mudou nesta versão; o que
mudou é que ele deixou de estar em aberto.

O raciocínio e o custo de uma troca futura moram no bloco da primária em
`tokens/semantico.css`, medidos em vez de estimados. Duas coisas que vale saber
antes de propor a troca:

- **O check não decide isso por você.** O laranja no lugar da primária deixa
  `npm run check` verde: o par do botão é medido contra 3,0:1 e o laranja dá
  3,73:1. A primária como texto pequeno não é par declarado.
- **A troca não é local.** O laranja colide com `--hw-secondary` e
  `--hw-focus`, que já são a mesma cor da marca.
