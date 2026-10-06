/**
 * Guard for consumers: the design system is the only authority on color and
 * tokens (Rick, 06/10/2026). Call it from a test in the consumer, so that a
 * local override fails CI instead of silently beating the preset.
 *
 * ```ts
 * // src/design-system.test.ts (hywork-plataform)
 * import { readFileSync } from "node:fs";
 * import loadConfig from "tailwindcss/loadConfig";
 * import { assertNoTokenOverrides } from "@hywork/ui/consumer-check";
 *
 * test("o design system é a única fonte de cor e token", () => {
 *   assertNoTokenOverrides({
 *     tailwindConfig: loadConfig("tailwind.config.ts"),
 *     css: { "globals.css": readFileSync("src/app/styles/globals.css", "utf8") },
 *   });
 * });
 * ```
 *
 * Pure: no file system, no Tailwind. It receives the config object as the
 * consumer wrote it (presets are ignored) and the CSS text.
 */

export interface TokenOverride {
  /** `tailwind` — a key in the consumer's theme; `css` — a declaration in its CSS. */
  source: "tailwind" | "css";
  /** The key (`primary`) or the variable (`--primary`). */
  name: string;
  /** `theme.extend.colors`, or `globals.css:14 :root`. */
  where: string;
}

export interface ConsumerSources {
  /** The consumer's Tailwind config as written — NOT resolved. */
  tailwindConfig?: unknown;
  /** Its global CSS: the text, or `{ "file name": text }` for clearer reports. */
  css?: string | Record<string, string>;
}

/**
 * Variables of the application contract, declared by tokens/core.css and
 * tokens/platform.css. A consumer declaring any of them shadows the design
 * system. Kept in sync with the CSS by a test in this repository.
 */
export const DESIGN_SYSTEM_VARIABLES: readonly string[] = [
  "background", "foreground", "card", "card-foreground", "popover", "popover-foreground",
  "primary", "primary-foreground", "primary-hover", "primary-active", "primary-ink",
  "secondary", "secondary-foreground", "muted", "muted-foreground", "accent", "accent-foreground",
  "destructive", "destructive-foreground", "success", "success-foreground", "warning",
  "warning-foreground", "error", "error-foreground", "info", "info-foreground",
  "border", "input", "ring", "radius", "chart-1", "chart-2", "chart-3", "chart-4", "chart-5",
  "admin-bg", "admin-surface", "admin-sidebar",
].map((name) => `--${name}`);

/**
 * Theme keys the presets define, per category. Colors are stricter: ANY key
 * the consumer adds is reported, because a color the design system lacks is a
 * token to ask for here, not a local key.
 */
export const DESIGN_SYSTEM_THEME_KEYS: Readonly<Record<string, readonly string[]>> = {
  borderRadius: ["none", "sm", "DEFAULT", "md", "lg", "xl", "2xl", "full", "base", "radius-md", "radius-sm"],
  spacing: [
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "14", "16", "20", "24", "28",
    "32", "36", "40", "44", "48", "52", "56", "60", "64", "72", "80", "96", "px", "0.5", "1.5",
    "2.5", "3.5", "sidebar", "sidebar-collapsed", "header", "content-gap",
  ],
  fontSize: ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"],
  fontWeight: ["light", "normal", "medium", "semibold", "bold", "extrabold"],
  fontFamily: ["sans", "montserrat"],
  ringColor: ["DEFAULT"],
};

/** The brand hook is the one color input a consumer may write. */
const isDesignSystemVariable = (name: string) =>
  DESIGN_SYSTEM_VARIABLES.includes(name) || (name.startsWith("--hw-") && !name.startsWith("--hw-brand-"));

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function tailwindOverrides(input: unknown): TokenOverride[] {
  // `await import("./tailwind.config")` hands over the module, not the config.
  const config = isObject(input) && !("theme" in input) && isObject(input.default) ? input.default : input;
  const theme = isObject(config) && isObject(config.theme) ? config.theme : undefined;
  if (!theme) return [];
  const found: TokenOverride[] = [];
  const scopes: Array<[string, Record<string, unknown>]> = [["theme", theme]];
  if (isObject(theme.extend)) scopes.push(["theme.extend", theme.extend]);
  for (const [path, scope] of scopes) {
    const colors = scope.colors;
    if (typeof colors === "function") found.push({ source: "tailwind", name: "colors", where: path });
    else if (isObject(colors))
      for (const key of Object.keys(colors)) found.push({ source: "tailwind", name: key, where: `${path}.colors` });
    for (const [category, owned] of Object.entries(DESIGN_SYSTEM_THEME_KEYS)) {
      const values = scope[category];
      if (!isObject(values)) continue;
      for (const key of Object.keys(values))
        if (owned.includes(key)) found.push({ source: "tailwind", name: key, where: `${path}.${category}` });
    }
  }
  return found;
}

/** Custom property declarations with their rule and line. Comments and strings are skipped. */
function declarations(css: string): Array<{ name: string; rule: string; line: number }> {
  const found: Array<{ name: string; rule: string; line: number }> = [];
  const preludes: string[] = [];
  let line = 1;
  let segment = "";
  let segmentLine = 1;
  const flush = () => {
    const match = /^\s*(--[\w-]+)\s*:/.exec(segment);
    if (match && preludes.length) {
      const rules = preludes.filter((p) => !p.startsWith("@"));
      const atRules = preludes.filter((p) => p.startsWith("@"));
      const rule = (rules[rules.length - 1] ?? "") + (atRules.length ? ` (${atRules.join(" ")})` : "");
      const offset = segment.slice(0, segment.indexOf(match[1])).split("\n").length - 1;
      found.push({ name: match[1], rule: rule.trim(), line: segmentLine + offset });
    }
    segment = "";
    segmentLine = line;
  };
  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (ch === "/" && css[i + 1] === "*") {
      const end = css.indexOf("*/", i + 2);
      const comment = css.slice(i, end === -1 ? css.length : end + 2);
      line += comment.split("\n").length - 1;
      segment += comment.replace(/[^\n]/g, " ");
      i += comment.length - 1;
      continue;
    }
    if (ch === '"' || ch === "'") {
      let j = i + 1;
      while (j < css.length && css[j] !== ch) j += css[j] === "\\" ? 2 : 1;
      const text = css.slice(i, j + 1);
      line += text.split("\n").length - 1;
      segment += text;
      i = j;
      continue;
    }
    if (ch === "{") {
      preludes.push(segment.replace(/\s+/g, " ").trim());
      segment = "";
      segmentLine = line;
    } else if (ch === ";") {
      flush();
    } else if (ch === "}") {
      flush();
      preludes.pop();
    } else {
      if (ch === "\n") line++;
      segment += ch;
    }
  }
  return found;
}

function cssOverrides(css: ConsumerSources["css"]): TokenOverride[] {
  if (css === undefined) return [];
  const files = typeof css === "string" ? { css } : css;
  const found: TokenOverride[] = [];
  for (const [file, text] of Object.entries(files))
    for (const { name, rule, line } of declarations(text))
      if (isDesignSystemVariable(name))
        found.push({ source: "css", name, where: `${file}:${line} ${rule}`.trim() });
  return found;
}

/** Every place where the consumer redefines a color or token the design system owns. */
export function findTokenOverrides({ tailwindConfig, css }: ConsumerSources): TokenOverride[] {
  return [...tailwindOverrides(tailwindConfig), ...cssOverrides(css)];
}

/** Throws, listing each override, when the consumer redefines what the design system owns. */
export function assertNoTokenOverrides(sources: ConsumerSources): void {
  const found = findTokenOverrides(sources);
  if (!found.length) return;
  const lines = found.map((o) => `  - ${o.name}  (${o.where})`);
  throw new Error(
    [
      `O design system é a única fonte de cor e token (decisão do Rick, 06/10/2026), e este consumidor redefine ${found.length}:`,
      ...lines,
      "Remova a chave do tailwind.config e a variável do CSS. A cor do workspace entra por brandThemeVars(); um token que falta se pede no hywork-ui.",
    ].join("\n"),
  );
}
