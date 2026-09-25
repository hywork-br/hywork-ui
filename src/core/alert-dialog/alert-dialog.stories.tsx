import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "./index";

const meta = {
  title: "Core/AlertDialog",
  component: AlertDialog,
} satisfies Meta<typeof AlertDialog>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Confirmação de algo que não dá para desfazer.
 *
 * Diferença para o `Dialog`: aqui não há como sair clicando fora — a pessoa
 * precisa escolher. Use só quando a ação é destrutiva de verdade.
 */
export const Padrao: Story = {
  render: () => (
    <AlertDialog open>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir permanentemente?</AlertDialogTitle>
          <AlertDialogDescription>
            O item sai da lixeira e não pode ser recuperado.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction>Excluir</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};
