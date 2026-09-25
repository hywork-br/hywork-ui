import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { FormMessage } from "./index";

describe("FormMessage", () => {
  it("mostra a mensagem", () => {
    render(<FormMessage>Campo obrigatório</FormMessage>);
    expect(screen.getByText("Campo obrigatório")).toBeInTheDocument();
  });

  it("anuncia como alerta, para o leitor de tela não depender do foco", () => {
    render(<FormMessage>Campo obrigatório</FormMessage>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("não renderiza nada sem mensagem", () => {
    const { container } = render(<FormMessage />);
    expect(container).toBeEmptyDOMElement();
  });

  it("não renderiza nada com mensagem vazia", () => {
    const { container } = render(<FormMessage>{""}</FormMessage>);
    expect(container).toBeEmptyDOMElement();
  });
});
