// Corpo do admin em 14px (Rick, 08/10/2026): o platform-preset aplica
// --hw-text-body ao body; o da intranet não fixa tamanho nenhum.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import postcss from 'postcss';
import tailwind from 'tailwindcss';

const require = createRequire(import.meta.url);
const BODY_RULE = /body\s*\{[^}]*font-size:\s*var\(--hw-text-body\);[^}]*line-height:\s*var\(--hw-leading-body\)/;

const baseCss = async (presetPath) => {
  const config = { presets: [require(presetPath)], content: [{ raw: '<p>x</p>' }] };
  const result = await postcss([tailwind(config)]).process('@tailwind base;', { from: undefined });
  return result.css;
};

test('o admin aplica o corpo do design system no body', async () => {
  assert.match(await baseCss('../tailwind/platform-preset.cjs'), BODY_RULE);
});

test('a intranet não ganha tamanho de corpo no body', async () => {
  assert.doesNotMatch(await baseCss('../tailwind/builder-preset.cjs'), /--hw-text-body/);
});

test('o corpo é 14px no admin e 16px no padrão', () => {
  const core = readFileSync(new URL('../tokens/core.css', import.meta.url), 'utf8');
  const platform = readFileSync(new URL('../tokens/platform.css', import.meta.url), 'utf8');
  assert.match(core, /--hw-text-body:\s*var\(--hw-text-base\);/);
  assert.match(platform, /--hw-text-body:\s*var\(--hw-text-sm\);/);
  assert.match(platform, /--hw-leading-body:\s*var\(--hw-leading-sm\);/);
});
