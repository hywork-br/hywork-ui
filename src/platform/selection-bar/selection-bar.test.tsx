import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Button } from "../../core/button";
import { SelectionBar } from "./index";

const contagem = (n: number) => (n === 0 ? "Nenhuma selecionada" : `${n} selecionadas`);

/** A barra com estado, como a tela usa, e um botão depois dela no lugar da lista. */
function ComEstado({
  inicial = 2,
  persistent,
  onAction,
}: {
  inicial?: number;
  persistent?: boolean;
  onAction?: (limpar: () => void) => void;
}) {
  const [n, setN] = React.useState(inicial);
  return (
    <>
      <button type="button">Antes</button>
      <SelectionBar persistent={persistent} count={n} label={contagem(n)} onClear={() => setN(0)}>
        <Button size="sm" onClick={() => onAction?.(() => setN(0))}>
          Enviar lembrete
        </Button>
      </SelectionBar>
      <button type="button" onClick={() => setN((x) => x + 1)}>
        Marcar mais uma
      </button>
    </>
  );
}

/** A moldura, esteja ou não à vista (escondida, ela não tem nome acessível). */
const grupo = () => document.querySelector<HTMLElement>('[role="group"][aria-label="Ações da seleção"]')!;

describe("SelectionBar", () => {
  it("com seleção, mostra a contagem, a ação e Limpar seleção, na moldura da marca", () => {
    render(
      <SelectionBar count={3} label="3 selecionadas" onClear={() => undefined}>
        <Button size="sm">Enviar lembrete</Button>
      </SelectionBar>,
    );
    const barra = screen.getByRole("group", { name: "Ações da seleção" });
    expect(barra).not.toHaveAttribute("aria-hidden");
    expect(barra).toHaveClass("border-primary/30", "bg-primary/5");
    expect(barra).not.toHaveClass("invisible");
    expect(within(barra).getByText("3 selecionadas")).toBeInTheDocument();
    expect(within(barra).getByRole("button", { name: "Enviar lembrete" })).toBeEnabled();
    expect(within(barra).getByRole("button", { name: "Limpar seleção" })).toBeEnabled();
  });

  it("sem seleção, fica montada e invisível — guarda o lugar —, fora do leitor de tela e com tudo desabilitado", () => {
    render(
      <SelectionBar count={0} label="Nenhuma selecionada" onClear={() => undefined}>
        <Button size="sm">Enviar lembrete</Button>
      </SelectionBar>,
    );
    expect(screen.queryByRole("group", { name: "Ações da seleção" })).not.toBeInTheDocument();
    const barra = grupo();
    expect(barra).toHaveAttribute("aria-hidden", "true");
    expect(barra).toHaveClass("invisible");
    expect(within(barra).getByRole("button", { name: "Enviar lembrete", hidden: true })).toBeDisabled();
    const limpar = within(barra).getByRole("button", { name: "Limpar seleção", hidden: true });
    expect(limpar).toBeDisabled();
    // Escondida, a barra guarda a altura da aberta: o botão fica no lugar.
    expect(limpar).not.toHaveClass("hidden");
  });

  it("anuncia a contagem numa região viva educada, que existe desde o começo e fica fora da moldura", () => {
    const { rerender } = render(<SelectionBar count={0} label="Nenhuma selecionada" onClear={() => undefined} />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(grupo()).not.toContainElement(status);
    rerender(<SelectionBar count={2} label="2 selecionadas" onClear={() => undefined} />);
    expect(screen.getByRole("status")).toBe(status);
    expect(status).toHaveTextContent("2 selecionadas");
    rerender(<SelectionBar count={0} label="Nenhuma selecionada" onClear={() => undefined} />);
    expect(status).toHaveTextContent("Nenhuma selecionada");
  });

  it("a contagem visível não é lida duas vezes", () => {
    render(<SelectionBar count={2} label="2 selecionadas" onClear={() => undefined} />);
    const visivel = within(screen.getByRole("group")).getByText("2 selecionadas");
    expect(visivel).toHaveAttribute("aria-hidden", "true");
  });

  it("Limpar seleção chama onClear", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(<SelectionBar count={2} label="2 selecionadas" onClear={onClear} />);
    await user.click(screen.getByRole("button", { name: "Limpar seleção" }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("ao limpar, o foco não se perde: vai para a barra, e o Tab seguinte segue para o que vem depois", async () => {
    const user = userEvent.setup();
    const { container } = render(<ComEstado />);
    await user.click(screen.getByRole("button", { name: "Limpar seleção" }));
    const raiz = container.querySelector("[tabindex='-1']");
    expect(raiz).toHaveFocus();
    expect(grupo()).toHaveAttribute("aria-hidden", "true");
    await user.tab();
    expect(screen.getByRole("button", { name: "Marcar mais uma" })).toHaveFocus();
  });

  it("quando a tela zera a seleção depois de uma ação, o foco também vai para a barra", async () => {
    const user = userEvent.setup();
    const { container } = render(<ComEstado onAction={(limpar) => limpar()} />);
    await user.click(screen.getByRole("button", { name: "Enviar lembrete" }));
    expect(container.querySelector("[tabindex='-1']")).toHaveFocus();
  });

  it("o foco fica onde está quando a seleção zera com ele fora da barra", async () => {
    const user = userEvent.setup();
    render(<ComEstado />);
    const antes = screen.getByRole("button", { name: "Antes" });
    antes.focus();
    await user.click(screen.getByRole("button", { name: "Limpar seleção" }));
    antes.focus();
    await user.click(screen.getByRole("button", { name: "Marcar mais uma" }));
    expect(screen.getByRole("button", { name: "Marcar mais uma" })).toHaveFocus();
  });

  it("persistent: à vista sem seleção, sem a moldura da marca, ações desabilitadas e sem Limpar", () => {
    render(
      <SelectionBar persistent count={0} label="Nenhuma selecionada" onClear={() => undefined}>
        <Button size="sm">Exportar selecionados</Button>
      </SelectionBar>,
    );
    const barra = screen.getByRole("group", { name: "Ações da seleção" });
    expect(barra).not.toHaveClass("invisible");
    expect(barra).not.toHaveClass("bg-primary/5");
    expect(within(barra).getByText("Nenhuma selecionada")).toBeInTheDocument();
    expect(within(barra).getByRole("button", { name: "Exportar selecionados" })).toBeDisabled();
    // Como o "Limpar" da FilterBar: sem nada a desfazer, o botão sai do layout.
    const limpar = within(barra).getByRole("button", { name: "Limpar seleção" });
    expect(limpar).toBeDisabled();
    expect(limpar).toHaveClass("hidden");
  });

  it("persistent: a ação se habilita ao marcar e volta a desabilitar ao limpar", async () => {
    const user = userEvent.setup();
    render(<ComEstado persistent inicial={0} />);
    expect(screen.getByRole("button", { name: "Enviar lembrete" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Marcar mais uma" }));
    expect(screen.getByRole("button", { name: "Enviar lembrete" })).toBeEnabled();
    expect(screen.getByRole("group", { name: "Ações da seleção" })).toHaveClass("bg-primary/5");
    await user.click(screen.getByRole("button", { name: "Limpar seleção" }));
    expect(screen.getByRole("button", { name: "Enviar lembrete" })).toBeDisabled();
  });

  it("a tela ainda desabilita uma ação por outro motivo, com a nota em detail ligada ao botão", () => {
    render(
      <SelectionBar
        persistent
        count={3}
        label="3 selecionadas"
        detail={<span id="nota">Disponível quando a calibragem terminar</span>}
        onClear={() => undefined}
      >
        <Button size="sm" disabled aria-describedby="nota">
          Exportar selecionados
        </Button>
      </SelectionBar>,
    );
    const acao = screen.getByRole("button", { name: "Exportar selecionados" });
    expect(acao).toBeDisabled();
    expect(acao).toHaveAccessibleDescription("Disponível quando a calibragem terminar");
  });

  it("detail: 'Selecionar todas as N' ao lado da contagem, clicável, alinhado ao texto", async () => {
    const user = userEvent.setup();
    const selecionarTodas = vi.fn();
    render(
      <SelectionBar
        count={6}
        label="6 selecionadas"
        detail={
          <Button variant="link" size="sm" onClick={selecionarTodas}>
            Selecionar todas as 57 pendências
          </Button>
        }
        onClear={() => undefined}
      />,
    );
    const link = screen.getByRole("button", { name: "Selecionar todas as 57 pendências" });
    expect(link.parentElement).toHaveClass("[&>button]:h-auto", "[&>button]:px-0");
    await user.click(link);
    expect(selecionarTodas).toHaveBeenCalledTimes(1);
  });

  it("várias ações, a destrutiva entre elas", () => {
    render(
      <SelectionBar count={2} label="2 selecionadas" onClear={() => undefined}>
        <Button size="sm" variant="outline">Alocar</Button>
        <Button size="sm" variant="destructive">Remover</Button>
      </SelectionBar>,
    );
    const barra = screen.getByRole("group");
    expect(within(barra).getAllByRole("button").map((b) => b.textContent)).toEqual(["Alocar", "Remover", "Limpar seleção"]);
  });

  it("aceita o nome do grupo, o texto de limpar e as props do contêiner", () => {
    render(
      <SelectionBar
        aria-label="Ações em lote"
        clearLabel="Desmarcar"
        data-testid="barra"
        className="mb-0"
        count={1}
        label="1 selecionada"
        onClear={() => undefined}
      />,
    );
    expect(screen.getByRole("group", { name: "Ações em lote" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Desmarcar" })).toBeInTheDocument();
    expect(screen.getByTestId("barra")).toHaveClass("mb-0");
    expect(screen.getByTestId("barra")).not.toHaveClass("mb-4");
  });

  it("repassa a ref ao contêiner", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<SelectionBar ref={ref} count={1} label="1 selecionada" onClear={() => undefined} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute("tabindex", "-1");
  });
});
