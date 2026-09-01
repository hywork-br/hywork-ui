import type { Meta, StoryObj } from "@storybook/react-vite";
import { BarChart3, LayoutDashboard, Megaphone, Plus, Search, Settings } from "lucide-react";
import { fn } from "storybook/test";

import {
  AdminShell,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  FilterBar,
  Input,
  ListPage,
  Select,
} from "../src";

const meta = {
  parameters: { layout: "fullscreen" },
  title: "Patterns/Central de campanhas",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const campaigns = [
  {
    channel: "Intranet + e-mail",
    name: "Boas-vindas · setembro",
    owner: "Pessoas & Cultura",
    status: "Agendada",
    tone: "warning" as const,
  },
  {
    channel: "TV corporativa",
    name: "Semana da segurança",
    owner: "Comunicação interna",
    status: "Ativa",
    tone: "success" as const,
  },
  {
    channel: "Intranet",
    name: "Pesquisa de clima",
    owner: "People Analytics",
    status: "Em revisão",
    tone: "info" as const,
  },
];

export const ListaPadronizada: Story = {
  render: () => (
    <AdminShell
      brand={<span>hywork</span>}
      currentItem="campaigns"
      navigation={[
        { href: "#overview", icon: <LayoutDashboard aria-hidden="true" />, id: "overview", label: "Visão geral" },
        { href: "#campaigns", icon: <Megaphone aria-hidden="true" />, id: "campaigns", label: "Campanhas" },
        { href: "#analytics", icon: <BarChart3 aria-hidden="true" />, id: "analytics", label: "Analytics" },
        { href: "#settings", icon: <Settings aria-hidden="true" />, id: "settings", label: "Configurações" },
      ]}
      utility={<p className="hw-catalog__small">Ambiente de demonstração</p>}
    >
      <ListPage
        action={<Button onClick={fn()}><Plus aria-hidden="true" /> Nova campanha</Button>}
        description="Planeje, publique e acompanhe a comunicação em todos os canais."
        getItemKey={(campaign) => campaign.name}
        items={campaigns}
        renderItem={(campaign) => (
          <Card>
            <CardHeader>
              <div className="hw-campaign-card__topline">
                <Badge tone={campaign.tone}>{campaign.status}</Badge>
                <span>{campaign.channel}</span>
              </div>
              <CardTitle as="h2">{campaign.name}</CardTitle>
              <CardDescription>Responsável: {campaign.owner}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="hw-campaign-card__metric">
                <strong>Próximo marco</strong>
                <span>Publicação programada · 09:30</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={fn()} size="sm" variant="outline">Ver detalhes</Button>
              <Button onClick={fn()} size="sm" variant="quiet">Duplicar</Button>
            </CardFooter>
          </Card>
        )}
        title="Campanhas"
        toolbar={
          <FilterBar
            activeFilters={[{ id: "period", label: "Período: próximos 30 dias" }]}
            filters={
              <>
                <Select
                  ariaLabel="Status"
                  options={[
                    { label: "Todos", value: "all" },
                    { label: "Ativa", value: "active" },
                    { label: "Agendada", value: "scheduled" },
                  ]}
                  placeholder="Todos os status"
                />
                <Select
                  ariaLabel="Canal"
                  options={[
                    { label: "Todos", value: "all" },
                    { label: "Intranet", value: "intranet" },
                    { label: "E-mail", value: "email" },
                  ]}
                  placeholder="Todos os canais"
                />
              </>
            }
            onClearAll={fn()}
            search={
              <div className="hw-search-field">
                <Search aria-hidden="true" />
                <Input aria-label="Buscar campanhas" placeholder="Buscar por nome ou responsável" />
              </div>
            }
          />
        }
        view="grid"
      />
    </AdminShell>
  ),
};
