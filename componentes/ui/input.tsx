/**
 * Input — shadcn-ui/ui @ ee628d75, variante `base` (Base UI).
 *
 * Mudou em relação ao upstream:
 * - caminho do `cn`;
 * - `file:text-foreground` e `placeholder:text-muted-foreground` viraram o
 *   vocabulário daqui. O upstream deixa esses dois inline mesmo depois da
 *   separação componente/estilo, então não dá para herdar sem traduzir.
 *
 * A borda do campo é --hw-border-strong, não --hw-border: o piso da WCAG
 * 1.4.11 para limite de controle é 3:1, e o --hw-border dá 1,23:1 sobre
 * branco. O porquê está no bloco de bordas em tokens/semantico.css.
 */

import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "../lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "cn-input w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent file:text-text placeholder:text-text-muted disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
