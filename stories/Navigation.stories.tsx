import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AppWindow,
  BarChart3,
  BookOpen,
  CalendarDays,
  CircleGauge,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Megaphone,
  Settings,
  ShieldCheck,
  Tv,
  Users,
  Workflow,
} from "lucide-react";
import { useEffect, useState } from "react";

import { AdminShell, Button, type AdminNavigationItem } from "../src";

const navigation: AdminNavigationItem[] = [
  {
    group: "Visão geral",
    href: "#destination-overview",
    icon: <LayoutDashboard aria-hidden="true" />,
    id: "overview",
    label: "Visão geral",
  },
  {
    group: "Visão geral",
    href: "#destination-insights",
    icon: <BarChart3 aria-hidden="true" />,
    id: "insights",
    label: "Indicadores",
  },
  {
    group: "Visão geral",
    href: "#destination-activity",
    icon: <CircleGauge aria-hidden="true" />,
    id: "activity",
    label: "Atividade recente",
  },
  {
    group: "Conteúdo",
    href: "#destination-academy",
    icon: <BookOpen aria-hidden="true" />,
    id: "academy",
    label: "Academy",
  },
  {
    group: "Conteúdo",
    href: "#destination-news",
    icon: <FileText aria-hidden="true" />,
    id: "news",
    label: "Notícias",
  },
  {
    group: "Conteúdo",
    href: "#destination-communications",
    icon: <Megaphone aria-hidden="true" />,
    id: "communications",
    label: "Comunicados",
  },
  {
    group: "Conteúdo",
    href: "#destination-tv",
    icon: <Tv aria-hidden="true" />,
    id: "tv",
    label: "TV corporativa",
  },
  {
    group: "Conteúdo",
    href: "#destination-signatures",
    icon: <FileText aria-hidden="true" />,
    id: "signatures",
    label: "Assinaturas de e-mail",
  },
  {
    group: "Conteúdo",
    href: "#destination-campaigns",
    icon: <Megaphone aria-hidden="true" />,
    id: "campaigns",
    label: "Campanhas",
  },
  {
    group: "Conteúdo",
    href: "#destination-library",
    icon: <BookOpen aria-hidden="true" />,
    id: "library",
    label: "Biblioteca",
  },
  {
    group: "Conteúdo",
    href: "#destination-categories",
    icon: <FileText aria-hidden="true" />,
    id: "categories",
    label: "Categorias",
  },
  {
    group: "Pessoas",
    href: "#destination-users",
    icon: <Users aria-hidden="true" />,
    id: "users",
    label: "Usuários",
  },
  {
    group: "Pessoas",
    href: "#destination-teams",
    icon: <Users aria-hidden="true" />,
    id: "teams",
    label: "Equipes",
  },
  {
    group: "Pessoas",
    href: "#destination-audiences",
    icon: <Users aria-hidden="true" />,
    id: "audiences",
    label: "Públicos",
  },
  {
    group: "Pessoas",
    href: "#destination-onboarding",
    icon: <Users aria-hidden="true" />,
    id: "onboarding",
    label: "Onboarding",
  },
  {
    group: "Pessoas",
    href: "#destination-permissions",
    icon: <ShieldCheck aria-hidden="true" />,
    id: "permissions",
    label: "Permissões",
  },
  {
    group: "Operação",
    href: "#destination-automations",
    icon: <Workflow aria-hidden="true" />,
    id: "automations",
    label: "Automações",
  },
  {
    group: "Operação",
    href: "#destination-reports",
    icon: <BarChart3 aria-hidden="true" />,
    id: "reports",
    label: "Relatórios",
  },
  {
    group: "Operação",
    href: "#destination-calendar",
    icon: <CalendarDays aria-hidden="true" />,
    id: "calendar",
    label: "Calendário editorial",
  },
  {
    group: "Operação",
    href: "#destination-integrations",
    icon: <Workflow aria-hidden="true" />,
    id: "integrations",
    label: "Integrações",
  },
  {
    group: "Operação",
    href: "#destination-apps",
    icon: <AppWindow aria-hidden="true" />,
    id: "apps",
    label: "HyStore",
  },
  {
    group: "Operação",
    href: "#destination-settings",
    icon: <Settings aria-hidden="true" />,
    id: "settings",
    label: "Configurações",
  },
  {
    group: "Operação",
    href: "#destination-audit",
    icon: <ShieldCheck aria-hidden="true" />,
    id: "audit",
    label: "Auditoria",
  },
  {
    group: "Operação",
    href: "#destination-support",
    icon: <HelpCircle aria-hidden="true" />,
    id: "support",
    label: "Ajuda e suporte",
  },
  {
    group: "Operação",
    href: "#destination-governance",
    icon: <Settings aria-hidden="true" />,
    id: "governance",
    label: "Governança e configurações avançadas do workspace",
  },
];

function currentFromHash() {
  const id = window.location.hash.replace("#destination-", "");
  return navigation.some((item) => item.id === id) ? id : "academy";
}

function AdministrationNavigation() {
  const [accountOpen, setAccountOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(currentFromHash);

  useEffect(() => {
    const updateCurrent = () => setCurrentItem(currentFromHash());
    window.addEventListener("hashchange", updateCurrent);
    return () => window.removeEventListener("hashchange", updateCurrent);
  }, []);

  return (
    <AdminShell
      brand={<span>hywork</span>}
      contentId="administration-content"
      currentItem={currentItem}
      navigation={navigation}
      navigationTone="inverse"
      utility={
        <div className="hw-navigation-story__account">
          <button onClick={() => setAccountOpen((open) => !open)} type="button">
            Minha conta
          </button>
          {accountOpen ? (
            <p role="status">Conta local de Ana Lima · Administradora</p>
          ) : null}
        </div>
      }
      workspace={
        <div className="hw-navigation-story__workspace">
          <strong>Workspace Pessoas, Cultura e Comunicação Corporativa</strong>
          <span>Hywork Brasil · ambiente demonstrativo</span>
        </div>
      }
    >
      <main className="hw-navigation-story__main">
        <header>
          <p>Administração · Academy</p>
          <h1>Estrutura de aprendizagem da organização</h1>
          <span>
            O conteúdo continua dono deste único landmark principal; o shell
            organiza somente navegação, workspace e utilidades.
          </span>
          <Button>Nova trilha</Button>
        </header>
        <section aria-label="Destinos locais da demonstração">
          <h2>Destinos disponíveis</h2>
          <div className="hw-navigation-story__destinations">
            {navigation.map((item) => (
              <article id={`destination-${item.id}`} key={item.id}>
                {item.label}
              </article>
            ))}
          </div>
        </section>
      </main>
    </AdminShell>
  );
}

const meta = {
  parameters: { layout: "fullscreen" },
  title: "Navigation/Administration",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const GroupedResponsive: Story = {
  render: () => <AdministrationNavigation />,
};

export const NoCurrentItem: Story = {
  render: () => <AdminShell brand="hywork" navigation={navigation}><main>Escolha uma área</main></AdminShell>,
};

export const UnknownCurrentItem: Story = {
  render: () => <AdminShell brand="hywork" currentItem="removed-area" navigation={navigation}><main>Área indisponível</main></AdminShell>,
};

export const EmptyNavigation: Story = {
  render: () => <AdminShell brand="hywork" navigation={[]}><main>Nenhuma área disponível</main></AdminShell>,
};

export const EmployeePortal: Story = {
  render: () => (
    <AdminShell
      brand="hywork"
      currentItem="day"
      navigation={[
        { href: "#portal-day", id: "day", label: "Meu dia" },
        {
          href: "#portal-documents",
          id: "documents",
          label: "Meus documentos",
        },
      ]}
      surface="portal"
    >
      <main id="portal-day">
        <h1>Meu portal</h1>
        <p>As mesmas regras de navegação, com densidade de leitura.</p>
        <section id="portal-documents">
          <h2>Meus documentos</h2>
          <p>Consulte os documentos disponíveis na sua organização.</p>
        </section>
      </main>
    </AdminShell>
  ),
};
