import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ThemeScope, useScopedPortalStyle } from "../components/theme-scope";
import { defaultScopedTheme } from "../lib/scoped-theme";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../components/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Popover, PopoverContent, PopoverTrigger, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/menus";
import { Select } from "../components/select";

const alternate = { ...defaultScopedTheme, primary: defaultScopedTheme.text };
const fixtures = [
  ["dialog", <Dialog defaultOpen><DialogTrigger>Open</DialogTrigger><DialogContent aria-describedby={undefined} data-testid="portal"><DialogTitle>Dialog</DialogTitle></DialogContent></Dialog>],
  ["dropdown", <DropdownMenu defaultOpen><DropdownMenuTrigger>Open</DropdownMenuTrigger><DropdownMenuContent data-testid="portal"><DropdownMenuItem>Action</DropdownMenuItem></DropdownMenuContent></DropdownMenu>],
  ["popover", <Popover defaultOpen><PopoverTrigger>Open</PopoverTrigger><PopoverContent data-testid="portal">Details</PopoverContent></Popover>],
  ["tooltip", <TooltipProvider><Tooltip defaultOpen><TooltipTrigger>Open</TooltipTrigger><TooltipContent data-testid="portal">Help</TooltipContent></Tooltip></TooltipProvider>],
] as const;

describe("scoped portal theme bridge", () => {
  it.each(["--hw-primary", "--hw-surface", "--hw-duration-color"])("rejects scoped %s overrides without accepting partial tokens", (token) => {
    function Override() {
      const style = useScopedPortalStyle({ [token]: "unvalidated", maxWidth: 300 } as React.CSSProperties);
      return <div style={style} />;
    }
    expect(() => render(<ThemeScope><Override /></ThemeScope>)).toThrow(/cannot override design-system tokens/);
  });

  it("retains layout styles and external namespace values in a scoped real portal", async () => {
    render(<ThemeScope><Popover defaultOpen><PopoverTrigger>Open</PopoverTrigger><PopoverContent data-testid="portal" style={{ maxWidth: 300, "--color-primary": "host-owned" } as React.CSSProperties}>Details</PopoverContent></Popover></ThemeScope>);
    const portal = await screen.findByTestId("portal");
    expect(portal.style.maxWidth).toBe("300px");
    expect(portal.style.getPropertyValue("--color-primary")).toBe("host-owned");
    expect(portal.style.getPropertyValue("--hw-primary")).toBe(defaultScopedTheme.primary);
  });

  it.each(fixtures)("carries originating tokens to the body %s and updates an open portal atomically", async (_name, fixture) => {
    const view = render(<ThemeScope data-testid="scope">{fixture}</ThemeScope>);
    const portal = await screen.findByTestId("portal");
    expect(screen.getByTestId("scope")).not.toContainElement(portal);
    expect(portal.style.getPropertyValue("--hw-primary")).toBe(defaultScopedTheme.primary);
    expect(portal.style.getPropertyValue("--hw-duration-color")).toBe("var(--hw-duration-none)");
    expect(portal.style.getPropertyValue("--hw-duration-base")).toBe("");
    view.rerender(<ThemeScope data-testid="scope" theme={alternate}>{fixture}</ThemeScope>);
    expect(screen.getByTestId("portal")).toBe(portal);
    expect(portal.style.getPropertyValue("--hw-primary")).toBe(alternate.primary);
    view.rerender(<ThemeScope data-testid="scope" theme={{ ...alternate, primary: "invalid" }}>{fixture}</ThemeScope>);
    expect(portal.style.getPropertyValue("--hw-primary")).toBe(alternate.primary);
  });

  it("carries a nested scope through a Select opened inside a modal", async () => {
    const user = userEvent.setup();
    render(<ThemeScope><Dialog defaultOpen><DialogContent aria-describedby={undefined}><DialogTitle>Choose</DialogTitle>
      <ThemeScope theme={alternate}><Select ariaLabel="Status" options={[{ value: "draft", label: "Draft" }]} /></ThemeScope>
    </DialogContent></Dialog></ThemeScope>);
    const dialog = screen.getByRole("dialog");
    await user.click(screen.getByRole("combobox", { name: "Status" }));
    const listbox = await screen.findByRole("listbox");
    expect(listbox.style.getPropertyValue("--hw-primary")).toBe(alternate.primary);
    expect(listbox.style.getPropertyValue("--hw-duration-color")).toBe("var(--hw-duration-none)");
    expect(dialog.style.getPropertyValue("--hw-primary")).toBe(defaultScopedTheme.primary);
    expect(dialog).toHaveAttribute("aria-hidden", "true");
    await user.keyboard("{Escape}");
    expect(screen.getByRole("combobox", { name: "Status" })).toHaveFocus();
  });

  it("keeps two simultaneous non-modal portals attached to their own theme", async () => {
    render(<>
      <ThemeScope><Popover open><PopoverTrigger>First</PopoverTrigger><PopoverContent data-testid="first">One</PopoverContent></Popover></ThemeScope>
      <ThemeScope theme={alternate}><Popover open><PopoverTrigger>Second</PopoverTrigger><PopoverContent data-testid="second">Two</PopoverContent></Popover></ThemeScope>
    </>);
    expect((await screen.findByTestId("first")).style.getPropertyValue("--hw-primary")).toBe(defaultScopedTheme.primary);
    expect(screen.getByTestId("second").style.getPropertyValue("--hw-primary")).toBe(alternate.primary);
  });

  it("leaves unscoped custom styles untouched", async () => {
    render(<Popover defaultOpen><PopoverTrigger>Open</PopoverTrigger><PopoverContent data-testid="portal" style={{ maxWidth: 300 }}>Details</PopoverContent></Popover>);
    const portal = await screen.findByTestId("portal");
    expect(portal.style.maxWidth).toBe("300px");
    expect(portal.style.getPropertyValue("--hw-primary")).toBe("");
    expect(portal.style.getPropertyValue("--hw-duration-color")).toBe("");
  });
});
