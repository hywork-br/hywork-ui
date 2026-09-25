"use client";

import * as React from "react";

import { cn } from "../../lib/cn";

/**
 * Cabeçalho de página.
 *
 * Decisão da PO (23/09/2026): 24px, peso 700, cor de texto principal.
 * Substitui as 9 combinações em uso, que iam de 20px/semibold a 30px/black e
 * incluíam uma tela com família tipográfica própria.
 *
 * A área de ações fica à direita e desce para baixo do título quando não cabe.
 */
export interface PageTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  /** Uma linha explicando o que a tela faz. */
  description?: string;
  /** Botões de ação da página. */
  actions?: React.ReactNode;
  /** Nível do heading, quando a página já tem um h1 acima. */
  as?: "h1" | "h2";
}

const PageTitle = React.forwardRef<HTMLDivElement, PageTitleProps>(
  ({ title, description, actions, as: Heading = "h1", className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("mb-6 flex flex-wrap items-start justify-between gap-4", className)}
      {...props}
    >
      <div className="min-w-0">
        <Heading className="text-2xl font-bold tracking-tight text-foreground">{title}</Heading>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  ),
);
PageTitle.displayName = "PageTitle";

export { PageTitle };
