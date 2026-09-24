# Moldura do admin (referência)

A moldura do hywork-plataform (sidebar, cabeçalho e painel de conteúdo) é de domínio e fica
no consumidor, pelo `AGENTS.md` §2. Esta página registra como ela é em produção, para que
protótipo, Storybook e telas novas não reinventem a moldura. Lida no `hywork-plataform`
`2f9a5d0` (23/09/2026) e conferida com print de produção do Vitor em 24/09/2026.

| Parte | Como é | Fonte no hywork-plataform |
|---|---|---|
| Fundo da moldura | `#EFF0F1` na sidebar, no cabeçalho e atrás do conteúdo (`bg-admin-bg`, `--hw-color-admin-sidebar`) | `components/ui/sidebar.tsx:73`, `admin-panel-layout.tsx:26`, `navbar.tsx:7` |
| Sidebar | 18rem (64px recolhida); logo da Hywork no alto; seletor de espaço num cartão branco de 56px; grupos de menu; cartão da HyStore no pé | `sidebar.tsx:55-110`, `menu.tsx`, `hystore-card.tsx` |
| Item de menu | 40px, `rounded-lg`, texto 14px semibold na primária; ativo e hover com fundo branco e texto laranja | `menu.tsx:338-343` |
| Rótulo de grupo | 12px, maiúsculas, espaçado | `menu.tsx:132` |
| Cabeçalho | 56px, sem título nem trilha; só a pessoa (avatar, nome, e-mail) à direita | `navbar.tsx`, `user-nav.tsx` |
| Painel de conteúdo | branco (`bg-background`), canto superior esquerdo `rounded-tl-xl`; a página dá respiro de 24px | `content-layout.tsx:27`, `news-page.view.tsx:174` |

## Pontos em aberto

- **Laranja do item ativo.** Produção usa `text-orange-500` sobre branco: 2,8:1, reprova para
  texto de 14px. `orange-700` passa (5,2:1). O pacote não tem token de destaque laranja;
  precisa de decisão da PO.
- **Rótulo de grupo.** Produção usa `#8899a8` sobre `#EFF0F1`, abaixo de 4,5:1. A sugestão é
  `text-muted-foreground`.
