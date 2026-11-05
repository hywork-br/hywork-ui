import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";

import { ItemCard } from "./index";

describe("ItemCard", () => {
  it("expõe o título como heading", () => {
    render(<ItemCard title="Desafio de integração" />);
    expect(screen.getByRole("heading", { name: "Desafio de integração" })).toBeInTheDocument();
  });

  it("aceita mudar o nível do heading conforme o contexto da página", () => {
    render(<ItemCard title="Item" titleAs="h4" />);
    expect(screen.getByRole("heading", { level: 4, name: "Item" })).toBeInTheDocument();
  });

  it("não vira botão quando não é clicável", () => {
    render(<ItemCard title="Item" description="Encerra em 12 dias" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("torna o título acionável quando o card abre algo", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<ItemCard title="Item" onOpen={onOpen} />);
    await user.click(screen.getByRole("button", { name: "Item" }));
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it("alcança o card clicável pelo teclado", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<ItemCard title="Item" onOpen={onOpen} />);
    await user.tab();
    expect(screen.getByRole("button", { name: "Item" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it("acomoda estado e ações", () => {
    render(
      <ItemCard title="Item" status={<span>Ativo</span>} actions={<button>Abrir</button>} />,
    );
    expect(screen.getByText("Ativo")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Abrir" })).toBeInTheDocument();
  });
});

describe("ItemCard — semântica do container", () => {
  it("renderiza div por padrão", () => {
    const { container } = render(<ItemCard title="Item" />);
    expect(container.firstElementChild?.tagName).toBe("DIV");
  });

  it("vira article quando o card é um item de listagem", () => {
    const { container } = render(<ItemCard title="Item" as="article" />);
    expect(container.firstElementChild?.tagName).toBe("ARTICLE");
  });

  it("ações no pé, a 16px do conteúdo, mesmo quando a grade estica o card", () => {
    render(
      <ItemCard as="article" title="Item" description="Uma linha" actions={<button>Abrir</button>}>
        <p>Conteúdo</p>
      </ItemCard>,
    );
    const card = screen.getByRole("article");
    // O vão vem do gap do card: o `mt-auto` das ações não o anula.
    expect(card).toHaveClass("flex", "flex-col", "gap-4");
    const actions = screen.getByRole("button", { name: "Abrir" }).parentElement;
    expect(actions).toHaveClass("mt-auto");
    expect(actions?.className).not.toMatch(/\bmt-4\b/);
  });
});

// A horizontal até a 0.16.1, gravada antes da vertical existir: qualquer
// mudança de classe ou de estrutura nela reprova aqui.
function Horizontal(props: Partial<React.ComponentProps<typeof ItemCard>>) {
  return (
    <ItemCard
      title="Relatório trimestral"
      description="Atualizado há 2 dias"
      media={<span data-media="">RT</span>}
      status={<span data-status="">Ativo</span>}
      actions={<button type="button">Abrir</button>}
      {...props}
    >
      <p>Conteúdo próprio</p>
    </ItemCard>
  );
}

// HTML fixo da forma horizontal: a vertical (0.17.0) não pode mexer nela. A única mudança
// desde então é a de 16/10 (coluna com vão de 16px e ações no pé, ver CHANGELOG).
describe("ItemCard — horizontal fixa", () => {
  it("HTML da forma horizontal, sem `onOpen`", () => {
    const { container } = render(<Horizontal />);
    expect(container.innerHTML).toMatchInlineSnapshot(`"<div class="relative rounded-lg border border-border bg-card p-6 text-card-foreground flex flex-col gap-4"><div class="flex items-start gap-3"><div class="shrink-0"><span data-media="">RT</span></div><div class="min-w-0 flex-1"><div class="flex flex-wrap items-center gap-2"><h3 class="min-w-0 truncate text-base font-semibold">Relatório trimestral</h3><span data-status="">Ativo</span></div><p class="mt-1 text-sm text-muted-foreground">Atualizado há 2 dias</p></div></div><div><p>Conteúdo próprio</p></div><div class="relative z-10 mt-auto flex flex-wrap items-center gap-2"><button type="button">Abrir</button></div></div>"`);
  });

  it("HTML da forma horizontal, com `onOpen`", () => {
    const { container } = render(<Horizontal onOpen={() => undefined} as="article" />);
    expect(container.innerHTML).toMatchInlineSnapshot(`"<article class="relative rounded-lg border border-border bg-card p-6 text-card-foreground flex flex-col gap-4 cursor-pointer transition-colors motion-reduce:!transition-none hover:bg-accent/40 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"><div class="flex items-start gap-3"><div class="shrink-0"><span data-media="">RT</span></div><div class="min-w-0 flex-1"><div class="flex flex-wrap items-center gap-2"><h3 class="min-w-0 truncate text-base font-semibold"><button type="button" class="text-left outline-none after:absolute after:inset-0 after:content-['']">Relatório trimestral</button></h3><span data-status="">Ativo</span></div><p class="mt-1 text-sm text-muted-foreground">Atualizado há 2 dias</p></div></div><div><p>Conteúdo próprio</p></div><div class="relative z-10 mt-auto flex flex-wrap items-center gap-2"><button type="button">Abrir</button></div></article>"`);
  });
});

describe("ItemCard — vertical", () => {
  it("`orientation=\"horizontal\"` explícito é igual a não passar nada", () => {
    const sem = render(<Horizontal />).container.innerHTML;
    const com = render(<Horizontal orientation="horizontal" />).container.innerHTML;
    expect(com).toBe(sem);
  });

  it("empilha mídia, título, descrição, estado, conteúdo e ações, nessa ordem", () => {
    const { container } = render(<Horizontal orientation="vertical" />);
    const card = container.firstElementChild as HTMLElement;
    expect(card).toHaveAttribute("data-orientation", "vertical");
    expect(card).toHaveClass("flex", "flex-col", "items-center", "text-center");
    const ordem = [
      card.querySelector("[data-media]"),
      screen.getByRole("heading", { name: "Relatório trimestral" }),
      screen.getByText("Atualizado há 2 dias"),
      card.querySelector("[data-status]"),
      screen.getByText("Conteúdo próprio"),
      screen.getByRole("button", { name: "Abrir" }),
    ];
    for (let i = 1; i < ordem.length; i++)
      expect(ordem[i - 1]!.compareDocumentPosition(ordem[i]!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("mantém a moldura da decisão da PO: raio 12, respiro 24, borda, sem sombra", () => {
    const { container } = render(<ItemCard orientation="vertical" title="Item" />);
    const card = container.firstElementChild as HTMLElement;
    expect(card).toHaveClass("rounded-lg", "p-6", "border", "border-border", "bg-card");
    expect(card.className).not.toMatch(/shadow/);
  });

  it("a mídia ganha o quadro de 108px, que o filho preenche", () => {
    const { container } = render(<Horizontal orientation="vertical" />);
    const quadro = container.querySelector("[data-media]")!.parentElement!;
    expect(quadro).toHaveClass("h-[108px]", "w-[108px]", "[&>*]:h-full", "[&>*]:w-full");
  });

  it("o título fica numa linha, com reticências", () => {
    render(<ItemCard orientation="vertical" title="Um título comprido demais para caber" />);
    expect(screen.getByRole("heading")).toHaveClass("truncate", "w-full");
  });

  it("as ações ocupam a largura e ficam presas ao pé do card", () => {
    render(<Horizontal orientation="vertical" />);
    const pe = screen.getByRole("button", { name: "Abrir" }).parentElement!;
    expect(pe).toHaveClass("mt-auto", "w-full", "[&>*]:w-full");
  });

  it("sem mídia, estado, conteúdo nem ações, não deixa caixa vazia", () => {
    const { container } = render(<ItemCard orientation="vertical" title="Item" />);
    expect(container.firstElementChild!.children).toHaveLength(1);
  });

  it("clicável: o título abre, pelo mouse e pelo teclado; a ação não abre", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const onAcao = vi.fn();
    render(
      <ItemCard
        orientation="vertical"
        title="Item"
        onOpen={onOpen}
        actions={
          <button type="button" onClick={onAcao}>
            Acompanhar
          </button>
        }
      />,
    );
    await user.tab();
    expect(screen.getByRole("button", { name: "Item" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onOpen).toHaveBeenCalledOnce();
    await user.click(screen.getByRole("button", { name: "Acompanhar" }));
    expect(onAcao).toHaveBeenCalledOnce();
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it("vira li dentro de uma lista de cards", () => {
    const { container } = render(
      <ul>
        <ItemCard as="li" orientation="vertical" title="Item" />
      </ul>,
    );
    expect(container.querySelector("ul > li")).toHaveAttribute("data-orientation", "vertical");
  });

  it("passa no axe", async () => {
    const { container } = render(
      <ul>
        <ItemCard as="li" orientation="vertical" title="Item" description="Descrição" status={<span>Ativo</span>} actions={<button type="button">Abrir</button>} />
      </ul>,
    );
    const resultado = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(resultado.violations).toEqual([]);
  });
});
