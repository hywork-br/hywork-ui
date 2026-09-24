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

### Três armadilhas conhecidas

**① O CSS não vem pronto.** O pacote entrega JavaScript contendo strings de
classe, não CSS. Quem gera o CSS é o Tailwind do consumidor — e ele não olha
dentro de `node_modules` por padrão. Sem a linha de `content` acima, o
componente renderiza, funciona e aparece sem formatação nenhuma.

**② Chaves duplicadas vencem o preset.** Se o consumidor redefine `colors`,
`spacing` ou `borderRadius` em `theme.extend`, essas definições vencem o preset
e ele fica inerte. Remover as duplicatas é o que faz o preset valer — e é
mudança visual de verdade, que pede validação por captura.

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
