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
  onPageChange: (page: number) => void;
  /**
   * Itens por página e total no servidor.
   *
   * Com os dois, a esquerda mostra o intervalo ("1–20 de 137 colaboradores").
   * Sem eles, a listagem é **sequencial**: o servidor só sabe dizer se existe
   * uma próxima página, e a esquerda mostra "Página 3". É o caso de Notícias e
   * de Modelos de página, onde nenhuma contagem chega do servidor — e inventar
   * um total a partir do número de páginas erra sempre na última.
   */
  perPage?: number;
  total?: number;
  /** Só para a forma sequencial: se existe página seguinte. */
  hasNext?: boolean;
  /** Nome do que está sendo listado, para o texto e o rótulo acessível. */
  itemLabel?: string;
  disabled?: boolean;
  /** Texto de "Página {n}" na forma sequencial. */
  pageLabel?: (page: number) => React.ReactNode;
}

const ListPagination = React.forwardRef<HTMLDivElement, ListPaginationProps>(
  (
    {
      page,
      perPage,
      total,
      hasNext,
      onPageChange,
      itemLabel = "itens",
      pageLabel,
      disabled = false,
      className,
      ...props
    },
    ref,
  ) => {
    const contada = typeof total === "number" && typeof perPage === "number";

    const totalPaginas = contada ? Math.max(1, Math.ceil(total! / perPage!)) : undefined;
    const paginaAtual = Math.min(Math.max(1, page), totalPaginas ?? Number.POSITIVE_INFINITY);

    const temAnterior = paginaAtual > 1;
    const temProxima = contada ? paginaAtual < totalPaginas! : Boolean(hasNext);

    // Nada listado, nada a paginar.
    if (contada && total === 0) return null;
    // Na forma sequencial, uma página só também dispensa controles.
    if (!contada && !temAnterior && !temProxima) return null;

    const primeiro = contada ? (total === 0 ? 0 : (paginaAtual - 1) * perPage! + 1) : 0;
    const ultimo = contada ? Math.min(paginaAtual * perPage!, total!) : 0;

    return (
      <div
        ref={ref}
        // `mt-6` faz parte do padrão: a paginação sempre sucede uma
        // listagem. Espelha o `mb-6` do FilterBar, que a precede.
        className={cn("mt-6 flex items-center justify-between gap-4", className)}
        {...props}
      >
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {/* Sem `tabular-nums`: a variante de largura fixa redesenha os dígitos
              da Montserrat e destoa do resto da interface. */}
          {contada ? (
            <>
              <span className="font-medium text-foreground">
                {primeiro}–{ultimo}
              </span>{" "}
              de {total} {itemLabel}
            </>
          ) : (
            (pageLabel?.(paginaAtual) ?? (
              <>
                Página <span className="font-medium text-foreground">{paginaAtual}</span>
              </>
            ))
          )}
        </p>

        {(!contada || totalPaginas! > 1) && (
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
