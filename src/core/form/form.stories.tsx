import type { Meta, StoryObj } from "@storybook/react-vite";
import { useForm } from "react-hook-form";
import { Button } from "../button";
import { Input } from "../input";
import { FormMessage } from "../form-message";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "./index";

const meta = { title: "Core/Form" } satisfies Meta;
export default meta;
type Story = StoryObj;

/**
 * Campo do react-hook-form. Rótulo, campo e mensagem a 6px um do outro — o
 * respiro da amostra eleita (Rótulo · Opção B, Erro · Opção B).
 */
export const ComErro: Story = {
  render: function Render() {
    const form = useForm({ defaultValues: { email: "ana@" } });
    return (
      <Form {...form}>
        <form
          className="w-[360px] space-y-4"
          onSubmit={form.handleSubmit(() => undefined)}
        >
          <FormField
            control={form.control}
            name="email"
            rules={{ pattern: { value: /.+@.+\..+/, message: "Informe um e-mail válido" } }}
            render={({ field }) => (
              <FormItem>
                <FormLabel required>E-mail</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>Usado para o convite.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Enviar</Button>
        </form>
      </Form>
    );
  },
};
