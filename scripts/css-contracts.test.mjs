import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("icon buttons keep an explicit square target on narrow layouts", async () => {
  const css = await readFile(new URL("tokens/componentes.css", root), "utf8");
  const rule = css.match(/\.hw-button\[data-size="icon"\]\s*\{([^}]+)\}/)?.[1];

  assert.ok(rule, "icon button rule must exist");
  assert.match(rule, /height:\s*var\(--hw-control-height\)/);
  assert.match(rule, /width:\s*var\(--hw-control-height\)/);
  assert.match(rule, /flex:\s*0 0 auto/);
});
