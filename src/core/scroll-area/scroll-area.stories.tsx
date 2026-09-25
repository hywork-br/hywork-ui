import type { Meta, StoryObj } from "@storybook/react-vite";
import { ScrollArea } from "./index";

const meta = {
  title: "Core/ScrollArea",
  component: ScrollArea,
} satisfies Meta<typeof ScrollArea>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Rolagem com barra própria, igual em todos os navegadores.
 *
 * Use quando o bloco tem altura fixa dentro de uma tela que já rola — a lista
 * de opções de um seletor, por exemplo. Não use na página inteira.
 */
export const Padrao: Story = {
  render: () => (
    <ScrollArea className="h-56 w-[320px] rounded-xl border p-3">
      <div className="space-y-2 text-sm">
        {Array.from({ length: 24 }).map((_, i) => (
          <p key={i}>Estrutura organizacional {i + 1}</p>
        ))}
      </div>
    </ScrollArea>
  ),
};
