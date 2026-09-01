# Regras para agentes — design system da Hywork

Estas regras viajam **com o pacote**. Qualquer repositório que consome
`@hywork/ui` consome também este arquivo, porque regra que mora em um repo só
não protege os outros.

## A regra que vale mais que todas

**Componente, prop ou token que você não conseguiu verificar na fonte não é
usado.**

Se o que você precisa não existe, a saída não é inventar em silêncio — é dizer
que está propondo algo novo e por quê. Propor é legítimo. Inventar calado é
como um repositório acaba com uma dúzia de versões do mesmo componente.

## Onde está a verdade, em ordem

1. **`tokens/semantico.css`** — cor, tipografia, foco, estado, tudo sob o prefixo
   `--hw-`. É daqui que sai toda decisão visual.
2. **`tokens/admin.css` e `tokens/portal.css`** — densidade e tamanho por
   superfície.
3. **`tokens/componentes.css`, `src/` e `manifest.json`** — execução e API.
4. **O inventário de componentes do repositório em que você está.**

O que **não** é fonte de verdade: o arquivo de design (que não é biblioteca
publicada), o que outro trecho do código faz, e o default de qualquer
biblioteca que a gente instalou.

## Proibições

- **Nunca escreva hex.** Nem em `className`, nem em `style`, nem em CSS. Se a cor
  que você quer não tem token, o token está faltando — peça, não contorne.
- **Nunca use cor arbitrária do Tailwind** (`bg-[#1e72a1]`). Mesma razão.
- **Nunca use a cor primária como campo de fundo.** Ela é acento: item ativo,
  botão de ação, borda de destaque. Fundo colorido é para **um** elemento por
  tela. Ignorar isso é o que faz a interface parecer "toda colorida" e é o erro
  mais comum aqui.
- **Nunca redeclare token em arquivo de feature.** `const PRIMARIA = "..."` numa
  tela é um token novo nascendo fora do sistema.
- **Nunca escreva `--hw-*` fora deste repositório.** Esse prefixo é do design
  system. O namespace `--color-*` é da aplicação, e num produto white-label ele
  pertence ao tema do cliente — sobrescrever ali apaga a marca dele.
- **Nunca deixe cor como único canal de informação.** Todo estado carrega ícone
  ou texto junto — a paleta não tem verde nem vermelho, e daltonismo não é caso
  raro.

## Ao construir

- **Superfície primeiro:** admin é denso (alvo 32px, corpo 14px), portal é
  confortável (alvo 44px, corpo 16px). Use os tokens de superfície em vez de
  escolher número.
- **Foco visível sempre:** `--hw-focus` com `--hw-focus-width` e
  `--hw-focus-offset`. O anel que vem por padrão na maioria dos scaffolds não
  passa em contraste; por isso o token existe.
- **Par bg/fg:** ao pintar um fundo, use a tinta que vem no par
  (`--hw-surface` com `--hw-surface-fg`). Combinar fundo de um par com tinta de
  outro é como se produz texto ilegível.
- **Movimento curto:** 120–200ms, e `prefers-reduced-motion` já está tratado nos
  tokens — não reintroduza duração fixa.

## Para o mantenedor humano

Token novo entra por PR, com o papel que ele cumpre escrito. Se a cor não existe
no guideline da marca, ela não entra como primitivo — vira derivado, com
justificativa no comentário.
