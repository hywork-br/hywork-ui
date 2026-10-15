import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";

import { axeOptions } from "../../../tests/resize-observer";
import { areas } from "../shared/fixtures";
import { DonutChart, donutColors } from "./index";

const segments = (container: HTMLElement) => [...container.querySelectorAll<SVGCircleElement>("[data-part='segment']")];
const dashLength = (el: SVGElement) => Number(el.style.strokeDasharray.split(" ")[0]);
const circumference = 2 * Math.PI * 54;

const two = [
  { id: "a", label: "Alfa", value: 3 },
  { id: "b", label: "Beta", value: 1 },
];

describe("DonutChart", () => {
  it("draws one slice per segment, as long as its share, minus the 2px gap", () => {
    const { container } = render(<DonutChart segments={two} />);
    const [a, b] = segments(container);
    expect(dashLength(a)).toBeCloseTo(circumference * 0.75 - 2, 2);
    expect(dashLength(b)).toBeCloseTo(circumference * 0.25 - 2, 2);
    // From 12 o'clock, clockwise: the second slice starts where the first ends.
    expect(Number(a.style.strokeDashoffset)).toBeCloseTo(-1, 2);
    expect(Number(b.style.strokeDashoffset)).toBeCloseTo(-(circumference * 0.75 + 1), 2);
  });

  it("closes the ring with a single slice, without a gap", () => {
    const { container } = render(<DonutChart segments={[{ id: "a", label: "Alfa", value: 5 }]} />);
    expect(dashLength(segments(container)[0])).toBeCloseTo(circumference, 2);
  });

  it("skips a segment worth zero, and the others keep the colour of their position", () => {
    const { container } = render(<DonutChart segments={areas.map((a) => (a.id === "tech" ? { ...a, value: 0 } : a))} />);
    expect(segments(container)).toHaveLength(5);
    expect(segments(container)[1].getAttribute("stroke")).toBe("hsl(var(--chart-2))");
  });

  it("paints by the series order, lighter from the sixth segment, and takes a chart token", () => {
    expect(donutColors(areas)).toEqual([
      "hsl(var(--chart-1))",
      "hsl(var(--chart-5))",
      "hsl(var(--chart-2))",
      "hsl(var(--chart-3))",
      "hsl(var(--chart-4))",
      "hsl(var(--chart-1) / 0.55)",
    ]);
    const { container } = render(<DonutChart segments={two.map((s) => ({ ...s, color: "chart-5" as const }))} />);
    expect(segments(container).map((s) => s.getAttribute("stroke"))).toEqual(["hsl(var(--chart-5))", "hsl(var(--chart-5))"]);
  });

  it("shows only the neutral track when the sum is zero", () => {
    const { container } = render(<DonutChart segments={two.map((s) => ({ ...s, value: 0 }))} />);
    expect(segments(container)).toHaveLength(0);
    expect(container.querySelector("[data-part='donut-track']")).toHaveClass("stroke-muted");
  });

  it("writes the centre value over its label, and scales with size", () => {
    const { container } = render(<DonutChart segments={two} centerValue="3,8" centerLabel="Média geral" size={180} />);
    expect(container.querySelector("[data-part='donut']")).toHaveStyle({ width: "180px", height: "180px" });
    const value = container.querySelector<HTMLElement>("[data-part='center-value']")!;
    const label = container.querySelector<HTMLElement>("[data-part='center-label']")!;
    expect(value).toHaveTextContent("3,8");
    expect(value.style.fontSize).toBe("26px");
    expect(label).toHaveTextContent("Média geral");
    expect(label).toHaveClass("uppercase", "text-muted-foreground");
  });

  it("is an image named after each segment, label: value, and the centre", () => {
    render(<DonutChart segments={two} centerValue="3,8" centerLabel="Média geral" />);
    expect(screen.getByRole("img")).toHaveAccessibleName("Média geral: 3,8. Alfa: 3; Beta: 1");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("keeps the values as the description when the screen names the chart", () => {
    const people = (v: number) => (v === 1 ? "1 pessoa" : `${v} pessoas`);
    render(<DonutChart aria-label="Pessoas por área" segments={two} formatValue={people} />);
    const img = screen.getByRole("img", { name: "Pessoas por área" });
    expect(img).toHaveAccessibleDescription("Alfa: 3 pessoas; Beta: 1 pessoa");
  });

  it("has no legend unless asked", () => {
    const { container, rerender } = render(<DonutChart segments={two} />);
    expect(container.querySelector("[data-part='chart-legend']")).toBeNull();
    rerender(<DonutChart segments={two} legend />);
    expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual(["Alfa", "Beta"]);
  });

  it("chooses a slice by pointer or by keyboard, with a focus ring", async () => {
    const onSegmentClick = vi.fn();
    const { container } = render(<DonutChart aria-label="Pessoas por área" segments={two} onSegmentClick={onSegmentClick} />);
    expect(screen.getByRole("group", { name: "Pessoas por área" })).toBeInTheDocument();
    const buttons = screen.getAllByRole("button");
    expect(buttons.map((b) => b.getAttribute("aria-label"))).toEqual(["Alfa: 3", "Beta: 1"]);
    await userEvent.tab();
    expect(buttons[0]).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(onSegmentClick).toHaveBeenLastCalledWith("a");
    await userEvent.tab();
    await userEvent.keyboard(" ");
    expect(onSegmentClick).toHaveBeenLastCalledWith("b");
    await userEvent.click(segments(container)[0]);
    expect(onSegmentClick).toHaveBeenLastCalledWith("a");
    expect(container.querySelectorAll("[data-part='focus-ring']")[0]).toHaveClass("group-focus-visible:opacity-100", "stroke-ring");
  });

  it("turns off the transition under reduced motion", () => {
    const { container } = render(<DonutChart segments={two} />);
    expect(segments(container)[0].getAttribute("class")).toContain("motion-reduce:!transition-none");
  });

  it("passes axe, static and clickable", async () => {
    const { container } = render(
      <div>
        <DonutChart segments={areas} centerValue="3,8" centerLabel="Média geral" legend />
        <DonutChart aria-label="Pessoas por área" segments={areas} onSegmentClick={() => undefined} />
        <DonutChart segments={two.map((s) => ({ ...s, value: 0 }))} />
      </div>,
    );
    expect((await axe.run(container, axeOptions)).violations).toEqual([]);
  });
});
