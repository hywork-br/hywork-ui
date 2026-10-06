import { test } from 'node:test';
import assert from 'node:assert/strict';
import { allowlist, blockingAdvisories } from './audit-gate.mjs';

const advisory = (name, id, severity) => ({
  name,
  severity,
  title: `${name} advisory`,
  url: `https://github.com/advisories/${id}`,
});

const report = {
  vulnerabilities: {
    braces: { via: [advisory('braces', 'GHSA-vfj7-8cjw-p6xm', 'high')] },
    chokidar: { via: ['braces'] },
    undici: { via: [advisory('undici', 'GHSA-aaaa-bbbb-cccc', 'high')] },
    postcss: { via: [advisory('postcss', 'GHSA-dddd-eeee-ffff', 'moderate')] },
  },
};

test('blocks a high advisory that has no exception, and only it', () => {
  assert.deepEqual(blockingAdvisories(report, allowlist, '2026-10-06'), [
    'undici: undici advisory (https://github.com/advisories/GHSA-aaaa-bbbb-cccc)',
  ]);
});

test('an expired exception blocks again', () => {
  const blocking = blockingAdvisories(report, allowlist, '2027-01-01');
  assert.equal(blocking.length, 2);
  assert.ok(blocking.some((line) => line.startsWith('braces:')));
});

test('moderate advisories and effects of another package never block', () => {
  const onlyBraces = { vulnerabilities: { braces: report.vulnerabilities.braces, chokidar: { via: ['braces'] } } };
  assert.deepEqual(blockingAdvisories(onlyBraces, allowlist, '2026-10-06'), []);
  assert.deepEqual(blockingAdvisories({ vulnerabilities: { postcss: report.vulnerabilities.postcss } }), []);
});

test('every exception says why and until when', () => {
  for (const exception of allowlist) {
    assert.match(exception.id, /^GHSA-/);
    assert.ok(exception.reason.length > 40, exception.id);
    assert.match(exception.reviewBy, /^\d{4}-\d{2}-\d{2}$/);
  }
});
