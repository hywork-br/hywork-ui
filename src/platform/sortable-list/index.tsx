"use client";

import * as React from "react";

import { cn } from "../../lib/cn";

/**
 * Lista reordenável sem arrastar: botões (via `ctx.moveUp`/`moveDown`) e
 * teclado (Alt+↑/↓ no item focado), com anúncio em região aria-live.
 */
export type SortableItemContext = {
  index: number;
  moveUp(): void;
  moveDown(): void;
  isFirst: boolean;
  isLast: boolean;
  /** Espalhe no elemento focável do item (atalho anunciado ao leitor de tela). */
  handleProps: React.HTMLAttributes<HTMLElement>;
  moveUpLabel: string;
  moveDownLabel: string;
};

export interface SortableListProps<T> extends Omit<React.HTMLAttributes<HTMLUListElement>, "children"> {
  items: T[];
  getKey: (item: T) => string;
  onReorder: (next: T[]) => void;
  renderItem: (item: T, ctx: SortableItemContext) => React.ReactNode;
  moveUpLabel?: string;
  moveDownLabel?: string;
  announce?: (item: T, newIndex: number) => string;
  disabled?: boolean;
}

export function SortableList<T>({
  items,
  getKey,
  onReorder,
  renderItem,
  moveUpLabel = "Mover para cima",
  moveDownLabel = "Mover para baixo",
  announce = (_item, i) => `Item movido para a posição ${i + 1} de ${items.length}`,
  disabled = false,
  className,
  ...props
}: SortableListProps<T>) {
  const [message, setMessage] = React.useState("");
  const focused = React.useRef<HTMLElement | null>(null);

  // O navegador solta o foco ao reinserir o nó movido: devolve-o depois da troca.
  React.useLayoutEffect(() => {
    const el = focused.current;
    focused.current = null;
    if (el?.isConnected && document.activeElement !== el) el.focus();
  }, [items]);

  const move = (from: number, to: number) => {
    if (disabled || to < 0 || to >= items.length) return;
    focused.current = document.activeElement as HTMLElement | null;
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item!);
    onReorder(next);
    setMessage(announce(item!, to));
  };

  return (
    <>
      <ul className={cn("flex flex-col gap-2", className)} {...props}>
        {items.map((item, index) => (
          <li
            key={getKey(item)}
            onKeyDown={(event) => {
              if (!event.altKey || (event.key !== "ArrowUp" && event.key !== "ArrowDown")) return;
              event.preventDefault();
              move(index, index + (event.key === "ArrowUp" ? -1 : 1));
            }}
          >
            {renderItem(item, {
              index,
              moveUp: () => move(index, index - 1),
              moveDown: () => move(index, index + 1),
              isFirst: index === 0,
              isLast: index === items.length - 1,
              handleProps: { "aria-keyshortcuts": "Alt+ArrowUp Alt+ArrowDown" },
              moveUpLabel,
              moveDownLabel,
            })}
          </li>
        ))}
      </ul>
      <div aria-live="polite" role="status" className="sr-only">
        {message}
      </div>
    </>
  );
}
