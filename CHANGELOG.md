# Changelog

Formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

Este arquivo existe porque a distribuição é por **tag git**: o consumidor não
tem `npm outdated` para descobrir o que mudou. Aqui é o único lugar.

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
