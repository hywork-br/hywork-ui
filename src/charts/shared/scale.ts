import type { ChartColor, ChartSeries, ChartValueFormatter } from "./types";

/**
 * Ordem fixa das cores de série. `--chart-1` (o azul-marinho do primário) e
 * `--chart-5` (azul-claro) primeiro: as outras três são verde, âmbar e
 * vermelho, e lidas ao lado de um resultado parecem estado. A paleta de
 * gráficos aguarda o aval da PO (DOMAIN_MODEL.md).
 */
export const SERIES_COLORS: readonly ChartColor[] = ["chart-1", "chart-5", "chart-2", "chart-3", "chart-4"];

const known = new Set<string>(SERIES_COLORS);

/** `hsl(var(--chart-n))`, opcionalmente com transparência. Cor desconhecida cai na primeira. */
export const chartColor = (color: ChartColor, alpha?: number) => {
  const token = known.has(color) ? color : SERIES_COLORS[0];
  return alpha === undefined ? `hsl(var(--${token}))` : `hsl(var(--${token}) / ${alpha})`;
};

/** A cor de cada série: a escolhida, ou a da posição. A cor segue a série, nunca o valor. */
export const seriesColors = (series: readonly ChartSeries[]) =>
  series.map((s, i) => chartColor(s.color ?? SERIES_COLORS[i % SERIES_COLORS.length]));

/** Superfície do cartão: o anel em volta dos pontos e o vão entre as barras. */
export const SURFACE = "hsl(var(--card))";
export const GRID = "hsl(var(--border))";
export const INK = "hsl(var(--foreground))";
export const MUTED_INK = "hsl(var(--muted-foreground))";

const ptBR = new Intl.NumberFormat("pt-BR");

/** Formatação padrão: pt-BR, vírgula decimal, o número como chegou. */
export const defaultFormat: ChartValueFormatter = (value) => ptBR.format(value);

/** Número finito ou `null`. */
export const toValue = (value: unknown): number | null => (typeof value === "number" && Number.isFinite(value) ? value : null);

/** Valor para leitura: formatado, ou "—" quando não há. */
export const display = (value: unknown, format: ChartValueFormatter) => {
  const v = toValue(value);
  return v === null ? "—" : format(v);
};

/** Passo "redondo" (1, 2, 2,5, 5 × 10ⁿ) que divide o intervalo em no máximo `maxTicks - 1` partes. */
const niceStep = (span: number, maxTicks: number) => {
  const raw = span / Math.max(1, maxTicks - 1);
  const power = 10 ** Math.floor(Math.log10(raw));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * power >= raw) return m * power;
  return 10 * power;
};

/**
 * Domínio do eixo de valor. O da tela vence; sem ele, de 0 até o maior valor
 * arredondado para cima num passo redondo.
 */
export const resolveDomain = (domain: readonly [number, number] | undefined, values: readonly (number | null)[]): [number, number] => {
  if (domain && Number.isFinite(domain[0]) && Number.isFinite(domain[1]) && domain[1] > domain[0]) return [domain[0], domain[1]];
  const max = values.reduce<number>((acc, v) => (v !== null && v > acc ? v : acc), 0);
  if (max <= 0) return [0, 1];
  const step = niceStep(max, 6);
  return [0, Math.ceil(max / step) * step];
};

/** Marcas do eixo de valor, em passo redondo, de ponta a ponta do domínio. */
export const niceTicks = ([lo, hi]: readonly [number, number], maxTicks = 6) => {
  const step = niceStep(hi - lo, maxTicks);
  const ticks: number[] = [];
  const first = Math.ceil(lo / step) * step;
  // Rounded to kill float drift (0.1 + 0.2).
  for (let t = first; t <= hi + step / 1e6; t += step) ticks.push(Math.round(t * 1e6) / 1e6);
  return ticks;
};

/** Largura estimada de um caractere da Montserrat, em px (≈ 0,62 em). */
export const charWidth = (fontSize = 12) => fontSize * 0.62;

/** Largura estimada da palavra mais longa do texto — o mínimo para ela não ser partida. */
export const longestWordWidth = (texts: readonly string[], fontSize = 12) =>
  texts.reduce((acc, t) => Math.max(acc, ...t.split(/\s+/).map((w) => w.length * charWidth(fontSize))), 0);

/**
 * Quebra um rótulo em linhas por palavra, para caber em `maxWidth` px.
 * A largura por caractere é estimada (`charWidth`), o que dispensa medir o
 * texto — a mesma quebra no navegador, na impressão e no teste. Palavra maior
 * que a linha é partida com hífen; passando de `maxLines`, a última linha
 * termina em "…". O texto inteiro fica na dica, na tabela e no nome acessível.
 */
export const wrapText = (text: string, maxWidth: number, fontSize = 12, maxLines = 3): string[] => {
  const maxChars = Math.max(6, Math.floor(maxWidth / charWidth(fontSize)));
  const words = text
    .split(/\s+/)
    .filter(Boolean)
    .flatMap((word) => {
      if (word.length <= maxChars) return [word];
      const parts: string[] = [];
      for (let i = 0; i < word.length; i += maxChars - 1) parts.push(word.slice(i, i + maxChars - 1));
      return parts.map((part, i) => (i < parts.length - 1 ? `${part}-` : part));
    });
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxChars || !current) current = next;
    else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  const last = kept[maxLines - 1];
  kept[maxLines - 1] = (last.length >= maxChars ? last.slice(0, maxChars - 1) : last) + "…";
  return kept;
};

/** Nota e marcador sob o rótulo, cada um na sua linha — o marcador nunca é cortado pela nota. */
export const wrapSubLines = (parts: readonly (string | undefined)[], maxWidth: number) =>
  parts.filter((p): p is string => Boolean(p)).flatMap((p) => wrapText(p, maxWidth, 11, 2));

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Duração do desenho inicial. O padrão do recharts é 1,5s; o guia pede
 * movimento curto. Com `prefers-reduced-motion` não há animação nenhuma.
 */
export const ANIMATION_MS = 400;
