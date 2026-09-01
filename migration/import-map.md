# Mapa inicial de imports

| Local | Pacote | Observação |
|---|---|---|
| `components/ui/button` | `@hywork/ui` → `Button` | comparar variantes locais |
| `components/ui/input` | `@hywork/ui` → `Input` | preservar integração do form |
| `components/ui/label` | `@hywork/ui` → `Label` | manter `htmlFor` |
| `components/ui/textarea` | `@hywork/ui` → `Textarea` | manter contador no consumidor |
| `components/ui/badge` | `@hywork/ui` → `Badge` | estado precisa de texto |
| `components/ui/dialog` | `@hywork/ui` → `Dialog*` | validar foco e retorno |
| `components/ui/select` | `@hywork/ui` → `Select` | adapter pode ficar local |
| tabela de feature | `@hywork/ui` → `DataTable` | colunas e células seguem locais |
| filtros de feature | `@hywork/ui` → `FilterBar` | taxonomia segue o domínio |

Não usar busca/substituição global: 26 dos 45 nomes compartilhados já têm
divergência de API ou comportamento.
