import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Button } from "./index";

describe("Button sobre superfície colorida", () => {
  it("inverse: o fundo da página como preenchimento, com o texto padrão", () => {
    render(<Button variant="inverse">Agendar</Button>);
    expect(screen.getByRole("button", { name: "Agendar" })).toHaveClass(
      "bg-background",
      "text-foreground",
    );
  });

  it("inverse-outline: contorno e texto na cor da superfície onde está", () => {
    render(
      <div className="text-vendor-foreground">
        <Button variant="inverse-outline">Ver o módulo</Button>
      </div>,
    );
    const button = screen.getByRole("button", { name: "Ver o módulo" });
    expect(button).toHaveClass("border-current", "bg-transparent");
    // hover escurece: clarear a superfície derrubava o contraste do texto branco
    expect(button).toHaveClass("hover:bg-foreground/10");
    expect(button.className).not.toMatch(/text-(foreground|primary|vendor)/);
  });

  it("mantém o anel de foco do botão", () => {
    render(<Button variant="inverse">Agendar</Button>);
    expect(screen.getByRole("button")).toHaveClass("focus-visible:ring-2", "focus-visible:ring-ring");
  });
});
