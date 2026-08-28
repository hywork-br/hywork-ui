/**
 * Label — shadcn-ui/ui @ ee628d75, variante `base` (Base UI).
 *
 * Mudou em relação ao upstream: só o caminho do `cn`. É o componente que
 * melhor mostra o ganho da geração nova — o visual inteiro está na folha.
 */

"use client";

import * as React from "react";

import { cn } from "../lib/utils";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "cn-label flex items-center select-none group-data-[disabled=true]:pointer-events-none peer-disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
