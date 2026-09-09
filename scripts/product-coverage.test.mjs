import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const coverage = JSON.parse(
  readFileSync(new URL("../governance/product-coverage.json", import.meta.url), "utf8"),
);

test("product coverage registry has a dated source baseline", () => {
  assert.equal(coverage.schemaVersion, 1);
  assert.match(coverage.baseline.productRepository, /^hywork-br\//);
  assert.match(coverage.baseline.productCommit, /^[0-9a-f]{40}$/);
  assert.match(coverage.baseline.capturedAt, /^\d{4}-\d{2}-\d{2}$/);
});

test("product coverage domains have unique IDs and valid states", () => {
  const ids = coverage.domains.map((domain) => domain.id);
  assert.equal(new Set(ids).size, ids.length);

  const availability = new Set(coverage.availabilityStates);
  const states = new Set(coverage.coverageStates);

  for (const domain of coverage.domains) {
    assert.match(domain.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(domain.label);
    assert.ok(availability.has(domain.availability), `${domain.id} has an unknown availability`);
    assert.ok(states.has(domain.coverage), `${domain.id} has an unknown coverage state`);
    assert.ok(Array.isArray(domain.routes));
    assert.ok(Array.isArray(domain.journeys) && domain.journeys.length > 0);
    assert.equal(new Set(domain.journeys).size, domain.journeys.length, `${domain.id} repeats a journey`);
    for (const route of domain.routes) {
      assert.match(route, /^src\/app\/.+\.tsx$/);
    }
  }
});

test("unknown or future domains cannot silently claim a verified route coverage", () => {
  for (const domain of coverage.domains) {
    if (domain.availability === "unknown" || domain.availability === "future") {
      assert.notEqual(domain.coverage, "verified", domain.id);
      assert.notEqual(domain.coverage, "production-adopted", domain.id);
    }
  }
});

test("future capabilities remain outside the current product denominator", () => {
  assert.ok(Array.isArray(coverage.futureOrUnverified));
  assert.ok(coverage.futureOrUnverified.includes("production-adoption"));
  assert.ok(coverage.futureOrUnverified.includes("rewards-shop"));
});
