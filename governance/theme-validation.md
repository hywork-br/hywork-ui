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

A story `Labs/Temas de tenant` usa um adaptador restrito para demonstrar `--color-primary`,
`--color-primary-fg`, `--color-background` e `--color-text`. Ela compara combinações fortes, claras,
escuras e uma reprovação intencional usando primitives existentes. Uma edição inválida permanece
visivelmente rejeitada e mantém o último preview legível.

Isso não conecta o `Button` existente às variáveis do tenant, não muda o tema global, não persiste
preferências e não implementa dark mode do produto inteiro. Movimento permanece fora deste
laboratório; teclado e `prefers-reduced-motion` não recebem esperas ou coreografia, e mudanças da
preferência do sistema são atendidas pela media query ativa sem reload.

O CTA longo do preview alterna apenas uma confirmação local e identificada. Ele existe para permitir
inspeção real do par primária/foreground e do foco; não navega, não envia e não persiste dados.

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
