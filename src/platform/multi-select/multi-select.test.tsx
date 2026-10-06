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
});
