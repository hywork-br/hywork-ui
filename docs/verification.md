# Verificação da extração e do guia

17/09/2026 — branch `docs/platform-engineering-handoff`, PR #13.
Base do PR: `1c63b39178ef17e767878bdac1a16e6776ec676e`.
Referência técnica de comparação: revisão do Platform em `manifest.json`.

## Escopo da revisão

Uma revisão com uma rodada de correções. Superfícies: catálogo de componentes e
fixture de comparação; produto real não alterado. React 18, Radix, Tailwind 3.
Fontes de regra: AGENTS, CONTRIBUTING, guia visual e handoff deste pacote.

Código gerado revisado pela transformação e pelo comparativo da fonte; lockfile,
snapshots de procedência e binários excluídos da crítica estética.
Não é revisão de todas as páginas ou de toda a combinação de estados do produto.

| Domínio | Evidência | Resultado no escopo |
| --- | --- | --- |
| Acessibilidade | Axe em claro/tenant, teclado, Slider, diálogo, scroll, movimento reduzido | Correções verificadas |
| Layout | Capturas 1440/390, geometria, reflow 320 | Sem overflow horizontal no catálogo |
| Escrita | Rótulos e exemplos do catálogo | Documentação de componentes, sem simulação de backend |
| Tipografia | Montserrat carregada, escala, capturas desktop/mobile | Escala preservada e tokenizada |
| Cor | CSS resultante, pares renderizados, auditoria de contraste | Contrastes corrigidos; tema do consumidor preservado |
| Acabamento | Raios, bordas, foco e sobreposições capturados | Nenhuma regressão não intencional observada |

## Achados e desfecho

- **Introduzido pela conversão:** Tailwind recorria à cor alternativa do anel em vez
  do default real. Medição do box-shadow e diferença de 53 pixels no Firefox
  identificaram a causa; default tokenizado explícito eliminou a diferença.
- **Herdados da referência:** texto de variantes de estado e caption abaixo de 4,5:1.
  Correções concentradas em tokens semânticos; o teste recoloca o texto branco
  inadequado, exige reprovação e verifica restauração.
- **Herdados da referência:** Slider sem thumb com defaultValue/nome no elemento
  interativo; ScrollArea sem acesso por teclado; saltos de heading; movimento
  ignorando preferência. Correções explícitas na extração, verificadas separadamente.

Nenhum HIGH introduzido ou regressão permanece no escopo inspecionado.
Limites que não se confundem com aprovação: modo escuro, toque com defaults
administrativos e `Input.focusColor` estão descritos no handoff. Screen reader real,
zoom nativo de 200%, RTL e todos os fluxos do consumidor: **não verificados**.

## Comandos e resultados locais

- `npm run check`: 5 verificações de integridade + TypeScript + bundle + 5 testes de comportamento.
- `npm run build`: biblioteca e Storybook gerados.
- `npm run test:browser`: 22 testes aprovados, Chromium e Firefox.
- `npm run smoke:consumer`: tarball instalado em consumidor limpo, exports,
  declarações, diretiva client e preset carregados.
- `npm audit --audit-level=high`: nenhuma vulnerabilidade encontrada.
- `codex debug prompt-input`: contrato local e catálogo carregados, sem aviso de truncamento.

As capturas completas são anexadas pelo Playwright. A comparação de pixels mascara
somente as seis regiões de cor listadas no guia; compara também sua geometria e
tipografia. A auditoria separada mede as cores reais, sem máscara. O teste de mutação
altera uma altura, exige diferença e verifica a restauração.

**Approve** para esta extração e catálogo em base clara, dentro da cobertura acima.
Isso não libera automaticamente nenhum fluxo de produção.
