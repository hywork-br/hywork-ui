#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import process from "node:process";
import { pathToFileURL } from "node:url";

function statusFor(consumer) {
  return consumer.packageImportFiles > 0 ? "Em adoção" : "Não migrado";
}

export function renderDashboard({ generatedAt, platform, builder }) {
  const consumers = [
    { name: "Platform", ...platform },
    { name: "Builder", ...builder },
  ];
  const adopted = consumers.filter((consumer) => consumer.packageImportFiles > 0).length;

  return `# Adoption dashboard

Gerado em ${generatedAt}. A fonte de cada linha é a saída do auditor determinístico
\`scripts/audit-adoption.mjs\`, executado no commit indicado. Nenhum número é preenchido à mão.

## Adoção por consumidor

**${adopted} / ${consumers.length} consumidores no pacote**

Este snapshot mede imports na data e nas revisões acima; não comprova deploy,
paridade visual ou o estado atual dos produtos. Platform é o primeiro consumidor;
o aceite de seu piloto independe da migração posterior do Builder.

| Consumidor | Revisão medida | Arquivos com import do pacote | Arquivos com import local | Status |
|---|---|---:|---:|---|
${consumers
  .map(
    (consumer) =>
      `| ${consumer.name} | \`${consumer.revision}\` | ${consumer.packageImportFiles} | ${consumer.localUiImportFiles} | ${statusFor(consumer)} |`,
  )
  .join("\n")}

## Critério de promoção

Avaliar cada fluxo com tag imutável, ausência de cópia local no escopo migrado,
screenshots comparativas, comportamento preservado e aceite técnico e de produto.
O programa completo inclui Platform e Builder; a conclusão de um consumidor
não implica a do outro. Ver [handoff do Platform](platform-handoff.md).
`;
}

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

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = parseArgs(process.argv.slice(2));
  if (!args.platform || !args.builder) {
    throw new Error("Use --platform <json> --builder <json> [--output <markdown>].");
  }

  const [platformSource, builderSource] = await Promise.all([
    readFile(args.platform, "utf8"),
    readFile(args.builder, "utf8"),
  ]);
  const dashboard = renderDashboard({
    generatedAt: new Date().toISOString(),
    platform: JSON.parse(platformSource),
    builder: JSON.parse(builderSource),
  });

  if (args.output) {
    await writeFile(args.output, dashboard);
  } else {
    process.stdout.write(dashboard);
  }
}
