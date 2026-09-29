import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Spinner } from "./index";

describe("Spinner", () => {
  it("anuncia a espera a leitores de tela", () => {
    render(<Spinner />);
    expect(screen.getByRole("status")).toHaveTextContent("Carregando");
  });

  it("respeita movimento reduzido", () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector(".animate-spin")).toHaveClass("motion-reduce:animate-none");
  });
});
