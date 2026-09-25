import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar, AvatarFallback } from "../../core/avatar";
import { Badge } from "../../core/badge";
import { Button } from "../../core/button";
import { ItemCard } from "./index";

const meta = {
  title: "Platform/Padrões/ItemCard",
  component: ItemCard,
  args: { title: "Desafio de integração" },
  parameters: {
    docs: {
      description: {
        component:
          "Card de item. Substitui as 21 implementações do Platform, que " +
          "variavam o raio de 8 a 24px e o respiro de 12 a 24px.\n\n" +
          "Anatomia fixa: mídia · título · metadados · ações. Sem sombra — ela " +
          "fica reservada a sobreposições, não a estrutura.",
      },
    },
  },
} satisfies Meta<typeof ItemCard>;
export default meta;
type Story = StoryObj<typeof meta>;

/** O mínimo: título e descrição. */
export const Padrao: Story = { args: { description: "Encerra em 12 dias" } };

/** Com indicador de estado ao lado do título. */
export const ComEstado: Story = {
  args: { description: "Encerra em 12 dias", status: <Badge variant="positive">Ativo</Badge> },
};

/** Com mídia à esquerda — avatar, ícone ou miniatura. */
export const ComMidia: Story = {
  args: {
    title: "Ana Ribeiro",
    description: "Pessoas · admitida em 12/03/2024",
    media: (
      <Avatar>
        <AvatarFallback>AR</AvatarFallback>
      </Avatar>
    ),
    status: <Badge variant="neutral">Rascunho</Badge>,
  },
};

/** Com ações no rodapé. */
export const ComAcoes: Story = {
  args: {
    description: "Encerra em 12 dias",
    status: <Badge variant="attention">Pendente</Badge>,
    actions: (
      <>
        <Button size="sm">Abrir</Button>
        <Button size="sm" variant="outline">
          Duplicar
        </Button>
      </>
    ),
  },
};

/** Card inteiro clicável — o título vira o alvo acessível. */
export const Clicavel: Story = {
  args: { description: "Encerra em 12 dias", onOpen: () => undefined },
};

/** Conteúdo extra que não cabe na anatomia entra abaixo dos metadados. */
export const ComConteudoProprio: Story = {
  args: {
    description: "Encerra em 12 dias",
    children: (
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full w-2/3 rounded-full bg-primary" />
      </div>
    ),
  },
};
