import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function read(relativePath) {
  try {
    return await readFile(new URL(relativePath, root), "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

test("release contract versions with Changesets and publishes immutable tag assets", async () => {
  const configSource = await read(".changeset/config.json");
  const workflow = await read(".github/workflows/release.yml");
  const packageJson = JSON.parse(await read("package.json"));

  assert.ok(configSource, "Changesets config must exist");
  assert.ok(workflow, "tag release workflow must exist");
  const config = JSON.parse(configSource);
  assert.equal(config.access, "restricted");
  assert.equal(config.baseBranch, "main");
  assert.equal(packageJson.scripts.changeset, "changeset");
  assert.equal(packageJson.scripts["release:version"], "changeset version");
  assert.match(workflow, /tags:\s*\n\s*- "v\*"/);
  assert.match(workflow, /npm run check/);
  assert.match(workflow, /npm run build/);
  assert.match(workflow, /npm pack/);
  assert.match(workflow, /gh release create/);
});

test("component authoring templates ship together", async () => {
  const spec = await read("templates/component-spec.md");
  const story = await read("templates/component.stories.tsx.template");
  const interaction = await read("templates/component.test.tsx.template");

  assert.ok(spec, "component spec template must exist");
  assert.ok(story, "component story template must exist");
  assert.ok(interaction, "component interaction template must exist");
  assert.match(spec, /## Propósito/);
  assert.match(spec, /## Teclado, foco e acessibilidade/);
  assert.match(story, /StoryObj/);
  assert.match(interaction, /userEvent/);
});
