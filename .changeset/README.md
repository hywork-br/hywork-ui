# Changesets

Cada mudança que altera a API pública inclui um changeset com impacto `patch`, `minor` ou
`major`. O comando `npm run release:version` aplica os arquivos pendentes ao `package.json` e
ao changelog antes da criação de uma tag imutável.

O pacote continua privado. A tag publica um tarball verificável no GitHub Release; um registry
só será escolhido quando a migração de outubro precisar dele.
