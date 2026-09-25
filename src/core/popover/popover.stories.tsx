import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../button";
import { Popover, PopoverContent, PopoverTrigger } from "./index";

const meta = { title: "Core/Popover", component: Popover } satisfies Meta<typeof Popover>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Painel ancorado num controle.
 *
 * Use para escolher algo — período, estrutura, cor. Se a escolha é uma lista de
 * ações, o certo é o `DropdownMenu`.
 */
export const Padrao: Story = {
  render: () => (
    <Popover open>
      <PopoverTrigger asChild>
        <Button variant="outline">Período</Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 space-y-1">
        {["Últimos 7 dias", "Últimos 30 dias", "Todo o período"].map((o) => (
          <Button key={o} variant="ghost" className="w-full justify-start">{o}</Button>
        ))}
      </PopoverContent>
    </Popover>
  ),
};
