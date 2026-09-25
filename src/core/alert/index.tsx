import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/cn"

/**
 * Aviso dentro da tela.
 *
 * Decisão do Rick (25/09/2026): a forma que o componente já tinha — raio 6,
 * respiro 16/12, texto 14, ícone fixo no canto e o texto recuado à direita
 * dele. O produto tinha 52 caixas desenhadas à mão em três raios e cinco
 * espaçamentos, e nenhuma delas por falta de variante: as seis já existiam e
 * suas cores já resolviam. Foi adoção, não lacuna.
 *
 * `action` entrou junto: seis dessas caixas carregavam botão ("Baixar erros",
 * "Tentar novamente"), e a decisão foi mantê-lo à direita, na mesma linha do
 * texto.
 */
const alertVariants = cva(
  "relative w-full rounded-md border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border",
        destructive:
          "border-destructive/50 bg-destructive/10 text-destructive dark:border-destructive [&>svg]:text-destructive",
        success:
          "border-success/50 bg-success/10 text-hw-status-success dark:border-success [&>svg]:text-hw-status-success",
        warning:
          "border-warning/50 bg-warning/10 text-hw-status-warning dark:border-warning [&>svg]:text-hw-status-warning",
        error:
          "border-error/50 bg-error/10 text-hw-status-danger dark:border-error [&>svg]:text-hw-status-danger",
        info:
          "border-info/50 bg-info/10 text-hw-status-info dark:border-info [&>svg]:text-hw-status-info",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  /** Ação de recuperação, à direita do texto. Normalmente um Button. */
  action?: React.ReactNode;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, action, children, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), action && "flex items-center gap-4", className)}
      {...props}
    >
      {action ? <div className="min-w-0 flex-1">{children}</div> : children}
      {action && <div className="shrink-0">{action}</div>}
    </div>
  ),
)
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
