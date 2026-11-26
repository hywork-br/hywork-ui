import type { Meta, StoryObj } from "@storybook/react-vite";
import { Timeline } from "./index";

const meta = {
  title: "Platform/Padrões/Timeline",
  component: Timeline,
  args: {
    className: "w-[420px]",
    items: [
      { id: "1", title: "Resgate entregue", timestamp: "12/11/2026 14:30", tone: "positive" },
      { id: "2", title: "Em separação", description: "O pedido foi aprovado.", timestamp: "11/11/2026 09:10", tone: "attention" },
      { id: "3", title: "Resgate solicitado.", description: "120 HYC reservadas.", timestamp: "10/11/2026 18:02" },
    ],
  },
  parameters: {
    docs: { description: { component: "Histórico em lista semântica (`<ol>`), na ordem recebida: mande o mais recente primeiro." } },
  },
} satisfies Meta<typeof Timeline>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
export const Tons: Story = {
  args: {
    items: (["neutral", "positive", "attention", "negative", "informative"] as const).map((tone) => ({
      id: tone,
      title: `Tom ${tone}`,
      tone,
    })),
  },
};
export const ItemUnico: Story = { args: { items: [{ id: "x", title: "Envio recebido" }] } };
