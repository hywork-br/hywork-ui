"use client";

import * as React from "react";

import { cn } from "../../lib/cn";
import { chartColor, toValue, useElementWidth, type ChartColor, type ChartValueFormatter } from "../shared";

/** Uma faixa da distribuição — "Dentro do esperado". */
export interface DistributionBand {
  id: string;
  label: string;
  /** Percentual da faixa, já arredondado. A largura é proporcional à soma das faixas. */
  value: number;
  /** Linha de apoio sob o rótulo — "1 pessoa". Já formatada. */
  note?: string;
  /**
   * Cor da faixa, por token. Sem ela, uma rampa de `--chart-1`, do mais claro
   * (primeira faixa) ao mais escuro (última). A cor de cada faixa é decisão de
   * produto e aguarda a PO.
   */
  color?: ChartColor;
}

/**
 * Distribuição em barra única empilhada (100%): uma fatia por faixa, na ordem
 * recebida, e a legenda embaixo — rótulo e, na linha de baixo, percentual e
 * nota ("25% · 1 pessoa").
 *
 * Só CSS, sem `recharts`: imprime como está e não precisa medir nada. Fatias
 * separadas por 2px da superfície, pontas arredondadas (4px). Faixa com 0%
 * não desenha fatia, mas segue na legenda.
 *
 * A legenda é o texto do gráfico: o leitor de tela a lê no lugar da barra,
 * que é desenho. Com `onSelect`, cada item da legenda vira botão (o teclado
 * chega por ele) e cada fatia responde ao clique.
 */
export interface DistributionBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect" | "children"> {
  bands: DistributionBand[];
  /** Recebe o `id` da faixa clicada. */
  onSelect?: (bandId: string) => void;
  /** Formata o percentual. Padrão: pt-BR, "25%". */
  formatValue?: ChartValueFormatter;
}

const percent = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 1 });
const defaultPercent: ChartValueFormatter = (value) => percent.format(value / 100);

/**
 * Rampa ordinal de `--chart-1` sobre a superfície: 40% → 100%. Com quatro
 * faixas passa nos checks de rampa (luminosidade monotônica, degraus visíveis,
 * a mais clara a 2,19:1 sobre o branco).
 */
const rampColor = (index: number, count: number) =>
  chartColor("chart-1", count <= 1 ? 1 : Math.round((0.4 + (0.6 * index) / (count - 1)) * 100) / 100);

/** Narrowest legend column, in px: "Em desenvolvimento" at 14px plus swatch and padding. */
const MIN_COLUMN = 176;

/** All bands in one row, else half of them per row, else one per row — never 3 + 1. */
const legendColumns = (count: number, width: number) => {
  if (width <= 0) return Math.max(1, Math.ceil(count / 2));
  return [count, Math.ceil(count / 2), 1].find((c) => c >= 1 && width / c >= MIN_COLUMN) ?? 1;
};

const DistributionBar = React.forwardRef<HTMLDivElement, DistributionBarProps>(
  ({ bands, onSelect, formatValue = defaultPercent, className, ...props }, ref) => {
    const [legendRef, legendWidth] = useElementWidth<HTMLUListElement>();
    const colors = bands.map((b, i) => (b.color ? chartColor(b.color) : rampColor(i, bands.length)));
    const values = bands.map((b) => Math.max(0, toValue(b.value) ?? 0));
    const total = values.reduce((a, v) => a + v, 0);

    return (
      <div ref={ref} role="group" className={cn("flex min-w-0 flex-col gap-3", className)} {...props}>
        <div
          aria-hidden="true"
          data-part="distribution-track"
          className="flex h-6 w-full gap-0.5 overflow-hidden rounded bg-card [print-color-adjust:exact]"
        >
          {total > 0 ? (
            bands.map((band, i) =>
              values[i] > 0 ? (
                <div
                  key={band.id}
                  data-part="segment"
                  className={cn(
                    "h-full min-w-[2px] transition-[flex-grow] duration-300 motion-reduce:!transition-none",
                    onSelect && "cursor-pointer hover:opacity-80",
                  )}
                  style={{ flexGrow: values[i], flexBasis: 0, backgroundColor: colors[i] }}
                  onClick={onSelect ? () => onSelect(band.id) : undefined}
                />
              ) : null,
            )
          ) : (
            <div className="h-full w-full bg-muted" />
          )}
        </div>

        <ul
          ref={legendRef}
          className="grid gap-x-4 gap-y-1"
          style={{ gridTemplateColumns: `repeat(${legendColumns(bands.length, legendWidth)}, minmax(0, 1fr))` }}
        >
          {bands.map((band, i) => {
            const content = (
              <>
                <span className="flex items-baseline gap-2">
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 shrink-0 rounded-sm [print-color-adjust:exact]"
                    style={{ backgroundColor: colors[i] }}
                  />
                  <span className="min-w-0 break-words text-sm text-foreground">{band.label}</span>
                </span>{" "}
                <span className="block pl-[18px] text-sm">
                  <span className="font-semibold tabular-nums text-foreground">{formatValue(values[i])}</span>
                  {band.note && (
                    <span className="text-xs text-muted-foreground">
                      <span aria-hidden="true"> · </span>
                      <span className="sr-only">,</span> {band.note}
                    </span>
                  )}
                </span>
              </>
            );
            return (
              <li key={band.id} className="min-w-0">
                {onSelect ? (
                  <button
                    type="button"
                    data-part="band"
                    onClick={() => onSelect(band.id)}
                    className="block w-full rounded-md px-2 py-1.5 text-left outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card motion-reduce:!transition-none"
                  >
                    {content}
                  </button>
                ) : (
                  <div data-part="band" className="px-2 py-1.5">
                    {content}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    );
  },
);
DistributionBar.displayName = "DistributionBar";

export { DistributionBar };
