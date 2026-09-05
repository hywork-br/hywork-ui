import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const requiredSections = [
  "## Propósito",
  "## Quando usar e quando evitar",
  "## Anatomia e slots",
  "## API e defaults",
  "## Variantes e estados",
  "## Tokens consumidos",
  "## Admin, portal e mobile",
  "## Teclado, foco e acessibilidade",
  "## Composição e erros comuns",
  "## Proveniência, status, owner e migração",
];

async function read(relativePath) {
  try {
    return await readFile(new URL(relativePath, root), "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

test("all public families have unique exports and complete 10-part contracts", async () => {
  const catalogSource = await read("governance/component-contracts.json");
  assert.ok(catalogSource, "component contract catalog must exist");
  const catalog = JSON.parse(catalogSource);

  assert.equal(new Set(catalog.families.map((family) => family.slug)).size, catalog.families.length);
  assert.equal(new Set(catalog.families.map((family) => family.spec)).size, catalog.families.length);
  const patterns = JSON.parse(await read("governance/patterns.json"));
  const registered = [...catalog.families.flatMap((family) => family.exports),
    ...patterns.patterns.map((pattern) => pattern.name),
    ...(catalog.utilities ?? []).flatMap((utility) => utility.exports)];
  assert.equal(new Set(registered).size, registered.length, "duplicate runtime export registration");
  const runtime = await import("../dist/index.js");
  assert.deepEqual([...registered].sort(), Object.keys(runtime).sort(), "every runtime export must have exactly one registration");

  for (const family of catalog.families) {
    assert.ok(["draft", "beta", "stable", "deprecated"].includes(family.status));
    assert.ok(family.owner.design, `${family.slug} needs a design owner`);
    assert.ok(family.owner.frontend, `${family.slug} needs a frontend owner`);
    assert.ok(
      family.consumers.length >= 2 || family.structuralCase,
      `${family.slug} needs two consumers or a structural case`,
    );
    assert.deepEqual(family.surfaces, ["admin", "portal"]);
    assert.ok(family.viewports.includes("mobile"));

    const spec = await read(family.spec);
    assert.ok(spec, `${family.slug} spec must exist`);
    for (const section of requiredSections) {
      assert.match(spec, new RegExp(`^${section}$`, "m"), `${family.slug}: ${section}`);
    }
  }
});

test("storybook contract catalog covers every public family", async () => {
  const catalogSource = await read("governance/component-contracts.json");
  assert.ok(catalogSource, "component contract catalog must exist");
  const catalog = JSON.parse(catalogSource);
  for (const family of [...catalog.families, ...(catalog.utilities ?? [])]) {
    const stories = await read(family.storyFile);
    assert.ok(stories, `${family.slug} story file must exist`);
    assert.match(
      stories,
      new RegExp(`export const ${family.storyExport}\\b`),
      `${family.slug} needs an executable story`,
    );
  }
});
