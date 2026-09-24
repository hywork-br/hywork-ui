import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ListPagination } from "./index";

const base = { perPage: 20, total: 143, onPageChange: () => undefined };

describe("ListPagination", () => {
  it("mostra o intervalo da página atual", () => {
    render(<ListPagination {...base} page={2} />);
    expect(screen.getByText("21–40")).toBeInTheDocument();
    expect(screen.getByText("143")).toBeInTheDocument();
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
});
