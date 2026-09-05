import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QualityWorkspace } from "../../stories/details/quality-workspace";

beforeEach(() => sessionStorage.clear());
afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute("style");
});

describe("interface detail workspace", () => {
  it("keeps the count of applied advanced criteria visible when filters are collapsed", async () => {
    render(<QualityWorkspace />);
    const disclosure = screen.getByText("Mais filtros");
    await userEvent.click(disclosure);
    await userEvent.click(screen.getByRole("combobox", { name: "Autores" }));
    await userEvent.click(screen.getByRole("option", { name: "Ana Lima" }));
    fireEvent.change(screen.getByLabelText("De"), { target: { value: "2026-09-01" } });
    await userEvent.click(disclosure);
    expect(disclosure).toHaveTextContent("Mais filtros (2)");
    expect(disclosure.closest("details")).not.toHaveAttribute("open");
  });
  it("starts with content, opens contextual preferences and returns focus on Escape", async () => {
    render(<QualityWorkspace />);
    expect(screen.queryByLabelText("Densidade")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Arquivar selecionados/ })).not.toBeInTheDocument();
    const preferences = screen.getByRole("button", { name: "Preferências de visualização" });
    await userEvent.click(preferences);
    screen.getByLabelText("Densidade").focus();
    await userEvent.keyboard("{Escape}");
    expect(preferences).toHaveFocus();
    expect(screen.queryByLabelText("Densidade")).not.toBeInTheDocument();
  });

  it("reveals scoped selection actions, archives the page and returns focus to search", async () => {
    render(<QualityWorkspace />);
    await userEvent.click(screen.getByLabelText("Selecionar página"));
    expect(screen.getByRole("region", { name: "Ações da seleção" })).toHaveTextContent("5 nesta página");
    const archive = screen.getByRole("button", { name: "Arquivar selecionados desta página (5)" });
    archive.focus();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("searchbox")).toHaveFocus();
    expect(screen.queryByRole("region", { name: "Ações da seleção" })).not.toBeInTheDocument();
    expect(screen.getByText("5 conteúdo(s) desta página arquivado(s) na fixture.")).toBeVisible();
    expect(within(screen.getByRole("table")).queryByText("Cultura que aproxima")).not.toBeInTheDocument();
  });

  it("clears all pages by keyboard without leaving focus on a removed control", async () => {
    render(<QualityWorkspace />);
    await userEvent.click(screen.getByLabelText("Selecionar página"));
    screen.getByRole("button", { name: "Limpar seleção de todas as páginas" }).focus();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("searchbox")).toHaveFocus();
    expect(screen.queryByRole("button", { name: /Limpar seleção/ })).not.toBeInTheDocument();
  });

  it("keeps failed edits, retries and updates the same collection only after confirmation", async () => {
    let confirm!: () => void;
    const save = vi.fn().mockRejectedValueOnce(new Error("fixture failure"))
      .mockImplementationOnce(() => new Promise<void>((resolve) => { confirm = resolve; }));
    render(<QualityWorkspace saveFixture={save} />);
    await userEvent.click(screen.getByRole("button", { name: "Editar Cultura que aproxima" }));
    const title = screen.getByRole("textbox", { name: "Título do conteúdo" });
    await userEvent.clear(title);
    await userEvent.type(title, "Cultura em movimento");
    await userEvent.click(screen.getByRole("button", { name: "Salvar título" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Seu título continua aqui");
    expect(title).toHaveValue("Cultura em movimento");
    expect(within(screen.getByRole("table")).getByText("Cultura que aproxima")).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(screen.getByRole("button", { name: "Salvar título" })).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByText("Título salvo na demonstração local.")).not.toBeInTheDocument();
    await act(async () => confirm());
    expect(within(screen.getByRole("table")).getByText("Cultura em movimento")).toBeVisible();
    await waitFor(() => expect(screen.getByText("Título salvo na demonstração local.")).toBeVisible());
    expect(title).toHaveFocus();
  });

  it("protects an open local draft from row replacement and archival, then explicitly discards", async () => {
    render(<QualityWorkspace />);
    await userEvent.click(screen.getByRole("button", { name: "Editar Cultura que aproxima" }));
    await userEvent.type(screen.getByRole("textbox", { name: "Título do conteúdo" }), " revisado");
    expect(screen.getByRole("button", { name: "Editar Boas-vindas à equipe" })).toBeDisabled();
    await userEvent.click(screen.getByLabelText("Selecionar página"));
    expect(screen.getByRole("button", { name: /Arquivar selecionados/ })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Descartar alterações e fechar" }));
    expect(screen.getByRole("searchbox")).toHaveFocus();
    expect(within(screen.getByRole("table")).getByText("Cultura que aproxima")).toBeVisible();
    expect(screen.getByRole("button", { name: /Arquivar selecionados/ })).toBeEnabled();
  });

  it("settles a running entrance and removes an exiting region when reduced motion changes", async () => {
    const media = Object.assign(new EventTarget(), { matches: false });
    vi.stubGlobal("matchMedia", () => media);
    document.documentElement.style.setProperty("--hw-duration-base", "180ms");
    document.documentElement.style.setProperty("--hw-duration-fast", "120ms");
    document.documentElement.style.setProperty("--hw-ease-standard", "cubic-bezier(0.2, 0, 0, 1)");
    const { container } = render(<QualityWorkspace />);
    fireEvent.pointerDown(screen.getByLabelText("Selecionar página"));
    fireEvent.click(screen.getByLabelText("Selecionar página"));
    const region = screen.getByRole("region", { name: "Ações da seleção" });
    act(() => { media.matches = true; media.dispatchEvent(new Event("change")); });
    expect(region).toHaveStyle({ opacity: "1", transform: "none", height: "auto" });
    expect(container.querySelector('[data-pilot-motion="instant"]')).toBeInTheDocument();
    act(() => { media.matches = false; media.dispatchEvent(new Event("change")); });
    fireEvent.keyDown(screen.getByRole("searchbox"), { key: "Tab" });
    expect(region).toHaveStyle({ opacity: "1", transform: "none", height: "auto" });
    expect(container.querySelector('[data-pilot-motion="instant"]')).toBeInTheDocument();
    fireEvent.pointerDown(screen.getByRole("button", { name: /Limpar seleção/ }));
    fireEvent.click(screen.getByRole("button", { name: /Limpar seleção/ }));
    expect(region).toHaveAttribute("inert");
    expect(region).toHaveAttribute("aria-hidden", "true");
    act(() => { media.matches = true; media.dispatchEvent(new Event("change")); });
    await waitFor(() => expect(region).not.toBeInTheDocument());
    document.documentElement.removeAttribute("style");
  });
});
