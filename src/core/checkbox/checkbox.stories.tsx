import type { Meta, StoryObj } from "@storybook/react-vite";
import { Label } from "../label";
import { Checkbox } from "./index";

const meta = { title: "Core/Checkbox", component: Checkbox } satisfies Meta<typeof Checkbox>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Desmarcado. */
export const Padrao: Story = {};

/** Marcado. */
export const Marcado: Story = { args: { defaultChecked: true } };

/**
 * Parcial: alguns itens da página estão selecionados, mas não todos. É o estado
 * do cabeçalho de uma listagem com seleção.
 */
export const Parcial: Story = { args: { checked: "indeterminate" } };

/** Com rótulo clicável ao lado. */
export const ComRotulo: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="aceite" />
      <Label htmlFor="aceite">Exigir aceite dos colaboradores</Label>
    </div>
  ),
};

/** Indisponível. */
export const Desabilitado: Story = { args: { disabled: true, defaultChecked: true } };
