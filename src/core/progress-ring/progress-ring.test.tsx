import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import axe from "axe-core";

import { ProgressRing } from "./index";

// jsdom não tem layout: o contraste fica com o Playwright e o addon-a11y.
const violations = async (container: HTMLElement) =>
  (await axe.run(container, { rules: { "color-contrast": { enabled: false } } })).violations;

/** Fração do anel preenchida, lida da geometria do arco. */
const preenchido = (container: HTMLElement) => {
  const arco = container.querySelector("[data-part=indicator]");
  if (!arco) return 0;
  const total = Number(arco.getAttribute("stroke-dasharray"));
  return 1 - Number(arco.getAttribute("stroke-dashoffset")) / total;
};

describe("ProgressRing", () => {
  it("é uma barra de progresso com valor, mínimo e máximo", () => {
    render(<ProgressRing value={68} aria-label="Participação" />);
    const anel = screen.getByRole("progressbar", { name: "Participação" });
    expect(anel).toHaveAttribute("aria-valuenow", "68");
    expect(anel).toHaveAttribute("aria-valuemin", "0");
    expect(anel).toHaveAttribute("aria-valuemax", "100");
    expect(anel).toHaveAttribute("aria-valuetext", "68%");
  });

  it("mostra a porcentagem arredondada no centro, sobre o max da tela", () => {
    const { container } = render(<ProgressRing value={78} max={85} aria-label="Concluídas" />);
    const anel = screen.getByRole("progressbar");
    expect(anel).toHaveTextContent("92%");
    expect(anel).toHaveAttribute("aria-valuenow", "78");
    expect(anel).toHaveAttribute("aria-valuemax", "85");
    expect(preenchido(container)).toBeCloseTo(78 / 85);
  });

  it("limita o valor ao intervalo [0, max]", () => {
    const { container, rerender } = render(<ProgressRing value={140} aria-label="Meta" />);
    const anel = screen.getByRole("progressbar");
    expect(anel).toHaveAttribute("aria-valuenow", "100");
    expect(anel).toHaveTextContent("100%");
    expect(preenchido(container)).toBeCloseTo(1);

    rerender(<ProgressRing value={-5} aria-label="Meta" />);
    expect(anel).toHaveAttribute("aria-valuenow", "0");
    expect(anel).toHaveTextContent("0%");
    expect(preenchido(container)).toBe(0);
  });

  it("com max zero, o valor é zero e o anel fica vazio, sem NaN", () => {
    const { container } = render(<ProgressRing value={3} max={0} aria-label="Sem público" />);
    const anel = screen.getByRole("progressbar");
    expect(anel).toHaveAttribute("aria-valuenow", "0");
    expect(anel).toHaveAttribute("aria-valuemax", "0");
    expect(anel).toHaveTextContent("0%");
    expect(container.innerHTML).not.toContain("NaN");
    expect(container.querySelector("[data-part=indicator]")).toBeNull();
  });

  it("valor que não é número conta como zero", () => {
    const { container } = render(<ProgressRing value={Number.NaN} aria-label="Meta" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
    expect(container.innerHTML).not.toContain("NaN");
  });

  it("aceita rótulo customizado, que o leitor de tela também ouve quando é texto", () => {
    const { rerender } = render(<ProgressRing value={78} max={85} label="78/85" aria-label="Concluídas" />);
    const anel = screen.getByRole("progressbar");
    expect(anel).toHaveTextContent("78/85");
    expect(anel).toHaveAttribute("aria-valuetext", "78/85");

    rerender(
      <ProgressRing value={78} max={85} label={<span data-testid="rotulo">78</span>} aria-label="Concluídas" />,
    );
    expect(screen.getByTestId("rotulo")).toHaveTextContent("78");
    expect(anel).toHaveAttribute("aria-valuetext", "92%");

    rerender(<ProgressRing value={78} max={85} label="78/85" aria-valuetext="78 de 85" aria-label="Concluídas" />);
    expect(anel).toHaveAttribute("aria-valuetext", "78 de 85");
  });

  it("tem nome mesmo sem aria-label, e cede ao aria-labelledby", () => {
    const { rerender } = render(<ProgressRing value={10} />);
    expect(screen.getByRole("progressbar", { name: "Progresso" })).toBeInTheDocument();

    rerender(<ProgressRing value={10} aria-label={undefined} />);
    expect(screen.getByRole("progressbar", { name: "Progresso" })).toBeInTheDocument();

    rerender(
      <div>
        <h2 id="titulo-ring">Autoavaliação</h2>
        <ProgressRing value={10} aria-labelledby="titulo-ring" />
      </div>,
    );
    const anel = screen.getByRole("progressbar", { name: "Autoavaliação" });
    expect(anel).not.toHaveAttribute("aria-label");
  });

  it("tem três tamanhos: 48, 72 e 96px", () => {
    const { rerender } = render(<ProgressRing value={50} size="sm" />);
    const anel = screen.getByRole("progressbar");
    expect(anel).toHaveClass("h-12", "w-12");
    expect(anel.querySelector("svg")).toHaveAttribute("viewBox", "0 0 48 48");

    rerender(<ProgressRing value={50} />);
    expect(anel).toHaveAttribute("data-size", "md");
    expect(anel).toHaveClass("h-[72px]", "w-[72px]");

    rerender(<ProgressRing value={50} size="lg" />);
    expect(anel).toHaveClass("h-24", "w-24");
    expect(anel.querySelector("svg")).toHaveAttribute("viewBox", "0 0 96 96");
  });

  it("desenha só com tokens: arco na tinta da marca, trilha neutra", () => {
    const { container } = render(<ProgressRing value={50} />);
    const [trilha, arco] = container.querySelectorAll("circle");
    expect(trilha).toHaveClass("stroke-muted");
    expect(arco).toHaveClass("stroke-primary-ink", "motion-reduce:!transition-none");
    expect(container.innerHTML).not.toMatch(/#[0-9a-f]{3,8}\b|rgb\(/i);
  });

  it("esconde o desenho e o centro do leitor de tela", () => {
    const { container } = render(<ProgressRing value={50} />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("50%")).toHaveAttribute("aria-hidden", "true");
  });

  it("passa na auditoria do axe, nos três tamanhos e vazio", async () => {
    const { container } = render(
      <div>
        <ProgressRing value={20} size="sm" aria-label="Autoavaliação" />
        <ProgressRing value={78} max={85} label="78/85" aria-label="Concluídas" />
        <ProgressRing value={100} size="lg" aria-label="Calibração" />
        <ProgressRing value={0} max={0} />
      </div>,
    );
    expect(await violations(container)).toEqual([]);
  });
});
