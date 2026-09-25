import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "../input";
import { Label } from "../label";
import { FormMessage } from "./index";

const meta = {
  title: "Core/FormMessage",
  component: FormMessage,
  args: { children: "Informe um e-mail válido." },
} satisfies Meta<typeof FormMessage>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Sozinha. */
export const Padrao: Story = {};

/** Colada ao campo, que é o ponto da decisão: sem respiro acima. */
export const AbaixoDoCampo: Story = {
  render: (args) => (
    <div className="space-y-1.5">
      <Label htmlFor="email">E-mail</Label>
      <Input id="email" defaultValue="ana@" aria-invalid />
      <FormMessage {...args} />
    </div>
  ),
};

/** Sem mensagem, nada é renderizado — a tela não precisa do condicional. */
export const Vazia: Story = { args: { children: undefined } };
