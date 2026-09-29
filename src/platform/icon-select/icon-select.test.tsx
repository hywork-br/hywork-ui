import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { FontAwesomeIconSelect, getFontAwesomeIconClass } from "./index";

describe("FontAwesomeIconSelect", () => {
  it("mostra o texto de apoio sem ícone escolhido", () => {
    render(<FontAwesomeIconSelect value="" onChange={() => undefined} />);
    expect(screen.getByText("Selecione um ícone")).toBeInTheDocument();
  });

  it("monta a classe do ícone", () => {
    expect(getFontAwesomeIconClass("star")).toMatch(/star/);
  });
});
