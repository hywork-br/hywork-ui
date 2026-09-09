# ThemeScope

## Propósito

Aplicar identidade local validada aos componentes do DS e seus portais, sem alterar o tema da aplicação.

## Quando usar e quando evitar

Use para comparar ou aplicar uma paleta completa de workspace. Não use como dark mode universal,
editor de CSS arbitrário, persistência ou autorização. Não migra consumidores antes de outubro.

## Anatomia e slots

Um contêiner div com contexto React, children e ref encaminhada. Portais existentes recebem o
contexto de origem diretamente; nenhum wrapper adicional altera foco ou posicionamento.

## API e defaults

`ThemeScope` recebe `theme?: ScopedThemeCandidate`, children e atributos de div, exceto style.
O default é `defaultScopedTheme`. `useThemeScope()` retorna null fora do escopo ou estado de
validação/aplicação somente leitura. A função interna de ponte de portais não é API pública.
Refs apontam para o contêiner real. Style inline é rejeitado também em runtime.

## Variantes e estados

Inicial válido, fallback inicial canônico, atualização válida e rejeição com última paleta válida.
Escopos irmãos e aninhados são independentes. A validação ocorre antes do commit dos filhos;
SSR e hidratação usam o mesmo fallback, sem consultar DOM. Não existe salvamento implícito.

## Tokens consumidos

Papéis completos descritos na [utility](../utilities/scoped-theme.md), sob namespace `--hw-*`.
`--hw-duration-color` usa `--hw-duration-none` no escopo e portais: cores e hover mudam sem
interpolação. Durações estruturais permanecem intactas. `--color-*` pertence à aplicação.

## Admin, portal e mobile

Não escolhe densidade nem força largura. Superfícies admin/portal continuam donas de seus tokens.
Comparação em desktop, tablet e mobile deve usar componentes reais e não réplicas locais.

## Teclado, foco e acessibilidade

Não adiciona tabindex nem captura foco. Dialog, Select e menus preservam os contratos Radix.
Rejeição precisa ser anunciada pelo editor consumidor; o provider não injeta alerts duplicados.
Pares de texto exigem4,5:1 e foco/baseline3:1 nas superfícies suportadas. Cores instantâneas
evitam pares intermediários ilegíveis; não validam animações externas.

## Composição e erros comuns

Use Button/Input/Select e portais do DS. Não sobrescreva cores por className ou CSS externo e
espere garantia de contraste. Atributos layout são permitidos, mas overrides de tokens no style
de portais dentro do escopo são rejeitados. Overlay e Tooltip mantêm seus pares canônicos.
Não reconstrua a árvore ao trocar tema: seleção, foco e estado local devem permanecer.

## Proveniência, status, owner e migração

Draft; owners Hywork Product Design e Hywork Frontend. Caso estrutural: identidade por workspace
compartilhada entre shells e portais. Nenhum consumidor de produção adotado. Contrato público em
desenvolvimento não equivale a artefato aceito: revisão e adoção reproduzível continuam pendentes.
