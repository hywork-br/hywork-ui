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
      </div>,
    );
    expect(await violations(container)).toEqual([]);
  });
});
