import { describe, expect, it } from "vitest";

import {
  AA_CONTRAST,
  BRAND_VARIABLES,
  MIN_TEXT_LC,
  apcaContrast,
  brandThemeVars,
  contrastRatio,
  parseHex,
} from "./brand";

type Hsl = [number, number, number];
const channels = (value: string | undefined): Hsl => {
  expect(value).toMatch(/^\d+(\.\d)? \d+(\.\d)?% \d+(\.\d)?%$/);
  return value!.replace(/%/g, "").split(" ").map(Number) as Hsl;
};
const WHITE: Hsl = [0, 0, 100];
const SLATE_900: Hsl = [222.2, 47.4, 11.2];
const lc = (fill: Hsl, text: Hsl) => Math.abs(apcaContrast(text, fill));

function check(hex: string) {
  const vars = brandThemeVars(hex);
  const fill = channels(vars["--hw-brand-primary"]);
  const fg = channels(vars["--hw-brand-primary-foreground"]);
  const hover = channels(vars["--hw-brand-primary-hover"]);
  const active = channels(vars["--hw-brand-primary-active"]);
  const ink = channels(vars["--hw-brand-primary-ink"]);
  // Texto sobre a marca: o de maior contraste APCA entre branco e slate-900,
  // nunca abaixo do piso — em repouso, no cursor e pressionado.
  const other = fg[2] === 100 ? SLATE_900 : WHITE;
  expect(lc(fill, fg)).toBeGreaterThanOrEqual(lc(fill, other));
  expect(lc(fill, fg)).toBeGreaterThanOrEqual(MIN_TEXT_LC);
  expect(lc(hover, fg)).toBeGreaterThanOrEqual(MIN_TEXT_LC);
  expect(lc(active, fg)).toBeGreaterThanOrEqual(MIN_TEXT_LC);
  // A marca como texto/linha sobre o fundo branco.
  expect(contrastRatio(ink, WHITE)).toBeGreaterThanOrEqual(AA_CONTRAST);
  // Hover e active mudam o preenchimento, na mesma matiz.
  expect(hover).not.toEqual(fill);
  expect(active).not.toEqual(hover);
  expect([hover[0], active[0], ink[0]]).toEqual([fill[0], fill[0], fill[0]]);
  return { vars, fill, fg, hover, active, ink };
}

describe("brandThemeVars", () => {
  it("escreve só os ganchos de marca", () => {
    expect(Object.keys(brandThemeVars("#434cad")).sort()).toEqual([...BRAND_VARIABLES].sort());
  });

  it.each([null, undefined, "", "red", "#12", "#12345", "#1234567", "#gggggg", "143748", "rgb(0,0,0)"])(
    "devolve {} para entrada inválida (%s) — vale o primário do design system",
    (value) => {
      expect(brandThemeVars(value as string | null | undefined)).toEqual({});
    },
  );

  it("aceita #rgb, #rrggbb e maiúsculas, com espaço em volta", () => {
    expect(brandThemeVars("#FFF")).toEqual(brandThemeVars("#ffffff"));
    expect(brandThemeVars(" #434CAD ")).toEqual(brandThemeVars("#434cad"));
    expect(parseHex("#abc")).toEqual([170, 187, 204]);
  });

  it("primário do design system (#143748): texto branco, e cursor/clique no degrau 600/700", () => {
    const { fill, fg, hover, active, ink } = check("#143748");
    expect(fill).toEqual([199.6, 56.5, 18]); // 200 57% 18% vindo do hex
    expect(fg).toEqual(WHITE);
    expect(hover[2]).toBe(15); // --hw-color-primary-600
    expect(active[2]).toBe(12); // --hw-color-primary-700
    expect(ink).toEqual(fill); // já tem contraste: a tinta é a própria marca
  });

  it("#434cad: texto branco (7.3:1) e tinta igual à marca", () => {
    const { fill, fg, ink } = check("#434cad");
    expect(fg).toEqual(WHITE);
    expect(contrastRatio(fill, fg)).toBeCloseTo(7.3, 1);
    expect(ink).toEqual(fill);
  });

  it("amarelo (#facc15): texto escuro, e a tinta escurece até 4.5:1 sobre o branco", () => {
    const { fill, fg, ink } = check("#facc15");
    expect(contrastRatio(fill, WHITE)).toBeLessThan(2); // branco sobre amarelo reprova
    expect(fg).toEqual([222.2, 47.4, 11.2]); // slate-900
    expect(ink[2]).toBeLessThan(fill[2]);
    expect(ink[1]).toBe(fill[1]);
  });

  it("branco (#ffffff): texto escuro, tinta cinza legível", () => {
    const { fg, ink } = check("#ffffff");
    expect(fg).toEqual([222.2, 47.4, 11.2]);
    expect(ink[2]).toBeLessThanOrEqual(46);
  });

  it("preto (#000000): texto branco, cursor clareia (não há como escurecer)", () => {
    const { fill, fg, hover, ink } = check("#000000");
    expect(fg).toEqual(WHITE);
    expect(hover[2]).toBeGreaterThan(fill[2]);
    expect(ink).toEqual(fill);
  });

  it.each(["#ff3b0a", "#f97316", "#ea580c", "#ff5722"])(
    "laranja (%s): texto branco — a PO reprovou o escuro sobre o laranja (07/10)",
    (hex) => {
      const { fill, fg, hover } = check(hex);
      expect(fg).toEqual(WHITE);
      // A WCAG 2 daria o escuro: o branco fica abaixo de 4.5:1 nesses tons.
      expect(contrastRatio(fill, WHITE)).toBeLessThan(AA_CONTRAST);
      expect(hover[2]).toBeLessThan(fill[2]); // cursor escurece
    },
  );

  it("azul médio (#3b82f6) e vermelho (#ef4444): texto branco", () => {
    expect(check("#3b82f6").fg).toEqual(WHITE);
    expect(check("#ef4444").fg).toEqual(WHITE);
  });

  it.each(["#fb923c", "#f59e0b", "#84cc16", "#22c55e"])(
    "tons claros (%s): texto escuro (slate-900)",
    (hex) => {
      expect(check(hex).fg).toEqual(SLATE_900);
    },
  );

  it("meio-tom cinza (#777777): texto branco", () => {
    expect(check("#777777").fg).toEqual(WHITE);
  });

  it("vale para qualquer cor: varredura de 4096 cores #rgb", () => {
    const hex = "0123456789abcdef";
    for (const r of hex) for (const g of hex) for (const b of hex) check(`#${r}${g}${b}`);
  });
});

describe("contrastRatio", () => {
  it("segue a fórmula da WCAG", () => {
    expect(contrastRatio(WHITE, [0, 0, 0])).toBeCloseTo(21, 5);
    expect(contrastRatio(WHITE, WHITE)).toBe(1);
  });
});

describe("apcaContrast", () => {
  it("bate com os valores de referência do APCA 0.0.98G", () => {
    const BLACK: Hsl = [0, 0, 0];
    const GRAY_888: Hsl = [0, 0, 53.3]; // #888888
    expect(apcaContrast(BLACK, WHITE)).toBeCloseTo(106.04, 1);
    expect(apcaContrast(WHITE, BLACK)).toBeCloseTo(-107.88, 1);
    expect(apcaContrast(GRAY_888, WHITE)).toBeCloseTo(63.06, 1);
    expect(apcaContrast(WHITE, GRAY_888)).toBeCloseTo(-68.54, 1);
    expect(apcaContrast(WHITE, WHITE)).toBe(0);
  });
});
