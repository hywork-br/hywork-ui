import type { Meta, StoryObj } from "@storybook/react-vite";
import { Calendar, Megaphone, UsersRound } from "lucide-react";
import { Badge } from "../../core/badge";
import { Button } from "../../core/button";
import { Banner } from "./index";

const meta = {
  title: "Platform/Padrões/Banner",
  component: Banner,
  args: {
    title: "Novo: módulo People",
    description:
      "Desempenho, desenvolvimento e colaboradores na mesma plataforma que a sua empresa já usa. Agende uma conversa sobre o módulo. Não cobra nada.",
    media: <UsersRound aria-hidden="true" />,
  },
  parameters: {
    docs: {
      description: {
        component:
          "Faixa de destaque no topo de uma tela ou seção: ícone, título, selo, " +
          "uma frase e até duas ações.\n\n" +
          "`tone=\"vendor\"` é a **voz da Hywork**: o convite para um módulo ou " +
          "serviço novo, no laranja do guideline, invertido (fundo laranja, texto " +
          "branco). Não segue a marca do workspace. As ações usam os botões " +
          "`inverse` e `inverse-outline`.\n\n" +
          "`tone=\"default\"` é a mesma anatomia na moldura do card, para o " +
          "destaque que não é da Hywork ou o estado depois do pedido. O aval " +
          "visual da PO está pendente.",
      },
    },
  },
} satisfies Meta<typeof Banner>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Voz da Hywork: o convite para um módulo novo. */
export const VozDaHywork: Story = {
  args: {
    tone: "vendor",
    status: <Badge variant="vendor">Novidade</Badge>,
    actions: (
      <>
        <Button variant="inverse">
          <Calendar className="mr-2 h-4 w-4" aria-hidden="true" />
          Agendar conversa sobre o People
        </Button>
        <Button variant="inverse-outline">Ver o que tem no People</Button>
      </>
    ),
  },
};

/** Na moldura do card: destaque que não é da Hywork, ou o estado depois do pedido. */
export const Padrao: Story = {
  args: {
    title: "Módulo People",
    description: "Pedido enviado. O Luiz confirma o horário por e-mail.",
    status: <Badge variant="attention">Na fila</Badge>,
  },
};

/** Só texto, sem ação: um aviso da Hywork que não pede nada. */
export const SemAcao: Story = {
  args: {
    tone: "vendor",
    title: "Novidades da semana",
    description: "O editor de páginas ganhou modelos prontos para comunicados.",
    media: <Megaphone aria-hidden="true" />,
  },
};

/** Em 320px as ações descem e ocupam a largura, com alvo de 44px. */
export const Estreito: Story = {
  ...VozDaHywork,
  decorators: [(Story) => <div className="w-[288px]"><Story /></div>],
};
