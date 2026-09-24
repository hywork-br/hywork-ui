import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
/**
 * Componentes que deixaram de ser derivados.
 *
 * Quando a PO decide um padrão visual para um componente, ele para de ser
 * espelho da extração e passa a ser autoral: a fonte da verdade vira a
 * decisão registrada em DOMAIN_MODEL.md, não mais provenance/.
 *
 * A derivação não os reescreve e a paridade não os compara — comparar um
 * componente autoral com a referência congelada só acusaria a decisão como
 * se fosse regressão.
 */
export const authoredNames = ['badge'];

export const componentNames = 'accordion alert-dialog alert avatar badge breadcrumb button card checkbox collapsible dialog dropdown-menu input label popover progress radio-group scroll-area select separator sheet skeleton slider switch table tabs textarea tooltip'.split(' ');
const hash = (s) => createHash('sha256').update(s).digest('hex');
const read = (p) => readFileSync(resolve(root, p), 'utf8');
const put = (p, s) => { const path = resolve(root, p); mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, s); };
const json = (x) => JSON.stringify(x, null, 2) + '\n';

export function normalizeImports(source) {
  return source.replaceAll('@/lib/utils', '../../lib/cn').replaceAll('@/components/ui/button', '../button');
}

export function tokenize(source) {
  return source.replace(/(bg|text|border|divide|ring|fill|stroke)-\[#([\da-fA-F]{3,8})\]/g,
    (_, utility, hex) => {
      const name = tableColors[hex.toLowerCase()];
      if (!name) throw new Error('Assign a semantic role before extracting color '+hex);
      return `${utility}-hw-table-${name}`;
    });
}

const tableColors = {
  e5e7eb: 'border', f9fafb: 'surface', f3f4f6: 'selected',
  '637381': 'heading', '1f272f': 'foreground', '8899a8': 'caption',
};

export function extractComponent(name, source) {
  // A referência congelada em provenance/ guarda os componentes como estavam
  // em src/components/<nome>.tsx. Eles passaram a viver em
  // src/core/<nome>/index.tsx — um nível mais fundo — então os imports
  // relativos são reprofundados aqui, sem tocar no snapshot.
  let result = tokenize(source)
    .replaceAll('from "../lib/cn"', 'from "../../lib/cn"')
    .replaceAll('from "./button"', 'from "../button"');
  // Respect motion preference on package elements, never through a global reset.
  result = result.replace(/\b(animate-[\w-]+)(?=[\s"])/g, '$1 motion-reduce:!animate-none')
    .replace(/\b(transition(?:-[\w-]+)?)(?=[\s"])/g, '$1 motion-reduce:!transition-none');
  if (name === 'button') result = result.replace(/text-(success|warning|error|info)-foreground/g, 'text-hw-on-status');
  if (name === 'badge') result = result
    .replace('secondary: "text-secondary"', 'secondary: "text-muted-foreground"')
    .replaceAll('text-red-400 dark:text-red-400', 'text-hw-status-danger dark:text-red-400')
    .replaceAll('text-emerald-400 dark:text-emerald-400', 'text-hw-status-success dark:text-emerald-400')
    .replaceAll('text-yellow-400 dark:text-yellow-400', 'text-hw-status-warning dark:text-yellow-400')
    .replaceAll('text-blue-400 dark:text-blue-400', 'text-hw-status-info dark:text-blue-400');
  if (name === 'alert') result = result.replace(/text-(success|warning|error|info)(?![\w-])/g,
    (_, role) => 'text-hw-status-'+(role==='error'?'danger':role));
  if (name === 'scroll-area') result = result.replace(
    '<ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">',
    '<ScrollAreaPrimitive.Viewport tabIndex={0} className="h-full w-full rounded-[inherit] focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">');
  if (name === 'card') result = result.replace('<h3', '<h2');
  if (name === 'alert') result = result.replace('<h5', '<h2');
  if (name === 'slider') {
    // Preserve the API while making its declared defaultValue and label usable.
    result = result.replace('props.value?.map((_, i)', '(props.value ?? props.defaultValue ?? [0]).map((_, i)');
    result = result.replace('key={i}', 'key={i}\n            aria-label={props["aria-label"]}\n            aria-labelledby={props["aria-labelledby"]}');
  }
  return result.trimEnd()+'\n';
}

export function derive() {
  const provenance = JSON.parse(read('provenance/platform/source.json'));
  const original = JSON.parse(read('provenance/platform/tailwind.json'));
  const context = read('provenance/platform/context.css');
  const tokens = {};
  const dark = {};
  const declarations = (text) => Object.fromEntries([...text.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)].map(m => [m[1], m[2].trim()]));
  const defaults = declarations(context.match(/:root\s*\{([^}]+)\}/s)?.[1] ?? '');
  const darkDefaults = declarations(context.match(/\.dark\s*\{([^}]+)\}/s)?.[1] ?? '');
  const config = structuredClone(original);
  config.content = ['./src/**/*.{ts,tsx}', './stories/**/*.{ts,tsx}', './tests/fixtures/**/*.{ts,tsx}'];
  config.plugins = [];
  const defaultsTheme = require('tailwindcss/defaultTheme');
  config.theme.extend.spacing = {...defaultsTheme.spacing, ...config.theme.extend.spacing};
  tokens['--hw-font-body'] = '"Montserrat", Arial, sans-serif';
  config.theme.extend.fontFamily = {
    sans: ['var(--font-montserrat, var(--hw-font-body))'],
    montserrat: ['var(--font-montserrat, var(--hw-font-body))'],
  };
  for (const [key, [size, properties]] of Object.entries(config.theme.extend.fontSize)) {
    tokens[`--hw-text-${key}`] = size;
    tokens[`--hw-leading-${key}`] = properties.lineHeight;
    config.theme.extend.fontSize[key] = [`var(--hw-text-${key})`, {lineHeight:`var(--hw-leading-${key})`}];
  }
  for (const [key, value] of Object.entries(config.theme.extend.fontWeight)) {
    tokens[`--hw-weight-${key}`] = value;
    config.theme.extend.fontWeight[key] = `var(--hw-weight-${key})`;
  }
  const color = (value, key) => {
    if (typeof value !== 'string') return Object.fromEntries(Object.entries(value).map(([k,v]) => [k,color(v,`${key}-${k}`)]));
    const token = `--hw-${key.toLowerCase()}`;
    const alias = value.match(/^hsl\(var\(--([\w-]+)\)\)$/);
    if (alias) {
      if (!defaults[alias[1]]) throw new Error(`Missing Platform default: ${alias[1]}`);
      tokens[token] = defaults[alias[1]];
      if (darkDefaults[alias[1]]) dark[token] = darkDefaults[alias[1]];
      return `hsl(var(--${alias[1]}, var(${token})) / <alpha-value>)`;
    }
    const hsl = value.match(/^hsl\(([^)]+)\)$/);
    if (hsl) { tokens[token] = hsl[1]; return `hsl(var(${token}) / <alpha-value>)`; }
    if (/^#[\da-f]{6}$/i.test(value)) {
      tokens[token] = [1,3,5].map(i => parseInt(value.slice(i,i+2),16)).join(' ');
      return `rgb(var(${token}) / <alpha-value>)`;
    }
    return value;
  };
  config.theme.extend.colors = Object.fromEntries(Object.entries(original.theme.extend.colors).map(([k,v]) => [k,color(v,`color-${k}`)]));
  config.theme.extend.colors['hw-on-status'] = color('#171717', 'on-status');
  const statusInks = {success:'#047857', warning:'#854d0e', danger:'#b91c1c', info:'#1d4ed8'};
  for (const [name, value] of Object.entries(statusInks))
    config.theme.extend.colors['hw-status-'+name] = color(value,'status-'+name);
  for (const [category, prefix] of [['spacing','space'], ['borderRadius','radius']]) {
    for (const [key,value] of Object.entries(config.theme.extend[category])) {
      if (value.includes('var(')) continue;
      const token = `--hw-${prefix}-${key.toLowerCase().replaceAll('.', '-')}`;
      tokens[token] = value; config.theme.extend[category][key] = `var(${token})`;
    }
  }
  const sources = componentNames.map(name => ({name,source:read(`provenance/platform/components/${name}.tsx`)}));
  const colors = require('tailwindcss/colors');
  const combined = sources.map(s => s.source).join('\n');
  const palettes = new Set([...combined.matchAll(/(?:bg|text|border|divide|ring|fill|stroke)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+/g)].map(m=>m[1]));
  for (const palette of palettes) config.theme.extend.colors[palette] = color(colors[palette], `palette-${palette}`);
  for (const key of ['white','black']) config.theme.extend.colors[key] = color(colors[key], `palette-${key}`);
  // Tailwind 3 cannot parse <alpha-value> when computing the default ring.
  // Keep its actual blue-500 default instead of triggering its blue-300 fallback.
  tokens['--hw-palette-blue-500'] = '59 130 246';
  config.theme.extend.ringColor = { DEFAULT: 'rgb(var(--hw-palette-blue-500) / 0.5)' };
  for (const match of combined.matchAll(/\[#([\da-fA-F]{3,8})\]/g)) {
    const hex=match[1].toLowerCase();
    const name=tableColors[hex];
    if (!name) throw new Error('Missing semantic table color '+hex);
    config.theme.extend.colors[`hw-table-${name}`]=color(name==='caption'?'#637381':`#${hex}`,`table-${name}`);
  }
  for (const {name,source} of sources)
    if (!authoredNames.includes(name))
      put(`src/core/${name}/index.tsx`, extractComponent(name, source));
  put('src/core/index.ts', '// Primitivas comuns aos dois consumidores.\n// Regra: entra aqui quando Platform e Builder concordam na anatomia\n// e divergem apenas em token. Ver AGENTS.md \u00a73.\n\n'+componentNames.map(n=>`export * from "./${n}";`).join('\n')+'\n');
  put('provenance/platform/index.ts', componentNames.map(n=>`export * from "./components/${n}";`).join('\n')+'\n');
  // Tokens e preset deixaram de ser gerados: viraram autorais e divididos em
  // core/platform/builder. Regenerá-los aqui desfaria a separação em camadas.
  // put('tokens/platform.css', '/* Generated from the pinned Pla…  (desativado)
  // put('tailwind/platform-preset.cjs', '// Generated from Platf…  (desativado)
  put('manifest.json',json({schemaVersion:3,package:'@hywork/ui',version:JSON.parse(read('package.json')).version,source:provenance,components:componentNames.map(name=>({name,file:`src/core/${name}/index.tsx`,status:authoredNames.includes(name)?'authored':'source-derived'})),tokenCount:Object.keys(tokens).length}));
  return {tokens:Object.keys(tokens).length,components:componentNames.length};
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv[2] === '--capture') {
    const repo=process.argv[3], commit=process.argv[4];
    if (!repo || !/^[0-9a-f]{40}$/.test(commit??'')) throw new Error('Use --capture <Platform repo> <40-char commit>');
    if (existsSync(resolve(root,'provenance/platform/source.json'))) throw new Error('Capture already exists; review updates explicitly');
    const show = p => execFileSync('git',['-C',repo,'show',`${commit}:${p}`],{encoding:'utf8'});
    const files = {};
    for (const name of componentNames) {
      const path=`src/components/ui/${name}.tsx`, original=show(path), normalized=normalizeImports(original);
      put(`provenance/platform/components/${name}.tsx`,normalized);
      files[path]={sha256:hash(original),normalizedSha256:hash(normalized)};
    }
    const tailwind=show('tailwind.config.ts');
    const emitted=ts.transpileModule(tailwind.replace(/plugins:\s*\[[^\]]*\]/,'plugins: []'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
    const output={}; new Function('exports','require',emitted)(output,require);
    put('provenance/platform/tailwind.json',json(output.default));
    const globals=show('src/app/styles/globals.css');
    // Keep the product's base/input context, before feature-specific tour styles.
    put('provenance/platform/context.css',globals.split('/* Tour floating button styles */')[0]);
    const pkg=JSON.parse(show('package.json'));
    put('provenance/platform/dependencies.json',json(pkg.dependencies));
    put('provenance/platform/source.json',json({repository:'hywork-br/hywork-plataform',commit,capturedAt:'2026-09-17',scope:'Reusable primitives and their existing Tailwind/base context; not a deployed-production capture',files,tailwindSha256:hash(tailwind),globalCssSha256:hash(globals)}));
  }
  console.log(JSON.stringify(derive()));
}
