# Hywork UI

Design system para o **hywork-plataform**. O produto existente é a referência de
fluxos e comportamento; seu código não é, por si só, um design system.
Esta biblioteca organiza primitivas reutilizáveis, tokens e critérios de acabamento.

## Estado

Versão em preparação: **0.7.0**. São 28 famílias extraídas da revisão
`85a66bafd8020697f694366e1937c6379d8663fc` do Platform, consultada em 17/09/2026.
Procedência e hashes: [manifest.json](manifest.json).
Isso não prova a revisão implantada em produção nem significa que o produto já foi migrado.

O lote cobre controles, apresentação de dados e sobreposições genéricas. Regras de
negócio, páginas, navegação de aplicação, autenticação e requisições ficam no Platform.

## Para engenharia

1. Leia o [guia visual](docs/design-guide.md) e o [handoff](docs/platform-handoff.md).
2. Instale um artefato desta revisão, nunca uma branch flutuante.
3. Use os componentes exportados em [src/index.ts](src/index.ts), o CSS de tokens e o preset Tailwind 3.
4. Migre um fluxo de cada vez, mantendo props, tema do cliente e comportamento.
5. Compare a tela real antes/depois; o catálogo não substitui essa validação.

```tsx
import { Button, Input, Label } from "@hywork/ui";
import "@hywork/ui/tokens/platform.css";

export function NameField() {
  return <div>
    <Label htmlFor="name">Nome</Label>
    <Input id="name" />
    <Button type="submit">Salvar</Button>
  </div>;
}
```

## Desenvolvimento

```sh
npm ci
npm run check
npm run build
npm run test:browser
npm run smoke:consumer
npm run storybook
```

`npm run derive` regenera componentes, tokens, preset e manifesto a partir da
referência fixada em `provenance/platform/`. Alterações deliberadas de design precisam
ser explícitas, testadas e documentadas; nunca recapture a origem para esconder uma diferença.

[Inventário](INVENTARIO.md) · [Contribuição](CONTRIBUTING.md) · [Mudanças](CHANGELOG.md)
