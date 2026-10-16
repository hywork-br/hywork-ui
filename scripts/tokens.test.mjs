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
  // what the PO changed afterwards, in the DS 2.0 validation (07/10/2026)
  const decided = { '--border': '210 28.6% 94.5%', '--admin-bg': '237 241 245' };
  for (const [name, value] of Object.entries(admin))
    assert.equal(resolve(contract[name] ?? tokens[name]), decided[name] ?? value, name);
});

test('the PO palette of 07/10/2026: #edf1f5 for frame and border, at 40% for filter and table', () => {
  const platform = block(read('tokens/platform.css'), ':root');
  const root = block(core, ':root');
  assert.equal(platform['--hw-color-admin-bg'], '237 241 245');
  assert.equal(platform['--hw-color-border'], '210 28.6% 94.5%'); // #edf1f5
  assert.equal(platform['--hw-filter-surface'], '237 241 245 / 0.4');
  assert.equal(root['--hw-table-surface'], '237 241 245 / 0.4');
});

test('zebra, hover and selection are three distinct steps', () => {
  const root = block(core, ':root');
  assert.equal(root['--hw-table-stripe'], '237 241 245 / 0.4');
  assert.equal(root['--hw-table-hover'], '243 244 246');
  assert.equal(root['--hw-table-selected'], '229 231 235');
  const steps = ['--hw-table-stripe', '--hw-table-hover', '--hw-table-selected'].map((t) => root[t]);
  assert.equal(new Set(steps).size, 3);
  // cada degrau mais escuro que o anterior, como aparece sobre o branco
  const sum = (v) => {
    const [rgb, alpha = '1'] = v.split(' / ');
    return rgb.split(' ').map((c) => 255 - Number(alpha) * (255 - Number(c))).reduce((a, b) => a + b);
  };
  assert.ok(sum(steps[0]) > sum(steps[1]) && sum(steps[1]) > sum(steps[2]));
});

test('the Hywork voice: the brand guideline secondary, readable wherever it carries text', () => {
  const hsl = (v) => {
    const [h, s, l] = v.replace(/%/g, '').split(' ').map(Number);
    const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
    const f = (n) => {
      const k = (n + h / 30) % 12;
      return l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    };
    return [f(0), f(8), f(4)];
  };
  const lum = (rgb) =>
    rgb
      .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
      .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
  const ratio = (a, b) => {
    const [hi, lo] = [lum(hsl(a)), lum(hsl(b))].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };
  for (const file of ['tokens/platform.css', 'tokens/builder.css']) {
    const t = block(read(file), ':root');
    // #e9501b, o guideline (decisão de 12/08/2026)
    assert.deepEqual(hsl(t['--hw-color-vendor-default']).map((c) => Math.round(c * 255)), [233, 80, 27], file);
    const white = t['--hw-color-vendor-foreground'];
    assert.ok(ratio(white, t['--hw-color-vendor-strong']) >= 4.5, file + ': branco sobre strong');
    assert.ok(ratio(t['--hw-color-vendor-ink'], t['--hw-color-background']) >= 4.5, file + ': ink sobre o fundo');
    assert.ok(ratio(t['--hw-color-vendor-ink'], t['--hw-color-vendor-subtle']) >= 4.5, file + ': ink sobre subtle');
  }
  for (const name of ['--vendor', '--vendor-foreground', '--vendor-strong', '--vendor-ink', '--vendor-subtle'])
    assert.equal(contract[name].includes('brand'), false, name + ' follows the brand');
});
