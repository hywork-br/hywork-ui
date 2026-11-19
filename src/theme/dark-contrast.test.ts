import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { AA_CONTRAST, contrastRatio, rgbToHsl } from "./brand";

type Hsl = Parameters<typeof contrastRatio>[0];

// Resolve o tema escuro a partir do CSS: :root primeiro, .dark por cima, na
// ordem em que o build concatena (core.css, depois platform.css).
// shortcut: parser de blocos simples, sem @media nem aninhamento; trocar por um
// parser de CSS de verdade se os tokens passarem a usar isso.
const css = ["tokens/core.css", "tokens/platform.css"]
  .map((file) => readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, ""))
  .join("\n");

const dark = new Map<string, string>();
for (const [, selectors, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  const list = selectors.split(",").map((s) => s.trim());
  const targets = list.filter((s) => s === ":root" || s === ".dark");
  if (!targets.length) continue;
  for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    // :root vale também no escuro; .dark só no escuro, e vence por vir depois.
    dark.set(name, value.trim());
  }
}

function resolve(value: string): string {
  const next = value.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*((?:[^()]|\([^()]*\))*))?\)/g, (_, name, fallback) => {
    const found = dark.get(name);
    if (found !== undefined) return resolve(found);
    if (fallback !== undefined) return resolve(fallback.trim());
    throw new Error(`variável sem valor: ${name}`);
  });
  return next === value ? value : resolve(next);
}

function color(name: string): Hsl {
  const raw = dark.get(name);
  if (raw === undefined) throw new Error(`token ausente: ${name}`);
  const parts = resolve(raw).split(/\s+/).map((p) => parseFloat(p));
  // Com "%" o canal é HSL; sem, é RGB 0-255 (tokens --hw-status-*, admin-*).
  return resolve(raw).includes("%") ? (parts as unknown as Hsl) : rgbToHsl(parts as [number, number, number]);
}

const surfaces = ["--hw-color-background", "--hw-color-admin-surface"];
const texts = [
  "--primary-ink",
  "--muted-foreground",
  "--hw-text-heading",
  "--hw-text-label",
  "--hw-status-success",
  "--hw-status-warning",
  "--hw-status-danger",
  "--hw-status-info",
  "--vendor-ink",
];

describe("tema escuro: contraste AA", () => {
  for (const surface of surfaces) {
    for (const text of texts) {
      it(`${text} sobre ${surface} >= ${AA_CONTRAST}:1`, () => {
        expect(contrastRatio(color(text), color(surface))).toBeGreaterThanOrEqual(AA_CONTRAST);
      });
    }
  }

  it("--primary-foreground sobre --primary >= 4.5:1", () => {
    expect(contrastRatio(color("--primary-foreground"), color("--primary"))).toBeGreaterThanOrEqual(AA_CONTRAST);
  });
});

// Todo --hw-color-* que o contrato (core.css) lê precisa existir no :root de
// cada consumidor: o build do Builder não inclui platform.css.
describe("tokens de cor do contrato existem em cada consumidor", () => {
  const strip = (file: string) => readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const used = new Set(strip("tokens/core.css").match(/--hw-color-[\w-]+/g));
  for (const file of ["tokens/platform.css", "tokens/builder.css"]) {
    it(`${file} define todos`, () => {
      const root = /:root\s*\{([^{}]*)\}/.exec(strip(file))![1];
      const defined = new Set([...root.matchAll(/(--hw-color-[\w-]+)\s*:/g)].map((m) => m[1]));
      const own = new Set(strip("tokens/core.css").match(/(--hw-color-[\w-]+)\s*:/g)?.map((m) => m.slice(0, -1).trim()));
      expect([...used].filter((t) => !defined.has(t) && !own.has(t))).toEqual([]);
    });
  }
});
