import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

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

describe("ItemCard — horizontal intacta", () => {
  it("mesmo HTML de antes, sem `onOpen`", () => {
    const { container } = render(<Horizontal />);
    expect(container.innerHTML).toMatchInlineSnapshot(`"<div class="relative rounded-lg border border-border bg-card p-6 text-card-foreground"><div class="flex items-start gap-3"><div class="shrink-0"><span data-media="">RT</span></div><div class="min-w-0 flex-1"><div class="flex flex-wrap items-center gap-2"><h3 class="min-w-0 truncate text-base font-semibold">Relatório trimestral</h3><span data-status="">Ativo</span></div><p class="mt-1 text-sm text-muted-foreground">Atualizado há 2 dias</p></div></div><div class="mt-4"><p>Conteúdo próprio</p></div><div class="relative z-10 mt-4 flex flex-wrap items-center gap-2"><button type="button">Abrir</button></div></div>"`);
  });

  it("mesmo HTML de antes, com `onOpen`", () => {
    const { container } = render(<Horizontal onOpen={() => undefined} as="article" />);
    expect(container.innerHTML).toMatchInlineSnapshot(`"<article class="relative rounded-lg border border-border bg-card p-6 text-card-foreground cursor-pointer transition-colors motion-reduce:!transition-none hover:bg-accent/40 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"><div class="flex items-start gap-3"><div class="shrink-0"><span data-media="">RT</span></div><div class="min-w-0 flex-1"><div class="flex flex-wrap items-center gap-2"><h3 class="min-w-0 truncate text-base font-semibold"><button type="button" class="text-left outline-none after:absolute after:inset-0 after:content-['']">Relatório trimestral</button></h3><span data-status="">Ativo</span></div><p class="mt-1 text-sm text-muted-foreground">Atualizado há 2 dias</p></div></div><div class="mt-4"><p>Conteúdo próprio</p></div><div class="relative z-10 mt-4 flex flex-wrap items-center gap-2"><button type="button">Abrir</button></div></article>"`);
  });
});
