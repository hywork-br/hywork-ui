import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { EmptyState } from "./index";

describe("EmptyState", () => {
  it("mostra a frase principal", () => {
    render(<EmptyState title="Nenhum resultado encontrado" />);
    expect(screen.getByText("Nenhum resultado encontrado")).toBeInTheDocument();
  });

  it("dispensa descrição, ícone e ação", () => {
    const { container } = render(<EmptyState title="Vazio" />);
    expect(container.querySelectorAll("p")).toHaveLength(1);
  });

  it("mostra a ação quando há um próximo passo", () => {
    render(<EmptyState title="Vazio" action={<button>Convidar</button>} />);
    expect(screen.getByRole("button", { name: "Convidar" })).toBeInTheDocument();
  });

  it("esconde o ícone dos leitores de tela", () => {
    const { container } = render(<EmptyState title="Vazio" icon={<svg data-testid="i" />} />);
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });
});
