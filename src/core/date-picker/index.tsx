"use client";

import * as React from "react";
import { CalendarDays } from "lucide-react";

import { cn } from "../../lib/cn";
import { FormMessage } from "../form-message";
import { Input } from "../input";
import { Label } from "../label";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "../popover";
import { Calendar } from "./calendar";
import { clamp, displayToIso, isInRange, isValidIso, isoToDisplay, maskDisplay, todayIso } from "./date";

/**
 * Campo de data única.
 *
 * Mostra dd/mm/aaaa e devolve a string `'YYYY-MM-DD'` — data de calendário, sem
 * fuso: o 12/10 é o 12/10 em qualquer navegador. Nada aqui cria `Date` a partir
 * do valor; a aritmética está em `./date`.
 *
 * Duas entradas para a mesma data:
 * - **digitação** — as barras entram sozinhas, e colar `2026-10-12` também
 *   vale. A data é aceita quando o texto fica completo, ao sair do campo ou no
 *   Enter;
 * - **calendário** — no popover, pelo botão à direita ou por Alt+↓, com o
 *   teclado do padrão "date picker dialog" do WAI-ARIA.
 *
 * Datas fora de `min`/`max` ficam desabilitadas no calendário. Texto que não
 * forma data, ou que cai fora do intervalo, devolve `null` — o campo nunca
 * guarda uma data que a tela não aceitaria — e mostra o motivo colado ao campo,
 * no lugar do `error` da tela enquanto o texto estiver errado.
 *
 * Rótulo, campo e mensagem seguem as decisões da PO para `Label`, `Input` e
 * `FormMessage`, com o respiro de 6px do `FormItem`. Novo componente: o aval
 * visual da PO está pendente.
 */
export interface DatePickerProps {
  label: string;
  /** Data em `'YYYY-MM-DD'`, ou `null` quando vazio. */
  value: string | null;
  onChange: (value: string | null) => void;
  /** Primeira data aceita, em `'YYYY-MM-DD'`. */
  min?: string;
  /** Última data aceita, em `'YYYY-MM-DD'`. */
  max?: string;
  /** Mensagem de erro da tela, colada ao campo. */
  error?: string;
  disabled?: boolean;
  /** Id do campo de texto; o rótulo aponta para ele. */
  id?: string;
  className?: string;
}

type Invalido = "format" | "range" | null;

function mensagemDeIntervalo(min?: string, max?: string): string {
  if (min && max) return `Escolha uma data entre ${isoToDisplay(min)} e ${isoToDisplay(max)}.`;
  if (min) return `Escolha uma data a partir de ${isoToDisplay(min)}.`;
  return `Escolha uma data até ${isoToDisplay(max!)}.`;
}

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ label, value, onChange, min, max, error, disabled = false, id, className }, ref) => {
    const idGerado = React.useId();
    const inputId = id ?? `${idGerado}-input`;
    const mensagemId = `${inputId}-message`;
    const conteudoRef = React.useRef<HTMLDivElement>(null);

    const valor = isValidIso(value) ? value : null;
    const [texto, setTexto] = React.useState(valor ? isoToDisplay(valor) : "");
    const [invalido, setInvalido] = React.useState<Invalido>(null);
    const [aberto, setAberto] = React.useState(false);
    const [focado, setFocado] = React.useState(() => clamp(valor ?? todayIso(), min, max));

    // O texto acompanha o valor que vem de fora (reset do formulário, outra
    // tela). O que o próprio campo acabou de emitir não volta para o texto —
    // senão o `null` de um texto inválido apagaria o que a pessoa digitou.
    const ultimoEmitido = React.useRef<string | null>(valor);
    React.useEffect(() => {
      if (valor === ultimoEmitido.current) return;
      ultimoEmitido.current = valor;
      setTexto(valor ? isoToDisplay(valor) : "");
      setInvalido(null);
    }, [valor]);

    const emitir = (proximo: string | null) => {
      ultimoEmitido.current = proximo;
      if (proximo !== valor) onChange(proximo);
    };

    const confirmar = (atual: string) => {
      if (atual === "") {
        setInvalido(null);
        emitir(null);
        return;
      }
      const iso = displayToIso(atual);
      if (!iso || !isInRange(iso, min, max)) {
        setInvalido(iso ? "range" : "format");
        emitir(null);
        return;
      }
      setInvalido(null);
      setTexto(isoToDisplay(iso));
      emitir(iso);
    };

    const abrir = (proximo: boolean) => {
      if (disabled) return;
      if (proximo) setFocado(clamp(valor ?? todayIso(), min, max));
      setAberto(proximo);
    };

    const escolher = (iso: string) => {
      setTexto(isoToDisplay(iso));
      setInvalido(null);
      emitir(iso);
      setAberto(false);
    };

    const mensagem =
      invalido === "format"
        ? "Data inválida. Use o formato dd/mm/aaaa."
        : invalido === "range"
          ? mensagemDeIntervalo(min, max)
          : error;
    const comErro = Boolean(mensagem);

    return (
      <div className={cn("space-y-1.5", className)}>
        <Label htmlFor={inputId}>{label}</Label>
        <Popover open={aberto} onOpenChange={abrir}>
          <PopoverAnchor asChild>
            <div className="relative">
              <Input
                ref={ref}
                id={inputId}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="dd/mm/aaaa"
                maxLength={10}
                value={texto}
                disabled={disabled}
                aria-invalid={comErro || undefined}
                aria-describedby={comErro ? mensagemId : undefined}
                onChange={(event) => {
                  const bruto = event.target.value;
                  // Colar no formato ISO também vale: "2026-10-12".
                  const iso = bruto.trim();
                  const proximo = isValidIso(iso) ? isoToDisplay(iso) : maskDisplay(bruto);
                  setTexto(proximo);
                  setInvalido(null);
                  if (proximo === "" || proximo.length === 10) confirmar(proximo);
                }}
                onBlur={() => confirmar(texto)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") confirmar(texto);
                  if (event.key === "ArrowDown" && event.altKey) {
                    event.preventDefault();
                    abrir(true);
                  }
                }}
                className={cn(
                  "pr-10 tabular-nums",
                  comErro && "border-hw-error-text focus-visible:ring-hw-error-text",
                )}
              />
              <PopoverTrigger asChild>
                <button
                  type="button"
                  disabled={disabled}
                  aria-label={`Abrir calendário: ${label}`}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-sm text-muted-foreground outline-none transition-colors motion-reduce:!transition-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CalendarDays className="h-4 w-4" aria-hidden="true" />
                </button>
              </PopoverTrigger>
            </div>
          </PopoverAnchor>
          <PopoverContent
            ref={conteudoRef}
            align="start"
            aria-label={`Escolher data: ${label}`}
            className="w-auto p-3"
            onOpenAutoFocus={(event) => {
              // O foco vai para o dia (escolhido, hoje ou o limite mais
              // próximo), não para a seta de mês, que é o primeiro focável.
              event.preventDefault();
              conteudoRef.current
                ?.querySelector<HTMLButtonElement>('[data-date][tabindex="0"]')
                ?.focus({ preventScroll: true });
            }}
          >
            <Calendar
              selected={valor}
              focused={focado}
              onFocusedChange={setFocado}
              onSelect={escolher}
              today={todayIso()}
              min={min}
              max={max}
            />
          </PopoverContent>
        </Popover>
        <FormMessage id={mensagemId}>{mensagem}</FormMessage>
      </div>
    );
  },
);
DatePicker.displayName = "DatePicker";

export { DatePicker };
