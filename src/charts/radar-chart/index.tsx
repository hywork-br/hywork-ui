"use client";

import * as React from "react";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart as RechartsRadarChart, Tooltip } from "recharts";

import { cn } from "../../lib/cn";
import { GroupedBarChart, type GroupedBarChartProps } from "../grouped-bar-chart";
import {
  ChartDataTable,
  ChartLegend,
  ChartTooltipBox,
  ANIMATION_MS,
  GRID,
  SURFACE,
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
} from "../shared";

/**
 * Radar — uma série por polígono, um eixo por categoria: a média do líder e
 * a da autoavaliação em cada competência.
 *
 * Cada eixo mostra o nome e, embaixo, a nota e o marcador da categoria
 * ("12 pessoas · poucos dados"). Com `onSelect`, o nome do eixo é um botão
 * (Tab, Enter, Espaço, anel de foco) e o clique em qualquer ponto do setor
 * também escolhe a categoria.
 *
 * Com menos de três categorias o radar não tem forma — vira um triângulo
 * achatado ou uma reta —, e abaixo de 360px de largura os nomes dos eixos
 * espremem o desenho até ele não se ler. Nos dois casos o componente desenha
 * um `GroupedBarChart` com os mesmos dados e o mesmo `onSelect`, sem a tela
 * precisar decidir.
 *
 * Valor `null` não vai ao centro, que leria como zero: o polígono se abre
 * naquele eixo, sem ponto, e a tabela mostra "—".
 */
export interface RadarChartProps extends GroupedBarChartProps {
  /** Altura em px. Padrão: proporcional à largura, entre 300 e 440. */
  height?: number;
}

const LABEL_GAP = 10;

type Datum = Record<string, string | number | null>;
type Point = { x: number; y: number; value?: number | null };

/** O polígono da série; aberto onde falta valor, para não puxar o desenho para o centro. */
function RadarShape({ points, color }: { points: Point[]; color: string }) {
  const valid = points.map((p) => toValue(p.value) !== null);
  const path = (run: Point[]) => run.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join("");

  if (valid.every(Boolean)) {
    return <path d={`${path(points)}Z`} fill={color} fillOpacity={0.12} stroke={color} strokeWidth={2} strokeLinejoin="round" />;
  }

  // Runs of consecutive points with a value, wrapping around the last axis.
  const start = valid.indexOf(false);
  const runs: Point[][] = [];
  let run: Point[] = [];
  for (let k = 1; k <= points.length; k++) {
    const i = (start + k) % points.length;
    if (valid[i]) run.push(points[i]);
    else {
      if (run.length > 1) runs.push(run);
      run = [];
    }
  }
  if (run.length > 1) runs.push(run);
  return (
    <g>
      {runs.map((r, i) => (
        <path key={i} d={path(r)} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      ))}
    </g>
  );
}

const RadarPlot = React.forwardRef<HTMLDivElement, RadarChartProps>(
  (
    { categories, series, domain, formatValue = defaultFormat, onSelect, categoryHeader = "Categoria", width, height, className, ...props },
    ref,
  ) => {
    const [plotRef, plotWidth] = useElementWidth<HTMLDivElement>(width);
    const colors = seriesColors(series);
    const h = height ?? clamp(Math.round(plotWidth * 0.8), 300, 440);
    const labelWidth = clamp(
      Math.max(Math.round(plotWidth * 0.2), Math.ceil(longestWordWidth(categories.map((c) => c.label))) + 4),
      72,
      Math.max(72, Math.min(160, Math.round(plotWidth * 0.28))),
    );

    const labels = categories.map((c) => ({
      lines: wrapText(c.label, labelWidth),
      subLines: wrapSubLines([c.note, c.flag], labelWidth),
    }));
    const block = labels.reduce((acc, l) => Math.max(acc, tickBlockHeight(l.lines.length, l.subLines.length)), 0);
    const cx = plotWidth / 2;
    const cy = h / 2;
    const radius = Math.max(40, Math.min((plotWidth - 2 * (labelWidth + LABEL_GAP)) / 2, (h - 2 * (block + LABEL_GAP)) / 2));

    const data: Datum[] = categories.map((c, i) => {
      const datum: Datum = { key: c.id, index: i };
      series.forEach((s, j) => (datum[`s${j}`] = toValue(c.values[s.id])));
      return datum;
    });
    const resolved = resolveDomain(
      domain,
      categories.flatMap((c) => series.map((s) => toValue(c.values[s.id]))),
    );
    const ticks = niceTicks(resolved);
    // The scale is written only while its rings stay 16px apart, and never at the centre.
    const showScale = ticks.length > 1 && radius / (ticks.length - 1) >= 16;
    const animate = width === undefined;
    const select = onSelect
      ? (index: number) => {
          const category = categories[index];
          if (category) onSelect(category.id);
        }
      : undefined;

    // Recharts lays the category axis clockwise from 12 o'clock: 90° − i·360°/n.
    const place = (index: number) => {
      const angle = ((90 - (index * 360) / categories.length) * Math.PI) / 180;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const side = cos > 0.25 ? "start" : cos < -0.25 ? "end" : "middle";
      return {
        side,
        style: {
          left: cx + (radius + LABEL_GAP) * cos,
          top: cy - (radius + LABEL_GAP) * sin,
          maxWidth: labelWidth + 8,
          transform: `translate(${side === "start" ? "0" : side === "end" ? "-100%" : "-50%"}, ${(-(1 + sin) / 2) * 100}%)`,
        } satisfies React.CSSProperties,
      };
    };

    return (
      <div ref={ref} role="group" className={cn("flex min-w-0 flex-col gap-3", className)} {...props}>
        <div ref={plotRef} className="relative w-full min-w-0" style={{ height: h }}>
          <div aria-hidden="true" className="absolute inset-0" style={{ cursor: select ? "pointer" : undefined }}>
            {plotWidth > 0 && (
              <RechartsRadarChart
                width={plotWidth}
                height={h}
                data={data}
                cx={cx}
                cy={cy}
                outerRadius={radius}
                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
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
                <PolarGrid stroke={GRID} gridType="polygon" />
                <PolarAngleAxis dataKey="key" tick={false} tickLine={false} axisLine={false} />
                <PolarRadiusAxis
                  domain={resolved}
                  ticks={ticks}
                  angle={90}
                  axisLine={false}
                  tickLine={false}
                  tick={(tick: { x: number | string; y: number | string; payload: { value: number } }) =>
                    showScale && tick.payload.value !== resolved[0] ? (
                      <ValueTick
                        x={Number(tick.x) + 4}
                        y={Number(tick.y)}
                        dy={4}
                        textAnchor="start"
                        text={formatValue(tick.payload.value)}
                      />
                    ) : (
                      <g />
                    )
                  }
                />
                <Tooltip
                  cursor={false}
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
                          mark: "line",
                        }))}
                      />
                    );
                  }}
                />
                {series.map((s, j) => (
                  <Radar
                    key={s.id}
                    dataKey={`s${j}`}
                    name={s.label}
                    stroke={colors[j]}
                    fill={colors[j]}
                    isAnimationActive={animate ? "auto" : false}
                    animationDuration={ANIMATION_MS}
                    shape={(shape: { points: Point[] }) => <RadarShape points={shape.points} color={colors[j]} />}
                    dot={(dot: { cx?: number; cy?: number; value?: number | null; index?: number }) =>
                      toValue(dot.value) === null ? (
                        <g key={dot.index} />
                      ) : (
                        <circle key={dot.index} cx={dot.cx} cy={dot.cy} r={4} fill={colors[j]} stroke={SURFACE} strokeWidth={2} />
                      )
                    }
                  />
                ))}
              </RechartsRadarChart>
            )}
          </div>

          {plotWidth > 0 &&
            categories.map((c, i) => {
              const { side, style } = place(i);
              const content = (
                <>
                  {labels[i].lines.map((line, k) => (
                    <span key={`l${k}`} data-line="" className="block whitespace-nowrap font-medium text-foreground">
                      {line}
                    </span>
                  ))}
                  {labels[i].subLines.map((line, k) => (
                    <span key={`s${k}`} className="block whitespace-nowrap text-[11px] leading-[14px] text-muted-foreground">
                      {line}
                    </span>
                  ))}
                </>
              );
              const align = side === "start" ? "text-left" : side === "end" ? "text-right" : "text-center";
              return select ? (
                <button
                  key={c.id}
                  type="button"
                  data-part="chart-axis"
                  aria-label={categorySummary(c, series, formatValue)}
                  onClick={() => select(i)}
                  className={cn(
                    "absolute rounded text-xs leading-[15px] outline-none [&:hover_[data-line]]:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                    align,
                  )}
                  style={style}
                >
                  {content}
                </button>
              ) : (
                <span
                  key={c.id}
                  aria-hidden="true"
                  data-part="chart-axis"
                  className={cn("absolute text-xs leading-[15px]", align)}
                  style={style}
                >
                  {content}
                </span>
              );
            })}
        </div>

        {series.length > 1 && <ChartLegend items={series.map((s, j) => ({ id: s.id, label: s.label, color: colors[j], mark: "line" }))} />}

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
RadarPlot.displayName = "RadarPlot";

/** Abaixo desta largura, em px, o radar fica pequeno demais para ler e vira barras. */
const MIN_RADAR_WIDTH = 360;

const RadarChart = React.forwardRef<HTMLDivElement, RadarChartProps>(({ height, ...props }, ref) => {
  const [boxRef, boxWidth] = useElementWidth<HTMLDivElement>(props.width);
  const asBars = props.categories.length < 3 || (boxWidth > 0 && boxWidth < MIN_RADAR_WIDTH);
  return (
    <div ref={boxRef} className="min-w-0" data-layout={asBars ? "bars" : "radar"}>
      {asBars ? <GroupedBarChart ref={ref} {...props} /> : <RadarPlot ref={ref} height={height} {...props} />}
    </div>
  );
});
RadarChart.displayName = "RadarChart";

export { RadarChart };
