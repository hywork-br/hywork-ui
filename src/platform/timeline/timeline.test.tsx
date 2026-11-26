import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Timeline } from "./index";

describe("Timeline", () => {
  it("é uma <ol> na ordem recebida, com descrição, data e tom", () => {
    render(
      <Timeline
        items={[
          { id: "2", title: "Resgate solicitado.", description: "120 HYC reservadas.", timestamp: "10/11", tone: "positive" },
          { id: "1", title: "Criado" },
        ]}
      />,
    );
    const itens = screen.getAllByRole("listitem");
    expect(itens[0]!.textContent).toContain("Resgate solicitado.");
    expect(itens[0]!.textContent).toContain("120 HYC reservadas.");
    expect(itens[0]!.textContent).toContain("10/11");
    expect(itens.map((li) => li.dataset.tone)).toEqual(["positive", "neutral"]);
    expect(screen.getByRole("list").tagName).toBe("OL");
  });
});
