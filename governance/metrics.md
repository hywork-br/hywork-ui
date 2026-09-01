# Métricas operacionais

Não existe nota única de maturidade. Cada eixo preserva sua evidência e seu denominador.

| Eixo | Métrica | Fonte | Gate |
|---|---|---|---|
| Adoção | imports canônicos / imports locais candidatos | `audit:adoption` | leitura válida dos consumidores |
| Duplicação | idênticos, formatting-only e behavioral forks | `audit:consumers` | revisões congeladas |
| Contrato | famílias com spec 10/10, story, teste e owner | `contracts.test.mjs` | 12/12 na linha 0.6 |
| Qualidade | testes, typecheck, builds, smoke e audit | CI | todos verdes |
| Acessibilidade | violações Axe sérias/críticas | `accessibility.test.tsx` | zero |
| Visual | baselines admin/portal/mobile revisados | `tests/visual/baselines` | atualização explícita no PR |
| Release | changeset e asset imutável por tag | workflow `release` | tag nunca movida |

Durante setembro, adoção de produção permanece deliberadamente em 0/2. O primeiro scorecard
de outubro mede a migração; este repositório não antecipa alterações em Platform ou Builder.
