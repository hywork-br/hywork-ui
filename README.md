# @hywork/ui

Design system executável da Hywork: tokens de marca, componentes React e
padrões de produto para superfícies admin e portal.

## Entrega à engenharia — 17/09/2026

Versão de partida: **[v0.6.2](https://github.com/hywork-br/hywork-ui/releases/tag/v0.6.2)**,
commit `1c63b39178ef17e767878bdac1a16e6776ec676e`. O primeiro consumidor será
**`hywork-plataform`**, conforme decisão do Vitor em 17/09. O objetivo é
componentizar as telas existentes preservando seu visual, fluxo e tema do cliente.

Comece pelo [handoff do Platform](migration/platform-handoff.md): ele define o
primeiro PR, os responsáveis e a comparação antes/depois. O pacote está pronto
para avaliação e adoção gradual pela engenharia; isso não comprova paridade visual
com produção nem promove componentes `beta` ou `draft` automaticamente.

[Storybook](https://hywork-ui-storybook.vercel.app) é o catálogo do pacote.
[Experiments](https://hywork-experiments.vercel.app) demonstra propostas de jornadas
com dados locais; seus novos layouts e fluxos não fazem parte automaticamente da
adoção. Builder fica para uma etapa posterior.

Este handoff atualiza a documentação da branch principal. Os arquivos embarcados
na tag v0.6.2 são imutáveis e ainda contêm o planejamento anterior de outubro;
para a ordem de adoção, siga este guia. Nenhuma versão nova do pacote é criada
por esta atualização documental.

## Instalar

Distribuído por tag Git imutável, como `@hywork/eslint-config`:

```bash
npm install "github:hywork-br/hywork-ui#v0.6.2"
```

Fixe a tag e versione o lockfile do consumidor. React 18.3 ou 19 é peer dependency.

A instalação Git executa `prepare` → `build:lib` para gerar `dist/index.js` e
as declarações TypeScript a partir da revisão selecionada. Scripts de instalação
precisam estar habilitados; desabilitá-los não produz um pacote utilizável a
partir do Git. O preparo compila somente a biblioteca, sem construir o Storybook.
Tags anteriores a essa correção não ganham o novo preparo retroativamente: use
uma revisão/tag que contenha este contrato ou o tarball já compilado da release.

Esse preparo roda num sub-install do próprio npm. Se o `~/.npmrc` da máquina
tiver `allow-scripts=<pacote>`, o sub-install recebe a configuração como flag e
a instalação falha com `EALLOWSCRIPTS` (`--allow-scripts is not allowed in
project-scoped installs`), mesmo que o pacote listado ali não tenha nenhuma
relação com este — observado em npm 11.19.0 / Node 26.7.0, 15/09/2026. O
contorno é instalar com um userconfig isolado:

```bash
: > /tmp/npmrc-vazio
npm_config_userconfig=/tmp/npmrc-vazio \
  npm install "github:hywork-br/hywork-ui#v0.6.2"
```

Exportar `npm_config_allow_scripts=` vazio não resolve: o sub-install relê o
arquivo do usuário.

## Usar

Importe o tema uma única vez no CSS global e marque a superfície na raiz:

```css
@import "@hywork/ui/tokens/tema.css";
```

```html
<html data-surface="admin">
```

Carregue também Montserrat na aplicação: o tema declara a família, mas a aplicação
é responsável por disponibilizar a fonte. Depois, importe a API React:

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

### Outros exports draft

A v0.6.2 também publica seleção (`Checkbox`, `Radio`, `Switch`, `Combobox`,
`MultiSelect`), datas, upload, células e controles de coleção, feedback, navegação
e tema escopado. A lista completa e o status de cada export estão em
[`manifest.json`](manifest.json); publicação não equivale a promoção para `stable`.

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

`--hw-*` pertence ao design system; `--color-*` pertence à aplicação. O arquivo
publica defaults no namespace da aplicação; a ordem da cascata deve preservar
o tema do cliente. Ele não mapeia automaticamente as cores do tenant de volta
para os componentes que usam `--hw-*`. Conferir a integração e os portais no
fluxo real; ver [contrato de tema](governance/theme-validation.md).

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
tipagem e build da biblioteca. `smoke:consumer` primeiro instala uma revisão Git
temporária sem `dist`, verifica os entrypoints e importa a API; depois compila um
fixture Next + Tailwind v3 pela API publicada. `smoke:git` executa só a instalação
isolada, sem alterar o npmrc do usuário. Esse smoke nunca é chamado por `prepare`.
`npm run build` também compila o Storybook.

O toolbar do Storybook alterna `admin` e `portal`. As histórias em `Contracts/`
cobrem as 12 famílias; `Pilots/` compara TV, Assinaturas, Academy e Conteúdos
sem conexão com produto ou serviços externos.

Homologação publicada: [hywork-ui-storybook.vercel.app](https://hywork-ui-storybook.vercel.app).
O projeto Vercel é isolado dos produtos e mantém a proteção de acesso da equipe.

## Governança e migração

- decisões e ownership: [`governance/`](./governance/);
- contratos 10/10: [`specs/components/`](./specs/components/);
- inventário reproduzível: [`INVENTARIO.md`](./INVENTARIO.md);
- adoção pelo Platform e gates por fluxo: [`migration/`](./migration/);
- regras que viajam com o pacote: [`AGENTS.md`](./AGENTS.md).

Esta linha não migra nem publica nenhum produto. Changesets preparam a versão;
uma tag `v*` aprovada gera um tarball imutável no GitHub Release.
