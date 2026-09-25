import type { Meta, StoryObj } from "@storybook/react-vite";
import { MoreVertical, PencilLine, Trash2 } from "lucide-react";
import { Button } from "../button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "./index";

const meta = {
  title: "Core/DropdownMenu",
  component: DropdownMenu,
} satisfies Meta<typeof DropdownMenu>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A primitiva. Para as ações de uma linha de listagem, use
 * `Platform/Padrões/RowActions`, que já põe a destrutiva por último e separada.
 */
export const Padrao: Story = {
  render: () => (
    <DropdownMenu open>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Ações">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Ações</DropdownMenuLabel>
        <DropdownMenuItem className="gap-2">
          <PencilLine className="h-4 w-4" />Editar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
          <Trash2 className="h-4 w-4" />Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
