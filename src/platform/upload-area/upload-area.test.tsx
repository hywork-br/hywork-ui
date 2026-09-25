import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { UploadArea } from "./index";

const arquivo = () => new File(["x"], "contrato.pdf", { type: "application/pdf" });

describe("UploadArea", () => {
  it("devolve os arquivos soltos na área", () => {
    const onSelect = vi.fn();
    render(<UploadArea title="Envie o contrato" onSelect={onSelect} />);
    const area = screen.getByRole("button", { name: /Envie o contrato/ });
    fireEvent.drop(area, { dataTransfer: { files: [arquivo()] } });
    expect(onSelect).toHaveBeenCalledWith([expect.objectContaining({ name: "contrato.pdf" })]);
  });

  it("ignora um soltar sem arquivo", () => {
    const onSelect = vi.fn();
    render(<UploadArea title="Envie o contrato" onSelect={onSelect} />);
    fireEvent.drop(screen.getByRole("button", { name: /Envie o contrato/ }), {
      dataTransfer: { files: [] },
    });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("não aceita arquivo quando desabilitada", () => {
    const onSelect = vi.fn();
    render(<UploadArea title="Envie o contrato" onSelect={onSelect} disabled />);
    fireEvent.drop(screen.getByRole("button", { name: /Envie o contrato/ }), {
      dataTransfer: { files: [arquivo()] },
    });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("sai do alcance do teclado quando desabilitada", () => {
    render(<UploadArea title="Envie o contrato" onSelect={() => undefined} disabled />);
    expect(screen.getByRole("button", { name: /Envie o contrato/ })).toHaveAttribute(
      "tabindex",
      "-1",
    );
  });
});
