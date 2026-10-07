import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import axe from "axe-core";

import { StatCard } from "./index";

// jsdom não tem layout: o contraste fica com o Playwright e o addon-a11y.
const violations = async (container: HTMLElement) =>
  (await axe.run(container, { rules: { "color-contrast": { enabled: false } } })).violations;

describe("StatCard", () => {
  it("agrupa o cartão sob o nome do rótulo", () => {
    render(<StatCard label="Participação" value="68%" note="41 de 60 iniciaram" />);
    const cartao = screen.getByRole("group", { name: "Participação" });
    expect(cartao).toHaveTextContent("68%");
    expect(cartao).toHaveTextContent("41 de 60 iniciaram");
  });

  it("não renderiza nota nem variação quando não vêm", () => {
    render(<StatCard label="Pendências" value="12" />);
    expect(screen.getByRole("group").textContent).toBe("Pendências12");
  });

  it("aceita conteúdo livre no valor", () => {
    render(<StatCard label="Média" value={<span data-testid="valor">4,1</span>} />);
    expect(screen.getByTestId("valor")).toHaveTextContent("4,1");
  });

  it("anuncia o tom da variação, que a cor sozinha não diz", () => {
    const { rerender } = render(
      <StatCard label="Média" value="4,1" delta={{ value: "+0,2", tone: "positive" }} />,
    );
    expect(screen.getByText("+0,2")).toHaveTextContent("Variação favorável: +0,2");
    expect(screen.getByText("+0,2")).toHaveAttribute("data-tone", "positive");

    rerender(<StatCard label="Média" value="4,1" delta={{ value: "−3 p.p.", tone: "negative" }} />);
    expect(screen.getByText("−3 p.p.")).toHaveTextContent("Variação desfavorável: −3 p.p.");

    rerender(<StatCard label="Média" value="4,1" delta={{ value: "estável", tone: "neutral" }} />);
    expect(screen.getByText("estável")).toHaveTextContent("Variação: estável");
  });

  it("dá a cada tom da variação o seu par de cores", () => {
    const { rerender } = render(<StatCard label="M" value="1" delta={{ value: "+1", tone: "positive" }} />);
    expect(screen.getByText("+1").className).toContain("text-hw-status-success");
    rerender(<StatCard label="M" value="1" delta={{ value: "+1", tone: "negative" }} />);
    expect(screen.getByText("+1").className).toContain("text-hw-status-danger");
  });

  it("destaca o cartão inteiro no tom de atenção", () => {
    const { rerender } = render(<StatCard label="Pendências" value="12" note="Sem etapa iniciada" />);
    const cartao = screen.getByRole("group");
    expect(cartao).toHaveAttribute("data-tone", "default");
    expect(cartao.className).not.toContain("bg-warning");

    rerender(<StatCard label="Pendências" value="12" note="Sem etapa iniciada" tone="attention" />);
    expect(cartao).toHaveAttribute("data-tone", "attention");
    expect(cartao.className).toContain("bg-warning/10");
    expect(screen.getByText("Sem etapa iniciada").className).toContain("text-hw-status-warning");
  });

  it("esconde o ícone do leitor de tela", () => {
    render(<StatCard label="Participação" value="68%" icon={<svg data-testid="icone" />} />);
    expect(screen.getByTestId("icone").parentElement).toHaveAttribute("aria-hidden", "true");
  });

  it("passa na auditoria do axe, no padrão e em atenção", async () => {
    const { container } = render(
      <div>
        <StatCard label="Participação" value="68%" note="41 de 60" icon={<svg />} delta={{ value: "+5 p.p.", tone: "positive" }} />
        <StatCard label="Pendências" value="12" note="Sem etapa iniciada" tone="attention" />
      </div>,
    );
    expect(await violations(container)).toEqual([]);
  });
});
