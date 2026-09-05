import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DataTable } from "../patterns/data-table";
import { Pagination, ColumnControl } from "../patterns/collection-controls";
import { ContentCell } from "../components/table-cells";
import { CollectionDemo } from "../../stories/collections/collection-demo";

describe("operational collections", () => {
  it("keeps focus in preferences when saving clears and disables the save action", async () => {
    sessionStorage.clear();
    render(<CollectionDemo />);
    const preferences = screen.getByRole("button", { name: "Preferências de visualização" });
    await userEvent.click(preferences);
    await userEvent.click(screen.getByText("Gerenciar visões"));
    const name = screen.getByLabelText("Nome da visão");
    await userEvent.type(name, "Editorial");
    const save = screen.getByRole("button", { name: "Salvar visão" });
    await userEvent.click(save);
    expect(save).toBeDisabled();
    expect(name).toHaveValue("");
    expect(name).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    expect(preferences).toHaveFocus();
    expect(preferences).toHaveAttribute("aria-expanded", "false");
  });
  it("excludes by author and by date independently and uses singular counts", async () => {
    sessionStorage.clear();
    render(<CollectionDemo />);
    await userEvent.click(screen.getByText("Mais filtros"));
    await userEvent.click(screen.getByRole("combobox", { name: "Autores" }));
    await userEvent.click(screen.getByRole("option", { name: "Bruno Reis" }));
    expect(screen.queryByText("Cultura que aproxima")).not.toBeInTheDocument();
    expect(screen.getByText("Guia de benefícios")).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Remover Bruno Reis" })
    );
    fireEvent.change(screen.getByLabelText("De"), {
      target: { value: "2026-09-04" },
    });
    expect(screen.queryByText("Cultura que aproxima")).not.toBeInTheDocument();
    expect(screen.getByText("Boas-vindas à equipe")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Até"), {
      target: { value: "2026-09-04" },
    });
    expect(screen.queryByText("Guia de benefícios")).not.toBeInTheDocument();
    expect(screen.getByText(/1 filtrado ·/)).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText("Selecionar página"));
    expect(screen.getByText(/1 selecionado \(/)).toBeInTheDocument();
  });
  it("restores columns, density and actual sort order", async () => {
    sessionStorage.clear();
    render(<CollectionDemo />);
    await userEvent.click(screen.getByRole("button", { name: "Preferências de visualização" }));
    await userEvent.selectOptions(
      screen.getByLabelText("Densidade"),
      "compact"
    );
    await userEvent.click(screen.getByText("Colunas"));
    await userEvent.click(screen.getByRole("checkbox", { name: "Autor" }));
    await userEvent.click(
      screen.getByRole("button", { name: "Ordenar por Conteúdo" })
    );
    await userEvent.click(screen.getByText("Gerenciar visões"));
    await userEvent.type(screen.getByLabelText("Nome da visão"), "Compacta");
    await userEvent.click(screen.getByRole("button", { name: "Salvar visão" }));
    await userEvent.selectOptions(
      screen.getByLabelText("Densidade"),
      "comfortable"
    );
    await userEvent.click(screen.getByRole("checkbox", { name: "Autor" }));
    await userEvent.click(
      screen.getByRole("button", { name: "Ordenar por Conteúdo" })
    );
    await userEvent.selectOptions(
      screen.getByLabelText("Visões salvas"),
      "view-1"
    );
    expect(screen.getByLabelText("Densidade")).toHaveValue("compact");
    expect(
      screen.getByRole("region", { name: "Conteúdos: tabela rolável" })
    ).toHaveAttribute("data-density", "compact");
    expect(
      screen.queryByRole("columnheader", { name: "Autor" })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Conteúdo" })
    ).toHaveAttribute("aria-sort", "ascending");
    expect(screen.getAllByRole("row")[1]).toHaveTextContent(
      "Agenda de setembro"
    );
  });
  it("selects only eligible page rows and preserves other-page keys", async () => {
    const change = vi.fn();
    render(
      <DataTable
        ariaLabel="Items"
        rows={[{ id: "a" }, { id: "b" }, { id: "locked" }]}
        columns={[{ key: "id", header: "Item", sortable: true }]}
        getRowKey={(r) => r.id}
        selection={{
          keys: ["other", "a"],
          onChange: change,
          getLabel: (r) => r.id,
          isDisabled: (r) => r.id === "locked",
        }}
      />
    );
    expect(
      screen.queryByRole("button", { name: /Ordenar/ })
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("Selecionar página")).toBePartiallyChecked();
    expect(screen.getByLabelText("Selecionar locked")).toBeDisabled();
    await userEvent.click(screen.getByLabelText("Selecionar página"));
    expect(change).toHaveBeenCalledWith(["other", "a", "b"]);
  });
  it("keeps pagination bounded, including empty totals", async () => {
    const change = vi.fn();
    const { rerender } = render(
      <Pagination page={9} pageSize={5} total={12} onPageChange={change} />
    );
    expect(screen.getByText("11–12 de 12")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Próxima página" })
    ).toBeDisabled();
    await userEvent.click(
      screen.getByRole("button", { name: "Página anterior" })
    );
    expect(change).toHaveBeenCalledWith(2);
    rerender(
      <Pagination page={1} pageSize={5} total={0} onPageChange={change} />
    );
    expect(screen.getByText("0–0 de 0")).toBeInTheDocument();
  });
  it("cannot hide identity while allowing optional columns", async () => {
    function Example() {
      const [value, set] = useState(["name", "date"]);
      return (
        <ColumnControl
          columns={[
            { key: "name", label: "Nome", required: true },
            { key: "date", label: "Data" },
          ]}
          value={value}
          onChange={set}
        />
      );
    }
    render(<Example />);
    await userEvent.click(screen.getByText("Colunas"));
    expect(screen.getByLabelText("Nome")).toBeDisabled();
    await userEvent.click(screen.getByLabelText("Data"));
    expect(screen.getByLabelText("Data")).not.toBeChecked();
  });
  it("reveals optional long metadata through a keyboard disclosure", async () => {
    render(
      <ContentCell
        title="Identity stays visible"
        metadata="Long editorial metadata"
      />
    );
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByText("Long editorial metadata")).toBeVisible();
  });
  it("combines criteria, resets page and restores a saved fixture view", async () => {
    sessionStorage.clear();
    render(<CollectionDemo />);
    await userEvent.click(
      screen.getByRole("button", { name: "Próxima página" })
    );
    await userEvent.type(screen.getByRole("searchbox"), "Cultura");
    expect(screen.getByText("1–1 de 1")).toBeInTheDocument();
    await userEvent.click(screen.getByText("Mais filtros"));
    await userEvent.click(screen.getByRole("combobox", { name: "Autores" }));
    await userEvent.click(screen.getByRole("option", { name: "Ana Lima" }));
    await userEvent.click(screen.getByRole("option", { name: "Bruno Reis" }));
    fireEvent.change(screen.getByLabelText("De"), {
      target: { value: "2026-09-01" },
    });
    fireEvent.change(screen.getByLabelText("Até"), {
      target: { value: "2026-09-30" },
    });
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Status" }),
      "Publicado"
    );
    expect(screen.getByText("1–1 de 1")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Preferências de visualização" }));
    await userEvent.click(screen.getByText("Gerenciar visões"));
    await userEvent.type(
      screen.getByLabelText("Nome da visão"),
      "Cultura publicada"
    );
    await userEvent.click(screen.getByRole("button", { name: "Salvar visão" }));
    await userEvent.clear(screen.getByRole("searchbox"));
    await userEvent.type(screen.getByRole("searchbox"), "Cultura");
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Status" }),
      "Rascunho"
    );
    expect(screen.getByText("0–0 de 0")).toBeInTheDocument();
    await userEvent.selectOptions(
      screen.getByLabelText("Visões salvas"),
      "view-1"
    );
    expect(screen.getByRole("searchbox")).toHaveValue("Cultura");
    expect(screen.getByText("1–1 de 1")).toBeInTheDocument();
  });
  it("deselects only eligible page rows and uses controlled sorting", async () => {
    const change = vi.fn(),
      sort = vi.fn();
    render(
      <DataTable
        ariaLabel="Items"
        rows={[{ id: "a" }, { id: "locked" }]}
        columns={[{ key: "id", header: "Item", sortable: true }]}
        getRowKey={(r) => r.id}
        sorting={{ key: "id", direction: "ascending" }}
        onSort={sort}
        selection={{
          keys: ["other", "a", "locked"],
          onChange: change,
          getLabel: (r) => r.id,
          isDisabled: (r) => r.id === "locked",
        }}
      />
    );
    await userEvent.click(screen.getByLabelText("Selecionar página"));
    expect(change).toHaveBeenCalledWith(["other", "locked"]);
    await userEvent.click(
      screen.getByRole("button", { name: "Ordenar por Item" })
    );
    expect(sort).toHaveBeenCalledWith("id", "descending");
    expect(screen.getByRole("columnheader", { name: "Item" })).toHaveAttribute(
      "aria-sort",
      "ascending"
    );
  });
  it("archives only current-page selection and clamps the last page", async () => {
    sessionStorage.clear();
    render(<CollectionDemo />);
    await userEvent.click(screen.getByLabelText("Selecionar página"));
    await userEvent.click(
      screen.getByRole("button", { name: "Próxima página" })
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Próxima página" })
    );
    await userEvent.click(screen.getByLabelText("Selecionar página"));
    await userEvent.click(
      screen.getByRole("button", {
        name: "Arquivar selecionados desta página (2)",
      })
    );
    expect(screen.getByText("6–10 de 10")).toBeInTheDocument();
    expect(
      screen.getByText(/5 selecionados \(0 nesta página\)/)
    ).toBeInTheDocument();
  });
  it("ignores malformed storage and persists/restores a valid view after remount", async () => {
    sessionStorage.setItem(
      "hywork.collections.contents.views.v1",
      '{"version":1,"views":[{"criteria":null}]}'
    );
    const { unmount } = render(<CollectionDemo />);
    await userEvent.type(screen.getByRole("searchbox"), "Cultura");
    await userEvent.click(screen.getByRole("button", { name: "Preferências de visualização" }));
    await userEvent.click(screen.getByText("Gerenciar visões"));
    await userEvent.type(screen.getByLabelText("Nome da visão"), "Editorial");
    await userEvent.click(screen.getByRole("button", { name: "Salvar visão" }));
    unmount();
    render(<CollectionDemo />);
    await userEvent.click(screen.getByRole("button", { name: "Preferências de visualização" }));
    await userEvent.click(screen.getByText("Gerenciar visões"));
    await userEvent.selectOptions(
      screen.getByLabelText("Visões salvas"),
      "view-1"
    );
    expect(screen.getByText("1–1 de 1")).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Excluir visão" })
    );
    expect(
      screen.queryByRole("option", { name: "Editorial" })
    ).not.toBeInTheDocument();
  });
});
