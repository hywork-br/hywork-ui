import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  DataTable,
  Field,
  FieldError,
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
  Textarea,
} from "../../src";
import {
  emptyFilters,
  fixtureDate,
  formatDate,
  matches,
  options,
  facetLabels,
  facetOptions,
  typeLabel,
  readFilters,
  readItems,
  statusLabel,
  statusTone,
  storageKey,
  type Option,
  type PilotConfig,
  type PilotFilters,
  type PilotItem,
} from "./model";
import "./pilots.css";
import {
  PilotMotionFilterBar,
  PilotMotionPopoverContent,
  PilotMotionScope,
  PilotSaveNotice,
} from "./motion";

/** A local reference journey, not a product API or production persistence layer. */
export function FeaturePilot({
  config,
  stackedFilters = false,
  motionPilot = false,
}: {
  config: PilotConfig;
  stackedFilters?: boolean;
  motionPilot?: boolean;
}) {
  return (
    <PilotMotionScope enabled={motionPilot}>
      <FeaturePilotContent
        config={config}
        stackedFilters={stackedFilters}
        motionPilot={motionPilot}
      />
    </PilotMotionScope>
  );
}

function FeaturePilotContent({
  config,
  stackedFilters,
  motionPilot,
}: {
  config: PilotConfig;
  stackedFilters: boolean;
  motionPilot: boolean;
}) {
  const [initial] = useState(() => readItems(config));
  const [items, setItems] = useState(initial.items);
  const [filters, setFilters] = useState(() => readFilters(config));
  const [draft, setDraft] = useState<PilotItem | null>(null);
  const [original, setOriginal] = useState<PilotItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(initial.warning);
  const [noticeSaved, setNoticeSaved] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [failNext, setFailNext] = useState(false);
  const [returnToSearch, setReturnToSearch] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const continueRef = useRef<HTMLButtonElement>(null);
  const inFlight = useRef(false);
  const Icon = config.icon;
  const Filters = motionPilot ? PilotMotionFilterBar : FilterBar;
  const AdvancedContent = motionPilot
    ? PilotMotionPopoverContent
    : PopoverContent;
  const visible = items.filter((entry) => matches(entry, filters));
  const changed = draft && JSON.stringify(draft) !== JSON.stringify(original);
  const updateFilter = (key: keyof PilotFilters, value: string) =>
    setFilters((current) => ({ ...current, [key]: value }));
  const clearFilters = () => {
    setFilters({ ...emptyFilters });
    searchRef.current?.focus();
  };

  useEffect(() => {
    const url = new URL(window.location.href);
    for (const [key, value] of Object.entries(filters)) {
      const name = `pilot-${config.slug}-${key}`;
      if (value && value !== "all") url.searchParams.set(name, value);
      else url.searchParams.delete(name);
    }
    window.history.replaceState(window.history.state, "", url);
  }, [config.slug, filters]);
  useEffect(() => {
    const restore = () => setFilters(readFilters(config));
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, [config]);
  useEffect(() => {
    if (confirmExit) continueRef.current?.focus();
  }, [confirmExit]);

  function openEditor(entry?: PilotItem) {
    const next = entry ?? {
      id: crypto.randomUUID(),
      name: "",
      status: config.initialStatus,
      summary: "",
      type: config.types?.[0]?.value,
      category: config.categories?.[0],
      author: config.authors?.[0],
      tags: [],
      modules: config.slug === "academy" ? [] : undefined,
      widgets: config.slug === "tv" ? [] : undefined,
      fields: config.slug === "email" ? ["Nome", "E-mail"] : undefined,
      layout: config.slug === "email" ? ("compact" as const) : undefined,
      updated: fixtureDate,
    };
    setOriginal({ ...next });
    setDraft({ ...next });
    setCreating(!entry);
    setError("");
    setConfirmExit(false);
    setReturnToSearch(false);
  }
  function requestExit() {
    if (inFlight.current) return;
    if (changed) setConfirmExit(true);
    else setDraft(null);
  }
  async function save() {
    if (!draft || inFlight.current) return;
    if (!draft.name.trim()) {
      setError(`Preencha ${config.nameLabel.toLocaleLowerCase("pt-BR")}.`);
      nameRef.current?.focus();
      return;
    }
    inFlight.current = true;
    setSaving(true);
    setError("");
    // Deliberate, labelled latency lets reviewers exercise pending and failure states.
    await new Promise((resolve) => setTimeout(resolve, 350));
    try {
      if (failNext) {
        setFailNext(false);
        throw new Error("Demonstration failure");
      }
      const saved = { ...draft, name: draft.name.trim(), updated: fixtureDate };
      const next = creating
        ? [...items, saved]
        : items.map((entry) => (entry.id === saved.id ? saved : entry));
      sessionStorage.setItem(storageKey(config.slug), JSON.stringify(next));
      const excluded = !matches(saved, filters);
      setReturnToSearch(excluded);
      setNotice(
        excluded
          ? `“${saved.name}” foi salvo, mas está fora dos filtros atuais.`
          : `“${saved.name}” salvo nesta sessão de demonstração.`,
      );
      setItems(next);
      setNoticeSaved(true);
      setDraft(null);
    } catch {
      setError(
        "Não foi possível salvar. Seus dados continuam aqui. Tente novamente.",
      );
    } finally {
      inFlight.current = false;
      setSaving(false);
    }
  }
  const labelFor = (key: keyof PilotFilters) => {
    if (key === "search") return `Busca: ${filters.search}`;
    const label =
      facetOptions(config, key).find((option) => option.value === filters[key])
        ?.label ?? filters[key];
    return key === "status" ? label : `${facetLabels[key]}: ${label}`;
  };
  const active = (Object.keys(filters) as Array<keyof PilotFilters>).filter(
    (key) => filters[key] && filters[key] !== "all",
  );
  const selectFilter = (
    key: keyof PilotFilters,
    label: string,
    values: Option[],
  ) => (
    <Select
      ariaLabel={label}
      onValueChange={(value) => updateFilter(key, value)}
      options={[{ value: "all", label: `${label}: todos` }, ...values]}
      value={filters[key]}
    />
  );
  const editAction = (entry: PilotItem) => (
    <Button
      aria-label={`Editar ${entry.name}`}
      onClick={() => openEditor(entry)}
      size="sm"
      variant="quiet"
    >
      Editar
    </Button>
  );
  const badge = (entry: PilotItem) => (
    <Badge tone={statusTone(entry.status)}>
      {statusLabel(config, entry.status)}
    </Badge>
  );
  const renderCard = (entry: PilotItem) => (
    <Card className="hw-reference-card">
      <CardHeader>
        <div className="hw-reference-card__top">
          <span>
            <Icon aria-hidden="true" />
            {typeLabel(config, entry.type) ??
              (config.slug === "email" ? "Modelo de assinatura" : "")}
          </span>
          {badge(entry)}
        </div>
        <CardTitle as="h2">{entry.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <DomainPreview entry={entry} />
      </CardContent>
      <CardFooter>
        <span>Atualizado em {formatDate(entry.updated)}</span>
        {editAction(entry)}
      </CardFooter>
    </Card>
  );
  function editSelect(
    key: "type" | "category" | "author" | "status",
    label: string,
    values: Option[],
  ) {
    return (
      <Field>
        <Label htmlFor={`edit-${config.slug}-${key}`}>{label}</Label>
        <select
          className="hw-select"
          disabled={saving || (creating && key === "status")}
          id={`edit-${config.slug}-${key}`}
          onChange={(event) =>
            setDraft(
              (current) => current && { ...current, [key]: event.target.value },
            )
          }
          value={draft?.[key]}
        >
          {values.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>
    );
  }
  return (
    <div
      className={`hw-reference-pilot${
        stackedFilters ? " hw-reference-pilot--stacked" : ""
      }`}
    >
      <ListPage
        action={
          <Button onClick={() => openEditor()}>
            <Plus aria-hidden="true" />
            {config.action}
          </Button>
        }
        activeFilterCount={active.length}
        description={config.description}
        getItemKey={(entry) => entry.id}
        items={visible}
        noResults={{
          title: "Nenhum resultado com estes filtros",
          description:
            "Ajuste sua busca ou limpe os filtros para ver a coleção.",
          action: (
            <Button onClick={clearFilters} variant="outline">
              Limpar busca e filtros
            </Button>
          ),
        }}
        renderCollection={
          config.tableLabel
            ? (rows) => (
                <DataTable
                  ariaLabel={config.tableLabel!}
                  role="region"
                  aria-label={`Navegar na tabela de ${config.title}`}
                  tabIndex={0}
                  columns={[
                    {
                      key: "name",
                      header: config.nameLabel,
                      render: (entry) => <strong>{entry.name}</strong>,
                    },
                    { key: "status", header: "Status", render: badge },
                    ...(config.types
                      ? [
                          {
                            key: "type",
                            header: "Tipo",
                            render: (entry: PilotItem) =>
                              typeLabel(config, entry.type),
                          },
                        ]
                      : []),
                    ...(config.slug === "tv"
                      ? [
                          {
                            key: "widgets",
                            header: "Widgets",
                            render: (entry: PilotItem) =>
                              entry.widgets?.join(" · ") ??
                              "Sem widgets nesta demonstração",
                          },
                        ]
                      : [
                          { key: "author", header: "Autor" },
                          {
                            key: "tags",
                            header: "Etiquetas",
                            render: (entry: PilotItem) =>
                              entry.tags?.join(" · "),
                          },
                        ]),
                    {
                      key: "updated",
                      header: "Atualizado",
                      render: (entry) => formatDate(entry.updated),
                    },
                    {
                      key: "actions",
                      header: "Ações",
                      align: "end",
                      render: editAction,
                    },
                  ]}
                  getRowKey={(entry) => entry.id}
                  rows={rows}
                />
              )
            : undefined
        }
        renderItem={renderCard}
        title={config.title}
        toolbar={
          <Filters
            activeFilters={active.map((key) => ({
              id: key,
              label: labelFor(key),
              onRemove: () => {
                updateFilter(key, emptyFilters[key]);
                if (motionPilot) searchRef.current?.focus();
              },
            }))}
            onClearAll={clearFilters}
            search={
              <div className="hw-search-field">
                <Search aria-hidden="true" />
                <Input
                  aria-label={`Buscar em ${config.title}`}
                  onChange={(event) =>
                    updateFilter("search", event.target.value)
                  }
                  placeholder={`Buscar em ${config.title}`}
                  ref={searchRef}
                  value={filters.search}
                />
              </div>
            }
            filters={
              <>
                {config.quickFilters.map((key) => (
                  <span key={key}>
                    {selectFilter(
                      key,
                      facetLabels[key],
                      facetOptions(config, key),
                    )}
                  </span>
                ))}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="quiet">
                      <SlidersHorizontal aria-hidden="true" />
                      Mais filtros
                      {config.moreFilters.some(
                        (key) => filters[key as keyof PilotFilters] !== "all",
                      )
                        ? " · ativos"
                        : ""}
                    </Button>
                  </PopoverTrigger>
                  <AdvancedContent
                    align="end"
                    className="hw-reference-advanced"
                    aria-label="Mais filtros"
                  >
                    <h2>Refinar resultados</h2>
                    {config.moreFilters.map((key) => (
                      <Field key={key}>
                        <Label>{facetLabels[key]}</Label>
                        {selectFilter(
                          key,
                          facetLabels[key],
                          facetOptions(config, key),
                        )}
                      </Field>
                    ))}
                    <FieldHint>
                      Datas de demonstração: referência em 7 set. 2026.
                    </FieldHint>
                  </AdvancedContent>
                </Popover>
              </>
            }
          />
        }
        view={config.tableLabel ? "list" : "grid"}
      />
      {motionPilot ? (
        <PilotSaveNotice notice={notice} saved={noticeSaved} />
      ) : (
        <p className="hw-reference-notice" role="status">
          {notice}
        </p>
      )}
      <details className="hw-reference-demo">
        <summary>Cenários de demonstração</summary>
        <p>
          Mockup interativo. Alterações ficam somente nesta aba; nenhum dado é
          enviado ao produto.
        </p>
        <p>{config.coverage}</p>
        <label>
          <input
            checked={failNext}
            onChange={(event) => setFailNext(event.target.checked)}
            type="checkbox"
          />{" "}
          Falhar próximo salvamento
        </label>
      </details>
      <FocusMode
        description="Demonstração local · os dados ficam nesta aba"
        exitDisabled={saving}
        onExit={requestExit}
        open={!!draft}
        returnFocusRef={returnToSearch ? searchRef : undefined}
        title={
          creating
            ? config.createTitle
            : `Editar ${config.nameLabel.toLocaleLowerCase("pt-BR")}`
        }
      >
        {draft && (
          <form
            className="hw-reference-editor"
            onSubmit={(event) => {
              event.preventDefault();
              void save();
            }}
          >
            {confirmExit ? (
              <section
                className="hw-reference-confirm"
                aria-label="Confirmar saída"
              >
                <h2>Descartar as alterações?</h2>
                <p>
                  O que você editou ainda não foi salvo. Você pode continuar de
                  onde parou.
                </p>
                <div>
                  <Button
                    onClick={() => {
                      setConfirmExit(false);
                      requestAnimationFrame(() => nameRef.current?.focus());
                    }}
                    ref={continueRef}
                    type="button"
                  >
                    Continuar editando
                  </Button>
                  <Button
                    onClick={() => setDraft(null)}
                    type="button"
                    variant="outline"
                  >
                    Descartar alterações
                  </Button>
                </div>
              </section>
            ) : (
              <>
                <div className="hw-reference-editor__content">
                  <div className="hw-reference-editor__intro">
                    <Icon aria-hidden="true" />
                    <div>
                      <h2>Informações principais</h2>
                      <p>
                        {creating
                          ? config.initialStatus === "draft"
                            ? "Comece pelo rascunho. Você poderá editar os detalhes depois."
                            : "Comece por uma configuração inativa."
                          : "Atualize os detalhes e volte à mesma coleção."}
                      </p>
                    </div>
                  </div>
                  <Field>
                    <Label htmlFor={`edit-${config.slug}-name`}>
                      {config.nameLabel}
                    </Label>
                    <Input
                      autoComplete="off"
                      disabled={saving}
                      id={`edit-${config.slug}-name`}
                      maxLength={120}
                      onChange={(event) =>
                        setDraft({ ...draft, name: event.target.value })
                      }
                      ref={nameRef}
                      required
                      value={draft.name}
                    />
                  </Field>
                  <div className="hw-reference-editor__grid">
                    {config.types && editSelect("type", "Tipo", config.types)}
                    {editSelect("status", "Status", config.statuses)}
                    {config.categories &&
                      editSelect(
                        "category",
                        "Categoria",
                        options(config.categories),
                      )}
                    {config.authors &&
                      editSelect("author", "Autor", options(config.authors))}
                  </div>
                  <Field>
                    <Label htmlFor={`edit-${config.slug}-summary`}>
                      Descrição
                    </Label>
                    <Textarea
                      id={`edit-${config.slug}-summary`}
                      value={draft.summary}
                      disabled={saving}
                      onChange={(event) =>
                        setDraft({ ...draft, summary: event.target.value })
                      }
                    />
                  </Field>
                  <section aria-label="Prévia de conteúdo">
                    <h3>Prévia ilustrativa · somente leitura</h3>
                    <DomainPreview entry={draft} />
                  </section>
                  {error && <FieldError role="alert">{error}</FieldError>}
                  {saving && (
                    <p
                      role={motionPilot ? "status" : undefined}
                      aria-live="polite"
                    >
                      Salvando nesta sessão…
                    </p>
                  )}
                </div>
                <footer className="hw-reference-editor__footer">
                  <Button
                    disabled={saving}
                    onClick={requestExit}
                    type="button"
                    variant="outline"
                  >
                    Cancelar
                  </Button>
                  <Button loading={saving} type="submit">
                    {error
                      ? "Tentar novamente"
                      : creating
                        ? config.initialStatus === "draft"
                          ? "Salvar rascunho e voltar"
                          : "Salvar configuração e voltar"
                        : "Salvar alterações e voltar"}
                  </Button>
                </footer>
              </>
            )}
          </form>
        )}
      </FocusMode>
    </div>
  );
}

function DomainPreview({ entry }: { entry: PilotItem }) {
  return (
    <>
      <p className="hw-reference-card__summary">{entry.summary}</p>
      {entry.category && (
        <p className="hw-reference-card__owner">Categoria: {entry.category}</p>
      )}
      {entry.author && (
        <p className="hw-reference-card__owner">Autor: {entry.author}</p>
      )}
      {entry.tags?.length ? (
        <p className="hw-reference-card__owner">
          Etiquetas: {entry.tags.join(" · ")}
        </p>
      ) : null}
      {entry.modules && (
        <p className="hw-reference-card__owner">
          Módulos:{" "}
          {entry.modules.join(" · ") || "Nenhum módulo nesta demonstração"}
        </p>
      )}
      {entry.widgets && (
        <p className="hw-reference-card__owner">
          Widgets:{" "}
          {entry.widgets.join(" · ") || "Nenhum widget nesta demonstração"}
        </p>
      )}
      {entry.layout && (
        <div className="hw-pilot__signature" data-layout={entry.layout}>
          {entry.layout !== "compact" && (
            <span aria-hidden="true" className="hw-pilot__signature-mark" />
          )}
          <div>
            <strong>
              Prévia{" "}
              {entry.layout === "horizontal"
                ? "horizontal"
                : entry.layout === "vertical"
                  ? "vertical"
                  : "compacta"}
            </strong>
            {entry.fields?.map((field) => (
              <span key={field}>{field}</span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
