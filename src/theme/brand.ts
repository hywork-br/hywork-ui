/**
 * Workspace brand color → the CSS variables the design system reads.
 *
 * The brand is the ONLY color a consumer may set (Rick, 06/10/2026). The
 * design system derives `--primary`, `--primary-foreground`,
 * `--primary-hover`, `--primary-active`, `--primary-ink` and `--ring` from
 * these hooks in tokens/core.css; without them, its own primary applies.
 *
 * Pure: no DOM, no React. Safe in a Server Component (e.g. on `<html style>`),
 * in Node and in tests — which is why it also ships from `@hywork/ui/theme`,
 * an entry without the "use client" banner.
 */

/** The hooks written by {@link brandThemeVars}, and nothing else. */
export const BRAND_VARIABLES = [
  "--hw-brand-primary",
  "--hw-brand-primary-foreground",
  "--hw-brand-primary-hover",
  "--hw-brand-primary-active",
  "--hw-brand-primary-ink",
] as const;

export type BrandVariable = (typeof BRAND_VARIABLES)[number];
export type BrandThemeVars = Partial<Record<BrandVariable, string>>;

type Rgb = readonly [number, number, number];
type Hsl = readonly [number, number, number];

/** WCAG 2.x AA for normal text. */
export const AA_CONTRAST = 4.5;

const WHITE: Hsl = [0, 0, 100];
// slate-900, the darkest text the product already uses (page titles).
const NEAR_BLACK: Hsl = [222.2, 47.4, 11.2];
// Last resort: for any color, white or pure black reaches at least 4.58:1.
const BLACK: Hsl = [0, 0, 0];
// The surface the brand is read on as text or line: --background (white).
const SURFACE: Hsl = WHITE;

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** `#rgb` or `#rrggbb` (any case) → RGB 0-255; anything else → null. */
export function parseHex(value: unknown): Rgb | null {
  if (typeof value !== "string") return null;
  const match = HEX.exec(value.trim());
  if (!match) return null;
  const digits = match[1].length === 3 ? [...match[1]].map((d) => d + d).join("") : match[1];
  return [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16)) as unknown as Rgb;
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export function rgbToHsl([r, g, b]: Rgb): Hsl {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, round1(l * 100)];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === rn) h = ((gn - bn) / d) % 6;
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  h *= 60;
  if (h < 0) h += 360;
  return [round1(h), round1(s * 100), round1(l * 100)];
}

export function hslToRgb([h, s, l]: Hsl): Rgb {
  const sn = s / 100;
  const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;
  const [r, g, b] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [r, g, b].map((v) => Math.round((v + m) * 255)) as unknown as Rgb;
}

function luminance([r, g, b]: Rgb): number {
  const channel = (v: number) => {
    const n = v / 255;
    return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio between two colors given as HSL channels. */
export function contrastRatio(a: Hsl, b: Hsl): number {
  const [la, lb] = [luminance(hslToRgb(a)), luminance(hslToRgb(b))];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** HSL channels as the tokens write them: `"200 57% 18%"`. */
export function formatHsl([h, s, l]: Hsl): string {
  return `${round1(h)} ${round1(s)}% ${round1(l)}%`;
}

/** White when it reaches AA on the fill; otherwise the dark text that does. */
function foregroundFor(fill: Hsl): Hsl {
  if (contrastRatio(fill, WHITE) >= AA_CONTRAST) return WHITE;
  if (contrastRatio(fill, NEAR_BLACK) >= AA_CONTRAST) return NEAR_BLACK;
  return BLACK;
}

/**
 * Hover and active move the fill's lightness away from the foreground, so the
 * text never loses contrast while the pointer is on it. The step grows with
 * lightness (a light fill needs a larger change to read as "pressed"); on the
 * design system default (L 18%) it lands on the primary-600/700 scale.
 */
function shade(fill: Hsl, foreground: Hsl, times: 1 | 2): Hsl {
  const [h, s, l] = fill;
  const step = Math.max(3, Math.round(l * 0.15)) * times;
  const base = contrastRatio(fill, foreground);
  for (const next of [l - step, l + step]) {
    if (next < 0 || next > 100) continue;
    const candidate: Hsl = [h, s, round1(next)];
    if (contrastRatio(candidate, foreground) >= Math.min(base, AA_CONTRAST)) return candidate;
  }
  return fill;
}

/**
 * The brand as text or line on the white surface (active tab, link, focus
 * ring, checkbox border): the brand itself when it already reaches 4.5:1,
 * otherwise darkened — same hue and saturation — until it does.
 */
function inkFor(fill: Hsl): Hsl {
  const [h, s, l] = fill;
  for (let next = l; next >= 0; next -= 1) {
    const candidate: Hsl = [h, s, round1(clamp(next, 0, 100))];
    if (contrastRatio(candidate, SURFACE) >= AA_CONTRAST) return candidate;
  }
  return [h, s, 0];
}

/**
 * CSS variables that put a workspace brand on the design system.
 *
 * Accepts `#rgb` or `#rrggbb`. Anything else — `null`, `""`, `"red"`,
 * `"#12345"` — returns `{}`, and the design system default applies.
 *
 * ```tsx
 * // Server Component (no flash): the brand is on the first paint.
 * <html style={brandThemeVars(workspace.color_primary_hex)}>
 *
 * // Client: <BrandTheme color={hex}> or useBrandTheme(hex) — see core/brand-theme.
 * ```
 *
 * Text on the brand always reaches WCAG AA (4.5:1): white when it passes,
 * otherwise near-black (slate-900), otherwise black.
 */
export function brandThemeVars(hex?: string | null): BrandThemeVars {
  const rgb = parseHex(hex);
  if (!rgb) return {};
  const fill = rgbToHsl(rgb);
  const foreground = foregroundFor(fill);
  return {
    "--hw-brand-primary": formatHsl(fill),
    "--hw-brand-primary-foreground": formatHsl(foreground),
    "--hw-brand-primary-hover": formatHsl(shade(fill, foreground, 1)),
    "--hw-brand-primary-active": formatHsl(shade(fill, foreground, 2)),
    "--hw-brand-primary-ink": formatHsl(inkFor(fill)),
  };
}
