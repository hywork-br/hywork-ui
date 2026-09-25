# Contrato do design system

Documento normativo. Em conflito com qualquer outro texto deste repositório,
este prevalece — exceto contra decisão explícita e datada da PO ou do Vitor.

## 1. Escopo

Este repositório atende **dois consumidores**: `hywork-plataform` (admin) e
`hw-cloud-builder` (intranet do colaborador). Os demais repositórios do
workspace são backends ou NodeBB e não consomem este pacote.

Ele fornece: primitivas de interface, padrões de tarefa recorrente, tokens de
design e os dois catálogos Storybook.

Ele **não** implementa: produto, backend, autenticação, chamadas de API,
páginas de negócio, navegação de aplicação ou regras de tenant.

## 2. A fronteira, em três categorias

| Categoria | Definição | Destino |
|---|---|---|
| **Primitiva** | tijolo genérico, sem noção da tarefa | `src/core/` |
| **Padrão** | receita para tarefa recorrente do produto | `src/platform/` ou `src/builder/` |
| **Domínio** | conhece entidades do produto | **consumidor** |

**Teste decisivo:** se o componente sabe o que é um tenant, um workspace, um
colaborador ou uma campanha, ele é de domínio e não entra aqui. `TenantSwitcher`,
`UserNav`, `AdminPanelLayout` e `WorkspaceSwitcher` ficam no consumidor,
por contrato, e isso não muda com o tempo.

**Regra do segundo consumidor:** componente novo nasce no repositório que
precisa dele. Só sobe para cá quando o **segundo** consumidor precisar do mesmo.
Subir cedo demais congela uma API antes de se saber qual é a forma certa.

## 3. Core, Platform ou Builder

Entra em `core/` quando os dois produtos concordam na **anatomia** e divergem
apenas em **token**. Se divergem na anatomia, são dois componentes —
`platform/filter-bar` e `builder/filter-bar`, cada um com a sua story.

Não force um componente único com props condicionais para servir os dois. Um
componente com quinze props opcionais serve mal aos dois e não é adotado por
nenhum.

## 4. Fontes e precedência

1. Decisão vigente da PO registrada em [DOMAIN_MODEL.md](DOMAIN_MODEL.md).
2. Pedido vigente do Vitor e limites de migração dos consumidores.
3. [docs/design-guide.md](docs/design-guide.md) — critérios visuais.
4. [CROSS_STACK_CONVENTIONS.md](CROSS_STACK_CONVENTIONS.md) — integração, versão e migração.
5. `src/`, `tokens/`, `tailwind/` e o Storybook publicado.

Documento antigo e código existente **não** são mandato para manter um defeito.

## 5. Ao alterar

- Preserve APIs e estados, incluindo handlers e foco; registre qualquer ruptura
  no CHANGELOG com a versão em que ocorre.
- **Nenhuma cor literal em componente.** Token semântico e pares fundo/texto.
- Montserrat para produto. Não importar receitas de bibliotecas de terceiros.
- Mantenha o tema do cliente: variáveis da aplicação vencem os defaults `--hw-*`.
- Alvo de toque e escala de controle seguem o guia; não encolher alvo para
  parecer minimalista.
- Responsividade pertence ao componente. Uma página nunca decide como o
  componente se comporta em telas estreitas.
- Mudança visual deliberada exige registro da diferença e captura posterior.

## 6. Verificação

```bash
rtk npm run check && rtk npm run build && rtk npm run test:browser
rtk npm run smoke:consumer
```

O catálogo verde **não** prova cobertura de produto nem de acessibilidade.
A migração de cada fluxo do consumidor exige evidência própria, por tenant,
com captura antes e depois nos mesmos dados, largura e tema.

## 7. Versão e propagação

- Publicação por tag `v*`; o release gera o tarball como asset.
- O consumidor instala uma versão fixa e versiona o lockfile.
- **Nada se propaga sozinho.** Uma correção aqui só chega ao produto quando
  alguém sobe a versão no consumidor e abre PR.
- **Os dois consumidores sobem de versão na mesma sprint.** Sem essa regra, o
  Builder trava numa versão antiga e a divergência retorna — por versão, em vez
  de por código.

## 8. Proibições

- Criar componente genérico dentro de `hywork-plataform` ou `hw-cloud-builder`
  quando ele cabe aqui.
- Editar apenas a saída de uma transformação sem alterar a transformação:
  a próxima derivação apaga a correção.
- Alterar snapshot de procedência para fazer teste passar.
- Publicar tag sem os gates da mesma revisão aprovados.
- Apontar consumidor para branch flutuante em vez de versão fixa.
- Declarar cobertura total de produto ou de acessibilidade a partir do catálogo.
