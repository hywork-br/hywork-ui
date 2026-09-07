import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ListPage } from "./list-page";

describe("ListPage count ownership", () => {
  it("lets a domain toolbar own the only count announcement without removing items or empty states", () => {
    const { container, rerender } = render(
      <ListPage
        title="Academy"
        items={["Introdução", "Segurança"]}
        renderItem={(item) => <p>{item}</p>}
        showCount={false}
        toolbar={<p aria-live="polite">2 cursos</p>}
      />,
    );
    expect(screen.getByText("Introdução")).toBeVisible();
    expect(screen.getByText("Segurança")).toBeVisible();
    expect(container.querySelectorAll('[aria-live="polite"]')).toHaveLength(1);
    expect(screen.queryByText("2 itens")).not.toBeInTheDocument();

    rerender(
      <ListPage title="Academy" items={[]} renderItem={() => null}
        showCount={false} empty={{ title: "Nenhum curso criado" }} />,
    );
    expect(screen.getByText("Nenhum curso criado")).toBeVisible();
    expect(screen.queryByText("0 itens")).not.toBeInTheDocument();
  });

  it("keeps the shared announcement by default when item counts change", () => {
    const { rerender } = render(
      <ListPage title="Academy" items={["Introdução"]} renderItem={(item) => <p>{item}</p>} />,
    );
    expect(screen.getByText("1 item")).toHaveAttribute("aria-live", "polite");
    rerender(<ListPage title="Academy" items={[]} renderItem={() => null} />);
    expect(screen.getByText("0 itens")).toHaveAttribute("aria-live", "polite");
  });
});
