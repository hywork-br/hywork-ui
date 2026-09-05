import assert from "node:assert/strict";
import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = fileURLToPath(new URL("../", import.meta.url));
test("healthy checkout is accepted by the same token CLI", () => {
  const result = spawnSync(
    process.execPath,
    [path.join(root, "scripts/check-tokens.mjs"), root],
    { encoding: "utf8" }
  );
  assert.equal(result.status, 0, result.stdout + result.stderr);
});
for (const [name, file, mutation, expected] of [
  [
    "component CSS orphan",
    "tokens/componentes.css",
    ".mutation { gap: var(--hw-space-missing, 1rem); }",
    /referência a token inexistente/,
  ],
  [
    "component CSS literal",
    "tokens/componentes.css",
    ".mutation { color: #ff00aa; }",
    /literal/,
  ],
  [
    "React token reference",
    "src/mutation.tsx",
    "export const Mutation = () => <div style={{ color: 'var(--hw-missing)' }} />;",
    /referência a token inexistente/,
  ],
  [
    "React literal",
    "src/mutation.tsx",
    "export const Mutation = () => <div className='text-[#ff00aa]' />;",
    /literal/,
  ],
]) {
  test(`token gate rejects ${name} in the actual CLI`, () => {
    const fixture = mkdtempSync(path.join(tmpdir(), "hywork-token-gate-"));
    try {
      for (const entry of [
        "tokens",
        "src",
        "stories",
        "README.md",
        "AGENTS.md",
        "CONTRIBUTING.md",
      ])
        cpSync(path.join(root, entry), path.join(fixture, entry), {
          recursive: true,
        });
      const target = path.join(fixture, file);
      const prior = file.endsWith(".css") ? readFileSync(target, "utf8") : "";
      writeFileSync(target, `${prior}\n${mutation}\n`);
      const result = spawnSync(
        process.execPath,
        [path.join(root, "scripts/check-tokens.mjs"), fixture],
        { encoding: "utf8" }
      );
      assert.equal(result.status, 1, result.stdout + result.stderr);
      assert.match(result.stderr, expected);
      assert.match(result.stderr, new RegExp(file.replaceAll(".", "\\.")));
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  });
}
