#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import process from "node:process";

const root = new URL("../", import.meta.url);
const tokenLayers = [
  { name: "primitive", files: ["tokens/primitivos.css"] },
  { name: "semantic", files: ["tokens/semantico.css"] },
  { name: "component", files: ["tokens/componentes.css"] },
  { name: "surface", files: ["tokens/admin.css", "tokens/portal.css"] },
  { name: "theme", files: ["tokens/tema.css", "tokens/white-label.css"] },
];

const sourceFiles = [
  "package.json",
  "governance/component-contracts.json",
  "governance/patterns.json",
  ...tokenLayers.flatMap((layer) => layer.files),
].sort();

async function readJson(relativePath) {
  return JSON.parse(await readFile(new URL(relativePath, root), "utf8"));
}

function declaredHyworkTokens(source) {
  return [...source.matchAll(/(--hw-[a-z0-9-]+)\s*:/g)].map((match) => match[1]);
}

export async function buildManifest() {
  const packageJson = await readJson("package.json");
  const componentCatalog = await readJson("governance/component-contracts.json");
  const patternCatalog = await readJson("governance/patterns.json");
  const uniqueTokens = new Set();
  const layers = [];

  for (const layer of tokenLayers) {
    const layerTokens = new Set();
    for (const file of layer.files) {
      const source = await readFile(new URL(file, root), "utf8");
      for (const token of declaredHyworkTokens(source)) {
        layerTokens.add(token);
        uniqueTokens.add(token);
      }
    }
    layers.push({ ...layer, tokenCount: layerTokens.size });
  }

  return {
    schemaVersion: 2,
    package: packageJson.name,
    version: packageJson.version,
    generatedFrom: sourceFiles,
    tokenLayers: layers,
    tokenCount: uniqueTokens.size,
    surfaces: ["admin", "portal"],
    stable: ["tokens"],
    beta: componentCatalog.families.flatMap((family) => family.exports),
    draft: patternCatalog.patterns.map((pattern) => pattern.name),
    exports: Object.keys(packageJson.exports).sort(),
  };
}

const outputUrl = new URL("manifest.json", root);
const rendered = `${JSON.stringify(await buildManifest(), null, 2)}\n`;

if (process.argv.includes("--check")) {
  const current = await readFile(outputUrl, "utf8");
  if (current !== rendered) {
    console.error("manifest.json is stale. Run npm run manifest.");
    process.exitCode = 1;
  } else {
    console.log("manifest.json is current.");
  }
} else {
  await writeFile(outputUrl, rendered);
  console.log("manifest.json generated.");
}
