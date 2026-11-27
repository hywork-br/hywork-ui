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

// Só a largura: a altura vem do aspect-square. Com altura fixa, a tela que
// dimensionava o Spinner pelo className (size-4) ou o espremia numa linha flex
// encolhia só a largura e o círculo virava oval. Agora ele encolhe pelo
// max-w/max-h do contêiner e continua redondo em qualquer tamanho.
const tamanhos = {
  sm: "w-4 border-2",
  md: "w-8 border-[3px]",
  lg: "w-12 border-4",
};

export const Spinner: React.FC<SpinnerProps> = ({ className, size = "md", ...props }) => (
  // A cor é a tinta da marca; dentro de um botão, a do texto do botão. Num botão preenchido
  // a tinta da marca é a cor do próprio fundo, e o arco sumia. O trilho é a mesma cor a 30%.
  <div role="status" className={cn("flex items-center justify-center text-primary-ink [button_&]:[color:inherit]", className)} {...props}>
    <div
      className={cn(
        "aspect-square max-h-full max-w-full shrink-0 animate-spin rounded-full border-[color:color-mix(in_srgb,currentColor_30%,transparent)] border-t-current motion-reduce:animate-none",
        tamanhos[size],
      )}
    />
    <span className="sr-only">Carregando</span>
  </div>
);
