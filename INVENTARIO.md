# Inventário vivo de componentes

Este inventário responde ao que existe e diverge nos consumidores sem editar
nenhum deles. A fonte numérica é
[`governance/consumer-baseline.json`](./governance/consumer-baseline.json),
gerada por `scripts/audit-consumers.mjs` sobre commits fixos.

## Baseline de 1º de setembro de 2026

| Medida | Resultado |
|---|---:|
| componentes no Platform | 75 |
| componentes no Builder | 56 |
| nomes compartilhados | 45 |
| fonte idêntica | 19 |
| API ou comportamento divergente | 26 |

Fontes medidas:

- Platform `40199afdb8713610a375d988e9eb1d038240e9ae`;
- Builder `f4988697a0af23e9b8c7cd0db17a57b7dcdb29af`.

Os caminhos absolutos do JSON são proveniência local, não API pública do
pacote. A medição conta arquivos de import reais e compara o conteúdo da árvore
Git; arquivo scaffoldado sem uso continua visível como zero.

## Decisão da linha 0.6

- 12 famílias entram como `beta`: Button, Field/Input/Label, Textarea, Badge,
  Avatar, Skeleton, Card, Dialog/AlertDialog, DropdownMenu/Popover, Tooltip,
  Select e Tabs;
- ListPage, FilterBar, DataTable, AdminShell, FocusMode e Stepper entram como
  padrões `draft`;
- componentes específicos de produto continuam locais;
- candidatos restantes serão avaliados durante a migração de outubro.

A classificação nominal dos 45 compartilhados está em
[`governance/component-decisions.json`](./governance/component-decisions.json).

## Reproduzir

```bash
npm run audit:consumers -- \
  --platform-repo /caminho/para/hywork-plataform \
  --builder-repo /caminho/para/hw-cloud-builder \
  --platform-ref origin/main \
  --builder-ref origin/main \
  --output governance/consumer-baseline.json
```

O comando é somente leitura. A migração dos produtos não faz parte desta linha.
