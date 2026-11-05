import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import axe from "axe-core";

import { Progress } from "./index";

// jsdom não tem layout: o contraste fica com o Playwright e o addon-a11y.
const violations = async (container: HTMLElement) =>
  (await axe.run(container, { rules: { "color-contrast": { enabled: false } } })).violations;

describe("Progress", () => {
  it("expõe o valor ao leitor de tela", () => {
    render(<Progress aria-label="Importação" value={45} />);
    const barra = screen.getByRole("progressbar", { name: "Importação" });
    expect(barra).toHaveAttribute("aria-valuenow", "45");
    expect(barra).toHaveAttribute("aria-valuemin", "0");
    expect(barra).toHaveAttribute("aria-valuemax", "100");
    expect(barra).toHaveAttribute("aria-valuetext", "45%");
    expect(barra).toHaveAttribute("data-state", "loading");
  });

  it("marca o fim como concluído", () => {
    render(<Progress aria-label="Importação" value={100} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("data-state", "complete");
  });

  it("sem valor, é indeterminado e não anuncia número", () => {
    render(<Progress aria-label="Importação" />);
    const barra = screen.getByRole("progressbar");
    expect(barra).not.toHaveAttribute("aria-valuenow");
    expect(barra).toHaveAttribute("data-state", "indeterminate");
  });

  it("o aria que a tela passa à mão continua valendo", () => {
    render(<Progress aria-label="Importação" value={45} aria-valuenow={7} aria-valuetext="7 de 15" />);
    const barra = screen.getByRole("progressbar");
    expect(barra).toHaveAttribute("aria-valuenow", "7");
    expect(barra).toHaveAttribute("aria-valuetext", "7 de 15");
  });

  it("posiciona o indicador como antes", () => {
    const { container } = render(<Progress aria-label="Importação" value={45} />);
    const indicador = container.querySelector<HTMLElement>("[role=progressbar] > div");
    expect(indicador?.style.transform).toBe("translateX(-55%)");
  });

  it("passa na auditoria do axe", async () => {
    const { container } = render(
      <div>
        <Progress aria-label="Importação" value={0} />
        <Progress aria-label="Envio" value={60} />
        <Progress aria-label="Carga" />
        <Progress aria-label="Nota final" value={84} marker={72} markerLabel="Autoavaliação: 72%" />
        <Progress aria-label="Comunicação" value={38} tone="attention" marker={50} />
      </div>,
    );
    expect(await violations(container)).toEqual([]);
  });
});

const marca = (container: HTMLElement) => container.querySelector<HTMLElement>("[data-part=marker]");

describe("Progress — marca de referência", () => {
  it("sem marker, a barra é a de antes: sem marca, sem descrição, indicador como filho direto", () => {
    const { container } = render(<Progress aria-label="Importação" value={45} />);
    const barra = screen.getByRole("progressbar");
    expect(marca(container)).toBeNull();
    expect(barra).not.toHaveAttribute("aria-describedby");
    expect(barra).not.toHaveAttribute("data-tone");
    expect(barra).toHaveClass("overflow-hidden", "bg-primary-ink/20");
    expect(barra.children).toHaveLength(1);
    expect(barra.firstElementChild).toHaveClass("bg-primary-ink");
  });

  it("desenha a marca na posição do marker, mais alta que a barra, fora da árvore", () => {
    const { container } = render(<Progress aria-label="Nota final" value={84} marker={72} />);
    const m = marca(container)!;
    expect(m.style.left).toBe("72%");
    expect(m).toHaveAttribute("aria-hidden", "true");
    expect(m).toHaveClass("absolute", "-inset-y-1", "w-0.5", "-translate-x-1/2", "bg-foreground");
    // A raiz deixa a marca passar; quem corta o preenchimento é a caixa interna.
    expect(screen.getByRole("progressbar")).toHaveClass("overflow-visible");
    expect(screen.getByRole("progressbar")).not.toHaveClass("overflow-hidden");
    const clip = container.querySelector("[data-part=clip]")!;
    expect(clip).toHaveClass("overflow-hidden");
    expect(clip.firstElementChild).toHaveStyle({ transform: "translateX(-16%)" });
  });

  it("limita a marca a 0–100, e marker inválido não desenha nada", () => {
    const { container, rerender } = render(<Progress aria-label="P" value={10} marker={130} />);
    expect(marca(container)!.style.left).toBe("100%");
    rerender(<Progress aria-label="P" value={10} marker={-20} />);
    expect(marca(container)!.style.left).toBe("0%");
    rerender(<Progress aria-label="P" value={10} marker={Number.NaN} />);
    expect(marca(container)).toBeNull();
    expect(screen.getByRole("progressbar")).not.toHaveAttribute("aria-describedby");
  });

  it("o leitor de tela ouve o que a marca é, pela descrição da barra", () => {
    const { rerender } = render(
      <Progress aria-label="Nota final" value={84} marker={72} markerLabel="Autoavaliação: 72%" />,
    );
    const barra = screen.getByRole("progressbar", { name: "Nota final" });
    expect(barra).toHaveAccessibleDescription("Autoavaliação: 72%");
    expect(barra).toHaveAttribute("aria-valuenow", "84");

    rerender(<Progress aria-label="Nota final" value={84} marker={72.5} />);
    expect(barra).toHaveAccessibleDescription("Referência: 72,5%");
  });

  it("soma a descrição da marca à que a tela já passa", () => {
    render(
      <>
        <p id="ajuda">Média ponderada</p>
        <Progress aria-label="Nota final" value={84} marker={72} markerLabel="Autoavaliação: 72%" aria-describedby="ajuda" />
      </>,
    );
    expect(screen.getByRole("progressbar")).toHaveAccessibleDescription("Média ponderada Autoavaliação: 72%");
  });
});

describe("Progress — tom de atenção", () => {
  it("pinta o preenchimento e a trilha na cor de aviso", () => {
    const { container } = render(<Progress aria-label="Comunicação" value={38} tone="attention" />);
    const barra = screen.getByRole("progressbar");
    expect(barra).toHaveAttribute("data-tone", "attention");
    expect(barra).toHaveClass("bg-warning/20");
    expect(barra).not.toHaveClass("bg-primary-ink/20");
    expect(barra.firstElementChild).toHaveClass("bg-warning");
    expect(container.innerHTML).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i);
  });

  it("atenção e marca juntas", () => {
    const { container } = render(<Progress aria-label="Comunicação" value={38} tone="attention" marker={50} />);
    expect(container.querySelector("[data-part=clip]")!.firstElementChild).toHaveClass("bg-warning");
    expect(marca(container)!.style.left).toBe("50%");
  });
});
