"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "../../lib/cn"

/**
 * Barra de progresso (Radix), na tinta da marca sobre a trilha `primary-ink/20`.
 *
 * - `marker` (0–100) desenha uma marca vertical fina, mais alta que a barra,
 *   para um valor de referência — a autoavaliação ao lado da nota final, a
 *   média da empresa ao lado da do time. A marca é desenho; o que ela é chega
 *   ao leitor de tela pela descrição da barra (`markerLabel`, padrão
 *   "Referência: N%").
 * - `tone="attention"` pinta o preenchimento e a trilha na cor de aviso.
 *
 * Sem `marker` e sem `tone`, a barra é a mesma de antes, nó a nó.
 *
 * Autoral desde 19/10/2026 (DHO, HCK-259): a captura do Platform não tinha
 * onde pôr a marca — ver `authoredNames` em scripts/derive-platform.mjs.
 */
export interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  /** Marca de referência, de 0 a 100 — uma linha vertical mais alta que a barra. */
  marker?: number
  /** O que a marca é, para o leitor de tela. Padrão: "Referência: N%". */
  markerLabel?: string
  /** `attention` pinta o preenchimento na cor de aviso. */
  tone?: "default" | "attention"
}

const percent = (n: number) => Math.min(Math.max(n, 0), 100)
const numero = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 })

const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, ProgressProps>(
  ({ className, value, marker, markerLabel, tone = "default", "aria-describedby": describedBy, ...props }, ref) => {
    const markerId = React.useId()
    const comMarca = typeof marker === "number" && Number.isFinite(marker)
    const atencao = tone === "attention"
    const posicao = comMarca ? percent(marker) : 0

    const indicator = (
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 transition-all motion-reduce:!transition-none",
          atencao ? "bg-warning" : "bg-primary-ink"
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    )

    return (
      <ProgressPrimitive.Root
        ref={ref}
        value={value}
        data-tone={tone === "default" ? undefined : tone}
        aria-describedby={comMarca ? [describedBy, markerId].filter(Boolean).join(" ") : describedBy}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full",
          atencao ? "bg-warning/20" : "bg-primary-ink/20",
          // A marca passa da barra em cima e embaixo: quem corta o
          // preenchimento passa a ser a caixa interna.
          comMarca && "overflow-visible",
          className
        )}
        {...props}
      >
        {comMarca ? (
          <>
            <div data-part="clip" className="absolute inset-0 overflow-hidden rounded-[inherit]">
              {indicator}
            </div>
            <span
              aria-hidden="true"
              data-part="marker"
              className="absolute -inset-y-1 w-0.5 -translate-x-1/2 rounded-full bg-foreground ring-1 ring-background"
              style={{ left: `${posicao}%` }}
            />
            <span id={markerId} hidden>
              {markerLabel ?? `Referência: ${numero.format(posicao)}%`}
            </span>
          </>
        ) : (
          indicator
        )}
      </ProgressPrimitive.Root>
    )
  }
)
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
