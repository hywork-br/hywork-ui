#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

import { analyzeAdoption } from "./lib/adoption.mjs";

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

function readSources(root, current = root, output = {}) {
  const ignored = new Set([".git", ".next", "dist", "node_modules", "storybook-static"]);
  for (const entry of readdirSync(current, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const path = join(current, entry.name);
    if (entry.isDirectory()) readSources(root, path, output);
    else if (/\.[cm]?[jt]sx?$/.test(entry.name)) output[relative(root, path)] = readFileSync(path, "utf8");
  }
  return output;
}

function revision(repo) {
  try {
    return execFileSync("git", ["-C", repo, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  } catch {
    return "SEM LEITURA";
  }
}

const args = parseArgs(process.argv.slice(2));
if (!args.repo) throw new Error("Use --repo <path>.");

const result = {
  repo: args.repo,
  revision: revision(args.repo),
  ...analyzeAdoption(readSources(args.repo)),
};
const serialized = `${JSON.stringify(result, null, 2)}\n`;

if (args.output) {
  mkdirSync(dirname(args.output), { recursive: true });
  writeFileSync(args.output, serialized);
} else {
  process.stdout.write(serialized);
}
