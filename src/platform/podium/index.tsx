"use client";

import * as React from "react";
import { Crown } from "lucide-react";

import { cn } from "../../lib/cn";
import { Avatar, AvatarFallback, AvatarImage } from "../../core/avatar";

/**
 * Pódio do ranking: 2º à esquerda, 1º no centro (mais alto, na cor da marca,
 * com coroa) e 3º à direita. Na leitura (DOM) a ordem é 1º, 2º, 3º; a ordem
 * visual vem do grid. Aceita 1, 2 ou 3 entradas: o lugar que falta fica vazio.
 */
export type PodiumEntry = {
  id: string;
  position: 1 | 2 | 3;
  name: string;
  subtitle?: string;
  avatarUrl?: string | null;
  /** Já formatado pela tela ("1.250 pts"). */
  value: string;
  highlight?: boolean;
};

export interface PodiumProps extends React.HTMLAttributes<HTMLOListElement> {
  entries: PodiumEntry[];
  /** Nome acessível da coroa do 1º lugar. */
  crownLabel?: string;
}

const pedestal = { 1: "h-32", 2: "h-24", 3: "h-20" } as const;

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");

export function Podium({ entries, crownLabel = "1º lugar", className, ...props }: PodiumProps) {
  const sorted = [...entries].sort((a, b) => a.position - b.position).slice(0, 3);
  return (
    <ol className={cn("grid grid-cols-3 items-end gap-4", className)} {...props}>
      {sorted.map((e) => {
        const first = e.position === 1;
        return (
          <li
            key={e.id}
            data-position={e.position}
            className={cn(
              // row-start-1: explicit columns would otherwise push 2nd and 3rd to a new grid row.
              "row-start-1 flex min-w-0 flex-col items-center gap-2 text-center",
              e.position === 3 && "col-start-3",
              e.position === 2 && "col-start-1",
              first && "col-start-2",
            )}
          >
            {first && <Crown role="img" aria-label={crownLabel} className="h-6 w-6 text-primary-ink" />}
            <Avatar className={cn("h-14 w-14", first && "h-16 w-16 ring-2 ring-primary")}>
              {e.avatarUrl && <AvatarImage src={e.avatarUrl} alt="" />}
              <AvatarFallback className="text-sm font-medium">{initials(e.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 max-w-full">
              <p className="truncate text-sm font-medium" title={e.name}>
                {e.name}
              </p>
              {e.subtitle && <p className="truncate text-xs text-muted-foreground">{e.subtitle}</p>}
            </div>
            <div
              className={cn(
                "flex w-full flex-col items-center justify-center gap-0.5 rounded-t-lg px-2",
                pedestal[e.position],
                first ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                e.highlight && "ring-2 ring-ring ring-offset-2 ring-offset-background",
              )}
            >
              <span className="text-lg font-semibold">{e.position}º</span>
              <span className="text-sm">{e.value}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
