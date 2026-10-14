import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";

import { axeOptions, mockReducedMotion, mockResizeObserver } from "../../../tests/resize-observer";
import { competencies, leaderSelf, pillars, score } from "../shared/fixtures";
import { RadarChart } from "./index";

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

const layout = (container: HTMLElement) => container.querySelector("[data-layout]")?.getAttribute("data-layout");
const polygons = (container: HTMLElement) => [...container.querySelectorAll(".recharts-radar-polygon path")];

describe("RadarChart", () => {
  it("draws one polygon per series, closed, in the series colour tokens", () => {
    const { container } = render(<RadarChart categories={competencies} series={leaderSelf} domain={[0, 5]} />);
    expect(layout(container)).toBe("radar");
    const paths = polygons(container);
    expect(paths.map((p) => p.getAttribute("stroke"))).toEqual(["hsl(var(--chart-1))", "hsl(var(--chart-5))"]);
    expect(paths.every((p) => p.getAttribute("d")?.endsWith("Z"))).toBe(true);
    expect(container.querySelectorAll(".recharts-radar-dots circle")).toHaveLength(12);
  });

  it("opens the polygon at a missing value instead of pulling it to the centre", () => {
    const categories = competencies.map((c) => (c.id === "c3" ? { ...c, values: { ...c.values, self: null } } : c));
    const { container } = render(<RadarChart categories={categories} series={leaderSelf} domain={[0, 5]} formatValue={score} />);
    const [leader, self] = polygons(container);
    expect(leader.getAttribute("d")?.endsWith("Z")).toBe(true);
    expect(self.getAttribute("d")?.includes("Z")).toBe(false);
    expect(self.getAttribute("fill")).toBe("none");
    expect(container.querySelectorAll(".recharts-radar-dots circle")).toHaveLength(11);
    const row = within(screen.getByRole("table")).getByRole("row", { name: /Entrega com qualidade/ });
    expect(
      within(row)
        .getAllByRole("cell")
        .map((td) => td.textContent),
    ).toEqual(["3,0", "—"]);
  });

  it("names each axis with its note and its marker on lines of their own", () => {
    const { container } = render(<RadarChart categories={competencies} series={leaderSelf} />);
    const axis = [...container.querySelectorAll("[data-part='chart-axis']")].find((a) => a.textContent?.startsWith("Liderança"));
    expect(axis).toHaveAttribute("aria-hidden", "true");
    expect([...(axis?.children ?? [])].slice(-2).map((line) => line.textContent)).toEqual(["2 pessoas", "poucos dados"]);
  });

  it("gives the screen reader a table and keeps the drawing out of the tree", () => {
    const { container } = render(
      <RadarChart categories={competencies} series={leaderSelf} formatValue={score} categoryHeader="Competência" />,
    );
    const table = screen.getByRole("table");
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((th) => th.textContent),
    ).toEqual(["Competência", "Líder", "Autoavaliação"]);
    expect(within(table).getAllByRole("row")).toHaveLength(7);
    expect(within(table).getByRole("rowheader", { name: /^Comunicação/ })).toHaveTextContent("Comunicação (4 pessoas)");
    expect(container.querySelector("svg")?.closest("[aria-hidden='true']")).not.toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("turns each axis name into a button when the screen can choose", async () => {
    const onSelect = vi.fn();
    render(<RadarChart categories={competencies} series={leaderSelf} formatValue={score} onSelect={onSelect} />);
    const axes = screen.getAllByRole("button");
    expect(axes).toHaveLength(6);
    expect(axes[4]).toHaveAccessibleName("Liderança de pessoas: Líder 4,5; Autoavaliação 4,5; 2 pessoas; poucos dados");
    await userEvent.tab();
    expect(axes[0]).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(onSelect).toHaveBeenLastCalledWith("c1");
    await userEvent.click(axes[2]);
    expect(onSelect).toHaveBeenLastCalledWith("c3");
  });

  it("draws grouped bars, with the same data and handler, below three categories", async () => {
    const onSelect = vi.fn();
    const { container } = render(<RadarChart categories={pillars} series={leaderSelf} formatValue={score} onSelect={onSelect} />);
    expect(layout(container)).toBe("bars");
    expect(container.querySelector(".recharts-polar-grid")).toBeNull();
    expect(container.querySelectorAll(".recharts-bar-rectangle path")).toHaveLength(4);
    await userEvent.click(screen.getByRole("button", { name: /^Resultado:/ }));
    expect(onSelect).toHaveBeenCalledWith("p2");
  });

  it("draws grouped bars below 360px of width, and the radar again when there is room", () => {
    const { container } = render(<RadarChart categories={competencies} series={leaderSelf} />);
    expect(layout(container)).toBe("radar");
    observer.resize(340);
    expect(layout(container)).toBe("bars");
    expect(container.querySelector(".recharts-polar-grid")).toBeNull();
    observer.resize(600);
    expect(layout(container)).toBe("radar");
  });

  it("writes the scale only while its rings have room, and never at the centre", () => {
    const chart = (height: number) => (
      <RadarChart categories={competencies} series={leaderSelf} domain={[0, 5]} formatValue={score} height={height} />
    );
    const { container, rerender } = render(chart(440));
    const scale = () => [...container.querySelectorAll(".recharts-polar-radius-axis text")].map((t) => t.textContent);
    expect(scale()).toEqual(["1,0", "2,0", "3,0", "4,0", "5,0"]);
    // 260px leaves a radius of about 60px: rings 12px apart, too close to write on.
    rerender(chart(260));
    expect(scale()).toEqual([]);
  });

  it("takes a fixed width and height for print", () => {
    const { container } = render(<RadarChart categories={competencies} series={leaderSelf} width={640} height={420} />);
    const svg = container.querySelector("svg.recharts-surface");
    expect(svg).toHaveAttribute("width", "640");
    expect(svg).toHaveAttribute("height", "420");
    observer.resize(300);
    expect(container.querySelector("svg.recharts-surface")).toHaveAttribute("width", "640");
  });

  it("passes axe, static and clickable", async () => {
    const { container } = render(
      <div>
        <RadarChart aria-label="Resultado por competência" categories={competencies} series={leaderSelf} />
        <RadarChart aria-label="Clicável" categories={competencies} series={leaderSelf} onSelect={() => undefined} />
      </div>,
    );
    expect((await axe.run(container, axeOptions)).violations).toEqual([]);
  });
});
