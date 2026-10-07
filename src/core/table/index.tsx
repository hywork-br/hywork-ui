"use client";

import * as React from "react";
import { cn } from "../../lib/cn";

export type TableProps = React.HTMLAttributes<HTMLTableElement> & {
  /** Classes no wrapper externo (ex.: overflow, min-width). */
  wrapperClassName?: string;
  /**
   * Linhas pares do corpo em cinza claro (`--hw-table-stripe`). Ligado por
   * padrão (Rick, 06/10/2026): a listagem toda branca era o "tudo muito
   * branco" que os usuários relatavam, e a listra guia o olho na linha longa.
   * Cabeçalho e rodapé nunca listram.
   */
  striped?: boolean;
};

type Section = "head" | "body" | "foot";

const TableContext = React.createContext<{ striped: boolean }>({ striped: true });
const SectionContext = React.createContext<Section | undefined>(undefined);

/**
 * Barra horizontal sempre visível. No macOS a barra padrão é sobreposta e só
 * aparece durante a rolagem: a tabela larga parecia cortada, sem scroll.
 */
const SCROLLBAR =
  "[&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border";

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, wrapperClassName, striped = true, ...props }, ref) => {
    const context = React.useMemo(() => ({ striped }), [striped]);
    return (
      <TableContext.Provider value={context}>
        <div className={cn("relative w-full min-w-0 max-w-full overflow-x-auto", SCROLLBAR, wrapperClassName)}>
          <table
            ref={ref}
            data-striped={striped ? "" : undefined}
            className={cn("w-full caption-bottom text-sm border border-hw-table-border rounded-lg overflow-hidden", className)}
            {...props}
          />
        </div>
      </TableContext.Provider>
    );
  },
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({ className, ...props }, ref) => (
  <SectionContext.Provider value="head">
    <thead ref={ref} className={cn("bg-hw-table-surface [&_tr]:border-b-0", className)} {...props} />
  </SectionContext.Provider>
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({ className, ...props }, ref) => (
  <SectionContext.Provider value="body">
    <tbody ref={ref} className={cn("[&_tr:last-child]:border-0 divide-y divide-hw-table-border", className)} {...props} />
  </SectionContext.Provider>
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({ className, ...props }, ref) => (
  <SectionContext.Provider value="foot">
    <tfoot ref={ref} className={cn("border-t border-hw-table-border bg-hw-table-surface font-medium", className)} {...props} />
  </SectionContext.Provider>
));
TableFooter.displayName = "TableFooter";

/**
 * Três estados de linha, do mais leve ao mais marcado — cada um vence o
 * anterior, para que nenhum desapareça sobre outro:
 *
 *   listra      `even:`                  --hw-table-stripe    gray-50
 *   cursor      `hover:`                 --hw-table-hover     gray-100
 *   selecionada `data-[state=selected]:` --hw-table-selected  gray-200
 *
 * Mesma especificidade nos três; quem decide é a ordem das variantes no CSS
 * do Tailwind (pseudo-classes `even` → `hover`, depois `data-*`).
 */
const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(({ className, ...props }, ref) => {
  const { striped } = React.useContext(TableContext);
  const section = React.useContext(SectionContext);
  const inBody = section !== "head" && section !== "foot";
  return (
    <tr
      ref={ref}
      className={cn(
        "transition-colors motion-reduce:!transition-none",
        inBody && striped && "even:bg-hw-table-stripe",
        inBody && "hover:bg-hw-table-hover data-[state=selected]:bg-hw-table-selected",
        className,
      )}
      {...props}
    />
  );
});
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn("h-12 whitespace-nowrap px-6 text-left align-middle text-xs font-medium uppercase tracking-wider text-hw-table-heading", className)}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-6 align-middle text-sm text-hw-table-foreground",
      "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn("mt-4 text-sm text-hw-table-caption", className)} {...props} />
));
TableCaption.displayName = "TableCaption";

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
