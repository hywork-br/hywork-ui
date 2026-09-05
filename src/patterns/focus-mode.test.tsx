import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it } from "vitest";

import { FocusMode } from "./focus-mode";

function Flow({ saving = false, removeOpener = false }: { saving?: boolean; removeOpener?: boolean }) {
  const [open, setOpen] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const fallback = React.useRef<HTMLInputElement>(null);
  return <>
    <input aria-label="Buscar cursos" ref={fallback} />
    {!saved && <button onClick={() => setOpen(true)}>Editar curso</button>}
    <FocusMode open={open} title="Editar" description="Altere o curso." onExit={() => setOpen(false)} exitDisabled={saving} returnFocusRef={removeOpener ? fallback : undefined}>
      <input aria-label="Título" />
      <button onClick={() => { if (removeOpener) setSaved(true); setOpen(false); }}>Salvar</button>
    </FocusMode>
  </>;
}

describe("FocusMode focus lifecycle", () => {
  it("restores the opener under StrictMode effect replay", async () => {
    const user = userEvent.setup();
    render(<React.StrictMode><Flow /></React.StrictMode>);
    const opener = screen.getByRole("button", { name: "Editar curso" });
    await user.click(opener);
    expect(screen.getByRole("dialog", { name: "Editar" })).toContainElement(document.activeElement as HTMLElement);
    await user.keyboard("{Escape}");
    await waitFor(() => expect(opener).toHaveFocus());
  });

  it.each(["close", "escape", "save", "outside"])("returns focus to the opener after %s", async (exit) => {
    const user = userEvent.setup();
    render(<Flow />);
    const opener = screen.getByRole("button", { name: "Editar curso" });
    await user.click(opener);
    const dialog = screen.getByRole("dialog", { name: "Editar" });
    expect(dialog).toHaveAccessibleDescription("Altere o curso.");
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    if (exit === "escape") await user.keyboard("{Escape}");
    else if (exit === "outside") await user.click(document.querySelector(".hw-dialog__overlay")!);
    else await user.click(screen.getByRole("button", { name: exit === "save" ? "Salvar" : "Sair de Editar" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await waitFor(() => expect(opener).toHaveFocus());
  });

  it("returns focus to an explicit fallback when saving removes the filtered opener", async () => {
    const user = userEvent.setup();
    render(<Flow removeOpener />);
    await user.click(screen.getByRole("button", { name: "Editar curso" }));
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    expect(screen.queryByRole("button", { name: "Editar curso" })).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("textbox", { name: "Buscar cursos" })).toHaveFocus());
  });

  it("blocks all shell exits while saving and still permits controlled completion", async () => {
    const user = userEvent.setup();
    render(<Flow saving />);
    await user.click(screen.getByRole("button", { name: "Editar curso" }));
    const close = screen.getByRole("button", { name: "Sair de Editar" });
    expect(close).toBeDisabled();
    await user.click(close);
    await user.keyboard("{Escape}");
    await user.click(document.querySelector(".hw-dialog__overlay")!);
    expect(screen.getByRole("dialog", { name: "Editar" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Editar curso" })).toHaveFocus());
  });

  it("keeps tab focus inside the modal and captures the opener anew on reopening", async () => {
    const user = userEvent.setup();
    function TwoOpeners() {
      const [open, setOpen] = React.useState(false);
      return <><button onClick={() => setOpen(true)}>Primeiro</button><button onClick={() => setOpen(true)}>Segundo</button><FocusMode open={open} title="Curso" onExit={() => setOpen(false)}><input aria-label="Título" /></FocusMode></>;
    }
    render(<TwoOpeners />);
    for (const name of ["Primeiro", "Segundo"]) {
      const opener = screen.getByRole("button", { name });
      await user.click(opener);
      await user.tab({ shift: true });
      expect(screen.getByRole("textbox", { name: "Título" })).toHaveFocus();
      await user.tab();
      expect(screen.getByRole("button", { name: "Sair de Curso" })).toHaveFocus();
      await user.keyboard("{Escape}");
      await waitFor(() => expect(opener).toHaveFocus());
    }
  });
});
