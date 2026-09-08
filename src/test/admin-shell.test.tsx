import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminShell } from "../patterns/admin-shell";

const groupedNavigation = [
  { id: "home", href: "/home", label: "Home", group: "Conteúdo" },
  { id: "academy", href: "/academy", label: "Academy", group: "Conteúdo" },
  { id: "users", href: "/users", label: "Usuários", group: "Pessoas" },
];

function useMobileViewport() {
  const media = Object.assign(new EventTarget(), {
    matches: true,
    media: "(max-width: 48rem)",
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
  });
  vi.stubGlobal("matchMedia", () => media);
}

afterEach(() => vi.unstubAllGlobals());

describe("AdminShell navigation", () => {
  it.each([undefined, "missing-id"])("focuses inside the mobile dialog when currentItem is %s", async (currentItem) => {
    useMobileViewport();
    const user = userEvent.setup();
    render(<AdminShell brand="hywork" currentItem={currentItem} navigation={groupedNavigation}><main>Content</main></AdminShell>);
    await user.click(screen.getByRole("button", { name: "Abrir navegação" }));
    const dialog = screen.getByRole("dialog", { name: "Navegação principal" });
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
  });

  it("hydrates the server snapshot on a mobile viewport without discarding it", async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const tree = <AdminShell brand="hywork" navigation={groupedNavigation} workspace={<p>Workspace</p>}><main>Content</main></AdminShell>;
    const clientWindow = window;
    let html: string;
    vi.stubGlobal("window", undefined);
    try { html = renderToString(tree); }
    finally { vi.stubGlobal("window", clientWindow); }
    useMobileViewport();
    const host = document.createElement("div");
    host.innerHTML = html;
    document.body.append(host);
    const serverMain = host.querySelector("main");
    const errors: unknown[] = [];
    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      await act(async () => { root = hydrateRoot(host, tree, { onRecoverableError: (error) => errors.push(error) }); });
      expect(errors).toEqual([]);
      expect(host.querySelector("main")).toBe(serverMain);
    } finally { await act(async () => root?.unmount()); host.remove(); }
  });

  it("keeps legacy flat navigation current-page behavior", () => {
    render(
      <AdminShell
        brand="hywork"
        currentItem="campaigns"
        navigation={[
          { id: "overview", href: "#overview", label: "Visão geral" },
          { id: "campaigns", href: "#campaigns", label: "Campanhas" },
        ]}
      >
        <main id="campaigns">Campanhas</main>
      </AdminShell>
    );

    const links = within(
      screen.getByRole("navigation", { name: "Navegação principal" })
    ).getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual([
      "Visão geral",
      "Campanhas",
    ]);
    expect(screen.getByRole("link", { name: "Campanhas" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("adds grouped navigation, a mobile trigger and one child-owned main", () => {
    render(
      <AdminShell
        brand="hywork"
        currentItem="academy"
        contentId="workspace-content"
        navigation={groupedNavigation}
        utility={<button>Minha conta</button>}
      >
        <main>
          <h1>Academy</h1>
          <button>Criar curso</button>
        </main>
      </AdminShell>
    );

    expect(
      screen.getByRole("button", { name: "Abrir navegação" })
    ).toHaveAttribute("aria-expanded", "false");
    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(
      screen.getByRole("link", { name: "Pular para o conteúdo" })
    ).toHaveAttribute("href", "#workspace-content");
    expect(document.getElementById("workspace-content")).toHaveAttribute(
      "tabindex",
      "-1"
    );

    const navigation = screen.getByRole("navigation", {
      name: "Navegação principal",
    });
    expect(within(navigation).getByText("Conteúdo")).toBeVisible();
    expect(within(navigation).getByText("Pessoas")).toBeVisible();
    expect(
      within(navigation)
        .getAllByRole("link")
        .map((link) => link.textContent)
    ).toEqual(["Home", "Academy", "Usuários"]);
  });

  it("places workspace and utility once inside the mobile Radix dialog", async () => {
    useMobileViewport();
    const user = userEvent.setup();
    render(
      <AdminShell
        brand="hywork"
        currentItem="academy"
        navigation={groupedNavigation}
        workspace={<p id="workspace-name">Workspace principal</p>}
        utility={<button id="account-action">Minha conta</button>}
      >
        <main>Academy</main>
      </AdminShell>
    );

    const trigger = screen.getByRole("button", { name: "Abrir navegação" });
    await user.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Navegação principal" });
    expect(dialog).toContainElement(screen.getByText("Workspace principal"));
    expect(
      within(dialog).getByRole("button", { name: "Minha conta" })
    ).toBeVisible();
    expect(
      within(dialog).getByRole("link", { name: "Academy" })
    ).toHaveAttribute("aria-current", "page");
    expect(document.querySelectorAll("#workspace-name")).toHaveLength(1);
    expect(document.querySelectorAll("#account-action")).toHaveLength(1);

    await user.click(
      within(dialog).getByRole("button", { name: "Fechar navegação" })
    );
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
    expect(trigger).toHaveFocus();
  });
});
