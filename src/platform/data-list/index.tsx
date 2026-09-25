"use client";

import * as React from "react";

import { cn } from "../../lib/cn";
import { Skeleton } from "../../core/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../core/table";

/**
 * Listagem de dados em tabela.
 *
 * Decisão da PO (23/09/2026): a tabela do design system. É a maior migração do
 * projeto — 44 telas listam dados hoje sem ela: 17 escrevem `<table>` cru e 27
 * montam a listagem com `div` e grid.
 *
 * As colunas são declaradas, não montadas: a tela diz quais dados mostra, e o
 * componente resolve cabeçalho, linhas, carregamento e estado vazio. Isso é o
 * que impede a próxima listagem de inventar o próprio cabeçalho.
 */
export interface DataListColumn<T> {
  /** Identificador da coluna, único na lista. */
  key: string;
  header: React.ReactNode;
  /** O que renderizar na célula desta coluna, para cada item. */
  cell: (item: T) => React.ReactNode;
  /** Largura fixa da coluna, quando o conteúdo não deve ditá-la. */
  width?: string;
  /** Alinha o conteúdo à direita — use para números e ações. */
  align?: "start" | "end";
}

export interface DataListProps<T> extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  items: T[];
  columns: DataListColumn<T>[];
  /** Chave estável de cada item. */
  getKey: (item: T) => string;
  /** Enquanto verdadeiro, mostra linhas de esqueleto no lugar dos dados. */
  loading?: boolean;
  /** Quantas linhas de esqueleto mostrar durante o carregamento. */
  loadingRows?: number;
  /** O que mostrar quando não há itens — normalmente um EmptyState. */
  empty?: React.ReactNode;
  /** Torna a linha inteira clicável. */
  onRowClick?: (item: T) => void;
  /**
   * Largura mínima da tabela, para listagens largas demais para a tela. Abaixo
   * dela a tabela rola na horizontal dentro do próprio container, em vez de
   * espremer as colunas ou fazer a página inteira rolar.
   *
   * Seis listagens do produto declaravam isso por conta, cada uma com um valor
   * próprio (760, 860, 900, 920, 980), alcançando o `wrapperClassName` do
   * primitivo. Passou a ser uma porta só.
   */
  minWidth?: string;
  /** Rótulo acessível da tabela. */
  "aria-label"?: string;
}

function DataList<T>({
  items,
  columns,
  getKey,
  loading = false,
  loadingRows = 5,
  empty,
  onRowClick,
  minWidth,
  className,
  ...props
}: DataListProps<T>) {
  const vazio = !loading && items.length === 0;

  return (
    <div className={cn("w-full", className)} {...props}>
      <Table
        aria-label={props["aria-label"]}
        style={minWidth ? { minWidth } : undefined}
      >
        <TableHeader>
          <TableRow>
            {columns.map((c) => (
              <TableHead
                key={c.key}
                style={c.width ? { width: c.width } : undefined}
                className={c.align === "end" ? "text-right" : undefined}
              >
                {c.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading &&
            Array.from({ length: loadingRows }).map((_, linha) => (
              <TableRow key={`esqueleto-${linha}`}>
                {columns.map((c) => (
                  <TableCell key={c.key}>
                    <Skeleton className="h-4 w-full max-w-[160px]" />
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {!loading &&
            items.map((item) => (
              <TableRow
                key={getKey(item)}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
                className={onRowClick ? "cursor-pointer" : undefined}
              >
                {columns.map((c) => (
                  <TableCell
                    key={c.key}
                    className={c.align === "end" ? "text-right" : undefined}
                  >
                    {c.cell(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
        </TableBody>
      </Table>

      {vazio && empty}
    </div>
  );
}
DataList.displayName = "DataList";

export { DataList };
