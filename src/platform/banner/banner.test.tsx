import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import axe from "axe-core";

import { Banner } from "./index";

// jsdom não tem layout: o contraste fica com o teste de tokens e o Playwright.
const violations = async (container: HTMLElement) =>
  (await axe.run(container, { rules: { "color-contrast": { enabled: false } } })).violations;

describe("Banner", () => {
  it("é uma região nomeada pelo título, com heading h2", () => {
    render(<Banner title="Novo: módulo People" description="Agende uma conversa." />);
    const region = screen.getByRole("region", { name: "Novo: módulo People" });
    expect(region.tagName).toBe("SECTION");
    expect(screen.getByRole("heading", { level: 2, name: "Novo: módulo People" })).toBeInTheDocument();
  });

  it("aceita mudar o nível do heading", () => {
    render(<Banner title="Módulo People" titleAs="h3" />);
    expect(screen.getByRole("heading", { level: 3, name: "Módulo People" })).toBeInTheDocument();
  });

  it("voz da Hywork: invertido, no laranja forte com texto branco, sem borda", () => {
    render(<Banner tone="vendor" title="Novo: módulo People" description="Frase." />);
    const region = screen.getByRole("region");
    expect(region).toHaveClass("bg-vendor-strong", "text-vendor-foreground");
    expect(region).not.toHaveClass("border");
    // a frase herda o branco: o cinza de apoio some sobre o laranja
    expect(screen.getByText("Frase.")).not.toHaveClass("text-muted-foreground");
  });

  it("padrão: a moldura do card, com a frase em cinza de apoio", () => {
    render(<Banner title="Módulo People" description="Frase." />);
    expect(screen.getByRole("region")).toHaveClass("border", "border-border", "bg-card");
    expect(screen.getByText("Frase.")).toHaveClass("text-muted-foreground");
  });

  it("o ícone é decorativo e as ações ficam acessíveis", () => {
    render(
      <Banner
        tone="vendor"
        title="Novo: módulo People"
        media={<svg data-testid="icone" />}
        actions={<button type="button">Agendar</button>}
      />,
    );
    expect(screen.getByTestId("icone").parentElement).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("button", { name: "Agendar" })).toBeInTheDocument();
  });

  it("no celular, o ícone sobe e as ações ocupam a largura com alvo de 44px", () => {
    render(
      <Banner title="T" media={<svg data-testid="icone" />} actions={<button type="button">Agendar</button>} />,
    );
    const actions = screen.getByRole("button").parentElement;
    expect(actions).toHaveClass("max-sm:w-full", "max-sm:[&>*]:min-h-11", "max-sm:[&>*]:whitespace-normal");
    // ícone em cima do título até 640px; ao lado dele a partir daí
    expect(screen.getByTestId("icone").parentElement?.parentElement).toHaveClass("flex-col", "sm:flex-row");
  });

  it("passa na auditoria do axe", async () => {
    const { container } = render(
      <div>
        <Banner
          tone="vendor"
          title="Novo: módulo People"
          description="Agende uma conversa."
          media={<svg aria-hidden="true" />}
          actions={<button type="button">Agendar</button>}
        />
        <Banner title="Módulo People" description="Na fila." />
      </div>,
    );
    expect(await violations(container)).toEqual([]);
  });
});
