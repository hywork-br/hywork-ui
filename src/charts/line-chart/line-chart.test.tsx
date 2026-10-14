import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import axe from "axe-core";

import { axeOptions, mockReducedMotion, mockResizeObserver } from "../../../tests/resize-observer";
import { evolution, score } from "../shared/fixtures";
import { LineChart } from "./index";

let observer: ReturnType<typeof mockResizeObserver>;
let restoreMotion: () => void;
beforeEach(() => {
  observer = mockResizeObserver(640);
  restoreMotion = mockReducedMotion(true);
});
afterEach(() => {
  observer.restore();
  restoreMotion();
});

const curves = (container: HTMLElement) => [...container.querySelectorAll("path.recharts-line-curve")];

describe("LineChart", () => {
  it("draws the closed cycles solid and the stretch to the provisional point dashed", () => {
    const { container } = render(<LineChart points={evolution} seriesLabel="Média geral" domain={[1, 5]} />);
    const [solid, dashed] = curves(container);
    expect(solid).not.toHaveAttribute("stroke-dasharray");
    expect(dashed).toHaveAttribute("stroke-dasharray", "6 4");
    expect(solid).toHaveAttribute("stroke", "hsl(var(--chart-1))");
    // The dashed run joins two points: the last closed cycle and the provisional one.
    expect(dashed.getAttribute("d")?.match(/[ML]/g)).toHaveLength(2);
  });

  it("marks the provisional point hollow and the flagged one as a diamond", () => {
    const { container } = render(<LineChart points={evolution} seriesLabel="Média geral" domain={[1, 5]} />);
    expect(container.querySelectorAll(".recharts-line-dots rect")).toHaveLength(1);
    const hollow = [...container.querySelectorAll(".recharts-line-dots circle")].filter(
      (c) => c.getAttribute("fill") === "hsl(var(--card))",
    );
    expect(hollow).toHaveLength(1);
  });

  it("writes only the last value on the drawing", () => {
    const { container } = render(<LineChart points={evolution} seriesLabel="Média geral" domain={[1, 5]} formatValue={score} />);
    expect([...container.querySelectorAll(".recharts-line-dots text")].map((t) => t.textContent)).toEqual(["3,8"]);
  });

  it("explains the dashed and the diamond marks in the legend, and has none without them", () => {
    const { container, rerender } = render(<LineChart points={evolution} seriesLabel="Média geral" />);
    expect(container.querySelector("[data-part='chart-legend']")).toHaveTextContent("Média geralProvisórioModelos diferentes");
    rerender(<LineChart points={evolution.map(({ provisional: _p, flag: _f, ...p }) => p)} seriesLabel="Média geral" />);
    expect(container.querySelector("[data-part='chart-legend']")).toBeNull();
  });

  it("breaks the line at a missing value and reads it as a dash", () => {
    const points = evolution.map((p) => (p.id === "2024.2" ? { ...p, value: null } : p));
    const { container } = render(<LineChart points={points} seriesLabel="Média geral" domain={[1, 5]} formatValue={score} />);
    expect(curves(container)[0].getAttribute("d")?.match(/M/g)).toHaveLength(2);
    const row = within(screen.getByRole("table")).getByRole("row", { name: /2024\.2/ });
    expect(within(row).getByRole("cell")).toHaveTextContent("—");
  });

  it("gives the screen reader a table with notes, the provisional state and the marker", () => {
    const { container } = render(<LineChart points={evolution} seriesLabel="Média geral" formatValue={score} categoryHeader="Ciclo" />);
    const table = screen.getByRole("table");
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((th) => th.textContent),
    ).toEqual(["Ciclo", "Média geral"]);
    expect(
      within(table)
        .getAllByRole("rowheader")
        .map((th) => th.textContent),
    ).toEqual([
      "Ciclo 2024.1 (38 pessoas)",
      "Ciclo 2024.2 (41 pessoas)",
      "Ciclo 2025.1 (40 pessoas; Modelos diferentes)",
      "Ciclo 2025.2 (44 pessoas)",
      "Ciclo 2026.1 (4 pessoas; Provisório)",
    ]);
    expect(
      within(table)
        .getAllByRole("cell")
        .map((td) => td.textContent),
    ).toEqual(["3,4", "3,5", "3,3", "3,6", "3,8"]);
    expect(container.querySelector("svg")?.closest("[aria-hidden='true']")).not.toBeNull();
  });

  it("follows the width of its container, unless the width is fixed", () => {
    const { container, rerender } = render(<LineChart points={evolution} seriesLabel="Média geral" />);
    expect(container.querySelector("svg.recharts-surface")).toHaveAttribute("width", "640");
    observer.resize(360);
    expect(container.querySelector("svg.recharts-surface")).toHaveAttribute("width", "360");
    rerender(<LineChart points={evolution} seriesLabel="Média geral" width={600} height={240} />);
    observer.resize(300);
    expect(container.querySelector("svg.recharts-surface")).toHaveAttribute("width", "600");
    expect(container.querySelector("svg.recharts-surface")).toHaveAttribute("height", "240");
  });

  it("passes axe", async () => {
    const { container } = render(<LineChart aria-label="Evolução" points={evolution} seriesLabel="Média geral" />);
    expect((await axe.run(container, axeOptions)).violations).toEqual([]);
  });
});
