// A entrada dos gráficos (D1-23, 13/10/2026): `@hywork/ui/charts` é a única
// que carrega o recharts. O admin e a intranet importam `platform`/`builder`
// sem precisar dele instalado.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (p) => readFileSync(join(root, p), 'utf8');
const pkg = JSON.parse(read('package.json'));

const files = (dir) =>
  readdirSync(join(root, dir)).flatMap((name) => {
    const p = join(dir, name);
    return statSync(join(root, p)).isDirectory() ? files(p) : /\.tsx?$/.test(name) ? [p] : [];
  });

test('the charts entry is published, typed and client-side', () => {
  assert.deepEqual(pkg.exports['./charts'], { types: './dist/charts.d.ts', import: './dist/charts.js' });
  const tsup = read('tsup.config.ts');
  assert.match(tsup, /entry: \[[^\]]*"src\/charts\.ts"[^\]]*\],\n\s+external/, 'src/charts.ts must be in the "use client" build');
  assert.equal(read('src/charts.ts').includes('export * from "./charts/index";'), true);
});

test('recharts is an optional peer, pinned in development to the version the admin runs', () => {
  assert.equal(pkg.peerDependencies.recharts, '>=3.1 <4');
  assert.deepEqual(pkg.peerDependenciesMeta.recharts, { optional: true });
  assert.equal(pkg.dependencies.recharts, undefined, 'a direct dependency would install a second copy in the admin');
  assert.match(pkg.devDependencies.recharts, /^3\.\d+\.\d+$/);
});

test('nothing outside src/charts imports recharts or the charts', () => {
  const outside = files('src').filter((p) => !p.startsWith(join('src', 'charts')));
  for (const p of outside) {
    const source = read(p);
    assert.equal(/from ["']recharts["']/.test(source), false, relative(root, join(root, p)) + ' imports recharts');
    assert.equal(/from ["'][./]+charts(\/|["'])/.test(source), false, relative(root, join(root, p)) + ' imports the charts');
  }
});

test('the charts barrel exports the five components and not the example data', () => {
  const barrel = read('src/charts/index.ts');
  for (const name of ['chart-frame', 'radar-chart', 'grouped-bar-chart', 'line-chart', 'distribution-bar'])
    assert.ok(barrel.includes(`export * from "./${name}";`), name + ' missing from the charts barrel');
  assert.equal(barrel.includes('fixtures'), false);
  assert.equal(read('src/charts/shared/index.ts').includes('fixtures'), false);
});

test('the charts take their colours from the chart tokens only', () => {
  for (const p of files(join('src', 'charts')).filter((f) => !/\.(test|stories)\.tsx?$/.test(f) && !f.endsWith('fixtures.ts'))) {
    const source = read(p);
    assert.equal(/#[0-9a-fA-F]{3,8}\b|rgb\(\d|hsl\(\d/.test(source), false, p + ' has a literal colour');
  }
});
