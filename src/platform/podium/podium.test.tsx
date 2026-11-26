import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import axe from "axe-core";
import { Podium, type PodiumEntry } from "./index";

const e = (position: 1 | 2 | 3, name: string): PodiumEntry => ({ id: String(position), position, name, value: `${position}00 pts` });

describe("Podium", () => {
  it("lê 1º, 2º, 3º e posiciona 2º à esquerda, 1º ao centro, 3º à direita", () => {
    render(<Podium entries={[e(3, "Carla Dias"), e(1, "Ana Souza"), e(2, "Bruno Lima")]} />);
    const itens = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(itens.map((li) => li.dataset.position)).toEqual(["1", "2", "3"]);
    expect(itens.map((li) => /col-start-(\d)/.exec(li.className)![1])).toEqual(["2", "1", "3"]);
  });

  it("marca a coroa só no 1º, com rótulo configurável, e usa iniciais sem foto", () => {
    render(<Podium crownLabel="Campeão" entries={[e(1, "Ana Souza"), e(2, "Bruno Lima")]} />);
    expect(screen.getAllByRole("img", { name: "Campeão" })).toHaveLength(1);
    expect(screen.getByText("AS")).toBeTruthy();
  });

  it("aceita uma entrada e passa no axe", async () => {
    const { container } = render(<Podium entries={[e(1, "Ana Souza")]} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect((await axe.run(container, { rules: { "color-contrast": { enabled: false } } })).violations).toEqual([]);
  });
});
