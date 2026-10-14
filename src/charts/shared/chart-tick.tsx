import * as React from "react";

import { INK, MUTED_INK } from "./scale";

/** Altura de uma linha do rótulo e de uma linha de apoio, em px. */
export const TICK_LINE = 15;
export const TICK_SUB_LINE = 14;

/** Altura do bloco de texto de um rótulo. */
export const tickBlockHeight = (lines: number, subLines: number) => lines * TICK_LINE + subLines * TICK_SUB_LINE;

export interface ChartTickProps {
  x: number;
  y: number;
  /** Rótulo já quebrado em linhas (`wrapText`). */
  lines: string[];
  /** Linhas de apoio, em tinta suave — nota e marcador. */
  subLines?: string[];
  textAnchor: "start" | "middle" | "end";
  /** Onde o bloco se apoia no ponto: acima dele (`end`), ao centro ou abaixo (`start`). */
  verticalAnchor: "start" | "middle" | "end";
}

/**
 * Rótulo de categoria desenhado no SVG — o nome de um grupo de barras, de um
 * ponto da linha. É desenho: o SVG inteiro fica fora do leitor de tela, que
 * lê a tabela do gráfico. A quebra é a de `wrapText`, a mesma usada para
 * reservar a altura da linha.
 */
export function ChartTick({ x, y, lines, subLines = [], textAnchor, verticalAnchor }: ChartTickProps) {
  const total = tickBlockHeight(lines.length, subLines.length);
  const top = verticalAnchor === "start" ? 0 : verticalAnchor === "middle" ? -total / 2 : -total;
  return (
    <g transform={`translate(${x},${y})`} data-part="chart-tick">
      <text textAnchor={textAnchor} fontSize={12}>
        {lines.map((line, i) => (
          <tspan key={`l${i}`} x={0} y={top + TICK_LINE * (i + 1) - 4} fill={INK} fontWeight={500}>
            {line}
          </tspan>
        ))}
        {subLines.map((line, i) => (
          <tspan key={`s${i}`} x={0} y={top + lines.length * TICK_LINE + TICK_SUB_LINE * (i + 1) - 4} fill={MUTED_INK} fontSize={11}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

/** Marca numérica do eixo de valor: pequena, na tinta de apoio, algarismos tabulares. */
export function ValueTick({
  x,
  y,
  text,
  textAnchor = "middle",
  dy = 0,
}: {
  x: number;
  y: number;
  text: string;
  textAnchor?: "start" | "middle" | "end";
  dy?: number;
}) {
  return (
    <text x={x} y={y} dy={dy} textAnchor={textAnchor} fontSize={11} fill={MUTED_INK} style={{ fontVariantNumeric: "tabular-nums" }}>
      {text}
    </text>
  );
}
