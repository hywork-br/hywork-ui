import type { Meta, StoryObj } from "@storybook/react-vite";
import { Separator } from "./index";

const meta = { title: "Core/Separator", component: Separator } satisfies Meta<typeof Separator>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Entre dois blocos de uma mesma seção. */
export const Horizontal: Story = {
  render: () => (
    <div className="w-[360px] space-y-4">
      <p className="text-sm">Dados do colaborador</p>
      <Separator />
      <p className="text-sm text-muted-foreground">Acesso e permissões</p>
    </div>
  ),
};

/** Entre itens numa linha. */
export const Vertical: Story = {
  render: () => (
    <div className="flex h-6 items-center gap-3 text-sm">
      <span>Rascunho</span>
      <Separator orientation="vertical" />
      <span>Atualizado hoje</span>
      <Separator orientation="vertical" />
      <span>Ana Souza</span>
    </div>
  ),
};
