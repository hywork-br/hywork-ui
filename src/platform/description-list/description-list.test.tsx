import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";

import { DescriptionList, type DescriptionListItem } from "./index";

// jsdom não tem layout: a grade em cada largura é medida no navegador.
const violations = async (container: HTMLElement) =>
  (await axe.run(container, { rules: { "color-contrast": { enabled: false } } })).violations;

const itens: DescriptionListItem[] = [
  { label: "Nome completo", value: "Marina Alves Duarte", span: 2 },
  { label: "Nome social", value: null },
  { label: "Contato de emergência", value: "Helena Duarte · mãe", span: 3 },
];

/** Os pares rótulo → valor, na ordem. */
const pares = (container: HTMLElement) =>
  [...container.querySelectorAll("dl > div")].map((grupo) => [
    grupo.querySelector("dt")?.textContent,
    grupo.querySelector("dd")?.textContent,
  ]);

/** As classes de coluna de cada grupo, na ordem. */
const spans = (container: HTMLElement) =>
  [...container.querySelectorAll<HTMLElement>("dl > div")].map((grupo) =>
    grupo.className.split(" ").filter((c) => c.includes("col-span")).join(" "),
  );

describe("DescriptionList", () => {
  it("é um <dl> com um <dt> e um <dd> por item, na ordem", () => {
    const { container } = render(<DescriptionList items={itens} />);
    expect(container.querySelectorAll("dl")).toHaveLength(1);
    expect(screen.getAllByRole("term").map((dt) => dt.textContent)).toEqual([
      "Nome completo",
      "Nome social",
      "Contato de emergência",
    ]);
    expect(screen.getAllByRole("definition")).toHaveLength(3);
    expect(pares(container)[0]).toEqual(["Nome completo", "Marina Alves Duarte"]);
  });

  it.each([
    ["null", null],
    ["undefined", undefined],
    ["false", false],
    ["texto vazio", ""],
    ["só espaços", "   "],
  ])("valor %s mostra \"—\" (CA14)", (_, value) => {
    const { container } = render(<DescriptionList items={[{ label: "Nome social", value }]} />);
    const dd = screen.getByRole("definition");
    expect(dd).toHaveTextContent(/^—$/);
    expect(dd).toHaveAttribute("data-empty", "true");
    expect(pares(container)).toEqual([["Nome social", "—"]]);
  });

  it("sem `value`, o campo também mostra \"—\"", () => {
    render(<DescriptionList items={[{ label: "Complemento" }]} />);
    expect(screen.getByRole("definition")).toHaveTextContent(/^—$/);
  });

  it("zero é valor, não vazio", () => {
    render(<DescriptionList items={[{ label: "Dependentes", value: 0 }]} />);
    const dd = screen.getByRole("definition");
    expect(dd).toHaveTextContent(/^0$/);
    expect(dd).not.toHaveAttribute("data-empty");
  });

  it("`emptyValue` troca o \"—\"", () => {
    render(<DescriptionList emptyValue="Não informado" items={[{ label: "Nome social", value: null }]} />);
    expect(screen.getByRole("definition")).toHaveTextContent("Não informado");
  });

  it("o valor aceita conteúdo além de texto", () => {
    render(
      <DescriptionList
        items={[{ label: "Tipo de contrato", value: <>CLT · <em>tempo indeterminado</em></> }]}
      />,
    );
    expect(screen.getByRole("definition")).toHaveTextContent("CLT · tempo indeterminado");
  });

  it("uma coluna é o padrão, e o span não tem efeito", () => {
    const { container } = render(<DescriptionList items={itens} />);
    const dl = container.querySelector("dl")!;
    expect(dl).toHaveClass("grid", "grid-cols-1");
    expect(dl.className).not.toMatch(/sm:grid-cols|lg:grid-cols/);
    expect(spans(container)).toEqual(["", "", ""]);
  });

  it("duas colunas a partir de 640px; span 2 ou 3 ocupa a linha inteira", () => {
    const { container } = render(<DescriptionList columns={2} items={itens} />);
    expect(container.querySelector("dl")).toHaveClass("grid-cols-1", "sm:grid-cols-2");
    expect(spans(container)).toEqual(["col-span-full", "", "col-span-full"]);
  });

  it("três colunas: duas a partir de 640px, três a partir de 1024px; span 2 é parcial, span 3 é a linha", () => {
    const { container } = render(<DescriptionList columns={3} items={itens} />);
    expect(container.querySelector("dl")).toHaveClass("grid-cols-1", "sm:grid-cols-2", "lg:grid-cols-3");
    expect(spans(container)).toEqual(["sm:col-span-2", "", "col-span-full"]);
  });

  it("nenhum span vale abaixo de 640px, onde a lista tem uma coluna", () => {
    const { container } = render(<DescriptionList columns={3} items={itens} />);
    // só `col-span-full` (1 / -1) aparece sem prefixo de largura: ele não cria coluna implícita
    for (const classe of spans(container).join(" ").split(" ").filter(Boolean))
      expect(classe === "col-span-full" || classe.startsWith("sm:")).toBe(true);
  });

  it("só leitura: nada é focável nem editável, e clicar não muda nada (CA16)", async () => {
    const user = userEvent.setup();
    const { container } = render(<DescriptionList columns={3} items={itens} />);
    const antes = container.innerHTML;
    for (const dd of screen.getAllByRole("definition")) await user.click(dd);
    await user.tab();
    expect(document.body).toHaveFocus();
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
    expect(container.querySelector("[contenteditable], [tabindex]")).toBeNull();
    expect(container.innerHTML).toBe(antes);
  });

  it("repassa ref, className e atributos ao <dl>", () => {
    let ref: HTMLDListElement | null = null;
    render(
      <DescriptionList
        ref={(el) => {
          ref = el;
        }}
        items={itens}
        className="max-w-[920px]"
        aria-label="Informações pessoais"
        data-testid="lista"
      />,
    );
    const dl = screen.getByTestId("lista");
    expect(ref).toBe(dl);
    expect(dl).toHaveClass("max-w-[920px]", "grid");
    expect(dl).toHaveAttribute("aria-label", "Informações pessoais");
  });

  it("lista vazia é um <dl> sem itens", () => {
    const { container } = render(<DescriptionList items={[]} />);
    expect(container.querySelector("dl")?.children).toHaveLength(0);
  });

  it("passa no axe", async () => {
    const { container } = render(<DescriptionList columns={3} items={itens} />);
    expect(await violations(container)).toEqual([]);
  });
});
