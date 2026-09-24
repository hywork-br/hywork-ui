import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

/**
 * Indicador de estado.
 *
 * Decisão da PO (23/09/2026): estado é **preenchido pela cor do papel**, em
 * pílula de raio total, texto de 12px peso 600.
 *
 * Os cinco papéis saem do levantamento dos 18 valores de status em uso nos dois
 * frontends. A tela informa o papel, nunca a cor:
 *
 *   positive   active · published · completed · approved · finished
 *   attention  pending · running · scheduled · expired
 *   negative   error · failed · rejected · cancelled
 *   info       informativos, sem juízo de valor
 *   neutral    draft · inactive · archived
 *
 * `success`, `warning`, `destructive` e `info` continuam válidos como nomes
 * anteriores dos mesmos papéis.
 *
 * As variantes `default`, `secondary` e `outline` NÃO são estado — são rótulos
 * neutros, usados em 107 dos 124 badges do Platform. Elas mantêm a aparência
 * anterior, com ponto colorido e fundo transparente: a decisão da PO tratava do
 * indicador de status, e aplicá-la a um rótulo neutro pintaria de verde coisas
 * que não são "concluído".
 */
const badgeVariants = cva("inline-flex items-center gap-2 text-[12px] border-none", {
  variants: {
    variant: {
      // rótulos neutros — comportamento anterior preservado
      default: "font-medium px-2 py-1 rounded-md bg-opacity-80 text-primary",
      secondary: "font-medium px-2 py-1 rounded-md bg-opacity-80 text-muted-foreground",
      outline: "font-medium px-2 py-1 rounded-md text-primary border border-primary",

      // papéis de estado — preenchidos
      positive: "font-semibold px-2.5 py-1 rounded-full bg-hw-status-success text-white",
      attention: "font-semibold px-2.5 py-1 rounded-full bg-hw-status-warning text-white",
      negative: "font-semibold px-2.5 py-1 rounded-full bg-hw-status-danger text-white",
      informative: "font-semibold px-2.5 py-1 rounded-full bg-hw-status-info text-white",
      neutral: "font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground",

      // nomes anteriores dos mesmos papéis
      success: "font-semibold px-2.5 py-1 rounded-full bg-hw-status-success text-white",
      warning: "font-semibold px-2.5 py-1 rounded-full bg-hw-status-warning text-white",
      destructive: "font-semibold px-2.5 py-1 rounded-full bg-hw-status-danger text-white",
      info: "font-semibold px-2.5 py-1 rounded-full bg-hw-status-info text-white",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

/** Só os rótulos neutros levam o ponto — no preenchido ele é redundante. */
const pontoPorVariante: Record<string, string> = {
  default: "bg-primary",
  secondary: "bg-secondary",
};

function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const ponto = pontoPorVariante[variant ?? "default"];

  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {ponto && <span className={cn("h-2 w-2 rounded-full", ponto)} aria-hidden="true" />}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
