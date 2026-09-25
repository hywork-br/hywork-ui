import type { Meta, StoryObj } from "@storybook/react-vite";
import { FormMessage } from "../form-message";
import { Label } from "../label";
import { Input } from "./index";

const meta = {
  title: "Core/Input",
  component: Input,
  args: { placeholder: "Nome do colaborador" },
} satisfies Meta<typeof Input>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Em repouso. Raio 4 — a busca é que tem raio total, ver Core/SearchInput. */
export const Padrao: Story = {};

/** Com valor. */
export const Preenchido: Story = { args: { defaultValue: "Ana Souza" } };

/** Com rótulo, que é como o campo aparece num formulário. */
export const ComRotulo: Story = {
  render: (args) => (
    <div className="space-y-1.5">
      <Label htmlFor="nome">Nome</Label>
      <Input id="nome" {...args} />
    </div>
  ),
};

/** Em erro: a mensagem cola no campo, sem respiro acima. */
export const ComErro: Story = {
  render: (args) => (
    <div className="space-y-1.5">
      <Label htmlFor="email">E-mail</Label>
      <Input id="email" {...args} defaultValue="ana@" aria-invalid />
      <FormMessage>Informe um e-mail válido.</FormMessage>
    </div>
  ),
};

/** Indisponível — em geral porque outro campo ainda não foi preenchido. */
export const Desabilitado: Story = { args: { disabled: true, defaultValue: "Ana Souza" } };
