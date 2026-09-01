# @hywork/ui

Design system executável da Hywork: tokens de marca, componentes React e
padrões de produto para superfícies admin e portal.

## Instalar

Distribuído por tag Git imutável, como `@hywork/eslint-config`:

```bash
npm install github:hywork-br/hywork-ui#v0.6.0
```

React 18.3 ou 19 é peer dependency.

## Usar

Importe o tema uma única vez no CSS global e marque a superfície na raiz:

```css
@import "@hywork/ui/tokens/tema.css";
```

```html
<html data-surface="admin">
```

Depois, importe a API React:

```tsx
import { Badge, Button, FilterBar, ListPage } from "@hywork/ui";
```

`admin` é denso para operação com mouse e teclado. `portal` usa controles e
texto maiores para leitura e toque. Cor, foco, estados e forma permanecem
compartilhados.

## O que a linha 0.6 publica

### Componentes beta

Button, Field/Input/Label, Textarea, Badge, Avatar, Skeleton, Card,
Dialog/AlertDialog, DropdownMenu/Popover, Tooltip, Select e Tabs.

### Padrões draft

- `ListPage`: cabeçalho, toolbar, contagem e estados de lista;
- `FilterBar`: busca, filtros do domínio e limpeza explícita;
- `DataTable`: semântica de tabela e ordenação nomeada;
- `AdminShell`: navegação e área de operação;
- `FocusMode`: fluxo fullscreen com saída nomeada e contenção de foco;
- `Stepper`: etapas concluídas, atual e futuras.

Padrão compartilhado não apaga a feature: filtros, células, ações, dados e
renderização de Academy, Conteúdos, TV, Assinaturas ou Campanhas continuam no
consumidor.

## As quatro camadas

| Camada | Fonte | Papel |
|---|---|---|
| Primitivos | `tokens/primitivos.css` | fatos da marca e derivados justificados |
| Semântica | `tokens/semantico.css` | papéis, contraste e estados |
| Superfície | `tokens/admin.css` · `tokens/portal.css` | densidade e ergonomia |
| Componentes | `tokens/componentes.css` · `src/` | API visual e interação |

Componentes consomem tokens semânticos. Hex fora de `primitivos.css` reprova o
CI.

## Tailwind

### v3

```ts
// tailwind.config.ts
presets: [require("@hywork/ui/tailwind/v3-preset.cjs")]
```

### v4

```css
@import "@hywork/ui/tokens/tema.css";
@import "@hywork/ui/tailwind/v4.css";
```

## White-label

Aplicações com tema de tenant importam também:

```css
@import "@hywork/ui/tokens/white-label.css";
```

`--hw-*` pertence ao design system; `--color-*` pertence à aplicação. O pacote
publica defaults, mas não sobrescreve a marca do cliente.

## Desenvolvimento

```bash
npm install
npm run storybook
npm run check
npm run smoke:consumer
npm run build
npm run audit:dependencies
```

`npm run check` executa guardas de token/manifesto, testes Node/React/Axe,
tipagem e build da biblioteca. `smoke:consumer` compila um fixture Next +
Tailwind v3 pela API publicada. `npm run build` também compila o Storybook.

O toolbar do Storybook alterna `admin` e `portal`. As histórias em `Contracts/`
cobrem as 12 famílias; `Pilots/` compara TV, Assinaturas, Academy e Conteúdos
sem conexão com produto ou serviços externos.

Homologação publicada: [hywork-ui-storybook.vercel.app](https://hywork-ui-storybook.vercel.app).
O projeto Vercel é isolado dos produtos e mantém a proteção de acesso da equipe.

## Governança e migração

- decisões e ownership: [`governance/`](./governance/);
- contratos 10/10: [`specs/components/`](./specs/components/);
- inventário reproduzível: [`INVENTARIO.md`](./INVENTARIO.md);
- pacote de adoção para outubro: [`migration/`](./migration/);
- regras que viajam com o pacote: [`AGENTS.md`](./AGENTS.md).

Esta linha não migra nem publica nenhum produto. Changesets preparam a versão;
uma tag `v*` aprovada gera um tarball imutável no GitHub Release.
