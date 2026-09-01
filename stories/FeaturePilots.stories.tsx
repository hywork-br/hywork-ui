import type { Meta, StoryObj } from "@storybook/react-vite";
import { BookOpen, FileText, Mail, Monitor, Plus, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  DataTable,
  Field,
  FieldHint,
  FilterBar,
  FocusMode,
  Input,
  Label,
  ListPage,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
} from "../src";

const meta = {
  parameters: {
    docs: {
      description: {
        component:
          "Pilotos sem integração de produto. A casca e os estados são compartilhados; filtros, células e conteúdo preservam o domínio de cada feature.",
      },
    },
    layout: "fullscreen",
  },
  title: "Pilots/Priority features",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

interface PilotFilters {
  advanced: string;
  dimension: string;
  search: string;
  status: string;
}

interface PilotConfig<T extends { id: string; status: string }> {
  actionLabel: string;
  advancedLabel: string;
  advancedOptions: Array<{ label: string; value: string }>;
  createTitle: string;
  description: string;
  dimensionLabel: string;
  dimensionOptions: Array<{ label: string; value: string }>;
  emptyTitle: string;
  getAdvanced: (item: T) => string;
  getDimension: (item: T) => string;
  icon: React.ReactNode;
  items: T[];
  renderCollection?: (items: T[]) => React.ReactNode;
  renderItem: (item: T) => React.ReactNode;
  searchText: (item: T) => string;
  slug: string;
  title: string;
  view?: "grid" | "list";
}

const statusOptions = [
  { label: "Todos os status", value: "all" },
  { label: "Ativa", value: "active" },
  { label: "Agendada", value: "scheduled" },
  { label: "Rascunho", value: "draft" },
  { label: "Arquivada", value: "archived" },
];

function readFilters(slug: string): PilotFilters {
  if (typeof window === "undefined") {
    return { advanced: "all", dimension: "all", search: "", status: "all" };
  }
  const params = new URLSearchParams(window.location.search);
  const key = (field: keyof PilotFilters) => `pilot-${slug}-${field}`;
  return {
    advanced: params.get(key("advanced")) ?? "all",
    dimension: params.get(key("dimension")) ?? "all",
    search: params.get(key("search")) ?? "",
    status: params.get(key("status")) ?? "all",
  };
}

function usePersistentFilters(slug: string) {
  const [filters, setFilters] = useState<PilotFilters>(() => readFilters(slug));

  useEffect(() => {
    const url = new URL(window.location.href);
    for (const [field, value] of Object.entries(filters)) {
      const key = `pilot-${slug}-${field}`;
      if (value && value !== "all") url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    }
    window.history.replaceState(window.history.state, "", url);
  }, [filters, slug]);

  return [filters, setFilters] as const;
}

function Pilot<T extends { id: string; status: string }>(config: PilotConfig<T>) {
  const [filters, setFilters] = usePersistentFilters(config.slug);
  const [focusOpen, setFocusOpen] = useState(false);
  const filtered = useMemo(() => {
    const query = filters.search.trim().toLocaleLowerCase("pt-BR");
    return config.items.filter((item) => {
      const searchMatch = !query || config.searchText(item).toLocaleLowerCase("pt-BR").includes(query);
      const statusMatch = filters.status === "all" || item.status === filters.status;
      const dimensionMatch = filters.dimension === "all" || config.getDimension(item) === filters.dimension;
      const advancedMatch = filters.advanced === "all" || config.getAdvanced(item) === filters.advanced;
      return searchMatch && statusMatch && dimensionMatch && advancedMatch;
    });
  }, [config, filters]);

  const activeFilters = [
    filters.status !== "all"
      ? {
          id: "status",
          label: statusOptions.find((option) => option.value === filters.status)?.label ?? filters.status,
          onRemove: () => setFilters((current) => ({ ...current, status: "all" })),
        }
      : null,
    filters.dimension !== "all"
      ? {
          id: "dimension",
          label: `${config.dimensionLabel}: ${config.dimensionOptions.find((option) => option.value === filters.dimension)?.label ?? filters.dimension}`,
          onRemove: () => setFilters((current) => ({ ...current, dimension: "all" })),
        }
      : null,
    filters.advanced !== "all"
      ? {
          id: "advanced",
          label: `${config.advancedLabel}: ${config.advancedOptions.find((option) => option.value === filters.advanced)?.label ?? filters.advanced}`,
          onRemove: () => setFilters((current) => ({ ...current, advanced: "all" })),
        }
      : null,
  ].filter((filter): filter is NonNullable<typeof filter> => Boolean(filter));

  const clearFilters = () =>
    setFilters({ advanced: "all", dimension: "all", search: "", status: "all" });

  return (
    <>
      <ListPage
        action={
          <Button onClick={() => setFocusOpen(true)}>
            <Plus aria-hidden="true" /> {config.actionLabel}
          </Button>
        }
        activeFilterCount={activeFilters.length + (filters.search ? 1 : 0)}
        description={config.description}
        empty={{ title: config.emptyTitle }}
        getItemKey={(item) => item.id}
        items={filtered}
        noResults={{
          action: <Button onClick={clearFilters} variant="outline">Limpar busca e filtros</Button>,
          description: "Ajuste os critérios ou recupere a visão completa.",
          title: "Nenhum resultado com estes filtros",
        }}
        renderCollection={config.renderCollection}
        renderItem={(item) => config.renderItem(item)}
        title={config.title}
        toolbar={
          <FilterBar
            activeFilters={activeFilters}
            aria-label={`Filtros de ${config.title}`}
            filters={
              <>
                <Select
                  ariaLabel="Status"
                  onValueChange={(status) => setFilters((current) => ({ ...current, status }))}
                  options={statusOptions}
                  value={filters.status}
                />
                <Select
                  ariaLabel={config.dimensionLabel}
                  onValueChange={(dimension) => setFilters((current) => ({ ...current, dimension }))}
                  options={[{ label: `Todos: ${config.dimensionLabel.toLocaleLowerCase("pt-BR")}`, value: "all" }, ...config.dimensionOptions]}
                  value={filters.dimension}
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline"><SlidersHorizontal aria-hidden="true" /> Mais filtros</Button>
                  </PopoverTrigger>
                  <PopoverContent aria-label="Mais filtros" className="hw-pilot__more-filters">
                    <Field>
                      <Label>{config.advancedLabel}</Label>
                      <Select
                        ariaLabel={config.advancedLabel}
                        onValueChange={(advanced) => setFilters((current) => ({ ...current, advanced }))}
                        options={[{ label: `Todos: ${config.advancedLabel.toLocaleLowerCase("pt-BR")}`, value: "all" }, ...config.advancedOptions]}
                        value={filters.advanced}
                      />
                      <FieldHint>Aplicado imediatamente e preservado na URL.</FieldHint>
                    </Field>
                  </PopoverContent>
                </Popover>
              </>
            }
            onClearAll={clearFilters}
            search={
              <div className="hw-search-field">
                <Search aria-hidden="true" />
                <Input
                  aria-label={`Buscar em ${config.title}`}
                  onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                  placeholder="Buscar por nome ou contexto"
                  value={filters.search}
                />
              </div>
            }
          />
        }
        view={config.view}
      />

      <FocusMode
        description="Ao sair, a busca, os filtros, a URL e a posição da lista permanecem no contexto anterior."
        onExit={() => setFocusOpen(false)}
        open={focusOpen}
        title={config.createTitle}
      >
        <div className="hw-pilot__focus">
          <div className="hw-pilot__focus-heading">
            {config.icon}
            <div>
              <h2>Rascunho isolado do contexto da lista</h2>
              <p>O piloto demonstra a gramática; dados, permissões e submissão continuam no produto.</p>
            </div>
          </div>
          <Field>
            <Label htmlFor={`${config.slug}-draft-name`}>Nome</Label>
            <Input id={`${config.slug}-draft-name`} placeholder={`Nome de ${config.title.toLocaleLowerCase("pt-BR")}`} />
            <FieldHint>O valor permanece local neste mockup e não chama serviços externos.</FieldHint>
          </Field>
          <div className="hw-flow__actions">
            <Button onClick={() => setFocusOpen(false)} variant="quiet">Descartar demonstração</Button>
            <Button onClick={() => setFocusOpen(false)}>Salvar rascunho e voltar</Button>
          </div>
        </div>
      </FocusMode>
    </>
  );
}

const tvRows = [
  { id: "tv-1", name: "Canal Matriz", screens: 18, status: "active", unit: "Matriz", updated: "Hoje, 10:42" },
  { id: "tv-2", name: "Operação segura", screens: 7, status: "scheduled", unit: "Joinville", updated: "Hoje, 09:18" },
  { id: "tv-3", name: "Boas-vindas", screens: 4, status: "draft", unit: "Curitiba", updated: "Ontem, 16:05" },
];

export const TvCorporativa: Story = {
  render: () => (
    <Pilot
      actionLabel="Novo canal"
      advancedLabel="Quantidade de telas"
      advancedOptions={[{ label: "Até 5", value: "small" }, { label: "6 ou mais", value: "large" }]}
      createTitle="Criar canal de TV"
      description="Organize canais, unidades e disponibilidade das telas corporativas."
      dimensionLabel="Unidade"
      dimensionOptions={[{ label: "Matriz", value: "Matriz" }, { label: "Joinville", value: "Joinville" }, { label: "Curitiba", value: "Curitiba" }]}
      emptyTitle="Nenhum canal configurado"
      getAdvanced={(item) => item.screens <= 5 ? "small" : "large"}
      getDimension={(item) => item.unit}
      icon={<Monitor aria-hidden="true" />}
      items={tvRows}
      renderCollection={(items) => (
        <DataTable
          ariaLabel="Canais de TV corporativa"
          columns={[
            { header: "Canal", key: "name" },
            { header: "Unidade", key: "unit" },
            { header: "Telas", key: "screens", align: "end" },
            { header: "Status", key: "status", render: (row) => <Badge tone={row.status === "active" ? "success" : row.status === "scheduled" ? "warning" : "neutral"}>{row.status === "active" ? "Ativa" : row.status === "scheduled" ? "Agendada" : "Rascunho"}</Badge> },
            { header: "Atualização", key: "updated", align: "end" },
          ]}
          getRowKey={(row) => row.id}
          rows={items}
        />
      )}
      renderItem={() => null}
      searchText={(item) => `${item.name} ${item.unit}`}
      slug="tv"
      title="TV Corporativa"
    />
  ),
};

const signatureCards = [
  { audience: "Lideranças", id: "mail-1", name: "Assinatura Executiva", owner: "Pessoas", status: "active", template: "executive", unit: "Todas as unidades" },
  { audience: "Comercial", id: "mail-2", name: "Campanha Summit", owner: "Marketing", status: "scheduled", template: "campaign", unit: "Matriz" },
  { audience: "Novas contratações", id: "mail-3", name: "Boas-vindas", owner: "Gente & Gestão", status: "draft", template: "welcome", unit: "Joinville" },
];

export const AssinaturasEmail: Story = {
  render: () => (
    <Pilot
      actionLabel="Nova assinatura"
      advancedLabel="Template"
      advancedOptions={[{ label: "Executivo", value: "executive" }, { label: "Campanha", value: "campaign" }, { label: "Boas-vindas", value: "welcome" }]}
      createTitle="Criar assinatura de e-mail"
      description="Distribua assinaturas coerentes por público sem perder o preview visual."
      dimensionLabel="Público"
      dimensionOptions={[{ label: "Lideranças", value: "Lideranças" }, { label: "Comercial", value: "Comercial" }, { label: "Novas contratações", value: "Novas contratações" }]}
      emptyTitle="Nenhuma assinatura criada"
      getAdvanced={(item) => item.template}
      getDimension={(item) => item.audience}
      icon={<Mail aria-hidden="true" />}
      items={signatureCards}
      renderItem={(item) => (
        <Card>
          <CardHeader>
            <Badge tone={item.status === "active" ? "success" : item.status === "scheduled" ? "warning" : "neutral"}>{item.status === "active" ? "Ativa" : item.status === "scheduled" ? "Agendada" : "Rascunho"}</Badge>
            <CardTitle as="h2">{item.name}</CardTitle>
            <CardDescription>{item.audience} · {item.unit}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="hw-pilot__signature">
              <span aria-hidden="true" className="hw-pilot__signature-mark" />
              <div><strong>Luiza Vieira</strong><small>Product Manager · Hywork</small></div>
            </div>
          </CardContent>
          <CardFooter>Responsável: {item.owner}</CardFooter>
        </Card>
      )}
      searchText={(item) => `${item.name} ${item.audience} ${item.owner}`}
      slug="email"
      title="Assinaturas de E-mail"
      view="grid"
    />
  ),
};

const courses = [
  { id: "academy-1", lessons: 8, name: "Liderança em conversas difíceis", owner: "Maricy Souza", status: "active", track: "Liderança", type: "Trilha" },
  { id: "academy-2", lessons: 4, name: "Segurança no trabalho", owner: "Thaize Barbell", status: "scheduled", track: "Operações", type: "Curso" },
  { id: "academy-3", lessons: 6, name: "Cultura que acolhe", owner: "Luiza Vieira", status: "draft", track: "Cultura", type: "Curso" },
];

export const Academy: Story = {
  render: () => (
    <Pilot
      actionLabel="Novo curso"
      advancedLabel="Trilha"
      advancedOptions={[{ label: "Liderança", value: "Liderança" }, { label: "Operações", value: "Operações" }, { label: "Cultura", value: "Cultura" }]}
      createTitle="Criar curso"
      description="Gerencie cursos e trilhas com filtros próprios de aprendizagem."
      dimensionLabel="Tipo"
      dimensionOptions={[{ label: "Curso", value: "Curso" }, { label: "Trilha", value: "Trilha" }]}
      emptyTitle="Nenhum curso publicado"
      getAdvanced={(item) => item.track}
      getDimension={(item) => item.type}
      icon={<BookOpen aria-hidden="true" />}
      items={courses}
      renderItem={(item) => (
        <Card>
          <CardHeader>
            <div className="hw-pilot__card-topline">
              <Badge tone={item.status === "active" ? "success" : item.status === "scheduled" ? "warning" : "neutral"}>{item.status === "active" ? "Ativo" : item.status === "scheduled" ? "Agendado" : "Rascunho"}</Badge>
              <span>{item.type}</span>
            </div>
            <CardTitle as="h2">{item.name}</CardTitle>
            <CardDescription>{item.track} · {item.owner}</CardDescription>
          </CardHeader>
          <CardContent><strong>{item.lessons} módulos</strong><p>Conteúdo estruturado para conclusão no ritmo da pessoa.</p></CardContent>
        </Card>
      )}
      searchText={(item) => `${item.name} ${item.owner} ${item.track}`}
      slug="academy"
      title="Academy"
      view="grid"
    />
  ),
};

const contentRows = [
  { author: "Comunicação Interna", date: "Hoje, 11:20", id: "content-1", name: "Guia da nova intranet", status: "active", type: "Artigo" },
  { author: "Gente & Gestão", date: "Amanhã, 08:00", id: "content-2", name: "Pesquisa de clima 2026", status: "scheduled", type: "Comunicado" },
  { author: "Segurança", date: "Ontem, 17:35", id: "content-3", name: "Checklist de campo", status: "draft", type: "Documento" },
];

export const Conteudos: Story = {
  render: () => (
    <Pilot
      actionLabel="Novo conteúdo"
      advancedLabel="Autor"
      advancedOptions={[{ label: "Comunicação Interna", value: "Comunicação Interna" }, { label: "Gente & Gestão", value: "Gente & Gestão" }, { label: "Segurança", value: "Segurança" }]}
      createTitle="Criar conteúdo"
      description="Publique materiais com taxonomia editorial, autoria e calendário próprios."
      dimensionLabel="Tipo"
      dimensionOptions={[{ label: "Artigo", value: "Artigo" }, { label: "Comunicado", value: "Comunicado" }, { label: "Documento", value: "Documento" }]}
      emptyTitle="Nenhum conteúdo publicado"
      getAdvanced={(item) => item.author}
      getDimension={(item) => item.type}
      icon={<FileText aria-hidden="true" />}
      items={contentRows}
      renderCollection={(items) => (
        <DataTable
          ariaLabel="Conteúdos publicados"
          columns={[
            { header: "Conteúdo", key: "name" },
            { header: "Tipo", key: "type" },
            { header: "Autor", key: "author" },
            { header: "Status", key: "status", render: (row) => <Badge tone={row.status === "active" ? "success" : row.status === "scheduled" ? "warning" : "neutral"}>{row.status === "active" ? "Publicado" : row.status === "scheduled" ? "Agendado" : "Rascunho"}</Badge> },
            { header: "Atualização", key: "date", align: "end" },
          ]}
          getRowKey={(row) => row.id}
          rows={items}
        />
      )}
      renderItem={() => null}
      searchText={(item) => `${item.name} ${item.author} ${item.type}`}
      slug="contents"
      title="Conteúdos"
    />
  ),
};
