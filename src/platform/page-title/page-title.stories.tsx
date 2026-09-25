import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../../core/button";
import { PageTitle } from "./index";

const meta = {
  title: "Platform/Padrões/PageTitle",
  component: PageTitle,
  args: { title: "Gestão de usuários" },
} satisfies Meta<typeof PageTitle>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Só o título, quando a tela se explica sozinha. */
export const Padrao: Story = {};

/** Com a linha que diz o que a tela faz. */
export const ComDescricao: Story = {
  args: { description: "Administre acessos, permissões e convites." },
};

/** Com a ação principal da página à direita. */
export const ComAcao: Story = {
  args: {
    description: "Administre acessos, permissões e convites.",
    actions: <Button>Convidar colaborador</Button>,
  },
};

/** Com mais de uma ação — a principal por último, à direita. */
export const ComVariasAcoes: Story = {
  args: {
    actions: (
      <>
        <Button variant="outline">Exportar</Button>
        <Button>Convidar colaborador</Button>
      </>
    ),
  },
};
