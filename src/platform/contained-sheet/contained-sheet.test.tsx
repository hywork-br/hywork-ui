import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";

import { SheetTitle } from "../../core/sheet";
import { SearchCombobox } from "../search-combobox";
import { ContainedSheet, type ContainedSheetProps } from "./index";

// jsdom não tem layout: posição, rolagem e contraste ficam com o navegador.
const violations = async (container: HTMLElement) =>
  (await axe.run(container, { rules: { "color-contrast": { enabled: false } } })).violations;

// O Radix só passa a ouvir o clique fora no tique seguinte à abertura.
const tique = () => act(() => new Promise((r) => setTimeout(r, 0)));

function Elemento({
  side,
  onOpenChange = vi.fn(),
  onFora = vi.fn(),
  inicial = false,
}: Pick<ContainedSheetProps, "side"> & {
  onOpenChange?: (open: boolean) => void;
  onFora?: () => void;
  inicial?: boolean;
}) {
  const [aberto, setAberto] = React.useState(inicial);
  const [texto, setTexto] = React.useState("");
  return (
    <div>
      <button type="button">Fora do elemento</button>
      <div data-testid="elemento" className="relative">
        <SearchCombobox
          label="Buscar pessoa"
          value={texto}
          onChange={setTexto}
          items={texto ? ["Ana Lima"] : []}
          getKey={(n) => n}
          renderItem={(n) => n}
          onPick={() => undefined}
        />
        <button type="button" onClick={() => setAberto(true)}>
          Abrir
        </button>
        <button type="button" onClick={onFora}>
          Outra pessoa
        </button>
        <ContainedSheet
          side={side}
          open={aberto}
          aria-describedby={undefined}
          onOpenChange={(o) => {
            onOpenChange(o);
            setAberto(o);
          }}
        >
          <SheetTitle>Ana Lima</SheetTitle>
          <button type="button">Ver perfil completo</button>
        </ContainedSheet>
      </div>
    </div>
  );
}

const painel = () => screen.getByRole("dialog", { name: "Ana Lima" });

describe("ContainedSheet", () => {
  it("fechado, não deixa nada no elemento", () => {
    render(<Elemento />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("abre dentro do elemento, não num portal no body", async () => {
    const user = userEvent.setup();
    render(<Elemento />);
    await user.click(screen.getByRole("button", { name: "Abrir" }));
    expect(screen.getByTestId("elemento")).toContainElement(painel());
  });

  it("ao abrir, o foco vai ao botão de fechar; ao fechar por ele, volta ao gatilho", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Elemento onOpenChange={onOpenChange} />);
    const abrir = screen.getByRole("button", { name: "Abrir" });
    await user.click(abrir);
    const fechar = screen.getByRole("button", { name: "Fechar" });
    expect(fechar).toHaveFocus();
    await user.click(fechar);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await tique();
    expect(abrir).toHaveFocus();
  });

  it("Esc fecha", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Elemento onOpenChange={onOpenChange} inicial />);
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("Esc na busca com sugestões abertas fecha as sugestões, não o painel", async () => {
    const user = userEvent.setup();
    render(<Elemento inicial />);
    await user.type(screen.getByRole("combobox"), "an");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(painel()).toBeInTheDocument();
    // Com a busca fechada, o próximo Esc é do painel.
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  describe('side="right"', () => {
    it("não é modal: o resto do elemento segue clicável e não fecha o painel", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      const onFora = vi.fn();
      render(<Elemento onOpenChange={onOpenChange} onFora={onFora} inicial />);
      await tique();
      expect(painel()).not.toHaveAttribute("aria-modal");
      await user.click(screen.getByRole("button", { name: "Outra pessoa" }));
      expect(onFora).toHaveBeenCalled();
      expect(onOpenChange).not.toHaveBeenCalled();
      expect(painel()).toBeInTheDocument();
    });

    it("não desenha fundo escurecido", () => {
      render(<Elemento inicial />);
      expect(screen.getByTestId("elemento").querySelectorAll('[data-state="open"]')).toHaveLength(1);
    });

    it("se a tela leva o foco a outro lugar antes de fechar, o foco fica lá", async () => {
      const user = userEvent.setup();
      render(<Elemento />);
      await user.click(screen.getByRole("button", { name: "Abrir" }));
      const outra = screen.getByRole("button", { name: "Outra pessoa" });
      outra.focus();
      await user.keyboard("{Escape}");
      await tique();
      expect(outra).toHaveFocus();
    });

    it("passa na auditoria do axe", async () => {
      const { container } = render(<Elemento inicial />);
      expect(await violations(container)).toEqual([]);
    });
  });

  describe('side="bottom"', () => {
    it("é modal, com o fundo escurecido dentro do elemento", () => {
      render(<Elemento side="bottom" inicial />);
      expect(painel()).toHaveAttribute("aria-modal", "true");
      const abertos = screen.getByTestId("elemento").querySelectorAll('[data-state="open"]');
      // o fundo e o painel, os dois dentro do elemento
      expect(abertos).toHaveLength(2);
    });

    it("clicar no fundo escurecido fecha", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(<Elemento side="bottom" onOpenChange={onOpenChange} inicial />);
      await tique();
      const fundo = [...screen.getByTestId("elemento").querySelectorAll('[data-state="open"]')].find(
        (el) => el.getAttribute("role") !== "dialog",
      ) as HTMLElement;
      await user.click(fundo);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("prende o foco: Tab não sai do painel", async () => {
      const user = userEvent.setup();
      render(<Elemento side="bottom" inicial />);
      await user.tab();
      await user.tab();
      expect(painel()).toContainElement(document.activeElement as HTMLElement);
    });

    it("aceita outro rótulo para o botão de fechar", () => {
      render(
        <ContainedSheet side="bottom" open onOpenChange={() => undefined} closeLabel="Fechar filtros" aria-describedby={undefined}>
          <SheetTitle>Filtros</SheetTitle>
        </ContainedSheet>,
      );
      expect(screen.getByRole("button", { name: "Fechar filtros" })).toBeInTheDocument();
    });

    it("passa na auditoria do axe", async () => {
      const { container } = render(<Elemento side="bottom" inicial />);
      expect(await violations(container)).toEqual([]);
    });
  });
});
