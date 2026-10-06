import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { RichTextEditor } from "./index";

const meta = { title: "Platform/RichTextEditor", component: RichTextEditor } satisfies Meta<typeof RichTextEditor>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  args: { value: "<p>Texto inicial</p>", onChange: () => undefined },
  render: function Render(args) {
    const [html, setHtml] = React.useState(args.value);
    return <div className="w-[640px]"><RichTextEditor value={html} onChange={setHtml} /></div>;
  },
};
