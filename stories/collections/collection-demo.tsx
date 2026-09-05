import { useState, type Key } from "react";
import {
  Button,
  DataTable,
  MultiSelect,
  DateRangeField,
  ContentCell,
  PersonCell,
  StatusCell,
  DateCell,
  NumberCell,
  Pagination,
  ColumnControl,
  DensityControl,
  SavedViews,
  type CollectionDensity,
  type TableSorting,
} from "../../src";

interface Content {
  id: string;
  title: string;
  author: string;
  status: string;
  date: string;
  views: number;
}
const authors = [
  { value: "Ana Lima", label: "Ana Lima" },
  { value: "Bruno Reis", label: "Bruno Reis" },
  { value: "Carla Souza", label: "Carla Souza" },
];
const fixture: Content[] = [
  {
    id: "1",
    title: "Cultura que aproxima",
    author: "Ana Lima",
    status: "Publicado",
    date: "2026-09-03",
    views: 1280,
  },
  ...[
    "Boas-vindas à equipe",
    "Guia de benefícios",
    "Nossa semana em imagens",
    "Histórias de quem faz",
    "Agenda de setembro",
    "Novidades da unidade",
    "Reconhecimento do mês",
    "Aprendizado compartilhado",
    "Conexões entre equipes",
    "Próximos encontros",
    "Valores na prática",
  ].map((title, i) => ({
    id: String(i + 2),
    title,
    author: authors[i % 3].value,
    status: i % 2 ? "Publicado" : "Rascunho",
    date: `2026-09-${String(i + 4).padStart(2, "0")}`,
    views: i * 137,
  })),
];
const columnOptions = [
  { key: "title", label: "Conteúdo", required: true },
  { key: "author", label: "Autor" },
  { key: "status", label: "Status" },
  { key: "date", label: "Publicação" },
  { key: "views", label: "Visualizações" },
];
interface Criteria {
  search: string;
  status: string;
  authors: string[];
  from: string;
  to: string;
}
interface View {
  id: string;
  name: string;
  criteria: Criteria;
  columns: string[];
  density: CollectionDensity;
  pageSize: number;
  sorting: TableSorting | null;
}
const storageKey = "hywork.collections.contents.views.v1";
const empty: Criteria = {
  search: "",
  status: "",
  authors: [],
  from: "",
  to: "",
};
function readViews(): View[] {
  try {
    const stored: unknown = JSON.parse(
      sessionStorage.getItem(storageKey) || "null"
    );
    if (
      !stored ||
      typeof stored !== "object" ||
      !("version" in stored) ||
      stored.version !== 1 ||
      !("views" in stored) ||
      !Array.isArray(stored.views)
    )
      return [];
    const ids = new Set<string>();
    return stored.views.filter((v): v is View => {
      if (!v || typeof v !== "object") return false;
      const c = v.criteria;
      const valid =
        typeof v.id === "string" &&
        !!v.id &&
        !ids.has(v.id) &&
        typeof v.name === "string" &&
        !!v.name &&
        c &&
        typeof c.search === "string" &&
        ["", "Publicado", "Rascunho"].includes(c.status) &&
        Array.isArray(c.authors) &&
        c.authors.every((a: unknown) => authors.some((o) => o.value === a)) &&
        [c.from, c.to].every(
          (d) =>
            typeof d === "string" && (d === "" || /^\d{4}-\d{2}-\d{2}$/.test(d))
        ) &&
        Array.isArray(v.columns) &&
        v.columns.includes("title") &&
        v.columns.every((key: unknown) =>
          columnOptions.some((o) => o.key === key)
        ) &&
        ["compact", "comfortable"].includes(v.density) &&
        [5, 10, 25, 50].includes(v.pageSize) &&
        (v.sorting === null ||
          (v.sorting &&
            columnOptions.some((o) => o.key === v.sorting.key) &&
            ["ascending", "descending"].includes(v.sorting.direction)));
      if (valid) ids.add(v.id);
      return !!valid;
    });
  } catch {
    return [];
  }
}
export function CollectionDemo() {
  const [rows, setRows] = useState(fixture);
  const [criteria, setCriteria] = useState(empty);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selected, setSelected] = useState<Key[]>([]);
  const [columns, setColumns] = useState(columnOptions.map((c) => c.key));
  const [density, setDensity] = useState<CollectionDensity>("comfortable");
  const [sorting, setSorting] = useState<TableSorting | null>(null);
  const [views, setViews] = useState(readViews);
  const [viewId, setViewId] = useState("");
  const [message, setMessage] = useState("");
  const update = (next: Partial<Criteria>) => {
    setCriteria({ ...criteria, ...next });
    setPage(1);
    setViewId("");
  };
  const filtered = rows
    .filter(
      (row) =>
        row.title
          .toLocaleLowerCase()
          .includes(criteria.search.toLocaleLowerCase()) &&
        (!criteria.status || row.status === criteria.status) &&
        (!criteria.authors.length || criteria.authors.includes(row.author)) &&
        (!criteria.from || row.date >= criteria.from) &&
        (!criteria.to || row.date <= criteria.to)
    )
    .sort((a, b) => {
      if (!sorting) return 0;
      const key = sorting.key as keyof Content;
      const comparison =
        typeof a[key] === "number"
          ? Number(a[key]) - Number(b[key])
          : String(a[key]).localeCompare(String(b[key]), "pt-BR");
      return sorting.direction === "ascending" ? comparison : -comparison;
    });
  const current = Math.min(
    page,
    Math.max(1, Math.ceil(filtered.length / pageSize))
  );
  const visible = filtered.slice((current - 1) * pageSize, current * pageSize);
  const pageSelection = visible.filter((row) => selected.includes(row.id));
  const persist = (next: View[]) => {
    setViews(next);
    try {
      sessionStorage.setItem(
        storageKey,
        JSON.stringify({ version: 1, views: next })
      );
      setMessage("Visões salvas nesta sessão do navegador.");
    } catch {
      setMessage(
        "Armazenamento indisponível. Visões mantidas apenas enquanto esta página estiver aberta."
      );
    }
  };
  return (
    <section className="hw-collection-demo" aria-label="Coleção de conteúdos">
      <header>
        <p>COMUNICAÇÃO INTERNA</p>
        <h1>Conteúdos</h1>
        <p>Histórias, novidades e conhecimento para conectar sua equipe.</p>
        <small>
          Fixture interativa • dados demonstrativos locais. Visões válidas
          apenas nesta sessão.
        </small>
      </header>
      <div className="hw-filter-bar hw-collection-controls">
        <input
          className="hw-input"
          type="search"
          aria-label="Buscar conteúdos"
          placeholder="Buscar conteúdos"
          value={criteria.search}
          onChange={(e) => update({ search: e.target.value })}
        />
        <label>
          Status{" "}
          <select
            value={criteria.status}
            onChange={(e) => update({ status: e.target.value })}
          >
            <option value="">Todos</option>
            <option>Publicado</option>
            <option>Rascunho</option>
          </select>
        </label>
        <details className="hw-collection-disclosure">
          <summary>Mais filtros</summary>
          <div className="hw-collection-advanced">
            <MultiSelect
              aria-label="Autores"
              options={authors}
              value={criteria.authors}
              onValueChange={(value) => update({ authors: value })}
            />
            <DateRangeField
              label="Período de publicação"
              value={{ from: criteria.from, to: criteria.to }}
              onValueChange={update}
            />
            <Button variant="quiet" onClick={() => update(empty)}>
              Limpar filtros
            </Button>
          </div>
        </details>
      </div>
      <div className="hw-collection-controls">
        <ColumnControl
          columns={columnOptions}
          value={columns}
          onChange={(value) => {
            setColumns(value);
            setViewId("");
          }}
        />
        <DensityControl
          value={density}
          onChange={(value) => {
            setDensity(value);
            setViewId("");
          }}
        />
        <details className="hw-collection-disclosure">
          <summary>Gerenciar visões</summary>
          <SavedViews
            views={views}
            value={viewId}
            onChange={(id) => {
              setViewId(id);
              const view = views.find((v) => v.id === id);
              if (view) {
                setCriteria(view.criteria);
                setColumns(view.columns);
                setDensity(view.density);
                setPageSize(view.pageSize);
                setSorting(view.sorting);
                setPage(1);
              }
            }}
            onSave={(name) => {
              let n = 1;
              while (views.some((v) => v.id === `view-${n}`)) n++;
              const id = `view-${n}`;
              persist([
                ...views,
                { id, name, criteria, columns, density, pageSize, sorting },
              ]);
              setViewId(id);
            }}
            onDelete={(id) => {
              persist(views.filter((v) => v.id !== id));
              setViewId("");
            }}
          />
        </details>
      </div>
      <p role="status">
        {rows.length} no total · {filtered.length} filtrados · {visible.length}{" "}
        nesta página · {selected.length} selecionados ({pageSelection.length}{" "}
        nesta página)
      </p>
      <div className="hw-collection-controls">
        <Button
          variant="quiet"
          disabled={!pageSelection.length}
          onClick={() => {
            const ids = new Set(pageSelection.map((row) => row.id));
            setRows(rows.filter((row) => !ids.has(row.id)));
            setSelected(selected.filter((key) => !ids.has(String(key))));
            setPage(
              Math.min(
                current,
                Math.max(1, Math.ceil((filtered.length - ids.size) / pageSize))
              )
            );
            setMessage(
              `${ids.size} conteúdo(s) desta página arquivado(s) na fixture.`
            );
          }}
        >
          Arquivar selecionados desta página ({pageSelection.length})
        </Button>
        {selected.length > 0 && (
          <Button variant="quiet" onClick={() => setSelected([])}>
            Limpar seleção de todas as páginas
          </Button>
        )}
      </div>
      <DataTable
        ariaLabel="Conteúdos"
        rows={visible}
        getRowKey={(row) => row.id}
        density={density}
        sorting={sorting}
        onSort={(key, direction) => {
          setSorting({ key, direction });
          setViewId("");
        }}
        selection={{
          keys: selected,
          onChange: setSelected,
          getLabel: (row) => row.title,
        }}
        columns={[
          {
            key: "title",
            header: "Conteúdo",
            sortable: true,
            render: (row: Content) => (
              <ContentCell
                title={row.title}
                metadata="Comunicação interna • Conteúdo demonstrativo da coleção editorial"
              />
            ),
          },
          {
            key: "author",
            header: "Autor",
            sortable: true,
            render: (row: Content) => <PersonCell name={row.author} />,
          },
          {
            key: "status",
            header: "Status",
            render: (row: Content) => (
              <StatusCell
                label={row.status}
                tone={row.status === "Publicado" ? "success" : "neutral"}
              />
            ),
          },
          {
            key: "date",
            header: "Publicação",
            sortable: true,
            render: (row: Content) => <DateCell value={row.date} />,
          },
          {
            key: "views",
            header: "Visualizações",
            sortable: true,
            align: "end" as const,
            render: (row: Content) => <NumberCell value={row.views} />,
          },
        ].filter(
          (column) => column.key === "title" || columns.includes(column.key)
        )}
      />
      {!visible.length && <p>Nenhum conteúdo corresponde aos filtros.</p>}
      <Pagination
        page={current}
        pageSize={pageSize}
        total={filtered.length}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
          setViewId("");
        }}
      />
      <p role="status">{message}</p>
    </section>
  );
}
