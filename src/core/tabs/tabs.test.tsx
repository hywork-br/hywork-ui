import { describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";

import { Badge } from "../badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./index";

// jsdom não tem layout: contraste e a grade de duas colunas ficam com o navegador.
const violations = async (container: HTMLElement) =>
  (await axe.run(container, { rules: { "color-contrast": { enabled: false } } })).violations;

// As classes da horizontal da 0.16.1 à 0.18.1 — a decisão da PO (Abas · sublinhado).
const ATE_0_18_1 = {
  list: "grid h-12 w-full auto-cols-fr grid-flow-col items-stretch rounded-none border-b border-border bg-transparent p-0 text-muted-foreground".split(" "),
  trigger:
    "relative -mb-px inline-flex h-12 items-center justify-center whitespace-nowrap rounded-none border-b-2 border-transparent bg-transparent px-3 text-sm font-normal text-muted-foreground ring-offset-background transition-colors motion-reduce:!transition-none hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-primary-ink data-[state=active]:font-semibold data-[state=active]:text-primary-ink data-[state=active]:shadow-none".split(" "),
};

// HCK-258 (03/11/2026): abas que não cabem rolam em vez de se sobrepor. Saem da
// lista a coluna que espremia o rótulo (`auto-cols-fr` = `minmax(0,1fr)`) e a
// borda, que a rolagem recortaria embaixo do indicador; entram, só na
// horizontal, a coluna do tamanho do rótulo, a rolagem sem barra e a mesma
// linha de 1px desenhada por dentro. A aba ganha o anel de foco por dentro.
const SAIU_DA_LISTA = ["auto-cols-fr", "border-b", "border-border"];
const ROLAGEM = {
  list: [
    "data-[orientation=horizontal]:auto-cols-[minmax(max-content,1fr)]",
    "data-[orientation=horizontal]:overflow-x-auto",
    "data-[orientation=horizontal]:overflow-y-hidden",
    "data-[orientation=horizontal]:shadow-[inset_0_-1px_0_hsl(var(--border))]",
    "data-[orientation=horizontal]:[scrollbar-width:none]",
    "data-[orientation=horizontal]:[&::-webkit-scrollbar]:hidden",
  ],
  trigger: ["data-[orientation=horizontal]:focus-visible:ring-inset"],
};

const HORIZONTAL = {
  root: [] as string[],
  list: [...ATE_0_18_1.list.filter((c) => !SAIU_DA_LISTA.includes(c)), ...ROLAGEM.list],
  trigger: [...ATE_0_18_1.trigger, ...ROLAGEM.trigger],
  content: "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2".split(" "),
};

/** Toda classe que não é da horizontal só vale sob `data-orientation="vertical"`. */
const soNaVertical = (element: HTMLElement, horizontal: string[]) => {
  const classes = element.className.split(/\s+/).filter(Boolean);
  for (const c of horizontal) expect(classes).toContain(c);
  for (const c of classes.filter((c) => !horizontal.includes(c)))
    expect(c.split(":").slice(0, -1)).toContain("data-[orientation=vertical]");
};

/** As variantes de uma classe: `data-[orientation=horizontal]:[&::-webkit-scrollbar]:hidden` → as duas primeiras. */
const variantes = (c: string): string[] => c.match(/(?:\[[^\]]*\]|[^:[])+(?=:)/g) ?? [];

function Perfil({ orientation }: { orientation?: "horizontal" | "vertical" }) {
  return (
    <Tabs orientation={orientation} defaultValue="perfil" data-testid="raiz">
      <TabsList aria-label="Seções do perfil">
        <TabsTrigger value="perfil">Perfil & assessment</TabsTrigger>
        <TabsTrigger value="pdi">PDI</TabsTrigger>
        <TabsTrigger value="avaliacoes">
          Avaliações
          <Badge variant="attention" tone="subtle">
            1 pendente
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="feedbacks">Feedbacks</TabsTrigger>
      </TabsList>
      <TabsContent value="perfil">Campos do perfil</TabsContent>
      <TabsContent value="pdi">Plano de desenvolvimento</TabsContent>
      <TabsContent value="avaliacoes">Avaliações da pessoa</TabsContent>
      <TabsContent value="feedbacks">Feedbacks da pessoa</TabsContent>
    </Tabs>
  );
}

describe("Tabs — horizontal (padrão)", () => {
  it("continua horizontal sem `orientation`, com as classes da decisão da PO", () => {
    render(<Perfil />);
    const raiz = screen.getByTestId("raiz");
    const lista = screen.getByRole("tablist");
    expect(raiz).toHaveAttribute("data-orientation", "horizontal");
    expect(lista).toHaveAttribute("aria-orientation", "horizontal");
    soNaVertical(raiz, HORIZONTAL.root);
    soNaVertical(lista, HORIZONTAL.list);
    for (const aba of screen.getAllByRole("tab")) soNaVertical(aba, HORIZONTAL.trigger);
    soNaVertical(screen.getByRole("tabpanel"), HORIZONTAL.content);
  });

  it("troca de aba com as setas para os lados", async () => {
    const user = userEvent.setup();
    render(<Perfil />);
    await user.click(screen.getByRole("tab", { name: "Perfil & assessment" }));
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "PDI" })).toHaveAttribute("aria-selected", "true");
  });

  it("Home e End vão à primeira e à última aba", async () => {
    const user = userEvent.setup();
    render(<Perfil />);
    await user.click(screen.getByRole("tab", { name: "PDI" }));
    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Feedbacks" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "Feedbacks" })).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "Perfil & assessment" })).toHaveFocus();
  });
});

describe("Tabs — horizontal que não cabe (HCK-258)", () => {
  it("a coluna nunca fica mais estreita que o rótulo, e a lista rola sem barra", () => {
    render(<Perfil />);
    const lista = screen.getByRole("tablist");
    for (const c of SAIU_DA_LISTA) expect(lista).not.toHaveClass(c);
    expect(lista).toHaveClass(
      "data-[orientation=horizontal]:auto-cols-[minmax(max-content,1fr)]",
      "data-[orientation=horizontal]:overflow-x-auto",
      "data-[orientation=horizontal]:overflow-y-hidden",
      "data-[orientation=horizontal]:[scrollbar-width:none]",
      "data-[orientation=horizontal]:[&::-webkit-scrollbar]:hidden",
    );
  });

  it("a linha de 1px é desenhada por dentro, no token da borda, sem cor literal", () => {
    render(<Perfil />);
    const lista = screen.getByRole("tablist");
    expect(lista).toHaveClass("data-[orientation=horizontal]:shadow-[inset_0_-1px_0_hsl(var(--border))]");
    expect(lista.className).not.toMatch(/#[0-9a-f]{3,8}|rgb\(|hsl\((?!var\(--border\)\))/i);
  });

  it("o anel de foco da aba fica por dentro dela", () => {
    render(<Perfil />);
    for (const aba of screen.getAllByRole("tab")) {
      expect(aba).toHaveClass("data-[orientation=horizontal]:focus-visible:ring-inset");
      // a folga e o anel continuam os da decisão: 2px + 2px
      expect(aba).toHaveClass("focus-visible:ring-2", "focus-visible:ring-offset-2");
    }
  });

  it("tudo o que entrou só vale na horizontal: a vertical não muda", () => {
    render(<Perfil />);
    const lista = screen.getByRole("tablist");
    const aba = screen.getAllByRole("tab")[0];
    const novas = (element: HTMLElement, antes: string[]) =>
      element.className.split(/\s+/).filter((c) => c && !antes.includes(c) && !variantes(c).includes("data-[orientation=vertical]"));
    expect(novas(lista, ATE_0_18_1.list)).toEqual(ROLAGEM.list);
    expect(novas(aba, ATE_0_18_1.trigger)).toEqual(ROLAGEM.trigger);
    for (const c of [...ROLAGEM.list, ...ROLAGEM.trigger]) expect(variantes(c)[0]).toBe("data-[orientation=horizontal]");
    // o que saiu da lista já não valia na vertical: ela é `flex` e `border-b-0`
    expect(lista).toHaveClass("data-[orientation=vertical]:flex", "data-[orientation=vertical]:border-b-0");
  });

  it("as setas percorrem as seis abas da página do ciclo, de ponta a ponta", async () => {
    const user = userEvent.setup();
    const abas = ["Visão geral", "Pendências", "Calibragem", "Devolutiva", "Resultados do ciclo", "Resultados individuais"];
    render(
      <Tabs defaultValue="0" className="w-[360px]">
        <TabsList aria-label="Seções do ciclo">
          {abas.map((nome, i) => (
            <TabsTrigger key={nome} value={String(i)}>
              {nome}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>,
    );
    await user.click(screen.getByRole("tab", { name: "Visão geral" }));
    for (const nome of abas.slice(1)) {
      await user.keyboard("{ArrowRight}");
      expect(screen.getByRole("tab", { name: nome })).toHaveFocus();
    }
    await user.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "Visão geral" })).toHaveAttribute("aria-selected", "true");
  });

  it("a aba focada entra inteira na parte visível, rolando o mínimo", async () => {
    render(<Tres />);
    const lista = rolavel(screen.getByRole("tablist"), { A: [20.7, 121], B: [120, 220], C: [250.4, 400.6] });
    // cortada à direita: rola até a borda direita da aba (arredondada para cima)
    act(() => screen.getByRole("tab", { name: "C" }).focus());
    await waitFor(() => expect(lista.scrollLeft).toBe(101));
    // cortada à esquerda: rola de volta até a borda esquerda dela
    act(() => screen.getByRole("tab", { name: "A" }).focus());
    await waitFor(() => expect(lista.scrollLeft).toBe(20));
    // inteira à vista: não rola
    act(() => screen.getByRole("tab", { name: "B" }).focus());
    await umQuadro();
    expect(lista.scrollLeft).toBe(20);
  });

  it("aba mais larga que a lista: alinha pelo começo dela", async () => {
    render(<Tres />);
    const lista = rolavel(screen.getByRole("tablist"), { A: [0, 100], C: [120.5, 520] });
    act(() => screen.getByRole("tab", { name: "C" }).focus());
    await waitFor(() => expect(lista.scrollLeft).toBe(120));
  });

  it("na vertical, o foco não mexe na rolagem", async () => {
    render(<Tres orientation="vertical" />);
    const lista = rolavel(screen.getByRole("tablist"), { A: [0, 100], C: [250, 400] });
    act(() => screen.getByRole("tab", { name: "C" }).focus());
    await umQuadro();
    expect(lista.scrollLeft).toBe(0);
  });

  it("ao montar, a aba ativa fora da vista entra inteira nela", async () => {
    render(<Tres defaultValue="c" />);
    const lista = rolavel(screen.getByRole("tablist"), { A: [0, 150], B: [150, 300], C: [450.2, 600] });
    await waitFor(() => expect(lista.scrollLeft).toBe(300));
  });

  it("quando o `value` controlado muda de fora, a nova ativa entra na vista, sem rolar a página", async () => {
    const scrollIntoView = vi.fn();
    const original = HTMLElement.prototype.scrollIntoView;
    HTMLElement.prototype.scrollIntoView = scrollIntoView;
    try {
      const { rerender } = render(<Tres value="a" />);
      const lista = rolavel(screen.getByRole("tablist"), { A: [0, 150], B: [150, 300], C: [450.2, 600] });
      await umQuadro();
      expect(lista.scrollLeft).toBe(0);
      rerender(<Tres value="c" />);
      await waitFor(() => expect(lista.scrollLeft).toBe(300));
      rerender(<Tres value="a" />);
      await waitFor(() => expect(lista.scrollLeft).toBe(0));
      expect(scrollIntoView).not.toHaveBeenCalled();
    } finally {
      HTMLElement.prototype.scrollIntoView = original;
    }
  });

  it("a rolagem feita à mão fica onde a pessoa deixou", async () => {
    render(<Tres />);
    const lista = rolavel(screen.getByRole("tablist"), { A: [0, 150], C: [450, 600] });
    await umQuadro();
    lista.scrollLeft = 250;
    await umQuadro();
    expect(lista.scrollLeft).toBe(250);
    expect(escritas).toBe(1);
  });

  it("quando tudo cabe, trocar a ativa não rola nada", async () => {
    const { rerender } = render(<Tres value="a" />);
    // conteúdo do tamanho da janela: a lista nem toca no `scrollLeft`, mesmo com
    // uma aba que pareça passar da borda
    const lista = rolavel(screen.getByRole("tablist"), { A: [0, 100], C: [200, 310] }, 300);
    rerender(<Tres value="c" />);
    await umQuadro();
    act(() => screen.getByRole("tab", { name: "C" }).focus());
    await umQuadro();
    expect(lista.scrollLeft).toBe(0);
    expect(escritas).toBe(0);
  });

  it("na vertical, a troca da ativa não mexe na rolagem", async () => {
    const { rerender } = render(<Tres orientation="vertical" value="a" />);
    const lista = rolavel(screen.getByRole("tablist"), { A: [0, 150], C: [450, 600] });
    rerender(<Tres orientation="vertical" value="c" />);
    await umQuadro();
    expect(lista.scrollLeft).toBe(0);
  });

  it("o `onFocus` da tela continua sendo chamado", () => {
    const onFocus = vi.fn();
    render(
      <Tabs defaultValue="a">
        <TabsList aria-label="Seções" onFocus={onFocus}>
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    act(() => screen.getByRole("tab", { name: "A" }).focus());
    expect(onFocus).toHaveBeenCalled();
  });

  it("passa no axe", async () => {
    const { container } = render(<Perfil />);
    expect(await violations(container)).toEqual([]);
  });
});

function Tres({
  orientation,
  defaultValue = "a",
  value,
}: {
  orientation?: "horizontal" | "vertical";
  defaultValue?: string;
  value?: string;
}) {
  return (
    <Tabs
      orientation={orientation}
      {...(value === undefined ? { defaultValue } : { value, onValueChange: () => {} })}
    >
      <TabsList aria-label="Seções">
        <TabsTrigger value="a">A</TabsTrigger>
        <TabsTrigger value="b">B</TabsTrigger>
        <TabsTrigger value="c">C</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

// jsdom não tem layout nem rolagem. `rolavel` dá à lista uma janela de 300px
// sobre um conteúdo de `conteudo` px, e a cada aba a posição dela no conteúdo:
// a caixa na tela acompanha o `scrollLeft`, preso entre 0 e o máximo, como num
// navegador — então rolar duas vezes até a mesma aba não soma.
const caixaFalsa = (left: number, right: number) =>
  ({ left, right, x: left, y: 0, top: 0, bottom: 48, width: right - left, height: 48, toJSON: () => ({}) }) as DOMRect;
let escritas = 0;
const rolavel = (lista: HTMLElement, abas: Record<string, [number, number]>, conteudo = 1000, janela = 300) => {
  let scrollLeft = 0;
  escritas = 0;
  Object.defineProperties(lista, {
    scrollLeft: {
      configurable: true,
      get: () => scrollLeft,
      set: (value: number) => {
        escritas++;
        scrollLeft = Math.min(Math.max(0, conteudo - janela), Math.max(0, value));
      },
    },
    scrollWidth: { configurable: true, get: () => conteudo },
    clientWidth: { configurable: true, get: () => janela },
  });
  lista.getBoundingClientRect = () => caixaFalsa(0, janela);
  for (const [nome, [left, right]] of Object.entries(abas))
    within(lista).getByRole("tab", { name: nome }).getBoundingClientRect = () =>
      caixaFalsa(left - scrollLeft, right - scrollLeft);
  return lista;
};
const umQuadro = () => new Promise((done) => setTimeout(done, 50));

describe("Tabs — vertical", () => {
  it("marca a orientação na raiz, na lista, nas abas e no conteúdo", () => {
    render(<Perfil orientation="vertical" />);
    expect(screen.getByTestId("raiz")).toHaveAttribute("data-orientation", "vertical");
    expect(screen.getByRole("tablist", { name: "Seções do perfil" })).toHaveAttribute("aria-orientation", "vertical");
    for (const aba of screen.getAllByRole("tab")) expect(aba).toHaveAttribute("data-orientation", "vertical");
    expect(screen.getByRole("tabpanel")).toHaveAttribute("data-orientation", "vertical");
  });

  it("abre na aba de `defaultValue` e mostra só o conteúdo dela", () => {
    render(<Perfil orientation="vertical" />);
    expect(screen.getByRole("tab", { name: "Perfil & assessment" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Campos do perfil");
  });

  it("setas para baixo e para cima trocam de aba; para os lados, não", async () => {
    const user = userEvent.setup();
    render(<Perfil orientation="vertical" />);
    await user.click(screen.getByRole("tab", { name: "Perfil & assessment" }));

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("tab", { name: "PDI" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "PDI" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Plano de desenvolvimento");

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "PDI" })).toHaveFocus();

    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("tab", { name: "Perfil & assessment" })).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Feedbacks" })).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "Perfil & assessment" })).toHaveAttribute("aria-selected", "true");
  });

  it("o selo à direita faz parte da aba e do nome que o leitor de tela ouve", async () => {
    const user = userEvent.setup();
    render(<Perfil orientation="vertical" />);
    const avaliacoes = screen.getByRole("tab", { name: "Avaliações 1 pendente" });
    expect(within(avaliacoes).getByText("1 pendente")).toBeInTheDocument();
    await user.click(within(avaliacoes).getByText("1 pendente"));
    expect(avaliacoes).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Avaliações da pessoa");
  });

  it("sem pendência, a tela não passa o selo e a aba é só o rótulo", () => {
    render(
      <Tabs orientation="vertical" defaultValue="a">
        <TabsList aria-label="Seções">
          <TabsTrigger value="a">Avaliações</TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    expect(screen.getByRole("tab")).toHaveAccessibleName("Avaliações");
  });

  it("as setas pulam a aba desabilitada", async () => {
    const user = userEvent.setup();
    render(
      <Tabs orientation="vertical" defaultValue="perfil">
        <TabsList aria-label="Seções">
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="docs" disabled>
            Documentos privados
          </TabsTrigger>
          <TabsTrigger value="feedbacks">Feedbacks</TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    await user.click(screen.getByRole("tab", { name: "Perfil" }));
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("tab", { name: "Feedbacks" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "Documentos privados" })).toBeDisabled();
  });

  it("a ativa usa o par suave da marca; a inativa, o fundo `muted` só no cursor", () => {
    render(<Perfil orientation="vertical" />);
    const ativa = screen.getByRole("tab", { name: "Perfil & assessment" });
    expect(ativa.className).toContain("data-[state=active]:data-[orientation=vertical]:bg-primary-soft");
    expect(ativa.className).toContain("data-[state=active]:data-[orientation=vertical]:text-primary-soft-foreground");
    expect(ativa.className).toContain("data-[state=inactive]:data-[orientation=vertical]:hover:bg-muted");
    // nenhuma cor literal
    expect(ativa.className).not.toMatch(/#[0-9a-f]{3,8}|rgb\(|hsl\(/i);
  });

  it("uma aba horizontal dentro do conteúdo da vertical continua horizontal", () => {
    render(
      <Tabs orientation="vertical" defaultValue="pdi">
        <TabsList aria-label="Seções">
          <TabsTrigger value="pdi">PDI</TabsTrigger>
        </TabsList>
        <TabsContent value="pdi">
          <Tabs defaultValue="ativo">
            <TabsList aria-label="Planos">
              <TabsTrigger value="ativo">Ativo</TabsTrigger>
              <TabsTrigger value="anteriores">Anteriores</TabsTrigger>
            </TabsList>
          </Tabs>
        </TabsContent>
      </Tabs>,
    );
    expect(screen.getByRole("tablist", { name: "Planos" })).toHaveAttribute("aria-orientation", "horizontal");
    expect(screen.getByRole("tab", { name: "Ativo" })).toHaveAttribute("data-orientation", "horizontal");
  });

  it("passa no axe", async () => {
    const { container } = render(<Perfil orientation="vertical" />);
    expect(await violations(container)).toEqual([]);
  });
});
