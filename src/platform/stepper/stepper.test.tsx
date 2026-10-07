import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";

import { Stepper, type StepperStep } from "./index";

const steps: StepperStep[] = [
  { id: "a", label: "Informações", state: "complete" },
  { id: "b", label: "Público", state: "current" },
  { id: "c", label: "Modelo", state: "upcoming" },
  { id: "d", label: "Revisão", state: "locked" },
];

// jsdom não tem layout: o contraste fica com o Playwright e o addon-a11y.
const violations = async (container: HTMLElement) =>
  (await axe.run(container, { rules: { "color-contrast": { enabled: false } } })).violations;

describe("Stepper — horizontal", () => {
  it("é a forma padrão e preenche os segmentos até o passo atual", () => {
    render(<Stepper steps={steps} />);
    const itens = within(screen.getByRole("list", { name: "Progresso" })).getAllByRole("listitem");
    expect(itens.map((li) => li.hasAttribute("data-filled"))).toEqual([true, true, false, false]);
  });

  it("preenche pela posição: voltar a um passo esvazia os seguintes, mesmo concluídos", () => {
    render(
      <Stepper
        steps={[
          { id: "a", label: "A", state: "current" },
          { id: "b", label: "B", state: "complete" },
        ]}
      />,
    );
    const itens = screen.getAllByRole("listitem");
    expect(itens.map((li) => li.hasAttribute("data-filled"))).toEqual([true, false]);
  });

  it("descreve cada passo para o leitor de tela e marca o atual", () => {
    render(<Stepper steps={steps} />);
    const itens = screen.getAllByRole("listitem");
    expect(itens[0]).toHaveTextContent("Passo 1 de 4: Informações, concluído");
    expect(itens[1]).toHaveAttribute("aria-current", "step");
    expect(itens[3]).toHaveTextContent("Passo 4 de 4: Revisão, bloqueado");
  });

  it("não tem clique, mesmo com onSelect", () => {
    render(<Stepper steps={steps} onSelect={() => undefined} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("passa na auditoria do axe", async () => {
    const { container } = render(<Stepper steps={steps} />);
    expect(await violations(container)).toEqual([]);
  });
});

describe("Stepper — vertical", () => {
  it("sem onSelect, é só leitura", () => {
    render(<Stepper steps={steps} orientation="vertical" />);
    expect(screen.getByRole("list", { name: "Passos" })).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("mostra número nos passos por fazer e ✓ nos concluídos", () => {
    render(<Stepper steps={steps} orientation="vertical" />);
    const itens = screen.getAllByRole("listitem");
    expect(itens[0].querySelector("svg")).not.toBeNull();
    expect(itens[0]).not.toHaveTextContent("1");
    expect(itens[1]).toHaveTextContent("2");
    expect(itens[2]).toHaveTextContent("3");
  });

  it("com onSelect, devolve o id do passo clicado", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Stepper steps={steps} orientation="vertical" onSelect={onSelect} />);
    await user.click(screen.getByRole("button", { name: /Modelo/ }));
    expect(onSelect).toHaveBeenCalledWith("c");
    await user.click(screen.getByRole("button", { name: /Informações/ }));
    expect(onSelect).toHaveBeenLastCalledWith("a");
  });

  it("marca o passo atual com aria-current", () => {
    render(<Stepper steps={steps} orientation="vertical" onSelect={() => undefined} />);
    expect(screen.getByRole("button", { name: /Público/ })).toHaveAttribute("aria-current", "step");
    expect(screen.getByRole("button", { name: /Modelo/ })).not.toHaveAttribute("aria-current");
  });

  it("passo bloqueado tem aria-disabled e não chama onSelect", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Stepper steps={steps} orientation="vertical" onSelect={onSelect} />);
    const bloqueado = screen.getByRole("button", { name: "Revisão, bloqueado" });
    expect(bloqueado).toHaveAttribute("aria-disabled", "true");
    await user.click(bloqueado);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("navega pelo teclado: Tab percorre os passos e Enter seleciona", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Stepper steps={steps} orientation="vertical" onSelect={onSelect} />);
    await user.tab();
    expect(screen.getByRole("button", { name: /Informações/ })).toHaveFocus();
    await user.tab();
    await user.tab();
    expect(screen.getByRole("button", { name: /Modelo/ })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith("c");
  });

  it("aceita outro rótulo acessível para a lista", () => {
    render(<Stepper steps={steps} orientation="vertical" aria-label="Etapas do ciclo" />);
    expect(screen.getByRole("list", { name: "Etapas do ciclo" })).toBeInTheDocument();
  });

  it("passa na auditoria do axe, navegável e só leitura", async () => {
    const navegavel = render(<Stepper steps={steps} orientation="vertical" onSelect={() => undefined} />);
    expect(await violations(navegavel.container)).toEqual([]);
    navegavel.unmount();
    const leitura = render(<Stepper steps={steps} orientation="vertical" />);
    expect(await violations(leitura.container)).toEqual([]);
  });
});
