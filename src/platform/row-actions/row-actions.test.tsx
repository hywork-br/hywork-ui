import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RowActions } from "./index";

describe("RowActions", () => {
  it("abre o menu pelo gatilho de reticências", async () => {
    const user = userEvent.setup();
    render(<RowActions actions={[{ label: "Editar", onSelect: () => undefined }]} />);
    await user.click(screen.getByRole("button", { name: "Ações da linha" }));
    expect(await screen.findByRole("menuitem", { name: "Editar" })).toBeInTheDocument();
  });

  it("chama a ação escolhida", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<RowActions actions={[{ label: "Editar", onSelect }]} />);
    await user.click(screen.getByRole("button", { name: "Ações da linha" }));
    await user.click(await screen.findByRole("menuitem", { name: "Editar" }));
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it("põe a ação destrutiva por último, separada das demais", async () => {
    const user = userEvent.setup();
    render(
      <RowActions
        actions={[
          { label: "Excluir", onSelect: () => undefined, destructive: true },
          { label: "Editar", onSelect: () => undefined },
        ]}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Ações da linha" }));
    const itens = await screen.findAllByRole("menuitem");
    expect(itens.map((i) => i.textContent)).toEqual(["Editar", "Excluir"]);
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("não separa quando só há ação destrutiva", async () => {
    const user = userEvent.setup();
    render(
      <RowActions actions={[{ label: "Excluir", onSelect: () => undefined, destructive: true }]} />,
    );
    await user.click(screen.getByRole("button", { name: "Ações da linha" }));
    await screen.findByRole("menuitem", { name: "Excluir" });
    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
  });
});
