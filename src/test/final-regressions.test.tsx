import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { DataTable } from "../patterns/data-table";
import { Avatar } from "../components/avatar";
import { RecoveryDemo } from "../../stories/feedback/recovery-demo";

it.each([null, undefined, false, 0])("respects a renderer returning %s", (value) => {
  render(<DataTable ariaLabel="Records" rows={[{ id: "raw-secret" }]} getRowKey={(row) => row.id} columns={[{ key: "id", header: "Identity", render: () => value }]} />);
  expect(screen.getByRole("cell").textContent).toBe(value === 0 ? "0" : "");
});

it("falls back to the raw value only when the renderer is absent", () => {
  render(<DataTable ariaLabel="Records" rows={[{ id: "raw" }]} getRowKey={(row) => row.id} columns={[{ key: "id", header: "Identity" }]} />);
  expect(screen.getByRole("cell")).toHaveTextContent("raw");
});

it("loads a new avatar URL after the previous URL failed", () => {
  const { rerender } = render(<Avatar name="Ana Lima" src="/broken.png" />);
  fireEvent.error(screen.getByRole("img"));
  expect(screen.getByText("AL")).toBeVisible();
  rerender(<Avatar name="Ana Lima" src="/working.png" />);
  expect(screen.getByRole("img")).toHaveAttribute("src", "/working.png");
  fireEvent.load(screen.getByRole("img"));
  expect(screen.queryByText("AL")).not.toBeInTheDocument();
});

it("separates save feedback from a pending bulk retry", async () => {
  render(<RecoveryDemo />);
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Publicar 3 itens" }));
  await user.click(screen.getByRole("button", { name: "Salvar" }));
  const save = screen.getByText("Rascunho salvo na simulação").closest("section")!;
  expect(save).toHaveAttribute("data-severity", "info");
  expect(within(save).queryByRole("button", { name: /Tentar novamente/ })).not.toBeInTheDocument();
  expect(screen.getByText("Pendentes: Cultura")).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Tentar novamente 1 item" }));
  expect(screen.getByRole("status")).toHaveTextContent("3 de 3 itens publicados");
});
