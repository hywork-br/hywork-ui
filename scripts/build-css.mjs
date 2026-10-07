import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import postcss from 'postcss';
import tailwind from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import { consumerBase } from './consumer-base.mjs';

const require = createRequire(import.meta.url);
mkdirSync('.storybook/static', { recursive: true });

const content = [
  './src/**/*.tsx',
  './provenance/platform/components/**/*.tsx',
  './stories/**/*.tsx',
  './tests/fixtures/**/*.tsx',
];

// Base/input CSS do consumidor. A implementação de componente e token muda;
// o CSS base, não.
//
// Os catálogos usam a base SEM as variáveis que o admin declarava no :root:
// desde 06/10/2026 quem as declara é o design system (tokens/core.css). A
// referência congelada (`source`) segue com a captura original.
const original = readFileSync('provenance/platform/context.css', 'utf8');
const contract = consumerBase(original);
const core = readFileSync('tokens/core.css', 'utf8');

const build = async (name, config, tokens, context = contract) => {
  const input = (tokens ? tokens + '\n' : '') + context;
  const result = await postcss([tailwind({ ...config, content }), autoprefixer])
    .process(input, { from: undefined });
  writeFileSync(`.storybook/static/${name}.css`, result.css);
};

// 1. CSS de cada consumidor — alimenta os dois Storybooks.
await build(
  'platform',
  require('../tailwind/platform-preset.cjs'),
  core + '\n' + readFileSync('tokens/platform.css', 'utf8'),
);
await build(
  'builder',
  require('../tailwind/builder-preset.cjs'),
  core + '\n' + readFileSync('tokens/builder.css', 'utf8'),
);

// 2. Paridade fonte × pacote — enquanto houver componente derivado de
//    provenance/, o teste compara a extração com a referência congelada.
//    Sai de cena quando a última primitiva derivada virar autoral.
const raw = JSON.parse(readFileSync('provenance/platform/tailwind.json', 'utf8'));
// The frozen components keep their classes; the contract around them follows
// the decisions of 06/10/2026 (DOMAIN_MODEL "Cor e token"). One of them reaches
// the reference's config: a ring with no colour (`ring-2`, and the `ring-0`
// that Firefox still rasterizes on a rounded edge) is `--ring`, not Tailwind's
// default blue. Without this, every Switch thumb differed in Firefox.
const decided = { theme: { ...raw.theme, extend: { ...raw.theme.extend, ringColor: { DEFAULT: 'hsl(var(--ring) / 0.5)' } } } };
await build('source', { ...raw, ...decided, plugins: [require('tailwindcss-animate')] }, '', original);
await build(
  'package',
  require('../tailwind/platform-preset.cjs'),
  core + '\n' + readFileSync('tokens/platform.css', 'utf8'),
);

console.log('CSS gerado: platform, builder (consumidores) + source, package (paridade)');
