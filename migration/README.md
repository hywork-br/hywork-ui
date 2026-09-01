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
