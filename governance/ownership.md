# Ownership e aprovação

Cada mudança perceptível requer dois papéis no PR:

| Papel | Responsabilidade | Gate |
|---|---|---|
| Design owner | intenção, hierarquia, densidade e coerência | aprova captura do Storybook |
| Frontend owner | API, acessibilidade, compatibilidade e release | aprova testes e build |

O `CODEOWNERS` atual resolve `@souzafvitor` como responsável técnico. Um segundo
handle não será inventado: enquanto a organização não indicar o design owner no
GitHub, a aprovação de design deve ser registrada no corpo da PR pelo nome da
pessoa responsável.

## Mudança de contrato

- token ou prop nova: caso de uso, alternativa rejeitada e exemplo no Storybook;
- breaking change: depreciação documentada antes da remoção;
- padrão novo: evidência de pelo menos duas features com a mesma necessidade;
- exceção local: justificativa e data de reavaliação.
