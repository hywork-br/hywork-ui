import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function readJson(relativePath) {
  return JSON.parse(await readFile(new URL(relativePath, root), "utf8"));
}

test("manifest exposes generated token layers and public exports", async () => {
  const manifest = await readJson("manifest.json");
  const packageJson = await readJson("package.json");

  assert.equal(manifest.schemaVersion, 2);
  assert.deepEqual(
    manifest.tokenLayers.map((layer) => layer.name),
    ["primitive", "semantic", "component", "surface", "theme"],
  );
  assert.equal(manifest.tokenCount, 146);
  assert.deepEqual(manifest.exports, Object.keys(packageJson.exports).sort());
  assert.deepEqual(manifest.generatedFrom, [
    "governance/component-contracts.json",
    "governance/patterns.json",
    "package.json",
    "tokens/admin.css",
    "tokens/componentes.css",
    "tokens/portal.css",
    "tokens/primitivos.css",
    "tokens/semantico.css",
    "tokens/tema.css",
    "tokens/white-label.css",
  ]);
});

test("every package export resolves after the library build", async () => {
  const packageJson = await readJson("package.json");
  const targets = Object.values(packageJson.exports).flatMap((entry) =>
    typeof entry === "string" ? [entry] : Object.values(entry),
  );

  for (const target of targets) {
    await assert.doesNotReject(
      access(new URL(target, root)),
      `${target} must exist in the public package`,
    );
  }
});

test("manifest keeps new capabilities draft and distinguishes theme utilities", async () => {
  const manifest = await readJson("manifest.json");
  assert.ok(manifest.draft.includes("Checkbox"));
  assert.ok(manifest.draft.includes("Pagination"));
  assert.ok(manifest.draft.includes("validateTenantTheme"));
  assert.ok(!manifest.beta.includes("Checkbox"));
  assert.deepEqual(manifest.utilities.sort(), ["NON_TEXT_CONTRAST", "NORMAL_TEXT_CONTRAST", "contrastRatio", "parseOpaqueCssColor", "validateTenantTheme"].sort());
});
