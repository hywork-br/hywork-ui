import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

/**
 * Indicador de estado.
 *
 * Decisão da PO (23/09/2026): **pílula preenchida pela cor do papel**, raio
 * total, texto de 12px peso 600. Sem ponto interno — a cor já é o indicador.
 *
 * Os cinco papéis saem do levantamento dos 18 valores de status em uso nos dois
 * frontends. A tela informa o papel, nunca a cor:
 *
 *   positive   active · published · completed · approved · finished
 *   attention  pending · running · scheduled · expired
 *   negative   error · failed · rejected · cancelled
 *   informative  informativos, sem juízo de valor
 *   neutral    draft · inactive · archived
 *
 * `success`, `warning`, `destructive` e `info` seguem válidos como nomes
 * anteriores dos mesmos papéis.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold",
  {
    variants: {
      variant: {
        // papéis de estado
        positive: "bg-hw-status-success text-white",
        attention: "bg-hw-status-warning text-white",
        negative: "bg-hw-status-danger text-white",
        informative: "bg-hw-status-info text-white",
        neutral: "bg-muted text-muted-foreground",

        // nomes anteriores dos mesmos papéis
        success: "bg-hw-status-success text-white",
        warning: "bg-hw-status-warning text-white",
        destructive: "bg-hw-status-danger text-white",
        info: "bg-hw-status-info text-white",

        // genéricos
        default: "bg-primary text-primary-foreground",
        secondary: "bg-muted text-muted-foreground",
        outline: "border border-border bg-transparent text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
