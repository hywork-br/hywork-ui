import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { PageTitle } from "./index";

describe("PageTitle", () => {
  it("expõe o título como heading de primeiro nível", () => {
    render(<PageTitle title="Gestão de usuários" />);
    expect(screen.getByRole("heading", { level: 1, name: "Gestão de usuários" })).toBeInTheDocument();
  });

  it("aceita descer de nível quando a página já tem um h1", () => {
    render(<PageTitle title="Integrações" as="h2" />);
    expect(screen.getByRole("heading", { level: 2, name: "Integrações" })).toBeInTheDocument();
  });

  it("mostra a descrição quando existe", () => {
    render(<PageTitle title="Usuários" description="Administre acessos." />);
    expect(screen.getByText("Administre acessos.")).toBeInTheDocument();
  });

  it("acomoda as ações da página", () => {
    render(<PageTitle title="Usuários" actions={<button>Convidar</button>} />);
    expect(screen.getByRole("button", { name: "Convidar" })).toBeInTheDocument();
  });
});
