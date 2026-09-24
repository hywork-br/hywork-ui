# Memória e Aprendizados

Decisões tomadas e armadilhas encontradas. Leia antes de propor mudança
estrutural — evita refazer discussão já encerrada.

---

## 2026-09 · O repositório nasceu como espelho, não como fonte

A v0.7.0 foi uma **extração** do `hywork-plataform` na revisão `85a66ba`: 28
primitivas copiadas, tokenizadas e empacotadas, com `provenance/` guardando o
snapshot e `scripts/derive-platform.mjs` regenerando a partir dele.

Isso significa que, até aqui, o repositório **documentava o passado** em vez de
governar o futuro. A virada para fonte autoral acontece com os padrões novos
(filtro, listagem, card), que não têm exemplar bom no produto para extrair.

**Consequência prática:** enquanto houver componente derivado, editar apenas a
saída é perda garantida — a próxima derivação apaga. Altere a transformação.

---

## 2026-09 · Distribuir primitiva não resolve divergência

Antes de decidir o plano, medimos a adesão aos componentes que **já existiam**
nos consumidores:

| Primitiva | Platform usa | Builder usa |
|---|---|---|
| `Table` | 48% | **0%** |
| `Tabs` | 44% | **0%** |
| `Card` | 61% | 23% |
| `Carousel` | 1 uso | não usa |

O Builder tinha `Table` e `Tabs` no repositório e nenhum arquivo os importava.

**Aprendizado:** disponibilidade nunca foi o gargalo. Faltava a regra que diz
*quando usar* — e é por isso que o plano começa por tokens e padrões, não por
migrar as 28 primitivas.

---

## 2026-09 · Contagem de hex não distingue dívida de conteúdo

Contamos ~2.200 cores hex nos blocos do Page Builder e nos renderizadores
estáticos e chegamos a propor tokenização. **Estava errado.**

Ao classificar os 1.172 hex de `user-components/`:

- **943 são itens de array** — paletas oferecidas ao usuário final (ouro e prata
  de medalha, cores de confete)
- 274 são defaults de prop customizável
- 21 são classes Tailwind arbitrárias

Tokenizar esse trecho destruiria funcionalidade de customização do produto.

**Aprendizado:** antes de propor tokenização em qualquer área do Page Builder,
classifique os hex por natureza. A pergunta legítima é outra — quando o usuário
*não* customiza, o default deveria herdar a marca do tenant?

---

## 2026-09 · O tema do workspace não chega aos componentes do Builder

`hw-cloud-builder/lib/theme-utils.ts` grava a cor de marca do cliente em
`--color-primary`. O Tailwind do Builder lê `--primary`.

São nomes diferentes: a cor chega em 10 lugares e **não chega** nos 202 usos de
`bg-primary`/`text-primary`. O cliente configura o azul da empresa e a maior
parte da intranet continua com a cor padrão.

Correção prevista na fase de tokens do [plano](PLANO_DESIGN_SYSTEM.md).

---

## 2026-09 · `rounded-lg` significa coisas diferentes nos dois fronts

No Platform vale `0.75rem`; no Builder, derivado de `--radius`, vale `0.5rem`.
São **1.097 usos** de uma classe que renderiza diferente conforme o repositório,
e isso não estava escrito em lugar nenhum.

É o tipo de divergência que só o preset compartilhado encerra.

---

## 2026-09 · Três padrões eleitos estão fora do design system

Na votação dos padrões, a PO elegeu formatos que **não** são os do design
system atual:

| Padrão | Formato eleito | Onde ele está hoje |
|---|---|---|
| Carregamento | pulso escrito à mão | nas telas, não no `Skeleton` |
| Paginação | intervalo e setas | `smart-pagination`, local da tela de Usuários |
| Trilha | separador em seta | escrito à mão; o `Breadcrumb` usa barra |

**Aprendizado:** nesses três, o trabalho é **atualizar o componente do design
system para o formato eleito** e só então migrar. Começar migrando propaga o
formato errado.

---

## Armadilhas de integração

| Armadilha | Sintoma | Correção |
|---|---|---|
| Falta `node_modules/@hywork/ui/dist/**/*.js` em `content` | componente renderiza sem estilo nenhum | adicionar ao Tailwind do consumidor |
| Consumidor redefine `colors`/`spacing` em `theme.extend` | preset instalado, mas inerte | remover as duplicatas, validando por captura |
| `export *` não repassa default export | `import Input from ...` quebra em 151 arquivos | shim reexporta named **e** default |
| Banner `"use client"` no bundle | componentes antes server-side viram client | esperado; medir impacto antes de agir |
