import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { componentNames, tokenize, extractComponent } from './derive-platform.mjs';
const read = p => readFileSync(new URL('../'+p, import.meta.url), 'utf8');
const hash = s => createHash('sha256').update(s).digest('hex');
const manifest = JSON.parse(read('manifest.json'));

test('all components preserve the captured implementation and pinned hashes', () => {
  assert.equal(componentNames.length, 28);
  for (const name of componentNames) {
    const original = read('provenance/platform/components/'+name+'.tsx');
    const expected = manifest.source.files['src/components/ui/'+name+'.tsx'].normalizedSha256;
    assert.equal(hash(original), expected, name+' source drift');
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
test('every token reference resolves in both consumers and app theme wins', () => {
  const core = read('tailwind/core-preset.cjs');
  // o preset base define a cor com duplo fallback: a variável da aplicação
  // vence o default da biblioteca — é o que preserva o tema do cliente
  assert.ok(core.includes('var(--primary, var(--hw-color-primary-default))'));
  assert.ok(core.includes('rgb(var(--hw-palette-blue-500) / 0.5)'));

  for (const produto of ['platform', 'builder']) {
    const css = read('tokens/core.css') + read('tokens/'+produto+'.css');
    const preset = core + read('tailwind/'+produto+'-preset.cjs');
    for (const [,name] of preset.matchAll(/var\((--hw-[\w-]+)\)/g))
      assert.ok(css.includes(name+':'), name+' unresolved for '+produto);
  }

  const todos = read('tokens/core.css') + read('tokens/platform.css');
  assert.equal([...todos.matchAll(/  --hw-/g)].length >= manifest.tokenCount, true);
});
