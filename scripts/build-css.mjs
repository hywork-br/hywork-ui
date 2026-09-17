import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import postcss from 'postcss';
import tailwind from 'tailwindcss';
import autoprefixer from 'autoprefixer';
const require=createRequire(import.meta.url);
const raw=JSON.parse(readFileSync('provenance/platform/tailwind.json','utf8'));
const packageConfig=require('../tailwind/platform-preset.cjs');
const content=['./src/**/*.tsx','./provenance/platform/components/**/*.tsx','./stories/**/*.tsx','./tests/fixtures/**/*.tsx'];
mkdirSync('.storybook/static',{recursive:true});
// Both renders use the consumer's base/input CSS; only the component/token implementation changes.
const context=readFileSync('provenance/platform/context.css','utf8');
for (const [name,config] of [['source',{...raw,plugins:[require('tailwindcss-animate')]}],['package',packageConfig]]) {
  const input=(name==='package'?readFileSync('tokens/platform.css','utf8')+'\n':'')+context;
  const result=await postcss([tailwind({...config,content}),autoprefixer]).process(input,{from:undefined});
  writeFileSync(`.storybook/static/${name}.css`,result.css);
}
console.log('Built source and package CSS from the pinned Platform context');
