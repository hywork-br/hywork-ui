import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FilterBar } from "../patterns/filter-bar";
import { PilotMotionFilterBar } from "../../stories/pilots/motion";

describe.each([FilterBar, PilotMotionFilterBar])("named filter groups", (Component) => {
  it("exposes filter controls and active criteria as named accessible groups", () => {
    render(<Component search={<input aria-label="Buscar" />} filters={<button>Status</button>}
      activeFilters={[{ id: "published", label: "Publicado" }]} />);
    expect(screen.getByRole("group", { name: "Filtros" })).toContainElement(screen.getByRole("button", { name: "Status" }));
    expect(screen.getByRole("group", { name: "Filtros ativos" })).toHaveTextContent("Publicado");
  });
});
