import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";

import { Input } from "../input";
import { FormMessage } from "../form-message";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./index";

function Exemplo() {
  const form = useForm({ defaultValues: { nome: "" } });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => undefined)}>
        <FormField
          control={form.control}
          name="nome"
          rules={{ required: "Informe o nome" }}
          render={({ field }) => (
            <FormItem data-testid="item">
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit">Enviar</button>
      </form>
    </Form>
  );
}

describe("Form", () => {
  it("liga o rótulo ao campo", () => {
    render(<Exemplo />);
    expect(screen.getByLabelText("Nome")).toBeInTheDocument();
  });

  it("mostra o erro do campo na mensagem, com o token de erro", async () => {
    const user = userEvent.setup();
    render(<Exemplo />);
    await user.click(screen.getByRole("button", { name: "Enviar" }));
    const alerta = await screen.findByRole("alert");
    expect(alerta).toHaveTextContent("Informe o nome");
    expect(alerta).toHaveClass("text-hw-error-text");
    expect(screen.getByLabelText("Nome")).toHaveAttribute("aria-invalid", "true");
  });

  it("dá 6px entre rótulo, campo e mensagem", () => {
    render(<Exemplo />);
    expect(screen.getByTestId("item")).toHaveClass("space-y-1.5");
  });

  it("a mesma mensagem funciona solta, fora de um campo", () => {
    render(<FormMessage>Erro avulso</FormMessage>);
    expect(screen.getByRole("alert")).toHaveTextContent("Erro avulso");
  });
});
