import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./breadcrumb";

describe("Breadcrumb", () => {
  it("keeps navigation and current location semantic", () => {
    const { container } = render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/conteudos">Conteúdos</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Detalhe</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
    expect(screen.getByText("Detalhe")).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Conteúdos" })).toHaveAttribute("href", "/conteudos");
    expect(container.querySelector(".hw-breadcrumb__separator")).toHaveAttribute("aria-hidden", "true");
  });
});
