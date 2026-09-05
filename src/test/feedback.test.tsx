import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Banner, InlineNotice, Toast } from "../components/feedback";
import { RecoveryDemo } from "../../stories/feedback/recovery-demo";

describe("controlled feedback", () => {
  it("announces routine status politely and urgent errors explicitly", () => {
    render(
      <>
        <Toast title="Salvo" severity="success" />
        <Banner
          title="Conexão perdida"
          severity="warning"
          announcement="assertive"
        />
        <InlineNotice title="Orientação" announcement="off" />
      </>
    );
    expect(screen.getByRole("status")).toHaveTextContent("Salvo");
    expect(screen.getByRole("alert")).toHaveTextContent("Conexão perdida");
    expect(
      screen.getByText("Orientação").closest("section")
    ).not.toHaveAttribute("role");
  });
  it("keeps notices until consumer dismissal and delegates undo", async () => {
    const dismiss = vi.fn(),
      undo = vi.fn();
    render(
      <Toast
        title="Arquivado"
        onDismiss={dismiss}
        action={{ label: "Desfazer", onClick: undo }}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "Desfazer" }));
    await userEvent.click(
      screen.getByRole("button", { name: "Dispensar: Arquivado" })
    );
    expect(undo).toHaveBeenCalledOnce();
    expect(dismiss).toHaveBeenCalledOnce();
    expect(screen.getByText("Arquivado")).toBeVisible();
    vi.useFakeTimers();
    act(() => vi.advanceTimersByTime(60000));
    expect(screen.getByText("Arquivado")).toBeVisible();
    vi.useRealTimers();
  });
});
describe("simulated recovery workspace", () => {
  it("does not repeat a prior save result as a confirmation error", async () => {
    render(<RecoveryDemo />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    await user.click(
      screen.getByRole("button", { name: "Excluir permanentemente" })
    );
    expect(
      within(screen.getByRole("alertdialog")).queryByRole("status")
    ).not.toBeInTheDocument();
  });
  it("preserves offline drafts and requires explicit conflict resolution", async () => {
    render(<RecoveryDemo />);
    const user = userEvent.setup();
    const draft = screen.getByLabelText("Rascunho");
    await user.clear(draft);
    await user.type(draft, "Minha edição");
    await user.click(screen.getByLabelText("Simular offline"));
    expect(screen.getByRole("button", { name: "Salvar" })).toBeDisabled();
    expect(draft).toHaveValue("Minha edição");
    await user.click(screen.getByLabelText("Simular offline"));
    await user.click(screen.getByLabelText("Simular conflito"));
    expect(screen.getByRole("button", { name: "Salvar" })).toBeDisabled();
    await user.click(
      screen.getByRole("button", { name: "Manter meu rascunho" })
    );
    expect(draft).toHaveValue("Minha edição");
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    expect(screen.getByRole("status")).toHaveTextContent("Rascunho salvo");
  });
  it("blocks mutations when permission is removed and supports archive undo", async () => {
    render(<RecoveryDemo />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Arquivar" }));
    await user.click(screen.getByRole("button", { name: "Desfazer" }));
    expect(screen.getByRole("button", { name: "Arquivar" })).toBeEnabled();
    await user.click(screen.getByLabelText("Permissão de edição"));
    for (const name of [
      "Salvar",
      "Arquivar",
      "Excluir permanentemente",
      "Publicar 3 itens",
    ])
      expect(screen.getByRole("button", { name })).toBeDisabled();
  });
  it("focuses cancel and prevents dismissal and duplicate execution while pending", async () => {
    let finish!: () => void;
    const remove = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        })
    );
    render(<RecoveryDemo onDelete={remove} />);
    const user = userEvent.setup();
    await user.click(
      screen.getByRole("button", { name: "Excluir permanentemente" })
    );
    const dialog = screen.getByRole("alertdialog");
    expect(
      within(dialog).getByRole("button", { name: "Cancelar" })
    ).toHaveFocus();
    await user.dblClick(
      within(dialog).getByRole("button", { name: "Excluir definitivamente" })
    );
    await user.keyboard("{Escape}");
    expect(remove).toHaveBeenCalledOnce();
    expect(dialog).toBeVisible();
    expect(
      within(dialog).getByRole("button", { name: "Cancelar" })
    ).toBeDisabled();
    expect(screen.queryByText("Item excluído")).not.toBeInTheDocument();
    await act(async () => finish());
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Item excluído");
    await waitFor(() =>
      expect(screen.getByLabelText("Rascunho")).toHaveFocus()
    );
  });
  it("retains the draft and confirmation after rejected deletion for retry", async () => {
    const remove = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(undefined);
    render(<RecoveryDemo onDelete={remove} />);
    const user = userEvent.setup();
    await user.click(
      screen.getByRole("button", { name: "Excluir permanentemente" })
    );
    await user.click(
      screen.getByRole("button", { name: "Excluir definitivamente" })
    );
    expect(
      within(screen.getByRole("alertdialog")).getByRole("status")
    ).toHaveTextContent("O item foi preservado");
    expect(screen.getByLabelText("Rascunho")).toHaveValue(
      "Boas-vindas à Hywork"
    );
    await user.click(
      screen.getByRole("button", { name: "Excluir definitivamente" })
    );
    expect(remove).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });
  it("retains recovery after dismissing a partial failure notice", async () => {
    render(<RecoveryDemo />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Publicar 3 itens" }));
    await user.click(screen.getByRole("button", { name: /^Dispensar:/ }));
    await user.click(
      screen.getByRole("button", { name: "Tentar novamente 1 item" })
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "3 de 3 itens publicados"
    );
  });
  it("retries only failed IDs, listing their names", async () => {
    const publish = vi
      .fn()
      .mockResolvedValueOnce(["culture"])
      .mockResolvedValueOnce([]);
    render(<RecoveryDemo onPublish={publish} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Publicar 3 itens" }));
    expect(screen.getByRole("status")).toHaveTextContent("Cultura");
    await user.click(
      screen.getByRole("button", { name: "Tentar novamente 1 item" })
    );
    expect(publish.mock.calls).toEqual([
      [["welcome", "culture", "benefits"]],
      [["culture"]],
    ]);
    expect(screen.getByRole("status")).toHaveTextContent(
      "3 de 3 itens publicados"
    );
  });
});
