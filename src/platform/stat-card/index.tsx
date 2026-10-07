"use client";

import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "../../lib/cn";

/**
 * Cartão de indicador — um número com contexto, no topo de uma tela ou de uma
 * seção de resultados.
 *
 * Anatomia fixa: ícone · rótulo · valor · variação · nota. A moldura é a do
 * `Card` (raio 12, respiro 24, borda de 1px, sem sombra).
 *
 * A variação (`delta`) chega **já formatada** — "+0,2", "+3 p.p.", "estável" —
 * e o tom é decisão da tela, não do sinal: `positive` é melhora e `negative` é
 * piora. Uma queda em "Abaixo do esperado" é melhora. Por isso o selo não traz
 * seta: a seta diria a direção, e o que importa é se melhorou.
 *
 * `tone="attention"` destaca o cartão como ponto de atenção: fundo e borda no
 * tom de aviso, e a nota no texto de aviso.
 */
export type StatCardDeltaTone = "positive" | "negative" | "neutral";

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  /** Uma linha de contexto abaixo do valor — "41 de 60 iniciaram". */
  note?: React.ReactNode;
  /** Variação já formatada e o tom que a tela atribui a ela. */
  delta?: { value: string; tone: StatCardDeltaTone };
  tone?: "default" | "attention";
  /** Ícone decorativo ao lado do rótulo. */
  icon?: React.ReactNode;
}

const deltaVariants = cva(
  "inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold",
  {
    variants: {
      tone: {
        // Os mesmos pares fundo/texto do Alert de sucesso e de erro.
        positive: "bg-success/10 text-hw-status-success",
        negative: "bg-error/10 text-hw-status-danger",
        neutral: "bg-muted text-muted-foreground",
      },
    },
  },
);

/** O leitor de tela não vê a cor: o tom vira texto antes do valor. */
const deltaText: Record<StatCardDeltaTone, string> = {
  positive: "Variação favorável:",
  negative: "Variação desfavorável:",
  neutral: "Variação:",
};

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ label, value, note, delta, tone = "default", icon, className, ...props }, ref) => {
    const labelId = React.useId();
    const atencao = tone === "attention";

    return (
      <div
        ref={ref}
        role="group"
        aria-labelledby={labelId}
        data-tone={tone}
        className={cn(
          "flex min-w-0 flex-col gap-2 rounded-lg border border-border bg-card p-6 text-card-foreground",
          atencao && "border-warning/50 bg-warning/10",
          className,
        )}
        {...props}
      >
        <div className="flex min-w-0 items-center gap-2">
          {icon && (
            <span
              aria-hidden="true"
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                atencao ? "bg-warning/15 text-hw-status-warning" : "bg-primary/10 text-primary",
              )}
            >
              {icon}
            </span>
          )}
          <span id={labelId} className="min-w-0 text-sm font-medium text-muted-foreground">
            {label}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <div className="text-2xl font-bold tracking-tight text-hw-heading">{value}</div>
          {delta && (
            <span data-tone={delta.tone} className={deltaVariants({ tone: delta.tone })}>
              <span className="sr-only">{deltaText[delta.tone]} </span>
              {delta.value}
            </span>
          )}
        </div>

        {note && (
          <div className={cn("text-sm", atencao ? "text-hw-status-warning" : "text-muted-foreground")}>
            {note}
          </div>
        )}
      </div>
    );
  },
);
StatCard.displayName = "StatCard";

export { StatCard };
