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

/** WCAG 2.x AA for normal text — the bar for the brand as text on white. */
export const AA_CONTRAST = 4.5;

/**
 * Floor, in APCA Lc, for the text on the brand. Picking the stronger of white
 * and slate-900 never lands below ~54 on any color; hover and active may not
 * take the label under this floor (or under its resting contrast, if lower).
 */
export const MIN_TEXT_LC = 50;

const WHITE: Hsl = [0, 0, 100];
// slate-900, the darkest text the product already uses (page titles).
const NEAR_BLACK: Hsl = [222.2, 47.4, 11.2];
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

/**
 * APCA lightness contrast (Lc) of `text` on `background`, 0.0.98G-4g — the
 * perceptual model of the WCAG 3 draft. Positive for dark text on a light
 * fill, negative for light text on a dark one; compare with Math.abs.
 *
 * WCAG 2 rates white on a saturated orange or blue below black (3.6:1 against
 * 5:1 on #ff3b0a), which is not how people read it: the PO rejected the dark
 * label on an orange workspace (07/10/2026). APCA ranks it the other way.
 */
export function apcaContrast(text: Hsl, background: Hsl): number {
  const y = ([r, g, b]: Rgb) =>
    0.2126729 * (r / 255) ** 2.4 + 0.7151522 * (g / 255) ** 2.4 + 0.072175 * (b / 255) ** 2.4;
  const soft = (v: number) => (v > 0.022 ? v : v + (0.022 - v) ** 1.414);
  const yt = soft(y(hslToRgb(text)));
  const yb = soft(y(hslToRgb(background)));
  if (Math.abs(yb - yt) < 0.0005) return 0;
  if (yb > yt) {
    const sapc = (yb ** 0.56 - yt ** 0.57) * 1.14;
    return sapc < 0.1 ? 0 : (sapc - 0.027) * 100;
  }
  const sapc = (yb ** 0.65 - yt ** 0.62) * 1.14;
  return sapc > -0.1 ? 0 : (sapc + 0.027) * 100;
}

const textContrast = (fill: Hsl, text: Hsl) => Math.abs(apcaContrast(text, fill));

/** HSL channels as the tokens write them: `"200 57% 18%"`. */
export function formatHsl([h, s, l]: Hsl): string {
  return `${round1(h)} ${round1(s)}% ${round1(l)}%`;
}

/**
 * The label on the brand: white or slate-900, whichever reads stronger (APCA).
 * Orange, red and mid blue get white; yellow, lime, amber and white get dark.
 */
function foregroundFor(fill: Hsl): Hsl {
  return textContrast(fill, WHITE) >= textContrast(fill, NEAR_BLACK) ? WHITE : NEAR_BLACK;
}

/** Lightness points (up to `limit`) the fill can move in `dir` with the label still at `floor`. */
function room(fill: Hsl, foreground: Hsl, dir: -1 | 1, limit: number, floor: number): number {
  const [h, s, l] = fill;
  let reach = 0;
  for (let d = 1; d <= limit; d += 1) {
    const next = round1(l + dir * d);
    if (next < 0 || next > 100 || textContrast([h, s, next], foreground) < floor) break;
    reach = d;
  }
  return reach;
}

/**
 * Hover and active: the fill one and two steps darker — or lighter, when
 * darkening has less room before the label drops under the floor — so the
 * text never fades while the pointer is on it. The step grows with lightness
 * (a light fill needs a larger change to read as "pressed"); on the design
 * system default (L 18%) it lands on the primary-600/700 scale. When there is
 * no room for two full steps, the two states split what there is.
 */
function shades(fill: Hsl, foreground: Hsl): [Hsl, Hsl] {
  const [h, s, l] = fill;
  const step = Math.max(3, Math.round(l * 0.15));
  const floor = Math.min(textContrast(fill, foreground), MIN_TEXT_LC);
  const down = room(fill, foreground, -1, 2 * step, floor);
  const up = room(fill, foreground, 1, 2 * step, floor);
  const [dir, span] = down >= up ? ([-1, down] as const) : ([1, up] as const);
  const hover = span === 2 * step ? step : Math.ceil(span / 2);
  return [
    [h, s, round1(l + dir * hover)],
    [h, s, round1(l + dir * span)],
  ];
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
 * The label on the brand is white or slate-900, whichever has the higher APCA
 * contrast (PO, 07/10/2026); the ink — the brand as text on white — keeps
 * WCAG AA (4.5:1).
 */
export function brandThemeVars(hex?: string | null): BrandThemeVars {
  const rgb = parseHex(hex);
  if (!rgb) return {};
  const fill = rgbToHsl(rgb);
  const foreground = foregroundFor(fill);
  const [hover, active] = shades(fill, foreground);
  return {
    "--hw-brand-primary": formatHsl(fill),
    "--hw-brand-primary-foreground": formatHsl(foreground),
    "--hw-brand-primary-hover": formatHsl(hover),
    "--hw-brand-primary-active": formatHsl(active),
    "--hw-brand-primary-ink": formatHsl(inkFor(fill)),
  };
}
