import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Spinner } from "./index";

describe("Spinner", () => {
  it("anuncia a espera a leitores de tela", () => {
    render(<Spinner />);
    expect(screen.getByRole("status")).toHaveTextContent("Carregando");
  });

  it("a altura vem do aspect-square, nunca de uma classe fixa (não vira oval)", () => {
    for (const size of ["sm", "md", "lg"] as const) {
      const { container, unmount } = render(<Spinner size={size} className="size-4" />);
      const circle = container.querySelector(".animate-spin");
      expect(circle).toHaveClass("aspect-square", "max-h-full", "max-w-full", "shrink-0");
      expect(circle?.className).not.toMatch(/(^|\s)(h|size)-/);
      unmount();
    }
  });

  it("respeita movimento reduzido", () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector(".animate-spin")).toHaveClass("motion-reduce:animate-none");
  });
});
