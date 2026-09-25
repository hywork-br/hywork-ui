import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../button";
import {
  Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle,
} from "./index";

const meta = { title: "Core/Sheet", component: Sheet } satisfies Meta<typeof Sheet>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Painel que entra pela lateral.
 *
 * Use quando a pessoa precisa consultar a tela enquanto edita — um formulário
 * longo ao lado da listagem. Para confirmar algo, o `Dialog` interrompe menos.
 */
export const Padrao: Story = {
  render: () => (
    <Sheet open>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Editar colaborador</SheetTitle>
          <SheetDescription>As alterações valem no próximo acesso.</SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <Button variant="outline">Cancelar</Button>
          <Button>Salvar</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};
