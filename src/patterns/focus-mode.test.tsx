import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it } from "vitest";

import { FocusMode } from "./focus-mode";
import { MultiSelect } from "../components/combobox";

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
  it("closes an expanded selection before Escape exits the editing surface", async () => {
    const user = userEvent.setup();
    function SelectionFlow() {
      const [open, setOpen] = React.useState(true);
      return <FocusMode open={open} title="Conteúdo" onExit={() => setOpen(false)}><MultiSelect aria-label="Público" value={[]} onValueChange={() => {}} options={[{ value: 'people', label: 'Pessoas' }]} /></FocusMode>;
    }
    render(<SelectionFlow />);
    const input = screen.getByRole('combobox', { name: 'Público' });
    await user.click(input);
    expect(input).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{Escape}');
    expect(screen.getByRole('dialog', { name: 'Conteúdo' })).toBeVisible();
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveFocus();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
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
      expect(screen.getByRole("textbox", { name: "Título" })).toHaveFocus();
      await user.tab({ shift: true });
      expect(screen.getByRole("button", { name: "Sair de Curso" })).toHaveFocus();
      await user.tab();
      expect(screen.getByRole("textbox", { name: "Título" })).toHaveFocus();
      await user.keyboard("{Escape}");
      await waitFor(() => expect(opener).toHaveFocus());
    }
  });
});

describe("FocusMode task contract", () => {
  it("opens on the first field of the body, never on the exit", async () => {
    const user = userEvent.setup();
    function Flow() {
      const [open, setOpen] = React.useState(false);
      return <>
        <button onClick={() => setOpen(true)}>Novo curso</button>
        <FocusMode open={open} title="Novo curso" onExit={() => setOpen(false)}>
          <input aria-label="Nome do curso" />
          <textarea aria-label="Descrição" />
        </FocusMode>
      </>;
    }
    render(<Flow />);
    await user.click(screen.getByRole("button", { name: "Novo curso" }));
    expect(screen.getByRole("textbox", { name: "Nome do curso" })).toHaveFocus();
    expect(screen.getByRole("button", { name: "Sair de Novo curso" })).not.toHaveFocus();
  });

  it("keeps the exit as the entry point when the body offers no keyboard stop", async () => {
    const user = userEvent.setup();
    function Reading() {
      const [open, setOpen] = React.useState(false);
      return <>
        <button onClick={() => setOpen(true)}>Ler</button>
        <FocusMode open={open} title="Leitura" onExit={() => setOpen(false)}><p>Somente leitura.</p></FocusMode>
      </>;
    }
    render(<Reading />);
    await user.click(screen.getByRole("button", { name: "Ler" }));
    expect(screen.getByRole("button", { name: "Sair de Leitura" })).toHaveFocus();
  });

  it("holds back and primary in a band outside the scrolling body", async () => {
    const user = userEvent.setup();
    const submitted: string[] = [];
    function Wizard() {
      const [open, setOpen] = React.useState(false);
      return <>
        <button onClick={() => setOpen(true)}>Abrir</button>
        <FocusMode
          actions={<button form="wizard" type="submit">Ir para Estrutura</button>}
          back={<button type="button">Voltar</button>}
          measure="form"
          onExit={() => setOpen(false)}
          open={open}
          title="Novo curso"
        >
          <form id="wizard" onSubmit={(event) => { event.preventDefault(); submitted.push("ok"); }}>
            <input aria-label="Nome" />
          </form>
        </FocusMode>
      </>;
    }
    render(<Wizard />);
    await user.click(screen.getByRole("button", { name: "Abrir" }));
    const band = document.querySelector(".hw-focus-mode__actions");
    const body = document.querySelector(".hw-focus-mode__body");
    expect(band).toBeTruthy();
    expect(body).toHaveAttribute("data-measure", "form");
    expect(body?.contains(band ?? null)).toBe(false);
    expect(band).toContainElement(screen.getByRole("button", { name: "Voltar" }));
    expect(band).toContainElement(screen.getByRole("button", { name: "Ir para Estrutura" }));
    await user.click(screen.getByRole("button", { name: "Ir para Estrutura" }));
    expect(submitted).toEqual(["ok"]);
  });

  it("renders no band when the flow provides no action", async () => {
    const user = userEvent.setup();
    function Plain() {
      const [open, setOpen] = React.useState(false);
      return <>
        <button onClick={() => setOpen(true)}>Abrir</button>
        <FocusMode open={open} title="Curso" onExit={() => setOpen(false)}><input aria-label="Nome" /></FocusMode>
      </>;
    }
    render(<Plain />);
    await user.click(screen.getByRole("button", { name: "Abrir" }));
    expect(document.querySelector(".hw-focus-mode__actions")).toBeNull();
    expect(document.querySelector(".hw-focus-mode__body")).toHaveAttribute("data-measure", "page");
  });

  it("lets the flow own the heading outline without losing the dialog name", async () => {
    const user = userEvent.setup();
    function Flow({ titleAs }: { titleAs?: "h1" | "h2" }) {
      const [open, setOpen] = React.useState(false);
      return <>
        <button onClick={() => setOpen(true)}>Abrir</button>
        <FocusMode open={open} title="Novo curso" titleAs={titleAs} onExit={() => setOpen(false)}>
          <h2>Informações básicas</h2>
          <input aria-label="Nome" />
        </FocusMode>
      </>;
    }
    const { unmount } = render(<Flow />);
    await user.click(screen.getByRole("button", { name: "Abrir" }));
    expect(screen.getByRole("heading", { level: 2, name: "Novo curso" })).toBeVisible();
    unmount();

    render(<Flow titleAs="h1" />);
    await user.click(screen.getByRole("button", { name: "Abrir" }));
    expect(screen.getByRole("heading", { level: 1, name: "Novo curso" })).toBeVisible();
    expect(screen.getByRole("dialog", { name: "Novo curso" })).toBeVisible();
  });
});
