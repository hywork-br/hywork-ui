import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar, AvatarFallback, AvatarImage, avatarToneFor, type AvatarTone } from "./index";

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

const tons: AvatarTone[] = ["primary", "info", "success", "warning", "danger", "neutral"];

/** `tone` pinta o fallback com o papel de estado: fundo suave e iniciais no papel. */
export const Tons: Story = {
  render: () => (
    <div className="flex gap-2">
      {tons.map((t) => (
        <Avatar key={t}>
          <AvatarFallback tone={t}>{t.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      ))}
    </div>
  ),
};

/** Lista de pessoas: `avatarToneFor(id)` dá a cada uma sempre a mesma cor. */
export const CorPorPessoa: Story = {
  render: () => (
    <div className="flex gap-2">
      {["u-101:AB", "u-102:CD", "u-103:EF", "u-104:GH", "u-105:IJ", "u-106:KL"].map((p) => {
        const [id, iniciais] = p.split(":");
        return (
          <Avatar key={id}>
            <AvatarFallback tone={avatarToneFor(id)}>{iniciais}</AvatarFallback>
          </Avatar>
        );
      })}
    </div>
  ),
};
