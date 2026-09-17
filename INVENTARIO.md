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

## API publicada na v0.6.2

- 12 famílias entram como `beta`: Button, Field/Input/Label, Textarea, Badge,
  Avatar, Skeleton, Card, Dialog/AlertDialog, DropdownMenu/Popover, Tooltip,
  Select e Tabs;
- ListPage, FilterBar, DataTable, AdminShell, FocusMode e Stepper entram como
  padrões `draft`;
- componentes específicos de produto continuam locais;
- 14 famílias adicionais e duas entradas de utilities estão publicadas como
  `draft`; consultar o manifesto para a lista nominal;
- candidatos restantes serão avaliados durante a adoção, começando no Platform.

A classificação original dos 45 compartilhados está em
[`governance/component-decisions.json`](./governance/component-decisions.json).
Esse baseline de setembro contém candidatos que depois viraram APIs `draft`
(por exemplo, Accordion e Checkbox). O estado atual de publicação e maturidade
é o de [`manifest.json`](manifest.json) e
[`governance/component-contracts.json`](governance/component-contracts.json).
Não interpretar `october-candidate` do baseline como ausência na v0.6.2.

## Reproduzir

```bash
npm run audit:consumers -- \
  --platform-repo /caminho/para/hywork-plataform \
  --builder-repo /caminho/para/hw-cloud-builder \
  --platform-ref origin/main \
  --builder-ref origin/main \
  --output governance/consumer-baseline.json
```

O auditor lê os consumidores e grava o relatório no caminho `--output`; não
migra produtos. Para consultar sem substituir o baseline histórico, use um
caminho temporário. Primeiro handoff: [hywork-plataform](migration/platform-handoff.md).
