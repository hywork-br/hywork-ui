import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { BreadcrumbEllipsis } from "./index";

describe("BreadcrumbEllipsis", () => {
  it('chama os níveis ocultos de "Mais" por padrão, em pt-BR', () => {
    render(<BreadcrumbEllipsis />);
    expect(screen.getByText("Mais")).toHaveClass("sr-only");
    expect(screen.queryByText("More")).not.toBeInTheDocument();
  });

  it("aceita outro rótulo pela tela", () => {
    render(<BreadcrumbEllipsis label="Mais pastas" />);
    expect(screen.getByText("Mais pastas")).toHaveClass("sr-only");
  });
});
