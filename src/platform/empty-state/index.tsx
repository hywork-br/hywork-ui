"use client";

import * as React from "react";

import { cn } from "../../lib/cn";

/**
 * Estado vazio de uma listagem.
 *
 * Decisão da PO (23/09/2026): centralizado, respiro vertical de 64px, texto de
 * 14px em cor esmaecida. Substitui as 8 variações em uso, que iam de 16 a 64px
 * de respiro e usavam quatro tons de cinza diferentes para o mesmo texto.
 *
 * O ícone e a ação são opcionais: quando cabe sugerir o próximo passo, a ação
 * entra; quando basta informar, só a frase.
 */
export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** A frase principal. Curta e específica: "Nenhum colaborador encontrado". */
  title: string;
  /** Uma linha de apoio, quando explica algo que o título não diz. */
  description?: string;
  /** Ícone decorativo acima do título. */
  icon?: React.ReactNode;
  /** Ação sugerida — normalmente um Button. */
  action?: React.ReactNode;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ title, description, icon, action, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col items-center justify-center py-16 text-center", className)}
      {...props}
    >
      {icon && (
        <div className="mb-4 text-muted-foreground [&>svg]:h-8 [&>svg]:w-8" aria-hidden="true">
          {icon}
        </div>
      )}
      <p className="text-sm text-muted-foreground">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground/80">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  ),
);
EmptyState.displayName = "EmptyState";

export { EmptyState };
