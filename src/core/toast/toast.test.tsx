import * as React from "react";
import { describe, expect, it } from "vitest";
import { act, render, screen } from "@testing-library/react";

import { Toaster, toast } from "./index";

describe("Toast", () => {
  it("mostra o aviso disparado de qualquer lugar da aplicação", () => {
    render(<Toaster />);
    act(() => {
      toast({ title: "Alterações salvas" });
    });
    expect(screen.getByText("Alterações salvas")).toBeInTheDocument();
  });
});
