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
} from "../../src";
import {
  emptyFilters,
  fixtureDate,
  formatDate,
  matches,
  options,
  periodOptions,
  screenCountOptions,
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

/** A local reference journey, not a product API or production persistence layer. */
export function FeaturePilot({
  config,
  stackedFilters = false,
}: {
  config: PilotConfig;
  stackedFilters?: boolean;
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
  const [confirmExit, setConfirmExit] = useState(false);
  const [failNext, setFailNext] = useState(false);
  const [returnToSearch, setReturnToSearch] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const continueRef = useRef<HTMLButtonElement>(null);
  const inFlight = useRef(false);
  const Icon = config.icon;
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
      status: "draft",
      dimension: config.dimensions[0],
      group: config.groups[0],
      owner: config.owners[0],
      quantity: 0,
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
          : `“${saved.name}” salvo nesta sessão de demonstração.`
      );
      setItems(next);
      setDraft(null);
    } catch {
      setError(
        "Não foi possível salvar. Seus dados continuam aqui. Tente novamente."
      );
    } finally {
      inFlight.current = false;
      setSaving(false);
    }
  }
  const labelFor = (key: keyof PilotFilters) => {
    if (key === "quantity")
      return `Telas: ${
        screenCountOptions.find((option) => option.value === filters.quantity)
          ?.label
      }`;
    if (key === "status") return statusLabel(config, filters[key]);
    if (key === "period")
      return `Atualizado: ${
        periodOptions.find((o) => o.value === filters[key])?.label
      }`;
    if (key === "search") return `Busca: ${filters.search}`;
    return filters[key];
  };
  const active = (Object.keys(filters) as Array<keyof PilotFilters>).filter(
    (key) => filters[key] && filters[key] !== "all"
  );
  const selectFilter = (
    key: keyof PilotFilters,
    label: string,
    values: Option[]
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
            {entry.dimension}
          </span>
          {badge(entry)}
        </div>
        <CardTitle as="h2">{entry.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {config.slug === "email" ? (
          <div className="hw-pilot__signature">
            <span aria-hidden="true" className="hw-pilot__signature-mark" />
            <div>
              <strong>Marina Costa</strong>
              <span>
                {entry.dimension === "Comercial"
                  ? "Relacionamento com clientes"
                  : "Equipe Hywork"}
              </span>
              <small>Prévia do template {entry.group}</small>
            </div>
          </div>
        ) : (
          <p className="hw-reference-card__summary">
            {entry.quantity} {config.quantityLabel.toLocaleLowerCase("pt-BR")} ·{" "}
            {entry.group}
          </p>
        )}
        <p className="hw-reference-card__owner">
          {config.ownerLabel}: {entry.owner}
        </p>
        {config.slug === "email" && (
          <p className="hw-reference-card__owner">{entry.quantity} pessoas</p>
        )}
      </CardContent>
      <CardFooter>
        <span>Atualizado em {formatDate(entry.updated)}</span>
        {editAction(entry)}
      </CardFooter>
    </Card>
  );
  function editSelect(
    key: "dimension" | "group" | "owner" | "status",
    label: string,
    values: Option[]
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
              (current) => current && { ...current, [key]: event.target.value }
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
                    { key: "dimension", header: config.dimensionLabel },
                    ...(config.slug === "tv"
                      ? [
                          { key: "quantity", header: config.quantityLabel },
                          { key: "group", header: config.groupLabel },
                        ]
                      : []),
                    { key: "owner", header: config.ownerLabel },
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
          <FilterBar
            activeFilters={active.map((key) => ({
              id: key,
              label: labelFor(key),
              onRemove: () => updateFilter(key, emptyFilters[key]),
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
                {selectFilter("status", "Status", config.statuses)}
                {selectFilter(
                  "dimension",
                  config.dimensionLabel,
                  options(config.dimensions)
                )}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="quiet">
                      <SlidersHorizontal aria-hidden="true" />
                      Mais filtros
                      {["group", "owner", "period", "quantity"].some(
                        (key) => filters[key as keyof PilotFilters] !== "all"
                      )
                        ? " · ativos"
                        : ""}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    className="hw-reference-advanced"
                    aria-label="Mais filtros"
                  >
                    <h2>Refinar resultados</h2>
                    {config.slug === "tv" && (
                      <Field>
                        <Label>Quantidade de telas</Label>
                        {selectFilter(
                          "quantity",
                          "Quantidade de telas",
                          screenCountOptions
                        )}
                      </Field>
                    )}
                    <Field>
                      <Label>{config.groupLabel}</Label>
                      {selectFilter(
                        "group",
                        config.groupLabel,
                        options(config.groups)
                      )}
                    </Field>
                    <Field>
                      <Label>{config.ownerLabel}</Label>
                      {selectFilter(
                        "owner",
                        config.ownerLabel,
                        options(config.owners)
                      )}
                    </Field>
                    <Field>
                      <Label>Atualizado em</Label>
                      {selectFilter("period", "Atualizado em", periodOptions)}
                    </Field>
                    <FieldHint>
                      Datas de demonstração: referência em 5 set. 2026.
                    </FieldHint>
                  </PopoverContent>
                </Popover>
              </>
            }
          />
        }
        view={config.tableLabel ? "list" : "grid"}
      />
      <p className="hw-reference-notice" role="status">
        {notice}
      </p>
      <details className="hw-reference-demo">
        <summary>Cenários de demonstração</summary>
        <p>
          Mockup interativo. Alterações ficam somente nesta aba; nenhum dado é
          enviado ao produto.
        </p>
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
                          ? "Comece pelo rascunho. Você poderá editar os detalhes depois."
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
                    {editSelect(
                      "dimension",
                      config.dimensionLabel,
                      options(config.dimensions)
                    )}
                    {editSelect("status", "Status", config.statuses)}
                    {editSelect(
                      "group",
                      config.groupLabel,
                      options(config.groups)
                    )}
                    {editSelect(
                      "owner",
                      config.ownerLabel,
                      options(config.owners)
                    )}
                  </div>
                  {error && <FieldError role="alert">{error}</FieldError>}
                  {saving && <p aria-live="polite">Salvando nesta sessão…</p>}
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
                      ? "Salvar rascunho e voltar"
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
