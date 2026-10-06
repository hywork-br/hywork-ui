"use client";

import type * as React from "react";
import { cn } from "../../lib/cn";

/**
 * Indicador de espera para uma **ação** em andamento — dentro de um botão de
 * envio, ou num redirecionamento que não tem conteúdo a imitar.
 *
 * Não é o carregamento de conteúdo: listagem, card ou página carregando usa
 * `Skeleton` (Carregamento · Opção B, pulso), que imita o que vai chegar.
 */
export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

const tamanhos = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-[3px]",
  lg: "h-12 w-12 border-4",
};

export const Spinner: React.FC<SpinnerProps> = ({ className, size = "md", ...props }) => (
  <div role="status" className={cn("flex items-center justify-center", className)} {...props}>
    <div
      className={cn(
        "animate-spin rounded-full border-primary/30 border-t-primary motion-reduce:animate-none",
        tamanhos[size],
      )}
    />
    <span className="sr-only">Carregando</span>
  </div>
);
