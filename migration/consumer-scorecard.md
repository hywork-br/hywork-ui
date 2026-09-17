# Scorecard de adoção

Preencher por medição no início e no fim de cada PR:

Primeiro consumidor: `hywork-plataform`. Registrar commit do produto, tag do DS,
rotas, viewports, tema, owner técnico e owner de produto/design. O aceite do
Platform independe de o Builder já ter sido migrado.

| Indicador | Baseline | Depois | Evidência |
|---|---:|---:|---|
| imports de `@hywork/ui` | gerado | gerado | `audit-adoption` |
| imports de `components/ui/*` | gerado | gerado | `audit-adoption` |
| componentes locais compartilhados | gerado | gerado | `audit-consumers` |
| exceções documentadas | 0 | revisado | PR |
| rotas capturadas | definido no PR | conferido | screenshots |
| diferenças visuais | baseline de produção | nenhuma não aprovada | comparação antes/depois + aceite |
| fluxo e tema do cliente | comportamento atual | preservado | teste funcional + captura |

Um número manual não fecha o gate. Se o auditor não consegue ler o consumidor,
o campo é `SEM LEITURA`, nunca zero.
