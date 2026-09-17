# Adoption dashboard

Gerado em 2026-09-01T22:33:51.047Z. A fonte de cada linha é a saída do auditor determinístico
`scripts/audit-adoption.mjs`, executado no commit indicado. Nenhum número é preenchido à mão.

## Adoção por consumidor

**0 / 2 consumidores no pacote**

Este snapshot mede imports na data e nas revisões acima; não comprova deploy,
paridade visual ou o estado atual dos produtos. Platform é o primeiro consumidor;
o aceite de seu piloto independe da migração posterior do Builder.

| Consumidor | Revisão medida | Arquivos com import do pacote | Arquivos com import local | Status |
|---|---|---:|---:|---|
| Platform | `ed3d0181970c24b3fb406ebc43b840c4a00ab399` | 0 | 332 | Não migrado |
| Builder | `4afbf2e5684d6de8a01e87e30167af378b04f68b` | 0 | 121 | Não migrado |

## Critério de promoção

Avaliar cada fluxo com tag imutável, ausência de cópia local no escopo migrado,
screenshots comparativas, comportamento preservado e aceite técnico e de produto.
O programa completo inclui Platform e Builder; a conclusão de um consumidor
não implica a do outro. Ver [handoff do Platform](platform-handoff.md).
