import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";

import { axeOptions } from "../../../tests/resize-observer";
import { ChartFrame } from "./index";

describe("ChartFrame", () => {
  it("is a region named by its title, with base, chart and footer", () => {
    render(
      <ChartFrame title="Distribuição dos resultados" base="4 pessoas" footer="Baseado na nota final do ciclo">
        <div data-testid="grafico" />
      </ChartFrame>,
    );
    const region = screen.getByRole("region", { name: "Distribuição dos resultados" });
    expect(screen.getByRole("heading", { level: 2, name: "Distribuição dos resultados" })).toBeInTheDocument();
    expect(region).toHaveTextContent("4 pessoas");
    expect(region).toHaveTextContent("Baseado na nota final do ciclo");
    expect(screen.getByTestId("grafico")).toBeInTheDocument();
  });

  it("explains the calculation in a popover, from a button", async () => {
    render(
      <ChartFrame title="Por pilar" howCalculated="Média simples entre as pessoas.">
        <div />
      </ChartFrame>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Como é calculado" }));
    expect(await screen.findByRole("dialog")).toHaveTextContent("Como é calculadoMédia simples entre as pessoas.");
  });

  it("has no calculation button without an explanation, and shows the actions", () => {
    render(
      <ChartFrame title="Por estrutura" actions={<button type="button">Diretoria</button>}>
        <div />
      </ChartFrame>,
    );
    expect(screen.queryByRole("button", { name: "Como é calculado" })).toBeNull();
    expect(screen.getByRole("button", { name: "Diretoria" })).toBeInTheDocument();
  });

  it("shows the skeleton while loading, and keeps the title", () => {
    render(
      <ChartFrame title="Líderes" state="loading">
        <div data-testid="grafico" />
      </ChartFrame>,
    );
    const region = screen.getByRole("region", { name: "Líderes" });
    expect(region).toHaveAttribute("aria-busy", "true");
    expect(region).toHaveTextContent("Carregando");
    expect(screen.queryByTestId("grafico")).toBeNull();
  });

  it("says there is not enough data in place of the chart, or the screen's own sentence", () => {
    const { rerender } = render(
      <ChartFrame title="Evolução" state="empty" footer="Baseado na nota final do ciclo">
        <div data-testid="grafico" />
      </ChartFrame>,
    );
    expect(screen.getByText("Sem dados suficientes")).toBeInTheDocument();
    expect(screen.queryByTestId("grafico")).toBeNull();
    expect(screen.getByRole("region")).toHaveTextContent("Baseado na nota final do ciclo");
    rerender(<ChartFrame title="Evolução" state="empty" emptyMessage="Nenhuma pessoa neste filtro" />);
    expect(screen.getByText("Nenhuma pessoa neste filtro")).toBeInTheDocument();
    expect(screen.getByRole("region")).not.toHaveAttribute("aria-busy");
  });

  it("hides the calculation button in print and keeps the card whole across pages", () => {
    render(
      <ChartFrame title="Por pilar" howCalculated="Média.">
        <div />
      </ChartFrame>,
    );
    expect(screen.getByRole("button", { name: "Como é calculado" }).className).toContain("print:hidden");
    expect(screen.getByRole("region").className).toContain("print:break-inside-avoid");
  });

  it("passes axe in the three states", async () => {
    const { container } = render(
      <div>
        <ChartFrame title="Pronto" base="4 pessoas" howCalculated="Média." footer="Rodapé">
          <p>gráfico</p>
        </ChartFrame>
        <ChartFrame title="Carregando" state="loading" />
        <ChartFrame title="Vazio" state="empty" />
      </div>,
    );
    expect((await axe.run(container, axeOptions)).violations).toEqual([]);
  });
});
