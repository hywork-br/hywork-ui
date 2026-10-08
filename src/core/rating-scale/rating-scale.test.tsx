import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";

import { RatingScale, type RatingScaleProps } from "./index";

const labels = ["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"];

type Props = Partial<Omit<RatingScaleProps, "onChange">> & { onChange?: (value: number) => void };

/** Como a tela usa: o valor mora fora e volta pelo onChange. */
function Controlado({ onChange = () => undefined, value = null, ...props }: Props) {
  const [valor, setValor] = React.useState<number | null>(value);
  return (
    <RatingScale
      name="nota"
      labels={labels}
      aria-label="Clareza"
      {...props}
      value={valor}
      onChange={(proximo) => {
        setValor(proximo);
        onChange(proximo);
      }}
    />
  );
}

const grupo = () => screen.getByRole("radiogroup", { name: "Clareza" });
const nota = (n: number) => screen.getAllByRole("radio")[n - 1];
const marcadas = () =>
  screen.getAllByRole("radio").map((radio) => radio.getAttribute("aria-checked") === "true");

// jsdom não tem layout: o contraste fica com o Playwright e o addon-a11y.
const violations = async (element: HTMLElement) =>
  (await axe.run(element, { rules: { "color-contrast": { enabled: false } } })).violations;

describe("RatingScale — estrutura", () => {
  it("é um grupo de rádio nomeado, com uma nota por rótulo, nomeada por número e rótulo", () => {
    render(<Controlado />);
    expect(grupo()).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(5);
    expect(screen.getByRole("radio", { name: "1, Discordo totalmente" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "5, Concordo totalmente" })).toBeInTheDocument();
  });

  it("o tamanho de labels define a escala", () => {
    render(<Controlado labels={["Baixo", "Médio", "Alto"]} />);
    expect(screen.getAllByRole("radio").map((r) => r.getAttribute("aria-label"))).toEqual([
      "1, Baixo",
      "2, Médio",
      "3, Alto",
    ]);
  });

  it("sem rótulos, a escala tem 5 notas nomeadas só pelo número", () => {
    render(<Controlado labels={[]} />);
    expect(screen.getAllByRole("radio").map((r) => r.getAttribute("aria-label"))).toEqual(["1", "2", "3", "4", "5"]);
  });

  it("aceita aria-labelledby no lugar de aria-label", () => {
    render(
      <>
        <p id="pergunta">Cumpre os prazos</p>
        <RatingScale name="n" value={null} onChange={() => undefined} labels={labels} aria-labelledby="pergunta" />
      </>,
    );
    expect(screen.getByRole("radiogroup", { name: "Cumpre os prazos" })).toBeInTheDocument();
  });

  it("vazio, nenhuma nota marcada e a primeira é a parada do Tab", () => {
    render(<Controlado />);
    expect(marcadas()).toEqual([false, false, false, false, false]);
    expect(screen.getAllByRole("radio").map((r) => r.tabIndex)).toEqual([0, -1, -1, -1, -1]);
  });

  it("com valor, marca a nota e ela vira a parada do Tab", () => {
    render(<Controlado value={3} />);
    expect(marcadas()).toEqual([false, false, true, false, false]);
    expect(nota(3)).toHaveAttribute("tabindex", "0");
    expect(nota(1)).toHaveAttribute("tabindex", "-1");
  });

  it("valor fora da escala conta como vazio", () => {
    const { container } = render(<Controlado value={7} />);
    expect(marcadas()).toEqual([false, false, false, false, false]);
    expect(container.querySelector('input[name="nota"]')).toHaveValue("");
  });

  it("leva a nota num campo oculto com o name, para o formulário nativo", () => {
    const { container } = render(<Controlado value={4} />);
    const campo = container.querySelector('input[type="hidden"][name="nota"]');
    expect(campo).toHaveValue("4");
  });
});

describe("RatingScale — escolha", () => {
  it("o clique escolhe a nota", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlado onChange={onChange} />);
    await user.click(screen.getByRole("radio", { name: "4, Concordo" }));
    expect(onChange).toHaveBeenCalledWith(4);
    expect(marcadas()).toEqual([false, false, false, true, false]);
  });

  it("clicar na nota já escolhida não chama onChange de novo", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlado value={2} onChange={onChange} />);
    await user.click(nota(2));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("as setas mudam o foco E marcam a nota, mesmo com a tecla rápida", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlado value={3} onChange={onChange} />);
    await user.tab();
    expect(nota(3)).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(nota(4)).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith(4);
    expect(marcadas()).toEqual([false, false, false, true, false]);

    await user.keyboard("{ArrowDown}");
    expect(nota(5)).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith(5);

    await user.keyboard("{ArrowLeft}{ArrowUp}");
    expect(nota(3)).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith(3);
    expect(marcadas()).toEqual([false, false, true, false, false]);
  });

  it("as setas dão a volta nas pontas, como no grupo de rádio", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlado value={5} onChange={onChange} />);
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(nota(1)).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith(1);
    await user.keyboard("{ArrowLeft}");
    expect(nota(5)).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith(5);
  });

  it("Home e End vão à primeira e à última nota, marcando", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlado value={3} onChange={onChange} />);
    await user.tab();
    await user.keyboard("{End}");
    expect(nota(5)).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith(5);
    await user.keyboard("{Home}");
    expect(nota(1)).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith(1);
  });

  it("vazio, o Tab entra sem marcar; Espaço marca a nota em foco; Enter não", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlado onChange={onChange} />);
    await user.tab();
    expect(nota(1)).toHaveFocus();
    expect(onChange).not.toHaveBeenCalled();
    await user.keyboard("{Enter}");
    expect(onChange).not.toHaveBeenCalled();
    await user.keyboard(" ");
    expect(onChange).toHaveBeenCalledWith(1);
    expect(nota(1)).toHaveAttribute("aria-checked", "true");
  });

  it("o grupo inteiro é uma parada do Tab só", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Controlado value={2} />
        <button type="button">Depois</button>
      </>,
    );
    await user.tab();
    expect(nota(2)).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Depois" })).toHaveFocus();
  });
});

describe("RatingScale — estados", () => {
  it("readOnly: focável, anunciado como só leitura, e nada muda pelo clique ou pelas setas", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlado value={2} readOnly onChange={onChange} />);
    expect(grupo()).toHaveAttribute("aria-readonly", "true");
    await user.tab();
    expect(nota(2)).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    // As setas passeiam pelas notas, para ouvir cada rótulo, sem marcar.
    expect(nota(3)).toHaveFocus();
    await user.keyboard(" {End}");
    await user.click(nota(4));
    expect(onChange).not.toHaveBeenCalled();
    expect(marcadas()).toEqual([false, true, false, false, false]);
  });

  it("disabled: fora da ordem do Tab, sem clique, e o campo oculto não vai no formulário", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <>
        <Controlado value={2} disabled onChange={onChange} />
        <button type="button">Depois</button>
      </>,
    );
    expect(grupo()).toHaveAttribute("aria-disabled", "true");
    expect(screen.getAllByRole("radio").every((r) => (r as HTMLButtonElement).disabled)).toBe(true);
    await user.tab();
    expect(screen.getByRole("button", { name: "Depois" })).toHaveFocus();
    await user.click(nota(4));
    expect(onChange).not.toHaveBeenCalled();
    expect(container.querySelector('input[name="nota"]')).toBeDisabled();
  });

  it("erro: aria-invalid no grupo, ligado à mensagem por aria-describedby", () => {
    render(<Controlado error="Escolha uma nota." />);
    expect(grupo()).toHaveAttribute("aria-invalid", "true");
    expect(grupo()).toHaveAccessibleDescription("Escolha uma nota.");
    expect(screen.getByRole("alert")).toHaveTextContent("Escolha uma nota.");
  });

  it("sem erro, sem aria-invalid nem mensagem", () => {
    render(<Controlado />);
    expect(grupo()).not.toHaveAttribute("aria-invalid");
    expect(grupo()).not.toHaveAttribute("aria-describedby");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("showSelectedLabel mostra o rótulo da nota escolhida e acompanha a troca", async () => {
    const user = userEvent.setup();
    const { container } = render(<Controlado value={4} showSelectedLabel />);
    const texto = () => container.querySelector("[data-selected-label]");
    expect(texto()).toHaveTextContent("Concordo");
    await user.click(nota(1));
    expect(texto()).toHaveTextContent("Discordo totalmente");
  });

  it("sem showSelectedLabel, o rótulo da escolhida não aparece embaixo", () => {
    const { container } = render(<Controlado value={4} />);
    expect(container.querySelector("[data-selected-label]")).toBeNull();
  });

  it("compareValue: marca a referência sem marcá-la como escolha, e o leitor de tela ouve", () => {
    const { container } = render(<Controlado value={4} compareValue={2} />);
    expect(nota(2)).toHaveAttribute("data-reference");
    expect(nota(2)).toHaveAttribute("aria-checked", "false");
    expect(nota(2)).toHaveAccessibleDescription("Valor de referência");
    expect(nota(4)).not.toHaveAccessibleDescription();
    expect(container.querySelectorAll("[data-reference-marker]")).toHaveLength(1);
    expect(nota(2).querySelector("[data-reference-marker]")).not.toBeNull();
  });

  it("compareValue não é selecionável por si: a nota segue escolhível como as outras", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlado value={null} compareValue={2} onChange={onChange} />);
    expect(marcadas()).toEqual([false, false, false, false, false]);
    expect(nota(1)).toHaveAttribute("tabindex", "0");
    await user.click(nota(2));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("compareValue fora da escala não marca nada", () => {
    const { container } = render(<Controlado compareValue={9} />);
    expect(container.querySelector("[data-reference-marker]")).toBeNull();
  });

  it("passa na auditoria do axe em todos os estados", async () => {
    const { container } = render(
      <div>
        <Controlado aria-label="Vazio" />
        <Controlado aria-label="Escolhida" value={3} showSelectedLabel compareValue={2} />
        <Controlado aria-label="Só leitura" value={4} readOnly />
        <Controlado aria-label="Desabilitada" value={2} disabled />
        <Controlado aria-label="Com erro" error="Escolha uma nota." />
        <Controlado aria-label="Três" labels={["Baixo", "Médio", "Alto"]} value={1} />
        <Controlado aria-label="Sem rótulos" labels={[]} />
      </div>,
    );
    expect(await violations(container)).toEqual([]);
  });
});
