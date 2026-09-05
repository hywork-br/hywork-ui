import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FeaturePilot } from "../../stories/pilots/feature-pilot";
import { academy, tv } from "../../stories/pilots/model";

beforeEach(() => {
  sessionStorage.clear();
  window.history.replaceState({}, "", "/");
});
afterEach(() => vi.unstubAllGlobals());

describe("optional motion pilot", () => {
  it("responds to reduced-motion changes during the same session", () => {
    const media = Object.assign(new EventTarget(), { matches: false });
    vi.stubGlobal("matchMedia", () => media);
    const { container } = render(
      <FeaturePilot config={tv} {...{ motionPilot: true }} />
    );
    fireEvent.pointerDown(screen.getByRole("textbox"));
    expect(
      container.querySelector('[data-pilot-motion="full"]')
    ).toBeInTheDocument();
    act(() => {
      media.matches = true;
      media.dispatchEvent(new Event("change"));
    });
    expect(
      container.querySelector('[data-pilot-motion="instant"]')
    ).toBeInTheDocument();
    act(() => {
      media.matches = false;
      media.dispatchEvent(new Event("change"));
    });
    expect(
      container.querySelector('[data-pilot-motion="full"]')
    ).toBeInTheDocument();
  });

  it("returns focus to search when the last chip is removed by keyboard", async () => {
    window.history.replaceState({}, "", "/?pilot-tv-status=active");
    render(<FeaturePilot config={tv} {...{ motionPilot: true }} />);
    const remove = screen.getByRole("button", { name: "Remover Ativo" });
    remove.focus();
    await userEvent.setup().keyboard("{Enter}");
    expect(
      screen.getByRole("textbox", { name: "Buscar em TV Corporativa" })
    ).toHaveFocus();
    expect(
      screen.queryByRole("button", { name: "Remover Ativo" })
    ).not.toBeInTheDocument();
    expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(
      4
    );
  });

  it("announces pending then confirmed save without keeping the editor open", async () => {
    render(<FeaturePilot config={academy} {...{ motionPilot: true }} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Novo curso" }));
    await user.type(
      screen.getByRole("textbox", { name: "Nome do curso" }),
      "Curso de movimento"
    );
    await user.click(
      screen.getByRole("button", { name: "Salvar rascunho e voltar" })
    );
    expect(
      within(screen.getByRole("dialog")).getByRole("status")
    ).toHaveTextContent("Salvando");
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
    expect(screen.getByRole("status")).toHaveTextContent("Curso de movimento");
    expect(screen.getByRole("status")).toHaveTextContent("salvo");
    expect(screen.getByRole("button", { name: "Novo curso" })).toHaveFocus();
  });

  it("keeps failure recoverable and never announces success before persistence", async () => {
    render(<FeaturePilot config={academy} {...{ motionPilot: true }} />);
    const user = userEvent.setup();
    await user.click(screen.getByText("Cenários de demonstração"));
    await user.click(
      screen.getByRole("checkbox", { name: "Falhar próximo salvamento" })
    );
    await user.click(screen.getByRole("button", { name: "Novo curso" }));
    await user.type(
      screen.getByRole("textbox", { name: "Nome do curso" }),
      "Retomar depois do erro"
    );
    await user.dblClick(
      screen.getByRole("button", { name: "Salvar rascunho e voltar" })
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Seus dados continuam aqui"
    );
    expect(screen.getByRole("textbox", { name: "Nome do curso" })).toHaveValue(
      "Retomar depois do erro"
    );
    expect(
      screen.queryByText(/Retomar depois do erro.*salvo/)
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
    expect(
      screen.getAllByRole("heading", { name: "Retomar depois do erro" })
    ).toHaveLength(1);
  });
});
