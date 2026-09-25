# Contexto Técnico

## Stack

| Camada | Tecnologia | Versão |
|---|---|---|
| Biblioteca alvo | React (peer dependency) | >=18.3 <20 |
| Linguagem | TypeScript | 5.9 |
| Primitivos acessíveis | Radix UI | conforme `package.json` |
| Estilização | Tailwind CSS (via preset) | 3.4 |
| Variantes | class-variance-authority + tailwind-merge | 0.7 / 2.6 |
| Bundler | tsup (ESM + dts) | 8.5 |
| Catálogo | Storybook + addon-a11y + addon-docs | 10.5 |
| Testes unitários | Vitest + Testing Library | 4.1 |
| Testes de navegador | Playwright (Chromium, Firefox) | 1.63 |
| Ícones | lucide-react | 0.454 |

As versões do React, Tailwind, Radix e lucide acompanham as dos consumidores.
Subir qualquer uma delas aqui exige subir nos dois fronts na mesma sprint.

## Build e distribuição

```
src/platform.ts ─┐
src/builder.ts  ─┴─ tsup ──► dist/  (ESM + .d.ts + sourcemap)
                             │
                             └─ npm pack ──► tarball no GitHub Release (tag v*)
```

Configuração relevante do `tsup`:

| Opção | Valor | Por quê |
|---|---|---|
| `format` | `["esm"]` | permite tree-shaking no consumidor |
| `external` | `react`, `react-dom` | evita dois Reacts no bundle (erro de hooks) |
| `dts` | `true` | gera as declarações consumidas pelo editor |
| `banner` | `"use client"` | o App Router exige para componente com estado |
| `splitting` | `true` | separa em chunks por entrada |

**Consequência do banner:** todo componente vindo do pacote é client component,
inclusive os que hoje renderizam no servidor nos consumidores. Não quebra;
aumenta o JS enviado. Se virar problema, criar entradas separadas para os
componentes server-safe.

## O pacote não vai para o npm

`private: true` bloqueia `npm publish`. O consumo é por versão fixa:

```jsonc
"@hywork/ui": "github:hywork-br/hywork-ui#v0.8.0"
```

Funciona porque o repositório é público e tem `prepare` (o npm roda o build ao
instalar de git). Alternativas: tarball do Release ou GitHub Packages — esta
exige token no CI e na Vercel.

## Tokens e Tailwind

O pacote entrega **JavaScript com strings de classe**, não CSS. Quem gera o CSS
é o Tailwind do consumidor, e ele não varre `node_modules` por padrão:

```ts
content: [..., "./node_modules/@hywork/ui/dist/**/*.js"]   // sem isto: sem estilo
```

Os presets definem as cores com duplo fallback —
`hsl(var(--primary, var(--hw-color-primary-default)))` — de modo que a variável
da aplicação vence o default da biblioteca. É o que preserva o tema do cliente.

## CI

`.github/workflows/ci.yml` em cada PR e push na `main`:

| Job | O que roda |
|---|---|
| `quality` | `npm run check` · `smoke:consumer` · `build` · `npm audit --audit-level=high` |
| `browser` | Playwright em Chromium e Firefox, com artefatos de evidência |

`release.yml` dispara em tag `v*`: roda os gates, `npm pack` e cria o Release.

## Ambientes

Os dois Storybooks são publicados pela Vercel a partir de `storybook-static/`,
em `/platform` e `/builder`. Não há backend, banco nem variável de ambiente
secreta neste repositório.
