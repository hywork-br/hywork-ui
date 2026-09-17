# Kit de adoção — Platform primeiro

Em 17/09/2026, Vitor definiu `hywork-plataform` como primeiro consumidor pela
engenharia, preservando o design de produção. Leia primeiro
[`platform-handoff.md`](platform-handoff.md). Builder entra em uma etapa posterior;
o handoff não exige migrar os dois produtos juntos.

O planejamento anterior usava outubro como janela. A ordem vigente é Platform
primeiro, com cronograma e piloto combinados pela engenharia e produto. Os gates
de comportamento, comparação visual e aprovação continuam obrigatórios.

## Ordem recomendada

1. congelar commits dos consumidores e regenerar o baseline;
2. instalar `@hywork/ui` pela tag imutável `v0.6.2` e versionar o lockfile;
3. importar `@hywork/ui/tokens/tema.css` uma única vez;
4. começar por Button e Field em uma feature existente, mapeando props e aparência;
5. validar uma feature piloto por família de fluxo;
6. só então substituir primitives repetidos em lote;
7. remover cópias locais apenas depois do build e da captura comparativa.

## Regra de segurança

Não existe codemod destrutivo nesta versão. O auditor mede adoção, mas não
reescreve imports. Cada consumidor preserva seu auth, dados, feature flags e
renderização de domínio.

`audit-adoption` analisa imports e reexports estáticos pela sintaxe TypeScript:
conta default, named, namespace e export star em runtime, excluindo declarações
type-only, comentários e strings. `packageImportedNames` usa os nomes exportados
originais; `default` representa import default e `*` representa namespace/star.
`audit-consumers` exige que cada root seja uma árvore Git na revisão selecionada;
root ausente ou arquivo falha com exit nonzero. Uma árvore rastreada sem `.tsx`
é uma leitura válida de zero componentes. A classificação `format-only` exige
sintaxe equivalente, preservando strings, JSX e o efeito de quebras de linha em ASI.
Diretivas JSX (`@jsxImportSource`, `@jsxRuntime`, `@jsx` e `@jsxFrag`) também entram
na comparação porque alteram o código emitido; comentários comuns e mudanças de
posição da mesma diretiva continuam sendo formatação.

Veja também:

- [`october-checklist.md`](./october-checklist.md)
- [`import-map.md`](./import-map.md)
- [`consumer-scorecard.md`](./consumer-scorecard.md)
- [`adoption-dashboard.md`](./adoption-dashboard.md) — snapshot histórico de 01/09,
  gerado pelo auditor; não representa a revisão atual dos consumidores

## Dashboard de adoção

O dashboard é sempre gerado a partir da leitura atual dos dois consumidores:

```bash
node scripts/audit-adoption.mjs --repo /caminho/platform --output /tmp/platform-adoption.json
node scripts/audit-adoption.mjs --repo /caminho/builder --output /tmp/builder-adoption.json
node scripts/render-adoption-dashboard.mjs \
  --platform /tmp/platform-adoption.json \
  --builder /tmp/builder-adoption.json \
  --output migration/adoption-dashboard.md
```

O relatório marca `Não migrado` quando não há import do pacote. Refaça a leitura
no checkout limpo e no commit que será migrado, registrando a revisão. O dashboard
conjunto mede o programa completo; o primeiro aceite é o piloto do Platform,
independente do estado posterior do Builder. Nenhuma contagem de imports prova,
sozinha, paridade visual ou adoção em produção.
