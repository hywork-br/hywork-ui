import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./index";

const meta = { title: "Core/Tooltip", component: Tooltip } satisfies Meta<typeof Tooltip>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Explica um controle que não cabe rotular.
 *
 * Não serve para informação que a pessoa precisa ler: quem usa teclado ou
 * toque pode nunca abrir. Se é necessário, escreva na tela.
 */
export const Padrao: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip open>
        <TooltipTrigger asChild>
          <Button variant="outline">Sincronizar</Button>
        </TooltipTrigger>
        <TooltipContent>Busca os colaboradores no RH agora</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};
