import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FilterBar } from "./index";

const OPCOES = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Ativos" },
];

function Exemplo({
  busca = "",
  status = "all",
  loading = false,
  onClear = () => undefined,
}: {
  busca?: string;
  status?: string;
  loading?: boolean;
  onClear?: () => void;
}) {
  const [b, setB] = React.useState(busca);
  const [s, setS] = React.useState(status);
  return (
    <FilterBar onClear={onClear} loading={loading}>
      <FilterBar.Search placeholder="Buscar por nome" value={b} onChange={setB} />
      <FilterBar.Select label="Status" value={s} onChange={setS} options={OPCOES} />
    </FilterBar>
  );
}

describe("FilterBar", () => {
  it("expõe a barra como região de busca", () => {
    render(<Exemplo />);
    expect(screen.getByRole("search", { name: "Filtros da listagem" })).toBeInTheDocument();
  });

  it("não oferece limpar quando não há nada filtrado", () => {
    render(<Exemplo />);
    expect(screen.queryByRole("button", { name: /limpar/i })).not.toBeInTheDocument();
  });

  it("oferece limpar assim que a busca recebe texto", async () => {
    const user = userEvent.setup();
    render(<Exemplo />);
    await user.type(screen.getByRole("searchbox", { name: "Buscar por nome" }), "ana");
    expect(screen.getByRole("button", { name: /limpar/i })).toBeInTheDocument();
  });

  it("trata espaço em branco como ausência de filtro", async () => {
    const user = userEvent.setup();
    render(<Exemplo />);
    await user.type(screen.getByRole("searchbox", { name: "Buscar por nome" }), "   ");
    expect(screen.queryByRole("button", { name: /limpar/i })).not.toBeInTheDocument();
  });

  it("trata a primeira opção como neutra", () => {
    render(<Exemplo status="all" />);
    expect(screen.queryByRole("button", { name: /limpar/i })).not.toBeInTheDocument();
  });

  it("trata as demais opções como filtro ativo", () => {
    render(<Exemplo status="active" />);
    expect(screen.getByRole("button", { name: /limpar/i })).toBeInTheDocument();
  });

  it("chama onClear ao acionar a ação", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(<Exemplo busca="ana" onClear={onClear} />);
    await user.click(screen.getByRole("button", { name: /limpar/i }));
    expect(onClear).toHaveBeenCalledOnce();
  });

  it("desabilita os controles enquanto carrega, sem removê-los", () => {
    render(<Exemplo busca="ana" loading />);
    expect(screen.getByRole("searchbox", { name: "Buscar por nome" })).toBeDisabled();
    expect(screen.getByRole("button", { name: /limpar/i })).toBeDisabled();
  });

  it("dá rótulo acessível a cada dimensão", () => {
    render(<Exemplo />);
    expect(screen.getByRole("combobox", { name: /status/i })).toBeInTheDocument();
  });

  it("marca o chip selecionado com aria-pressed", async () => {
    const user = userEvent.setup();
    function ComChips() {
      const [v, setV] = React.useState("all");
      return (
        <FilterBar onClear={() => setV("all")}>
          <FilterBar.Chips label="Status" value={v} onChange={setV} options={OPCOES} />
        </FilterBar>
      );
    }
    render(<ComChips />);
    const ativos = screen.getByRole("button", { name: "Ativos" });
    expect(ativos).toHaveAttribute("aria-pressed", "false");
    await user.click(ativos);
    expect(screen.getByRole("button", { name: "Ativos" })).toHaveAttribute("aria-pressed", "true");
  });

  it("recusa uso fora do container", () => {
    const silencio = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() =>
      render(<FilterBar.Search value="" onChange={() => undefined} />),
    ).toThrow(/precisa estar dentro de <FilterBar>/);
    silencio.mockRestore();
  });
});

describe("FilterBar.Field", () => {
  it("acomoda um controle que não é busca nem seleção", () => {
    render(
      <FilterBar onClear={() => undefined}>
        <FilterBar.Field label="De" active={false}>
          <input type="date" aria-label="De" />
        </FilterBar.Field>
      </FilterBar>,
    );
    expect(screen.getByLabelText("De")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /limpar/i })).not.toBeInTheDocument();
  });

  it("oferece limpar quando o campo se declara ativo", () => {
    render(
      <FilterBar onClear={() => undefined}>
        <FilterBar.Field label="De" active>
          <input type="date" aria-label="De" />
        </FilterBar.Field>
      </FilterBar>,
    );
    expect(screen.getByRole("button", { name: /limpar/i })).toBeInTheDocument();
  });
});

describe("FilterBar — espaçamento", () => {
  it("reserva respiro abaixo por padrão, para não colar na listagem", () => {
    const { container } = render(
      <FilterBar onClear={() => undefined}>
        <FilterBar.Search value="" onChange={() => undefined} />
      </FilterBar>,
    );
    expect(container.firstElementChild).toHaveClass("mb-6");
  });

  it("deixa o layout sobrescrever quando ele já cuida do espaçamento", () => {
    const { container } = render(
      <FilterBar onClear={() => undefined} className="mb-0">
        <FilterBar.Search value="" onChange={() => undefined} />
      </FilterBar>,
    );
    expect(container.firstElementChild).toHaveClass("mb-0");
    expect(container.firstElementChild).not.toHaveClass("mb-6");
  });

  it("dá a mesma forma a todos os controles da barra", () => {
    render(
      <FilterBar onClear={() => undefined}>
        <FilterBar.Search value="ana" onChange={() => undefined} placeholder="Buscar" />
        <FilterBar.Select
          label="Status"
          value="all"
          onChange={() => undefined}
          options={[{ value: "all", label: "Todos" }]}
        />
      </FilterBar>,
    );
    // Busca, seleção e a ação de limpar compartilham raio e altura: a barra é
    // uma superfície só.
    expect(screen.getByRole("searchbox")).toHaveClass("rounded-full", "h-10");
    expect(screen.getByRole("combobox")).toHaveClass("rounded-full", "h-10");
    expect(screen.getByRole("button", { name: /limpar/i })).toHaveClass("rounded-full", "h-10");
  });

  it("empresta a forma da barra ao controle que a tela traz", () => {
    render(
      <FilterBar onClear={() => undefined}>
        <FilterBar.Field label="De" active={false}>
          <input type="date" aria-label="Data inicial" />
        </FilterBar.Field>
      </FilterBar>,
    );
    const campo = screen.getByLabelText("Data inicial");
    expect(campo.parentElement).toHaveClass("[&_input]:rounded-full");
  });
});
