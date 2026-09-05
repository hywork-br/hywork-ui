import type { LucideIcon } from "lucide-react";
import { BookOpen, FileText, Mail, Monitor } from "lucide-react";

export interface PilotItem {
  id: string;
  name: string;
  status: string;
  dimension: string;
  group: string;
  owner: string;
  updated: string;
  quantity: number;
}
export interface Option {
  value: string;
  label: string;
}
export interface PilotConfig {
  slug: string;
  title: string;
  description: string;
  action: string;
  createTitle: string;
  nameLabel: string;
  dimensionLabel: string;
  groupLabel: string;
  ownerLabel: string;
  quantityLabel: string;
  tableLabel?: string;
  icon: LucideIcon;
  statuses: Option[];
  dimensions: string[];
  groups: string[];
  owners: string[];
  items: PilotItem[];
}
export const fixtureDate = "2026-09-05";
const states = (
  active: string,
  scheduled: string,
  archived: string
): Option[] => [
  { value: "active", label: active },
  { value: "scheduled", label: scheduled },
  { value: "draft", label: "Rascunho" },
  { value: "archived", label: archived },
];
const item = (
  id: string,
  name: string,
  status: string,
  dimension: string,
  group: string,
  owner: string,
  quantity: number,
  updated = fixtureDate
): PilotItem => ({
  id,
  name,
  status,
  dimension,
  group,
  owner,
  quantity,
  updated,
});

export const academy: PilotConfig = {
  slug: "academy",
  title: "Academy",
  description: "Cursos e trilhas para desenvolver suas equipes.",
  action: "Novo curso",
  createTitle: "Criar curso",
  nameLabel: "Nome do curso",
  dimensionLabel: "Tipo",
  groupLabel: "Trilha",
  ownerLabel: "Responsável",
  quantityLabel: "Módulos",
  icon: BookOpen,
  statuses: states("Ativo", "Agendado", "Arquivado"),
  dimensions: ["Curso", "Trilha"],
  groups: ["Liderança", "Operações", "Cultura"],
  owners: ["Maricy Souza", "Thaize Barbell", "Luiza Vieira"],
  items: [
    item(
      "academy-1",
      "Liderança em conversas difíceis",
      "active",
      "Trilha",
      "Liderança",
      "Maricy Souza",
      8
    ),
    item(
      "academy-2",
      "Segurança no trabalho",
      "scheduled",
      "Curso",
      "Operações",
      "Thaize Barbell",
      4,
      "2026-09-02"
    ),
    item(
      "academy-3",
      "Cultura que acolhe",
      "draft",
      "Curso",
      "Cultura",
      "Luiza Vieira",
      6,
      "2026-08-22"
    ),
  ],
};
export const contents: PilotConfig = {
  slug: "contents",
  title: "Conteúdos",
  description: "Organize a publicação e acompanhe seu calendário editorial.",
  action: "Novo conteúdo",
  createTitle: "Criar conteúdo",
  nameLabel: "Título do conteúdo",
  dimensionLabel: "Tipo",
  groupLabel: "Categoria",
  ownerLabel: "Autor",
  quantityLabel: "Anexos",
  tableLabel: "Conteúdos publicados",
  icon: FileText,
  statuses: states("Publicado", "Agendado", "Arquivado"),
  dimensions: ["Artigo", "Comunicado", "Documento"],
  groups: ["Institucional", "Pessoas", "Operações"],
  owners: ["Comunicação Interna", "Gente & Gestão", "Segurança"],
  items: [
    item(
      "content-1",
      "Guia do novo portal",
      "active",
      "Artigo",
      "Institucional",
      "Comunicação Interna",
      1
    ),
    item(
      "content-2",
      "Pesquisa de clima 2026",
      "scheduled",
      "Comunicado",
      "Pessoas",
      "Gente & Gestão",
      0,
      "2026-09-02"
    ),
    item(
      "content-3",
      "Checklist de campo",
      "draft",
      "Documento",
      "Operações",
      "Segurança",
      2,
      "2026-08-22"
    ),
  ],
};
export const tv: PilotConfig = {
  slug: "tv",
  title: "TV Corporativa",
  description: "Organize os canais e as telas de cada unidade.",
  action: "Novo canal",
  createTitle: "Criar canal de TV",
  nameLabel: "Nome do canal",
  dimensionLabel: "Unidade",
  groupLabel: "Local das telas",
  ownerLabel: "Responsável",
  quantityLabel: "Telas",
  tableLabel: "Canais de TV corporativa",
  icon: Monitor,
  statuses: states("Ativo", "Agendado", "Arquivado"),
  dimensions: ["Matriz", "Joinville", "Curitiba"],
  groups: ["Recepção", "Operação", "Refeitório"],
  owners: ["Comunicação Interna", "Segurança", "Gente & Gestão"],
  items: [
    item(
      "tv-1",
      "Canal Matriz",
      "active",
      "Matriz",
      "Recepção",
      "Comunicação Interna",
      18
    ),
    item(
      "tv-2",
      "Operação segura",
      "scheduled",
      "Joinville",
      "Operação",
      "Segurança",
      7,
      "2026-09-02"
    ),
    item(
      "tv-3",
      "Boas-vindas",
      "draft",
      "Curitiba",
      "Refeitório",
      "Gente & Gestão",
      4,
      "2026-08-22"
    ),
  ],
};
export const signatures: PilotConfig = {
  slug: "email",
  title: "Assinaturas de E-mail",
  description: "Uma identidade consistente para cada público.",
  action: "Nova assinatura",
  createTitle: "Criar assinatura de e-mail",
  nameLabel: "Nome da assinatura",
  dimensionLabel: "Público",
  groupLabel: "Template",
  ownerLabel: "Unidade",
  quantityLabel: "Pessoas",
  icon: Mail,
  statuses: states("Ativa", "Agendada", "Arquivada"),
  dimensions: ["Lideranças", "Comercial", "Novas contratações"],
  groups: ["Executivo", "Campanha", "Boas-vindas"],
  owners: ["Todas as unidades", "Matriz", "Joinville"],
  items: [
    item(
      "mail-1",
      "Assinatura Executiva",
      "active",
      "Lideranças",
      "Executivo",
      "Todas as unidades",
      32
    ),
    item(
      "mail-2",
      "Campanha Summit",
      "scheduled",
      "Comercial",
      "Campanha",
      "Matriz",
      48,
      "2026-09-02"
    ),
    item(
      "mail-3",
      "Boas-vindas",
      "draft",
      "Novas contratações",
      "Boas-vindas",
      "Joinville",
      12,
      "2026-08-22"
    ),
  ],
};

export const emptyFilters = {
  search: "",
  status: "all",
  dimension: "all",
  group: "all",
  owner: "all",
  period: "all",
  quantity: "all",
};
export type PilotFilters = typeof emptyFilters;
export const options = (values: string[]): Option[] =>
  values.map((value) => ({ label: value, value }));
export const periodOptions: Option[] = [
  { value: "7", label: "Últimos 7 dias" },
  { value: "30", label: "Últimos 30 dias" },
];
export const screenCountOptions: Option[] = [
  { value: "small", label: "Até 5" },
  { value: "large", label: "6 ou mais" },
];
export const statusLabel = (config: PilotConfig, value: string) =>
  config.statuses.find((s) => s.value === value)?.label ?? value;
export const statusTone = (status: string) =>
  status === "active"
    ? "success"
    : status === "scheduled"
    ? "warning"
    : "neutral";
export const formatDate = (date: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));

export function matches(item: PilotItem, filters: PilotFilters) {
  const query = filters.search.trim().toLocaleLowerCase("pt-BR");
  const haystack = [item.name, item.dimension, item.group, item.owner]
    .join(" ")
    .toLocaleLowerCase("pt-BR");
  const age = (Date.parse(fixtureDate) - Date.parse(item.updated)) / 86400000;
  return (
    (!query || haystack.includes(query)) &&
    (["status", "dimension", "group", "owner"] as const).every(
      (key) => filters[key] === "all" || item[key] === filters[key]
    ) &&
    (filters.period === "all" || (age >= 0 && age < Number(filters.period))) &&
    (filters.quantity === "all" ||
      (filters.quantity === "small" ? item.quantity <= 5 : item.quantity >= 6))
  );
}

export function readFilters(config: PilotConfig): PilotFilters {
  if (typeof window === "undefined") return { ...emptyFilters };
  const params = new URLSearchParams(window.location.search);
  const allowed = {
    status: config.statuses.map((o) => o.value),
    dimension: config.dimensions,
    group: config.groups,
    owner: config.owners,
    period: ["7", "30"],
    quantity: config.slug === "tv" ? ["small", "large"] : [],
  };
  const filters = {
    ...emptyFilters,
    search: params.get(`pilot-${config.slug}-search`) ?? "",
  };
  for (const key of Object.keys(allowed) as Array<keyof typeof allowed>) {
    const value = params.get(`pilot-${config.slug}-${key}`);
    filters[key] = value && allowed[key].includes(value) ? value : "all";
  }
  return filters;
}

export const storageKey = (slug: string) => `hywork-reference-pilot-v1:${slug}`;
export function readItems(config: PilotConfig): {
  items: PilotItem[];
  warning: string;
} {
  if (typeof window === "undefined")
    return { items: config.items, warning: "" };
  try {
    const stored = sessionStorage.getItem(storageKey(config.slug));
    if (!stored) return { items: config.items, warning: "" };
    const parsed: unknown = JSON.parse(stored);
    if (
      !Array.isArray(parsed) ||
      !parsed.every(
        (entry) =>
          entry &&
          typeof entry === "object" &&
          [
            "id",
            "name",
            "status",
            "dimension",
            "group",
            "owner",
            "updated",
          ].every((key) => typeof entry[key] === "string") &&
          config.statuses.some((s) => s.value === entry.status) &&
          Number.isInteger(entry.quantity) &&
          entry.quantity >= 0 &&
          /^\d{4}-\d{2}-\d{2}$/.test(entry.updated) &&
          Number.isFinite(Date.parse(entry.updated))
      )
    )
      throw new Error("Invalid session fixture");
    return { items: parsed as PilotItem[], warning: "" };
  } catch {
    return {
      items: config.items,
      warning:
        "Não foi possível recuperar a sessão. Exibindo os dados de demonstração.",
    };
  }
}
