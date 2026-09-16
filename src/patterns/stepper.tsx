import { Check } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

export interface StepperItem {
  id: string;
  label: string;
  status: "complete" | "current" | "upcoming";
}

export interface StepperProps extends React.HTMLAttributes<HTMLOListElement> {
  currentStep: string;
  onStepChange?: (id: string) => void;
  steps: StepperItem[];
}

export const Stepper = React.forwardRef<HTMLOListElement, StepperProps>(
  ({ className, currentStep, onStepChange, steps, ...props }, ref) => {
    const currentIndex = steps.findIndex((step) => step.id === currentStep);
    const current = currentIndex < 0 ? undefined : steps[currentIndex];
    return (
      /* O invólucro é o contêiner de consulta: quem decide o modo do trilho é a
         largura disponível para ele, não a do dispositivo. */
      <div className="hw-stepper-shell">
        <ol aria-label="Etapas" className={cn("hw-stepper", className)} ref={ref} {...props}>
          {steps.map((step, index) => {
            const interactive = step.status === "complete" && Boolean(onStepChange);
            return (
              <li data-status={step.status} key={step.id}>
                <button
                  aria-current={currentStep === step.id ? "step" : undefined}
                  disabled={!interactive}
                  onClick={() => (interactive ? onStepChange?.(step.id) : undefined)}
                  type="button"
                >
                  <span className="hw-stepper__marker">
                    {step.status === "complete" ? <Check aria-hidden="true" /> : index + 1}
                  </span>
                  <span>{step.label}</span>
                </button>
              </li>
            );
          })}
        </ol>
        {/* Nome do passo atual para o modo compacto, onde os rótulos saem da
            linha. Fica fora da árvore acessível porque o mesmo nome continua no
            botão correspondente, com aria-current="step". */}
        {current ? (
          <p aria-hidden="true" className="hw-stepper__current">
            {`Etapa ${currentIndex + 1} de ${steps.length} · ${current.label}`}
          </p>
        ) : null}
      </div>
    );
  },
);
Stepper.displayName = "Stepper";
