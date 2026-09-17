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
    assert.equal(read('src/components/'+name+'.tsx'), extractComponent(name, original), name+' implementation drift');
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
  assert.equal(read('src/index.ts'), componentNames.map(n => 'export * from "./components/'+n+'";').join('\n')+'\n');
  assert.deepEqual(manifest.components.map(c=>c.name), componentNames);
  assert.equal(manifest.package, '@hywork/ui');
  assert.equal(manifest.version, JSON.parse(read('package.json')).version);
});
test('every generated token reference resolves and source theme has precedence', () => {
  const css = read('tokens/platform.css');
  const preset = read('tailwind/platform-preset.cjs');
  for (const [,name] of preset.matchAll(/var\((--hw-[\w-]+)\)/g))
    assert.ok(css.includes(name+':'), name);
  assert.ok(preset.includes('var(--primary, var(--hw-color-primary-default))'));
  assert.ok(preset.includes('rgb(var(--hw-palette-blue-500) / 0.5)'));
  assert.equal([...css.matchAll(/  --hw-/g)].length >= manifest.tokenCount, true);
});
