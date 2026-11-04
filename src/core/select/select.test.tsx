import { describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./index";

/** A field in a `<form>`: only there Radix draws the native `<select>` that sends the empty value. */
function Field({
  value,
  options,
  onValueChange,
}: Readonly<{
  value: string;
  options: string[];
  onValueChange: (value: string) => void;
}>) {
  return (
    <form>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger aria-label="Campo">
          <SelectValue placeholder="Escolha" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </form>
  );
}

const nativeSelect = (container: HTMLElement) => {
  const select = container.querySelector("select");
  if (!select)
    throw new Error(
      "O Select dentro de form deveria desenhar o select nativo.",
    );
  return select;
};

describe("Select", () => {
  it("não repassa o valor vazio quando o valor e a opção chegam juntos", () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <Field value="" options={[]} onValueChange={onValueChange} />,
    );

    rerender(
      <Field value="pleno" options={["pleno"]} onValueChange={onValueChange} />,
    );

    expect(onValueChange).not.toHaveBeenCalledWith("");
  });

  it("não repassa o valor vazio do select nativo", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <Field value="pleno" options={["pleno"]} onValueChange={onValueChange} />,
    );

    fireEvent.change(nativeSelect(container), { target: { value: "" } });

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("continua repassando a opção escolhida", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <Field
        value="pleno"
        options={["pleno", "senior"]}
        onValueChange={onValueChange}
      />,
    );

    fireEvent.change(nativeSelect(container), { target: { value: "senior" } });

    expect(onValueChange).toHaveBeenCalledWith("senior");
  });
});
