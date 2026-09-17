# Estados de maturidade

| Estado | Pode usar? | Contrato |
|---|---|---|
| `draft` | laboratório | pode mudar sem migração |
| `beta` | feature nova com acompanhamento | API preservada dentro da minor |
| `stable` | produção | sem breaking change fora de major |
| `deprecated` | apenas legado | alternativa e prazo obrigatórios |

O plano de maturidade chamava os dois primeiros degraus de `candidate` e
`experimental`. Para não manter duas taxonomias, o contrato público usa os
nomes canônicos `draft` e `beta`: `candidate → draft` e
`experimental → beta`. `stable` e `deprecated` mantêm o mesmo significado.

## Gate para `stable`

- teste de comportamento e teclado;
- Storybook com estados relevantes;
- build do pacote e do Storybook;
- tokens sem literal fora de primitivos;
- foco visível e estado que não depende apenas de cor;
- owner de design e owner frontend registrados.

Na v0.6.2, as 12 famílias core são `beta`; os tokens existentes continuam
`stable`. Há também 14 famílias de componentes `draft`, duas entradas de
utilities `draft` e seis padrões `draft`. A classificação de cada export vem de
`component-contracts.json`, `patterns.json` e do manifesto gerado, não de uma
afirmação genérica sobre todos os componentes da linha 0.6.

O primeiro consumidor de produto será o `hywork-plataform` (Vitor, 17/09/2026).
Provas no pacote e no Experiments não promovem status automaticamente. Aplicar
os gates de promoção ao escopo efetivamente integrado e revisar o catálogo em PR.
Ver [handoff](../migration/platform-handoff.md).
