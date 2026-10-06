import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../button";
import { Toaster, toast } from "./index";

const meta = { title: "Core/Toast", component: Toaster } satisfies Meta<typeof Toaster>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Aviso passageiro de resultado de ação. O `Toaster` fica uma vez na raiz da aplicação. */
export const Padrao: Story = {
  render: () => (
    <>
      <Button onClick={() => toast({ title: "Alterações salvas", description: "O espaço foi atualizado." })}>
        Salvar
      </Button>
      <Toaster />
    </>
  ),
};

export const Erro: Story = {
  render: () => (
    <>
      <Button
        variant="destructive"
        onClick={() => toast({ variant: "destructive", title: "Não foi possível salvar", description: "Tente de novo." })}
      >
        Falhar
      </Button>
      <Toaster />
    </>
  ),
};
