import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// O embla mede o layout com APIs que o jsdom não tem; o teste cobre a
// anatomia do componente, não a física da rolagem.
vi.mock("embla-carousel-react", () => ({ default: () => [() => undefined, undefined] }));

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./index";

function Exemplo() {
  return (
    <Carousel>
      <CarouselContent>
        <CarouselItem>Um</CarouselItem>
        <CarouselItem>Dois</CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}

describe("Carousel", () => {
  it("expõe a região como carrossel", () => {
    render(<Exemplo />);
    expect(screen.getByRole("region")).toHaveAttribute("aria-roledescription", "carousel");
  });

  it("segue a Opção A: setas circulares de 28px na linha do trilho", () => {
    render(<Exemplo />);
    for (const nome of ["Anterior", "Próximo"]) {
      const seta = screen.getByRole("button", { name: nome });
      expect(seta).toHaveClass("h-7", "w-7", "rounded-full", "border", "bg-white");
      expect(seta).not.toHaveClass("absolute");
    }
  });

  it("não mostra indicadores de posição", () => {
    render(<Exemplo />);
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });

  it("recusa uso fora do container", () => {
    const silencio = console.error;
    console.error = () => undefined;
    expect(() => render(<CarouselNext />)).toThrow(/dentro de <Carousel/);
    console.error = silencio;
  });
});
