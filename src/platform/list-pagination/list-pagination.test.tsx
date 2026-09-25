import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ListPagination } from "./index";

const base = { perPage: 20, total: 143, onPageChange: () => undefined };

describe("ListPagination", () => {
  it("mostra o intervalo da página atual", () => {
    render(<ListPagination {...base} page={2} itemLabel="colaboradores" />);
    expect(screen.getByText("21–40")).toBeInTheDocument();
    // O total fica solto no parágrafo, então a asserção é sobre a frase inteira.
    expect(screen.getByText(/de 143 colaboradores/)).toBeInTheDocument();
  });

  it("limita o intervalo ao total na última página", () => {
    render(<ListPagination {...base} page={8} />);
    expect(screen.getByText("141–143")).toBeInTheDocument();
  });

  it("desabilita anterior na primeira página", () => {
    render(<ListPagination {...base} page={1} />);
    expect(screen.getByRole("button", { name: "Página anterior" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Próxima página" })).toBeEnabled();
  });

  it("desabilita próxima na última página", () => {
    render(<ListPagination {...base} page={8} />);
    expect(screen.getByRole("button", { name: "Próxima página" })).toBeDisabled();
  });

  it("não mostra controles quando tudo cabe em uma página", () => {
    render(<ListPagination {...base} total={12} page={1} />);
    expect(screen.queryByRole("button", { name: "Próxima página" })).not.toBeInTheDocument();
  });

  it("não renderiza nada sem resultados", () => {
    const { container } = render(<ListPagination {...base} total={0} page={1} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("avança e retrocede uma página por vez", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<ListPagination {...base} page={3} onPageChange={onPageChange} />);
    await user.click(screen.getByRole("button", { name: "Próxima página" }));
    expect(onPageChange).toHaveBeenCalledWith(4);
    await user.click(screen.getByRole("button", { name: "Página anterior" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("corrige uma página fora do intervalo", () => {
    render(<ListPagination {...base} page={99} />);
    expect(screen.getByText("141–143")).toBeInTheDocument();
  });

  it("mostra a página atual quando o servidor não manda contagem", () => {
    render(<ListPagination page={3} hasNext onPageChange={() => undefined} />);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.queryByText(/de \d+/)).not.toBeInTheDocument();
  });

  it("na forma sequencial, a próxima obedece a hasNext", () => {
    const { rerender } = render(
      <ListPagination page={2} hasNext onPageChange={() => undefined} />,
    );
    expect(screen.getByRole("button", { name: "Próxima página" })).toBeEnabled();
    rerender(<ListPagination page={2} hasNext={false} onPageChange={() => undefined} />);
    expect(screen.getByRole("button", { name: "Próxima página" })).toBeDisabled();
  });

  it("some quando a listagem sequencial cabe numa página só", () => {
    const { container } = render(
      <ListPagination page={1} hasNext={false} onPageChange={() => undefined} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
