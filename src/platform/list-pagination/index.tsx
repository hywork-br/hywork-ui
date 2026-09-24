"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "../../lib/cn";
import { Button } from "../../core/button";

/**
 * Paginação de listagem.
 *
 * Decisão da PO (23/09/2026): intervalo à esquerda, setas à direita. A forma
 * eleita era a `smart-pagination` que existia solta na tela de Usuários, e não
 * a paginação numerada do design system — por isso o padrão nasce aqui, e o
 * `core/pagination` segue disponível como primitiva para quem precisar dos
 * números.
 *
 * A contagem é calculada a partir de `page`, `perPage` e `total`: a tela
 * informa o que sabe do servidor, não strings prontas.
 */
export interface ListPaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Página atual, começando em 1. */
  page: number;
  /** Itens por página. */
  perPage: number;
  /** Total de itens no servidor, não apenas os carregados. */
  total: number;
  onPageChange: (page: number) => void;
  /** Nome do que está sendo listado, para o texto e o rótulo acessível. */
  itemLabel?: string;
  disabled?: boolean;
}

const ListPagination = React.forwardRef<HTMLDivElement, ListPaginationProps>(
  (
    { page, perPage, total, onPageChange, itemLabel = "itens", disabled = false, className, ...props },
    ref,
  ) => {
    const totalPaginas = Math.max(1, Math.ceil(total / perPage));
    const paginaAtual = Math.min(Math.max(1, page), totalPaginas);

    const primeiro = total === 0 ? 0 : (paginaAtual - 1) * perPage + 1;
    const ultimo = Math.min(paginaAtual * perPage, total);

    const temAnterior = paginaAtual > 1;
    const temProxima = paginaAtual < totalPaginas;

    // Uma página só de resultados não precisa de controles.
    if (total === 0) return null;

    return (
      <div
        ref={ref}
        // `mt-6` faz parte do padrão: a paginação sempre sucede uma
        // listagem. Espelha o `mb-6` do FilterBar, que a precede.
        className={cn("mt-6 flex items-center justify-between gap-4", className)}
        {...props}
      >
        <p className="text-sm text-muted-foreground" aria-live="polite">
          <span className="font-medium text-foreground tabular-nums">
            {primeiro}–{ultimo}
          </span>{" "}
          de <span className="tabular-nums">{total}</span> {itemLabel}
        </p>

        {totalPaginas > 1 && (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={disabled || !temAnterior}
              aria-label="Página anterior"
              onClick={() => onPageChange(paginaAtual - 1)}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={disabled || !temProxima}
              aria-label="Próxima página"
              onClick={() => onPageChange(paginaAtual + 1)}
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        )}
      </div>
    );
  },
);
ListPagination.displayName = "ListPagination";

export { ListPagination };
