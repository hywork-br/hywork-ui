# Mapa inicial de imports

Primeiro consumidor: `hywork-plataform`, pacote v0.6.2 (17/09/2026). Este mapa
indica candidatos, não equivalência automática de props ou aparência. Aplicar o
[handoff](platform-handoff.md) e comparar a tela de produção por fluxo.

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

Não usar busca/substituição global: no baseline de 01/09, 26 dos 45 nomes
compartilhados tinham divergência de API ou comportamento. Revalidar no commit
selecionado. No Button, mapear `default` → `primary` e tamanho `default` → `md`
somente após comparar intenção, altura e estados; variantes locais como `link`
não têm equivalente homônimo no pacote. Padrões como DataTable e FilterBar
permanecem `draft` e não entram automaticamente junto da troca de primitives.
