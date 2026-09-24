import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./index";

function Exemplo() {
  return (
    <Dialog open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Conectar</DialogTitle>
          <DialogDescription>Leva uns 5 minutos.</DialogDescription>
        </DialogHeader>
        <p>Corpo</p>
        <DialogFooter>
          <button type="button">Cancelar</button>
          <button type="button">Continuar</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Decisão da PO de 23/09 (DOMAIN_MODEL.md, Modal): rodapé à direita, botões no tamanho padrão,
// nunca largura total; e o conteúdo precisa de respiro entre cabeçalho, corpo e rodapé.
describe("Dialog", () => {
  it("separa cabeçalho, corpo e rodapé", () => {
    render(<Exemplo />);
    const corpo = screen.getByText("Corpo").parentElement!;
    expect(corpo.className).toContain("gap-6");
  });

  it("mantém o rodapé em linha, à direita, sem empilhar em largura total", () => {
    render(<Exemplo />);
    const rodape = screen.getByRole("button", { name: "Continuar" }).parentElement!;
    expect(rodape.className).toContain("flex-row");
    expect(rodape.className).toContain("justify-end");
    expect(rodape.className).not.toContain("flex-col-reverse");
  });

  it("dá ao botão de fechar um alvo de 40px com nome em português", () => {
    render(<Exemplo />);
    const fechar = screen.getByRole("button", { name: "Fechar" });
    expect(fechar.className).toContain("h-10");
    expect(fechar.className).toContain("w-10");
  });
});
