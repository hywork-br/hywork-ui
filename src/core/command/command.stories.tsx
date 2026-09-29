import type { Meta, StoryObj } from "@storybook/react-vite";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./index";

const meta = { title: "Core/Command", component: Command } satisfies Meta<typeof Command>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Lista com busca — base do seletor de colaboradores e do `MultiSelect`. */
export const Padrao: Story = {
  render: () => (
    <Command className="w-[320px] rounded-md border">
      <CommandInput placeholder="Buscar colaborador" />
      <CommandList>
        <CommandEmpty>Nenhum resultado.</CommandEmpty>
        <CommandGroup heading="Colaboradores">
          <CommandItem>Ana Ribeiro</CommandItem>
          <CommandItem>Bruno Lima</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};
