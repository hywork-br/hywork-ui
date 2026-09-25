import type { Meta, StoryObj } from "@storybook/react-vite";
import { Label } from "../label";
import { Switch } from "./index";

const meta = { title: "Core/Switch", component: Switch } satisfies Meta<typeof Switch>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Desligado.
 *
 * Diferença para o Checkbox: o interruptor aplica na hora, o checkbox só marca
 * uma escolha que um botão vai confirmar depois.
 */
export const Padrao: Story = {};

/** Ligado. */
export const Ligado: Story = { args: { defaultChecked: true } };

/** Com rótulo, que é como aparece numa tela de configuração. */
export const ComRotulo: Story = {
  render: () => (
    <div className="flex items-center justify-between gap-6 rounded-xl border p-4">
      <Label htmlFor="mfa">Exigir segundo fator</Label>
      <Switch id="mfa" defaultChecked />
    </div>
  ),
};

/** Indisponível — em geral porque falta permissão. */
export const Desabilitado: Story = { args: { disabled: true, defaultChecked: true } };
