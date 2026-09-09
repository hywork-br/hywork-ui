# Checklist da migração de outubro

## Antes

- [ ] branch dedicada por consumidor;
- [ ] baseline regenerado no commit que será migrado;
- [ ] tag do pacote fixada, nunca `main`;
- [ ] screenshot desktop e mobile das rotas piloto;
- [ ] contrato de white-label conferido.

## Por componente

- [ ] comparar props locais com a API do pacote;
- [ ] manter regra de negócio no consumidor;
- [ ] migrar imports sem alterar dados ou fluxo;
- [ ] testar teclado, foco, loading, vazio, sem resultado e erro;
- [ ] rodar typecheck, build e fluxo real;
- [ ] capturar antes/depois.

## Depois

- [ ] rodar `audit-adoption`;
- [ ] remover cópia local apenas quando não houver imports;
- [ ] registrar exceções com owner e data;
- [ ] atualizar scorecard e changelog;
- [ ] PR e review humano; nunca merge automático.
