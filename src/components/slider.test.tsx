import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Slider } from "./slider";

describe("Slider", () => {
  it("supports keyboard input with an accessible range control", async () => {
    const onValueChange = vi.fn();
    render(<Slider aria-label="Opacidade" defaultValue={[40]} max={100} onValueChange={onValueChange} />);
    const slider = screen.getByRole("slider", { name: "Opacidade" });
    expect(slider).toHaveValue("40");
    fireEvent.change(slider, { target: { value: "41" } });
    expect(slider).toHaveValue("41");
    expect(onValueChange).toHaveBeenLastCalledWith([41]);
  });

  it("keeps multiple values ordered and clamps defaults", () => {
    render(<Slider aria-label="Margem" defaultValue={[140, -2]} max={100} min={0} />);
    expect(screen.getAllByRole("slider").map((control) => control.getAttribute("value"))).toEqual(["0", "100"]);
  });
});
