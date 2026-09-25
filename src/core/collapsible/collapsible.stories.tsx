import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./index";

const meta = {
  title: "Core/Collapsible",
  component: Collapsible,
} satisfies Meta<typeof Collapsible>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Esconde um trecho sem título próprio.
 *
 * Diferença para o Accordion: ali há uma lista de seções com rótulo; aqui é um
 * bloco só, em geral "configurações avançadas".
 */
export const Padrao: Story = {
  render: () => (
    <Collapsible defaultOpen className="w-[420px] space-y-2">
      <CollapsibleTrigger asChild>
        <Button variant="ghost">Configurações avançadas</Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="rounded-xl border p-4 text-sm text-muted-foreground">
        Tempo limite, tentativas e janela de sincronização.
      </CollapsibleContent>
    </Collapsible>
  ),
};
