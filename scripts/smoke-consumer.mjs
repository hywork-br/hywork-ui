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
  import { Button, Input, Table, Dialog, Select } from '@hywork/ui';
  import { createRequire } from 'node:module';
  const require=createRequire(import.meta.url);
  const preset=require('@hywork/ui/tailwind/platform-preset.cjs');
  if (![Button,Input,Table,Dialog,Select].every(Boolean)) throw Error('Missing export');
  if (!preset.theme.extend.colors.primary.DEFAULT.includes('--hw-')) throw Error('Missing token fallback');
`],{cwd:dir,stdio:'inherit'});
const installed=join(dir,'node_modules/@hywork/ui');
assert.ok(existsSync(join(installed,'dist/index.d.ts')));
assert.ok(readFileSync(join(installed,'dist/index.js'),'utf8').includes('use client'));
assert.equal(existsSync(join(installed,'provenance')),false);
assert.equal(existsSync(join(installed,'storybook-static')),false);
console.log('PASS installed tarball: runtime exports, declarations, client boundary, token preset; fixture '+dir);
