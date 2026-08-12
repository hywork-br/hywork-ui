# Changelog

Formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

Este arquivo existe porque a distribuição é por **tag git**: o consumidor não
tem `npm outdated` para descobrir o que mudou. Aqui é o único lugar.

## [0.2.0] — 2026-08-12

### Corrigido
- **Namespace dos tokens semânticos.** A v0.1.0 declarava `--color-primary`, que
  no produto white-label pertence ao **tema do tenant** (`workspace_themes`,
  aplicado em runtime). Importar os tokens depois do tema do cliente apagaria a
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
