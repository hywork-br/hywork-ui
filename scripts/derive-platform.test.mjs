import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { componentNames, authoredNames, tokenize, extractComponent } from './derive-platform.mjs';
const read = p => readFileSync(new URL('../'+p, import.meta.url), 'utf8');
const hash = s => createHash('sha256').update(s).digest('hex');
const manifest = JSON.parse(read('manifest.json'));

test('all components preserve the captured implementation and pinned hashes', () => {
  assert.equal(componentNames.length, 28);
  for (const name of componentNames) {
    const original = read('provenance/platform/components/'+name+'.tsx');
    const expected = manifest.source.files['src/components/ui/'+name+'.tsx'].normalizedSha256;
    assert.equal(hash(original), expected, name+' source drift');
    // Autoral: a fonte da verdade é a decisão registrada, não a extração.
    if (authoredNames.includes(name)) continue;
    assert.equal(read('src/core/'+name+'/index.tsx'), extractComponent(name, original), name+' implementation drift');
  }
});
test('source integrity gate rejects a behavior mutation', () => {
  const original = read('provenance/platform/components/input.tsx');
  const changed = original.replace('event.stopPropagation();', '');
  assert.notEqual(changed, original);
  assert.notEqual(hash(changed), manifest.source.files['src/components/ui/input.tsx'].normalizedSha256);
});
test('token conversion removes literal colors without changing functional code', () => {
  assert.equal(tokenize('border-[#e5e7eb] hover:bg-[#F9FAFB] onClick={save}'),
    'border-hw-table-border hover:bg-hw-table-surface onClick={save}');
  assert.equal(tokenize('h-[80px] onClick={save}'), 'h-[80px] onClick={save}');
  assert.throws(()=>tokenize('bg-[#123456]'), /semantic role/);
});
test('public API consists only of the selected Platform families', () => {
  const core = read('src/core/index.ts');
  for (const n of componentNames) assert.ok(core.includes('export * from "./'+n+'";'), n+' missing from core barrel');
  assert.deepEqual(manifest.components.map(c=>c.name), componentNames);
  assert.equal(manifest.package, '@hywork/ui');
  assert.equal(manifest.version, JSON.parse(read('package.json')).version);
});

test('each consumer entry composes core plus its own patterns', () => {
  for (const produto of ['platform', 'builder']) {
    const entry = read('src/'+produto+'.ts');
    assert.ok(entry.includes('export * from "./core";'), produto+' entry must re-export core');
    assert.ok(entry.includes('export * from "./'+produto+'/index";'), produto+' entry must re-export its patterns');
  }
});
test('every token reference resolves in both consumers, and the design system wins', () => {
  const core = read('tailwind/core-preset.cjs');
  // Rick, 06/10/2026: o design system é a única autoridade de cor. O preset lê
  // a variável que tokens/core.css declara, sem o fallback "a aplicação vence"
  // — var(--primary, var(--hw-…)) — que deixava o consumidor sobrescrever.
  assert.ok(core.includes('"DEFAULT": "hsl(var(--primary) / <alpha-value>)"'));
  assert.equal(/var\(--(?!font-montserrat)[\w-]+,/.test(core), false, 'preset still has an app-wins fallback');
  assert.ok(core.includes('hsl(var(--ring) / 0.5)'));

  for (const produto of ['platform', 'builder']) {
    const css = read('tokens/core.css') + read('tokens/'+produto+'.css');
    const preset = core + read('tailwind/'+produto+'-preset.cjs');
    for (const [,name] of preset.matchAll(/var\((--[\w-]+)\)/g)) {
      // gancho da fonte (next/font) e variáveis que o Radix escreve em runtime
      if (name === '--font-montserrat' || name.startsWith('--radix-')) continue;
      assert.ok(css.includes(name+':'), name+' unresolved for '+produto);
    }
  }

  const todos = read('tokens/core.css') + read('tokens/platform.css');
  assert.equal([...todos.matchAll(/  --hw-/g)].length >= manifest.tokenCount, true);
});
