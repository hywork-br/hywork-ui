# 0001 — Modelo de autoridade do design system

**Status:** aprovado para a linha 0.6
**Data:** 2026-09-01

## Decisão

`@hywork/ui` é a fonte executável dos contratos compartilhados de interface da
Hywork. A autoridade é dividida em quatro camadas, nesta ordem:

1. `tokens/primitivos.css`: fatos da marca;
2. `tokens/semantico.css`: papéis de produto e acessibilidade;
3. `tokens/admin.css` e `tokens/portal.css`: densidade por superfície;
4. `tokens/componentes.css` e `src/`: componentes e padrões executáveis.

O Storybook documenta a API publicada. Ele não substitui código, testes ou o
produto real como evidência.

## Limite da padronização

Padronizamos shell, estados, foco, filtros, tabela e vocabulário visual. A
renderização de cada domínio continua no consumidor. Academy, Conteúdos, TV,
Assinaturas e Campanhas podem compartilhar a mesma gramática sem esconder seus
campos, ações ou dados específicos.

## Distribuição

O pacote continua distribuído por tag Git. Toda mudança perceptível exige
changelog, versão e PR. Tags publicadas são imutáveis.

## Fora de escopo desta linha

- migração automática de produto;
- autenticação, dados, cache ou query client;
- regras específicas de feature;
- substituição silenciosa do white-label do tenant;
- publicação ou deploy de consumidores.

## Consequências

- componentes comuns deixam de ser copiados entre produtos;
- exceções locais precisam declarar por que não pertencem ao pacote;
- adoção será uma etapa explícita em outubro, com inventário antes/depois;
- nenhum número de maturidade é preenchido manualmente quando pode ser medido.
