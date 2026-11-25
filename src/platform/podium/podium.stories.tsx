import type { Meta, StoryObj } from "@storybook/react-vite";
import { Podium, type PodiumEntry } from "./index";

const entries: PodiumEntry[] = [
  { id: "a", position: 1, name: "Ana Souza", subtitle: "Analista", value: "1.250 pts" },
  { id: "b", position: 2, name: "Bruno Lima", subtitle: "Designer", value: "1.100 pts", avatarUrl: null },
  { id: "c", position: 3, name: "Carla Dias", subtitle: "Gerente", value: "980 pts" },
];

const meta = {
  title: "Platform/Padrões/Podium",
  component: Podium,
  args: { entries, className: "w-[480px]" },
  parameters: {
    docs: {
      description: {
        component:
          "Pódio do ranking: 2º à esquerda (neutro), 1º no centro (mais alto, na cor da marca, com coroa), 3º à direita. Avatar com iniciais quando não há foto.",
      },
    },
  },
} satisfies Meta<typeof Podium>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Completo: Story = {};
export const ApenasDois: Story = { args: { entries: entries.slice(0, 2) } };
export const ApenasUm: Story = { args: { entries: entries.slice(0, 1) } };
export const ComDestaque: Story = {
  args: { entries: entries.map((e) => (e.id === "b" ? { ...e, highlight: true } : e)) },
};
