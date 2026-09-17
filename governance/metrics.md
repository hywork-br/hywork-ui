# Métricas operacionais

Não existe nota única de maturidade. Cada eixo preserva sua evidência e seu denominador.

| Eixo | Métrica | Fonte | Gate |
|---|---|---|---|
| Adoção | imports canônicos / imports locais candidatos | `audit:adoption` | leitura válida dos consumidores |
| Duplicação | idênticos, formatting-only e behavioral forks | `audit:consumers` | revisões congeladas |
| Contrato | famílias com spec 10/10, story, teste e owner | `contracts.test.mjs` | todas as famílias do catálogo; utilities têm contrato próprio |
| Qualidade | testes, typecheck, builds, smoke e audit | CI | todos verdes |
| Acessibilidade | violações Axe sérias/críticas | `accessibility.test.tsx` | zero |
| Visual | baselines admin/portal/mobile revisados | `tests/visual/baselines` | atualização explícita no PR |
| Release | changeset e asset imutável por tag | workflow `release` | tag nunca movida |

Primeiro consumidor: Platform (Vitor, 17/09/2026); Builder vem depois. Medir cada
fluxo antes/depois e não bloquear o aceite do piloto no Platform pela ausência
de migração do Builder. O dashboard de 01/09 é histórico; zero imports naquele
snapshot não é medição atual nem prova de estado de produção.
