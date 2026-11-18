---
name: release-ds
description: Lançar uma versão do @hywork/ui (bump por PR, PR develop → main, tag v* que gera o tarball) e levá-la aos fronts. Use ao publicar uma versão nova do design system, ao conferir se uma tag saiu ou ao subir a versão do pacote no hywork-plataform.
---

# release-ds: versão do design system e consumo nos fronts

O pacote não vai para o npm (`"private": true`). Uma versão existe quando a tag `vX.Y.Z` está
na `main`: o push da tag dispara o `.github/workflows/release.yml`, que roda `npm ci`,
`npm run check`, `npm run build` e `npm run audit:gate`, empacota com `npm pack` e cria o
GitHub Release com o `.tgz` (`gh release create … --generate-notes --verify-tag`).

## Para o Claude

### Mudança no componente
1. Worktree `../.worktrees/ui-<slug>` a partir da `origin/develop` recém-buscada, com
   `--no-track` e o `node_modules` por symlink (passo a passo em `CONTRIBUTING.md`).
2. Antes do PR: `rtk npm run check && rtk npm run build`; com mudança visual, também
   `rtk npm run test:browser`.
3. PR para a `develop` com o card no título (`HCK-123 - …`) ou o rótulo `sem-card`. Checks:
   "PR tem card" (`pr-regras.yml`) e `checks` (`ci.yml`: `check`, `smoke:consumer`, `build`,
   `audit:gate` e Playwright em Chromium e Firefox). O merge é pelo GitHub.

### Release
4. Branch `release/vX.Y.Z` a partir da `origin/develop`, com a versão nova em `package.json`,
   `package-lock.json` e `manifest.json` e a entrada no topo do `CHANGELOG.md` (ruptura de API
   sempre registrada). PR para a `develop`; o merge é pelo GitHub, com os checks verdes.
5. PR `develop` → `main`: exige 1 aprovação de outra pessoa. O check "release sem pendência"
   barra se a `main` tem hotfix que não voltou: abra antes o PR `main` → `develop`.
6. Depois do merge na `main`, a tag no commit da `main` (o push de tag não passa pela regra
   de branch). A tag publica a versão: só com o aval de quem pediu a release.
   ```bash
   rtk git -C hywork-ui fetch origin main
   rtk git -C hywork-ui tag vX.Y.Z origin/main
   rtk git -C hywork-ui push origin vX.Y.Z
   ```
7. Confira o run do `release` e o asset: `rtk gh release view vX.Y.Z -R hywork-br/hywork-ui`.

### Consumo nos fronts
8. `hywork-plataform`: PR de bump no front, nunca automático. Instale passando a referência
   (só trocar a linha pode servir a versão anterior do cache do npm):
   `rtk npm install "github:hywork-br/hywork-ui#vX.Y.Z"`, confira o commit no
   `package-lock.json`, rode build e testes e valide no preview da Vercel (skill
   `front-release` do front).
9. `hw-cloud-builder`: **ainda não instala o pacote** (`INDEX.md`, "Consumidores"). Quando
   adotar, a entrada é `@hywork/ui/builder`, fixada numa tag do mesmo jeito.
10. Os dois consumidores sobem na mesma sprint; atraso máximo de uma minor, registrado no PR.
11. Desenvolvimento local sem tag: `"@hywork/ui": "file:../hywork-ui"` no `package.json` do
    consumidor, só na máquina e nunca commitado, com `rtk npm run build:lib -- --watch` aqui.

## Para você
- Quer a versão no ar: aprove o PR `develop` → `main` (ou peça a outra pessoa) e dê o aval da
  tag. O Claude cria a tag e confere o release.
- Para o produto receber a versão, aprove o PR de bump no `hywork-plataform`, depois de
  validar no preview.
- Nunca aponte um front para tag que não existe nem para branch: só `#vX.Y.Z`.
