import * as React from "react";

import { cn } from "../../lib/cn";

/**
 * Lista de leitura rótulo/valor — `<dl>`, `<dt>` e `<dd>`.
 *
 * O rótulo fica em cima e o valor embaixo, numa grade de `columns` colunas; cada
 * item ocupa `span` colunas, nunca mais que a lista tem. Responsiva por conta
 * própria: uma coluna abaixo de 640px; com três colunas, duas até 1024px e três
 * a partir daí. Um item que ocupa a lista inteira continua inteiro em qualquer
 * largura.
 *
 * Só leitura: não há handler, foco nem edição. O valor é o que a tela passa —
 * ausente (`null`, `undefined`, `false` ou texto vazio), aparece `emptyValue`.
 * Zero é valor.
 *
 * Referência de estrutura: a grade de campos da aba "Perfil & assessment" do
 * protótipo da PO (DHO, HCK-308) — rótulo de 14px semibold, como o rótulo de
 * campo (`--hw-text-label`, decisão da PO), e valor de 14px semibold. Substitui
 * os `<dl>` escritos à mão no admin. O visual aguarda o aval da PO.
 */
export interface DescriptionListItem {
  /** Rótulo do campo. */
  label: string;
  /** Valor. `null`, `undefined`, `false` ou texto vazio mostram `emptyValue`. */
  value?: React.ReactNode;
  /** Colunas que o item ocupa (padrão 1), limitado ao `columns` da lista. */
  span?: 1 | 2 | 3;
}

export interface DescriptionListProps extends Omit<React.HTMLAttributes<HTMLDListElement>, "children"> {
  items: readonly DescriptionListItem[];
  /** Colunas a partir de 640px (padrão 1). Abaixo disso, sempre uma. */
  columns?: 1 | 2 | 3;
  /** O que aparece no lugar de um valor ausente (padrão "—"). */
  emptyValue?: React.ReactNode;
}

const columnClasses: Record<1 | 2 | 3, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
};

/**
 * Item que ocupa a lista toda: `col-span-full` (1 / -1), que vale em qualquer
 * número de colunas — inclusive na coluna única da tela estreita, onde um
 * `col-span-3` criaria colunas implícitas e estouraria a largura. O único caso
 * parcial é 2 de 3: duas colunas a partir de 640px, que na grade de duas é a
 * linha inteira.
 */
function spanClass(span: number, columns: number): string | undefined {
  const efetivo = Math.min(Math.max(span, 1), columns);
  if (efetivo === 1) return undefined;
  if (efetivo === columns) return "col-span-full";
  return "sm:col-span-2";
}

function isEmpty(value: React.ReactNode): boolean {
  return (
    value === null ||
    value === undefined ||
    value === false ||
    (typeof value === "string" && value.trim() === "")
  );
}

const DescriptionList = React.forwardRef<HTMLDListElement, DescriptionListProps>(
  ({ items, columns = 1, emptyValue = "—", className, ...props }, ref) => (
    <dl ref={ref} className={cn("grid gap-x-6 gap-y-5", columnClasses[columns], className)} {...props}>
      {items.map((item, index) => {
        const vazio = isEmpty(item.value);
        return (
          <div
            // A lista é de leitura e não reordena: o índice basta, e o rótulo
            // ajuda a ler o React DevTools.
            key={`${index}-${item.label}`}
            className={cn("flex min-w-0 flex-col gap-1", spanClass(item.span ?? 1, columns))}
          >
            <dt className="text-sm font-semibold text-hw-label">{item.label}</dt>
            <dd className="break-words text-sm font-semibold text-foreground" data-empty={vazio || undefined}>
              {vazio ? emptyValue : item.value}
            </dd>
          </div>
        );
      })}
    </dl>
  ),
);
DescriptionList.displayName = "DescriptionList";

export { DescriptionList };
