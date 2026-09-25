import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DataList, type DataListColumn } from "./index";

interface Item {
  id: string;
  nome: string;
}

const ITENS: Item[] = [
  { id: "1", nome: "Ana" },
  { id: "2", nome: "Bruno" },
];

const COLUNAS: DataListColumn<Item>[] = [{ key: "nome", header: "Nome", cell: (i) => i.nome }];

const base = { columns: COLUNAS, getKey: (i: Item) => i.id };

describe("DataList", () => {
  it("renderiza cabeçalho e uma linha por item", () => {
    render(<DataList {...base} items={ITENS} />);
    expect(screen.getByRole("columnheader", { name: "Nome" })).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(3); // cabeçalho + 2
  });

  it("troca as linhas por esqueleto durante o carregamento", () => {
    render(<DataList {...base} items={ITENS} loading loadingRows={3} />);
    expect(screen.queryByText("Ana")).not.toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(4); // cabeçalho + 3
  });

  it("mostra o estado vazio quando não há itens", () => {
    render(<DataList {...base} items={[]} empty={<p>Nenhum resultado</p>} />);
    expect(screen.getByText("Nenhum resultado")).toBeInTheDocument();
  });

  it("não mostra o estado vazio enquanto carrega", () => {
    render(<DataList {...base} items={[]} loading empty={<p>Nenhum resultado</p>} />);
    expect(screen.queryByText("Nenhum resultado")).not.toBeInTheDocument();
  });

  it("chama onRowClick com o item da linha", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    render(<DataList {...base} items={ITENS} onRowClick={onRowClick} />);
    await user.click(screen.getByText("Bruno"));
    expect(onRowClick).toHaveBeenCalledWith(ITENS[1]);
  });

  it("mostra o erro no lugar do estado vazio, e não os dois", () => {
    render(
      <DataList
        {...base}
        items={[]}
        error={<p>Falha ao carregar</p>}
        empty={<p>Nenhum resultado</p>}
      />,
    );
    expect(screen.getByText("Falha ao carregar")).toBeInTheDocument();
    expect(screen.queryByText("Nenhum resultado")).not.toBeInTheDocument();
  });

  it("não mostra o erro enquanto ainda está carregando", () => {
    render(<DataList {...base} items={[]} loading error={<p>Falha ao carregar</p>} />);
    expect(screen.queryByText("Falha ao carregar")).not.toBeInTheDocument();
  });

  it("esconde as linhas quando a carga falhou", () => {
    render(<DataList {...base} items={ITENS} error={<p>Falha</p>} />);
    expect(screen.queryByText("Ana")).not.toBeInTheDocument();
  });

  it("dá a mesma altura ao esqueleto e à linha de dados", () => {
    const { container: carregando } = render(
      <DataList {...base} items={[]} loading loadingRows={1} rowHeight="h-[76px]" />,
    );
    const { container: carregado } = render(
      <DataList {...base} items={[ITENS[0]]} rowHeight="h-[76px]" />,
    );
    const linhaEsqueleto = carregando.querySelector("tbody tr");
    const linhaDados = carregado.querySelector("tbody tr");
    expect(linhaEsqueleto).toHaveClass("h-[76px]");
    expect(linhaDados).toHaveClass("h-[76px]");
  });

  it("aplica a largura mínima na tabela, não no container", () => {
    render(<DataList {...base} items={ITENS} aria-label="Largas" minWidth="860px" />);
    expect(screen.getByRole("table", { name: "Largas" })).toHaveStyle({ minWidth: "860px" });
  });

  it("não declara largura mínima quando a listagem não pede", () => {
    render(<DataList {...base} items={ITENS} aria-label="Estreita" />);
    expect(screen.getByRole("table", { name: "Estreita" }).style.minWidth).toBe("");
  });

  it("dá rótulo acessível à tabela", () => {
    render(<DataList {...base} items={ITENS} aria-label="Colaboradores" />);
    expect(screen.getByRole("table", { name: "Colaboradores" })).toBeInTheDocument();
  });
});
