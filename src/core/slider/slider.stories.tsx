import type { Meta, StoryObj } from "@storybook/react-vite";
import { Label } from "../label";
import { Slider } from "./index";

const meta = {
  title: "Core/Slider",
  component: Slider,
  args: { className: "w-[360px]" },
} satisfies Meta<typeof Slider>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Escolha aproximada numa faixa contínua. */
export const Padrao: Story = { args: { defaultValue: [70], max: 100, step: 1 } };

/**
 * Com o valor à vista.
 *
 * Sempre mostre o número: sozinho, o controle diz "mais ou menos aqui", e
 * critérios como progresso mínimo precisam de precisão.
 */
export const ComValor: Story = {
  render: () => (
    <div className="w-[360px] space-y-2">
      <div className="flex justify-between">
        <Label>Progresso mínimo</Label>
        <span className="text-sm text-muted-foreground">80%</span>
      </div>
      <Slider defaultValue={[80]} max={100} step={5} />
    </div>
  ),
};

/** Indisponível. */
export const Desabilitado: Story = { args: { defaultValue: [40], disabled: true } };
