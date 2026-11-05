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

const dez = [
  "Muito abaixo do esperado",
  "Abaixo do esperado",
  "Em desenvolvimento",
  "Atende parcialmente",
  "Próximo do esperado",
  "Atende ao esperado",
  "Acima do esperado",
  "Supera as expectativas",
  "Excelente desempenho",
  "É referência",
];

const embaixo = (container: HTMLElement) => container.querySelector<HTMLElement>("[data-selected-label]");

describe("RatingScale — rótulo embaixo (labelDisplay)", () => {
  it("auto: até 5 notas, o rótulo fica dentro de cada nota, como antes", () => {
    const { container } = render(<Controlado value={2} />);
    expect(nota(2)).toHaveTextContent("2Discordo");
    expect(container.querySelector("[data-hint]")).toBeNull();
    expect(embaixo(container)).toBeNull();
  });

  it("auto: acima de 5 notas, as notas mostram só o número e o rótulo vai para baixo", () => {
    const { container } = render(<Controlado labels={dez} />);
    expect(screen.getAllByRole("radio")).toHaveLength(10);
    expect(screen.getAllByRole("radio").map((r) => r.textContent)).toEqual(
      Array.from({ length: 10 }, (_, i) => String(i + 1)),
    );
    // Vazio e sem foco: a dica neutra são os dois extremos.
    expect(embaixo(container)).toHaveAttribute("data-hint");
    expect(embaixo(container)).toHaveTextContent("1 · Muito abaixo do esperado10 · É referência");
  });

  it("cada nota segue nomeada por número e rótulo", () => {
    render(<Controlado labels={dez} />);
    expect(screen.getAllByRole("radio").map((r) => r.getAttribute("aria-label"))).toEqual(
      dez.map((texto, i) => `${i + 1}, ${texto}`),
    );
    expect(screen.getByRole("radio", { name: "10, É referência" })).toBeInTheDocument();
  });

  it("mostra o rótulo da escolhida e acompanha a troca", async () => {
    const user = userEvent.setup();
    const { container } = render(<Controlado labels={dez} value={6} />);
    expect(embaixo(container)).toHaveTextContent("6 · Atende ao esperado");
    expect(embaixo(container)).not.toHaveAttribute("data-preview");
    await user.click(nota(8));
    await user.unhover(nota(8));
    expect(embaixo(container)).toHaveTextContent("8 · Supera as expectativas");
  });

  it("o cursor sobre uma nota mostra o rótulo dela; ao sair, volta o da escolhida", async () => {
    const user = userEvent.setup();
    const { container } = render(<Controlado labels={dez} value={6} />);
    await user.hover(nota(9));
    expect(embaixo(container)).toHaveTextContent("9 · Excelente desempenho");
    expect(embaixo(container)).toHaveAttribute("data-preview", "true");
    expect(marcadas()[5]).toBe(true);
    await user.unhover(nota(9));
    expect(embaixo(container)).toHaveTextContent("6 · Atende ao esperado");
  });

  it("sem escolha, o cursor mostra o rótulo e, ao sair, volta a dica", async () => {
    const user = userEvent.setup();
    const { container } = render(<Controlado labels={dez} />);
    await user.hover(nota(3));
    expect(embaixo(container)).toHaveTextContent("3 · Em desenvolvimento");
    await user.unhover(nota(3));
    expect(embaixo(container)).toHaveAttribute("data-hint");
  });

  it("teclado igual ao de antes: setas mudam e marcam, Home e End nas pontas, e o rótulo segue o foco", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(<Controlado labels={dez} value={5} onChange={onChange} />);
    await user.tab();
    expect(nota(5)).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(nota(6)).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith(6);
    expect(embaixo(container)).toHaveTextContent("6 · Atende ao esperado");
    await user.keyboard("{End}");
    expect(onChange).toHaveBeenLastCalledWith(10);
    expect(embaixo(container)).toHaveTextContent("10 · É referência");
    await user.keyboard("{ArrowRight}");
    expect(nota(1)).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith(1);
    await user.keyboard("{Home}{Enter}");
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it("vazio, o Tab entra sem marcar e o rótulo mostra a nota em foco; ao sair do grupo, volta a dica", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <>
        <Controlado labels={dez} />
        <button type="button">Depois</button>
      </>,
    );
    await user.tab();
    expect(nota(1)).toHaveFocus();
    expect(marcadas().some(Boolean)).toBe(false);
    expect(embaixo(container)).toHaveTextContent("1 · Muito abaixo do esperado");
    expect(embaixo(container)).toHaveAttribute("data-preview", "true");
    await user.tab();
    expect(embaixo(container)).toHaveAttribute("data-hint");
  });

  it("readOnly: as setas passeiam e o rótulo mostra a nota em foco, sem mudar a escolhida", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(<Controlado labels={dez} value={7} readOnly onChange={onChange} />);
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(nota(8)).toHaveFocus();
    expect(embaixo(container)).toHaveTextContent("8 · Supera as expectativas");
    expect(onChange).not.toHaveBeenCalled();
    expect(marcadas()[6]).toBe(true);
  });

  it("disabled: o cursor não muda o rótulo", async () => {
    const { container } = render(<Controlado labels={dez} value={4} disabled />);
    // O botão desabilitado não recebe ponteiro no navegador; o evento direto prova o guarda.
    nota(9).dispatchEvent(new MouseEvent("pointerover", { bubbles: true }));
    expect(embaixo(container)).toHaveTextContent("4 · Atende parcialmente");
  });

  it("labelDisplay inline força o rótulo dentro da nota, mesmo com 10", () => {
    const { container } = render(<Controlado labels={dez} labelDisplay="inline" />);
    expect(nota(10)).toHaveTextContent("10É referência");
    expect(container.querySelector("[data-hint]")).toBeNull();
  });

  it("labelDisplay selected também vale para 5 notas", () => {
    const { container } = render(<Controlado labelDisplay="selected" value={4} />);
    expect(nota(4).textContent).toBe("4");
    expect(embaixo(container)).toHaveTextContent("4 · Concordo");
  });

  it("showSelectedLabel no modo selected não repete o rótulo", () => {
    const { container } = render(<Controlado labels={dez} value={2} showSelectedLabel />);
    expect(container.querySelectorAll("[data-selected-label]")).toHaveLength(1);
  });

  it("o rótulo embaixo é só visual: o leitor de tela o ouve na própria nota", () => {
    const { container } = render(<Controlado labels={dez} value={2} />);
    expect(embaixo(container)).toHaveAttribute("aria-hidden", "true");
  });

  it("referência, erro e campo oculto seguem iguais na escala de 10", () => {
    const { container } = render(<Controlado labels={dez} value={8} compareValue={6} error="Escolha uma nota." />);
    expect(nota(6)).toHaveAccessibleDescription("Valor de referência");
    expect(nota(6).querySelector("[data-reference-marker]")).not.toBeNull();
    expect(grupo()).toHaveAttribute("aria-invalid", "true");
    expect(container.querySelector('input[name="nota"]')).toHaveValue("8");
  });

  it("as notas compactas não encolhem o alvo: 44px de altura, sem respiro lateral que esprema o número", () => {
    render(<Controlado labels={dez} />);
    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).toHaveClass("min-h-11", "px-0");
      expect(radio).not.toHaveClass("px-1.5");
    }
    expect(grupo()).toHaveClass("gap-1", "sm:gap-2");
  });

  it("passa na auditoria do axe na escala de 10, em todos os estados", async () => {
    const { container } = render(
      <div>
        <Controlado aria-label="Vazia" labels={dez} />
        <Controlado aria-label="Escolhida" labels={dez} value={6} compareValue={8} />
        <Controlado aria-label="Só leitura" labels={dez} value={7} readOnly />
        <Controlado aria-label="Desabilitada" labels={dez} value={2} disabled />
        <Controlado aria-label="Com erro" labels={dez} error="Escolha uma nota." />
        <Controlado aria-label="Cinco embaixo" labelDisplay="selected" value={3} />
      </div>,
    );
    expect(await violations(container)).toEqual([]);
  });
});
