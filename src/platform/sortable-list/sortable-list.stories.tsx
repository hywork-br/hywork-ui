import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../../core/button";
import { SortableList } from "./index";

const meta = {
  title: "Platform/Padrões/SortableList",
  parameters: {
    docs: {
      description: {
        component:
          "Lista reordenável sem arrastar: botões subir/descer e Alt+↑/↓ no item focado, com anúncio aria-live.",
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj;

function Demo({ disabled = false, initial = ["Ler o regulamento", "Enviar a evidência", "Aguardar a revisão"] }) {
  const [items, setItems] = React.useState(initial);
  return (
    <SortableList<string>
      className="w-[420px]"
      items={items}
      getKey={(t) => t}
      onReorder={setItems}
      disabled={disabled}
      renderItem={(t, ctx) => (
        <div
          tabIndex={0}
          {...ctx.handleProps}
          className="flex items-center gap-2 rounded-md border border-border bg-card p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex-1 text-sm">{ctx.index + 1}. {t}</span>
          <Button type="button" variant="ghost" size="icon" aria-label={ctx.moveUpLabel} disabled={disabled || ctx.isFirst} onClick={ctx.moveUp}>
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" aria-label={ctx.moveDownLabel} disabled={disabled || ctx.isLast} onClick={ctx.moveDown}>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      )}
    />
  );
}

export const Padrao: Story = { render: () => <Demo /> };
export const Desabilitada: Story = { render: () => <Demo disabled /> };
export const ItemUnico: Story = { render: () => <Demo initial={["Única tarefa"]} /> };
