import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Separator } from "./separator";

describe("Separator", () => {
  it("renders a decorative horizontal separator by default", () => {
    const { container } = render(<Separator data-testid="separator" />);
    const separator = screen.getByTestId("separator");

    expect(separator).toHaveAttribute("data-orientation", "horizontal");
    expect(separator).not.toHaveAttribute("role");
    expect(container.firstElementChild).toHaveClass("hw-separator");
  });

  it("exposes semantic orientation when it is not decorative", () => {
    render(<Separator decorative={false} orientation="vertical" aria-label="Divisor" />);
    const separator = screen.getByRole("separator", { name: "Divisor" });

    expect(separator).toHaveAttribute("aria-orientation", "vertical");
    expect(separator).toHaveAttribute("data-orientation", "vertical");
  });
});
