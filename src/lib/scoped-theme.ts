import { contrastRatio, parseOpaqueCssColor } from "./theme-validation";
import canonicalColors from "../../tokens/resolved-colors.json";

const roles = ["primary", "primaryHover", "primaryForeground", "primaryText", "primarySoft", "primarySoftForeground",
  "background", "surface", "subtle", "text", "textMuted", "focus", "inputBorder",
  "floating", "floatingForeground", "interactiveHover", "interactiveHoverForeground"] as const;
type ThemeRole = typeof roles[number];
export type ScopedThemeCandidate = Record<ThemeRole, string>;
type CheckRole = ThemeRole | keyof typeof canonicalColors;
type ThemeCheck = { foreground: CheckRole; background: CheckRole; ratio: number | null; threshold: number; passed: boolean };
type ThemeFailure = { field: string; message: string };

const tokenRoles: Record<string, ThemeRole> = {
  "--hw-primary": "primary", "--hw-primary-hover": "primaryHover", "--hw-primary-fg": "primaryForeground",
  "--hw-primary-text": "primaryText",
  "--hw-primary-soft": "primarySoft", "--hw-primary-soft-fg": "primarySoftForeground",
  "--hw-theme-background": "background", "--hw-surface": "surface", "--hw-surface-fg": "text",
  "--hw-surface-subtle": "subtle", "--hw-surface-subtle-fg": "text",
  "--hw-card": "surface", "--hw-card-fg": "text",
  "--hw-input-surface": "subtle", "--hw-input-surface-fg": "text", "--hw-input-border": "inputBorder",
  "--hw-text": "text", "--hw-text-secondary": "text", "--hw-text-muted": "textMuted", "--hw-focus": "focus",
  "--hw-floating": "floating", "--hw-floating-fg": "floatingForeground",
  "--hw-interactive-hover": "interactiveHover", "--hw-interactive-hover-fg": "interactiveHoverForeground",
};

/** Pure, atomic validation boundary. It does not apply CSS or assert whole-product theme coverage. */
export function resolveScopedTheme(candidate: ScopedThemeCandidate): {
  valid: boolean; tokens: Record<string, string> | null; checks: ThemeCheck[]; failures: ThemeFailure[];
} {
  const failures: ThemeFailure[] = [];
  const checks: ThemeCheck[] = [];
  for (const role of roles) {
    if (typeof candidate?.[role] !== "string" || !parseOpaqueCssColor(candidate[role]).ok) {
      failures.push({ field: role, message: `${role}: informe uma cor opaca resolvida.` });
    }
  }
  function colorFor(role: CheckRole) {
    return role in canonicalColors ? canonicalColors[role as keyof typeof canonicalColors] : candidate?.[role as ThemeRole];
  }
  function check(foreground: CheckRole, background: CheckRole, threshold = 4.5) {
    const foregroundColor = colorFor(foreground);
    const backgroundColor = colorFor(background);
    const ratio = typeof foregroundColor === "string" && typeof backgroundColor === "string"
      ? contrastRatio(foregroundColor, backgroundColor) : null;
    const passed = ratio !== null && ratio >= threshold;
    checks.push({ foreground, background, ratio, threshold, passed });
    if (!passed) failures.push({ field: `${foreground}/${background}`, message: `${foreground} sobre ${background}: contraste mínimo ${threshold}:1 não atendido.` });
  }
  check("primaryForeground", "primary");
  check("primaryForeground", "primaryHover");
  check("primarySoftForeground", "primarySoft");
  check("focus", "primarySoft", 3);
  check("floatingForeground", "floating");
  check("interactiveHoverForeground", "interactiveHover");
  for (const surface of ["background", "surface", "subtle", "floating", "interactiveHover"] as const) {
    check("text", surface);
    check("textMuted", surface);
    check("primaryText", surface);
    check("focus", surface, 3);
    check("--hw-danger-strong", surface);
  }
  check("focus", "--hw-surface-inverse", 3);
  for (const feedback of ["--hw-danger-soft", "--hw-warning-soft"] as const) {
    check("text", feedback);
    check("focus", feedback, 3);
  }
  check("inputBorder", "subtle", 3);
  check("inputBorder", "surface", 3);
  return {
    valid: failures.length === 0,
    tokens: failures.length ? null : Object.fromEntries(Object.entries(tokenRoles).map(([token, role]) => [token, candidate[role]])),
    checks,
    failures,
  };
}

// Generated from CSS at build time. No document/computed styles or runtime
// palette literals: SSR and the first client render have the same fallback.
export const defaultScopedTheme: ScopedThemeCandidate = Object.freeze(Object.fromEntries(
  roles.map((role) => {
    const token = Object.keys(tokenRoles).find((key) => tokenRoles[key] === role);
    if (!token || !(token in canonicalColors)) throw new Error(`Missing canonical theme role: ${role}`);
    return [role, canonicalColors[token as keyof typeof canonicalColors]];
  }),
) as ScopedThemeCandidate);

const defaultValidation = resolveScopedTheme(defaultScopedTheme);
if (!defaultValidation.valid) throw new Error("Canonical scoped theme fails its contrast contract.");

/** State transition shared by SSR initialization and updates. An invalid
 * candidate never partly overwrites applied values, even with an invalid prior.
 */
export function resolveScopedThemeUpdate(candidate: ScopedThemeCandidate, previous?: ScopedThemeCandidate) {
  const validation = resolveScopedTheme(candidate);
  const priorValidation = previous ? resolveScopedTheme(previous) : null;
  const source = validation.valid ? "candidate" : priorValidation?.valid ? "previous" : "default";
  const selected = source === "candidate" ? candidate : source === "previous" ? previous! : defaultScopedTheme;
  const resolved = source === "candidate" ? validation : source === "previous" ? priorValidation! : defaultValidation;
  return {
    source,
    validation,
    applied: Object.freeze(Object.fromEntries(roles.map((role) => [role, selected[role]])) as ScopedThemeCandidate),
    tokens: Object.freeze({ ...resolved.tokens! }),
  };
}
