"use client";

import * as React from "react";

import { cn } from "../../lib/cn";
import { FormMessage } from "../form-message";

/**
 * Escala de resposta de 1 a N, com um rótulo por nota.
 *
 * É um grupo de rádio (`role="radiogroup"`): uma nota por vez, uma parada de
 * Tab para o grupo inteiro. Setas mudam **e marcam** a nota — com qualquer
 * velocidade de tecla, porque aqui não há foco movido em timeout como no
 * Radix —, Home e End vão à primeira e à última, Espaço marca a nota em foco.
 * Enter não marca, como no `RadioGroup` (padrão WAI-ARIA).
 *
 * - `labels` define a escala: o índice 0 é a nota 1. Sem rótulos, 5 notas.
 * - `readOnly` mostra a nota e continua focável; as setas passeiam pelas
 *   notas (o leitor de tela ouve cada rótulo), mas nada muda.
 * - `disabled` sai da ordem do Tab.
 * - `compareValue` marca um segundo valor com um ponto discreto. Não é uma
 *   escolha: a nota continua selecionável como as outras, e o leitor de tela
 *   ouve "valor de referência" nela. O que a referência é, a tela diz.
 * - `name` vai num campo oculto, para o formulário nativo receber a nota.
 *
 * Responsividade: a partir de 640px (`sm`) cada nota mostra o número e o
 * rótulo; abaixo, só o número, com uma legenda dos dois extremos embaixo.
 * O nome acessível de cada nota é sempre "número, rótulo".
 *
 * O componente não sabe o que está sendo avaliado. Novo componente: o aval
 * visual da PO está pendente.
 */
export interface RatingScaleProps {
  /** Nome do campo oculto que leva a nota no formulário nativo. */
  name: string;
  /** Nota escolhida, de 1 a N, ou `null` quando vazio. */
  value: number | null;
  onChange: (value: number) => void;
  /** Rótulos das notas: índice 0 = nota 1. O tamanho define a escala (sem rótulos, 5). */
  labels: string[];
  disabled?: boolean;
  /** Mostra a nota e continua focável, sem mudar. */
  readOnly?: boolean;
  /** Mensagem de erro da tela, ligada ao grupo por `aria-describedby`. */
  error?: string;
  "aria-label"?: string;
  /** Alternativa ao `aria-label`: o id do texto visível que nomeia a escala. */
  "aria-labelledby"?: string;
  /** Mostra embaixo o rótulo da nota escolhida. */
  showSelectedLabel?: boolean;
  /** Um segundo valor de referência, marcado com um ponto discreto, sem ser selecionável. */
  compareValue?: number | null;
  className?: string;
}

const PADRAO = 5;

/** A nota de 1 a `tamanho`, ou `null` quando vazia ou fora da escala. */
function notaValida(nota: number | null | undefined, tamanho: number): number | null {
  return typeof nota === "number" && Number.isInteger(nota) && nota >= 1 && nota <= tamanho ? nota : null;
}

const RatingScale = React.forwardRef<HTMLDivElement, RatingScaleProps>(
  (
    {
      name,
      value,
      onChange,
      labels,
      disabled = false,
      readOnly = false,
      error,
      showSelectedLabel = false,
      compareValue,
      className,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledby,
    },
    ref,
  ) => {
    const id = React.useId();
    const mensagemId = `${id}-message`;
    const referenciaId = `${id}-reference`;
    const botoes = React.useRef<(HTMLButtonElement | null)[]>([]);

    const tamanho = labels.length > 0 ? labels.length : PADRAO;
    const notas = Array.from({ length: tamanho }, (_, i) => i + 1);
    const escolhida = notaValida(value, tamanho);
    const referencia = notaValida(compareValue, tamanho);
    const rotulo = (nota: number) => labels[nota - 1]?.trim() || undefined;
    // Uma parada de Tab: a nota escolhida, ou a primeira quando vazio.
    const paradaDoTab = escolhida ?? 1;
    const interativo = !disabled && !readOnly;
    const comErro = Boolean(error);

    const escolher = (nota: number) => {
      if (interativo && nota !== escolhida) onChange(nota);
    };

    const aoTeclar = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      const atual = Number((event.target as HTMLElement).dataset.value);
      if (!atual) return;
      let proxima: number;
      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          proxima = atual === tamanho ? 1 : atual + 1;
          break;
        case "ArrowLeft":
        case "ArrowUp":
          proxima = atual === 1 ? tamanho : atual - 1;
          break;
        case "Home":
          proxima = 1;
          break;
        case "End":
          proxima = tamanho;
          break;
        case "Enter":
          // WAI-ARIA: o grupo de rádio não marca no Enter (o botão marcaria).
          event.preventDefault();
          return;
        default:
          return;
      }
      event.preventDefault();
      botoes.current[proxima - 1]?.focus();
      escolher(proxima);
    };

    const extremos = rotulo(1) || rotulo(tamanho);

    return (
      <div className={cn("w-full max-w-2xl space-y-1.5", className)}>
        <div
          ref={ref}
          role="radiogroup"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          aria-invalid={comErro || undefined}
          aria-describedby={comErro ? mensagemId : undefined}
          aria-readonly={readOnly || undefined}
          aria-disabled={disabled || undefined}
          onKeyDown={aoTeclar}
          className="grid auto-cols-fr grid-flow-col gap-2"
        >
          {notas.map((nota) => {
            const marcada = nota === escolhida;
            const texto = rotulo(nota);
            const eReferencia = nota === referencia;
            return (
              <button
                key={nota}
                ref={(el) => {
                  botoes.current[nota - 1] = el;
                }}
                type="button"
                role="radio"
                aria-checked={marcada}
                aria-label={texto ? `${nota}, ${texto}` : String(nota)}
                aria-describedby={eReferencia ? referenciaId : undefined}
                data-value={nota}
                data-state={marcada ? "checked" : "unchecked"}
                data-reference={eReferencia || undefined}
                tabIndex={nota === paradaDoTab ? 0 : -1}
                disabled={disabled}
                onClick={() => escolher(nota)}
                className={cn(
                  "relative flex min-h-11 min-w-0 flex-col items-center justify-center gap-1 rounded-md border px-1.5 py-2 text-center outline-none ring-offset-background",
                  "transition-colors motion-reduce:!transition-none",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  "sm:justify-start sm:py-3",
                  marcada
                    ? "border-primary bg-primary text-primary-foreground"
                    : cn(
                        "bg-hw-field text-foreground",
                        comErro ? "border-hw-error-text" : "border-hw-field-border",
                        interativo && "hover:bg-accent hover:text-accent-foreground",
                      ),
                  readOnly && "cursor-default",
                )}
              >
                <span aria-hidden="true" className="text-base font-semibold leading-6 tabular-nums">
                  {nota}
                </span>
                {texto && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "hidden break-words text-xs leading-4 hyphens-auto sm:block",
                      !marcada && "text-muted-foreground",
                    )}
                  >
                    {texto}
                  </span>
                )}
                {eReferencia && (
                  <span
                    aria-hidden="true"
                    data-reference-marker=""
                    className={cn(
                      "absolute right-1.5 top-1.5 h-2 w-2 rounded-full",
                      marcada ? "bg-primary-foreground" : "bg-muted-foreground",
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Abaixo de 640px os rótulos saem dos botões: a legenda mostra os extremos. */}
        {extremos && tamanho > 1 && (
          <div aria-hidden="true" className="flex justify-between gap-4 text-xs text-muted-foreground sm:hidden">
            <span>{rotulo(1) && `1 · ${rotulo(1)}`}</span>
            <span className="text-right">{rotulo(tamanho) && `${tamanho} · ${rotulo(tamanho)}`}</span>
          </div>
        )}

        {/* O leitor de tela já ouve o rótulo na nota marcada; aqui é reforço visual. */}
        {showSelectedLabel && (
          <p aria-hidden="true" data-selected-label="" className="min-h-5 text-sm font-medium text-foreground">
            {escolhida ? rotulo(escolhida) : null}
          </p>
        )}

        <span id={referenciaId} hidden>
          Valor de referência
        </span>
        <FormMessage id={mensagemId}>{error}</FormMessage>
        <input type="hidden" name={name} value={escolhida ?? ""} disabled={disabled} />
      </div>
    );
  },
);
RatingScale.displayName = "RatingScale";

export { RatingScale };
