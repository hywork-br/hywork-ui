import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";

import { BarList, type BarListItem } from "./index";

// jsdom não tem layout: o contraste e a quebra de linha ficam com o navegador.
const violations = async (container: HTMLElement) =>
  (await axe.run(container, { rules: { "color-contrast": { enabled: false } } })).violations;

/** Larguras das barras, na ordem das linhas. */
const larguras = (container: HTMLElement) =>
  [...container.querySelectorAll<HTMLElement>("[data-part=bar]")].map((barra) => barra.style.width);

const areas: BarListItem[] = [
  { id: "com", label: "Comercial", value: 78, max: 80, valueLabel: "98% · 78 de 80" },
  { id: "fin", label: "Financeiro", value: 30, max: 40, valueLabel: "75% · 30 de 40" },
  { id: "rh", label: "Pessoas", value: 9, max: 18, valueLabel: "50% · 9 de 18" },
];

describe("BarList", () => {
  it("é uma lista, com uma linha por item e o nome que a tela dá", () => {
    render(<BarList items={areas} aria-label="Adesão por área" />);
    const lista = screen.getByRole("list", { name: "Adesão por área" });
    const linhas = within(lista).getAllByRole("listitem");
    expect(linhas).toHaveLength(3);
    expect(linhas[0]).toHaveTextContent("Comercial 98% · 78 de 80");
  });

  it("usa o max de cada item", () => {
    const { container } = render(<BarList items={areas} />);
    expect(larguras(container)).toEqual(["97.5%", "75%", "50%"]);
  });

  it("sem max no item, usa o max da lista", () => {
    const { container } = render(
      <BarList
        max={200}
        items={[
          { id: "a", label: "A", value: 50 },
          { id: "b", label: "B", value: 150, max: 300 },
        ]}
      />,
    );
    expect(larguras(container)).toEqual(["25%", "50%"]);
  });

  it("sem max nenhum, o maior valor ocupa a linha inteira", () => {
    const { container } = render(
      <BarList
        items={[
          { id: "a", label: "Não iniciada", value: 10 },
          { id: "b", label: "Em andamento", value: 40 },
          { id: "c", label: "Concluída", value: 20 },
        ]}
      />,
    );
    expect(larguras(container)).toEqual(["25%", "100%", "50%"]);
  });

  it("limita a barra a 0–100%", () => {
    const { container } = render(
      <BarList
        max={100}
        items={[
          { id: "a", label: "Acima", value: 130 },
          { id: "b", label: "Abaixo", value: -20 },
        ]}
      />,
    );
    expect(larguras(container)).toEqual(["100%", "0%"]);
  });

  it("max zero, valores zerados ou inválidos dão barra vazia, sem NaN", () => {
    const { container } = render(
      <BarList
        items={[
          { id: "a", label: "Max zero", value: 5, max: 0 },
          { id: "b", label: "Zerado", value: 0 },
          { id: "c", label: "Inválido", value: Number.NaN, max: 10 },
        ]}
      />,
    );
    expect(larguras(container)).toEqual(["0%", "0%", "0%"]);
    expect(container.innerHTML).not.toContain("NaN");

    const tudoZero = render(<BarList items={[{ id: "z", label: "Z", value: 0 }]} />);
    expect(larguras(tudoZero.container)).toEqual(["0%"]);
  });

  it("o max zero da lista também dá barra vazia", () => {
    const { container } = render(<BarList max={0} items={[{ id: "a", label: "A", value: 5 }]} />);
    expect(larguras(container)).toEqual(["0%"]);
  });

  it("sem itens, a lista fica vazia", () => {
    render(<BarList items={[]} aria-label="Respostas" />);
    expect(screen.getByRole("list", { name: "Respostas" })).toBeEmptyDOMElement();
  });

  it("sem valueLabel, mostra o valor; com null, não mostra nada", () => {
    render(
      <BarList
        items={[
          { id: "a", label: "Respostas", value: 1234 },
          { id: "b", label: "Sem texto", value: 3, valueLabel: null },
        ]}
      />,
    );
    const [comValor, semValor] = screen.getAllByRole("listitem");
    expect(comValor).toHaveTextContent("Respostas 1.234");
    expect(semValor.textContent?.trim()).toBe("Sem texto");
  });

  it("a barra é desenho: fica escondida do leitor de tela", () => {
    const { container } = render(<BarList items={areas} />);
    for (const barra of container.querySelectorAll("[data-part=bar]"))
      expect(barra.parentElement).toHaveAttribute("aria-hidden", "true");
  });

  it("só a linha com onSelect vira botão", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<BarList items={[{ ...areas[0], onSelect }, areas[1]]} />);
    const botoes = screen.getAllByRole("button");
    expect(botoes).toHaveLength(1);
    expect(botoes[0]).toHaveAccessibleName("Comercial 98% · 78 de 80");
    expect(botoes[0]).toHaveAttribute("type", "button");
    await user.click(botoes[0]);
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it("navega pelo teclado: Tab percorre as linhas clicáveis, Enter e Espaço selecionam", async () => {
    const user = userEvent.setup();
    const escolhas: string[] = [];
    const itens = areas.map((item) => ({ ...item, onSelect: () => escolhas.push(item.id) }));
    render(<BarList items={itens} />);

    await user.tab();
    expect(screen.getByRole("button", { name: /Comercial/ })).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.tab();
    expect(screen.getByRole("button", { name: /Financeiro/ })).toHaveFocus();
    await user.keyboard(" ");
    expect(escolhas).toEqual(["com", "fin"]);
  });

  it("a linha clicável tem anel de foco visível", () => {
    render(<BarList items={[{ ...areas[0], onSelect: () => undefined }]} />);
    expect(screen.getByRole("button")).toHaveClass("focus-visible:ring-2", "focus-visible:ring-ring");
  });

  it("o texto quebra dentro da linha em vez de estourá-la", () => {
    render(<BarList items={[{ id: "a", label: "Uma área de nome muito comprido", value: 1, valueLabel: "1" }]} />);
    const rotulo = screen.getByText("Uma área de nome muito comprido");
    expect(rotulo).toHaveClass("min-w-0", "break-words");
    expect(screen.getByText("1")).toHaveClass("shrink-0");
  });

  it("desenha só com tokens: barra na tinta da marca, trilha neutra", () => {
    const { container } = render(<BarList items={areas} />);
    const barra = container.querySelector("[data-part=bar]")!;
    expect(barra).toHaveClass("bg-primary-ink", "motion-reduce:!transition-none");
    expect(barra.parentElement).toHaveClass("bg-muted");
    expect(container.innerHTML).not.toMatch(/#[0-9a-f]{3,8}\b|rgb\(/i);
  });

  it("passa na auditoria do axe, com e sem linhas clicáveis", async () => {
    const { container } = render(
      <div>
        <BarList items={areas} aria-label="Adesão por área" />
        <BarList items={areas.map((item) => ({ ...item, onSelect: () => undefined }))} aria-label="Áreas" />
        <BarList items={[]} aria-label="Vazia" />
      </div>,
    );
    expect(await violations(container)).toEqual([]);
  });
});
