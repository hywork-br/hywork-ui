"use client";

import * as React from "react";
import { cn } from "../../lib/cn";

export type TableProps = React.HTMLAttributes<HTMLTableElement> & {
  /** Classes no wrapper externo (ex.: overflow, min-width). */
  wrapperClassName?: string;
};

const Table = React.forwardRef<HTMLTableElement, TableProps>(({ className, wrapperClassName, ...props }, ref) => (
  <div className={cn("relative w-full min-w-0 max-w-full overflow-auto", wrapperClassName)}>
    <table ref={ref} className={cn("w-full caption-bottom text-sm border border-hw-table-border rounded-lg overflow-hidden", className)} {...props} />
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("bg-hw-table-surface dark:bg-zinc-900 [&_tr]:border-b-0", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("[&_tr:last-child]:border-0 divide-y divide-hw-table-border dark:divide-zinc-800", className)} {...props} />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({ className, ...props }, ref) => (
  <tfoot ref={ref} className={cn("border-t border-hw-table-border bg-hw-table-surface dark:bg-zinc-900 font-medium", className)} {...props} />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn("transition-colors motion-reduce:!transition-none hover:bg-hw-table-surface dark:hover:bg-zinc-800/50 data-[state=selected]:bg-hw-table-selected", className)}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn("h-12 px-6 text-left align-middle text-xs font-medium uppercase tracking-wider text-hw-table-heading dark:text-zinc-400", className)}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-6 align-middle text-sm text-hw-table-foreground dark:text-zinc-300",
      "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn("mt-4 text-sm text-hw-table-caption dark:text-zinc-400", className)} {...props} />
));
TableCaption.displayName = "TableCaption";

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
