import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Alert, AlertTitle } from "./index";

describe("Alert", () => {
  it("anuncia como alerta", () => {
    render(<Alert><AlertTitle>Atenção</AlertTitle></Alert>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("mostra a ação à direita do texto", () => {
    render(
      <Alert action={<button>Baixar erros</button>}>
        <AlertTitle>12 linhas falharam</AlertTitle>
      </Alert>,
    );
    expect(screen.getByRole("button", { name: "Baixar erros" })).toBeInTheDocument();
    // Com ação, o aviso vira uma linha: texto à esquerda, ação à direita.
    expect(screen.getByRole("alert")).toHaveClass("flex", "items-center");
  });

  it("sem ação, não vira linha nem embrulha o conteúdo", () => {
    render(<Alert><AlertTitle>Atenção</AlertTitle></Alert>);
    const aviso = screen.getByRole("alert");
    expect(aviso).not.toHaveClass("flex");
    expect(aviso.firstElementChild?.tagName).toBe("H2");
  });

  it("mantém a forma decidida: raio 6 e respiro 16/12", () => {
    render(<Alert><AlertTitle>Atenção</AlertTitle></Alert>);
    expect(screen.getByRole("alert")).toHaveClass("rounded-md", "px-4", "py-3");
  });
});
