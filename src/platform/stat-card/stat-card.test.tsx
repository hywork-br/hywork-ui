import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import axe from "axe-core";

import { apcaContrast, hslToRgb, rgbToHsl } from "../../theme/brand";
import { StatCard, type StatCardIconTone } from "./index";

// jsdom não tem layout: o contraste fica com o Playwright e o addon-a11y.
const violations = async (container: HTMLElement) =>
  (await axe.run(container, { rules: { "color-contrast": { enabled: false } } })).violations;

describe("StatCard", () => {
  it("agrupa o cartão sob o nome do rótulo", () => {
    render(<StatCard label="Participação" value="68%" note="41 de 60 iniciaram" />);
    const cartao = screen.getByRole("group", { name: "Participação" });
    expect(cartao).toHaveTextContent("68%");
    expect(cartao).toHaveTextContent("41 de 60 iniciaram");
  });

  it("não renderiza nota nem variação quando não vêm", () => {
    render(<StatCard label="Pendências" value="12" />);
    expect(screen.getByRole("group").textContent).toBe("Pendências12");
  });

  it("aceita conteúdo livre no valor", () => {
    render(<StatCard label="Média" value={<span data-testid="valor">4,1</span>} />);
    expect(screen.getByTestId("valor")).toHaveTextContent("4,1");
  });

  it("anuncia o tom da variação, que a cor sozinha não diz", () => {
    const { rerender } = render(
      <StatCard label="Média" value="4,1" delta={{ value: "+0,2", tone: "positive" }} />,
    );
    expect(screen.getByText("+0,2")).toHaveTextContent("Variação favorável: +0,2");
    expect(screen.getByText("+0,2")).toHaveAttribute("data-tone", "positive");

    rerender(<StatCard label="Média" value="4,1" delta={{ value: "−3 p.p.", tone: "negative" }} />);
    expect(screen.getByText("−3 p.p.")).toHaveTextContent("Variação desfavorável: −3 p.p.");

    rerender(<StatCard label="Média" value="4,1" delta={{ value: "estável", tone: "neutral" }} />);
    expect(screen.getByText("estável")).toHaveTextContent("Variação: estável");
  });

  it("dá a cada tom da variação o seu par de cores", () => {
    const { rerender } = render(<StatCard label="M" value="1" delta={{ value: "+1", tone: "positive" }} />);
    expect(screen.getByText("+1").className).toContain("text-hw-status-success");
    rerender(<StatCard label="M" value="1" delta={{ value: "+1", tone: "negative" }} />);
    expect(screen.getByText("+1").className).toContain("text-hw-status-danger");
  });

  it("destaca o cartão inteiro no tom de atenção", () => {
    const { rerender } = render(<StatCard label="Pendências" value="12" note="Sem etapa iniciada" />);
    const cartao = screen.getByRole("group");
    expect(cartao).toHaveAttribute("data-tone", "default");
    expect(cartao.className).not.toContain("bg-warning");

    rerender(<StatCard label="Pendências" value="12" note="Sem etapa iniciada" tone="attention" />);
    expect(cartao).toHaveAttribute("data-tone", "attention");
    expect(cartao.className).toContain("bg-warning/10");
    expect(screen.getByText("Sem etapa iniciada").className).toContain("text-hw-status-warning");
  });

  it("esconde o ícone do leitor de tela", () => {
    render(<StatCard label="Participação" value="68%" icon={<svg data-testid="icone" />} />);
    expect(screen.getByTestId("icone").parentElement).toHaveAttribute("aria-hidden", "true");
  });

  it("com ícone, o cabeçalho guarda duas linhas do rótulo, em todos os tons; sem ícone, nada muda", () => {
    // A altura medida, numa fileira de 226px, fica em tests/browser/indicators.spec.ts.
    const cabecalho = (container: HTMLElement) => container.querySelector("[data-part=header]")!;
    const { container, rerender } = render(<StatCard label="Abaixo do esperado" value="2" icon={<svg />} />);
    for (const tone of ["default", "attention", "highlight"] as const) {
      rerender(<StatCard label="Abaixo do esperado" value="2" icon={<svg />} tone={tone} />);
      expect(cabecalho(container), tone).toHaveClass("min-h-[calc(2*var(--hw-leading-sm))]", "items-center");
      expect(cabecalho(container).querySelector("[id]")!.className, tone).not.toMatch(/truncate|line-clamp|overflow-hidden/);
    }
    rerender(<StatCard label="Abaixo do esperado" value="2" />);
    expect(cabecalho(container).className).not.toMatch(/min-h-/);
  });

  it("passa na auditoria do axe, no padrão, em atenção e no destaque", async () => {
    const { container } = render(
      <div>
        <StatCard label="Participação" value="68%" note="41 de 60" icon={<svg />} delta={{ value: "+5 p.p.", tone: "positive" }} />
        <StatCard label="Pendências" value="12" note="Sem etapa iniciada" tone="attention" iconTone="danger" icon={<svg />} />
        <StatCard
          label="Nota final"
          value="84%"
          valueDetail="4,2 / 5,0"
          progress={84}
          note="Média ponderada"
          tone="highlight"
          icon={<svg />}
          delta={{ value: "+0,3", tone: "positive" }}
        />
      </div>,
    );
    expect(await violations(container)).toEqual([]);
  });
});

const quadradinho = () => screen.getByTestId("icone").parentElement!;

describe("StatCard — cor do ícone", () => {
  it("sem iconTone, o ícone segue a primária, e o aviso em atenção, como antes", () => {
    const { rerender } = render(<StatCard label="M" value="1" icon={<svg data-testid="icone" />} />);
    expect(quadradinho()).toHaveClass("bg-primary/10", "text-primary");
    expect(quadradinho()).not.toHaveAttribute("data-icon-tone");

    rerender(<StatCard label="M" value="1" tone="attention" icon={<svg data-testid="icone" />} />);
    expect(quadradinho()).toHaveClass("bg-warning/15", "text-hw-status-warning");
  });

  it("cada iconTone dá o fundo suave e o traço do seu papel", () => {
    const pares: Record<StatCardIconTone, string[]> = {
      primary: ["bg-primary/10", "text-primary"],
      info: ["bg-hw-status-info/15", "text-hw-status-info"],
      success: ["bg-hw-status-success-fill/15", "text-hw-status-success"],
      warning: ["bg-warning/15", "text-hw-status-warning"],
      danger: ["bg-hw-status-danger/15", "text-hw-status-danger"],
      neutral: ["bg-muted", "text-muted-foreground"],
    };
    const { rerender } = render(<StatCard label="M" value="1" icon={<svg data-testid="icone" />} />);
    for (const [tom, classes] of Object.entries(pares)) {
      rerender(<StatCard label="M" value="1" iconTone={tom as StatCardIconTone} icon={<svg data-testid="icone" />} />);
      expect(quadradinho()).toHaveClass(...classes);
      expect(quadradinho()).toHaveAttribute("data-icon-tone", tom);
    }
  });

  it("o iconTone vence o aviso do cartão em atenção", () => {
    render(<StatCard label="M" value="1" tone="attention" iconTone="danger" icon={<svg data-testid="icone" />} />);
    expect(quadradinho()).toHaveClass("bg-hw-status-danger/15", "text-hw-status-danger");
    expect(quadradinho().className).not.toContain("bg-warning");
  });

  it("no destaque, o papel preenche o quadradinho; sem papel, o ícone fica na cor da superfície", () => {
    const { rerender } = render(<StatCard label="M" value="1" tone="highlight" icon={<svg data-testid="icone" />} />);
    expect(quadradinho()).toHaveClass("bg-background/15", "text-background");

    rerender(<StatCard label="M" value="1" tone="highlight" iconTone="success" icon={<svg data-testid="icone" />} />);
    expect(quadradinho()).toHaveClass("bg-hw-status-success", "text-success-foreground");
    rerender(<StatCard label="M" value="1" tone="highlight" iconTone="info" icon={<svg data-testid="icone" />} />);
    expect(quadradinho()).toHaveClass("bg-hw-status-info", "text-info-foreground");
  });
});

describe("StatCard — destaque", () => {
  it("fundo na tinta do texto, valor na cor da superfície, rótulo e nota atenuados", () => {
    render(<StatCard label="Nota final" value="84%" note="Média ponderada" tone="highlight" />);
    const cartao = screen.getByRole("group", { name: "Nota final" });
    expect(cartao).toHaveAttribute("data-tone", "highlight");
    expect(cartao).toHaveClass("bg-foreground", "border-foreground", "text-background");
    expect(cartao.className).not.toMatch(/\bbg-card\b|\bborder-border\b/);
    expect(screen.getByText("84%")).toHaveClass("text-background");
    expect(screen.getByText("84%").className).not.toContain("text-hw-heading");
    expect(screen.getByText("Nota final")).toHaveClass("text-background/80");
    expect(screen.getByText("Média ponderada")).toHaveClass("text-background/80");
  });

  it("a variação ganha os pares preenchidos, que se leem sobre o fundo escuro", () => {
    const { rerender } = render(
      <StatCard label="M" value="1" tone="highlight" delta={{ value: "+1", tone: "positive" }} />,
    );
    expect(screen.getByText("+1")).toHaveClass("bg-hw-status-success", "text-success-foreground");
    expect(screen.getByText("+1")).toHaveTextContent("Variação favorável: +1");
    rerender(<StatCard label="M" value="1" tone="highlight" delta={{ value: "+1", tone: "negative" }} />);
    expect(screen.getByText("+1")).toHaveClass("bg-hw-status-danger", "text-error-foreground");
    rerender(<StatCard label="M" value="1" tone="highlight" delta={{ value: "+1", tone: "neutral" }} />);
    expect(screen.getByText("+1")).toHaveClass("bg-background/15", "text-background");
  });

  it("desenha só com tokens", () => {
    const { container } = render(
      <StatCard label="M" value="84%" valueDetail="4,2 / 5,0" progress={84} tone="highlight" icon={<svg />} />,
    );
    expect(container.innerHTML).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i);
  });

  it("tem contraste APCA aceitável nos temas claro e escuro, com os tokens do pacote", () => {
    // O par do destaque é --foreground (fundo) e --background (texto), em
    // tokens/platform.css; rótulo e nota usam o texto a 80%.
    const css = readFileSync(resolve(process.cwd(), "tokens/platform.css"), "utf8");
    const bloco = (seletor: string) => {
      const inicio = css.indexOf(seletor + " {");
      const corpo = css.slice(inicio, css.indexOf("}", inicio));
      const valor = (nome: string) =>
        new RegExp(nome + ":\\s*([\\d.]+) ([\\d.]+)% ([\\d.]+)%;").exec(corpo)!.slice(1).map(Number) as [number, number, number];
      return { fundo: valor("--hw-color-foreground"), texto: valor("--hw-color-background") };
    };
    const misturar = (cor: [number, number, number], base: [number, number, number], alfa: number) => {
      const [a, b] = [hslToRgb(cor), hslToRgb(base)];
      return rgbToHsl(a.map((v, i) => v * alfa + b[i] * (1 - alfa)) as unknown as [number, number, number]);
    };
    for (const tema of [":root", ".dark"]) {
      const { fundo, texto } = bloco(tema);
      expect(Math.abs(apcaContrast(texto, fundo)), tema + " valor").toBeGreaterThanOrEqual(90);
      // o muted-foreground sobre o branco dá Lc 78,8: o atenuado do destaque fica no mesmo degrau
      expect(Math.abs(apcaContrast(misturar(texto, fundo, 0.8), fundo)), tema + " rótulo").toBeGreaterThanOrEqual(75);
    }
  });
});

describe("StatCard — detalhe do valor e barra", () => {
  it("o detalhe fica ao lado do valor, alinhado pela linha de base e livre para quebrar", () => {
    render(<StatCard label="Nota final" value="84%" valueDetail="4,2 / 5,0" />);
    const detalhe = screen.getByText("4,2 / 5,0");
    expect(detalhe).toHaveAttribute("data-part", "value-detail");
    expect(detalhe.parentElement).toHaveClass("flex", "flex-wrap", "items-baseline");
    expect(detalhe.parentElement).toContainElement(screen.getByText("84%"));
    expect(detalhe).toHaveClass("text-muted-foreground", "min-w-0");
    expect(screen.getByRole("group", { name: "Nota final" })).toHaveTextContent("Nota final84%4,2 / 5,0");
  });

  it("sem valueDetail, nenhum detalhe; aceita conteúdo livre", () => {
    const { container, rerender } = render(<StatCard label="M" value="1" />);
    expect(container.querySelector("[data-part=value-detail]")).toBeNull();
    rerender(<StatCard label="M" value="1" valueDetail={<abbr title="de cinco">/ 5</abbr>} />);
    expect(screen.getByTitle("de cinco")).toBeInTheDocument();
  });

  it("a barra é desenho: escondida do leitor de tela, com a largura do progress limitada a 0–100", () => {
    const largura = (container: HTMLElement) =>
      container.querySelector<HTMLElement>("[data-part=progress]")!.style.width;
    const { container, rerender } = render(<StatCard label="M" value="84%" progress={84} />);
    expect(container.querySelector("[data-part=progress-track]")).toHaveAttribute("aria-hidden", "true");
    expect(largura(container)).toBe("84%");
    rerender(<StatCard label="M" value="84%" progress={130} />);
    expect(largura(container)).toBe("100%");
    rerender(<StatCard label="M" value="84%" progress={-5} />);
    expect(largura(container)).toBe("0%");
    rerender(<StatCard label="M" value="84%" progress={Number.NaN} />);
    expect(largura(container)).toBe("0%");
    expect(container.innerHTML).not.toContain("NaN");
  });

  it("sem progress, nenhuma barra", () => {
    const { container } = render(<StatCard label="M" value="1" />);
    expect(container.querySelector("[data-part=progress-track]")).toBeNull();
  });

  it("a barra tem trilha e preenchimento por tom: marca no padrão, aviso em atenção, superfície no destaque", () => {
    const partes = (container: HTMLElement) => [
      container.querySelector("[data-part=progress-track]")!,
      container.querySelector("[data-part=progress]")!,
    ];
    const { container, rerender } = render(<StatCard label="M" value="1" progress={50} />);
    let [trilha, barra] = partes(container);
    expect(trilha).toHaveClass("bg-muted");
    expect(barra).toHaveClass("bg-primary-ink", "motion-reduce:!transition-none");

    rerender(<StatCard label="M" value="1" progress={50} tone="attention" />);
    [trilha, barra] = partes(container);
    expect(barra).toHaveClass("bg-warning");

    rerender(<StatCard label="M" value="1" progress={50} tone="highlight" />);
    [trilha, barra] = partes(container);
    expect(trilha).toHaveClass("bg-background/20");
    expect(barra).toHaveClass("bg-background");
  });
});
