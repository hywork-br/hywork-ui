// Contrato das variáveis da aplicação (Rick, 06/10/2026): o design system
// declara todas; a única entrada do consumidor é a marca do workspace.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const core = read('tokens/core.css');

const block = (css, selector) => {
  const start = css.indexOf(selector + ' {');
  assert.notEqual(start, -1, 'missing block ' + selector);
  const body = css.slice(start, css.indexOf('}', start));
  return Object.fromEntries([...body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
};

const contract = block(core, ':root,\n.dark,\n[data-hw-brand]');

test('the contract re-declares on .dark and [data-hw-brand], where var() is resolved', () => {
  for (const name of ['--background', '--primary', '--ring', '--border', '--chart-5', '--success', '--info-foreground'])
    assert.ok(name in contract, name + ' missing from the contract');
});

test('primary, its states and the focus ring derive from the brand hook, with the design system default', () => {
  assert.equal(contract['--primary'], 'var(--hw-brand-primary, var(--hw-color-primary-default))');
  assert.equal(contract['--primary-foreground'], 'var(--hw-brand-primary-foreground, var(--hw-color-primary-foreground))');
  assert.match(contract['--primary-hover'], /^var\(--hw-brand-primary-hover, .*--hw-color-primary-600/);
  assert.match(contract['--primary-active'], /^var\(--hw-brand-primary-active, .*--hw-color-primary-700/);
  assert.match(contract['--primary-ink'], /^var\(--hw-brand-primary-ink, /);
  assert.match(contract['--ring'], /^var\(--hw-brand-primary-ink, .*--hw-color-ring\)+$/);
});

test('status and destructive never follow the brand', () => {
  for (const name of ['--destructive', '--success', '--warning', '--error', '--info'])
    assert.equal(contract[name].includes('brand'), false, name + ' follows the brand');
});

test('every other app variable is a plain alias of a --hw-color token', () => {
  for (const [name, value] of Object.entries(contract)) {
    if (name.startsWith('--primary') || name === '--ring') continue;
    assert.match(value, /^var\(--hw-color-[\w-]+\)$/, name);
  }
});

test('the values the admin declared on 06/10/2026 are what the design system now resolves to', () => {
  const tokens = { ...block(core, ':root'), ...block(read('tokens/platform.css'), ':root') };
  const resolve = (value) => {
    const m = /^var\((--[\w-]+)(?:, (.+))?\)$/.exec(value);
    if (!m) return value;
    return m[1] in tokens ? resolve(tokens[m[1]]) : resolve(m[2]);
  };
  // the :root the admin carried until 06/10/2026 — the same capture as provenance/
  const admin = block(read('provenance/platform/context.css'), ':root');
  for (const [name, value] of Object.entries(admin))
    assert.equal(resolve(contract[name] ?? tokens[name]), value, name);
});

test('zebra, hover and selection are three distinct steps', () => {
  const root = block(core, ':root');
  assert.equal(root['--hw-table-stripe'], '249 250 251');
  assert.equal(root['--hw-table-hover'], '243 244 246');
  assert.equal(root['--hw-table-selected'], '229 231 235');
  const steps = ['--hw-table-stripe', '--hw-table-hover', '--hw-table-selected'].map((t) => root[t]);
  assert.equal(new Set(steps).size, 3);
  // cada degrau mais escuro que o anterior
  const sum = (v) => v.split(' ').map(Number).reduce((a, b) => a + b);
  assert.ok(sum(steps[0]) > sum(steps[1]) && sum(steps[1]) > sum(steps[2]));
});
