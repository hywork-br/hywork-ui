# Plano de implementação

Como sair do estado atual — um espelho de 28 primitivas do Platform — para o
design system dos dois frontends.

Documento vivo: atualize o status conforme cada frente avança.

---

## Por que esta ordem

A varredura de 22/09/2026 sobre os dois frontends mostrou que **o problema não é
falta de componente**. O Builder tem `Table` e `Tabs` no repositório e nenhum
arquivo os importa; o `Carousel` existe no Platform com um único uso.

Distribuir as 28 primitivas via pacote não move nenhum desses números. O que
falta é outra categoria de coisa: **padrões** — a receita para tarefas
recorrentes (filtrar, listar, apresentar um item), que nunca existiram em lugar
nenhum. É por isso que migrar primitiva não abre a fila.

### O que foi medido

| Divergência | Quantidade |
|---|---|
| Implementações independentes de filtro | 9 |
| Implementações de card de item | 21 |
| Telas que listam dados sem o `Table` | 44 |
| Arquivos que montam abas sem o `Tabs` | 33 |
| Implementações de carrossel | 12 |
| Combinações de título de página | 9 |
| Cores diferentes de botão primário | 3 |
| Componentes divergentes entre Platform e Builder | 28 de 28 |

---

## Fases

### F0 · Contrato e estrutura ✅

Reorganizar o repositório nas três camadas e registrar as decisões.

- [x] Registrar os padrões decididos pela PO → [DOMAIN_MODEL.md](DOMAIN_MODEL.md)
- [x] Escrever o contrato → [AGENTS.md](AGENTS.md)
- [x] Alinhar a documentação nos consumidores e no workspace
- [x] Criar `src/core/`, `src/platform/`, `src/builder/` e distribuir as 28 primitivas
- [x] Separar `tokens/core.css`, `platform.css`, `builder.css`
- [x] Criar `builder-preset.cjs`
- [x] Dois `exports` no `package.json` e duas configurações de Storybook

**Saída:** repositório pronto para receber componente sem decisão de estrutura
pendente. Nenhum componente novo nesta fase.

### F1 · Tokens — Platform primeiro 🚧

**Escopo desta rodada: apenas o `hywork-plataform`.** O `hw-cloud-builder`
entra depois; o repositório já está preparado para ele (pasta `src/builder/`,
`tokens/builder.css`, `builder-preset.cjs` e catálogo próprio), mas nenhuma
migração foi feita lá.

- [ ] Aplicar em `tokens/` os valores de [DOMAIN_MODEL.md](DOMAIN_MODEL.md): título 24/bold,
      card raio 12 e respiro 24, estado vazio respiro 64, rótulo semibold
- [x] Instalar preset e tokens no `hywork-plataform` (v0.8.0-rc.1)
- [x] Converter as 28 primitivas do Platform em cascas de re-export
- [ ] Remover do `tailwind.config.ts` do Platform as chaves duplicadas que
      hoje vencem o preset — é o passo que muda pixel e pede captura

**Adiado para a rodada do Builder:**

- [ ] Instalar preset e tokens no `hw-cloud-builder`
- [ ] Alinhar `--primary` e `--radius` do Builder aos do Platform
- [ ] Corrigir `hw-cloud-builder/lib/theme-utils.ts`: o tema do workspace escreve
      `--color-primary`, mas o Tailwind lê `--primary` — a cor de marca do
      cliente não chega em 202 usos de `bg-primary`

**Por que primeiro:** é a única camada que alcança até o código que nunca será
migrado. Um token muda a cor de todo componente local que usa `bg-primary`.

**Resolve:** 6 alturas de controle, 7 raios, 9 títulos de página, 3 cores de
botão primário.

### F2 · Piloto — `FilterBar` 🚧

Um padrão, uma tela, ciclo completo ponta a ponta.

- [x] Levantar as 9 implementações: essencial × acidental
- [ ] Fechar a anatomia com design (1h) — a única reunião indispensável
- [x] Escrever a story **antes** do componente
- [x] Implementar `platform/filter-bar` — 6 stories, 11 testes
- [ ] Migrar `configurations/users` (o caso mais completo: 12 props, 5 campos)
- [ ] Tag, bump no Platform, preview, merge
- [ ] Repetir num filtro do Builder — é onde aparece o que só se vê com dois consumidores

**Saída:** uma tela em produção nos dois fronts usando o mesmo padrão, e a
mecânica inteira validada — empacotamento, Tailwind, `use client`, versão, revisão.

### F3 · Storybook por componente ✅

- [ ] Quebrar o catálogo único em uma story por primitiva
- [ ] Uma story por padrão, com os estados previstos
- [x] ~~Publicar os dois catálogos na Vercel~~ — **não se hospeda**: é
      biblioteca, não aplicação. Decisão do Rick, reafirmada em 25/09/2026.

**Por que importa:** é o que responde "como se faz um filtro neste produto" — a
pergunta que hoje cada tela respondeu sozinha.

### F4 · Demais padrões 🚧

Na ordem de impacto medido:

| Ordem | Padrão | Substitui | |
|---|---|---|---|
| 1 | `data-list` | 44 telas | ✅ |
| 2 | `item-card` | 21 implementações | ✅ |
| 3 | `empty-state` | 8 variações | ✅ |
| 4 | `page-title` | 9 combinações | ✅ |
| 5 | `row-actions` | 15 telas com botões soltos | 📋 |
| 6 | `upload-area` | 9 implementações | 📋 |

Ajustes nas primitivas existentes: `tabs` (sublinhado), `badge` (preenchido),
`breadcrumb` (seta), `skeleton` (pulso), `pagination` (intervalo e setas),
`label` (semibold), `form-message` (novo), `search-input` (arredondado).

### F5 · Adoção com trava 📋

- [ ] Migrar tela por tela, uma por PR, priorizando as mais acessadas
- [ ] Regra de lint barrando `<table>` cru e filtro montado à mão em código novo

**Sem a trava a adesão volta a cair** — foi assim que o `Table` chegou a 0% de
uso no Builder.

### F6 · Page Builder 📋

Os **47 pares duplicados** entre `plataform/src/pages-constructor/components/user-components/`
e `builder/components/static-renderer/components/static-*.tsx`.

Extrair o núcleo de renderização compartilhado, de modo que a aparência venha de
um lugar só e cada repositório contribua apenas com o que é seu — edição de um
lado, renderização do outro.

É a causa estrutural de "fica assim no editor e assado na intranet". Fica por
último porque sem F0–F3 não há onde colocar o núcleo compartilhado.

---

## Regras de execução

1. **Nunca migrar sem apagar.** Se o `FilterBar` entra, o `users-filters.tsx`
   sai no mesmo PR. Deixar os dois convivendo é como se chega a 12 implementações.
2. **Uma tela por PR.** O shim de re-export existe para nunca ser preciso um PR
   que toca 462 arquivos.
3. **Padrão novo nasce com story.** Componente sem story não é design system.
4. **Escreva a story antes do componente.** Se a story fica confusa, a API está
   errada — descobrir ali custa uma hora.
5. **Os dois consumidores sobem de versão na mesma sprint.**
6. **Não suba na primeira vez que precisar.** Só quando o segundo consumidor
   precisar do mesmo.

---

## Baseline

Números de 22/09/2026, reproduzíveis por varredura de código.

| Indicador | Base | Hoje | Meta |
|---|---|---|---|---|
| Implementações de filtro | 9 | **7** | 1 |
| Implementações de card de item | 21 | 1 + variantes |
| Telas listando sem o `Table` | 44 | 44 | 0 |
| Arquivos com abas à mão | 33 | 33 | 0 |
| Implementações de carrossel | 12 | 12 | 1 |
| Combinações de título de página | 9 | 9 | 1 |
| Cores de botão primário | 3 | 3 | 1 (token) |
| Adesão do Builder a `Table` e `Tabs` | 0% | 0% | 70% |
| Definições de cor primária no produto | 2 | **1** | 1 |
| Elementos duplicados entre repositórios | 47 | 47 | 0 |

---

## O que o design system já entrega

| | |
|---|---|
| Primitivas em `core/` | 28 |
| Padrões em `platform/` | 6 — FilterBar, DataList, ItemCard, EmptyState, PageTitle, ListPagination |
| Stories | 6, cobrindo os estados de cada padrão |
| Testes | 44 |
| Decisões da PO implementadas | 9 de 18 |
| Componentes autorais | badge, tabs, label, skeleton |

**Telas migradas no Platform:** Usuários (filtro e paginação), Desafios (filtro),
modal de troca de telefone (paginação), Fórum e Integrações (estado vazio).
Dois componentes locais foram apagados: `users-filters.tsx` e
`smart-pagination.tsx`.

## O que falta, e por que não foi feito agora

A fundação está pronta e os padrões existem — o que resta é **migração de tela**,
que é repetição do ciclo já provado, uma tela por PR:

| Frente | Volume | Observação |
|---|---|---|
| Filtros restantes | 6 telas | duas são painel lateral, anatomia diferente |
| Cards | 21 implementações | cada uma pede revisão do conteúdo |
| Listagens | 44 telas | a maior; muitas com colunas e ações próprias |
| Estados vazios | 8 | mecânico |
| Títulos de página | 9 | vários não são cabeçalho simples — o do Perfil é um campo editável sobre banner |
| Abas | 33 arquivos | — |
| Carrossel | 12 | — |

Não migrei em massa por decisão: cada tela precisa de conferência visual com
dados reais, e um `sed` sobre 44 arquivos de JSX troca um problema conhecido por
um desconhecido.

**Padrões ainda a criar:** `row-actions`, `upload-area`, `search-input` e
`form-message`.

## Decisões em aberto

Bloqueiam implementação. Ver [PADROES.md](PADROES.md#decisões-em-aberto).

1. **Modal** — um tamanho ou dois com regra de uso?
2. **Indicador de status** — quais estados existem e qual cor cada um recebe?

---

## Histórico

| Data | Marco |
|---|---|
| 17/09/2026 | Extração inicial: 28 primitivas do Platform (v0.7.0) |
| 22/09/2026 | Varredura de divergências nos dois frontends |
| 23/09/2026 | 18 padrões decididos pela PO |
| 24/09/2026 | Contrato, documentação e plano alinhados nos repositórios |
| 24/09/2026 | Estrutura em três camadas, dois catálogos, `develop` criada (v0.8.0-rc.1) |
| 24/09/2026 | Platform consumindo o pacote: 28 primitivas viraram cascas de re-export |
| 24/09/2026 | Preset ativado no Platform: 8 chaves duplicadas removidas, equivalência provada |
| 24/09/2026 | `FilterBar` criado — primeiro padrão autoral do design system |
| 24/09/2026 | Badge, Tabs, Label e Skeleton conforme a decisão da PO; saem da derivação |
| 24/09/2026 | DataList, ItemCard, EmptyState, PageTitle e ListPagination criados |
