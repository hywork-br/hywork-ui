# Changelog

Formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

Este arquivo existe porque a distribuição é por **tag git**: o consumidor não
tem `npm outdated` para descobrir o que mudou. Aqui é o único lugar.

## [0.6.1] — 2026-09-15

Lado design system do review de 15/09 (`team/ux-ui/reviews/2026-09-15-experiments-review`),
que mediu 27 rotas × 6 viewports do consumidor e isolou no Storybook o que nasce
aqui. Sem mudança de API que quebre consumidor: tudo é prop nova ou correção de
contrato.

### Corrigido

- **Campo quieto sem limite visível.** A `FilterBar` apagava a borda da busca e
  dos selects (`border-color: transparent`), e o entorno do admin é o mesmo
  cinza do preenchimento: o controle media **1,00:1** contra o piso de 3:1 da
  WCAG 1.4.11, em 78 de 162 combos e 6 coleções — e **1,10:1** mesmo na story
  isolada, de entorno branco. A baseline volta; o que separa filtro de campo de
  formulário passa a ser o preenchimento, não a ausência de limite. Medido
  agora, no render: **3,310:1** sobre a superfície sutil e **3,641:1** sobre
  branco.
- **Trilho de progresso em duas linhas.** O `Stepper` só compactava em
  `@media (max-width: 48rem)` — viewport —, enquanto o contêiner real é o
  formulário, de largura igual em 1440 e em 1024. A adaptação passa a ser por
  CONTÊINER (`container-type: inline-size`), e o trilho troca de modo em vez de
  quebrar: uma linha em 320, 390, 672, 768, 1024 e 1440, completo quando os
  nomes cabem e compacto (marcadores numerados + nome do passo atual) quando
  não. O rótulo de cada passo continua no nome acessível do botão.
- **Foco inicial do modo de foco caía na saída.** `FocusMode` leva o foco ao
  primeiro tabbable do corpo (R29); a saída só recebe o foco quando o corpo não
  oferece parada de teclado.
- **Item ativo da navegação só por cor.** `AdminShell` passa a marcar o item
  atual com filete de acento de 3px, fundo `--hw-nav-active` e peso maior que o
  dos vizinhos (R2). O tom `inverse` usa o mesmo tratamento em vez de pintar o
  item inteiro com a primária; o laranja é o único da tela.
- **Margem física em layout localizável:** `margin-left` vira
  `margin-inline-start` na barra de filtros.

### Adicionado

- `FocusMode` ganha `back` e `actions`: uma faixa fixa (terceira linha do grid
  do diálogo, fora do corpo que rola) com Voltar à esquerda e primária à direita
  em todos os passos (R27). A medição encontrava a primária abaixo da dobra na
  última etapa nos seis viewports.
- `FocusMode` ganha `measure="form" | "page"`: a medida de leitura do formulário
  (48rem) vem do padrão, sem o consumidor empilhar um segundo `max-width` — eram
  dois tetos concorrentes deixando o formulário com 46,7% da tela. Quando o
  corpo hospeda também o trilho de progresso, a classe `hw-focus-mode__content`
  põe a medida na coluna dos campos e deixa o trilho com a largura do modo de
  foco: medida de leitura é regra de prosa, não de chrome.
- Tokens `--hw-nav-active`, `--hw-nav-active-fg` e `--hw-nav-active-rail`
  (cores, gateadas) e `--hw-measure-page`, `--hw-measure-form`,
  `--hw-nav-active-rail-width` (medidas).
- Story `Patterns/Stepper · FullWidth`, para o modo completo ao lado do
  `Constrained`, que é o contêiner de 672px onde o trilho quebrava.
- `FocusMode` ganha `titleAs` (`h1`–`h6`, padrão `h2`): o consumidor decide o
  nível do título da tarefa sem perder o nome acessível do diálogo. Um modo de
  foco toma a tela inteira, e o esboço de headings costuma querer `h1` ali.
- Alvo do `Switch` sobe para 24px (WCAG 2.2, 2.5.8) por pseudo-elemento, sem
  mudar os 32×20 desenhados. Medido em Chromium e Firefox, em 390 e 1440.

### Conhecido

- **Checkbox e radio continuam com a caixa de 16px.** Com aparência nativa eles
  ignoram borda, padding e pseudo-elemento nos dois navegadores (medido em
  15/09); ampliar o alvo do próprio controle exigiria `appearance: none` e
  desenho à mão, perdendo `accent-color` — decisão de desenho, não de correção.
  O que responde pela WCAG 2.5.8 hoje é a exceção de espaçamento (32px entre
  centros, contra os 24px do círculo da regra) e o rótulo clicável, que ocupa a
  linha e mede 32px no admin e 44px abaixo de 640px. Os três estão medidos em
  `tests/browser/interactions.spec.ts`.

### Alterado

- `--hw-gray` escurece de `#8c8c8c` para `#868686`: a baseline do campo passava
  o piso de 3:1 com 0,06 de margem sobre a superfície do admin. Agora
  **3,310:1** ali e 3,641:1 sobre branco — o cinza mais claro que dá 3,3:1 nas
  duas superfícies.
- `--hw-gray-text` escurece de `#707070` para `#6e6e6e` (decisão do Vitor): o
  texto de apoio media **4,50:1 exato** sobre `#f4f4f4`, AA com margem 0,00.
  Agora **4,636:1** ali e **5,099:1** sobre branco — o cinza mais claro que dá
  4,6:1 e 5:1, respectivamente.
- O gate `check-tokens` passa a resolver papéis DENTRO da superfície (admin e
  portal) e mede os pares que a tela renderiza: `--hw-chrome` × borda de campo,
  texto de apoio e filete do item ativo, mais `--hw-surface-subtle` × borda de
  campo. O piso do texto de apoio sobre `#f4f4f4` sobe para 4,6. Três mutações
  de PAPEL provam a guarda em `scripts/token-usage.test.mjs`.

## [0.6.0] — 2026-09-01

### Adicionado

- biblioteca React com 12 famílias de componentes beta;
- padrões draft `ListPage`, `FilterBar`, `DataTable`, `AdminShell`, `FocusMode`
  e `Stepper`;
- Storybook, testes de interação, tipagem e build de declarações;
- contratos 10/10 e histórias executáveis para as 12 famílias, com seletor
  admin/portal e auditoria Axe no CI;
- pilotos isolados de TV Corporativa, Assinaturas, Academy e Conteúdos, com
  filtros próprios e persistência por URL;
- fixture Next 16 + Tailwind v3 consumindo os exports e o preset reais;
- manifesto gerado com drift check, Changesets, template de PR e release
  imutável por tag;
- manifesto de maturidade, ownership, ADR e inventário reproduzível dos dois
  consumidores;
- kit de migração somente leitura para outubro.

### Corrigido

- `--hw-text-muted` agora passa também sobre a superfície sutil;
- o sólido secundário usa derivado laranja acessível para texto pequeno;
- o fallback do Avatar tem papel `img` explícito;
- `CardTitle` aceita a hierarquia completa de `h1` a `h6`, encontrada pelo
  consumer smoke;
- o modo foco não herda a transição centralizada do modal comum;
- navegação, fluxo e ações não criam overflow no breakpoint mobile.

### Incluído na tag v0.6.0 (15/09)

A entrada acima foi escrita em 01/09. A tag `v0.6.0` é cortada de `main`
(`3713f80`) e leva também o que entrou depois disso, pelos PRs #7 e #8. Os três
changesets pendentes são consumidos aqui, sem mudar a versão: o primeiro
(`quiet-tables-learn`) descreve a biblioteca React, os contratos executáveis do
Storybook, os padrões de produto e a governança de migração de outubro, tudo já
registrado acima; os outros dois estão detalhados nesta seção.

**Adicionado**

- `TreeView`, status `draft`: navegação hierárquica controlada
  (`expandedIds`/`onExpandedChange`, `selectedId`/`onSelectionChange`,
  `ariaLabel` obrigatório), uma parada de Tab, setas, Home/End, busca por
  prefixo sem acentos, foco separado da seleção, modo somente leitura e
  recuperação de foco ao recolher ou remover nós — com spec, contrato no
  catálogo, entrada no manifesto, story `Navigation` com play e estilos só com
  tokens existentes (#7);
- `AdminShell` aceita `surface="admin" | "portal"`, padrão `admin`, aplicado no
  shell e no painel de navegação móvel em portal (#7).

**Corrigido**

- ações indisponíveis de `Button` slotted são barradas antes dos handlers de
  captura do filho, o estado de carregamento preserva as dimensões e o
  `FocusMode` devolve o foco ao acionador por alvo de retorno explícito, com
  trava de saída opcional;
- layout de modal, tipografia de portal, badges de grade, referências de
  espaçamento e estados de carregamento sob movimento reduzido;
- `TreeNode` vira união discriminada: item desabilitado é folha e exige motivo
  em `description`, validado também em runtime; o clique de seleção sai do
  `treeitem` e vai para a linha, então clicar no recuo de um grupo não
  seleciona o ancestral (#7);
- `FocusMode` mantém título, corpo e nomes de arquivo longos dentro de viewport
  estreito, sem empurrar o botão de sair (#7);
- `FileUpload` desenha o progresso com o `Progress` tokenizado do pacote, em vez
  do `<progress>` nativo do navegador (#7);
- os props repassados ao `AdminShell` são aplicados antes de `className`,
  `data-surface` e `data-navigation-tone`, então um `data-surface` vindo do
  consumidor não faz o root divergir do portal (#7).

**Documentação e testes**

- contratos compartilhados de jornada e adoção em
  `governance/pattern-contracts.md`: `TreeView`, autoridade de `data-surface`,
  foco e `accept` do `FileUpload`, e a diferença entre a prova do Storybook e a
  prova de jornada no lab — a lista `consumers` do catálogo registra destino de
  integração, não adoção em produção (#7);
- o teste de interrupção de movimento segura a animação nativa pausada na
  metade da duração ativa e espera a reação do app, em vez de disputar com o
  relógio real e amostrar num quadro fixo (#8);
- o teste de navegação observa na própria página que o clique do meio e o
  clique com modificador chegam ao link sem `preventDefault`, em vez de esperar
  o navegador materializar a aba nova (#8).

As duas últimas mudanças são só de teste: nenhuma linha de código de produção
foi alterada por elas. Os padrões continuam `draft` até o gate de adoção de
outubro.

### Limite

Nenhum produto foi migrado, publicado ou alterado nesta linha.

## [0.5.0] — 2026-08-18

**A tipografia do sistema é Montserrat.** Muda valor de token, então quem
consome vê na tela: `--hw-font-heading` e `--hw-font-body` deixam de resolver em
LT Wave / Noto Sans.

### Decidido
- **Título e corpo em Montserrat** (Vitor, 18/08). O guideline de marca pede LT
  Wave em título e Noto Sans em corpo, e **continua valendo para peça de marca**
  — deck, papelaria, evento, site. O que estava errado era aplicá-lo à
  interface: os dois frontends de produção **já executam Montserrat** (`sans:
  var(--font-montserrat)` no admin, `fontFamily` no `<body>` do portal), e o
  tema do tenant nasce com `font_name: "Montserrat"`. O pacote existe para
  descrever a interface; descrever outra coisa era fabricar a quinta versão da
  verdade em vez de matar as quatro.
- **Os dois papéis passam a resolver na mesma família.** Continuam separados:
  hierarquia é peso e escala, e a costura sobrevive a uma divergência futura sem
  reescrever tela.

### Sabido, e declarado aqui porque não tem conserto dentro do pacote
**Token de fonte não CARREGA fonte.** Consumidor em `next/font` precisa importar
Montserrat e apontar a variável dele para o token — o nome literal `"Montserrat"`
não resolve sozinho, porque o `next/font` publica a família com nome mangled e
**cai no Arial sem erro nenhum**. Nenhuma CSS variable dispara import de build,
então esta ligação não pode ser herdada: ela é conferida por teste do lado do
consumidor (no Labs, `scripts/design-tokens.test.ts` compara o espelho com este
pacote e fica vermelho quando divergem). É a mesma classe de armadilha que já
apagou a fonte do Labs uma vez, em 07/08: `--font-sans` apontando para uma
variável inexistente não quebra build nem lint — renderiza Times New Roman.

## [0.4.0] — 2026-08-13

Nenhum valor de token muda nesta versão. O que muda é o **estado de uma
decisão**, e por isso ela é minor e não patch: quem consome precisa ler.

### Decidido
- **A cor primária do tema default é o AZUL**, "por ora". A alternativa era o
  laranja do guideline de marca. A decisão é revisável — o "por ora" está no
  registro de propósito —, mas deixou de ser um limbo: o aviso de `DECISÃO
  PENDENTE` em `semantico.css` saiu, e no lugar dele ficou quem decidiu, quando,
  contra o quê, e o que custa desfazer.

### Corrigido
Duas afirmações que a documentação repetia e que **não sobreviveram ao teste de
trocar de verdade**. As duas eram confortáveis, e é por isso que duraram:

- **"Trocar a primária é editar uma linha / as quatro linhas abaixo."** Falso
  por dois motivos independentes. O laranja **colide** com `--hw-secondary` e
  `--hw-focus`, que já são a mesma cor da marca: trocada a primária, três papéis
  passam a ter o mesmo valor, e manter os três distintos exige mover a
  secundária junto. E cada consumidor que espelha a camada semântica em código
  tem a linha dele — ali a guarda existe e fica vermelha, o que é o
  comportamento certo, mas não é "nenhuma edição fora daqui".
- **"O check reprova a troca se o par de contraste não passar."** Verdade vazia
  para a alternativa que estava na mesa: com o laranja no lugar da primária,
  `npm run check` **sai 0**. O par do botão é medido contra o piso de 3,0:1 e o
  laranja sobre branco dá 3,73:1. O caso que reprovaria — primária como texto
  pequeno, piso 4,5:1 — não é par declarado. Contraste da primária continua
  sendo julgamento humano, e a documentação agora diz isso em vez de delegar ao
  CI uma decisão que ele não toma.

O que sobrevive da promessa original, e sobrevive medido: **nenhuma tela é
reescrita.** A camada semântica está fazendo o trabalho dela.

## [0.3.1] — 2026-08-13

### Adicionado
As duas últimas peças que faltavam para um mockup zerar cor escrita à mão:

- **`--hw-danger-strong`** — erro sólido com texto pequeno. O `--hw-danger`
  (rust da marca) mede 4,31:1 e reprova AA; este passa (5,15:1). Mesmo par que
  `--hw-muted`/`--hw-muted-strong`: a cor da marca serve ao elemento grande, a
  escurecida serve ao texto.
- **`--hw-scrim`** — véu sobre imagem, e a única cor do sistema que
  deliberadamente **não** vem da paleta. O navy da marca tem canais 9/41/56: é
  azul de verdade e, sobre foto, tinge. Véu precisa escurecer sem colorir.
  ⚠️ Ele **não** entra na lista de pares de contraste do check, e isso é
  decisão, não esquecimento: o que chega ao olho é véu + foto + texto, e medir
  "branco sobre preto sólido" daria 19,8:1 — número verdadeiro sobre uma
  composição que não existe. Guard que mede a coisa errada é pior que guard
  ausente.

## [0.3.0] — 2026-08-13

### Adicionado
Vocabulário completo de **estado** — o que faltava para um selo/badge migrar de
cor escrita à mão sem perder acessibilidade nem inventar hex:

- **Papel `info`** (`--hw-info`), o quarto estado. Azul profundo: distinto do
  sucesso por peso, não por matiz — a paleta da marca não dá um quarto matiz, e
  inventar um seria furar o guideline.
- **Pares suaves** (`--hw-*-soft` + `-fg`) para sucesso, atenção, erro, info e
  neutro. É a forma que o produto real mais usa (fundo claro + texto na cor), e
  sem eles todo selo suave vira hex à mão.
- **`--hw-muted-strong`** — o neutro sólido com texto branco pequeno. O
  `--hw-muted` (cinza puro do guideline) dá 3,36:1 e só serve a texto grande;
  migrar para ele teria feito o selo neutro **regredir** em acessibilidade.
- Os derivados que sustentam os pares acima, em `primitivos.css`: tints a 90% de
  branco e as tintas escurecidas até passar 4,5:1 **sobre o próprio tint**.

Todos os pares novos entraram no `check-tokens` e foram provados com mutação —
afrouxar qualquer um deles deixa o CI vermelho.

## [0.2.1] — 2026-08-12

### Corrigido
- `AGENTS.md` documentava quatro tokens que não existiam mais depois do rename.
  Doc que ensina token morto é pior que doc faltando: quem segue o exemplo
  obtém um elemento transparente e culpa o próprio código.

### Adicionado
- `check-tokens` passou a verificar **os tokens citados na documentação** — foi
  o que pegou o item acima, e documentação não compila, então nada mais pegaria.

## [0.2.0] — 2026-08-12

### Corrigido
- **Namespace dos tokens semânticos.** A v0.1.0 declarava `--color-primary`, que
  no produto white-label pertence ao **tema do tenant**, aplicado em runtime. Importar os tokens depois do tema do cliente apagaria a
  cor de marca dele. Agora tudo do design system vive sob `--hw-*`, e a ponte
  para o namespace da aplicação é explícita, em `tokens/white-label.css`.
- **`--hw-text-muted` reprovava contraste.** O `blue-steel` do guideline dá
  3,31:1 sobre branco — abaixo do piso de 4,5:1 para texto. Passou a usar um
  derivado escurecido de mesmo matiz (`#4b7ba2`, 4,51:1). Achado pelo
  `check-tokens`, não no olho.
- **Ponte do Tailwind v4 era auto-referência** (`--color-x: var(--color-x)`),
  então todo utilitário saía vazio. Agora aponta para a camada semântica.

### Adicionado
- `tailwind/v3-preset.cjs`, **gerado** de `semantico.css` por
  `scripts/gerar-preset-v3.mjs`. Dois dos três consumidores estão em Tailwind
  v3 e antes precisavam escrever o mapa à mão.
- `tokens/white-label.css` — contrato explícito entre design system e tenant.
- `check-tokens` passou a reprovar auto-referência e a tratar par que **não
  resolve** como falha dura: par não verificado é pior que par reprovado, e foi
  assim que o gate de contraste ficou verde sem avaliar cor nenhuma.

### Mudado
- Identificadores de token em inglês, alinhando com os design systems de
  referência e com o Tailwind que os consumidores já escrevem. Comentário e
  documentação seguem em português.

## [0.1.0] — 2026-08-12

Primeira versão: tokens de marca em três camadas.

⚠️ **Não use.** Publicada com o namespace que colide com o tema do tenant e com
a ponte do v4 quebrada. Corrigido na 0.2.0.
