# Estados de maturidade

| Estado | Pode usar? | Contrato |
|---|---|---|
| `draft` | laboratório | pode mudar sem migração |
| `beta` | feature nova com acompanhamento | API preservada dentro da minor |
| `stable` | produção | sem breaking change fora de major |
| `deprecated` | apenas legado | alternativa e prazo obrigatórios |

## Gate para `stable`

- teste de comportamento e teclado;
- Storybook com estados relevantes;
- build do pacote e do Storybook;
- tokens sem literal fora de primitivos;
- foco visível e estado que não depende apenas de cor;
- owner de design e owner frontend registrados.

Os componentes da linha 0.6 entram como `beta`. Os tokens existentes continuam
`stable`. Os padrões de produto entram como `draft` até a prova em consumidores
durante a migração de outubro.
