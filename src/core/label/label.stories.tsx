import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "../input";
import { Label } from "./index";

const meta = {
  title: "Core/Label",
  component: Label,
  args: { children: "Nome do colaborador" },
} satisfies Meta<typeof Label>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Decisão da PO: 14px, peso 600, cor de texto principal. */
export const Padrao: Story = {};

/** Ligado ao campo por `htmlFor`: clicar no rótulo foca o campo. */
export const LigadoAoCampo: Story = {
  render: (args) => (
    <div className="space-y-1.5">
      <Label htmlFor="nome" {...args} />
      <Input id="nome" placeholder="Ana Souza" />
    </div>
  ),
};

/** Campo obrigatório. O asterisco usa o token de erro, não vermelho literal. */
export const Obrigatorio: Story = {
  render: () => (
    <Label htmlFor="email">
      E-mail <span className="text-hw-error-text">*</span>
    </Label>
  ),
};
