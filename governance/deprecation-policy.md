# Política de depreciação

## Entrada em depreciação

Uma API só recebe status `deprecated` quando existe alternativa pública, guia de troca e owner.
O changelog registra motivo, consumidores conhecidos e primeira versão com aviso.

## Janela

- componente beta: remoção apenas na próxima minor, com um ciclo completo de aviso;
- componente stable: remoção somente em major;
- token stable: alias temporário quando a compatibilidade for tecnicamente segura;
- padrão draft: pode mudar sem shim, mas stories e contratos precisam mudar no mesmo PR.

## Saída

Antes de remover, o auditor de adoção deve provar zero importadores no escopo legível. Falha de
leitura é `SEM LEITURA`, nunca zero. A remoção inclui changeset, changelog, atualização do
manifesto e instrução de rollback.

## Exceções

Falha crítica de segurança ou acessibilidade pode encurtar a janela. O PR precisa registrar o
risco, a alternativa imediata e a aprovação dos owners de design e frontend.
