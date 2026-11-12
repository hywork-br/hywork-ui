import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Textarea } from "./index";

describe("Textarea showCount", () => {
  it("counts uncontrolled input with pt-BR thousands and links it by aria-describedby", () => {
    render(<Textarea aria-label="Enunciado" showCount maxLength={1000} aria-describedby="hint" />);
    const field = screen.getByLabelText("Enunciado");
    fireEvent.change(field, { target: { value: "abc" } });
    const counter = screen.getByText("3 / 1.000 caracteres");
    expect(field.getAttribute("aria-describedby")).toBe(`hint ${counter.id}`);
    expect(counter.getAttribute("aria-live")).toBeNull();
  });

  it("reads the controlled value and accepts a custom label", () => {
    render(<Textarea aria-label="x" showCount maxLength={50} value="hello" onChange={() => {}} countLabel="characters" />);
    expect(screen.getByText("5 / 50 characters")).toBeTruthy();
  });

  it("shows nothing without maxLength", () => {
    const { container } = render(<Textarea showCount />);
    expect(container.querySelector("p")).toBeNull();
  });
});
