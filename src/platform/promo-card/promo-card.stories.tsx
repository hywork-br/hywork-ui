import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bot, ExternalLink, Mic, Newspaper, UsersRound } from "lucide-react";
import { Badge } from "../../core/badge";
import { Button } from "../../core/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../core/carousel";
import { PromoCard } from "./index";

const meta = {
  title: "Platform/Padrões/PromoCard",
  component: PromoCard,
  args: {
    title: "HyTalks",
    description:
      "Conversas com quem faz comunicação interna, cultura e RH no Brasil. Episódio novo toda semana.",
    media: <Mic aria-hidden="true" />,
    eyebrow: <Badge variant="vendor">Podcast</Badge>,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "Card de convite em pé: ícone e rótulo, título, uma frase e a ação no " +
          "pé. Para a coluna \"Descubra\" da home (um convite por vez, num " +
          "carrossel) e o pé do menu lateral (`size=\"compact\"`).\n\n" +
          "`tone=\"vendor\"` é a **voz da Hywork**, como no `Banner`. " +
          "`onDismiss` põe um X no canto. O aval visual da PO está pendente.",
      },
    },
  },
} satisfies Meta<typeof PromoCard>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Na moldura do card: um item da coluna "Descubra". */
export const Padrao: Story = {
  args: {
    actions: (
      <Button variant="outline" asChild>
        <a href="https://hywork.com.br/hytalks" target="_blank" rel="noopener noreferrer">
          Ouvir o HyTalks
          <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
        </a>
      </Button>
    ),
  },
};

/** Voz da Hywork: o convite para um módulo novo. */
export const VozDaHywork: Story = {
  args: {
    tone: "vendor",
    title: "Novo: módulo People",
    description: "Desempenho, desenvolvimento e colaboradores na mesma plataforma.",
    media: <UsersRound aria-hidden="true" />,
    eyebrow: "Módulo",
    actions: <Button variant="inverse">Conhecer o People</Button>,
  },
};

/** Pé do menu lateral (16rem): compacto e dispensável. */
export const CompactoNoMenu: Story = {
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 240 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    tone: "vendor",
    size: "compact",
    title: "Novo: módulo People",
    description: "Avaliação de desempenho na mesma plataforma.",
    media: <UsersRound aria-hidden="true" />,
    eyebrow: "Da Hywork",
    actions: <Button variant="inverse">Conhecer</Button>,
    onDismiss: () => {},
    dismissLabel: "Dispensar o convite do People",
  },
};

/** Um convite por vez num carrossel: os botões ficam na mesma altura. */
export const NoCarrossel: Story = {
  render: () => (
    <Carousel aria-label="Descubra">
      <CarouselContent>
        {[
          {
            icon: <Bot aria-hidden="true" />,
            kind: "Agentes de IA",
            title: "Dora, Filó e Hyvee",
            body: "Documentos, endomarketing e dados: as três agentes trabalham dentro do HyCloud.",
            cta: "Ver as agentes",
          },
          {
            icon: <Mic aria-hidden="true" />,
            kind: "Podcast",
            title: "HyTalks",
            body: "Conversas com quem faz comunicação interna e RH.",
            cta: "Ouvir o HyTalks",
          },
          {
            icon: <Newspaper aria-hidden="true" />,
            kind: "Blog",
            title: "Blog da Hywork",
            body: "Comunicação interna, cultura e clima, com guias para aplicar na sua empresa.",
            cta: "Ler o blog",
          },
        ].map((item, index, all) => (
          <CarouselItem key={item.title} aria-label={`${index + 1} de ${all.length}`}>
            <PromoCard
              title={item.title}
              description={item.body}
              media={item.icon}
              eyebrow={<Badge variant="vendor">{item.kind}</Badge>}
              actions={<Button variant="outline">{item.cta}</Button>}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
};
