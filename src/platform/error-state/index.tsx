"use client";

import * as React from "react";

import { cn } from "../../lib/cn";

/**
 * Falha ao carregar uma listagem.
 *
 * Irmão do `EmptyState`, e pelo mesmo motivo: vazio e erro ocupam o mesmo lugar
 * na tela, mas dizem coisas diferentes. Vazio é um resultado — a busca não achou
 * nada. Erro é uma promessa quebrada, e precisa continuar lido como erro em vez
 * de sumir no cinza do texto esmaecido.
 *
 * Seis listagens do produto escreviam a própria linha de erro, entre
 * `text-red-500` solto num `colSpan` e um cartão de borda vermelha. Aqui o tom
 * vem do papel semântico, e a ação de tentar de novo é opcional porque nem toda
 * falha se resolve repetindo.
 */
export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** O que falhou, em uma frase: "Não foi possível carregar os colaboradores". */
  title: string;
  /** Detalhe técnico ou próximo passo — costuma ser a mensagem do erro. */
  description?: string;
  /** Ícone decorativo acima do título. */
  icon?: React.ReactNode;
  /** Ação de recuperação, normalmente um Button de "Tentar novamente". */
  action?: React.ReactNode;
}

const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  ({ title, description, icon, action, className, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn("flex flex-col items-center justify-center py-16 text-center", className)}
      {...props}
    >
      {icon && (
        <div className="mb-4 text-hw-status-danger [&>svg]:h-8 [&>svg]:w-8" aria-hidden="true">
          {icon}
        </div>
      )}
      <p className="text-sm font-medium text-hw-status-danger">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  ),
);
ErrorState.displayName = "ErrorState";

export { ErrorState };
