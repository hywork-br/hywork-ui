#!/usr/bin/env node
/**
 * Gera o preset de Tailwind v3 a partir da camada semântica.
 *
 * Por que gerado e não escrito à mão: dois dos três consumidores estão em
 * Tailwind v3 (o produto), e um mapa mantido à mão diverge da camada semântica
 * na primeira mudança — silenciosamente, porque nada quebra: a utility
 * simplesmente deixa de existir e o dev escreve o hex.
 *
 * A fonte é semantico.css. Token novo lá aparece aqui sozinho.
 *
 *   node scripts/gerar-preset-v3.mjs
 *
 * O CI roda com --check e falha se o arquivo commitado estiver desatualizado —
 * gerado que não é verificado vira gerado que ninguém regenera.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SAIDA = path.join(RAIZ, "tailwind", "v3-preset.cjs");

const css = readFileSync(path.join(RAIZ, "tokens", "semantico.css"), "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "");

const tokens = [...css.matchAll(/^\s*(--hw-[\w-]+):/gm)].map((m) => m[1]);

/** Vira `primary-hover` a partir de `--hw-primary-hover`. */
const nomeCurto = (t) => t.replace(/^--hw-/, "");

const cores = {};
const fontes = {};
const raios = {};

for (const t of tokens) {
  const nome = nomeCurto(t);
  // Tokens que não são cor têm sufixo próprio e vão para outros grupos.
  if (nome.startsWith("font-")) fontes[nome.replace("font-", "")] = `var(${t})`;
  else if (nome.startsWith("focus-")) continue; // largura e offset, não cor
  else cores[nome] = `var(${t})`;
}

for (const [nome, valor] of [
  ["sm", "--hw-radius-sm"],
  ["md", "--hw-radius-md"],
  ["lg", "--hw-radius-lg"],
  ["full", "--hw-radius-full"],
]) {
  raios[nome] = `var(${valor})`;
}

const conteudo = `/**
 * GERADO por scripts/gerar-preset-v3.mjs — não edite à mão.
 * A fonte é tokens/semantico.css; rode o script depois de mexer nela.
 *
 * Uso no consumidor (Tailwind v3):
 *
 *   // tailwind.config.ts
 *   presets: [require("@hywork/ui/tailwind/v3-preset.cjs")],
 *
 * E importe os tokens no CSS global:
 *
 *   @import "@hywork/ui/tokens/tema.css";
 */

module.exports = {
  theme: {
    extend: {
      colors: ${JSON.stringify(cores, null, 8).replace(/\n\s*}$/, "\n      }")},
      fontFamily: ${JSON.stringify(fontes, null, 8).replace(/\n\s*}$/, "\n      }")},
      borderRadius: ${JSON.stringify(raios, null, 8).replace(/\n\s*}$/, "\n      }")},
    },
  },
};
`;

if (process.argv.includes("--check")) {
  const atual = readFileSync(SAIDA, "utf8");
  if (atual !== conteudo) {
    console.error(
      "FAIL preset v3: tailwind/v3-preset.cjs está desatualizado.\n" +
        "  Rode: node scripts/gerar-preset-v3.mjs",
    );
    process.exit(1);
  }
} else {
  writeFileSync(SAIDA, conteudo);
}
