import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ItemCard } from "./index";

describe("ItemCard", () => {
  it("expõe o título como heading", () => {
    render(<ItemCard title="Desafio de integração" />);
    expect(screen.getByRole("heading", { name: "Desafio de integração" })).toBeInTheDocument();
  });

  it("aceita mudar o nível do heading conforme o contexto da página", () => {
    render(<ItemCard title="Item" titleAs="h4" />);
    expect(screen.getByRole("heading", { level: 4, name: "Item" })).toBeInTheDocument();
  });

  it("não vira botão quando não é clicável", () => {
    render(<ItemCard title="Item" description="Encerra em 12 dias" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("torna o título acionável quando o card abre algo", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<ItemCard title="Item" onOpen={onOpen} />);
    await user.click(screen.getByRole("button", { name: "Item" }));
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it("alcança o card clicável pelo teclado", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<ItemCard title="Item" onOpen={onOpen} />);
    await user.tab();
    expect(screen.getByRole("button", { name: "Item" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it("acomoda estado e ações", () => {
    render(
      <ItemCard title="Item" status={<span>Ativo</span>} actions={<button>Abrir</button>} />,
    );
    expect(screen.getByText("Ativo")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Abrir" })).toBeInTheDocument();
  });
});
