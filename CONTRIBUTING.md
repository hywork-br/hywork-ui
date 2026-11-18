# Contribuir

Commits convencionais em inglês. Documentação interna em português.

Antes de alterar, leia [AGENTS.md](AGENTS.md) (contrato) e
[DOMAIN_MODEL.md](DOMAIN_MODEL.md) (padrões já decididos pela PO).
Mostre qual uso dos consumidores a mudança atende e mantenha domínio fora do pacote.

## Branches e worktrees

Este repositório segue o mesmo fluxo do `hywork-plataform` e do `hw-cloud-builder`:

| Branch | Papel |
|---|---|
| `develop` | integração — base de toda tarefa; recebe só PR, com os checks verdes |
| `main` | o que está publicado; recebe a `develop` por PR, com 1 aprovação |
| `feat/*`, `fix/*` | tarefa, sempre criada em worktree |

**"Criar uma branch" significa criar a worktree com ela**, a partir da
`origin/develop` recém-buscada:

```bash
rtk git -C hywork-ui fetch origin develop
rtk git -C hywork-ui worktree add --no-track -b <branch> \
    ../.worktrees/ui-<slug> origin/develop
cd ../.worktrees/ui-<slug>
ln -s ../../hywork-ui/node_modules node_modules
```

`--no-track` é obrigatório: sem ele o upstream da branch vira `origin/develop` e
um `git push` sem argumento tenta empurrar a tarefa para a integração.

`develop` e `main` ficam **só no repositório principal** — uma branch só pode
estar aberta num lugar, e merge é sempre no principal.

Ao retomar uma worktree que já existe, atualize antes de editar:

```bash
rtk git -C hywork-ui fetch origin develop
rtk git -C ../.worktrees/ui-<slug> merge origin/develop
```

Merge, nunca rebase — os commits normalmente já foram publicados.

## Mudanças geradas

`scripts/derive-platform.mjs` transforma a referência congelada em
`provenance/` nas primitivas de `src/core/`. **Não edite só a saída:** a próxima
derivação apagaria a correção. Altere a transformação.

O snapshot em `provenance/` não pode ser alterado para fazer um teste passar.

Tokens e presets **não** são mais gerados — viraram autorais e divididos em
`core` / `platform` / `builder`. Edite-os diretamente.

Componentes novos (padrões como `FilterBar`, `DataList`) nascem autorais, fora
do fluxo de derivação.

## Gates

- `npm run check` — integridade, tipos, bundle e comportamento
- `npm run build` — biblioteca, CSS e os dois catálogos
- `npm run test:browser` — paridade e interações em Chromium e Firefox
- `npm run smoke:consumer` — instalação do tarball, exports e preset
- `npm run audit:gate` — nenhum aviso alto ou crítico do `npm audit` fora das
  exceções de `scripts/audit-gate.mjs`, cada uma com motivo e data de revisão
- `git diff --check` — higiene do diff

Uma verificação nova deve reprovar uma mutação representativa. Não subir
referências visuais novas para encobrir uma regressão.

## Versão e propagação

Publicação por tag `v*`, com os gates da mesma revisão aprovados. Nunca apontar
um consumidor para tag inexistente nem para branch flutuante.

Push direto na `develop` e na `main` é recusado (HCK-440). Todo PR vai para a
`develop`, com o card no título (ex.: `HCK-123`) ou o rótulo `sem-card`. A release:

1. **Bump por PR na `develop`:** branch `release/vX.Y.Z` a partir da
   `origin/develop`, com a versão em `package.json`, `package-lock.json` e
   `manifest.json` e a entrada do `CHANGELOG.md`. PR para a `develop`; o merge é
   pelo GitHub, com os checks verdes.
2. **PR `develop` → `main`:** exige 1 aprovação. O check "release sem pendência"
   barra o PR se a `main` tiver hotfix que não voltou para a `develop`.
3. **Tag depois do merge,** no commit da `main` (push de tag não passa pela regra
   de branch). A tag dispara o `release.yml`, que gera o tarball:

   ```bash
   rtk git -C hywork-ui fetch origin main
   rtk git -C hywork-ui tag vX.Y.Z origin/main
   rtk git -C hywork-ui push origin vX.Y.Z
   ```

**0.8.0** reorganiza o pacote em três camadas e muda os caminhos de importação:
`@hywork/ui` passa a `@hywork/ui/platform` ou `@hywork/ui/builder`. A entrada
antiga continua funcionando, apontando para `platform`.

Os dois consumidores sobem de versão **na mesma sprint**; atraso máximo de uma
minor, registrado no PR. Ver
[CROSS_STACK_CONVENTIONS.md](CROSS_STACK_CONVENTIONS.md).
