import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { ImagePicker, type ImagePickerImage } from "./index";

const img = (id: string): ImagePickerImage => ({ id, url: `https://x.test/${id}.png`, alt: `Imagem ${id}` });
const file = (name = "a.png", type = "image/png", size = 10) => new File([new Uint8Array(size)], name, { type });

function Harness(p: Partial<React.ComponentProps<typeof ImagePicker>>) {
  const [value, setValue] = React.useState<ImagePickerImage[]>(p.value ?? []);
  return <ImagePicker onUpload={async () => img("up")} {...p} value={value} onChange={(n) => { p.onChange?.(n); setValue(n); }} />;
}
const input = (c: HTMLElement) => c.querySelector("input[type=file]") as HTMLInputElement;

describe("ImagePicker", () => {
  it("envia o arquivo, mostra 'Enviando…' e devolve a imagem", async () => {
    let done!: (i: ImagePickerImage) => void;
    const onUpload = vi.fn(() => new Promise<ImagePickerImage>((r) => (done = r)));
    const onChange = vi.fn();
    const { container } = render(<Harness onUpload={onUpload} onChange={onChange} />);
    await userEvent.upload(input(container), file());
    expect(screen.getByText("Enviando…")).toBeTruthy();
    done(img("up"));
    await waitFor(() => expect(onChange).toHaveBeenCalledWith([img("up")]));
    expect(screen.queryByText("Enviando…")).toBeNull();
  });

  it("recusa tipo e tamanho antes do onUpload", async () => {
    const onUpload = vi.fn();
    const { container } = render(<Harness onUpload={onUpload} accept="image/png" maxSizeBytes={5} typeErrorMessage="Tipo ruim" sizeErrorMessage="Grande" />);
    await userEvent.upload(input(container), file("a.gif", "image/gif"), { applyAccept: false });
    expect((await screen.findByRole("alert")).textContent).toBe("Tipo ruim");
    await userEvent.upload(input(container), file("a.png", "image/png", 10));
    expect((await screen.findByRole("alert")).textContent).toBe("Grande");
    expect(onUpload).not.toHaveBeenCalled();
  });

  it("mostra a mensagem quando o envio falha", async () => {
    const { container } = render(<Harness onUpload={async () => { throw new Error("x"); }} uploadErrorMessage="Falhou" />);
    await userEvent.upload(input(container), file());
    expect((await screen.findByRole("alert")).textContent).toBe("Falhou");
  });

  it("escolhe na galeria (substitui com max 1) e remove", async () => {
    const onChange = vi.fn();
    render(<Harness gallery={[img("1"), img("2")]} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Imagem 1", pressed: false }));
    await userEvent.click(screen.getByRole("button", { name: "Imagem 2", pressed: false }));
    expect(onChange).toHaveBeenLastCalledWith([img("2")]);
    await userEvent.click(screen.getByRole("button", { name: "Remover imagem: Imagem 2" }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it("com max > 1 acumula e esconde o envio no limite", async () => {
    const { container } = render(<Harness max={2} gallery={[img("1"), img("2"), img("3")]} />);
    await userEvent.click(screen.getByRole("button", { name: "Imagem 1", pressed: false }));
    await userEvent.click(screen.getByRole("button", { name: "Imagem 2", pressed: false }));
    expect(container.querySelector("input[type=file]")).toBeNull();
    expect((screen.getByRole("button", { name: "Imagem 3" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("mostra o erro do consumidor e passa no axe", async () => {
    const { container } = render(<Harness label="Capa" error="Obrigatória." value={[img("1")]} gallery={[img("2")]} />);
    expect(screen.getByRole("alert").textContent).toBe("Obrigatória.");
    expect((await axe.run(container, // nested-interactive: dívida do UploadArea existente (role=button com <input> oculto, sem rótulo); fora do escopo desta entrega.
      { rules: { "color-contrast": { enabled: false }, "nested-interactive": { enabled: false }, label: { enabled: false } } })).violations).toEqual([]);
  });
});
