import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";
import { Checkbox } from "../components/choice";

export type CollectionDensity = "compact" | "comfortable";
export interface TableSorting {
  key: string;
  direction: "ascending" | "descending";
}
export interface TableSelection<T> {
  keys: React.Key[];
  onChange: (keys: React.Key[]) => void;
  getLabel: (row: T) => string;
  isDisabled?: (row: T) => boolean;
}

export interface DataTableColumn<T> {
  align?: "start" | "center" | "end";
  header: string;
  key: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

export interface DataTableProps<T>
  extends React.HTMLAttributes<HTMLDivElement> {
  ariaLabel: string;
  columns: DataTableColumn<T>[];
  getRowKey: (row: T, index: number) => React.Key;
  onSort?: (key: string, direction: "ascending" | "descending") => void;
  rows: T[];
  selection?: TableSelection<T>;
  sorting?: TableSorting | null;
  density?: CollectionDensity;
}

export function DataTable<T extends object>({
  ariaLabel,
  className,
  columns,
  getRowKey,
  onSort,
  rows,
  selection,
  sorting: controlledSorting,
  density = "comfortable",
  ...props
}: DataTableProps<T>) {
  const [internalSorting, setSorting] = React.useState<{
    direction: "ascending" | "descending";
    key: string;
  } | null>(null);
  const sorting =
    controlledSorting === undefined ? internalSorting : controlledSorting;
  const eligible = rows.flatMap((row, index) =>
    selection?.isDisabled?.(row) ? [] : [getRowKey(row, index)]
  );
  const selected = new Set(selection?.keys ?? []);
  const pageSelected = eligible.filter((key) => selected.has(key)).length;

  const sort = (key: string) => {
    const direction =
      sorting?.key === key && sorting.direction === "ascending"
        ? "descending"
        : "ascending";
    if (controlledSorting === undefined) setSorting({ direction, key });
    onSort?.(key, direction);
  };

  return (
    <div
      className={cn("hw-table-wrap", className)}
      data-density={density}
      role="region"
      aria-label={`${ariaLabel}: tabela rolável`}
      tabIndex={0}
      {...props}
    >
      <table aria-label={ariaLabel} className="hw-table">
        <thead>
          <tr>
            {selection && (
              <th scope="col">
                <label className="hw-collection-check">
                  <Checkbox
                    aria-label="Selecionar página"
                    checked={
                      eligible.length > 0 && pageSelected === eligible.length
                    }
                    indeterminate={
                      pageSelected > 0 && pageSelected < eligible.length
                    }
                    disabled={!eligible.length}
                    onChange={() => {
                      const next = new Set(selection.keys);
                      eligible.forEach((key) =>
                        pageSelected === eligible.length
                          ? next.delete(key)
                          : next.add(key)
                      );
                      selection.onChange([...next]);
                    }}
                  />
                </label>
              </th>
            )}
            {columns.map((column) => {
              const active = sorting?.key === column.key;
              return (
                <th
                  aria-sort={active ? sorting.direction : undefined}
                  data-align={column.align ?? "start"}
                  key={column.key}
                  scope="col"
                >
                  {column.sortable && onSort ? (
                    <button
                      aria-label={`Ordenar por ${column.header}`}
                      onClick={() => sort(column.key)}
                      type="button"
                    >
                      {column.header}
                      {active && sorting.direction === "ascending" ? (
                        <ArrowUp aria-hidden="true" />
                      ) : active ? (
                        <ArrowDown aria-hidden="true" />
                      ) : (
                        <ChevronsUpDown aria-hidden="true" />
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={getRowKey(row, rowIndex)}>
              {selection && (
                <td>
                  <label className="hw-collection-check">
                    <Checkbox
                      aria-label={`Selecionar ${selection.getLabel(row)}`}
                      disabled={selection.isDisabled?.(row)}
                      checked={selected.has(getRowKey(row, rowIndex))}
                      onChange={(event) => {
                        const next = new Set(selection.keys);
                        const key = getRowKey(row, rowIndex);
                        if (event.target.checked) next.add(key);
                        else next.delete(key);
                        selection.onChange([...next]);
                      }}
                    />
                  </label>
                </td>
              )}
              {columns.map((column) => (
                <td data-align={column.align ?? "start"} key={column.key}>
                  {column.render?.(row) ??
                    String((row as Record<string, unknown>)[column.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
