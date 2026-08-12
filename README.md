# @hywork/ui

Design system da Hywork. Nesta versão: **só tokens** — cor, tipografia,
espaçamento, movimento e densidade por superfície, em CSS variables puras.

Sem componente ainda, e isso é de propósito: o primeiro passo é os três
frontends falarem a mesma língua de cor. Componente vem quando houver o que
consolidar.

## Instalar

Distribuído por **tag git**, como o `@hywork/eslint-config`. Sem npm registry.

```bash
npm i github:hywork-br/hywork-ui#v0.1.0
```

## Usar

No CSS global da aplicação:

```css
@import "@hywork/ui/tokens/tema.css";
```

E no elemento raiz, declare qual superfície é esta aplicação:

```html
<html data-superficie="admin">   <!-- ou "portal" -->
```

Pronto. As variáveis estão disponíveis em qualquer lugar:

```css
.meu-botao {
  background: var(--color-primary);
  color: var(--color-primary-fg);
  border-radius: var(--raio-controle);
  min-height: var(--altura-controle);
  transition: background var(--hw-duracao-media) var(--hw-easing-padrao);
}
```

### Tailwind v4 (opcional)

Quem está em v4 pode importar a ponte e ganhar os utilitários automáticos
(`bg-primary`, `text-texto-suave`, `rounded-md`):

```css
@import "@hywork/ui/tokens/tema.css";
@import "@hywork/ui/tokens/tailwind-v4.css";
```

Quem está em **v3 não importa nada disso** — usa as variáveis direto, ou as
referencia no `tailwind.config.ts`:

```ts
colors: {
  primary: "var(--color-primary)",
  // ...
}
```

## As três camadas

| Camada | Arquivo | O que é | Muda quando |
|---|---|---|---|
| Primitivos | `primitivos.css` | as 12 cores da marca + escalas | a marca mudar |
| Semântica | `semantico.css` | que papel cada primitivo faz | uma decisão de produto mudar |
| Superfície | `admin.css` · `portal.css` | densidade e tamanho | quase nunca |

A separação existe por um motivo prático: **trocar a cor primária do produto
inteiro é editar uma linha da camada semântica.** Nenhuma tela é reescrita.

Componentes consomem **só a camada semântica**. Se um componente referencia
`--hw-blue-mid` direto, ele está pulando a decisão e vai divergir na primeira
mudança.

## Superfícies

O produto tem duas, com ergonomias diferentes:

- **admin** — quem administra a comunicação. Denso: alvo de 32px, corpo 14px.
- **portal** — o colaborador, muitas vezes no celular. Confortável: alvo de
  44px, corpo 16px.

Elas mudam **densidade e tamanho**. Nunca cor, forma ou papel semântico — isso é
comum às duas, e bifurcar ali é como se acabam com dois design systems.

## Verificar

```bash
npm run check
```

Silencioso quando está tudo certo. Ele pega hex escrito fora da camada de
primitivos, referência a token inexistente, e **contraste abaixo do piso WCAG
nos pares declarados** — ou seja, se alguém trocar a primária por uma cor que
reprova, o CI avisa antes do usuário.

## Regras para agentes

Estão em [`AGENTS.md`](./AGENTS.md), e viajam com o pacote de propósito: regra
que mora em um repositório só não protege os outros.

## Decisão em aberto

A **cor primária do tema default** está marcada em `semantico.css`. Hoje é o
azul que o produto já executa; o guideline de marca aponta o laranja. Trocar é
editar quatro linhas — e é assim que se sabe que a camada semântica está
fazendo o trabalho dela.

O cliente white-label sobrescreve `--color-primary` em runtime. O que está aqui
é o default, não a única resposta.
