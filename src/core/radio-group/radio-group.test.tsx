import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";

import { Label } from "../label";
import { RadioGroup, RadioGroupItem } from "./index";

const opcoes = [
  ["todos", "Todos"],
  ["estrutura", "Por estrutura"],
  ["lista", "Lista específica"],
] as const;

function Grupo(props: React.ComponentProps<typeof RadioGroup> & { desabilitar?: string }) {
  const { desabilitar, ...rest } = props;
  return (
    <RadioGroup aria-label="Público" {...rest}>
      {opcoes.map(([v, l]) => (
        <div key={v} className="flex items-center gap-2">
          <RadioGroupItem value={v} id={v} disabled={v === desabilitar} />
          <Label htmlFor={v}>{l}</Label>
        </div>
      ))}
    </RadioGroup>
  );
}

function Controlado({ onValueChange, ...props }: React.ComponentProps<typeof Grupo>) {
  const [valor, setValor] = React.useState(props.value ?? "");
  return (
    <Grupo
      {...props}
      value={valor}
      onValueChange={(v) => {
        setValor(v);
        onValueChange?.(v);
      }}
    />
  );
}

const radio = (name: string) => screen.getByRole("radio", { name });
// O Radix move o foco num setTimeout; a marcação vem no seguinte.
const esperarFoco = () => act(() => new Promise((r) => setTimeout(r, 10)));

// jsdom não tem layout: o contraste fica com o Playwright e o addon-a11y.
const violations = async (element: HTMLElement) =>
  (await axe.run(element, { rules: { "color-contrast": { enabled: false } } })).violations;

describe("RadioGroup — setas mudam e marcam", () => {
  it("controlado: a seta rápida move o foco e marca a opção", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Controlado value="todos" onValueChange={onValueChange} />);
    await user.tab();
    expect(radio("Todos")).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    await esperarFoco();
    expect(radio("Por estrutura")).toHaveFocus();
    expect(radio("Por estrutura")).toHaveAttribute("aria-checked", "true");
    expect(onValueChange).toHaveBeenLastCalledWith("estrutura");
    await user.keyboard("{ArrowUp}");
    await esperarFoco();
    expect(radio("Todos")).toHaveAttribute("aria-checked", "true");
    expect(onValueChange).toHaveBeenLastCalledWith("todos");
  });

  it("não controlado: a seta rápida marca também", async () => {
    const user = userEvent.setup();
    render(<Grupo defaultValue="todos" />);
    await user.tab();
    await user.keyboard("{ArrowRight}");
    await esperarFoco();
    expect(radio("Por estrutura")).toHaveFocus();
    expect(radio("Por estrutura")).toHaveAttribute("aria-checked", "true");
  });

  it("pula a opção desabilitada e marca a seguinte", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Controlado value="todos" desabilitar="estrutura" onValueChange={onValueChange} />);
    await user.tab();
    await user.keyboard("{ArrowDown}");
    await esperarFoco();
    expect(radio("Lista específica")).toHaveFocus();
    expect(onValueChange).toHaveBeenLastCalledWith("lista");
  });

  it("o Tab entra num grupo vazio sem marcar nada", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Controlado onValueChange={onValueChange} />);
    await user.tab();
    await esperarFoco();
    expect(radio("Todos")).toHaveFocus();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("chama o onKeyDown da tela, que continua valendo", async () => {
    const user = userEvent.setup();
    const onKeyDown = vi.fn();
    render(<Grupo defaultValue="todos" onKeyDown={onKeyDown} />);
    await user.tab();
    await user.keyboard("{ArrowDown}");
    await esperarFoco();
    expect(onKeyDown).toHaveBeenCalled();
    expect(radio("Por estrutura")).toHaveAttribute("aria-checked", "true");
  });

  it("passa na auditoria do axe", async () => {
    const { container } = render(<Grupo defaultValue="todos" desabilitar="lista" />);
    expect(await violations(container)).toEqual([]);
  });
});
