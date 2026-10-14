import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Sheet, SheetContent, SheetTitle } from "./index";

describe("SheetContent", () => {
  it('chama o botão de fechar de "Fechar" por padrão, em pt-BR', () => {
    render(
      <Sheet open>
        <SheetContent>
          <SheetTitle>Editar colaborador</SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByRole("button", { name: "Fechar" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
  });

  it("aceita outro rótulo pela tela", () => {
    render(
      <Sheet open>
        <SheetContent closeLabel="Fechar filtros">
          <SheetTitle>Filtros</SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByRole("button", { name: "Fechar filtros" })).toBeInTheDocument();
  });
});
