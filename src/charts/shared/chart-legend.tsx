import * as React from "react";

import { SURFACE } from "./scale";

/** Como a marca aparece no desenho: linha, linha tracejada, ponto vazado, losango ou bloco. */
export type ChartMark = "line" | "dashed" | "hollow" | "diamond" | "box";

export interface ChartLegendItem {
  id: string;
  label: string;
  /** `hsl(var(--chart-n))` — vem de `chartColor`, nunca literal. */
  color: string;
  mark: ChartMark;
}

/** A amostra da marca, desenhada como no gráfico. Decorativa: o texto ao lado é o que se lê. */
export function ChartSwatch({ color, mark }: { color: string; mark: ChartMark }) {
  return (
    <svg aria-hidden="true" width="18" height="10" viewBox="0 0 18 10" className="shrink-0 overflow-visible">
      {mark === "box" && <rect x="4" y="0" width="10" height="10" rx="2" fill={color} />}
      {(mark === "line" || mark === "dashed") && (
        <line
          x1="0"
          y1="5"
          x2="18"
          y2="5"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={mark === "dashed" ? "4 3" : undefined}
        />
      )}
      {mark === "line" && <circle cx="9" cy="5" r="3" fill={color} />}
      {(mark === "dashed" || mark === "hollow") && <circle cx="9" cy="5" r="3.5" fill={SURFACE} stroke={color} strokeWidth="2" />}
      {mark === "diamond" && <rect x="5" y="1" width="8" height="8" fill={color} transform="rotate(45 9 5)" />}
    </svg>
  );
}

/**
 * Legenda em HTML, abaixo do desenho: sempre presente com duas séries ou
 * mais, para a identidade não depender só da cor. O texto fica na tinta de
 * apoio, nunca na cor da série.
 */
export function ChartLegend({ items }: { items: ChartLegendItem[] }) {
  if (items.length === 0) return null;
  return (
    <ul data-part="chart-legend" className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {items.map((item) => (
        <li key={item.id} className="inline-flex items-center gap-1.5">
          <ChartSwatch color={item.color} mark={item.mark} />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

export interface ChartTooltipRow {
  id: string;
  label: string;
  value: string;
  color?: string;
  mark?: ChartMark;
}

/**
 * Conteúdo da dica ao passar o cursor. Só reforça: tudo o que ela mostra está
 * também na tabela do leitor de tela e, no teclado, no nome do rótulo focado.
 */
export function ChartTooltipBox({ title, details = [], rows }: { title: string; details?: string[]; rows: ChartTooltipRow[] }) {
  return (
    <div
      aria-hidden="true"
      data-part="chart-tooltip"
      className="min-w-[10rem] max-w-[16rem] rounded-md border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md"
    >
      <div className="font-semibold">{title}</div>
      {details.map((detail) => (
        <div key={detail} className="text-muted-foreground">
          {detail}
        </div>
      ))}
      {rows.length > 0 && (
        <ul className="mt-1.5 space-y-1">
          {rows.map((row) => (
            <li key={row.id} className="flex items-center justify-between gap-3">
              <span className="inline-flex min-w-0 items-center gap-1.5">
                {row.color && <ChartSwatch color={row.color} mark={row.mark ?? "box"} />}
                <span className="truncate">{row.label}</span>
              </span>
              <span className="font-semibold tabular-nums">{row.value}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
