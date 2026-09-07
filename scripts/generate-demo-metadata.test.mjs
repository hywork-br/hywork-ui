import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const generatorPath = fileURLToPath(new URL("./generate-demo-metadata.mjs", import.meta.url));

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: "utf8", ...options });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return result.stdout.trim();
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function createFixture() {
  const root = mkdtempSync(join(tmpdir(), "hywork-demo-metadata-"));
  mkdirSync(join(root, "dist"), { recursive: true });
  mkdirSync(join(root, ".storybook", "static"), { recursive: true });
  writeFileSync(
    join(root, "package.json"),
    `${JSON.stringify({ name: "@hywork/ui", version: "0.6.0", files: ["dist"] }, null, 2)}\n`,
  );
  writeFileSync(join(root, "dist", "index.js"), "export const fixture = true;\n");
  writeFileSync(join(root, "README.md"), "fixture\n");
  writeFileSync(join(root, ".gitignore"), ".storybook/static/design-system.json\n");
  run("git", ["init", "-q"], { cwd: root });
  run("git", ["add", "."], { cwd: root });
  run(
    "git",
    [
      "-c",
      "user.name=Metadata Test",
      "-c",
      "user.email=metadata@example.invalid",
      "commit",
      "-qm",
      "test fixture",
    ],
    { cwd: root },
  );
  return root;
}

function packHash(root) {
  const destination = mkdtempSync(join(tmpdir(), "hywork-demo-pack-"));
  try {
    const output = run(
      "npm",
      ["pack", root, "--ignore-scripts", "--pack-destination", destination, "--json"],
    );
    const [{ filename }] = JSON.parse(output);
    return sha256(join(destination, filename));
  } finally {
    rmSync(destination, { recursive: true, force: true });
  }
}

function generate(root) {
  const output = join(root, ".storybook", "static", "design-system.json");
  const result = spawnSync(
    process.execPath,
    [generatorPath, "--root", root, "--output", output],
    { encoding: "utf8" },
  );
  const metadata = existsSync(output) ? JSON.parse(readFileSync(output, "utf8")) : null;
  return { metadata, output, result };
}

test("publishes only the clean Git revision and real packed-artifact provenance", (t) => {
  const root = createFixture();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const sourceCommit = run("git", ["rev-parse", "HEAD"], { cwd: root });
  const artifactSha256 = packHash(root);

  const { metadata, result } = generate(root);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.deepEqual(metadata, {
    schemaVersion: 1,
    packageName: "@hywork/ui",
    packageVersion: "0.6.0",
    sourceCommit,
    artifactSha256,
    clean: true,
  });
  assert.equal(run("git", ["status", "--porcelain"], { cwd: root }), "");
});

test("publishes clean false instead of blessing a dirty source tree", (t) => {
  const root = createFixture();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  writeFileSync(join(root, "README.md"), "dirty fixture\n");

  const { metadata, result } = generate(root);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(metadata.clean, false);
  assert.match(run("git", ["status", "--porcelain"], { cwd: root }), /README\.md/);
});
