import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";

import { axeOptions, mockResizeObserver } from "../../../tests/resize-observer";
import { bands, calibratedBands } from "../shared/fixtures";
import { DistributionBar } from "./index";

let observer: ReturnType<typeof mockResizeObserver>;
beforeEach(() => {
  observer = mockResizeObserver(800);
});
afterEach(() => observer.restore());

const segments = (container: HTMLElement) => [...container.querySelectorAll<HTMLElement>("[data-part='segment']")];
const columns = (container: HTMLElement) => container.querySelector("ul")?.style.gridTemplateColumns;

describe("DistributionBar", () => {
  it("draws one segment per band, as wide as its share", () => {
    const { container } = render(<DistributionBar bands={calibratedBands} />);
    // The empty band draws nothing, but stays in the legend.
    expect(segments(container).map((s) => s.style.flexGrow)).toEqual(["50", "25", "25"]);
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
  });

  it("paints the bands on a ramp of --chart-1 by default, light to dark", () => {
    const { container } = render(<DistributionBar bands={bands} />);
    expect(segments(container).map((s) => s.getAttribute("style")?.match(/hsl\([^)]*\)[^;]*/)?.[0])).toEqual([
      "hsl(var(--chart-1) / 0.4)",
      "hsl(var(--chart-1) / 0.6)",
      "hsl(var(--chart-1) / 0.8)",
      "hsl(var(--chart-1) / 1)",
    ]);
  });

  it("takes a chart token per band", () => {
    const { container } = render(<DistributionBar bands={bands.map((b) => ({ ...b, color: "chart-5" as const }))} />);
    expect(segments(container).every((s) => s.getAttribute("style")?.includes("hsl(var(--chart-5))"))).toBe(true);
  });

  it("writes label, percentage and note, the percentage in pt-BR by default", () => {
    render(<DistributionBar bands={[{ id: "a", label: "Acima do esperado", value: 12.5, note: "1 pessoa" }]} />);
    expect(screen.getByRole("listitem")).toHaveTextContent("Acima do esperado 12,5% · , 1 pessoa");
  });

  it("keeps the bar out of the accessibility tree, with no buttons when nothing can be chosen", () => {
    const { container } = render(<DistributionBar bands={bands} />);
    expect(container.querySelector("[data-part='distribution-track']")).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("chooses a band from the legend, by keyboard, or from the segment, by pointer", async () => {
    const onSelect = vi.fn();
    const { container } = render(<DistributionBar bands={bands} onSelect={onSelect} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[1]).toHaveAccessibleName("Em desenvolvimento 25%, 1 pessoa");
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(onSelect).toHaveBeenLastCalledWith("developing");
    await userEvent.click(segments(container)[3]);
    expect(onSelect).toHaveBeenLastCalledWith("exceeds");
  });

  it("lays the legend out in one row, in half rows or one per row — never three plus one", () => {
    const { container } = render(<DistributionBar bands={bands} />);
    expect(columns(container)).toBe("repeat(4, minmax(0, 1fr))");
    observer.resize(560);
    expect(columns(container)).toBe("repeat(2, minmax(0, 1fr))");
    observer.resize(300);
    expect(columns(container)).toBe("repeat(1, minmax(0, 1fr))");
  });

  it("shows an empty track when nobody is in any band", () => {
    const { container } = render(<DistributionBar bands={bands.map((b) => ({ ...b, value: 0 }))} />);
    expect(segments(container)).toHaveLength(0);
    expect(container.querySelector("[data-part='distribution-track'] .bg-muted")).not.toBeNull();
  });

  it("turns off the width transition under reduced motion", () => {
    const { container } = render(<DistributionBar bands={bands} />);
    expect(segments(container)[0].className).toContain("motion-reduce:!transition-none");
  });

  it("passes axe, static and clickable", async () => {
    const { container } = render(
      <div>
        <DistributionBar aria-label="Distribuição" bands={bands} />
        <DistributionBar aria-label="Distribuição clicável" bands={calibratedBands} onSelect={() => undefined} />
      </div>,
    );
    expect((await axe.run(container, axeOptions)).violations).toEqual([]);
  });
});
