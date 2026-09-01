import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("visual baseline catalog covers surfaces, viewports and priority pilots", async () => {
  const catalog = JSON.parse(
    await readFile(new URL("tests/visual/baselines.json", root), "utf8"),
  );

  assert.equal(catalog.schemaVersion, 1);
  assert.equal(catalog.baselines.length, 14);
  assert.deepEqual(
    new Set(catalog.baselines.map((baseline) => baseline.surface)),
    new Set(["admin", "portal"]),
  );
  assert.deepEqual(
    new Set(catalog.baselines.map((baseline) => baseline.viewport)),
    new Set(["desktop", "mobile"]),
  );

  for (const pilot of ["tv-corporativa", "assinaturas-email", "academy", "conteudos"]) {
    assert.ok(
      catalog.baselines.some((baseline) => baseline.story.endsWith(`--${pilot}`)),
      `${pilot} needs a visual baseline`,
    );
  }

  assert.deepEqual(
    new Set(catalog.baselines.flatMap((baseline) => baseline.families ?? [])),
    new Set([
      "button",
      "field",
      "textarea",
      "badge",
      "avatar",
      "skeleton",
      "card",
      "dialog",
      "menus",
      "tooltip",
      "select",
      "tabs",
    ]),
  );

  for (const baseline of catalog.baselines) {
    await assert.doesNotReject(
      access(new URL(`tests/visual/baselines/${baseline.file}`, root)),
      `${baseline.file} must exist`,
    );
  }
});
