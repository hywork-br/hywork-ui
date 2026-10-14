"use client";

import * as React from "react";
import { Info } from "lucide-react";

import { Button } from "../../core/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../core/popover";
import { Skeleton } from "../../core/skeleton";
import { cn } from "../../lib/cn";

/**
 * Moldura de gráfico — o cartão em volta de cada gráfico de um painel:
 * título, base ("4 pessoas"), "Como é calculado", controles, o gráfico e o
 * rodapé ("Baseado na nota final do ciclo").
 *
 * Os estados vêm por `state`: `loading` mostra o esqueleto no lugar do
 * gráfico; `empty`, a frase "Sem dados suficientes" (ou a de `emptyMessage`).
 * Título, base e rodapé continuam visíveis nos três — o leitor sabe de que
 * gráfico se trata mesmo sem dados.
 *
 * Moldura do `Card` (raio 12, borda de 1px, respiro de 24, sem sombra),
 * título de 18px como o `CardTitle`. Na impressão, o botão "Como é calculado"
 * some e o cartão não se parte entre páginas.
 */
export interface ChartFrameProps extends Omit<React.HTMLAttributes<HTMLElement>, "title" | "children"> {
  title: React.ReactNode;
  /** Base do gráfico, já formatada — "4 pessoas". */
  base?: React.ReactNode;
  /** Explicação da conta. Com ela, o cabeçalho ganha o botão "Como é calculado". */
  howCalculated?: React.ReactNode;
  /** Rodapé — "Baseado na nota final do ciclo". */
  footer?: React.ReactNode;
  /** Controles do cabeçalho, à direita — seletor de nível, "Ver pessoas". */
  actions?: React.ReactNode;
  /** `loading`: esqueleto; `empty`: a frase de vazio. Padrão: `ready`. */
  state?: "ready" | "loading" | "empty";
  /** Frase do vazio. Padrão: "Sem dados suficientes". */
  emptyMessage?: React.ReactNode;
  children?: React.ReactNode;
}

const ChartFrame = React.forwardRef<HTMLElement, ChartFrameProps>(
  (
    { title, base, howCalculated, footer, actions, state = "ready", emptyMessage = "Sem dados suficientes", className, children, ...props },
    ref,
  ) => {
    const titleId = React.useId();

    return (
      <section
        ref={ref}
        aria-labelledby={titleId}
        aria-busy={state === "loading" || undefined}
        data-state={state}
        className={cn(
          "flex min-w-0 flex-col gap-4 rounded-lg border border-border bg-card p-6 text-card-foreground print:break-inside-avoid",
          className,
        )}
        {...props}
      >
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          {/* Keeps room for the title: the actions wrap below it before it is squeezed. */}
          <div className="min-w-[min(100%,16rem)] flex-1">
            <h2 id={titleId} className="text-lg font-semibold leading-snug text-hw-heading">
              {title}
            </h2>
            {base && <p className="mt-1 text-sm text-muted-foreground">{base}</p>}
          </div>
          {(howCalculated || actions) && (
            <div className="flex flex-wrap items-center gap-2">
              {howCalculated && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-1.5 px-2 text-muted-foreground print:hidden">
                      <Info aria-hidden="true" className="h-4 w-4" />
                      Como é calculado
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-80 max-w-[calc(100vw-2rem)] text-sm">
                    <p className="mb-1 font-semibold text-foreground">Como é calculado</p>
                    <div className="text-muted-foreground">{howCalculated}</div>
                  </PopoverContent>
                </Popover>
              )}
              {actions}
            </div>
          )}
        </div>

        <div className="min-w-0" data-part="chart-body">
          {state === "loading" ? (
            <>
              <Skeleton className="h-64 w-full rounded-md" />
              <span className="sr-only">Carregando</span>
            </>
          ) : state === "empty" ? (
            <p className="flex min-h-48 items-center justify-center px-4 text-center text-sm text-muted-foreground">{emptyMessage}</p>
          ) : (
            children
          )}
        </div>

        {footer && <p className="text-xs text-muted-foreground">{footer}</p>}
      </section>
    );
  },
);
ChartFrame.displayName = "ChartFrame";

export { ChartFrame };
