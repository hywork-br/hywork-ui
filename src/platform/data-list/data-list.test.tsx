import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DataList, type DataListColumn, type DataListSelection } from "./index";

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

  it("não monta a tabela quando não há o que listar", () => {
    render(<DataList {...base} items={[]} empty={<p>Nenhum item</p>} />);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader")).not.toBeInTheDocument();
    expect(screen.getByText("Nenhum item")).toBeInTheDocument();
  });

  it("também não monta a tabela quando a carga falhou", () => {
    render(<DataList {...base} items={[]} error={<p>Falhou</p>} />);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("mostra o estado vazio quando não há itens", () => {
    render(<DataList {...base} items={[]} empty={<p>Nenhum resultado</p>} />);
    expect(screen.getByText("Nenhum resultado")).toBeInTheDocument();
  });

  it("não mostra o estado vazio enquanto carrega", () => {
    render(<DataList {...base} items={[]} loading empty={<p>Nenhum resultado</p>} />);
    expect(screen.queryByText("Nenhum resultado")).not.toBeInTheDocument();
  });

  it("lista as linhas por padrão e repassa striped ao Table", () => {
    const { rerender } = render(<DataList {...base} items={ITENS} />);
    expect(screen.getByRole("table")).toHaveAttribute("data-striped");
    expect(screen.getByText("Bruno").closest("tr")).toHaveClass("even:bg-hw-table-stripe");
    rerender(<DataList {...base} items={ITENS} striped={false} />);
    expect(screen.getByRole("table")).not.toHaveAttribute("data-striped");
    expect(screen.getByText("Bruno").closest("tr")).not.toHaveClass("even:bg-hw-table-stripe");
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

  it("rola na horizontal em vez de espremer: largura mínima pelo número de colunas", () => {
    render(<DataList {...base} items={ITENS} aria-label="Estreita" />);
    const tabela = screen.getByRole("table", { name: "Estreita" });
    expect(tabela.style.minWidth).toBe(`${Math.max(base.columns.length, 2) * 160}px`);
    expect(tabela.parentElement).toHaveClass("overflow-x-auto");
    // O contêiner precisa poder encolher dentro de flex, senão a rolagem nunca
    // aparece e o layout da página corta a tabela.
    expect(tabela.parentElement?.parentElement).toHaveClass("min-w-0", "max-w-full");
  });

  it("dá rótulo acessível à tabela", () => {
    render(<DataList {...base} items={ITENS} aria-label="Colaboradores" />);
    expect(screen.getByRole("table", { name: "Colaboradores" })).toBeInTheDocument();
  });
});

describe("DataList com seleção", () => {
  const TRES: Item[] = [...ITENS, { id: "3", nome: "Carla" }];

  const selecao = (
    marcadas: string[],
    extra: Partial<DataListSelection<Item>> = {},
  ): DataListSelection<Item> => ({
    selectedKeys: new Set(marcadas),
    onChange: vi.fn(),
    getLabel: (i) => `Selecionar ${i.nome}`,
    ...extra,
  });

  /** O conjunto que a lista entregou na última mudança. */
  const entregue = (s: DataListSelection<Item>) =>
    [...(vi.mocked(s.onChange).mock.lastCall?.[0] ?? [])].sort();

  /** Seleção com estado, como a tela usa. */
  function ComEstado(props: { items: Item[]; inicial?: string[]; onRowClick?: (i: Item) => void }) {
    const [chaves, setChaves] = React.useState<ReadonlySet<string>>(new Set(props.inicial ?? []));
    return (
      <DataList
        {...base}
        items={props.items}
        onRowClick={props.onRowClick}
        selection={{ selectedKeys: chaves, onChange: setChaves, getLabel: (i) => `Selecionar ${i.nome}` }}
      />
    );
  }

  it("sem selection, não há caixa nenhuma", () => {
    render(<DataList {...base} items={ITENS} />);
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.getAllByRole("columnheader")).toHaveLength(1);
  });

  it("põe uma caixa por linha, com o rótulo de getLabel, e a do cabeçalho", () => {
    render(<DataList {...base} items={ITENS} selection={selecao([])} />);
    expect(screen.getByRole("checkbox", { name: "Selecionar Ana" })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Selecionar Bruno" })).not.toBeChecked();
    const cabecalho = screen.getAllByRole("columnheader")[0];
    expect(within(cabecalho).getByRole("checkbox", { name: "Selecionar todas as linhas" })).toBeInTheDocument();
  });

  it("usa o rótulo do cabeçalho que a tela passar", () => {
    render(
      <DataList {...base} items={ITENS} selection={selecao([], { selectAllLabel: "Selecionar todas desta página" })} />,
    );
    expect(screen.getByRole("checkbox", { name: "Selecionar todas desta página" })).toBeInTheDocument();
  });

  it("marca uma linha, entregando um conjunto novo", async () => {
    const user = userEvent.setup();
    const s = selecao(["9"]);
    render(<DataList {...base} items={ITENS} selection={s} />);
    await user.click(screen.getByRole("checkbox", { name: "Selecionar Bruno" }));
    expect(entregue(s)).toEqual(["2", "9"]);
    expect(vi.mocked(s.onChange).mock.lastCall?.[0]).not.toBe(s.selectedKeys);
    expect([...s.selectedKeys]).toEqual(["9"]); // o recebido fica intacto
  });

  it("desmarca uma linha marcada", async () => {
    const user = userEvent.setup();
    const s = selecao(["1", "2"]);
    render(<DataList {...base} items={ITENS} selection={s} />);
    expect(screen.getByRole("checkbox", { name: "Selecionar Ana" })).toBeChecked();
    await user.click(screen.getByRole("checkbox", { name: "Selecionar Ana" }));
    expect(entregue(s)).toEqual(["2"]);
  });

  it("pinta a linha marcada pelo estado de seleção da tabela, sem perder altura nem listra", () => {
    render(<DataList {...base} items={ITENS} rowHeight="h-[76px]" selection={selecao(["2"])} />);
    const bruno = screen.getByText("Bruno").closest("tr")!;
    const ana = screen.getByText("Ana").closest("tr")!;
    expect(bruno).toHaveAttribute("data-state", "selected");
    expect(bruno).toHaveClass("data-[state=selected]:bg-hw-table-selected", "even:bg-hw-table-stripe", "h-[76px]");
    expect(ana).not.toHaveAttribute("data-state");
  });

  it("cabeçalho: desmarcado sem nada, misto com parte, marcado com tudo em tela", () => {
    const nome = { name: "Selecionar todas as linhas" };
    const { rerender } = render(<DataList {...base} items={TRES} selection={selecao([])} />);
    expect(screen.getByRole("checkbox", nome)).not.toBeChecked();
    expect(screen.getByRole("checkbox", nome)).not.toBePartiallyChecked();

    rerender(<DataList {...base} items={TRES} selection={selecao(["2"])} />);
    expect(screen.getByRole("checkbox", nome)).toBePartiallyChecked();

    rerender(<DataList {...base} items={TRES} selection={selecao(["1", "2", "3"])} />);
    expect(screen.getByRole("checkbox", nome)).toBeChecked();
  });

  it("cabeçalho: chaves de outras páginas não contam para o estado", () => {
    render(<DataList {...base} items={TRES} selection={selecao(["outra-1", "outra-2"])} />);
    expect(screen.getByRole("checkbox", { name: "Selecionar todas as linhas" })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Selecionar todas as linhas" })).not.toBePartiallyChecked();
  });

  it("cabeçalho misto marca só as linhas em tela e preserva as chaves de fora", async () => {
    const user = userEvent.setup();
    const s = selecao(["2", "outra-1"]);
    render(<DataList {...base} items={TRES} selection={s} />);
    await user.click(screen.getByRole("checkbox", { name: "Selecionar todas as linhas" }));
    expect(entregue(s)).toEqual(["1", "2", "3", "outra-1"]);
  });

  it("cabeçalho marcado desmarca só as linhas em tela e preserva as chaves de fora", async () => {
    const user = userEvent.setup();
    const s = selecao(["1", "2", "3", "outra-1"]);
    render(<DataList {...base} items={TRES} selection={s} />);
    await user.click(screen.getByRole("checkbox", { name: "Selecionar todas as linhas" }));
    expect(entregue(s)).toEqual(["outra-1"]);
  });

  it("o clique na caixa não dispara onRowClick, e o clique na linha continua disparando", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    const s = selecao([]);
    render(<DataList {...base} items={ITENS} onRowClick={onRowClick} selection={s} />);
    await user.click(screen.getByRole("checkbox", { name: "Selecionar Ana" }));
    expect(s.onChange).toHaveBeenCalledTimes(1);
    expect(onRowClick).not.toHaveBeenCalled();
    await user.click(screen.getByText("Bruno"));
    expect(onRowClick).toHaveBeenCalledWith(ITENS[1]);
  });

  it("a célula inteira é o alvo: o clique em volta da caixa marca uma vez e não abre a linha", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    const s = selecao([]);
    render(<DataList {...base} items={ITENS} onRowClick={onRowClick} selection={s} />);
    const celula = screen.getByRole("checkbox", { name: "Selecionar Ana" }).closest("td")!;
    await user.click(celula);
    expect(s.onChange).toHaveBeenCalledTimes(1);
    expect(entregue(s)).toEqual(["1"]);
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("a célula do cabeçalho também é alvo da caixa do cabeçalho", async () => {
    const user = userEvent.setup();
    const s = selecao([]);
    render(<DataList {...base} items={ITENS} selection={s} />);
    await user.click(screen.getAllByRole("columnheader")[0]);
    expect(s.onChange).toHaveBeenCalledTimes(1);
    expect(entregue(s)).toEqual(["1", "2"]);
  });

  it("linha não selecionável: caixa desabilitada, ignorada pelo cabeçalho e pelo clique", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    const s = selecao(["1"], { isSelectable: (i) => i.id !== "2" });
    render(<DataList {...base} items={ITENS} onRowClick={onRowClick} selection={s} />);
    const bruno = screen.getByRole("checkbox", { name: "Selecionar Bruno" });
    expect(bruno).toBeDisabled();
    // Ana é a única selecionável, e está marcada: a página está inteira.
    expect(screen.getByRole("checkbox", { name: "Selecionar todas as linhas" })).toBeChecked();
    await user.click(bruno.closest("td")!);
    expect(s.onChange).not.toHaveBeenCalled();
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("cabeçalho não marca a linha não selecionável", async () => {
    const user = userEvent.setup();
    const s = selecao([], { isSelectable: (i) => i.id !== "2" });
    render(<DataList {...base} items={TRES} selection={s} />);
    await user.click(screen.getByRole("checkbox", { name: "Selecionar todas as linhas" }));
    expect(entregue(s)).toEqual(["1", "3"]);
  });

  it("sem nenhuma linha selecionável, a caixa do cabeçalho fica desabilitada", () => {
    render(<DataList {...base} items={ITENS} selection={selecao([], { isSelectable: () => false })} />);
    expect(screen.getByRole("checkbox", { name: "Selecionar todas as linhas" })).toBeDisabled();
  });

  it("carregando: nenhuma caixa nas linhas, a do cabeçalho desabilitada e desmarcada", () => {
    render(<DataList {...base} items={ITENS} loading loadingRows={3} selection={selecao(["1"])} />);
    const caixas = screen.getAllByRole("checkbox");
    expect(caixas).toHaveLength(1);
    expect(caixas[0]).toHaveAccessibleName("Selecionar todas as linhas");
    expect(caixas[0]).toBeDisabled();
    expect(caixas[0]).not.toBeChecked();
    // A coluna continua lá, vazia, para não mudar de largura quando os dados chegarem.
    for (const linha of screen.getAllByRole("row").slice(1)) {
      expect(within(linha).getAllByRole("cell")).toHaveLength(COLUNAS.length + 1);
    }
  });

  it("vazio e erro: nenhuma caixa", () => {
    const { rerender } = render(
      <DataList {...base} items={[]} empty={<p>Nenhum item</p>} selection={selecao(["1"])} />,
    );
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    rerender(<DataList {...base} items={ITENS} error={<p>Falhou</p>} selection={selecao(["1"])} />);
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("teclado: Tab chega às caixas na ordem e Espaço marca", async () => {
    const user = userEvent.setup();
    render(<ComEstado items={ITENS} />);
    await user.tab();
    expect(screen.getByRole("checkbox", { name: "Selecionar todas as linhas" })).toHaveFocus();
    await user.tab();
    const ana = screen.getByRole("checkbox", { name: "Selecionar Ana" });
    expect(ana).toHaveFocus();
    await user.keyboard(" ");
    expect(ana).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Selecionar todas as linhas" })).toBePartiallyChecked();
    await user.keyboard(" ");
    expect(ana).not.toBeChecked();
  });

  it("Espaço na caixa não abre a linha", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    render(<ComEstado items={ITENS} onRowClick={onRowClick} />);
    screen.getByRole("checkbox", { name: "Selecionar Ana" }).focus();
    await user.keyboard(" ");
    expect(screen.getByRole("checkbox", { name: "Selecionar Ana" })).toBeChecked();
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("soma a coluna de seleção à largura mínima calculada", () => {
    render(<DataList {...base} items={ITENS} aria-label="Com seleção" selection={selecao([])} />);
    expect(screen.getByRole("table", { name: "Com seleção" }).style.minWidth).toBe(
      `${Math.max(base.columns.length, 2) * 160 + 40}px`,
    );
  });
});
