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
 * O texto nunca quebra: em coluna estreita a pílula vira um "ovo" de duas
 * linhas. A tabela rola na horizontal em vez de espremer o badge.
 *
 * `success`, `warning`, `destructive` e `info` seguem válidos como nomes
 * anteriores dos mesmos papéis.
 *
 * **Tom suave** (`tone="subtle"`, HCK-136, 06/10/2026): o mesmo papel num
 * preenchimento claro — a cor do papel a 15% — com o texto na tinta do papel.
 * Serve para separar duas colunas de estado na mesma linha, que no tom cheio
 * empatavam (na tela de Usuários, "Ativo" e "Acesso configurado" eram o mesmo
 * verde). O tom cheio continua o padrão; todo papel a 15% passa AA (o verde,
 * o mais justo, dá 4,8:1). `neutral`, `outline` e os genéricos não têm tom.
 */
const badgeVariants = cva(
  "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-semibold",
  {
    variants: {
      variant: {
        // papéis de estado — a cor vem do tom, nas combinações abaixo
        positive: "",
        attention: "",
        negative: "",
        informative: "",
        neutral: "bg-muted text-muted-foreground",

        // nomes anteriores dos mesmos papéis
        success: "",
        warning: "",
        destructive: "",
        info: "",

        // genéricos
        default: "bg-primary text-primary-foreground",
        secondary: "bg-muted text-muted-foreground",
        outline: "border border-border bg-transparent text-foreground",
      },
      tone: {
        solid: "",
        subtle: "",
      },
    },
    compoundVariants: [
      // Tom cheio — preenchimento é a escolha literal da PO (Opção D,
      // "bg-emerald-500"). Estado não segue a marca do workspace.
      // Verde da PO (emerald-500) com o texto escuro de status: branco dava
      // 2,5:1, abaixo dos 4,5:1 da WCAG; o texto escuro dá 7:1. Os outros três
      // fundos são escuros e seguem com texto branco (6,5:1 ou mais).
      {
        variant: ["positive", "success"],
        tone: "solid",
        className: "bg-hw-status-success-fill text-hw-on-status",
      },
      { variant: ["attention", "warning"], tone: "solid", className: "bg-hw-status-warning text-white" },
      { variant: ["negative", "destructive"], tone: "solid", className: "bg-hw-status-danger text-white" },
      { variant: ["informative", "info"], tone: "solid", className: "bg-hw-status-info text-white" },

      // Tom suave — o papel a 15% sob a tinta do papel (4,8:1 a 5,5:1).
      {
        variant: ["positive", "success"],
        tone: "subtle",
        className: "bg-hw-status-success-fill/15 text-hw-status-success",
      },
      {
        variant: ["attention", "warning"],
        tone: "subtle",
        className: "bg-hw-status-warning/15 text-hw-status-warning",
      },
      {
        variant: ["negative", "destructive"],
        tone: "subtle",
        className: "bg-hw-status-danger/15 text-hw-status-danger",
      },
      {
        variant: ["informative", "info"],
        tone: "subtle",
        className: "bg-hw-status-info/15 text-hw-status-info",
      },
    ],
    defaultVariants: {
      variant: "default",
      tone: "solid",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, tone, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, tone }), className)} {...props}>
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
