# Controles de coleção

## Propósito

Navegação, colunas, densidade e visões independentes de backend, autorização e taxonomia.

## Quando usar e quando evitar

Use na composição de fluxos que precisem deste contrato. Evite inventar capacidades remotas ou regras de domínio no componente.

## Anatomia e slots

Exports: `Pagination`, `ColumnControl`, `DensityControl`, `SavedViews`. Conteúdo e ações são nomeados pelo consumidor; wrappers preservam a semântica nativa.

## API e defaults

Pagination page (base 1), pageSize,total,onPageChange,onPageSizeChange; ColumnControl columns/value/onChange; DensityControl value/onChange; SavedViews views/value/onChange/onSave/onDelete. A fonte completa é `src/index.ts` e as declarações TypeScript do pacote; esta spec não amplia a API.

## Variantes e estados

Exercite vazio, preenchido, desabilitado e recuperação quando aplicáveis. Estado controlado deve refletir a fonte de dados do consumidor.

## Tokens consumidos

Papéis `--hw-surface`/`--hw-surface-fg`, `--hw-muted`/`--hw-muted-fg`, `--hw-focus` e tokens de tamanho da superfície; veja `tokens/componentes.css`. Sem cores arbitrárias.

## Admin, portal e mobile

Montserrat preservada. Admin: alvo mínimo de 32px. Portal e mobile: 44px. Inputs estreitos: texto mínimo de 16px. Tabela pode rolar no contêiner, nunca alargar a página.

## Teclado, foco e acessibilidade

Seletores e disclosures usam teclado nativo. Após salvar, SavedViews limpa o
nome e devolve foco ao campo; o botão vazio fica desabilitado. Tab segue para
Excluir visão quando houver seleção; o consumidor fecha preferências por Escape
e devolve foco ao gatilho. O callback de save não confirma persistência remota.

## Composição e erros comuns

Consumidor possui dados, permissões, rede, persistência e regras de negócio. Não interprete ausência como zero nem retry visual como envio confirmado. Fixtures do laboratório não comprovam adoção.

## Proveniência, status, owner e migração

Draft em 2026-09-05. Owners: Hywork Product Design e Hywork Frontend. Justificativa estrutural: Navegação, colunas, densidade e visões independentes de backend, autorização e taxonomia. Zero consumidores comprovados; promoção depende dos pilotos de outubro. Contrato executável: `stories/Collections.stories.tsx#Contents`.
