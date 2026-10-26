import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";

import { Badge } from "../badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./index";

// jsdom não tem layout: contraste e a grade de duas colunas ficam com o navegador.
const violations = async (container: HTMLElement) =>
  (await axe.run(container, { rules: { "color-contrast": { enabled: false } } })).violations;

// As classes da horizontal até a 0.16.1 — a decisão da PO (Abas · sublinhado).
const HORIZONTAL = {
  root: [] as string[],
  list: "grid h-12 w-full auto-cols-fr grid-flow-col items-stretch rounded-none border-b border-border bg-transparent p-0 text-muted-foreground".split(" "),
  trigger:
    "relative -mb-px inline-flex h-12 items-center justify-center whitespace-nowrap rounded-none border-b-2 border-transparent bg-transparent px-3 text-sm font-normal text-muted-foreground ring-offset-background transition-colors motion-reduce:!transition-none hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-primary-ink data-[state=active]:font-semibold data-[state=active]:text-primary-ink data-[state=active]:shadow-none".split(" "),
  content: "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2".split(" "),
};

/** Toda classe que não era da horizontal só vale sob `data-orientation="vertical"`. */
const soNaVertical = (element: HTMLElement, horizontal: string[]) => {
  const classes = element.className.split(/\s+/).filter(Boolean);
  for (const c of horizontal) expect(classes).toContain(c);
  for (const c of classes.filter((c) => !horizontal.includes(c)))
    expect(c.split(":").slice(0, -1)).toContain("data-[orientation=vertical]");
};

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
});

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
