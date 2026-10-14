import * as React from "react";

export interface ChartDataTableRow {
  id: string;
  /** Cabeçalho da linha: o rótulo e, entre parênteses, nota e marcador. */
  header: string;
  cells: string[];
}

export interface ChartDataTableProps {
  caption?: string;
  /** Cabeçalho da primeira coluna — "Competência". */
  categoryHeader: string;
  columns: string[];
  rows: ChartDataTableRow[];
}

/** "Comunicação (12 pessoas; poucos dados)". */
export const rowHeader = (label: string, ...extras: (string | undefined | false)[]) => {
  const extra = extras.filter(Boolean).join("; ");
  return extra ? `${label} (${extra})` : label;
};

/**
 * A tabela que o leitor de tela lê no lugar do desenho. Fica fora da tela,
 * com os mesmos números já formatados do gráfico — inclusive o que o desenho
 * só mostra na dica.
 *
 * O `sr-only` vai num `div` em volta: uma `<table>` ignora a largura de 1px e
 * cresce com o conteúdo, o que dava rolagem horizontal em 390px.
 */
export function ChartDataTable({ caption, categoryHeader, columns, rows }: ChartDataTableProps) {
  return (
    <div className="sr-only">
      <table data-part="chart-table">
        {caption && <caption>{caption}</caption>}
        <thead>
          <tr>
            <th scope="col">{categoryHeader}</th>
            {columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <th scope="row">{row.header}</th>
              {row.cells.map((cell, i) => (
                <td key={columns[i] ?? i}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
