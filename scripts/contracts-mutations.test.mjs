import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync, spawnSync } from "node:child_process";
import ts from "typescript";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function fixture(run) {
  const directory = await mkdtemp(join(tmpdir(), "hywork-contracts-"));
  try {
    for (const name of ["scripts", "governance", "specs", "stories", "dist", "package.json"])
      await cp(new URL(name, root), join(directory, name), { recursive: true });
    await symlink(fileURLToPath(new URL("node_modules", root)), join(directory, "node_modules"), "dir");
    if (process.env.CONTRACT_BASELINE_REF) {
      const originalGate = execFileSync("git", ["show", `${process.env.CONTRACT_BASELINE_REF}:scripts/contracts.test.mjs`], { cwd: root, encoding: "utf8" });
      await writeFile(join(directory, "scripts/contracts.test.mjs"), originalGate);
    }
    // A nested Node runner otherwise silently skips tests under NODE_TEST_CONTEXT.
    const { NODE_TEST_CONTEXT: inheritedContext, ...environment } = process.env;
    const gate = () => {
      const result = spawnSync(process.execPath, ["--test", "scripts/contracts.test.mjs"], { cwd: directory, encoding: "utf8", env: environment });
      assert.match(result.stdout, /storybook contract catalog/, "child gate must actually execute tests");
      return result;
    };
    assert.equal(gate().status, 0, "unmodified contract fixture must pass");
    await run(directory, gate);
  } finally { await rm(directory, { recursive: true, force: true }); }
}

for (const loss of ["missing", "empty"]) {
  test(`contract CLI rejects a ${loss} utility spec and passes after restoration`, () => fixture(async (directory, gate) => {
    const path = join(directory, "specs/utilities/theme-validation.md");
    const original = await readFile(path, "utf8");
    if (loss === "missing") await rm(path); else await writeFile(path, "\n");
    const result = gate();
    assert.equal(result.status, 1, `${loss} utility spec escaped the gate`);
    assert.match(result.stdout + result.stderr, /theme-validation.*spec/);
    await writeFile(path, original);
    assert.equal(gate().status, 0, "restored utility spec must pass");
  }));
}

test("contract CLI rejects losing CellsContract.play while render remains", () => fixture(async (directory, gate) => {
  const path = join(directory, "stories/QualityContracts.stories.tsx");
  const original = await readFile(path, "utf8");
  const source = ts.createSourceFile(path, original, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const declaration = source.statements.filter(ts.isVariableStatement).flatMap((statement) => statement.declarationList.declarations)
    .find((node) => node.name.getText(source) === "CellsContract");
  const play = declaration.initializer.properties.find((node) => node.name?.getText(source) === "play");
  const end = play.end + (original[play.end] === "," ? 1 : 0);
  const mutated = original.slice(0, play.getFullStart()) + original.slice(end);
  assert.match(mutated, /render:/, "mutation preserves the real render story");
  await writeFile(path, mutated);
  const result = gate();
  assert.equal(result.status, 1, "render-only CellsContract escaped the gate");
  assert.match(result.stdout + result.stderr, /table-cells.*play/);
  await writeFile(path, original);
  assert.equal(gate().status, 0, "restored CellsContract must pass");
}));

test("contract CLI accepts inherited meta play but rejects an explicit undefined override", () => fixture(async (directory, gate) => {
  const path = join(directory, "stories/QualityContracts.stories.tsx");
  const original = await readFile(path, "utf8");
  const inherited = 'const meta = { title: "Contracts/Fixture", play: async () => {} }; export default meta; export const CellsContract = { render: () => null };';
  await writeFile(path, inherited);
  assert.equal(gate().status, 0, "meta-inherited play is a supported contract");
  await writeFile(path, inherited.replace("render: () => null", "render: () => null, play: undefined"));
  const result = gate();
  assert.equal(result.status, 1, "own undefined must override inherited play");
  assert.match(result.stdout + result.stderr, /table-cells.*play/);
  for (const replacement of ["play: importedPlay", "...sharedStory", "get play() { return undefined; }"]) {
    await writeFile(path, inherited.replace("render: () => null", `render: () => null, ${replacement}`));
    const unsupported = gate();
    assert.equal(unsupported.status, 1, "unresolved play syntax must fail closed");
    assert.match(unsupported.stdout + unsupported.stderr, /table-cells.*(play|spreads)/);
  }
  await writeFile(path, original);
  assert.equal(gate().status, 0);
}));

test("contract CLI rejects downgrading a draft contract to render smoke", () => fixture(async (directory, gate) => {
  const path = join(directory, "governance/component-contracts.json");
  const original = await readFile(path, "utf8");
  const catalog = JSON.parse(original);
  catalog.families.find((entry) => entry.slug === "table-cells").storyContract = "smoke";
  await writeFile(path, JSON.stringify(catalog));
  const result = gate();
  assert.equal(result.status, 1, "draft play obligation cannot be bypassed by relabeling");
  assert.match(result.stdout + result.stderr, /table-cells.*requires play/);
  await writeFile(path, original);
  assert.equal(gate().status, 0);
}));
