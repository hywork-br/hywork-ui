export const NORMAL_TEXT_CONTRAST = 4.5;
export const NON_TEXT_CONTRAST = 3;

export type RgbColor = { red: number; green: number; blue: number };

export type ParsedColor =
  | { ok: true; input: string; value: RgbColor }
  | { ok: false; input: string; reason: string };

export type ContrastCheck = {
  foreground: string;
  background: string;
  ratio: number;
  displayRatio: number;
  threshold: number;
  kind: "normal-text" | "nontext-focus";
  passed: boolean;
};

export type ThemeFailure = {
  code: "invalid-color" | "insufficient-contrast";
  field: string;
  message: string;
};

export type TenantThemeCandidate = {
  primary: string;
  primaryForeground: string;
  background: string;
  text: string;
  focus: string;
  focusAdjacentSurfaces: Array<{ name: string; color: string }>;
};

export type ThemeValidationResult = {
  valid: boolean;
  checks: {
    primaryForeground: ContrastCheck | null;
    text: ContrastCheck | null;
  };
  focusChecks: ContrastCheck[];
  failures: ThemeFailure[];
};

const HEX_COLOR = /^#([\da-f]{3}|[\da-f]{6})$/i;
const RGB_COLOR = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i;

export function parseOpaqueCssColor(input: string): ParsedColor {
  const normalized = input.trim();
  const hex = HEX_COLOR.exec(normalized);
  if (hex) {
    const expanded =
      hex[1].length === 3
        ? [...hex[1]].map((channel) => channel + channel).join("")
        : hex[1];
    return {
      ok: true,
      input,
      value: {
        red: Number.parseInt(expanded.slice(0, 2), 16),
        green: Number.parseInt(expanded.slice(2, 4), 16),
        blue: Number.parseInt(expanded.slice(4, 6), 16),
      },
    };
  }

  const rgb = RGB_COLOR.exec(normalized);
  if (rgb) {
    const channels = rgb.slice(1).map(Number);
    if (channels.every((channel) => channel >= 0 && channel <= 255)) {
      return {
        ok: true,
        input,
        value: {
          red: channels[0],
          green: channels[1],
          blue: channels[2],
        },
      };
    }
  }

  return {
    ok: false,
    input,
    reason:
      "Use hex curto, hex completo ou a função CSS rgb com três canais inteiros de 0 a 255.",
  };
}

function linearize(channel: number) {
  const srgb = channel / 255;
  return srgb <= 0.04045
    ? srgb / 12.92
    : ((srgb + 0.055) / 1.055) ** 2.4;
}

function luminance(color: RgbColor) {
  return (
    0.2126 * linearize(color.red) +
    0.7152 * linearize(color.green) +
    0.0722 * linearize(color.blue)
  );
}

export function contrastRatio(foreground: string, background: string) {
  const parsedForeground = parseOpaqueCssColor(foreground);
  const parsedBackground = parseOpaqueCssColor(background);
  if (!parsedForeground.ok || !parsedBackground.ok) return null;
  const foregroundLuminance = luminance(parsedForeground.value);
  const backgroundLuminance = luminance(parsedBackground.value);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

function checkPair(
  foregroundName: string,
  foreground: string,
  backgroundName: string,
  background: string,
  threshold: number,
  kind: ContrastCheck["kind"]
): ContrastCheck | null {
  const ratio = contrastRatio(foreground, background);
  if (ratio === null) return null;
  return {
    foreground: foregroundName,
    background: backgroundName,
    ratio,
    displayRatio: Math.round(ratio * 100) / 100,
    threshold,
    kind,
    passed: ratio >= threshold,
  };
}

function pairLabel(check: ContrastCheck) {
  if (
    check.foreground === "primaryForeground" &&
    check.background === "primary"
  ) {
    return "Texto do botão sobre cor primária";
  }
  if (check.foreground === "text" && check.background === "background") {
    return "Texto principal sobre fundo";
  }
  return `Foco sobre superfície ${check.background}`;
}

export function validateTenantTheme(
  candidate: TenantThemeCandidate
): ThemeValidationResult {
  const failures: ThemeFailure[] = [];
  const adjacentFields: Array<[string, string]> =
    candidate.focusAdjacentSurfaces.map(({ name, color }) => [
      `focusAdjacentSurfaces.${name}`,
      color,
    ]);
  const fields: Array<[string, string]> = [
    ["primary", candidate.primary],
    ["primaryForeground", candidate.primaryForeground],
    ["background", candidate.background],
    ["text", candidate.text],
    ["focus", candidate.focus],
    ...adjacentFields,
  ];

  for (const [field, color] of fields) {
    const parsed = parseOpaqueCssColor(color);
    if (!parsed.ok) {
      failures.push({
        code: "invalid-color",
        field,
        message: `${field}: ${parsed.reason}`,
      });
    }
  }

  const primaryForeground = checkPair(
    "primaryForeground",
    candidate.primaryForeground,
    "primary",
    candidate.primary,
    NORMAL_TEXT_CONTRAST,
    "normal-text"
  );
  const text = checkPair(
    "text",
    candidate.text,
    "background",
    candidate.background,
    NORMAL_TEXT_CONTRAST,
    "normal-text"
  );
  const focusChecks = candidate.focusAdjacentSurfaces.flatMap(
    ({ name, color }) => {
      const check = checkPair(
        "focus",
        candidate.focus,
        name,
        color,
        NON_TEXT_CONTRAST,
        "nontext-focus"
      );
      return check ? [check] : [];
    }
  );

  for (const check of [primaryForeground, text, ...focusChecks]) {
    if (check && !check.passed) {
      failures.push({
        code: "insufficient-contrast",
        field: `${check.foreground}/${check.background}`,
        message: `${pairLabel(check)}: ${check.displayRatio.toLocaleString("pt-BR")}:1; mínimo ${check.threshold.toLocaleString("pt-BR")}:1 (limiar numérico ${check.threshold}:1). Escolha uma combinação com mais contraste.`,
      });
    }
  }

  return {
    valid: failures.length === 0,
    checks: { primaryForeground, text },
    focusChecks,
    failures,
  };
}
