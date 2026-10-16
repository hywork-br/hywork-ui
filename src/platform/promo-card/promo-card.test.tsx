import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import axe from "axe-core";

import { PromoCard } from "./index";

// jsdom não tem layout: o contraste fica com o teste de tokens e o Playwright.
const violations = async (container: HTMLElement) =>
  (await axe.run(container, { rules: { "color-contrast": { enabled: false } } })).violations;

describe("PromoCard", () => {
  it("é um artigo nomeado pelo título, com heading h3", () => {
    render(<PromoCard title="HyTalks" description="Conversas com quem faz RH." />);
    const card = screen.getByRole("article", { name: "HyTalks" });
    expect(card.tagName).toBe("ARTICLE");
    expect(screen.getByRole("heading", { level: 3, name: "HyTalks" })).toBeInTheDocument();
  });

  it("aceita mudar o nível do heading", () => {
    render(<PromoCard title="Blog" titleAs="h4" />);
    expect(screen.getByRole("heading", { level: 4, name: "Blog" })).toBeInTheDocument();
  });

  it("voz da Hywork: invertido, no laranja forte com texto branco, sem borda", () => {
    render(<PromoCard tone="vendor" title="Novo: módulo People" description="Frase." eyebrow="Módulo" />);
    const card = screen.getByRole("article");
    expect(card).toHaveClass("bg-vendor-strong", "text-vendor-foreground");
    expect(card).not.toHaveClass("border");
    // frase e rótulo herdam o branco: o cinza de apoio some sobre o laranja
    expect(screen.getByText("Frase.")).not.toHaveClass("text-muted-foreground");
    expect(screen.getByText("Módulo")).not.toHaveClass("text-muted-foreground");
  });

  it("padrão: a moldura do card, com frase e rótulo em cinza de apoio", () => {
    render(<PromoCard title="Blog" description="Frase." eyebrow="Blog" />);
    expect(screen.getByRole("article")).toHaveClass("border", "border-border", "bg-card");
    expect(screen.getByText("Frase.")).toHaveClass("text-muted-foreground");
  });

  it("a ação ocupa a largura e fica no pé, com alvo de 40px (44px no celular)", () => {
    render(<PromoCard title="T" actions={<button type="button">Ver episódios</button>} />);
    const actions = screen.getByRole("button", { name: "Ver episódios" }).parentElement;
    expect(actions).toHaveClass("mt-auto", "[&>*]:w-full", "[&>*]:min-h-10", "max-sm:[&>*]:min-h-11");
    expect(screen.getByRole("article")).toHaveClass("h-full", "flex-col");
  });

  it("compacto: respiro de 16px e ícone de 32px, para o pé do menu", () => {
    render(<PromoCard size="compact" title="T" media={<svg data-testid="icone" />} />);
    expect(screen.getByRole("article")).toHaveClass("p-4");
    expect(screen.getByTestId("icone").parentElement).toHaveClass("h-8", "w-8");
  });

  it("o ícone é decorativo", () => {
    render(<PromoCard title="T" media={<svg data-testid="icone" />} />);
    expect(screen.getByTestId("icone").parentElement).toHaveAttribute("aria-hidden", "true");
  });

  it("sem onDismiss não há X; com ele, o X tem nome e chama a função", () => {
    const { rerender } = render(<PromoCard title="T" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();

    const onDismiss = vi.fn();
    rerender(<PromoCard title="T" onDismiss={onDismiss} dismissLabel="Dispensar convite" />);
    const x = screen.getByRole("button", { name: "Dispensar convite" });
    expect(x).toHaveClass("h-10", "w-10");
    fireEvent.click(x);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('o X chama-se "Dispensar" por padrão', () => {
    render(<PromoCard title="T" onDismiss={() => {}} />);
    expect(screen.getByRole("button", { name: "Dispensar" })).toBeInTheDocument();
  });

  it("passa na auditoria do axe", async () => {
    const { container } = render(
      <div>
        <PromoCard
          tone="vendor"
          size="compact"
          title="Novo: módulo People"
          description="Agende uma conversa."
          media={<svg aria-hidden="true" />}
          eyebrow="Módulo"
          actions={<button type="button">Agendar</button>}
          onDismiss={() => {}}
        />
        <PromoCard title="HyTalks" description="Episódio novo." eyebrow="Podcast" />
      </div>,
    );
    expect(await violations(container)).toEqual([]);
  });
});
