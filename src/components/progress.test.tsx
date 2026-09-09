import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Progress } from "./progress";

describe("Progress", () => {
  it("clamps values and exposes the native progress semantics", () => {
    const { rerender } = render(<Progress aria-label="Importação" value={140} max={120} />);
    const progress = screen.getByRole("progressbar", { name: "Importação" });

    expect(progress).toHaveAttribute("aria-valuemax", "120");
    expect(progress).toHaveAttribute("aria-valuenow", "120");
    expect(progress).toHaveAttribute("data-state", "complete");

    rerender(<Progress aria-label="Importação" value={-2} max={120} />);
    expect(progress).toHaveAttribute("aria-valuenow", "0");
    expect(progress).toHaveAttribute("data-state", "idle");
  });
});
