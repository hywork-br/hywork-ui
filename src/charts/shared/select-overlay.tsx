import * as React from "react";

import { cn } from "../../lib/cn";
import { display } from "./scale";
import type { ChartCategory, ChartSeries, ChartValueFormatter } from "./types";

/**
 * "Comunicação: Líder 3,3; Autoavaliação 4,3; 12 pessoas; poucos dados".
 * Ponto e vírgula entre as partes, porque a vírgula já é a casa decimal.
 */
export const categorySummary = (category: ChartCategory, series: readonly ChartSeries[], format: ChartValueFormatter) =>
  [
    `${category.label}: ${series.map((s) => `${s.label} ${display(category.values[s.id], format)}`).join("; ")}`,
    category.note,
    category.flag,
  ]
    .filter(Boolean)
    .join("; ");

/**
 * Botão de teclado sobre uma região do gráfico — a linha de um grupo de
 * barras. Transparente e sem cursor (`pointer-events-none`): o mouse continua
 * falando com o desenho, que mostra a dica e escolhe pelo clique. O teclado
 * chega por aqui, com anel de foco no `--ring` em volta da região inteira.
 */
export function SelectOverlay({
  label,
  onSelect,
  style,
  className,
}: {
  label: string;
  onSelect: () => void;
  style: React.CSSProperties;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      data-part="chart-select"
      onClick={onSelect}
      className={cn(
        "pointer-events-none absolute rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card print:hidden",
        className,
      )}
      style={style}
    />
  );
}
