"use client";

import * as React from "react";
import { Check, Lock } from "lucide-react";

import { cn } from "../../lib/cn";

/**
 * Trilha de passos de um assistente (wizard).
 *
 * Duas formas sobre a mesma lista de passos:
 *
 * - **horizontal** — trilha de progresso: um segmento por passo, preenchidos
 *   até o passo atual. Só mostra onde a pessoa está; não tem clique, porque um
 *   segmento de 6px não é alvo de toque.
 * - **vertical** — navegação: número em círculo, ✓ nos concluídos, cadeado nos
 *   bloqueados e o atual destacado. Vira botão quando a tela passa `onSelect`
 *   e o passo não está `locked`.
 *
 * O estado de cada passo vem da tela: o componente não sabe o que valida um
 * passo nem qual é o próximo. A ordem da lista é a ordem do assistente.
 *
 * Referência de estrutura: o protótipo da PO do wizard de ciclo (DHO), com
 * "5 segmentos horizontais no topo" e "lista vertical com número em círculo".
 * O visual aguarda o aval da PO.
 */
export type StepperStepState = "complete" | "current" | "upcoming" | "locked";

export interface StepperStep {
  id: string;
  label: string;
  state: StepperStepState;
}

// `onSelect` do HTML é evento de seleção de texto; aqui é a troca de passo.
export interface StepperProps extends Omit<React.HTMLAttributes<HTMLOListElement>, "onSelect"> {
  steps: StepperStep[];
  /** Torna clicáveis os passos que não estão `locked` (só na forma vertical). */
  onSelect?: (id: string) => void;
  orientation?: "horizontal" | "vertical";
}

/** O que o leitor de tela ouve depois do nome do passo. O atual sai pelo `aria-current`. */
const stateText: Partial<Record<StepperStepState, string>> = {
  complete: "concluído",
  locked: "bloqueado",
};

const Stepper = React.forwardRef<HTMLOListElement, StepperProps>(
  ({ steps, onSelect, orientation = "horizontal", className, ...props }, ref) => {
    if (orientation === "horizontal") {
      // Preenchido até o passo atual pela posição, não pelo estado: quem volta
      // ao passo 2 depois de concluir o 3 está no passo 2. Sem passo atual, a
      // trilha mostra os concluídos.
      const atual = steps.findIndex((step) => step.state === "current");
      return (
        <ol
          ref={ref}
          aria-label={props["aria-label"] ?? "Progresso"}
          className={cn("flex w-full items-center gap-1.5", className)}
          {...props}
        >
          {steps.map((step, index) => {
            const preenchido = atual >= 0 ? index <= atual : step.state === "complete";
            const estado = stateText[step.state];
            return (
              <li
                key={step.id}
                data-state={step.state}
                data-filled={preenchido || undefined}
                aria-current={step.state === "current" ? "step" : undefined}
                className="min-w-0 flex-1"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "block h-1.5 rounded-full transition-colors motion-reduce:!transition-none",
                    preenchido ? "bg-primary" : "bg-primary/20",
                  )}
                />
                <span className="sr-only">
                  {`Passo ${index + 1} de ${steps.length}: ${step.label}`}
                  {estado && `, ${estado}`}
                </span>
              </li>
            );
          })}
        </ol>
      );
    }

    const navegavel = typeof onSelect === "function";

    return (
      <ol
        ref={ref}
        aria-label={props["aria-label"] ?? "Passos"}
        className={cn("flex flex-col gap-1", className)}
        {...props}
      >
        {steps.map((step, index) => {
          const bloqueado = step.state === "locked";
          const atual = step.state === "current";
          const estado = stateText[step.state];

          const linha = cn(
            "flex w-full min-h-10 items-center gap-3 rounded-md px-2 py-1.5 text-left text-sm",
            atual && "bg-primary/10",
          );

          const conteudo = (
            <>
              <span
                aria-hidden="true"
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  step.state === "complete" && "bg-primary/15 text-primary",
                  atual && "bg-primary text-primary-foreground",
                  step.state === "upcoming" && "border border-border bg-background text-muted-foreground",
                  bloqueado && "border border-dashed border-border bg-muted text-muted-foreground",
                )}
              >
                {step.state === "complete" ? (
                  <Check className="h-4 w-4" />
                ) : bloqueado ? (
                  <Lock className="h-3.5 w-3.5" />
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={cn(
                  "min-w-0 break-words",
                  atual ? "font-semibold text-primary" : "text-foreground",
                  (step.state === "upcoming" || bloqueado) && "text-muted-foreground",
                )}
              >
                {step.label}
                {estado && <span className="sr-only">{`, ${estado}`}</span>}
              </span>
            </>
          );

          return (
            <li key={step.id} data-state={step.state}>
              {navegavel ? (
                <button
                  type="button"
                  aria-current={atual ? "step" : undefined}
                  // Bloqueado continua focável — quem navega pelo teclado
                  // descobre que o passo existe —, mas não age.
                  aria-disabled={bloqueado || undefined}
                  onClick={bloqueado ? undefined : () => onSelect(step.id)}
                  className={cn(
                    linha,
                    "outline-none transition-colors motion-reduce:!transition-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    bloqueado ? "cursor-not-allowed" : !atual && "hover:bg-accent",
                  )}
                >
                  {conteudo}
                </button>
              ) : (
                <div
                  aria-current={atual ? "step" : undefined}
                  aria-disabled={bloqueado || undefined}
                  className={linha}
                >
                  {conteudo}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    );
  },
);
Stepper.displayName = "Stepper";

export { Stepper };
