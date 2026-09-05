# Kit de migração — outubro

Este diretório prepara a adoção sem alterar nenhum produto agora.

## Ordem recomendada

1. congelar commits dos consumidores e regenerar o baseline;
2. instalar uma tag imutável de `@hywork/ui`;
3. importar `@hywork/ui/tokens/tema.css` uma única vez;
4. migrar primeiro Button, Field e estados de lista;
5. validar uma feature piloto por família de fluxo;
6. só então substituir primitives repetidos em lote;
7. remover cópias locais apenas depois do build e da captura comparativa.

## Regra de segurança

Não existe codemod destrutivo nesta versão. O auditor mede adoção, mas não
reescreve imports. Cada consumidor preserva seu auth, dados, feature flags e
renderização de domínio.

Veja também:

- [`october-checklist.md`](./october-checklist.md)
- [`import-map.md`](./import-map.md)
- [`consumer-scorecard.md`](./consumer-scorecard.md)
- [`adoption-dashboard.md`](./adoption-dashboard.md) — snapshot atual, gerado pelo auditor

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

O relatório marca `Não migrado` quando não há import do pacote. Em setembro,
isso é o estado esperado: a Fase 3 está preparada, mas a adoção real não foi
executada antes do gate de outubro.
