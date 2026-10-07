import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  DESIGN_SYSTEM_THEME_KEYS,
  DESIGN_SYSTEM_VARIABLES,
  assertNoTokenOverrides,
  findTokenOverrides,
} from "./consumer-check";
import { consumerBase } from "../scripts/consumer-base.mjs";

const require = createRequire(import.meta.url);
// Vitest roda a partir da raiz do repositório.
const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("findTokenOverrides — Tailwind", () => {
  it("aponta toda chave de cor do consumidor, sombra do design system ou cor própria", () => {
    const tailwindConfig = {
      theme: { extend: { colors: { primary: "#143748", brand: { 500: "#9333ea" } } } },
    };
    expect(findTokenOverrides({ tailwindConfig })).toEqual([
      { source: "tailwind", name: "primary", where: "theme.extend.colors" },
      { source: "tailwind", name: "brand", where: "theme.extend.colors" },
    ]);
  });

  it("aponta theme.colors (substituição) e cores declaradas por função", () => {
    const tailwindConfig = { theme: { colors: { gray: {} }, extend: { colors: () => ({}) } } };
    expect(findTokenOverrides({ tailwindConfig }).map((o) => `${o.where}.${o.name}`)).toEqual([
      "theme.colors.gray",
      "theme.extend.colors",
    ]);
  });

  it("aponta raio, espaçamento e tipografia só quando sombreiam o preset", () => {
    const tailwindConfig = {
      presets: [{ theme: { extend: { colors: { primary: "x" } } } }], // preset é ignorado
      theme: {
        extend: {
          borderRadius: { lg: "1rem", pill: "999px" },
          spacing: { 4: "1rem", 18: "4.5rem" },
          fontFamily: { sans: ["Inter"], poppins: ["var(--font-poppins)"] },
        },
      },
    };
    expect(findTokenOverrides({ tailwindConfig }).map((o) => `${o.where}.${o.name}`)).toEqual([
      "theme.extend.borderRadius.lg",
      "theme.extend.spacing.4",
      "theme.extend.fontFamily.sans",
    ]);
  });

  it("aceita o módulo importado (default) e config sem theme", () => {
    expect(findTokenOverrides({ tailwindConfig: { default: { theme: { extend: { colors: { ring: "x" } } } } } })).toHaveLength(1);
    expect(findTokenOverrides({ tailwindConfig: { content: [] } })).toEqual([]);
    expect(findTokenOverrides({})).toEqual([]);
  });

  it("o config do admin na branch de adoção (06/10/2026) passa", () => {
    const tailwindConfig = {
      presets: [require("../tailwind/platform-preset.cjs")],
      content: ["./src/**/*.{ts,tsx}", "./node_modules/@hywork/ui/dist/**/*.js"],
      theme: { extend: { fontFamily: { poppins: ["var(--font-poppins)"], inter: ["var(--font-inter)"] } } },
    };
    expect(findTokenOverrides({ tailwindConfig })).toEqual([]);
  });
});

describe("findTokenOverrides — CSS", () => {
  it("aponta variável do design system declarada no :root, no .dark e dentro de @layer, com linha", () => {
    const css = [
      '@import "@hywork/ui/tokens/core.css";', // 1
      ":root {", // 2
      "  --primary: 200 57% 18%;", // 3
      "  --tv-accent: #fff; /* própria: pode */", // 4
      "}", // 5
      "/* --background: 0 0% 0%; comentário não conta */", // 6
      ".dark { --border: 1 1% 1% }", // 7
      "@layer base {", // 8
      "  :root { --hw-color-primary-default: 0 0% 0%; }", // 9
      "}", // 10
      '.x { content: "--ring: x;"; --hw-brand-primary: 1 1% 1%; }', // 11
    ].join("\n");
    expect(findTokenOverrides({ css: { "globals.css": css } })).toEqual([
      { source: "css", name: "--primary", where: "globals.css:3 :root" },
      { source: "css", name: "--border", where: "globals.css:7 .dark" },
      { source: "css", name: "--hw-color-primary-default", where: "globals.css:9 :root (@layer base)" },
    ]);
  });

  it("o globals.css capturado do admin (17/09) é reprovado em todas as variáveis de cor", () => {
    const found = findTokenOverrides({ css: read("provenance/platform/context.css") });
    const names = new Set(found.map((o) => o.name));
    for (const name of ["--primary", "--background", "--border", "--ring", "--radius", "--chart-5", "--warning"])
      expect(names.has(name), name).toBe(true);
    expect(found.every((o) => /:root|\.dark/.test(o.where))).toBe(true);
  });
});

describe("o catálogo segue o contrato que cobra", () => {
  it("a base CSS dos Storybooks não declara variável do design system", () => {
    const css = consumerBase(read("provenance/platform/context.css"));
    expect(findTokenOverrides({ css: { "catálogo": css } })).toEqual([]);
  });
});

describe("assertNoTokenOverrides", () => {
  it("lança listando cada sobrescrita", () => {
    expect(() =>
      assertNoTokenOverrides({
        tailwindConfig: { theme: { extend: { colors: { primary: "x" } } } },
        css: { "globals.css": ":root { --primary: 1 1% 1%; }" },
      }),
    ).toThrowError(/redefine 2:\n {2}- primary {2}\(theme\.extend\.colors\)\n {2}- --primary {2}\(globals\.css:1 :root\)/);
  });

  it("não lança quando o consumidor segue o contrato", () => {
    expect(() => assertNoTokenOverrides({ css: ":root { --sidebar-width: 18rem; }" })).not.toThrow();
  });
});

describe("as listas acompanham o design system", () => {
  it("DESIGN_SYSTEM_VARIABLES é exatamente o que os tokens declaram fora do prefixo --hw-", () => {
    const css = read("tokens/core.css") + read("tokens/platform.css") + read("tokens/builder.css");
    const declared = new Set([...css.matchAll(/^\s*(--(?!hw-)[\w-]+)\s*:/gm)].map((m) => m[1]));
    expect([...declared].sort()).toEqual([...DESIGN_SYSTEM_VARIABLES].sort());
  });

  it("DESIGN_SYSTEM_THEME_KEYS é exatamente o que o preset define", () => {
    const extend = require("../tailwind/core-preset.cjs").theme.extend;
    for (const [category, keys] of Object.entries(DESIGN_SYSTEM_THEME_KEYS))
      expect(Object.keys(extend[category]), category).toEqual(keys);
  });
});
