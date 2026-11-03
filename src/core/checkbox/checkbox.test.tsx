import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Checkbox } from "./index";

/** The two icons inside the indicator: [check, dash]. */
const icones = (caixa: HTMLElement) => Array.from(caixa.querySelectorAll("svg"));

describe("Checkbox", () => {
  it("desmarcada não desenha ícone nenhum", () => {
    render(<Checkbox aria-label="Notificar" />);
    const caixa = screen.getByRole("checkbox", { name: "Notificar" });
    expect(caixa).not.toBeChecked();
    expect(icones(caixa)).toHaveLength(0);
  });

  it("marcada mostra o ✓ e esconde o traço", () => {
    render(<Checkbox aria-label="Notificar" defaultChecked />);
    const caixa = screen.getByRole("checkbox", { name: "Notificar" });
    expect(caixa).toBeChecked();
    expect(caixa).toHaveClass("data-[state=checked]:bg-primary");
    const [check, traco] = icones(caixa);
    expect(check).not.toHaveClass("hidden");
    expect(traco).toHaveClass("hidden");
  });

  it("no estado misto é preenchida como a marcada e troca o ✓ pelo traço", () => {
    render(<Checkbox aria-label="Selecionar todas" checked="indeterminate" />);
    const caixa = screen.getByRole("checkbox", { name: "Selecionar todas" });
    expect(caixa).toBePartiallyChecked();
    expect(caixa).toHaveAttribute("data-state", "indeterminate");
    expect(caixa).toHaveClass("data-[state=indeterminate]:bg-primary", "data-[state=indeterminate]:text-primary-foreground");
    const indicador = caixa.querySelector("[data-state=indeterminate]:not([role])");
    expect(indicador).toHaveClass("group");
    const [check, traco] = icones(caixa);
    expect(check).toHaveClass("group-data-[state=indeterminate]:hidden");
    expect(traco).toHaveClass("hidden", "group-data-[state=indeterminate]:block");
  });

  it("do misto, o clique marca", async () => {
    const user = userEvent.setup();
    render(<Checkbox aria-label="Selecionar todas" defaultChecked="indeterminate" />);
    const caixa = screen.getByRole("checkbox", { name: "Selecionar todas" });
    await user.click(caixa);
    expect(caixa).toBeChecked();
  });
});
