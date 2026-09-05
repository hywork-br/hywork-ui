import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("manifest CLI rejects stale generated output and regeneration restores the gate", async () => {
  const directory = await mkdtemp(join(tmpdir(), "hywork-manifest-"));
  const root = new URL("../", import.meta.url);
  try {
    for (const name of ["scripts", "governance", "tokens", "package.json", "manifest.json"])
      await cp(new URL(name, root), join(directory, name), { recursive: true });
    const run = (...args) => spawnSync(process.execPath, ["scripts/generate-manifest.mjs", ...args], { cwd: directory, encoding: "utf8" });
    assert.equal(run("--check").status, 0);
    const path = join(directory, "governance/component-contracts.json");
    const catalog = JSON.parse(await readFile(path, "utf8"));
    catalog.families.find((family) => family.slug === "choice").status = "beta";
    await writeFile(path, JSON.stringify(catalog));
    const stale = run("--check");
    assert.equal(stale.status, 1);
    assert.match(stale.stderr, /manifest.json is stale/);
    assert.equal(run().status, 0);
    assert.equal(run("--check").status, 0);
    const manifest = JSON.parse(await readFile(join(directory, "manifest.json"), "utf8"));
    assert.ok(manifest.beta.includes("Checkbox"));
    assert.ok(!manifest.draft.includes("Checkbox"));
  } finally { await rm(directory, { recursive: true, force: true }); }
});
