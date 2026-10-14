"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, LabelList, Tooltip, XAxis, YAxis } from "recharts";

import { cn } from "../../lib/cn";
import {
  ChartDataTable,
  ChartLegend,
  ChartTick,
  ChartTooltipBox,
  ANIMATION_MS,
  GRID,
  MUTED_INK,
  SelectOverlay,
  ValueTick,
  categorySummary,
  clamp,
  defaultFormat,
  display,
  longestWordWidth,
  niceTicks,
  resolveDomain,
  rowHeader,
  seriesColors,
  tickBlockHeight,
  toValue,
  useElementWidth,
  wrapSubLines,
  wrapText,
  type ChartCategory,
  type ChartSeries,
  type ChartValueFormatter,
} from "../shared";

/**
 * Barras agrupadas, na horizontal: uma linha por categoria, uma barra por
 * série — "Líder" e "Autoavaliação" por pilar; ciclo atual e comparado por
 * competência. Na horizontal porque o nome da categoria é longo e quebra na
 * coluna da esquerda, e porque a altura cresce com o número de linhas em vez
 * de espremer as barras.
 *
 * Barra de 12px, 2px de vão entre as da mesma linha, ponta arredondada (4px) e
 * base reta; o valor formatado na ponta. Valor `null` não desenha barra e vira
 * "—" na tabela. Com `onSelect`, o clique em qualquer ponto da linha escolhe a
 * categoria, e cada linha ganha um botão para o teclado, com anel de foco.
 *
 * Uma série só, sem comparação? Use o `BarList` (`@hywork/ui/platform`).
 */
export interface GroupedBarChartProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect" | "children"> {
  categories: ChartCategory[];
  series: ChartSeries[];
  /** Domínio do eixo de valor — `[0, 5]` numa escala de 1 a 5. Padrão: de 0 ao maior valor, arredondado. */
  domain?: [number, number];
  /** Formata valores na ponta da barra, no eixo, na dica e na tabela. Padrão: pt-BR. */
  formatValue?: ChartValueFormatter;
  /** Recebe o `id` da categoria clicada ou escolhida no teclado. */
  onSelect?: (categoryId: string) => void;
  /** Cabeçalho da primeira coluna da tabela do leitor de tela. Padrão: "Categoria". */
  categoryHeader?: string;
  /** Largura fixa, em px: desliga a medição e a animação. É o modo de impressão. */
  width?: number;
}

const BAR = 12;
const BAR_GAP = 2;
const GROUP_GAP = 16;
const AXIS_HEIGHT = 24;
const TOP = 4;
/** Room on the right for the value at the tip of the longest bar. */
const TIP_ROOM = 40;

type Datum = Record<string, string | number | null>;

const GroupedBarChart = React.forwardRef<HTMLDivElement, GroupedBarChartProps>(
  (
    { categories, series, domain, formatValue = defaultFormat, onSelect, categoryHeader = "Categoria", width, className, ...props },
    ref,
  ) => {
    const [plotRef, plotWidth] = useElementWidth<HTMLDivElement>(width);
    const colors = seriesColors(series);
    // A third of the width, but never narrower than the longest word, up to 45%.
    const labelWidth = clamp(
      Math.max(Math.round(plotWidth * 0.3), Math.ceil(longestWordWidth(categories.map((c) => c.label))) + 4),
      88,
      Math.max(88, Math.round(plotWidth * 0.45)),
    );

    const labels = categories.map((c) => ({
      lines: wrapText(c.label, labelWidth),
      subLines: wrapSubLines([c.note, c.flag], labelWidth),
    }));
    const barsBlock = series.length * BAR + Math.max(0, series.length - 1) * BAR_GAP;
    const labelBlock = labels.reduce((acc, l) => Math.max(acc, tickBlockHeight(l.lines.length, l.subLines.length)), 0);
    const row = Math.max(barsBlock + GROUP_GAP, labelBlock + 10);
    const height = TOP + categories.length * row + AXIS_HEIGHT;

    const data: Datum[] = categories.map((c, i) => {
      const datum: Datum = { key: c.id, index: i };
      series.forEach((s, j) => (datum[`s${j}`] = toValue(c.values[s.id])));
      return datum;
    });
    const resolved = resolveDomain(
      domain,
      categories.flatMap((c) => series.map((s) => toValue(c.values[s.id]))),
    );
    const animate = width === undefined;
    const select = onSelect
      ? (index: number) => {
          const category = categories[index];
          if (category) onSelect(category.id);
        }
      : undefined;

    return (
      <div ref={ref} role="group" className={cn("flex min-w-0 flex-col gap-3", className)} {...props}>
        <div ref={plotRef} className="relative w-full min-w-0" style={{ height }}>
          <div aria-hidden="true" className="absolute inset-0" style={{ cursor: select ? "pointer" : undefined }}>
            {plotWidth > 0 && (
              <BarChart
                layout="vertical"
                width={plotWidth}
                height={height}
                data={data}
                margin={{ top: TOP, right: TIP_ROOM, bottom: 0, left: 0 }}
                barGap={BAR_GAP}
                barCategoryGap={row - barsBlock}
                accessibilityLayer={false}
                onClick={
                  select
                    ? (state) => {
                        const index = Number(state?.activeTooltipIndex);
                        if (Number.isInteger(index)) select(index);
                      }
                    : undefined
                }
              >
                <CartesianGrid horizontal={false} stroke={GRID} />
                <XAxis
                  type="number"
                  domain={resolved}
                  ticks={niceTicks(resolved)}
                  allowDataOverflow
                  axisLine={false}
                  tickLine={false}
                  height={AXIS_HEIGHT}
                  tick={(tick: { x: number | string; y: number | string; payload: { value: number } }) => (
                    <ValueTick x={Number(tick.x)} y={Number(tick.y)} dy={10} text={formatValue(tick.payload.value)} />
                  )}
                />
                <YAxis
                  type="category"
                  dataKey="key"
                  width={labelWidth + 8}
                  interval={0}
                  axisLine={false}
                  tickLine={false}
                  tick={(tick: { x: number | string; y: number | string; index: number }) => {
                    const label = labels[tick.index];
                    return label ? (
                      <ChartTick
                        x={Number(tick.x)}
                        y={Number(tick.y)}
                        lines={label.lines}
                        subLines={label.subLines}
                        textAnchor="end"
                        verticalAnchor="middle"
                      />
                    ) : (
                      <g />
                    );
                  }}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))" }}
                  isAnimationActive={false}
                  content={({ active, payload }) => {
                    const index = Number((payload?.[0]?.payload as Datum | undefined)?.index);
                    const category = categories[index];
                    if (!active || !category) return null;
                    return (
                      <ChartTooltipBox
                        title={category.label}
                        details={[category.note, category.flag].filter((d): d is string => Boolean(d))}
                        rows={series.map((s, j) => ({
                          id: s.id,
                          label: s.label,
                          value: display(category.values[s.id], formatValue),
                          color: colors[j],
                          mark: "box",
                        }))}
                      />
                    );
                  }}
                />
                {series.map((s, j) => (
                  <Bar
                    key={s.id}
                    dataKey={`s${j}`}
                    name={s.label}
                    fill={colors[j]}
                    barSize={BAR}
                    radius={[0, 4, 4, 0]}
                    isAnimationActive={animate ? "auto" : false}
                    animationDuration={ANIMATION_MS}
                  >
                    <LabelList
                      dataKey={`s${j}`}
                      position="right"
                      offset={6}
                      fill={MUTED_INK}
                      fontSize={11}
                      formatter={(value: unknown) => {
                        const v = toValue(value);
                        return v === null ? "" : formatValue(v);
                      }}
                    />
                  </Bar>
                ))}
              </BarChart>
            )}
          </div>
          {select &&
            categories.map((c, i) => (
              <SelectOverlay
                key={c.id}
                label={categorySummary(c, series, formatValue)}
                onSelect={() => select(i)}
                style={{ top: TOP + i * row, height: row, left: 0, right: 0 }}
              />
            ))}
        </div>

        {series.length > 1 && <ChartLegend items={series.map((s, j) => ({ id: s.id, label: s.label, color: colors[j], mark: "box" }))} />}

        <ChartDataTable
          categoryHeader={categoryHeader}
          columns={series.map((s) => s.label)}
          rows={categories.map((c) => ({
            id: c.id,
            header: rowHeader(c.label, c.note, c.flag),
            cells: series.map((s) => display(c.values[s.id], formatValue)),
          }))}
        />
      </div>
    );
  },
);
GroupedBarChart.displayName = "GroupedBarChart";

export { GroupedBarChart };
