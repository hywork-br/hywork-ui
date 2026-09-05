import { useState } from "react";
import { Button } from "../components/button";
import { Checkbox } from "../components/choice";
import type { CollectionDensity } from "./data-table";

/** One-based controlled page. Invalid incoming pages are clamped for display/navigation. */
export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}) {
  const size = Math.max(1, Math.floor(pageSize) || 1);
  const count = Math.max(0, Math.floor(total) || 0);
  const last = Math.max(1, Math.ceil(count / size));
  const current = Math.min(last, Math.max(1, Math.floor(page) || 1));
  return (
    <nav className="hw-collection-controls" aria-label="Paginação">
      <span>
        {count ? (current - 1) * size + 1 : 0}–{Math.min(current * size, count)}{" "}
        de {count}
      </span>
      <Button
        variant="quiet"
        disabled={current === 1}
        onClick={() => onPageChange(current - 1)}
        aria-label="Página anterior"
      >
        Anterior
      </Button>
      <span>
        Página {current} de {last}
      </span>
      <Button
        variant="quiet"
        disabled={current === last}
        onClick={() => onPageChange(current + 1)}
        aria-label="Próxima página"
      >
        Próxima
      </Button>
      {onPageSizeChange && (
        <label>
          Por página{" "}
          <select
            className="hw-collection-select"
            value={size}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {[...new Set([5, 10, 25, 50, size])]
              .sort((a, b) => a - b)
              .map((n) => (
                <option key={n}>{n}</option>
              ))}
          </select>
        </label>
      )}
    </nav>
  );
}
export interface CollectionColumnOption {
  key: string;
  label: string;
  required?: boolean;
}
export function ColumnControl({
  columns,
  value,
  onChange,
}: {
  columns: CollectionColumnOption[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  return (
    <details className="hw-collection-disclosure">
      <summary>Colunas</summary>
      <div>
        {columns.map((column) => (
          <label className="hw-collection-check" key={column.key}>
            <Checkbox
              checked={!!column.required || value.includes(column.key)}
              disabled={column.required}
              onChange={(e) => {
                const next = new Set(value);
                if (e.target.checked) next.add(column.key);
                else next.delete(column.key);
                columns
                  .filter((c) => c.required)
                  .forEach((c) => next.add(c.key));
                onChange([...next]);
              }}
            />
            {column.label}
          </label>
        ))}
      </div>
    </details>
  );
}
export function DensityControl({
  value,
  onChange,
}: {
  value: CollectionDensity;
  onChange: (value: CollectionDensity) => void;
}) {
  return (
    <label className="hw-collection-density">
      Densidade{" "}
      <select
        className="hw-collection-select"
        value={value}
        onChange={(e) => onChange(e.target.value as CollectionDensity)}
      >
        <option value="comfortable">Confortável</option>
        <option value="compact">Compacta</option>
      </select>
    </label>
  );
}
/** The consumer owns view payloads and persistence. */
export function SavedViews({
  views,
  value,
  onChange,
  onSave,
  onDelete,
}: {
  views: { id: string; name: string }[];
  value: string;
  onChange: (id: string) => void;
  onSave: (name: string) => void;
  onDelete: (id: string) => void;
}) {
  const [name, setName] = useState("");
  return (
    <div className="hw-collection-controls">
      <label>
        Visões salvas{" "}
        <select
          className="hw-collection-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Visão atual</option>
          {views.map((view) => (
            <option key={view.id} value={view.id}>
              {view.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Nome da visão{" "}
        <input
          className="hw-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <Button
        variant="quiet"
        disabled={!name.trim()}
        onClick={() => {
          onSave(name.trim());
          setName("");
        }}
      >
        Salvar visão
      </Button>
      <Button
        variant="quiet"
        disabled={!value || !views.some((view) => view.id === value)}
        onClick={() => onDelete(value)}
      >
        Excluir visão
      </Button>
    </div>
  );
}
