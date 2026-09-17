# Checklist de adoção por fluxo

Atualizado em 17/09/2026: primeiro consumidor `hywork-plataform`, pacote v0.6.2.
O nome do arquivo permanece para preservar links do planejamento de outubro.
Contexto e aceite: [handoff do Platform](platform-handoff.md).

## Antes

- [ ] branch dedicada por consumidor;
- [ ] baseline regenerado no commit que será migrado;
- [ ] tag do pacote fixada, nunca `main`;
- [ ] rotas piloto, owner técnico e owner de produto/design definidos na PR;
- [ ] screenshots desktop e mobile do produto atual, com viewport, dados e tema registrados;
- [ ] contrato de white-label conferido.

## Por componente

- [ ] comparar props locais com a API do pacote;
- [ ] manter regra de negócio no consumidor;
- [ ] migrar imports sem alterar dados ou fluxo;
- [ ] comparar altura, espaçamento, tipografia, bordas, ícones e estados com o baseline;
- [ ] diferença perceptível corrigida ou aprovada nominalmente e registrada na PR;
- [ ] uso de API `draft` explicitamente avaliado, sem promoção automática;
- [ ] testar teclado, foco, loading, vazio, sem resultado e erro;
- [ ] rodar typecheck, build e fluxo real;
- [ ] capturar antes/depois com os mesmos dados, estado, viewport e tema;
- [ ] conferir tanto o tema padrão quanto um tema de cliente utilizado no fluxo.

## Depois

- [ ] rodar `audit-adoption`;
- [ ] remover cópia local apenas quando não houver imports;
- [ ] registrar exceções com owner e data;
- [ ] atualizar scorecard e changelog;
- [ ] PR e review humano; nunca merge automático.
