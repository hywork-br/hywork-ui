import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";

import { RadioGroup } from "../../core/radio-group";
import { ChoiceCard } from "./index";

// jsdom não tem layout: o contraste fica com o Playwright e o addon-a11y.
const violations = async (container: HTMLElement) =>
  (await axe.run(container, { rules: { "color-contrast": { enabled: false } } })).violations;

function Lista({ onValueChange = vi.fn(), disabled = false }: { onValueChange?: (v: string) => void; disabled?: boolean }) {
  return (
    <RadioGroup aria-label="Escolher quiz" onValueChange={onValueChange} disabled={disabled}>
      <ChoiceCard value="q1" title="Conhecendo o HyWork" description="8 perguntas" aside="Em 2 trilhas" />
      <ChoiceCard value="q2" title="Segurança" description="12 perguntas" meta="nota mínima 80%" />
      <ChoiceCard value="q3" title="Conduta" description="Publique o quiz para vincular" disabled />
    </RadioGroup>
  );
}

describe("ChoiceCard", () => {
  it("é um rádio com o título como nome e descrição, meta e lateral como descrição", () => {
    render(<Lista />);
    const q1 = screen.getByRole("radio", { name: "Conhecendo o HyWork" });
    expect(q1).toHaveAccessibleDescription("8 perguntas Em 2 trilhas");
    expect(screen.getByRole("radio", { name: "Segurança" })).toHaveAccessibleDescription(
      "12 perguntas nota mínima 80%",
    );
  });

  it("marca ao clicar em qualquer parte do cartão", async () => {
    const onValueChange = vi.fn();
    render(<Lista onValueChange={onValueChange} />);
    await userEvent.click(screen.getByText("Em 2 trilhas"));
    expect(onValueChange).toHaveBeenCalledWith("q1");
    expect(screen.getByRole("radio", { name: "Conhecendo o HyWork" })).toBeChecked();
  });

  it("as setas mudam e marcam, e pulam o desabilitado", async () => {
    const onValueChange = vi.fn();
    render(<Lista onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole("radio", { name: "Conhecendo o HyWork" }));
    await userEvent.keyboard("{ArrowDown}");
    await vi.waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith("q2"));
    await userEvent.keyboard("{ArrowDown}");
    await vi.waitFor(() =>
      expect(screen.getByRole("radio", { name: "Conhecendo o HyWork" })).toHaveFocus(),
    );
    expect(screen.getByRole("radio", { name: "Conduta" })).not.toBeChecked();
  });

  it("opção desabilitada não marca, nem pelo cartão", async () => {
    const onValueChange = vi.fn();
    render(<Lista onValueChange={onValueChange} />);
    await userEvent.click(screen.getByText("Publique o quiz para vincular"));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole("radio", { name: "Conduta" })).toBeDisabled();
  });

  it("o grupo desabilitado desabilita todos os cartões", async () => {
    const onValueChange = vi.fn();
    render(<Lista onValueChange={onValueChange} disabled />);
    await userEvent.click(screen.getByText("Conhecendo o HyWork"));
    expect(onValueChange).not.toHaveBeenCalled();
    for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled();
  });

  it("aria-label da tela troca o nome, e o aria-describedby dela se soma", () => {
    render(
      <>
        <p id="nota">Também nomeia um avaliador</p>
        <RadioGroup aria-label="Público">
          <ChoiceCard
            value="specific"
            title="Pessoas específicas"
            description="O RH escolhe"
            aria-label="Público: pessoas específicas"
            aria-describedby="nota"
          />
        </RadioGroup>
      </>,
    );
    const radio = screen.getByRole("radio", { name: "Público: pessoas específicas" });
    expect(radio).toHaveAccessibleDescription("O RH escolhe Também nomeia um avaliador");
  });

  it("className vai para o cartão; o ícone fica fora da árvore de acessibilidade", () => {
    render(
      <RadioGroup aria-label="Tipo">
        <ChoiceCard value="course" title="Curso" icon={<svg data-testid="icone" />} className="h-full" />
      </RadioGroup>,
    );
    const radio = screen.getByRole("radio", { name: "Curso" });
    expect(radio.closest("label")).toHaveClass("h-full");
    expect(screen.getByTestId("icone").parentElement).toHaveAttribute("aria-hidden", "true");
  });

  it("passa na auditoria do axe", async () => {
    const { container } = render(<Lista />);
    expect(await violations(container)).toEqual([]);
  });
});
