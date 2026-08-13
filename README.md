# @hywork/ui

Design system da Hywork. Nesta versão: **só tokens** — cor, tipografia,
espaçamento, movimento e densidade por superfície, em CSS variables puras.

Sem componente ainda, e isso é de propósito: o primeiro passo é os três
frontends falarem a mesma língua de cor. Componente vem quando houver o que
consolidar.

## Instalar

Distribuído por **tag git**, como o `@hywork/eslint-config`. Sem npm registry.

```bash
npm i github:hywork-br/hywork-ui#v0.3.0
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
inteiro é editar uma linha da camada semântica.** Nenhuma tela é reescrita.

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
- preset do v3 desatualizado em relação à camada semântica.

## Regras para agentes

Estão em [`AGENTS.md`](./AGENTS.md), e viajam com o pacote de propósito: regra
que mora em um repositório só não protege os outros.

## Decisão em aberto

A **cor primária do tema default** está marcada em `semantico.css`. Hoje é o
azul que o produto já executa; o guideline de marca aponta o laranja. Trocar é
editar quatro linhas — e o check reprova se o par de contraste não passar.
