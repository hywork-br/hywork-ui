import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Dialog, DialogContent, DialogFooter, DialogTitle } from "./index";

const abrir = (rodape: React.ReactNode) =>
  render(
    <Dialog open>
      <DialogContent>
        <DialogTitle>Confirmar</DialogTitle>
        <DialogFooter>{rodape}</DialogFooter>
      </DialogContent>
    </Dialog>,
  );

describe("DialogFooter", () => {
  it("não deixa os botões esticarem quando empilham", () => {
    const { container } = abrir(<button>Salvar</button>);
    const rodape = container.ownerDocument.querySelector(".flex-col-reverse");
    // `items-end` é o que impede o `stretch` padrão do flex em coluna.
    expect(rodape).toHaveClass("items-end");
    expect(rodape).not.toHaveClass("items-stretch");
  });

  it("alinha à direita e separa por 8px na horizontal", () => {
    const { container } = abrir(<button>Salvar</button>);
    const rodape = container.ownerDocument.querySelector(".flex-col-reverse");
    expect(rodape).toHaveClass("sm:justify-end");
    expect(rodape).toHaveClass("gap-2");
  });

  it("mantém a ação principal depois da secundária na marcação", () => {
    abrir(
      <>
        <button>Cancelar</button>
        <button>Salvar</button>
      </>,
    );
    const botoes = screen.getAllByRole("button").filter((b) => b.textContent !== "Close");
    expect(botoes.map((b) => b.textContent)).toEqual(["Cancelar", "Salvar"]);
  });
});

describe("DialogContent", () => {
  it("limita a altura e rola por dentro", () => {
    const { container } = render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Longo</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    const conteudo = container.ownerDocument.querySelector('[role="dialog"]');
    expect(conteudo).toHaveClass("max-h-[90lvh]");
    expect(conteudo).toHaveClass("overflow-y-auto");
  });
});
