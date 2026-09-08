import assert from "node:assert/strict";
import test from "node:test";
import { resolveColorTokens } from "./resolve-color-tokens.mjs";

test("resolves semantic aliases from the canonical token declarations", () => {
  assert.deepEqual(resolveColorTokens(":root { --hw-white: #ffffff; --hw-space: 4px; }", ":root { --hw-surface: var(--hw-white); --hw-card: var(--hw-surface); }"), {
    "--hw-card": "#ffffff", "--hw-surface": "#ffffff", "--hw-white": "#ffffff",
  });
});

test("comments cannot replace the actual value", () => {
  assert.equal(resolveColorTokens("/* --hw-white: #000000; */ :root { --hw-white: #ffffff; }", "")["--hw-white"], "#ffffff");
});

test("missing references fail instead of silently producing a partial palette", () => {
  assert.throws(() => resolveColorTokens("", ":root { --hw-card: var(--hw-missing); }"), /missing.*--hw-missing/i);
});

test("cycles fail with the affected token", () => {
  assert.throws(() => resolveColorTokens("", ":root { --hw-a: var(--hw-b); --hw-b: var(--hw-a); }"), /cycle.*--hw-a/i);
});

test("ambiguous duplicate declarations fail rather than choosing a different theme", () => {
  assert.throws(() => resolveColorTokens(":root { --hw-white: #ffffff; }", "[data-theme] { --hw-white: #000000; }"), /duplicate.*--hw-white/i);
});
