import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { ErrorState } from "./index";

describe("ErrorState", () => {
  it("mostra o que falhou", () => {
    render(<ErrorState title="Não foi possível carregar" />);
    expect(screen.getByText("Não foi possível carregar")).toBeInTheDocument();
  });

  it("anuncia a falha como alerta, e não como texto comum", () => {
    render(<ErrorState title="Falhou" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("mostra a ação de recuperação quando repetir resolve", () => {
    render(<ErrorState title="Falhou" action={<button>Tentar novamente</button>} />);
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeInTheDocument();
  });

  it("esconde o ícone dos leitores de tela", () => {
    const { container } = render(<ErrorState title="Falhou" icon={<svg data-testid="i" />} />);
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });
});
