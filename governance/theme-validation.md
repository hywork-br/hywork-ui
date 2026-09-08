# Validação de temas de tenant

Status: **rascunho de laboratório**. Este contrato não está integrado aos produtos e não autoriza
migração antes do gate de adoção de outubro.

## O que existe

`validateTenantTheme` é uma função pura: recebe cores CSS opacas já resolvidas e retorna os pares
avaliados, ratios brutos, ratios de exibição, limiares e falhas. Ela não lê nem altera DOM, tema
global, storage ou rede.

Formatos aceitos:

- `#RGB` e `#RRGGBB`;
- `rgb(R, G, B)`, com canais inteiros entre 0 e 255.

Alpha, `transparent`, `rgba()`, hex com alpha, `hsl()`, `var()` e sintaxes não documentadas falham
fechado. Uma cor transparente só pode ser avaliada depois de a aplicação compô-la explicitamente
contra a superfície real e fornecer o resultado opaco resolvido.

O contrato verifica:

- `primaryForeground` sobre `primary`: mínimo WCAG 4.5:1 para texto normal;
- `text` sobre `background`: mínimo WCAG 4.5:1 para texto normal;
- `focus` contra cada superfície adjacente declarada: mínimo WCAG 3:1 para limite/foco não textual.

O ratio bruto decide aprovação. O valor arredondado serve apenas para exibição: 4.499 continua
reprovado mesmo quando aparece como 4.5.

## Limite do laboratório

A story `Labs/Temas de tenant` agora usa componentes reais (`Button`, `Input`, `Select` e
`InlineNotice`) com o `ThemeScope` público em status draft. O link `ValidationLab` foi mantido;
`InvalidInitial` demonstra a rejeição na entrada. A comparação inclui tema em edição, padrão externo
e outro workspace. Não escreve no namespace `--color-*`, que continua pertencendo à aplicação.

A camada de componentes é separada da utility numérica descrita acima: valida também hover,
tinta de acento, superfícies de campos/portais, foco e adjacências de feedback suportadas. Valores
padrão são gerados dos tokens canônicos, sem consultar DOM durante SSR. Rejeição inicial usa o
padrão validado; rejeição de edição mantém todos os valores do último tema válido. Amostras usam
primitivos existentes. Chamadores legados desta story têm suas cores explicitamente expandidas;
a lista de foco fornecida por eles não substitui as verificações obrigatórias do componente.

O escopo tem API pública documentada em draft, mas ainda não foi promovido em artefato aceito. Não há alteração de tema global,
persistência ou dark mode do produto inteiro. CSS externo arbitrário não está coberto pela
validação. Movimento e densidade permanecem nos componentes/tokens compartilhados, não em
implementações locais de botões e campos.

Dentro de `ThemeScope`, mudanças de cor são instantâneas, inclusive hover de cor: interpolar
dois pares válidos pode produzir texto ilegível no meio. `--hw-duration-color` é separado das
durações estruturais e propagado aos portais. Abertura de diálogos/menus não é desativada;
fora do escopo, o comportamento de cor existente permanece. Não representa suporte a CSS
arbitrário de consumidores nem prova de contraste em animações externas.

O CTA longo do preview alterna apenas uma confirmação local e identificada. Ele existe para permitir
inspeção real do par primária/foreground e do foco; não navega, não envia e não persiste dados.
Uma nova paleta válida exige nova confirmação, sem desmontar campos nem apagar o público escolhido.

## Responsabilidade da integração futura

Cada consumidor continua dono de:

- origem e autorização dos dados do tenant;
- permissão para editar/aprovar o tema;
- chamadas de rede, persistência, auditoria e rollback;
- composição explícita de qualquer cor com alpha;
- declaração de todas as superfícies realmente adjacentes ao foco;
- aplicação das variáveis somente depois de um resultado válido;
- regras de negócio, mensagens e telemetria;
- testes de integração, teclado, responsividade e contraste no produto real.

No gate de outubro, cada consumidor deverá comprovar a integração. Até lá, adoção é **0 / 2** e não
há claim de uso em produção.
