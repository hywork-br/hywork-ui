import type { Meta, StoryObj } from "@storybook/react-vite";
import { FormMessage } from "../form-message";
import { Label } from "../label";
import { Textarea } from "./index";

const meta = {
  title: "Core/Textarea",
  component: Textarea,
  args: { placeholder: "Descreva o valor de cultura" },
} satisfies Meta<typeof Textarea>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Vazio. */
export const Padrao: Story = {};

/** Com texto. */
export const Preenchido: Story = {
  args: { defaultValue: "Reconhecemos quem ajuda o time a entregar melhor." },
};

/** Com rótulo e erro, colados ao campo. */
export const ComErro: Story = {
  render: (args) => (
    <div className="space-y-1.5">
      <Label htmlFor="desc">Descrição</Label>
      <Textarea id="desc" {...args} aria-invalid />
      <FormMessage>A descrição é obrigatória.</FormMessage>
    </div>
  ),
};

/** Indisponível. */
export const Desabilitado: Story = { args: { disabled: true, defaultValue: "Texto travado" } };
