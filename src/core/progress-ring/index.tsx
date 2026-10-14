"use client";

import * as React from "react";

import { cn } from "../../lib/cn";

/**
 * Anel de progresso — quanto de um todo já foi feito, num espaço quadrado:
 * ao lado de um título, dentro de um card, no topo de um resultado.
 *
 * É o `Progress` em forma de anel, com a mesma semântica (`role="progressbar"`
 * com `aria-valuenow`, `aria-valuemin` e `aria-valuemax`). O arco usa a tinta
 * da marca (`--primary-ink`, a marca legível sobre o fundo) e a trilha é
 * neutra (`--muted`). SVG puro: sem biblioteca de gráfico.
 *
 * O valor é limitado a `[0, max]`; `max` zero ou negativo deixa o anel vazio.
 * O centro mostra a porcentagem arredondada, ou o `label` que a tela passar —
 * "78/85", "4,1". O leitor de tela ouve o mesmo texto, por `aria-valuetext`,
 * quando o `label` é texto; com conteúdo livre, ouve a porcentagem. Para dizer
 * outra coisa, passe `aria-valuetext`.
 */
export interface ProgressRingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  value: number;
  /** Denominador do progresso. Padrão: 100. */
  max?: number;
  /** 48, 72 ou 96px. Padrão: `md`. */
  size?: "sm" | "md" | "lg";
  /** Conteúdo do centro. Padrão: a porcentagem arredondada. */
  label?: React.ReactNode;
}

const sizes = {
  sm: { box: 48, stroke: 4, root: "h-12 w-12", text: "text-xs" },
  md: { box: 72, stroke: 6, root: "h-[72px] w-[72px]", text: "text-sm" },
  lg: { box: 96, stroke: 8, root: "h-24 w-24", text: "text-lg" },
} as const;

const finite = (n: number) => (Number.isFinite(n) ? n : 0);

const ProgressRing = React.forwardRef<HTMLDivElement, ProgressRingProps>(
  (
    {
      value,
      max = 100,
      size = "md",
      label,
      className,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledby,
      "aria-valuetext": ariaValuetext,
      ...props
    },
    ref,
  ) => {
    const limite = Math.max(0, finite(max));
    const atual = limite > 0 ? Math.min(Math.max(finite(value), 0), limite) : 0;
    const fracao = limite > 0 ? atual / limite : 0;
    const porcentagem = `${Math.round(fracao * 100)}%`;

    const { box, stroke, root, text } = sizes[size];
    const centro = box / 2;
    const raio = (box - stroke) / 2;
    const circunferencia = 2 * Math.PI * raio;

    // Destructured, not left in `props`: a wrapper that forwards an undefined
    // aria-label would otherwise erase the defaults below.
    const textoDoRotulo =
      ariaValuetext ??
      (typeof label === "string" || typeof label === "number" ? String(label) : porcentagem);
    const nome = ariaLabel ?? (ariaLabelledby ? undefined : "Progresso");

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={limite}
        aria-valuenow={atual}
        aria-valuetext={textoDoRotulo}
        aria-label={nome}
        aria-labelledby={ariaLabelledby}
        data-size={size}
        className={cn("relative inline-flex shrink-0 items-center justify-center", root, className)}
        {...props}
      >
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox={`0 0 ${box} ${box}`}
          className="absolute inset-0 h-full w-full -rotate-90"
        >
          <circle cx={centro} cy={centro} r={raio} fill="none" strokeWidth={stroke} className="stroke-muted" />
          {fracao > 0 && (
            <circle
              data-part="indicator"
              cx={centro}
              cy={centro}
              r={raio}
              fill="none"
              strokeWidth={stroke}
              strokeDasharray={circunferencia}
              strokeDashoffset={circunferencia * (1 - fracao)}
              className="stroke-primary-ink transition-[stroke-dashoffset] duration-300 motion-reduce:!transition-none"
            />
          )}
        </svg>
        <span
          aria-hidden="true"
          className={cn(
            "relative max-w-full px-1 text-center font-semibold leading-none tabular-nums text-hw-heading",
            text,
          )}
        >
          {label ?? porcentagem}
        </span>
      </div>
    );
  },
);
ProgressRing.displayName = "ProgressRing";

export { ProgressRing };
