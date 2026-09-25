import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertCircle } from "lucide-react";
import { Button } from "../../core/button";
import { ErrorState } from "./index";

const meta = {
  title: "Platform/Padrões/ErrorState",
  component: ErrorState,
  args: { title: "Não foi possível carregar os colaboradores" },
} satisfies Meta<typeof ErrorState>;
export default meta;
type Story = StoryObj<typeof meta>;

/** O mínimo: o que falhou, em uma frase. */
export const Padrao: Story = {};

/** A mensagem do erro entra como descrição, sem virar a frase principal. */
export const ComDetalhe: Story = {
  args: { description: "Request failed with status code 500" },
};

/** Com ícone, quando a listagem é densa e a falha precisa se destacar. */
export const ComIcone: Story = { args: { icon: <AlertCircle /> } };

/** Quando repetir a chamada pode resolver, a ação entra. */
export const ComAcao: Story = {
  args: {
    icon: <AlertCircle />,
    description: "A conexão caiu no meio da carga.",
    action: <Button variant="outline">Tentar novamente</Button>,
  },
};
