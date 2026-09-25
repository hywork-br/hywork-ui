import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SearchInput } from "./index";

describe("SearchInput", () => {
  it("usa o placeholder como rótulo acessível quando nenhum é dado", () => {
    render(<SearchInput value="" onChange={() => undefined} placeholder="Buscar colaborador" />);
    expect(screen.getByRole("searchbox", { name: "Buscar colaborador" })).toBeInTheDocument();
  });

  it("devolve o texto digitado, não o evento", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} />);
    await user.type(screen.getByRole("searchbox"), "a");
    expect(onChange).toHaveBeenCalledWith("a");
  });

  it("esconde o botão de limpar enquanto o campo está vazio", () => {
    render(<SearchInput value="" onChange={() => undefined} />);
    expect(screen.queryByRole("button", { name: "Limpar busca" })).not.toBeInTheDocument();
  });

  it("limpa o campo pelo botão", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchInput value="Ana" onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Limpar busca" }));
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("dispensa o botão de limpar quando a tela pede", () => {
    render(<SearchInput value="Ana" onChange={() => undefined} clearable={false} />);
    expect(screen.queryByRole("button", { name: "Limpar busca" })).not.toBeInTheDocument();
  });
});
