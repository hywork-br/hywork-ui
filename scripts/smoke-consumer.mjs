import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
const dir=mkdtempSync(join(tmpdir(),'hywork-ui-consumer-'));
// Do not forward npm-run's CLI-only user policy into a nested project install.
const env={...process.env};
for (const key of Object.keys(env)) {
  if (/^npm_config_(allow[_-]scripts|userconfig)$/i.test(key)) delete env[key];
}
env.npm_config_userconfig=join(dir,'.npmrc');
writeFileSync(env.npm_config_userconfig,'');
const run=(args,cwd=process.cwd())=>execFileSync('npm',args,{cwd,env,encoding:'utf8',stdio:['ignore','pipe','pipe']});
run(['run','build:lib']);
const [pack]=JSON.parse(run(['pack','--json','--ignore-scripts','--pack-destination',dir]));
writeFileSync(join(dir,'package.json'),JSON.stringify({name:'platform-consumer-smoke',private:true,type:'module'}));
run(['install',join(dir,pack.filename),'react@18.3.1','react-dom@18.3.1','tailwindcss@3.4.17','--ignore-scripts','--no-audit','--no-fund'],dir);
execFileSync(process.execPath,['--input-type=module','-e',`
  import { Button, Input, Table, Dialog, Select, BrandTheme } from '@hywork/ui';
  import { brandThemeVars } from '@hywork/ui/theme';
  import { findTokenOverrides } from '@hywork/ui/consumer-check';
  import { createRequire } from 'node:module';
  import { readFileSync } from 'node:fs';
  const require=createRequire(import.meta.url);
  const preset=require('@hywork/ui/tailwind/platform-preset.cjs');
  if (![Button,Input,Table,Dialog,Select,BrandTheme].every(Boolean)) throw Error('Missing export');
  // O design system declara as variáveis e o preset as lê sem fallback.
  if (preset.theme.extend.colors.primary.DEFAULT!=='hsl(var(--primary) / <alpha-value>)') throw Error('Preset does not read --primary');
  if (!readFileSync(require.resolve('@hywork/ui/tokens/core.css'),'utf8').includes('--primary: var(--hw-brand-primary,')) throw Error('Missing app contract');
  if (!brandThemeVars('#434cad')['--hw-brand-primary']) throw Error('Brand helper broken');
  if (findTokenOverrides({css:':root{--primary:0 0% 0%}'}).length!==1) throw Error('Consumer check broken');
`],{cwd:dir,stdio:'inherit'});
const installed=join(dir,'node_modules/@hywork/ui');
assert.ok(existsSync(join(installed,'dist/index.d.ts')));
assert.ok(readFileSync(join(installed,'dist/index.js'),'utf8').includes('use client'));
// As entradas puras não levam "use client": rodam em Server Component e em Node.
for (const pure of ['dist/theme.js','dist/consumer-check.js'])
  assert.equal(readFileSync(join(installed,pure),'utf8').includes('use client'),false,pure+' must not be a client module');
assert.equal(existsSync(join(installed,'provenance')),false);
assert.equal(existsSync(join(installed,'storybook-static')),false);
console.log('PASS installed tarball: runtime exports, declarations, client boundary, token contract, brand helper, consumer check; fixture '+dir);
