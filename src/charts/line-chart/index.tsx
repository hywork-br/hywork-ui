"use client";

import * as React from "react";
import { CartesianGrid, Line, LineChart as RechartsLineChart, Tooltip, XAxis, YAxis } from "recharts";

import { cn } from "../../lib/cn";
import {
  ChartDataTable,
  ChartLegend,
  ChartTick,
  ChartTooltipBox,
  ANIMATION_MS,
  GRID,
  INK,
  SURFACE,
  ValueTick,
  chartColor,
  clamp,
  defaultFormat,
  display,
  niceTicks,
  resolveDomain,
  rowHeader,
  tickBlockHeight,
  toValue,
  useElementWidth,
  wrapText,
  type ChartLegendItem,
  type ChartValueFormatter,
} from "../shared";

/** Um ponto da linha — um ciclo na evolução. */
export interface LineChartPoint {
  id: string;
  /** Rótulo do eixo horizontal — o nome do ciclo. */
  label: string;
  /** `null`: sem dado. A linha se interrompe ali e a tabela mostra "—". */
  value: number | null;
  /** Estado provisório — "Parcial", "Provisório". O ponto fica vazado e o trecho até ele, tracejado. */
  provisional?: string;
  /** Marcador do ponto — "Modelos diferentes". O ponto vira losango. */
  flag?: string;
  /** Linha de apoio — "4 pessoas". Na dica e na tabela. */
  note?: string;
}

/**
 * Linha de uma série ao longo de categorias ordenadas — a média de cada
 * ciclo, do mais antigo ao atual.
 *
 * Ponto com `provisional` sai vazado, e o trecho que chega a ele, tracejado:
 * é o ciclo em andamento ou em calibragem. Ponto com `flag` vira losango.
 * Os dois textos entram na legenda (que só aparece quando há um deles), na
 * dica e na tabela. Só o último valor é escrito no desenho; os outros ficam
 * no eixo, na dica e na tabela.
 */
export interface LineChartProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  points: LineChartPoint[];
  /** Nome da série — "Média geral". Legenda, dica e cabeçalho da tabela. */
  seriesLabel: string;
  /** Domínio do eixo vertical — `[1, 5]`. Padrão: de 0 ao maior valor, arredondado. */
  domain?: [number, number];
  /** Formata valores no eixo, no último ponto, na dica e na tabela. Padrão: pt-BR. */
  formatValue?: ChartValueFormatter;
  /** Cabeçalho da primeira coluna da tabela do leitor de tela. Padrão: "Categoria". */
  categoryHeader?: string;
  /** Largura fixa, em px: desliga a medição e a animação. É o modo de impressão. */
  width?: number;
  /** Altura em px. Padrão: proporcional à largura, entre 220 e 320. */
  height?: number;
}

const Y_AXIS = 36;
const MARGIN = { top: 24, right: 16, bottom: 0, left: 0 };

type Datum = { key: string; index: number; solid: number | null; dashed: number | null };

/** Marca do ponto: círculo, losango, vazados quando provisórios; anel da superfície em volta. */
function PointMark({ cx, cy, color, hollow, diamond }: { cx: number; cy: number; color: string; hollow: boolean; diamond: boolean }) {
  const fill = hollow ? SURFACE : color;
  const stroke = hollow ? color : SURFACE;
  return diamond ? (
    <rect x={cx - 4.5} y={cy - 4.5} width={9} height={9} fill={fill} stroke={stroke} strokeWidth={2} transform={`rotate(45 ${cx} ${cy})`} />
  ) : (
    <circle cx={cx} cy={cy} r={hollow ? 4.5 : 4} fill={fill} stroke={stroke} strokeWidth={2} />
  );
}

const LineChart = React.forwardRef<HTMLDivElement, LineChartProps>(
  ({ points, seriesLabel, domain, formatValue = defaultFormat, categoryHeader = "Categoria", width, height, className, ...props }, ref) => {
    const [plotRef, plotWidth] = useElementWidth<HTMLDivElement>(width);
    const color = chartColor("chart-1");
    const h = height ?? clamp(Math.round(plotWidth * 0.45), 220, 320);
    const count = Math.max(1, points.length);
    const band = Math.max(24, (plotWidth - Y_AXIS - MARGIN.left - MARGIN.right) / count);
    const labels = points.map((p) => wrapText(p.label, band - 6, 12, 2));
    const axisHeight = 8 + labels.reduce((acc, l) => Math.max(acc, tickBlockHeight(l.length, 0)), 0);

    const isProvisional = (i: number) => Boolean(points[i]?.provisional);
    const data: Datum[] = points.map((p, i) => {
      const value = toValue(p.value);
      return {
        key: p.id,
        index: i,
        solid: isProvisional(i) ? null : value,
        // The dashed run holds each provisional point and its neighbours, so it
        // joins them while the solid run breaks there.
        dashed: isProvisional(i) || isProvisional(i - 1) || isProvisional(i + 1) ? value : null,
      };
    });
    const lastWithValue = data.reduce((acc, d) => (toValue(points[d.index].value) !== null ? d.index : acc), -1);
    const resolved = resolveDomain(
      domain,
      points.map((p) => toValue(p.value)),
    );
    const animate = width === undefined;

    const dot = (run: "solid" | "dashed") => (props: { cx?: number; cy?: number; index?: number }) => {
      const i = props.index ?? -1;
      const point = points[i];
      const own = run === "dashed" ? isProvisional(i) : !isProvisional(i);
      if (!point || !own || toValue(point.value) === null || props.cx == null || props.cy == null) return <g key={`${run}${i}`} />;
      return (
        <g key={`${run}${i}`}>
          <PointMark cx={props.cx} cy={props.cy} color={color} hollow={run === "dashed"} diamond={Boolean(point.flag)} />
          {i === lastWithValue && (
            <text x={props.cx} y={props.cy - 12} textAnchor="middle" fontSize={12} fontWeight={600} fill={INK}>
              {formatValue(point.value as number)}
            </text>
          )}
        </g>
      );
    };

    const provisionalTexts = [...new Set(points.map((p) => p.provisional).filter((t): t is string => Boolean(t)))];
    const flagTexts = [...new Set(points.map((p) => p.flag).filter((t): t is string => Boolean(t)))];
    const legend: ChartLegendItem[] =
      provisionalTexts.length + flagTexts.length === 0
        ? []
        : [
            { id: "series", label: seriesLabel, color, mark: "line" },
            ...provisionalTexts.map((t) => ({ id: `p:${t}`, label: t, color, mark: "dashed" as const })),
            ...flagTexts.map((t) => ({ id: `f:${t}`, label: t, color, mark: "diamond" as const })),
          ];

    return (
      <div ref={ref} role="group" className={cn("flex min-w-0 flex-col gap-3", className)} {...props}>
        <div ref={plotRef} aria-hidden="true" className="relative w-full min-w-0" style={{ height: h }}>
          {plotWidth > 0 && (
            <RechartsLineChart width={plotWidth} height={h} data={data} margin={MARGIN} accessibilityLayer={false}>
              <CartesianGrid vertical={false} stroke={GRID} />
              <XAxis
                dataKey="key"
                type="category"
                interval={0}
                axisLine={false}
                tickLine={false}
                height={axisHeight}
                padding={{ left: band / 2, right: band / 2 }}
                tick={(tick: { x: number | string; y: number | string; index: number }) => (
                  <ChartTick
                    x={Number(tick.x)}
                    y={Number(tick.y) + 2}
                    lines={labels[tick.index] ?? []}
                    textAnchor="middle"
                    verticalAnchor="start"
                  />
                )}
              />
              <YAxis
                type="number"
                domain={resolved}
                ticks={niceTicks(resolved)}
                allowDataOverflow
                width={Y_AXIS}
                axisLine={false}
                tickLine={false}
                tick={(tick: { x: number | string; y: number | string; payload: { value: number } }) => (
                  <ValueTick x={Number(tick.x) - 4} y={Number(tick.y)} dy={4} textAnchor="end" text={formatValue(tick.payload.value)} />
                )}
              />
              <Tooltip
                cursor={{ stroke: GRID, strokeWidth: 1 }}
                isAnimationActive={false}
                content={({ active, payload }) => {
                  const point = points[Number((payload?.[0]?.payload as Datum | undefined)?.index)];
                  if (!active || !point) return null;
                  return (
                    <ChartTooltipBox
                      title={point.label}
                      details={[point.note, point.provisional, point.flag].filter((d): d is string => Boolean(d))}
                      rows={[
                        {
                          id: "value",
                          label: seriesLabel,
                          value: display(point.value, formatValue),
                          color,
                          mark: point.provisional ? "dashed" : "line",
                        },
                      ]}
                    />
                  );
                }}
              />
              <Line
                dataKey="solid"
                name={seriesLabel}
                type="linear"
                stroke={color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                connectNulls={false}
                isAnimationActive={animate ? "auto" : false}
                animationDuration={ANIMATION_MS}
                dot={dot("solid")}
                activeDot={{ r: 5, fill: color, stroke: SURFACE, strokeWidth: 2 }}
              />
              <Line
                dataKey="dashed"
                name={seriesLabel}
                type="linear"
                stroke={color}
                strokeWidth={2}
                strokeDasharray="6 4"
                strokeLinecap="round"
                connectNulls={false}
                isAnimationActive={animate ? "auto" : false}
                animationDuration={ANIMATION_MS}
                dot={dot("dashed")}
                activeDot={false}
                legendType="none"
              />
            </RechartsLineChart>
          )}
        </div>

        <ChartLegend items={legend} />

        <ChartDataTable
          categoryHeader={categoryHeader}
          columns={[seriesLabel]}
          rows={points.map((p) => ({
            id: p.id,
            header: rowHeader(p.label, p.note, p.provisional, p.flag),
            cells: [display(p.value, formatValue)],
          }))}
        />
      </div>
    );
  },
);
LineChart.displayName = "LineChart";

export { LineChart };
