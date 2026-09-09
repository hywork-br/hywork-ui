import { readFileSync, writeFileSync } from "node:fs";
import { resolveColorTokens } from "./resolve-color-tokens.mjs";

const tokens = new URL("../tokens/", import.meta.url);
const output = new URL("resolved-colors.json", tokens);
const colors = resolveColorTokens(...["primitivos.css", "semantico.css"].map((file) => readFileSync(new URL(file, tokens), "utf8")));
const expected = `${JSON.stringify(colors, null, 2)}\n`;
if (process.argv.includes("--check")) {
  let actual;
  try { actual = readFileSync(output, "utf8"); } catch { /* Missing is drift. */ }
  if (actual !== expected) {
    console.error("Resolved colors are stale or missing. Run npm run tokens:resolve.");
    process.exitCode = 1;
  }
} else {
  writeFileSync(output, expected);
}
