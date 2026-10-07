import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";

import { DatePicker, type DatePickerProps } from "./index";
import { addDays, addMonths, displayToIso, isValidIso, maskDisplay } from "./date";

/** Como a tela usa: o valor mora fora e volta pelo onChange. */
function Controlado({ onChange, ...props }: Omit<DatePickerProps, "label"> & { label?: string }) {
  const [valor, setValor] = React.useState(props.value);
  return (
    <DatePicker
      label="Início"
      {...props}
      value={valor}
      onChange={(proximo) => {
        setValor(proximo);
        onChange(proximo);
      }}
    />
  );
}

const campo = () => screen.getByRole("textbox", { name: "Início" });
const abrirCalendario = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole("button", { name: "Abrir calendário: Início" }));

// jsdom não tem layout: o contraste fica com o Playwright e o addon-a11y.
const violations = async (element: HTMLElement) =>
  (await axe.run(element, { rules: { "color-contrast": { enabled: false } } })).violations;

describe("DatePicker — campo", () => {
  it("liga o rótulo ao campo e mostra a data em dd/mm/aaaa", () => {
    render(<DatePicker label="Início" value="2026-10-12" onChange={() => undefined} />);
    expect(campo()).toHaveValue("12/10/2026");
  });

  it("vazio, mostra o formato esperado", () => {
    render(<DatePicker label="Início" value={null} onChange={() => undefined} />);
    expect(campo()).toHaveValue("");
    expect(campo()).toHaveAttribute("placeholder", "dd/mm/aaaa");
  });

  it("usa o id recebido no campo", () => {
    render(<DatePicker label="Início" id="inicio" value={null} onChange={() => undefined} />);
    expect(campo()).toHaveAttribute("id", "inicio");
  });

  it("põe as barras na digitação e devolve YYYY-MM-DD quando a data fica completa", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlado value={null} onChange={onChange} />);
    await user.type(campo(), "1210");
    expect(campo()).toHaveValue("12/10");
    expect(onChange).not.toHaveBeenCalled();
    await user.type(campo(), "2026");
    expect(campo()).toHaveValue("12/10/2026");
    expect(onChange).toHaveBeenCalledWith("2026-10-12");
  });

  it("aceita colar no formato ISO", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlado value={null} onChange={onChange} />);
    await user.click(campo());
    await user.paste("2026-10-12");
    expect(campo()).toHaveValue("12/10/2026");
    expect(onChange).toHaveBeenCalledWith("2026-10-12");
  });

  it("apagar o texto devolve null", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlado value="2026-10-12" onChange={onChange} />);
    await user.clear(campo());
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("data que não existe devolve null e explica o formato, ligada por aria-describedby", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlado value="2026-10-01" onChange={onChange} />);
    await user.clear(campo());
    await user.type(campo(), "31022026");
    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(campo()).toHaveValue("31/02/2026");
    const mensagem = screen.getByRole("alert");
    expect(mensagem).toHaveTextContent("Data inválida. Use o formato dd/mm/aaaa.");
    expect(campo()).toHaveAttribute("aria-invalid", "true");
    expect(campo()).toHaveAttribute("aria-describedby", mensagem.id);
  });

  it("texto incompleto, ao sair do campo, vira erro de formato", async () => {
    const user = userEvent.setup();
    render(<Controlado value={null} onChange={() => undefined} />);
    await user.type(campo(), "1210");
    await user.tab();
    expect(screen.getByRole("alert")).toHaveTextContent("Data inválida");
  });

  it("data digitada fora do intervalo não é aceita e diz o intervalo", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlado value={null} onChange={onChange} min="2026-10-12" max="2026-12-31" />);
    await user.type(campo(), "01102026");
    expect(onChange).not.toHaveBeenCalledWith("2026-10-01");
    expect(screen.getByRole("alert")).toHaveTextContent("Escolha uma data entre 12/10/2026 e 31/12/2026.");
  });

  it("corrigir o texto limpa o erro e devolve a data", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlado value={null} onChange={onChange} min="2026-10-12" />);
    await user.type(campo(), "01102026");
    expect(screen.getByRole("alert")).toHaveTextContent("a partir de 12/10/2026");
    await user.clear(campo());
    await user.type(campo(), "15102026");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith("2026-10-15");
  });

  it("mostra o erro da tela colado ao campo e ligado por aria-describedby", () => {
    render(
      <DatePicker label="Início" value={null} onChange={() => undefined} error="Informe a data de início." />,
    );
    const mensagem = screen.getByRole("alert");
    expect(mensagem).toHaveTextContent("Informe a data de início.");
    expect(campo()).toHaveAttribute("aria-invalid", "true");
    expect(campo()).toHaveAttribute("aria-describedby", mensagem.id);
  });

  it("sem erro, não aponta para mensagem nenhuma", () => {
    render(<DatePicker label="Início" value={null} onChange={() => undefined} />);
    expect(campo()).not.toHaveAttribute("aria-invalid");
    expect(campo()).not.toHaveAttribute("aria-describedby");
  });

  it("acompanha o valor que muda de fora", () => {
    const { rerender } = render(<DatePicker label="Início" value="2026-10-12" onChange={() => undefined} />);
    rerender(<DatePicker label="Início" value={null} onChange={() => undefined} />);
    expect(campo()).toHaveValue("");
    rerender(<DatePicker label="Início" value="2026-12-01" onChange={() => undefined} />);
    expect(campo()).toHaveValue("01/12/2026");
  });

  it("desabilitado, não digita nem abre o calendário", () => {
    render(<DatePicker label="Início" value="2026-10-12" onChange={() => undefined} disabled />);
    expect(campo()).toBeDisabled();
    expect(screen.getByRole("button", { name: "Abrir calendário: Início" })).toBeDisabled();
  });

  it("passa na auditoria do axe, vazio e com erro", async () => {
    const { container } = render(
      <div>
        <DatePicker label="Início" value={null} onChange={() => undefined} />
        <DatePicker label="Encerramento" value={null} onChange={() => undefined} error="Informe a data." />
      </div>,
    );
    expect(await violations(container)).toEqual([]);
  });
});

describe("DatePicker — calendário", () => {
  it("abre no mês do valor, com o foco no dia escolhido", async () => {
    const user = userEvent.setup();
    render(<Controlado value="2026-10-12" onChange={() => undefined} />);
    await abrirCalendario(user);
    const dialogo = screen.getByRole("dialog", { name: "Escolher data: Início" });
    expect(within(dialogo).getByRole("grid", { name: "outubro de 2026" })).toBeInTheDocument();
    expect(document.activeElement).toHaveAccessibleName("segunda-feira, 12 de outubro de 2026");
    expect(document.activeElement?.closest("td")).toHaveAttribute("aria-selected", "true");
  });

  it("Alt+↓ no campo abre o calendário", async () => {
    const user = userEvent.setup();
    render(<Controlado value="2026-10-12" onChange={() => undefined} />);
    await user.click(campo());
    await user.keyboard("{Alt>}{ArrowDown}{/Alt}");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("escolhe com o clique, fecha e mostra a data no campo", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlado value="2026-10-12" onChange={onChange} />);
    await abrirCalendario(user);
    await user.click(screen.getByRole("button", { name: "terça-feira, 20 de outubro de 2026" }));
    expect(onChange).toHaveBeenCalledWith("2026-10-20");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(campo()).toHaveValue("20/10/2026");
  });

  it("anda pelo teclado: setas, PageDown e Enter", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlado value="2026-10-12" onChange={onChange} />);
    await abrirCalendario(user);
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toHaveAccessibleName("terça-feira, 13 de outubro de 2026");
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toHaveAccessibleName("terça-feira, 20 de outubro de 2026");
    await user.keyboard("{Home}");
    expect(document.activeElement).toHaveAccessibleName("domingo, 18 de outubro de 2026");
    await user.keyboard("{End}");
    expect(document.activeElement).toHaveAccessibleName("sábado, 24 de outubro de 2026");
    await user.keyboard("{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}");
    await user.keyboard("{PageDown}");
    expect(screen.getByRole("grid", { name: "novembro de 2026" })).toBeInTheDocument();
    expect(document.activeElement).toHaveAccessibleName("sexta-feira, 20 de novembro de 2026");
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith("2026-11-20");
    expect(campo()).toHaveValue("20/11/2026");
  });

  it("Shift+PageUp volta um ano", async () => {
    const user = userEvent.setup();
    render(<Controlado value="2026-10-12" onChange={() => undefined} />);
    await abrirCalendario(user);
    await user.keyboard("{Shift>}{PageUp}{/Shift}");
    expect(screen.getByRole("grid", { name: "outubro de 2025" })).toBeInTheDocument();
  });

  it("Esc fecha e devolve o foco ao botão do calendário", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlado value="2026-10-12" onChange={onChange} />);
    await abrirCalendario(user);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Abrir calendário: Início" })).toHaveFocus();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("as setas de mês trocam o mês", async () => {
    const user = userEvent.setup();
    render(<Controlado value="2026-10-12" onChange={() => undefined} />);
    await abrirCalendario(user);
    await user.click(screen.getByRole("button", { name: "Próximo mês" }));
    expect(screen.getByRole("grid", { name: "novembro de 2026" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Mês anterior" }));
    await user.click(screen.getByRole("button", { name: "Mês anterior" }));
    expect(screen.getByRole("grid", { name: "setembro de 2026" })).toBeInTheDocument();
  });

  it("desabilita as datas fora de min/max e não deixa o foco sair do intervalo", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlado value="2026-10-20" min="2026-10-12" max="2026-10-25" onChange={onChange} />);
    await abrirCalendario(user);
    expect(screen.getByRole("button", { name: "domingo, 11 de outubro de 2026" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "segunda-feira, 26 de outubro de 2026" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "segunda-feira, 12 de outubro de 2026" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Mês anterior" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Próximo mês" })).toBeDisabled();

    // 20 → 13 → 6, que fica antes do mínimo: o foco para no 12.
    await user.keyboard("{ArrowUp}{ArrowUp}");
    expect(document.activeElement).toHaveAccessibleName("segunda-feira, 12 de outubro de 2026");

    await user.click(screen.getByRole("button", { name: "domingo, 11 de outubro de 2026" }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("sem valor, abre no limite mais próximo quando hoje está fora do intervalo", async () => {
    const user = userEvent.setup();
    render(<Controlado value={null} min="2999-01-10" onChange={() => undefined} />);
    await abrirCalendario(user);
    expect(screen.getByRole("grid", { name: "janeiro de 2999" })).toBeInTheDocument();
    expect(document.activeElement).toHaveAccessibleName("quinta-feira, 10 de janeiro de 2999");
  });

  it("marca o dia de hoje", async () => {
    const user = userEvent.setup();
    render(<Controlado value={null} onChange={() => undefined} />);
    await abrirCalendario(user);
    expect(document.querySelector('[aria-current="date"]')).toBe(document.activeElement);
  });

  it("passa na auditoria do axe com o calendário aberto", async () => {
    const user = userEvent.setup();
    render(<Controlado value="2026-10-20" min="2026-10-12" onChange={() => undefined} />);
    await abrirCalendario(user);
    expect(await violations(screen.getByRole("dialog"))).toEqual([]);
  });
});

describe("DatePicker — aritmética de data", () => {
  it("valida datas que existem", () => {
    expect(isValidIso("2028-02-29")).toBe(true);
    expect(isValidIso("2026-02-29")).toBe(false);
    expect(isValidIso("2026-13-01")).toBe(false);
    expect(isValidIso("12/10/2026")).toBe(false);
  });

  it("converte o texto digitado sem passar por fuso", () => {
    expect(displayToIso("12/10/2026")).toBe("2026-10-12");
    expect(displayToIso("31/04/2026")).toBeNull();
    expect(maskDisplay("12a10b2026999")).toBe("12/10/2026");
  });

  it("dá o mesmo dia em qualquer fuso", () => {
    const original = process.env.TZ;
    try {
      // UTC+14 e UTC−11: a meia-noite local cai em outro dia UTC nos dois.
      for (const fuso of ["Pacific/Kiritimati", "Pacific/Pago_Pago"]) {
        process.env.TZ = fuso;
        expect(addDays("2026-10-12", 1)).toBe("2026-10-13");
        expect(addDays("2026-02-28", 1)).toBe("2026-03-01");
        expect(addMonths("2026-10-31", 1)).toBe("2026-11-30");
        expect(displayToIso("12/10/2026")).toBe("2026-10-12");
      }
    } finally {
      process.env.TZ = original;
    }
  });

  it("soma meses sem estourar o fim do mês", () => {
    expect(addMonths("2026-01-31", 1)).toBe("2026-02-28");
    expect(addMonths("2026-12-15", 1)).toBe("2027-01-15");
    expect(addMonths("2026-03-31", -1)).toBe("2026-02-28");
  });
});
