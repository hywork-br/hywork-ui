import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";

import { axeOptions, mockReducedMotion, mockResizeObserver } from "../../../tests/resize-observer";
import { comparison, competencies, cycles, leaderSelf, pillars, score } from "../shared/fixtures";
import { GroupedBarChart } from "./index";

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

const bars = (container: HTMLElement) => [...container.querySelectorAll(".recharts-bar-rectangle path")];
const table = () => screen.getByRole("table");

describe("GroupedBarChart", () => {
  it("draws one bar per series in each category, in the series colour tokens", () => {
    const { container } = render(<GroupedBarChart categories={pillars} series={leaderSelf} domain={[0, 5]} />);
    const fills = bars(container).map((bar) => bar.getAttribute("fill"));
    expect(fills).toHaveLength(4);
    expect(new Set(fills)).toEqual(new Set(["hsl(var(--chart-1))", "hsl(var(--chart-5))"]));
  });

  it("lets a series pin its colour to another chart token", () => {
    const { container } = render(
      <GroupedBarChart categories={pillars} series={[{ ...leaderSelf[0], color: "chart-2" }]} domain={[0, 5]} />,
    );
    expect(bars(container).every((bar) => bar.getAttribute("fill") === "hsl(var(--chart-2))")).toBe(true);
  });

  it("gives the screen reader a table with the formatted numbers, notes and markers", () => {
    render(<GroupedBarChart categories={competencies} series={leaderSelf} formatValue={score} categoryHeader="Competência" />);
    const headers = within(table())
      .getAllByRole("columnheader")
      .map((th) => th.textContent);
    expect(headers).toEqual(["Competência", "Líder", "Autoavaliação"]);
    const row = within(table()).getByRole("row", { name: /Liderança de pessoas/ });
    expect(within(row).getByRole("rowheader")).toHaveTextContent("Liderança de pessoas (2 pessoas; poucos dados)");
    expect(
      within(row)
        .getAllByRole("cell")
        .map((td) => td.textContent),
    ).toEqual(["4,5", "4,5"]);
  });

  it("formats in pt-BR by default", () => {
    render(<GroupedBarChart categories={[{ id: "a", label: "A", values: { leader: 12.5 } }]} series={[leaderSelf[0]]} />);
    expect(within(table()).getByRole("cell")).toHaveTextContent("12,5");
  });

  it("draws no bar for a missing value and reads it as a dash", () => {
    const { container } = render(<GroupedBarChart categories={comparison} series={cycles} domain={[0, 5]} formatValue={score} />);
    expect(bars(container)).toHaveLength(5);
    const row = within(table()).getByRole("row", { name: /Entrega com qualidade/ });
    expect(
      within(row)
        .getAllByRole("cell")
        .map((td) => td.textContent),
    ).toEqual(["3,0", "—"]);
  });

  it("keeps the drawing out of the accessibility tree", () => {
    const { container } = render(<GroupedBarChart categories={pillars} series={leaderSelf} />);
    expect(container.querySelector("svg")?.closest("[aria-hidden='true']")).not.toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("chooses a category from the keyboard, one button per row", async () => {
    const onSelect = vi.fn();
    render(<GroupedBarChart categories={pillars} series={leaderSelf} formatValue={score} onSelect={onSelect} />);
    const rows = screen.getAllByRole("button");
    expect(rows.map((b) => b.getAttribute("aria-label"))).toEqual([
      "Comportamento: Líder 3,5; Autoavaliação 4,1; 4 pessoas",
      "Resultado: Líder 3,0; Autoavaliação 3,5; 4 pessoas",
    ]);
    await userEvent.tab();
    await userEvent.tab();
    expect(rows[1]).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(onSelect).toHaveBeenLastCalledWith("p2");
    await userEvent.keyboard(" ");
    expect(onSelect).toHaveBeenCalledTimes(2);
  });

  it("shows a legend for two series or more, and none for one", () => {
    const { rerender, container } = render(<GroupedBarChart categories={pillars} series={leaderSelf} />);
    expect(container.querySelector("[data-part='chart-legend']")).toHaveTextContent("LíderAutoavaliação");
    rerender(<GroupedBarChart categories={pillars} series={[leaderSelf[0]]} />);
    expect(container.querySelector("[data-part='chart-legend']")).toBeNull();
  });

  it("breaks a long category name into lines and keeps the note and the marker on their own", () => {
    const { container } = render(<GroupedBarChart categories={competencies} series={leaderSelf} />);
    observer.resize(320);
    const tick = [...container.querySelectorAll("[data-part='chart-tick']")].find((t) => t.textContent?.startsWith("Visão"));
    const lines = [...(tick?.querySelectorAll("tspan") ?? [])].map((t) => t.textContent);
    expect(lines.length).toBeGreaterThan(2);
    expect(lines.slice(-1)).toEqual(["4 pessoas"]);
    const leadership = [...container.querySelectorAll("[data-part='chart-tick']")].find((t) => t.textContent?.startsWith("Liderança"));
    expect([...(leadership?.querySelectorAll("tspan") ?? [])].slice(-2).map((t) => t.textContent)).toEqual(["2 pessoas", "poucos dados"]);
  });

  it("follows the width of its container", () => {
    const { container } = render(<GroupedBarChart categories={pillars} series={leaderSelf} />);
    expect(container.querySelector("svg.recharts-surface")).toHaveAttribute("width", "640");
    observer.resize(380);
    expect(container.querySelector("svg.recharts-surface")).toHaveAttribute("width", "380");
  });

  it("takes a fixed width for print, which a resize does not change", () => {
    const { container } = render(<GroupedBarChart categories={pillars} series={leaderSelf} width={500} />);
    expect(container.querySelector("svg.recharts-surface")).toHaveAttribute("width", "500");
    observer.resize(300);
    expect(container.querySelector("svg.recharts-surface")).toHaveAttribute("width", "500");
  });

  it("animates the first drawing, unless the user prefers reduced motion or the width is fixed", () => {
    restoreMotion();
    restoreMotion = mockReducedMotion(false);
    const animated = render(<GroupedBarChart categories={pillars} series={leaderSelf} domain={[0, 5]} />);
    expect(bars(animated.container)).toHaveLength(0);
    animated.unmount();

    const printed = render(<GroupedBarChart categories={pillars} series={leaderSelf} domain={[0, 5]} width={500} />);
    expect(bars(printed.container)).toHaveLength(4);
    printed.unmount();

    restoreMotion();
    restoreMotion = mockReducedMotion(true);
    const reduced = render(<GroupedBarChart categories={pillars} series={leaderSelf} domain={[0, 5]} />);
    expect(bars(reduced.container)).toHaveLength(4);
  });

  it("passes axe, static and clickable", async () => {
    const { container } = render(
      <div>
        <GroupedBarChart aria-label="Por pilar" categories={pillars} series={leaderSelf} formatValue={score} />
        <GroupedBarChart aria-label="Comparar" categories={comparison} series={cycles} onSelect={() => undefined} />
      </div>,
    );
    expect((await axe.run(container, axeOptions)).violations).toEqual([]);
  });
});
