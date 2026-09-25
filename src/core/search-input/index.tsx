"use client";

import * as React from "react";
import { Search, X } from "lucide-react";

import { cn } from "../../lib/cn";
import { Input } from "../input";

/**
 * Campo de busca.
 *
 * Decisão da PO (23/09/2026): altura 40, **raio total** e lupa à esquerda. Vale
 * só para busca — o `Input` geral mantém o raio 4, e é essa diferença que faz o
 * campo de busca ser reconhecido como busca antes de se ler o placeholder.
 *
 * O botão de limpar aparece quando há texto. Ele não substitui o "Limpar" da
 * `FilterBar`, que devolve a barra inteira ao estado neutro: aqui só o campo.
 */
export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "type"> {
  value: string;
  onChange: (value: string) => void;
  /** Mostra o botão de limpar quando há texto. */
  clearable?: boolean;
  /** Rótulo do botão de limpar, para leitores de tela. */
  clearLabel?: string;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onChange,
      placeholder = "Buscar",
      clearable = true,
      clearLabel = "Limpar busca",
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const mostrarLimpar = clearable && value !== "";

    return (
      <div className={cn("relative", className)}>
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          ref={ref}
          type="search"
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          aria-label={props["aria-label"] ?? placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            "h-10 rounded-full pl-10",
            mostrarLimpar ? "pr-10" : "pr-4",
            // O `search` nativo desenha o próprio X no WebKit, que sairia ao
            // lado do nosso.
            "[&::-webkit-search-cancel-button]:appearance-none",
          )}
          {...props}
        />
        {mostrarLimpar && (
          <button
            type="button"
            onClick={() => onChange("")}
            disabled={disabled}
            aria-label={clearLabel}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    );
  },
);
SearchInput.displayName = "SearchInput";

export { SearchInput };
