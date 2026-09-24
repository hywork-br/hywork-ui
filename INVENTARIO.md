# Inventário

> ## ⚠️ DESATUALIZADO — ver [INDEX.md](INDEX.md)
>
> Este inventário reflete a extração inicial de 28 famílias com escopo de um
> consumidor só. A estrutura atual e a lista de componentes estão em
> [INDEX.md](INDEX.md); os padrões decididos, em [DOMAIN_MODEL.md](DOMAIN_MODEL.md).

Fonte: [manifest.json](manifest.json), derivado da revisão do Platform registrada nele.

| Grupo | Famílias |
| --- | --- |
| Ações e campos | button, input, textarea, label, checkbox, radio-group, select, switch, slider |
| Conteúdo e dados | alert, avatar, badge, card, progress, skeleton, table |
| Organização | accordion, breadcrumb, collapsible, scroll-area, separator, tabs |
| Sobreposições | alert-dialog, dialog, dropdown-menu, popover, sheet, tooltip |

São 28 famílias, com subcomponentes exportados por [src/index.ts](src/index.ts).
`source-derived` significa extraído da fonte técnica fixada, não validado em todos
os fluxos do produto. A contagem não representa cobertura percentual da aplicação.

Componentes específicos de negócio continuam no consumidor. Novas famílias entram
conforme uso real identificado, com contrato, estados e teste.
