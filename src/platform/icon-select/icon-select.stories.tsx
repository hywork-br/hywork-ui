import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FontAwesomeIconSelect } from "./index";

const meta = { title: "Platform/IconSelect", component: FontAwesomeIconSelect } satisfies Meta<typeof FontAwesomeIconSelect>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Requer o CSS do Font Awesome 6 carregado pela aplicação. */
export const Padrao: Story = {
  args: { value: "", onChange: () => undefined },
  render: function Render(args) {
    const [icone, setIcone] = React.useState("");
    return <div className="w-[280px]"><FontAwesomeIconSelect {...args} value={icone} onChange={setIcone} /></div>;
  },
};
