import type { LucideIcon } from "lucide-react";
import { BookOpen, FileText, Mail, Monitor } from "lucide-react";

// Synthetic metadata aligned with the audited Lab priority-model on 2026-09-07.
// Presence in this demo is not evidence of publishing, telemetry or distribution.
export interface PilotItem {
  id: string;
  name: string;
  status: string;
  summary: string;
  updated: string;
  type?: string;
  category?: string;
  author?: string;
  tags?: string[];
  modules?: string[];
  widgets?: string[];
  fields?: string[];
  layout?: "horizontal" | "vertical" | "compact";
}
export interface Option {
  value: string;
  label: string;
}
export type FacetKey =
  | "status"
  | "type"
  | "category"
  | "author"
  | "tag"
  | "period";
export interface PilotConfig {
  slug: string;
  title: string;
  description: string;
  coverage: string;
  action: string;
  createTitle: string;
  nameLabel: string;
  initialStatus: string;
  tableLabel?: string;
  icon: LucideIcon;
  statuses: Option[];
  types?: Option[];
  categories?: string[];
  authors?: string[];
  tags?: string[];
  quickFilters: FacetKey[];
  moreFilters: FacetKey[];
  items: PilotItem[];
}
export const fixtureDate = "2026-09-07";
const fixtures: Record<
  "academy" | "conteudos" | "tv-corporativa" | "assinaturas",
  PilotItem[]
> = {
  academy: [
    {
      id: "course-1",
      name: "Integração de novos colaboradores",
      status: "active",
      type: "course",
      category: "Onboarding",
      updated: "2026-09-06",
      summary: "Conheça a empresa e os primeiros passos da sua jornada.",
      modules: ["Nossa cultura", "Primeiros passos"],
    },
    {
      id: "path-1",
      name: "Desenvolvimento de lideranças",
      status: "draft",
      type: "learning_path",
      category: "Desenvolvimento",
      updated: "2026-08-20",
      summary: "Uma trilha para apoiar quem lidera pessoas.",
      modules: ["Conversas de desenvolvimento", "Feedback"],
    },
    {
      id: "course-2",
      name: "Segurança na operação",
      status: "inactive",
      type: "course",
      category: "Obrigatório",
      updated: "2026-07-01",
      summary: "Boas práticas de segurança no trabalho.",
      modules: ["Prevenção de riscos"],
    },
  ],
  conteudos: [
    {
      id: "news-1",
      name: "Boas-vindas à nova equipe",
      status: "published",
      type: "news",
      author: "Marina Alves",
      tags: ["Pessoas", "Cultura"],
      updated: "2026-09-06",
      summary:
        "Conheça as pessoas que chegaram para construir os próximos capítulos.",
    },
    {
      id: "news-2",
      name: "Novo ciclo de desenvolvimento",
      status: "draft",
      type: "comunicado",
      author: "Beatriz Nunes",
      tags: ["Pessoas", "Desenvolvimento"],
      updated: "2026-08-20",
      summary: "Prepare suas conversas de desenvolvimento com o time.",
    },
    {
      id: "news-3",
      name: "Resultados do semestre",
      status: "archived",
      type: "news",
      author: "Rafael Costa",
      tags: ["Resultados"],
      updated: "2026-07-01",
      summary: "Registro editorial dos resultados do primeiro semestre.",
    },
  ],
  "tv-corporativa": [
    {
      id: "tv-1",
      name: "Recepção institucional",
      status: "active",
      updated: "2026-09-06",
      summary: "Destaques institucionais e boas-vindas.",
      widgets: ["Conteúdos em destaque", "Relógio"],
    },
    {
      id: "tv-2",
      name: "Comunicados internos",
      status: "active",
      updated: "2026-08-20",
      summary: "Comunicados e aniversariantes do mês.",
      widgets: ["Comunicados", "Aniversariantes"],
    },
    {
      id: "tv-3",
      name: "Campanha de cultura",
      status: "inactive",
      updated: "2026-07-01",
      summary: "Composição de exemplo para ações de cultura.",
      widgets: ["Imagem de campanha"],
    },
  ],
  assinaturas: [
    {
      id: "signature-1",
      name: "Institucional",
      status: "published",
      updated: "2026-09-06",
      summary: "Modelo horizontal com nome, cargo e telefone.",
      fields: ["Nome", "Cargo", "Telefone"],
      layout: "horizontal",
    },
    {
      id: "signature-2",
      name: "Relacionamento",
      status: "draft",
      updated: "2026-08-20",
      summary: "Modelo vertical com nome, área e e-mail.",
      fields: ["Nome", "Área", "E-mail"],
      layout: "vertical",
    },
    {
      id: "signature-3",
      name: "Essencial",
      status: "archived",
      updated: "2026-07-01",
      summary: "Modelo compacto com nome e e-mail.",
      fields: ["Nome", "E-mail"],
      layout: "compact",
    },
  ],
};
const editorial: Option[] = [
  { value: "published", label: "Publicado" },
  { value: "draft", label: "Rascunho" },
  { value: "archived", label: "Arquivado" },
];
export const academy: PilotConfig = {
  slug: "academy",
  title: "Academy",
  description: "Organize os metadados de cursos e trilhas de aprendizagem.",
  coverage:
    "Demonstração parcial: metadados e módulos ilustrativos. Dashboard, certificados, logs e progresso não estão representados.",
  action: "Novo curso",
  createTitle: "Criar curso",
  nameLabel: "Nome do curso",
  initialStatus: "draft",
  icon: BookOpen,
  statuses: [
    { value: "active", label: "Ativo" },
    { value: "draft", label: "Rascunho" },
    { value: "inactive", label: "Inativo" },
  ],
  types: [
    { value: "course", label: "Curso" },
    { value: "learning_path", label: "Trilha" },
  ],
  categories: ["Obrigatório", "Onboarding", "Desenvolvimento"],
  quickFilters: ["status", "type"],
  moreFilters: ["category", "period"],
  items: fixtures.academy,
};
export const contents: PilotConfig = {
  slug: "contents",
  title: "Conteúdos",
  description: "Organize os metadados das publicações editoriais.",
  coverage:
    "Demonstração parcial: metadados, etiquetas e estados editoriais. Não publica no produto.",
  action: "Novo conteúdo",
  createTitle: "Criar conteúdo",
  nameLabel: "Título do conteúdo",
  initialStatus: "draft",
  icon: FileText,
  statuses: editorial,
  types: [
    { value: "news", label: "Notícia" },
    { value: "comunicado", label: "Comunicado" },
  ],
  authors: [...new Set(fixtures.conteudos.map((item) => item.author!))],
  tags: [...new Set(fixtures.conteudos.flatMap((item) => item.tags ?? []))],
  quickFilters: ["status", "type"],
  moreFilters: ["author", "tag", "period"],
  tableLabel: "Conteúdos editoriais",
  items: fixtures.conteudos,
};
export const tv: PilotConfig = {
  slug: "tv",
  title: "TV Corporativa",
  description: "Organize configurações de TV e visualize sua composição.",
  coverage:
    "Composição ilustrativa de conteúdos e widgets. Sem telemetria de dispositivos, monitoramento ou distribuição.",
  action: "Nova configuração",
  createTitle: "Criar configuração de TV",
  nameLabel: "Nome da configuração",
  initialStatus: "inactive",
  icon: Monitor,
  statuses: [
    { value: "active", label: "Ativo" },
    { value: "inactive", label: "Inativo" },
  ],
  quickFilters: ["status"],
  moreFilters: ["period"],
  tableLabel: "Configurações de TV",
  items: fixtures["tv-corporativa"],
};
export const signatures: PilotConfig = {
  slug: "email",
  title: "Assinaturas de E-mail",
  description: "Organize modelos e visualize os campos das assinaturas.",
  coverage:
    "Prévia ilustrativa de composição. Não configura envio, público ou distribuição de assinaturas.",
  action: "Nova assinatura",
  createTitle: "Criar modelo de assinatura",
  nameLabel: "Nome da assinatura",
  initialStatus: "draft",
  icon: Mail,
  statuses: editorial,
  quickFilters: ["status"],
  moreFilters: ["period"],
  items: fixtures.assinaturas,
};
export const emptyFilters = {
  search: "",
  status: "all",
  type: "all",
  category: "all",
  author: "all",
  tag: "all",
  period: "all",
};
export type PilotFilters = typeof emptyFilters;
export const options = (values: string[]): Option[] =>
  values.map((value) => ({ label: value, value }));
export const periodOptions: Option[] = [
  { value: "7", label: "Últimos 7 dias" },
  { value: "30", label: "Últimos 30 dias" },
];
export const facetLabels: Record<FacetKey, string> = {
  status: "Status",
  type: "Tipo",
  category: "Categoria",
  author: "Autor",
  tag: "Etiqueta",
  period: "Atualizado em",
};
export function facetOptions(config: PilotConfig, key: FacetKey): Option[] {
  if (key === "status") return config.statuses;
  if (key === "type") return config.types ?? [];
  if (key === "category") return options(config.categories ?? []);
  if (key === "author") return options(config.authors ?? []);
  if (key === "tag") return options(config.tags ?? []);
  return periodOptions;
}
export const statusLabel = (config: PilotConfig, value: string) =>
  config.statuses.find((s) => s.value === value)?.label ?? value;
export const typeLabel = (config: PilotConfig, value?: string) =>
  config.types?.find((s) => s.value === value)?.label ?? value;
export const statusTone = (status: string) =>
  status === "active" || status === "published" ? "success" : "neutral";
export const formatDate = (date: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));

export function matches(item: PilotItem, filters: PilotFilters) {
  const query = filters.search.trim().toLocaleLowerCase("pt-BR");
  const haystack = [
    item.name,
    item.summary,
    item.category,
    item.author,
    ...(item.tags ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("pt-BR");
  const age = (Date.parse(fixtureDate) - Date.parse(item.updated)) / 86400000;
  return (
    (!query || haystack.includes(query)) &&
    (["status", "type", "category", "author"] as const).every(
      (key) => filters[key] === "all" || item[key] === filters[key],
    ) &&
    (filters.tag === "all" || item.tags?.includes(filters.tag)) &&
    (filters.period === "all" || (age >= 0 && age < Number(filters.period)))
  );
}
export function readFilters(config: PilotConfig): PilotFilters {
  if (typeof window === "undefined") return { ...emptyFilters };
  const params = new URLSearchParams(window.location.search);
  const filters = {
    ...emptyFilters,
    search: params.get(`pilot-${config.slug}-search`) ?? "",
  };
  for (const key of [...config.quickFilters, ...config.moreFilters]) {
    const value = params.get(`pilot-${config.slug}-${key}`);
    filters[key] =
      value &&
      facetOptions(config, key).some((option) => option.value === value)
        ? value
        : "all";
  }
  return filters;
}
export const storageKey = (slug: string) => `hywork-reference-pilot-v2:${slug}`;
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
          ["id", "name", "summary", "status", "updated"].every(
            (key) => typeof entry[key] === "string",
          ) &&
          config.statuses.some((s) => s.value === entry.status) &&
          (!config.types ||
            config.types.some((option) => option.value === entry.type)) &&
          (!config.categories || config.categories.includes(entry.category)) &&
          (!config.authors || config.authors.includes(entry.author)) &&
          ["tags", "modules", "widgets", "fields"].every(
            (key) =>
              entry[key] === undefined ||
              (Array.isArray(entry[key]) &&
                entry[key].every(
                  (value: unknown) => typeof value === "string",
                )),
          ) &&
          (entry.layout === undefined ||
            ["horizontal", "vertical", "compact"].includes(entry.layout)) &&
          /^\d{4}-\d{2}-\d{2}$/.test(entry.updated) &&
          Number.isFinite(Date.parse(entry.updated)),
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
