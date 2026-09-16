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
  ...["selection", "collections", "feedback", "theme-lab"].flatMap((name) => [
    [`${name} CSS orphan`, `tokens/${name}.css`, ".mutation { color: var(--hw-missing); }", /referência a token inexistente/],
    [`${name} CSS literal`, `tokens/${name}.css`, ".mutation { color: rgb(255, 0, 170); }", /literal/],
  ]),
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

/**
 * Mutação de PAPEL, não de sintaxe. Os casos acima provam que o gate acusa
 * token inexistente e cor literal; estes provam que ele acusa a DECISÃO — um
 * limite de campo que some contra a superfície renderizada e um texto de apoio
 * de volta ao piso exato. A guarda de contraste passou verde por uma versão
 * inteira medindo pares que a tela não renderiza; sem mutação isso não aparece.
 */
for (const [name, from, to, expected] of [
  [
    "limite de campo igual ao preenchimento",
    "--hw-input-border: var(--hw-gray);",
    "--hw-input-border: var(--hw-gray-tint);",
    /limite de campo sobre o chrome \(admin\)/,
  ],
  [
    "texto de apoio de volta ao piso exato",
    "--hw-text-muted: var(--hw-gray-text);",
    "--hw-text-muted: var(--hw-gray-strong);",
    /texto de apoio sobre o chrome \(admin\)/,
  ],
  [
    "filete do item ativo sem contraste sobre o próprio fundo",
    "--hw-nav-active-rail: var(--hw-orange);",
    "--hw-nav-active-rail: var(--hw-rust-text);",
    /filete do item ativo/,
  ],
]) {
  test(`token gate rejects ${name}`, () => {
    const fixture = mkdtempSync(path.join(tmpdir(), "hywork-token-role-"));
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
      const target = path.join(fixture, "tokens/semantico.css");
      const prior = readFileSync(target, "utf8");
      assert.ok(prior.includes(from), `${from} must exist to be mutated`);
      writeFileSync(target, prior.replace(from, to));
      const result = spawnSync(
        process.execPath,
        [path.join(root, "scripts/check-tokens.mjs"), fixture],
        { encoding: "utf8" }
      );
      assert.equal(result.status, 1, result.stdout + result.stderr);
      assert.match(result.stderr, expected);
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  });
}
