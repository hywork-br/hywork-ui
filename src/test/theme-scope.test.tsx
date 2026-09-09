import * as React from "react";
import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ThemeScope, useThemeScope } from "../components/theme-scope";
import { defaultScopedTheme } from "../lib/scoped-theme";

afterEach(() => vi.unstubAllGlobals());

function ReadScope({ name }: { name: string }) {
  const scope = useThemeScope();
  return <output data-testid={name}>{scope ? `${scope.applied.primary}|${scope.validation.valid}` : "outside"}</output>;
}

describe("ThemeScope", () => {
  it("exposes the scoped theme contract without exposing the portal implementation hook", async () => {
    const api = await import("../index");
    expect(api).toHaveProperty("ThemeScope", ThemeScope);
    expect(api).toHaveProperty("useThemeScope", useThemeScope);
    expect(api).toHaveProperty("defaultScopedTheme", defaultScopedTheme);
    expect(api).toHaveProperty("resolveScopedTheme");
    expect(api).toHaveProperty("resolveScopedThemeUpdate");
    expect(api).not.toHaveProperty("useScopedPortalStyle");
  });
  it("hydrates an invalid initial theme without replacing the safe server snapshot", async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const tree = <ThemeScope theme={{ ...defaultScopedTheme, primary: "rejected" }}><button>Safe action</button></ThemeScope>;
    const host = document.createElement("div");
    host.innerHTML = renderToString(tree);
    document.body.append(host);
    const serverButton = host.querySelector("button");
    const errors: unknown[] = [];
    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      await React.act(async () => { root = hydrateRoot(host, tree, { onRecoverableError: (error) => errors.push(error) }); });
      expect(errors).toEqual([]);
      expect(host.querySelector("button")).toBe(serverButton);
      expect((host.firstElementChild as HTMLElement).style.getPropertyValue("--hw-primary")).toBe(defaultScopedTheme.primary);
    } finally {
      await React.act(async () => root?.unmount());
      host.remove();
    }
  });

  it("renders an invalid initial candidate using canonical values without browser globals", () => {
    vi.stubGlobal("window", undefined);
    vi.stubGlobal("document", undefined);
    const html = renderToString(<ThemeScope theme={{ ...defaultScopedTheme, primary: "invalid-candidate" }}><ReadScope name="scope" /></ThemeScope>);
    expect(html).not.toContain("invalid-candidate");
    expect(html).toContain(`--hw-primary:${defaultScopedTheme.primary}`);
    expect(html).toContain(`${defaultScopedTheme.primary}|false`);
  });

  it("accepts valid updates and preserves the last complete theme when rejected", () => {
    const view = render(<ThemeScope><ReadScope name="scope" /></ThemeScope>);
    const valid = { ...defaultScopedTheme, primary: defaultScopedTheme.text };
    view.rerender(<ThemeScope theme={valid}><ReadScope name="scope" /></ThemeScope>);
    expect(screen.getByTestId("scope")).toHaveTextContent(`${valid.primary}|true`);
    view.rerender(<ThemeScope theme={{ ...valid, focus: valid.surface }}><ReadScope name="scope" /></ThemeScope>);
    expect(screen.getByTestId("scope")).toHaveTextContent(`${valid.primary}|false`);
    const host = screen.getByTestId("scope").parentElement!;
    expect(host.style.getPropertyValue("--hw-focus")).toBe(valid.focus);
    expect(host.style.getPropertyValue("--hw-primary")).toBe(valid.primary);
  });

  it("keeps sibling and nested providers independent and restores the outer context", () => {
    const other = { ...defaultScopedTheme, primary: defaultScopedTheme.text };
    render(<>
      <ReadScope name="outside" />
      <ThemeScope><ReadScope name="first" /><ThemeScope theme={other}><ReadScope name="nested" /></ThemeScope><ReadScope name="after" /></ThemeScope>
      <ThemeScope theme={other}><ReadScope name="second" /></ThemeScope>
    </>);
    expect(screen.getByTestId("outside")).toHaveTextContent("outside");
    expect(screen.getByTestId("first")).toHaveTextContent(`${defaultScopedTheme.primary}|true`);
    expect(screen.getByTestId("after")).toHaveTextContent(`${defaultScopedTheme.primary}|true`);
    expect(screen.getByTestId("nested")).toHaveTextContent(`${other.primary}|true`);
    expect(screen.getByTestId("second")).toHaveTextContent(`${other.primary}|true`);
  });

  it("does not mutate body or document styles on mount, update or unmount", () => {
    const rootStyle = document.documentElement.getAttribute("style");
    const bodyStyle = document.body.getAttribute("style");
    const view = render(<ThemeScope><button>Action</button></ThemeScope>);
    view.rerender(<ThemeScope theme={{ ...defaultScopedTheme, primary: defaultScopedTheme.text }}><button>Action</button></ThemeScope>);
    view.unmount();
    expect(document.documentElement.getAttribute("style")).toBe(rootStyle);
    expect(document.body.getAttribute("style")).toBe(bodyStyle);
  });

  it("rejects unvalidated inline scope styles at runtime", () => {
    const props = { style: { "--hw-primary": "unvalidated" } } as unknown as React.ComponentProps<typeof ThemeScope>;
    expect(() => render(<ThemeScope {...props} />)).toThrow(/style/i);
  });
});
