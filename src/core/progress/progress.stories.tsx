import type { Meta, StoryObj } from "@storybook/react-vite";
import { Progress } from "./index";

const meta = {
  title: "Core/Progress",
  component: Progress,
  args: { className: "w-[360px]" },
} satisfies Meta<typeof Progress>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Começo. */
export const Inicio: Story = { args: { value: 0 } };

/** Em curso. */
export const EmCurso: Story = { args: { value: 45 } };

/** Concluído. */
export const Concluido: Story = { args: { value: 100 } };

/**
 * Com o número ao lado.
 *
 * Use quando dá para saber quanto falta. Quando não dá — uma chamada sem
 * progresso —, o certo é o `Skeleton`.
 */
export const ComRotulo: Story = {
  render: () => (
    <div className="w-[360px] space-y-2">
      <div className="flex justify-between text-sm">
        <span>Importando colaboradores</span>
        <span className="text-muted-foreground">82 de 140</span>
      </div>
      <Progress value={58} />
    </div>
  ),
};
