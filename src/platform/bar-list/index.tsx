"use client";

import * as React from "react";

import { cn } from "../../lib/cn";

/**
 * Lista de barras — uma linha por item, com rótulo, valor à direita e uma
 * barra horizontal proporcional. Para comparar poucos itens de uma mesma
 * medida: adesão por área, avaliações por etapa, respostas por opção.
 *
 * A largura da barra é `value / max`, limitada a 0–100%. O `max` de cada item
 * vence o `max` da lista, que vence o maior valor da lista: por item quando
 * cada linha tem o seu total ("78 de 85"), da lista quando todas dividem a
 * mesma escala (porcentagem), e o maior valor quando o que importa é a
 * comparação entre as linhas. `max` zero dá barra vazia.
 *
 * A barra é desenho (`aria-hidden`): o que o leitor de tela ouve é o rótulo e o
 * texto da direita. Sem `valueLabel`, a direita mostra o `value`; `null` a
 * deixa vazia. Uma linha com `onSelect` vira botão, com foco visível.
 *
 * Barra na tinta da marca (`--primary-ink`), trilha neutra (`--muted`). O
 * texto quebra dentro da linha; nunca a ultrapassa.
 */
export interface BarListItem {
  id: string;
  label: React.ReactNode;
  value: number;
  /** Denominador deste item. Na falta, vale o `max` da lista e depois o maior valor. */
  max?: number;
  /** Texto à direita — "92% · 78 de 85". Padrão: o `value`; `null` deixa vazio. */
  valueLabel?: React.ReactNode;
  /** Com ele, a linha vira botão. */
  onSelect?: () => void;
}

export interface BarListProps extends Omit<React.HTMLAttributes<HTMLUListElement>, "children"> {
  items: BarListItem[];
  /** Denominador comum. Na falta, o maior valor da lista. */
  max?: number;
}

const finite = (n: number) => (Number.isFinite(n) ? n : 0);

/** Largura da barra, em %, limitada a 0–100. Denominador zero ou inválido dá 0. */
const barWidth = (value: number, max: number) => {
  if (!Number.isFinite(max) || max <= 0) return 0;
  return Math.min(Math.max(finite(value) / max, 0), 1) * 100;
};

const numero = new Intl.NumberFormat("pt-BR");

const linha = "flex w-full min-w-0 flex-col gap-1.5 rounded-md px-2 py-2 text-left text-sm";

const BarList = React.forwardRef<HTMLUListElement, BarListProps>(
  ({ items, max, className, ...props }, ref) => {
    const maior = items.reduce((acc, item) => Math.max(acc, finite(item.value)), 0);

    return (
      <ul ref={ref} className={cn("flex min-w-0 flex-col gap-1", className)} {...props}>
        {items.map((item) => {
          const largura = barWidth(item.value, item.max ?? max ?? maior);
          const direita = item.valueLabel === undefined ? numero.format(finite(item.value)) : item.valueLabel;

          // Spans only: a button may hold phrasing content alone.
          const conteudo = (
            <>
              <span className="flex w-full min-w-0 items-baseline justify-between gap-3">
                <span className="min-w-0 break-words text-foreground">{item.label}</span>
                {/* Keeps a space between label and value in the accessible name. */}{" "}
                {direita !== null && direita !== false && (
                  <span className="shrink-0 whitespace-nowrap text-right tabular-nums text-muted-foreground">
                    {direita}
                  </span>
                )}
              </span>
              <span aria-hidden="true" className="block h-2 w-full overflow-hidden rounded-full bg-muted">
                <span
                  data-part="bar"
                  className="block h-full rounded-full bg-primary-ink transition-[width] duration-300 motion-reduce:!transition-none"
                  style={{ width: `${largura}%` }}
                />
              </span>
            </>
          );

          return (
            <li key={item.id} className="min-w-0">
              {item.onSelect ? (
                <button
                  type="button"
                  onClick={item.onSelect}
                  className={cn(
                    linha,
                    "outline-none transition-colors motion-reduce:!transition-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  )}
                >
                  {conteudo}
                </button>
              ) : (
                <div className={linha}>{conteudo}</div>
              )}
            </li>
          );
        })}
      </ul>
    );
  },
);
BarList.displayName = "BarList";

export { BarList };
