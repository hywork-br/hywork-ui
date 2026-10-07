"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "../../lib/cn";
import { Button } from "../button";
import {
  WEEKDAY_HEADERS,
  addDays,
  addMonths,
  clamp,
  dayLabel,
  daysInMonth,
  endOfWeek,
  fromParts,
  isInRange,
  monthLabel,
  startOfWeek,
  toParts,
  weekday,
} from "./date";

/**
 * Grade de um mês, no padrão "date picker dialog" do WAI-ARIA APG.
 *
 * Uma célula focável por vez (tabindex móvel). Setas andam um dia ou uma
 * semana, Home/End vão ao início e ao fim da semana, PageUp/PageDown trocam o
 * mês e, com Shift, o ano. Enter ou Espaço escolhem. O foco nunca sai do
 * intervalo min/max — os dias fora dele aparecem desabilitados.
 *
 * Interno do DatePicker: não é exportado pelo pacote.
 */
export interface CalendarProps {
  selected: string | null;
  /** Dia focado; o mês exibido é sempre o dele. */
  focused: string;
  onFocusedChange: (iso: string) => void;
  onSelect: (iso: string) => void;
  today: string;
  min?: string;
  max?: string;
}

export function Calendar({ selected, focused, onFocusedChange, onSelect, today, min, max }: CalendarProps) {
  const tituloId = React.useId();
  const gradeRef = React.useRef<HTMLTableElement>(null);
  // Só o teclado na grade move o foco para o dia; as setas de mês mudam o mês
  // sem tirar o foco do botão apertado. Na abertura, quem foca é o DatePicker
  // (pelo `onOpenAutoFocus` do popover), depois que o conteúdo existe.
  const levarFoco = React.useRef(false);

  React.useEffect(() => {
    if (!levarFoco.current) return;
    levarFoco.current = false;
    gradeRef.current?.querySelector<HTMLButtonElement>(`[data-date="${focused}"]`)?.focus({ preventScroll: true });
  }, [focused]);

  const { year, month } = toParts(focused);
  const primeiro = fromParts(year, month, 1);
  const ultimo = fromParts(year, month, daysInMonth(year, month));
  const mesAnteriorDisponivel = !min || addDays(primeiro, -1) >= min;
  const proximoMesDisponivel = !max || addDays(ultimo, 1) <= max;

  // Semanas do mês: brancos antes do dia 1 e depois do último dia.
  const celulas: (string | null)[] = [
    ...Array.from({ length: weekday(primeiro) }, () => null),
    ...Array.from({ length: daysInMonth(year, month) }, (_, i) => fromParts(year, month, i + 1)),
  ];
  while (celulas.length % 7 !== 0) celulas.push(null);
  const semanas = Array.from({ length: celulas.length / 7 }, (_, i) => celulas.slice(i * 7, i * 7 + 7));

  const mover = (alvo: string) => {
    levarFoco.current = true;
    onFocusedChange(clamp(alvo, min, max));
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const passos: Record<string, () => string> = {
      ArrowLeft: () => addDays(focused, -1),
      ArrowRight: () => addDays(focused, 1),
      ArrowUp: () => addDays(focused, -7),
      ArrowDown: () => addDays(focused, 7),
      Home: () => startOfWeek(focused),
      End: () => endOfWeek(focused),
      PageUp: () => addMonths(focused, event.shiftKey ? -12 : -1),
      PageDown: () => addMonths(focused, event.shiftKey ? 12 : 1),
    };
    const passo = passos[event.key];
    if (!passo) return;
    event.preventDefault();
    mover(passo());
  };

  const trocarMes = (quantidade: number) => {
    levarFoco.current = false;
    onFocusedChange(clamp(addMonths(focused, quantidade), min, max));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Mês anterior"
          disabled={!mesAnteriorDisponivel}
          onClick={() => trocarMes(-1)}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </Button>
        <div id={tituloId} aria-live="polite" className="text-sm font-semibold text-foreground first-letter:uppercase">
          {monthLabel(focused)}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Próximo mês"
          disabled={!proximoMesDisponivel}
          onClick={() => trocarMes(1)}
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      <table ref={gradeRef} role="grid" aria-labelledby={tituloId} className="border-collapse" onKeyDown={onKeyDown}>
        <thead>
          <tr>
            {WEEKDAY_HEADERS.map((dia) => (
              <th
                key={dia.long}
                scope="col"
                abbr={dia.long}
                className="h-8 w-10 text-center text-xs font-medium text-muted-foreground"
              >
                {dia.short}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {semanas.map((semana, i) => (
            <tr key={i}>
              {semana.map((dia, j) => {
                if (!dia) return <td key={j} role="gridcell" className="h-10 w-10 p-0" />;
                const escolhido = dia === selected;
                const disponivel = isInRange(dia, min, max);
                const hoje = dia === today;
                return (
                  <td key={j} role="gridcell" aria-selected={escolhido} className="p-0 text-center">
                    <button
                      type="button"
                      data-date={dia}
                      tabIndex={dia === focused ? 0 : -1}
                      aria-label={dayLabel(dia)}
                      aria-current={hoje ? "date" : undefined}
                      disabled={!disponivel}
                      onClick={() => onSelect(dia)}
                      className={cn(
                        "inline-flex h-10 w-10 items-center justify-center rounded-md text-sm outline-none transition-colors motion-reduce:!transition-none",
                        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        "disabled:cursor-not-allowed disabled:text-muted-foreground disabled:opacity-50",
                        escolhido
                          ? "bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
                          : "text-foreground hover:bg-accent hover:text-accent-foreground",
                        hoje && !escolhido && "font-semibold text-primary underline underline-offset-4",
                      )}
                    >
                      {toParts(dia).day}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
