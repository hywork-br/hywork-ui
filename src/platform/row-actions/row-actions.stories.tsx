import type { Meta, StoryObj } from "@storybook/react-vite";
import { Copy, Eye, PencilLine, Trash2 } from "lucide-react";
import { RowActions } from "./index";

const meta = {
  title: "Platform/Padrões/RowActions",
  component: RowActions,
  args: {
    actions: [
      { label: "Editar", onSelect: () => undefined, icon: <PencilLine className="h-4 w-4" /> },
      { label: "Duplicar", onSelect: () => undefined, icon: <Copy className="h-4 w-4" /> },
    ],
  },
} satisfies Meta<typeof RowActions>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Duas ações comuns. */
export const Padrao: Story = {};

/** Com a destrutiva: vem por último, separada e no papel de perigo. */
export const ComDestrutiva: Story = {
  args: {
    label: "Ações",
    actions: [
      { label: "Visualizar", onSelect: () => undefined, icon: <Eye className="h-4 w-4" /> },
      { label: "Editar", onSelect: () => undefined, icon: <PencilLine className="h-4 w-4" /> },
      {
        label: "Excluir",
        onSelect: () => undefined,
        icon: <Trash2 className="h-4 w-4" />,
        destructive: true,
      },
    ],
  },
};

/** Item indisponível para esta linha — aparece, mas não aciona. */
export const ComItemDesabilitado: Story = {
  args: {
    actions: [
      { label: "Editar", onSelect: () => undefined },
      { label: "Publicar", onSelect: () => undefined, disabled: true },
    ],
  },
};

/** A linha inteira está ocupada (sendo removida, por exemplo). */
export const Desabilitado: Story = { args: { disabled: true } };
