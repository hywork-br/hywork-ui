import type { Meta, StoryObj } from "@storybook/react-vite";
import { FeaturePilot } from "./pilots/feature-pilot";
import { academy, contents, signatures, tv } from "./pilots/model";

const meta = {
  title: "Pilots/Priority features",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Jornadas de referência com persistência somente na aba. Mesma gramática de interação, vocabulário e coleções de cada domínio. Sem integração ou migração do produto.",
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Academy: Story = {
  render: () => <FeaturePilot config={academy} />,
};
export const Conteudos: Story = {
  render: () => <FeaturePilot config={contents} />,
};
export const TvCorporativa: Story = {
  render: () => <FeaturePilot config={tv} />,
};
export const AssinaturasEmail: Story = {
  render: () => <FeaturePilot config={signatures} />,
};
export const AcademyStackedComparison: Story = {
  name: "Academy · comparação de filtros empilhados",
  render: () => <FeaturePilot config={academy} stackedFilters />,
};
