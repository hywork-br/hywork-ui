# Scorecard de adoção

Preencher por medição no início e no fim de cada PR:

| Indicador | Baseline | Depois | Evidência |
|---|---:|---:|---|
| imports de `@hywork/ui` | gerado | gerado | `audit-adoption` |
| imports de `components/ui/*` | gerado | gerado | `audit-adoption` |
| componentes locais compartilhados | gerado | gerado | `audit-consumers` |
| exceções documentadas | 0 | revisado | PR |
| rotas capturadas | definido no PR | conferido | screenshots |

Um número manual não fecha o gate. Se o auditor não consegue ler o consumidor,
o campo é `SEM LEITURA`, nunca zero.
