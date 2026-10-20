"use client";

import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "../../lib/cn";

/**
 * Cartão de indicador — um número com contexto, no topo de uma tela ou de uma
 * seção de resultados.
 *
 * Anatomia fixa: ícone · rótulo · valor (com detalhe) · variação · barra ·
 * nota. A moldura é a do `Card` (raio 12, respiro 24, borda de 1px, sem
 * sombra).
 *
 * A variação (`delta`) chega **já formatada** — "+0,2", "+3 p.p.", "estável" —
 * e o tom é decisão da tela, não do sinal: `positive` é melhora e `negative` é
 * piora. Uma queda em "Abaixo do esperado" é melhora. Por isso o selo não traz
 * seta: a seta diria a direção, e o que importa é se melhorou.
 *
 * Tons do cartão:
 * - `attention` destaca o cartão como ponto de atenção: fundo e borda no tom
 *   de aviso, e a nota no texto de aviso.
 * - `highlight` é o cartão de destaque (a nota final): fundo na tinta do
 *   texto (`--foreground`) e valor na cor da superfície (`--background`). No
 *   tema escuro o par se inverte sozinho — cartão claro, valor escuro —, e o
 *   contraste se mantém (APCA |Lc| ≥ 104 no valor, ≥ 77 no rótulo e na nota).
 *
 * `iconTone` pinta o quadradinho do ícone com um papel de estado. Sem ele, a
 * primária (ou o aviso, em `attention`). No `highlight`, o quadradinho é
 * preenchido com o papel e o ícone fica na cor de texto sobre ele.
 *
 * `progress` (0–100) desenha uma barra fina sob o valor. A barra é desenho
 * (`aria-hidden`): o número que ela mostra é o `value`, que o leitor de tela
 * já ouve.
 *
 * Com `icon`, o cabeçalho (ícone + rótulo) tem sempre a altura de duas linhas
 * do rótulo, com os dois centralizados: numa fileira de cartões, o valor começa
 * na mesma altura em todos, quer o rótulo caiba numa linha, quer quebre em duas.
 * O rótulo nunca é cortado; um rótulo de três linhas faz o cabeçalho crescer.
 */
export type StatCardDeltaTone = "positive" | "negative" | "neutral";
export type StatCardTone = "default" | "attention" | "highlight";
export type StatCardIconTone = "primary" | "info" | "success" | "warning" | "danger" | "neutral";

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  /** Texto menor ao lado do valor — valor "84%", detalhe "4,2 / 5,0". */
  valueDetail?: React.ReactNode;
  /** Uma linha de contexto abaixo do valor — "41 de 60 iniciaram". */
  note?: React.ReactNode;
  /** Variação já formatada e o tom que a tela atribui a ela. */
  delta?: { value: string; tone: StatCardDeltaTone };
  tone?: StatCardTone;
  /** Ícone decorativo ao lado do rótulo. */
  icon?: React.ReactNode;
  /** Cor do quadradinho do ícone. Padrão: a primária (o aviso, em `attention`). */
  iconTone?: StatCardIconTone;
  /** Barra fina sob o valor, de 0 a 100. */
  progress?: number;
}

const deltaVariants = cva(
  "inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold",
  {
    variants: {
      tone: { positive: "", negative: "", neutral: "" },
      surface: { light: "", dark: "" },
    },
    compoundVariants: [
      // Os mesmos pares fundo/texto do Alert de sucesso e de erro.
      { surface: "light", tone: "positive", className: "bg-success/10 text-hw-status-success" },
      { surface: "light", tone: "negative", className: "bg-error/10 text-hw-status-danger" },
      { surface: "light", tone: "neutral", className: "bg-muted text-muted-foreground" },
      // No destaque, os pares preenchidos do Badge: o fundo suave some no escuro.
      { surface: "dark", tone: "positive", className: "bg-hw-status-success text-success-foreground" },
      { surface: "dark", tone: "negative", className: "bg-hw-status-danger text-error-foreground" },
      { surface: "dark", tone: "neutral", className: "bg-background/15 text-background" },
    ],
  },
);

/** Quadradinho do ícone sobre o cartão claro: fundo suave e traço no papel. */
const iconSoft: Record<StatCardIconTone, string> = {
  primary: "bg-primary/10 text-primary",
  info: "bg-hw-status-info/15 text-hw-status-info",
  success: "bg-hw-status-success-fill/15 text-hw-status-success",
  warning: "bg-warning/15 text-hw-status-warning",
  danger: "bg-hw-status-danger/15 text-hw-status-danger",
  neutral: "bg-muted text-muted-foreground",
};

/** No destaque, o papel preenche o quadradinho e o ícone fica no texto sobre ele. */
const iconSolid: Record<StatCardIconTone, string> = {
  primary: "bg-primary text-primary-foreground",
  info: "bg-hw-status-info text-info-foreground",
  success: "bg-hw-status-success text-success-foreground",
  warning: "bg-hw-status-warning text-warning-foreground",
  danger: "bg-hw-status-danger text-error-foreground",
  neutral: "bg-background/15 text-background",
};

/** O leitor de tela não vê a cor: o tom vira texto antes do valor. */
const deltaText: Record<StatCardDeltaTone, string> = {
  positive: "Variação favorável:",
  negative: "Variação desfavorável:",
  neutral: "Variação:",
};

/** Largura da barra, em %, limitada a 0–100. Valor inválido dá 0. */
const progressWidth = (n: number) => (Number.isFinite(n) ? Math.min(Math.max(n, 0), 100) : 0);

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    { label, value, valueDetail, note, delta, tone = "default", icon, iconTone, progress, className, ...props },
    ref,
  ) => {
    const labelId = React.useId();
    const atencao = tone === "attention";
    const destaque = tone === "highlight";

    const icone = destaque
      ? iconTone
        ? iconSolid[iconTone]
        : "bg-background/15 text-background"
      : iconSoft[iconTone ?? (atencao ? "warning" : "primary")];

    return (
      <div
        ref={ref}
        role="group"
        aria-labelledby={labelId}
        data-tone={tone}
        className={cn(
          "flex min-w-0 flex-col gap-2 rounded-lg border border-border bg-card p-6 text-card-foreground",
          atencao && "border-warning/50 bg-warning/10",
          destaque && "border-foreground bg-foreground text-background",
          className,
        )}
        {...props}
      >
        <div
          data-part="header"
          className={cn(
            "flex min-w-0 items-center gap-2",
            // Duas linhas do rótulo, na entrelinha do text-sm: ao lado dos 32px
            // do ícone, "Abaixo do esperado" quebra num cartão de 226px.
            icon && "min-h-[calc(2*var(--hw-leading-sm))]",
          )}
        >
          {icon && (
            <span
              aria-hidden="true"
              data-icon-tone={iconTone}
              className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md", icone)}
            >
              {icon}
            </span>
          )}
          <span
            id={labelId}
            className={cn("min-w-0 text-sm font-medium", destaque ? "text-background/80" : "text-muted-foreground")}
          >
            {label}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {/* Valor e detalhe pela linha de base; o detalhe desce se faltar espaço. */}
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <div data-part="value" className={cn("text-2xl font-bold tracking-tight", destaque ? "text-background" : "text-hw-heading")}>
              {value}
            </div>
            {valueDetail != null && valueDetail !== false && (
              <span
                data-part="value-detail"
                className={cn(
                  "min-w-0 break-words text-sm font-semibold tabular-nums",
                  destaque ? "text-background/80" : "text-muted-foreground",
                )}
              >
                {valueDetail}
              </span>
            )}
          </div>
          {delta && (
            <span
              data-tone={delta.tone}
              className={deltaVariants({ tone: delta.tone, surface: destaque ? "dark" : "light" })}
            >
              <span className="sr-only">{deltaText[delta.tone]} </span>
              {delta.value}
            </span>
          )}
        </div>

        {typeof progress === "number" && (
          <span
            aria-hidden="true"
            data-part="progress-track"
            className={cn("block h-1.5 w-full overflow-hidden rounded-full", destaque ? "bg-background/20" : "bg-muted")}
          >
            <span
              data-part="progress"
              className={cn(
                "block h-full rounded-full transition-[width] duration-300 motion-reduce:!transition-none",
                destaque ? "bg-background" : atencao ? "bg-warning" : "bg-primary-ink",
              )}
              style={{ width: `${progressWidth(progress)}%` }}
            />
          </span>
        )}

        {note && (
          <div
            className={cn(
              "text-sm",
              destaque ? "text-background/80" : atencao ? "text-hw-status-warning" : "text-muted-foreground",
            )}
          >
            {note}
          </div>
        )}
      </div>
    );
  },
);
StatCard.displayName = "StatCard";

export { StatCard };
