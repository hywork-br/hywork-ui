import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  contrastRatio,
  parseOpaqueCssColor,
  validateTenantTheme,
} from "../lib/theme-validation";
import { ThemeLab } from "../../stories/themes/theme-lab";
import { ValidationLab } from "../../stories/Themes.stories";

const labTheme = {
  primary: "#9f3714",
  primaryForeground: "#ffffff",
  background: "#ffffff",
  text: "#092938",
  focus: "#e9501b",
  focusAdjacentSurfaces: [{ name: "background", color: "#ffffff" }],
};

describe("tenant theme validation", () => {
  it("uses WCAG sRGB luminance math for black, white and shorthand hex", () => {
    expect(contrastRatio("#000", "#fff")).toBe(21);
    expect(contrastRatio("rgb(118, 118, 118)", "#ffffff")).toBeCloseTo(
      4.5422249596,
      9
    );
  });

  it("compares the raw ratio before displaying a rounded boundary", () => {
    const result = validateTenantTheme({
      primary: "rgb(0, 111, 251)",
      primaryForeground: "#ffffff",
      background: "#ffffff",
      text: "#092938",
      focus: "#092938",
      focusAdjacentSurfaces: [{ name: "background", color: "#ffffff" }],
    });

    const primaryForeground = result.checks.primaryForeground;
    expect(primaryForeground).not.toBeNull();
    if (!primaryForeground) throw new Error("expected a resolved contrast check");
    expect(primaryForeground.ratio).toBeCloseTo(
      4.4998880878,
      9
    );
    expect(primaryForeground.displayRatio).toBe(4.5);
    expect(primaryForeground.passed).toBe(false);
  });

  it.each([
    ["#12", "malformed hex"],
    ["#11223344", "hex alpha"],
    ["rgba(1, 2, 3, 1)", "rgba"],
    ["rgb(1 2 3 / 1)", "modern alpha"],
    ["rgb(256, 0, 0)", "out of range"],
    ["hsl(0 0% 0%)", "unsupported format"],
    ["transparent", "transparent keyword"],
    ["var(--hw-orange)", "unresolved variable"],
  ])("rejects %s fail closed (%s)", (candidate) => {
    expect(parseOpaqueCssColor(candidate)).toEqual({
      ok: false,
      input: candidate,
      reason: expect.any(String),
    });
  });

  it("returns each semantic pair, threshold and actionable failure", () => {
    const result = validateTenantTheme({
      primary: "#ffffff",
      primaryForeground: "#ffffff",
      background: "#ffffff",
      text: "#ffffff",
      focus: "#ffffff",
      focusAdjacentSurfaces: [
        { name: "background", color: "#ffffff" },
        { name: "primary", color: "#ffffff" },
      ],
    });

    expect(result.valid).toBe(false);
    expect(result.checks.primaryForeground).toMatchObject({
      foreground: "primaryForeground",
      background: "primary",
      threshold: 4.5,
      kind: "normal-text",
      passed: false,
    });
    expect(result.checks.text).toMatchObject({
      foreground: "text",
      background: "background",
      threshold: 4.5,
      kind: "normal-text",
      passed: false,
    });
    expect(result.focusChecks).toHaveLength(2);
    expect(result.focusChecks[0]).toMatchObject({
      foreground: "focus",
      background: "background",
      threshold: 3,
      kind: "nontext-focus",
      passed: false,
    });
    expect(result.failures).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "insufficient-contrast",
          message: expect.stringContaining("4.5:1"),
        }),
      ])
    );
  });

  it("uses the raw ratio on both sides of the 3:1 focus boundary", () => {
    const candidate = {
      primary: "#092938",
      primaryForeground: "#ffffff",
      background: "#ffffff",
      text: "#092938",
      focusAdjacentSurfaces: [{ name: "background", color: "#ffffff" }],
    };
    const immediatelyBelow = validateTenantTheme({
      ...candidate,
      focus: "rgb(0, 153, 255)",
    }).focusChecks[0];
    const immediatelyAbove = validateTenantTheme({
      ...candidate,
      focus: "rgb(0, 154, 249)",
    }).focusChecks[0];

    expect(immediatelyBelow.ratio).toBeCloseTo(2.9997886802, 9);
    expect(immediatelyAbove.ratio).toBeCloseTo(3.0042269034, 9);
    expect(immediatelyBelow.displayRatio).toBe(3);
    expect(immediatelyAbove.displayRatio).toBe(3);
    expect(immediatelyBelow.threshold).toBe(3);
    expect(immediatelyAbove.threshold).toBe(3);
    expect(immediatelyBelow.passed).toBe(false);
    expect(immediatelyAbove.passed).toBe(true);
  });

  it("reports invalid candidates without producing contrast checks", () => {
    const result = validateTenantTheme({
      primary: "transparent",
      primaryForeground: "#ffffff",
      background: "#ffffff",
      text: "#092938",
      focus: "#e9501b",
      focusAdjacentSurfaces: [{ name: "background", color: "#ffffff" }],
    });

    expect(result.valid).toBe(false);
    expect(result.checks.primaryForeground).toBeNull();
    expect(result.failures[0]).toMatchObject({
      code: "invalid-color",
      field: "primary",
    });
  });
});

describe("ThemeLab", () => {
  it("keeps the last valid preview and explains a rejected native color edit", async () => {
    const user = userEvent.setup();
    render(<ThemeLab initialTheme={labTheme} />);

    const preview = screen.getByTestId("theme-preview");
    const initialPrimary = preview.style.getPropertyValue("--color-primary");
    const editor = screen.getByLabelText("Cor primária do tenant");

    await user.clear(editor);
    await user.type(editor, "#ffffff");

    expect(screen.getByRole("alert")).toHaveTextContent("Rejeitada");
    expect(screen.getByRole("alert")).toHaveTextContent("4,5:1");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Texto do botão sobre cor primária"
    );
    expect(preview.style.getPropertyValue("--color-primary")).toBe(
      initialPrimary
    );
    expect(screen.getByText("Protótipo de laboratório")).toBeInTheDocument();
    expect(
      screen.getByText(/Nenhuma configuração é salva ou enviada/)
    ).toBeInTheDocument();
  });

  it("applies a valid edit locally and includes the mobile long-label fixture", async () => {
    const user = userEvent.setup();
    render(<ThemeLab initialTheme={labTheme} />);
    const preview = screen.getByTestId("theme-preview");
    const editor = screen.getByLabelText("Cor primária do tenant");

    await user.clear(editor);
    await user.type(editor, "#092938");

    expect(screen.getByRole("status")).toHaveTextContent("Aprovada");
    expect(preview.style.getPropertyValue("--color-primary")).toBe("#092938");
    expect(
      screen.getByRole("button", {
        name: "Continuar para revisar todas as unidades selecionadas",
      })
    ).toBeInTheDocument();
  });

  it("keeps the branded preview action operable and local-only", async () => {
    const user = userEvent.setup();
    render(<ThemeLab initialTheme={labTheme} />);
    const action = screen.getByRole("button", {
      name: "Continuar para revisar todas as unidades selecionadas",
    });

    expect(action).toBeEnabled();
    action.focus();
    expect(action).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByText("Prévia confirmada localmente.")).toHaveAttribute(
      "role",
      "status"
    );
  });

  it("executes the published story play against rejected and approved previews", async () => {
    const primitives = {
      "--hw-rust-strong": "#9f3714",
      "--hw-white": "#ffffff",
      "--hw-amber-tint": "#fdf2e2",
      "--hw-navy": "#092938",
      "--hw-orange": "#e9501b",
    };
    for (const [token, value] of Object.entries(primitives)) {
      document.documentElement.style.setProperty(token, value);
    }

    try {
      render(<ThemeLab />);
      const play = ValidationLab.play as unknown as (context: {
        canvasElement: HTMLElement;
      }) => Promise<void>;
      await play({ canvasElement: document.body });
    } finally {
      for (const token of Object.keys(primitives)) {
        document.documentElement.style.removeProperty(token);
      }
    }
  });
});
