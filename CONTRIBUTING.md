# Contribuir

Use branch e PR com commits convencionais em inglês. Documentação interna em português.

Antes de alterar, leia [AGENTS.md](AGENTS.md) e [o guia](docs/design-guide.md).
Mostre qual uso do Platform a mudança atende e mantenha domínio fora do pacote.

## Mudanças geradas

`scripts/derive-platform.mjs` transforma a referência fixada em componentes e tokens.
Não edite só a saída: a próxima derivação apagaria a correção.
O snapshot em `provenance/` não pode ser alterado para fazer um teste passar.
Novos refinamentos devem ter transformação explícita, teste e diferença visual documentada.

## Gates

- `npm run check`: integridade, tipos, bundle e comportamento.
- `npm run build`: biblioteca, CSS e catálogo.
- `npm run test:browser`: fonte × pacote e interações nos dois navegadores.
- `npm run smoke:consumer`: instalação do tarball, exports e preset.
- `git diff --check`: higiene do diff.

Uma verificação nova deve reprovar uma mutação representativa. Não subir referências
visuais novas para encobrir uma regressão. Screenshots de CI ficam nos artefatos do run.

## Versão

0.7.0 altera APIs e caminhos de importação em relação a 0.6.x.
Publicação por tag exige os gates da mesma revisão aprovados; não apontar um
consumidor para uma tag ainda inexistente.
