import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { MultiSelect } from "./index";

describe("MultiSelect", () => {
  it("mostra as opções escolhidas", () => {
    render(
      <MultiSelect
        options={[{ value: "rh", label: "RH" }, { value: "ti", label: "TI" }]}
        value={["rh"]}
        onChange={() => undefined}
      />,
    );
    expect(screen.getByText("RH")).toBeInTheDocument();
  });

  const options = [{ value: "rh", label: "RH" }];

  it("usa o rótulo apontado por aria-labelledby como nome do combobox", () => {
    render(
      <>
        <label id="areas">Áreas</label>
        <MultiSelect id="campo-areas" aria-labelledby="areas" options={options} value={[]} onChange={() => undefined} />
      </>,
    );
    expect(screen.getByRole("combobox", { name: "Áreas" })).toHaveAttribute("id", "campo-areas");
  });

  it("usa aria-label como nome do combobox", () => {
    render(<MultiSelect aria-label="Segmentação" options={options} value={[]} onChange={() => undefined} />);
    expect(screen.getByRole("combobox", { name: "Segmentação" })).toBeInTheDocument();
  });

  it("sem as props, não acrescenta atributos", () => {
    render(<MultiSelect options={options} value={[]} onChange={() => undefined} />);
    const combobox = screen.getByRole("combobox");
    expect(combobox).not.toHaveAttribute("id");
    expect(combobox).not.toHaveAttribute("aria-label");
    expect(combobox).not.toHaveAttribute("aria-labelledby");
  });
});
