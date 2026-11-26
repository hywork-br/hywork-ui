"use client";

import * as React from "react";

import { cn } from "../../lib/cn";

/** Linha do tempo (histórico): lista semântica, na ordem recebida (mais recente primeiro, se a tela mandar assim). */
export type TimelineItem = {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  timestamp?: string;
  tone?: "neutral" | "positive" | "attention" | "negative" | "informative";
};

export interface TimelineProps extends React.HTMLAttributes<HTMLOListElement> {
  items: TimelineItem[];
}

const dot = {
  neutral: "bg-muted-foreground",
  positive: "bg-hw-status-success-fill",
  attention: "bg-hw-status-warning",
  negative: "bg-hw-status-danger",
  informative: "bg-hw-status-info",
} as const;

export function Timeline({ items, className, ...props }: TimelineProps) {
  return (
    <ol className={cn("flex flex-col", className)} {...props}>
      {items.map((item, i) => (
        <li key={item.id} data-tone={item.tone ?? "neutral"} className="relative flex gap-3 pb-6 last:pb-0">
          {i < items.length - 1 && (
            <span aria-hidden="true" className="absolute bottom-0 left-[5px] top-4 w-px bg-border" />
          )}
          <span aria-hidden="true" className={cn("relative mt-1.5 h-3 w-3 shrink-0 rounded-full", dot[item.tone ?? "neutral"])} />
          <div className="min-w-0">
            <p className="text-sm font-medium">{item.title}</p>
            {item.description && <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p>}
            {item.timestamp && <p className="mt-0.5 text-xs text-muted-foreground">{item.timestamp}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
