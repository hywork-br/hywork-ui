import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";

import { SearchCombobox } from "./index";

// jsdom não tem layout: o contraste fica com o Playwright e o addon-a11y.
const violations = async (container: HTMLElement) =>
  (await axe.run(container, { rules: { "color-contrast": { enabled: false } } })).violations;

const NOMES = ["Ana Lima", "André Souza", "Bruno Reis"];

function Busca({ onPick = vi.fn(), onKeyDownFora = vi.fn() }: { onPick?: (n: string) => void; onKeyDownFora?: () => void }) {
  const [texto, setTexto] = React.useState("");
  const items = texto.trim() ? NOMES.filter((n) => n.toLowerCase().includes(texto.trim().toLowerCase())) : [];
  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- simula o painel atrás da busca
    <div onKeyDown={onKeyDownFora}>
      <SearchCombobox
        label="Buscar pessoa"
        value={texto}
        onChange={setTexto}
        items={items}
        getKey={(n) => n}
        renderItem={(n) => <span>{n}</span>}
        onPick={onPick}
      />
      <button type="button">Fora</button>
    </div>
  );
}

const campo = () => screen.getByRole("combobox", { name: "Buscar pessoa" });

describe("SearchCombobox", () => {
  it("fechada, é um campo de busca sem lista", () => {
    render(<Busca />);
    expect(campo()).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("ao digitar, abre a lista que o campo controla", async () => {
    const user = userEvent.setup();
    render(<Busca />);
    await user.type(campo(), "an");
    const lista = screen.getByRole("listbox", { name: "Buscar pessoa" });
    expect(campo()).toHaveAttribute("aria-expanded", "true");
    expect(campo()).toHaveAttribute("aria-controls", lista.id);
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Ana Lima", "André Souza"]);
    expect(campo()).not.toHaveAttribute("aria-activedescendant");
  });

  it("↓ e ↑ movem a opção ativa, com o foco no campo, e dão a volta", async () => {
    const user = userEvent.setup();
    render(<Busca />);
    await user.type(campo(), "an");
    const [ana, andre] = screen.getAllByRole("option");
    await user.keyboard("{ArrowUp}");
    expect(campo()).toHaveAttribute("aria-activedescendant", andre.id);
    expect(andre).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{ArrowDown}");
    expect(campo()).toHaveAttribute("aria-activedescendant", ana.id);
    expect(ana).toHaveAttribute("aria-selected", "true");
    expect(andre).toHaveAttribute("aria-selected", "false");
    expect(campo()).toHaveFocus();
  });

  it("Enter escolhe a ativa e fecha a lista", async () => {
    const user = userEvent.setup();
    const onPick = vi.fn();
    render(<Busca onPick={onPick} />);
    await user.type(campo(), "an");
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(onPick).toHaveBeenCalledWith("André Souza");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("Enter sem opção ativa escolhe a primeira", async () => {
    const user = userEvent.setup();
    const onPick = vi.fn();
    render(<Busca onPick={onPick} />);
    await user.type(campo(), "an{Enter}");
    expect(onPick).toHaveBeenCalledWith("Ana Lima");
  });

  it("o clique escolhe e o foco fica no campo", async () => {
    const user = userEvent.setup();
    const onPick = vi.fn();
    render(<Busca onPick={onPick} />);
    await user.type(campo(), "br");
    await user.click(screen.getByRole("option", { name: "Bruno Reis" }));
    expect(onPick).toHaveBeenCalledWith("Bruno Reis");
    expect(campo()).toHaveFocus();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("Esc fecha a lista, mantém o texto e não chega ao painel atrás", async () => {
    const user = userEvent.setup();
    const onKeyDownFora = vi.fn();
    render(<Busca onKeyDownFora={onKeyDownFora} />);
    await user.type(campo(), "an");
    onKeyDownFora.mockClear();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(campo()).toHaveValue("an");
    expect(onKeyDownFora).not.toHaveBeenCalled();
    // ↓ reabre a lista que o Esc fechou.
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("sem resultado, diz o que foi buscado, numa lista sem opção", async () => {
    const user = userEvent.setup();
    render(<Busca />);
    await user.type(campo(), "zz");
    expect(screen.getByRole("status")).toHaveTextContent("Nada encontrado para “zz”.");
    expect(campo()).toHaveAttribute("aria-expanded", "true");
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("aceita outra frase para o vazio", async () => {
    const user = userEvent.setup();
    render(
      <SearchCombobox
        label="Buscar"
        value="xy"
        onChange={() => undefined}
        items={[]}
        getKey={() => ""}
        renderItem={() => null}
        onPick={() => undefined}
        emptyLabel={(q) => `No results for "${q}"`}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    expect(screen.getByRole("status")).toHaveTextContent('No results for "xy"');
  });

  it("fecha quando o foco sai e reabre ao voltar", async () => {
    const user = userEvent.setup();
    render(<Busca />);
    await user.type(campo(), "an");
    await user.click(screen.getByRole("button", { name: "Fora" }));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    await user.click(campo());
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("passa na auditoria do axe aberta, com opção ativa, e sem resultado", async () => {
    const user = userEvent.setup();
    const { container } = render(<Busca />);
    await user.type(campo(), "an{ArrowDown}");
    expect(await violations(container)).toEqual([]);
    await user.clear(campo());
    await user.type(campo(), "zz");
    expect(await violations(container)).toEqual([]);
  });
});
