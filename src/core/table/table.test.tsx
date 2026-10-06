import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "./index";

function Tabela({ striped, selecionada }: { striped?: boolean; selecionada?: number }) {
  return (
    <Table striped={striped} aria-label="Pessoas">
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {["Ana", "Bruno", "Carla"].map((nome, i) => (
          <TableRow key={nome} data-state={i === selecionada ? "selected" : undefined}>
            <TableCell>{nome}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Total</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}

const linha = (texto: string) => screen.getByText(texto).closest("tr")!;

describe("Table", () => {
  it("lista as linhas do corpo por padrão", () => {
    render(<Tabela />);
    expect(screen.getByRole("table")).toHaveAttribute("data-striped");
    for (const nome of ["Ana", "Bruno", "Carla"]) expect(linha(nome)).toHaveClass("even:bg-hw-table-stripe");
  });

  it("não lista cabeçalho nem rodapé", () => {
    render(<Tabela />);
    const [cabecalho] = within(screen.getByRole("table")).getAllByRole("row");
    expect(cabecalho).not.toHaveClass("even:bg-hw-table-stripe");
    expect(cabecalho).not.toHaveClass("hover:bg-hw-table-hover");
    expect(linha("Total")).not.toHaveClass("even:bg-hw-table-stripe");
  });

  it("desliga as listras com striped={false}, mantendo cursor e seleção", () => {
    render(<Tabela striped={false} />);
    expect(screen.getByRole("table")).not.toHaveAttribute("data-striped");
    expect(linha("Bruno")).not.toHaveClass("even:bg-hw-table-stripe");
    expect(linha("Bruno")).toHaveClass("hover:bg-hw-table-hover", "data-[state=selected]:bg-hw-table-selected");
  });

  it("marca a linha selecionada com o token próprio, distinto do cursor", () => {
    render(<Tabela selecionada={1} />);
    expect(linha("Bruno")).toHaveAttribute("data-state", "selected");
    expect(linha("Bruno")).toHaveClass("data-[state=selected]:bg-hw-table-selected");
    expect(linha("Bruno").className).not.toMatch(/bg-hw-table-surface/);
  });
});
