#!/usr/bin/env node

import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { basename, dirname } from "node:path";

import { analyzeSharedComponents } from "./lib/inventory.mjs";

function parseArgs(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith("--") || value === undefined) {
      throw new Error(`Argumento inválido: ${key ?? "<vazio>"}`);
    }
    values[key.slice(2)] = value;
  }
  return values;
}

function git(repo, args) {
  return execFileSync("git", ["-C", repo, ...args], { encoding: "utf8" }).trim();
}

function readComponentTree(repo, ref, root) {
  const paths = git(repo, ["ls-tree", "-r", "--name-only", ref, root])
    .split("\n")
    .filter((path) => path.endsWith(".tsx"));

  return Object.fromEntries(
    paths.map((path) => [basename(path), git(repo, ["show", `${ref}:${path}`])]),
  );
}

function countImportFiles(repo, ref, componentName) {
  const pattern = `components/ui/${componentName}(['\"]|$)`;
  const result = spawnSync(
    "git",
    ["-C", repo, "grep", "-l", "-E", pattern, ref, "--", "*.ts", "*.tsx"],
    { encoding: "utf8" },
  );

  if (result.status === 1) return 0;
  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || `git grep falhou para ${componentName}`);
  }

  return new Set(result.stdout.split("\n").filter(Boolean)).size;
}

const args = parseArgs(process.argv.slice(2));
const platformRepo = args["platform-repo"];
const builderRepo = args["builder-repo"];
const platformRef = args["platform-ref"] ?? "origin/main";
const builderRef = args["builder-ref"] ?? "origin/main";
const platformRoot = args["platform-root"] ?? "src/components/ui";
const builderRoot = args["builder-root"] ?? "components/ui";

if (!platformRepo || !builderRepo) {
  throw new Error("Use --platform-repo <path> e --builder-repo <path>.");
}

const analysis = analyzeSharedComponents(
  readComponentTree(platformRepo, platformRef, platformRoot),
  readComponentTree(builderRepo, builderRef, builderRoot),
);

const output = {
  generatedAt: new Date().toISOString(),
  sources: {
    platform: {
      repo: platformRepo,
      ref: platformRef,
      revision: git(platformRepo, ["rev-parse", platformRef]),
      root: platformRoot,
    },
    builder: {
      repo: builderRepo,
      ref: builderRef,
      revision: git(builderRepo, ["rev-parse", builderRef]),
      root: builderRoot,
    },
  },
  summary: analysis.summary,
  components: analysis.components.map((component) => ({
    ...component,
    platformImports: countImportFiles(platformRepo, platformRef, component.name),
    builderImports: countImportFiles(builderRepo, builderRef, component.name),
  })),
};

const serializedOutput = `${JSON.stringify(output, null, 2)}\n`;

if (args.output) {
  mkdirSync(dirname(args.output), { recursive: true });
  writeFileSync(args.output, serializedOutput);
} else {
  process.stdout.write(serializedOutput);
}
