import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

export interface DataTableColumn<T> {
  align?: "start" | "center" | "end";
  header: string;
  key: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

export interface DataTableProps<T> extends React.HTMLAttributes<HTMLDivElement> {
  ariaLabel: string;
  columns: DataTableColumn<T>[];
  getRowKey: (row: T, index: number) => React.Key;
  onSort?: (key: string, direction: "ascending" | "descending") => void;
  rows: T[];
}

export function DataTable<T extends object>({
  ariaLabel,
  className,
  columns,
  getRowKey,
  onSort,
  rows,
  ...props
}: DataTableProps<T>) {
  const [sorting, setSorting] = React.useState<{
    direction: "ascending" | "descending";
    key: string;
  } | null>(null);

  const sort = (key: string) => {
    const direction =
      sorting?.key === key && sorting.direction === "ascending" ? "descending" : "ascending";
    setSorting({ direction, key });
    onSort?.(key, direction);
  };

  return (
    <div className={cn("hw-table-wrap", className)} {...props}>
      <table aria-label={ariaLabel} className="hw-table">
        <thead>
          <tr>
            {columns.map((column) => {
              const active = sorting?.key === column.key;
              return (
                <th
                  aria-sort={active ? sorting.direction : undefined}
                  data-align={column.align ?? "start"}
                  key={column.key}
                  scope="col"
                >
                  {column.sortable ? (
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
