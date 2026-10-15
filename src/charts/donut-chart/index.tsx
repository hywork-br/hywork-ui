"use client";

import * as React from "react";

import { cn } from "../../lib/cn";
import { ChartLegend, SERIES_COLORS, chartColor, defaultFormat, toValue, type ChartColor, type ChartValueFormatter } from "../shared";

/** Um segmento da rosca — "Comercial", 62. */
export interface DonutSegment {
  id: string;
  label: string;
  /** Valor ≥ 0, já arredondado. A fatia é `value / soma`; com 0, não desenha. */
  value: number;
  /** Cor por token. Sem ela, a ordem fixa das séries pela posição na lista. */
  color?: ChartColor;
}

/**
 * Rosca — uma fatia por segmento, na ordem recebida, a partir do topo e no
 * sentido horário, do tamanho de `value / soma`. No centro, opcionalmente, um
 * valor em destaque e, embaixo, um rótulo pequeno em caixa alta.
 *
 * SVG puro, sem `recharts`: viewBox de 140, raio 54, traço de 18, como no
 * protótipo da HCK-256. Fatias separadas por 2px da superfície. Com soma zero,
 * só o trilho neutro (`--muted`).
 *
 * Não tem legenda obrigatória: a tela monta a lista ao lado e pinta cada item
 * com `donutColors(segments)`, as mesmas cores do desenho. `legend` liga uma
 * legenda simples embaixo.
 *
 * O desenho é uma imagem (`role="img"`) cujo nome é o `aria-label` da tela ou,
 * na falta, "rótulo: valor" de cada segmento. Com `onSegmentClick`, cada fatia
 * vira botão (Tab, Enter, Espaço, anel de foco) e o conjunto vira um grupo.
 */
export interface DonutChartProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  segments: DonutSegment[];
  /** Valor do centro, em destaque — "3,8". Já formatado. */
  centerValue?: React.ReactNode;
  /** Rótulo sob o valor, em caixa alta — "Média geral". */
  centerLabel?: React.ReactNode;
  /** Lado do quadrado, em px. Padrão: 140. */
  size?: number;
  /** Formata o valor na descrição e na dica. Padrão: pt-BR. */
  formatValue?: ChartValueFormatter;
  /** Recebe o `id` do segmento clicado. Com ele, cada fatia é um botão. */
  onSegmentClick?: (segmentId: string) => void;
  /** Legenda simples embaixo do desenho. Padrão: sem legenda — a lista é da tela. */
  legend?: boolean;
}

const BOX = 140;
const CENTER = BOX / 2;
const RADIUS = 54;
const THICKNESS = 18;
/** Surface gap between slices, in viewBox units (2px at 140px). */
const GAP = 2;
/** The shortest slice still drawn, so a tiny share does not vanish. */
const MIN_ARC = 1;
/** Focus ring: 2px wide, 2px off the slice, on its outer and inner edges. */
const RING_RADII = [RADIUS + THICKNESS / 2 + 3, RADIUS - THICKNESS / 2 - 3];
/** From the sixth segment on, the same series order, lighter. */
const TINTS = [0.55, 0.3];

const round = (n: number) => Math.round(n * 1000) / 1000;

/**
 * A cor de cada segmento: o token escolhido, ou o da posição — `chart-1`,
 * `chart-5`, `chart-2..4` e, a partir do sexto, a mesma ordem mais clara. A
 * cor segue a posição na lista, inclusive a de um segmento com valor 0: a
 * lista ao lado usa o mesmo índice.
 */
export const donutColors = (segments: readonly DonutSegment[]) =>
  segments.map((segment, i) => {
    if (segment.color) return chartColor(segment.color);
    const token = SERIES_COLORS[i % SERIES_COLORS.length];
    const lap = Math.floor(i / SERIES_COLORS.length);
    return lap === 0 ? chartColor(token) : chartColor(token, TINTS[Math.min(lap, TINTS.length) - 1]);
  });

/** Dash of a circle of radius `r` covering `[from, from + length]`, as fractions of the turn. */
const dash = (r: number, from: number, length: number): React.CSSProperties => {
  const circumference = 2 * Math.PI * r;
  return {
    strokeDasharray: `${round(length * circumference)} ${round(circumference)}`,
    strokeDashoffset: round(-from * circumference),
  };
};

const textOf = (node: React.ReactNode) => (typeof node === "string" || typeof node === "number" ? String(node) : undefined);

const DonutChart = React.forwardRef<HTMLDivElement, DonutChartProps>(
  (
    {
      segments,
      centerValue,
      centerLabel,
      size = BOX,
      formatValue = defaultFormat,
      onSegmentClick,
      legend = false,
      className,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledby,
      ...props
    },
    ref,
  ) => {
    const descriptionId = React.useId();
    const colors = donutColors(segments);
    const values = segments.map((s) => Math.max(0, toValue(s.value) ?? 0));
    const total = values.reduce((a, v) => a + v, 0);
    const drawn = values.filter((v) => v > 0).length;

    const circumference = 2 * Math.PI * RADIUS;
    const gap = drawn > 1 ? GAP / circumference : 0;
    const minArc = MIN_ARC / circumference;
    let start = 0;
    const arcs = values.map((v) => {
      const share = total > 0 ? v / total : 0;
      const arc = { from: start + gap / 2, length: Math.max(minArc, share - gap) };
      start += share;
      return arc;
    });

    const center = [textOf(centerLabel), textOf(centerValue)].filter(Boolean).join(": ");
    const description = [center, segments.map((s, i) => `${s.label}: ${formatValue(values[i])}`).join("; ")]
      .filter(Boolean)
      .join(". ");
    const labelled = Boolean(ariaLabel || ariaLabelledby);

    const valueSize = Math.round((size * 20) / BOX);
    const labelSize = Math.max(10, Math.round((size * 9) / BOX));

    return (
      <div ref={ref} className={cn("inline-flex max-w-full flex-col items-center gap-3", className)} {...props}>
        <div
          role={onSegmentClick ? "group" : "img"}
          aria-label={ariaLabel ?? (ariaLabelledby ? undefined : description)}
          aria-labelledby={ariaLabelledby}
          aria-describedby={labelled ? descriptionId : undefined}
          data-part="donut"
          className="relative shrink-0 [print-color-adjust:exact]"
          style={{ width: size, height: size }}
        >
          <svg
            aria-hidden={onSegmentClick ? undefined : true}
            focusable="false"
            viewBox={`0 0 ${BOX} ${BOX}`}
            className="absolute inset-0 h-full w-full overflow-visible"
          >
            {total <= 0 ? (
              <circle data-part="donut-track" cx={CENTER} cy={CENTER} r={RADIUS} fill="none" strokeWidth={THICKNESS} className="stroke-muted" />
            ) : (
              <g transform={`rotate(-90 ${CENTER} ${CENTER})`}>
                {segments.map((segment, i) => {
                  if (values[i] <= 0) return null;
                  const name = `${segment.label}: ${formatValue(values[i])}`;
                  const slice = (
                    <circle
                      data-part="segment"
                      cx={CENTER}
                      cy={CENTER}
                      r={RADIUS}
                      fill="none"
                      stroke={colors[i]}
                      strokeWidth={THICKNESS}
                      style={dash(RADIUS, arcs[i].from, arcs[i].length)}
                      className={cn(
                        "transition-[stroke-dasharray,stroke-dashoffset] duration-300 motion-reduce:!transition-none",
                        onSegmentClick && "group-hover:opacity-80",
                      )}
                    >
                      {!onSegmentClick && <title>{name}</title>}
                    </circle>
                  );
                  if (!onSegmentClick) return <React.Fragment key={segment.id}>{slice}</React.Fragment>;
                  return (
                    <g
                      key={segment.id}
                      role="button"
                      tabIndex={0}
                      aria-label={name}
                      className="group cursor-pointer outline-none"
                      onClick={() => onSegmentClick(segment.id)}
                      onKeyDown={(event) => {
                        if (event.key !== "Enter" && event.key !== " ") return;
                        event.preventDefault();
                        onSegmentClick(segment.id);
                      }}
                    >
                      <title>{name}</title>
                      {slice}
                      {RING_RADII.map((r) => (
                        <circle
                          key={r}
                          data-part="focus-ring"
                          cx={CENTER}
                          cy={CENTER}
                          r={r}
                          fill="none"
                          strokeWidth={2}
                          style={dash(r, arcs[i].from, arcs[i].length)}
                          className="pointer-events-none stroke-ring opacity-0 group-focus-visible:opacity-100"
                        />
                      ))}
                    </g>
                  );
                })}
              </g>
            )}
          </svg>

          {(centerValue !== undefined || centerLabel !== undefined) && (
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
              {centerValue !== undefined && (
                <span data-part="center-value" className="font-extrabold leading-none tabular-nums text-hw-heading" style={{ fontSize: valueSize }}>
                  {centerValue}
                </span>
              )}
              {centerLabel !== undefined && (
                <span
                  data-part="center-label"
                  className="font-bold uppercase leading-tight tracking-wide text-muted-foreground"
                  style={{ fontSize: labelSize, maxWidth: Math.round((size * 80) / BOX) }}
                >
                  {centerLabel}
                </span>
              )}
            </div>
          )}

        </div>

        {/* Referenced by id, so it is read as the description although hidden. */}
        {labelled && (
          <span id={descriptionId} hidden>
            {description}
          </span>
        )}

        {legend && (
          <ChartLegend items={segments.map((s, i) => ({ id: s.id, label: s.label, color: colors[i], mark: "box" as const }))} />
        )}
      </div>
    );
  },
);
DonutChart.displayName = "DonutChart";

export { DonutChart };
