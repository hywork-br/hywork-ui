import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Card } from "./index";

describe("Card", () => {
  it("usa a moldura decidida: raio 12, borda e sem sombra", () => {
    render(<Card data-testid="c">conteúdo</Card>);
    const card = screen.getByTestId("c");
    expect(card).toHaveClass("rounded-xl", "border");
    // A sombra fica reservada a sobreposições — diálogo, popover, menu.
    expect(card.className).not.toMatch(/\bshadow-(sm|md|lg)\b/);
  });

  it("aceita classe da tela sem perder a moldura", () => {
    render(<Card data-testid="c" className="p-0">conteúdo</Card>);
    expect(screen.getByTestId("c")).toHaveClass("rounded-xl", "p-0");
  });
});
