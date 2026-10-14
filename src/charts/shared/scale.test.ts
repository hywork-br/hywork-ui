import { describe, expect, it } from "vitest";

import { chartColor, defaultFormat, display, niceTicks, resolveDomain, seriesColors, wrapSubLines, wrapText } from "./scale";
import type { ChartColor } from "./types";

describe("chart scale helpers", () => {
  it("colours series by position, never by value, and lets a series pin a token", () => {
    expect(
      seriesColors([
        { id: "a", label: "A" },
        { id: "b", label: "B" },
        { id: "c", label: "C", color: "chart-4" },
      ]),
    ).toEqual(["hsl(var(--chart-1))", "hsl(var(--chart-5))", "hsl(var(--chart-4))"]);
  });

  it("only ever writes a chart token, even when handed something else", () => {
    expect(chartColor("red" as ChartColor)).toBe("hsl(var(--chart-1))");
    expect(chartColor("chart-3", 0.5)).toBe("hsl(var(--chart-3) / 0.5)");
  });

  it("formats in pt-BR and reads a missing value as a dash", () => {
    expect(defaultFormat(3.6)).toBe("3,6");
    expect(defaultFormat(1234)).toBe("1.234");
    expect(display(null, defaultFormat)).toBe("—");
    expect(display(Number.NaN, defaultFormat)).toBe("—");
  });

  it("keeps the screen's domain, or rounds the largest value up to a round step", () => {
    expect(resolveDomain([1, 5], [3])).toEqual([1, 5]);
    expect(resolveDomain(undefined, [3.6, 4.1])).toEqual([0, 5]);
    expect(resolveDomain(undefined, [34, 12])).toEqual([0, 40]);
    expect(resolveDomain(undefined, [null])).toEqual([0, 1]);
    // An inverted domain is ignored: back to the automatic one.
    expect(resolveDomain([5, 1], [3])).toEqual([0, 3]);
  });

  it("places the ticks on round steps from end to end", () => {
    expect(niceTicks([0, 5])).toEqual([0, 1, 2, 3, 4, 5]);
    expect(niceTicks([1, 5])).toEqual([1, 2, 3, 4, 5]);
    expect(niceTicks([0, 100])).toEqual([0, 20, 40, 60, 80, 100]);
    expect(niceTicks([0, 1])).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1]);
  });

  it("breaks a label by word, hyphenates a word wider than the line and ends an overflow with an ellipsis", () => {
    expect(wrapText("Visão de negócio e de cliente", 90)).toEqual(["Visão de", "negócio e de", "cliente"]);
    expect(wrapText("Comportamentalmente", 60)).toEqual(["Comport-", "amental-", "mente"]);
    expect(wrapText("um dois três quatro cinco seis sete oito nove dez", 60, 12, 2)).toEqual(["um dois", "três…"]);
    expect(wrapText("", 90)).toEqual([]);
  });

  it("gives the note and the marker a line each", () => {
    expect(wrapSubLines(["2 pessoas", undefined, "poucos dados"], 120)).toEqual(["2 pessoas", "poucos dados"]);
  });
});
