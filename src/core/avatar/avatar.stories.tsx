import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar, AvatarFallback, AvatarImage } from "./index";

const meta = { title: "Core/Avatar", component: Avatar } satisfies Meta<typeof Avatar>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Com foto. */
export const ComFoto: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://i.pravatar.cc/80?img=5" alt="Ana Souza" />
      <AvatarFallback>A</AvatarFallback>
    </Avatar>
  ),
};

/**
 * Sem foto: a inicial ocupa o lugar.
 *
 * `AvatarFallback` só funciona dentro de `Avatar` — importá-lo direto do Radix
 * quebra em tempo de execução, porque passam a existir dois contextos.
 */
export const SemFoto: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>AS</AvatarFallback>
    </Avatar>
  ),
};

/** Empilhados, como numa coluna de participantes. */
export const Empilhados: Story = {
  render: () => (
    <div className="flex -space-x-2">
      {["A", "B", "C"].map((i) => (
        <Avatar key={i} className="border-2 border-background">
          <AvatarFallback>{i}</AvatarFallback>
        </Avatar>
      ))}
    </div>
  ),
};
