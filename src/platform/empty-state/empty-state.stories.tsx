import type { Meta, StoryObj } from "@storybook/react-vite";
import { Inbox } from "lucide-react";
import { Button } from "../../core/button";
import { EmptyState } from "./index";

const meta = {
  title: "Platform/Padrões/EmptyState",
  component: EmptyState,
  args: { title: "Nenhum colaborador encontrado" },
} satisfies Meta<typeof EmptyState>;
export default meta;
type Story = StoryObj<typeof meta>;

/** O mínimo: uma frase específica sobre o que não foi encontrado. */
export const Padrao: Story = {};

/** Quando a frase não basta para explicar por que está vazio. */
export const ComDescricao: Story = {
  args: { description: "Ajuste os filtros ou convide alguém para começar." },
};

/** Com ícone, quando a listagem é visualmente densa e o vazio precisa se destacar. */
export const ComIcone: Story = { args: { icon: <Inbox /> } };

/** Quando existe um próximo passo claro, ele entra como ação. */
export const ComAcao: Story = {
  args: {
    icon: <Inbox />,
    description: "Convide colaboradores para vê-los aqui.",
    action: <Button>Convidar colaborador</Button>,
  },
};
