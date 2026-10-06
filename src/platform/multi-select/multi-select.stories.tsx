import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MultiSelect } from "./index";

const meta = { title: "Platform/MultiSelect", component: MultiSelect } satisfies Meta<typeof MultiSelect>;
export default meta;
type Story = StoryObj<typeof meta>;

const OPCOES = [
  { value: "rh", label: "RH" },
  { value: "ti", label: "TI" },
  { value: "vendas", label: "Vendas" },
];

export const Padrao: Story = {
  args: { options: OPCOES, value: [], onChange: () => undefined },
  render: function Render(args) {
    const [valor, setValor] = React.useState<string[]>(["rh"]);
    return <div className="w-[320px]"><MultiSelect {...args} value={valor} onChange={setValor} /></div>;
  },
};
