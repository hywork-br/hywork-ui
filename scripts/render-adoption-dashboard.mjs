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

## Gate de outubro

**${adopted} / ${consumers.length} consumidores no pacote**

A adoção real não foi executada antes de outubro. Este relatório torna o gate
verificável sem alterar Platform ou Builder.

| Consumidor | Revisão medida | Arquivos com import do pacote | Arquivos com import local | Status |
|---|---|---:|---:|---|
${consumers
  .map(
    (consumer) =>
      `| ${consumer.name} | \`${consumer.revision}\` | ${consumer.packageImportFiles} | ${consumer.localUiImportFiles} | ${statusFor(consumer)} |`,
  )
  .join("\n")}

## Critério de promoção

Só considerar a Fase 3 concluída quando Platform e Builder estiverem na mesma
tag imutável, cada componente migrado não tiver definição local no escopo
migrado e houver screenshots comparativas, fluxo funcional e review humano.
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
