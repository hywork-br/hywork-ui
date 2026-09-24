# Changelog

## Não publicado

- **Dialog** passa a autoral, pela decisão da PO de 23/09 (Modal). O rodapé fica em linha
  e à direita em qualquer largura; antes empilhava em largura total abaixo de 640px. O
  conteúdo ganha `gap-6` entre cabeçalho, corpo e rodapé: o `gap-4` do Content não chegava
  nos filhos, que ficavam colados. Botão de fechar com alvo de 40px e nome "Fechar".
  Cabeçalho sempre alinhado à esquerda, com espaço para o botão de fechar.
- **DataList** com `onRowClick` abre a linha pelo teclado (Tab até a linha, Enter ou
  espaço), com foco visível.
- **PageTitle**: a área de ações pode encolher e quebrar linha; em 320px dois botões
  vazavam a tela. O `mb-6` continua.
- **FilterBar.Chips** e **ListPagination**: controles de 40px, o piso do guia; os chips
  agora alinham pela base com os campos de 40px ao lado.
- Token `--hw-color-admin-sidebar` passa de `30 58 95` (navy, que nenhuma tela usava) para
  `239 240 241`, a cor real da sidebar do hywork-plataform. Referência da moldura em
  [docs/admin-shell.md](docs/admin-shell.md).

## 0.7.0 — em preparação

- Escopo exclusivo do hywork-plataform.
- 28 famílias extraídas da revisão técnica fixada do produto, com APIs preservadas.
- Tokens e preset Tailwind 3 gerados; tema do consumidor tem precedência.
- Guia de design distingue referência existente de padrão visual desejado.
- Catálogo de componentes, procedência e teste fonte × pacote.
- Slider preserva uso controlado e corrige thumb com defaultValue e nome acessível.
- Contraste corrigido em texto de estado e caption; scroll por teclado, headings
  e preferência de movimento reduzido explícitos.

Esta versão muda a API e os caminhos de CSS/preset de 0.6.x. Não é atualização
automática: seguir [o handoff](docs/platform-handoff.md).
