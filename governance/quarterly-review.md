# Revisão trimestral do sistema

Executar na primeira semana útil de janeiro, abril, julho e outubro.

## Preparação automatizada

1. congelar as revisões lidas de Platform e Builder;
2. rodar `npm run audit:consumers -- --output governance/consumer-baseline.json`;
3. rodar `npm run audit:adoption` em cada consumidor legível;
4. rodar `npm run check`, `npm run smoke:consumer`, `npm run build` e auditoria de dependências;
5. comparar baselines visuais de admin, portal e mobile.

## Decisões humanas

- promover, manter, depreciar ou remover cada contrato;
- revisar owners e ausência de segundo aprovador;
- validar exceções locais e suas datas;
- priorizar forks com maior uso e divergência;
- registrar novas decisões críticas em ADR.

## Saída obrigatória

Abrir um PR de governança com scorecard antes/depois, revisões dos consumidores, gaps `SEM
LEITURA`, decisões de status e próxima data. A revisão não migra código de produto por conta
própria.
