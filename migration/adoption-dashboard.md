# Adoption dashboard

Gerado em 2026-09-01T22:33:51.047Z. A fonte de cada linha é a saída do auditor determinístico
`scripts/audit-adoption.mjs`, executado no commit indicado. Nenhum número é preenchido à mão.

## Gate de outubro

**0 / 2 consumidores no pacote**

A adoção real não foi executada antes de outubro. Este relatório torna o gate
verificável sem alterar Platform ou Builder.

| Consumidor | Revisão medida | Arquivos com import do pacote | Arquivos com import local | Status |
|---|---|---:|---:|---|
| Platform | `ed3d0181970c24b3fb406ebc43b840c4a00ab399` | 0 | 332 | Não migrado |
| Builder | `4afbf2e5684d6de8a01e87e30167af378b04f68b` | 0 | 121 | Não migrado |

## Critério de promoção

Só considerar a Fase 3 concluída quando Platform e Builder estiverem na mesma
tag imutável, cada componente migrado não tiver definição local no escopo
migrado e houver screenshots comparativas, fluxo funcional e review humano.
