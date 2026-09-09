import { describe, expect, it } from "vitest";
import { defaultScopedTheme, resolveScopedTheme, resolveScopedThemeUpdate, type ScopedThemeCandidate } from "../lib/scoped-theme";
import canonicalColors from "../../tokens/resolved-colors.json";

const candidate: ScopedThemeCandidate = {
  primary: "#1e72a1", primaryHover: "#104a74", primaryForeground: "#ffffff", primaryText: "#104a74",
  primarySoft: "#edf1f5", primarySoftForeground: "#092938",
  background: "#ffffff", surface: "#ffffff", subtle: "#f3f3f3",
  text: "#092938", textMuted: "#595959", focus: "#e9501b", inputBorder: "#8c8c8c",
  floating: "#ffffff", floatingForeground: "#092938",
  interactiveHover: "#f3f3f3", interactiveHoverForeground: "#092938",
};

describe("scoped component theme contract", () => {
  it("checks focus against the fixed inverse navigation surface", () => {
    const result = resolveScopedTheme({ ...candidate, focus: candidate.primary });
    expect(result.valid).toBe(false);
    expect(result.failures.some((failure) => failure.field === "focus/--hw-surface-inverse")).toBe(true);
  });

  it("checks the fixed error ink on every customizable field/menu surface", () => {
    const result = resolveScopedTheme(candidate);
    for (const background of ["background", "surface", "subtle", "floating", "interactiveHover"]) {
      expect(result.checks.some((check) => check.foreground === "--hw-danger-strong" && check.background === background && check.threshold === 4.5)).toBe(true);
    }
  });

  it("checks scoped text and focus inside fixed feedback surfaces", () => {
    const result = resolveScopedTheme(candidate);
    for (const background of ["--hw-danger-soft", "--hw-warning-soft"]) {
      expect(result.checks.some((check) => check.foreground === "text" && check.background === background)).toBe(true);
      expect(result.checks.some((check) => check.foreground === "focus" && check.background === background && check.threshold === 3)).toBe(true);
    }
  });

  it("resolves a valid default from the same canonical tokens used by CSS", () => {
    const result = resolveScopedTheme(defaultScopedTheme);
    expect(result.valid).toBe(true);
    for (const [token, value] of Object.entries(result.tokens ?? {})) {
      expect(value, token).toBe(canonicalColors[token as keyof typeof canonicalColors]);
    }
  });

  it("uses the validated default immediately for an invalid initial theme", () => {
    const state = resolveScopedThemeUpdate({ ...candidate, primary: "not a color" });
    expect(state.validation.valid).toBe(false);
    expect(state.source).toBe("default");
    expect(state.applied).toEqual(defaultScopedTheme);
    expect(state.tokens).toEqual(resolveScopedTheme(defaultScopedTheme).tokens);
  });

  it("retains the complete previous valid theme when an update is rejected", () => {
    const prior = { ...candidate, primary: "#092938" };
    const state = resolveScopedThemeUpdate({ ...candidate, focus: "#ffffff" }, prior);
    expect(state.source).toBe("previous");
    expect(state.applied).toEqual(prior);
    expect(state.tokens).toEqual(resolveScopedTheme(prior).tokens);
    expect(state.validation.failures.some((failure) => failure.field === "focus/surface")).toBe(true);
  });

  it("never trusts an invalid previous theme as its safety fallback", () => {
    const invalid = { ...candidate, primaryForeground: candidate.primary };
    expect(resolveScopedThemeUpdate(invalid, invalid).source).toBe("default");
  });

  it("copies accepted values so mutation of a caller's draft cannot alter applied state", () => {
    const draft = { ...candidate };
    const state = resolveScopedThemeUpdate(draft);
    draft.primary = "#ffffff";
    expect(state.source).toBe("candidate");
    expect(state.applied.primary).toBe(candidate.primary);
    expect(state.tokens["--hw-primary"]).toBe(candidate.primary);
  });

  it("resolves only DS semantic tokens and checks rendered surface roles", () => {
    const result = resolveScopedTheme(candidate);
    expect(result.valid).toBe(true);
    expect(result.tokens?.["--hw-primary-hover"]).toBe(candidate.primaryHover);
    expect(result.tokens?.["--hw-input-surface"]).toBe(candidate.subtle);
    expect(Object.keys(result.tokens ?? {}).every((key) => key.startsWith("--hw-"))).toBe(true);
    expect(result.checks.some((check) => check.foreground === "textMuted" && check.background === "subtle")).toBe(true);
    expect(result.checks.some((check) => check.foreground === "focus" && check.background === "floating")).toBe(true);
  });

  it.each(["primaryHover", "floating", "subtle", "inputBorder"] as const)("rejects inaccessible %s atomically", (role) => {
    const value = role === "inputBorder" || role === "primaryHover" ? "#ffffff" : "#092938";
    const result = resolveScopedTheme({ ...candidate, [role]: value });
    expect(result.valid).toBe(false);
    expect(result.tokens).toBeNull();
    expect(result.failures.length).toBeGreaterThan(0);
  });

  it("cannot bypass focus checks by providing an empty adjacency list", () => {
    const result = resolveScopedTheme({ ...candidate, focus: "#fff", focusAdjacentSurfaces: [] } as ScopedThemeCandidate);
    expect(result.valid).toBe(false);
    expect(result.checks.filter((check) => check.foreground === "focus").length).toBeGreaterThanOrEqual(4);
  });

  it("rejects missing or unresolved roles instead of applying a partial theme", () => {
    const result = resolveScopedTheme({ ...candidate, surface: undefined, primary: "var(--color-primary)" } as unknown as ScopedThemeCandidate);
    expect(result.valid).toBe(false);
    expect(result.tokens).toBeNull();
    expect(result.failures.some((failure) => failure.field === "surface")).toBe(true);
  });

  it("rejects accent ink that disappears on a supported surface", () => {
    const result = resolveScopedTheme({ ...candidate, primaryText: "#ffffff" });
    expect(result.valid).toBe(false);
    expect(result.tokens).toBeNull();
    expect(result.failures.some((failure) => failure.field === "primaryText/surface")).toBe(true);
  });

  it("allows a light button fill independently from readable accent ink", () => {
    const result = resolveScopedTheme({
      ...candidate, primary: "#f09c26", primaryHover: "#f3b16f",
      primaryForeground: "#092938", primaryText: "#104a74",
    });
    expect(result.valid).toBe(true);
    expect(result.tokens?.["--hw-primary"]).toBe("#f09c26");
    expect(result.tokens?.["--hw-primary-text"]).toBe("#104a74");
  });

  it("checks focus against the selected navigation surface", () => {
    const result = resolveScopedTheme({
      ...candidate, primarySoft: candidate.focus, primarySoftForeground: "#000000",
    });
    expect(result.valid).toBe(false);
    expect(result.failures.some((failure) => failure.field === "focus/primarySoft")).toBe(true);
  });
});
