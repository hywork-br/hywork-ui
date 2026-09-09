#!/usr/bin/env node
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const fixture = mkdtempSync(join(tmpdir(), "hywork-git-install-"));
const source = join(fixture, "source"), consumer = join(fixture, "consumer");
const env = { ...process.env };
// npm run forwards user configuration into npm_config_* environment variables.
for (const key of Object.keys(env)) {
  if (/^npm_config_(allow[_-]scripts|userconfig)$/i.test(key)) delete env[key];
}
env.npm_config_userconfig = join(fixture, ".npmrc");
const run = (command, args, cwd) => execFileSync(command, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], env });
try {
  mkdirSync(source);
  mkdirSync(consumer);
  // Keep unrelated global user install policy out of this isolated fixture.
  writeFileSync(join(fixture, ".npmrc"), "");
  // Copy only tracked source, including working-tree fixes, never an existing dist
  // or node_modules. This smoke is separate from prepare so npm cannot recurse.
  const files = run("git", ["ls-files", "-z"], root).split("\0").filter(Boolean);
  for (const file of files) {
    const target = join(source, file);
    mkdirSync(dirname(target), { recursive: true });
    cpSync(join(root, file), target);
  }
  assert.equal(existsSync(join(source, "dist")), false);
  run("git", ["init", "-b", "main"], source);
  run("git", ["add", "."], source);
  run("git", ["-c", "user.name=Hywork UI Tests", "-c", "user.email=ui-tests@hywork.invalid", "commit", "-m", "fixture"], source);
  const revision = run("git", ["rev-parse", "HEAD"], source).trim();
  writeFileSync(join(consumer, "package.json"), JSON.stringify({ name: "git-consumer-smoke", private: true, type: "module" }));
  process.stdout.write("Installing clean Git revision without prebuilt dist…\n");
  const installLog = run("npm", ["install", `git+${pathToFileURL(source).href}#${revision}`, "--foreground-scripts", "--no-audit", "--no-fund", "--no-package-lock"], consumer);
  const installed = join(consumer, "node_modules/@hywork/ui");
  assert.ok(existsSync(join(installed, "dist/index.js")), "Git installation must include dist/index.js");
  assert.ok(existsSync(join(installed, "dist/index.d.ts")), "Git installation must include declarations");
  assert.equal(existsSync(join(installed, "storybook-static")), false);
  assert.match(installLog, /build:lib/);
  assert.doesNotMatch(installLog, /storybook build|Building storybook/i);
  run(process.execPath, ["--input-type=module", "-e", 'import { Button, Avatar, DataTable } from "@hywork/ui"; if (!Button || !Avatar || !DataTable) throw new Error("Missing package exports");'], consumer);
  process.stdout.write("PASS clean Git installation: dist JS + declarations + runtime imports; no Storybook artifact.\n");
} catch (error) {
  process.stderr.write(error.stderr?.toString() || `${error.stack}\n`);
  process.exitCode = 1;
} finally {
  rmSync(fixture, { recursive: true, force: true });
}
