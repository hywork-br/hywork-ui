import { X } from "lucide-react";
import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../components/dialog";

export interface FocusModeProps {
  /** Ação primária do passo. Fica à direita da faixa fixa (R27). */
  actions?: React.ReactNode;
  /** Ação de voltar. Fica à esquerda da faixa fixa, em todos os passos (R27). */
  back?: React.ReactNode;
  children: React.ReactNode;
  description?: string;
  exitDisabled?: boolean;
  /** `form` aplica a medida de leitura de formulário ao corpo; `page` é o teto do modo de foco. */
  measure?: "form" | "page";
  onExit: () => void;
  open: boolean;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
  title: string;
  /** Nível do título da tarefa. Modo de foco toma a tela: `h1` costuma ser o certo. */
  titleAs?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

/** Primeira parada de teclado do corpo — o que R29 chama de "foco inicial no primeiro campo". */
const PRIMEIRO_TABBABLE =
  'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

export function FocusMode({ actions, back, children, description, exitDisabled = false, measure = "page", onExit, open, returnFocusRef, title, titleAs = "h2" }: FocusModeProps) {
  const openerRef = React.useRef<HTMLElement | null>(null);
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const exit = () => {
    if (!exitDisabled) onExit();
  };
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? exit() : undefined)}>
      <DialogContent
        className="hw-focus-mode"
        {...(!description ? { "aria-describedby": undefined } : {})}
        onOpenAutoFocus={(event) => {
          const active = document.activeElement;
          openerRef.current = active instanceof HTMLElement && active !== document.body ? active : null;
          /* Sem isso o foco cai no botão de sair: a primeira coisa oferecida a
             quem entrou para criar seria a saída. */
          const first = [...(bodyRef.current?.querySelectorAll<HTMLElement>(PRIMEIRO_TABBABLE) ?? [])].find(
            (element) => !element.closest('[aria-hidden="true"], [hidden]'),
          );
          if (!first) return;
          event.preventDefault();
          first.focus({ preventScroll: true });
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          for (const target of [returnFocusRef?.current, openerRef.current]) {
            if (!target?.isConnected || target === document.body || target.matches(":disabled, [aria-disabled='true']")) continue;
            target.focus({ preventScroll: true });
            if (document.activeElement === target) break;
          }
        }}
      >
        <header className="hw-focus-mode__header">
          <div>
            {/* O esboço de headings é do consumidor: o padrão mantém h2 para não
                mexer em quem já compõe por cima dele. */}
            <DialogTitle asChild>{React.createElement(titleAs, null, title)}</DialogTitle>
            {description ? <DialogDescription>{description}</DialogDescription> : null}
          </div>
          <button aria-label={`Sair de ${title}`} disabled={exitDisabled} onClick={exit} type="button">
            <X aria-hidden="true" />
          </button>
        </header>
        <div className="hw-focus-mode__body" data-measure={measure} ref={bodyRef}>{children}</div>
        {back || actions ? (
          /* Linha fixa do diálogo, fora do corpo que rola: a mão aprende a
             posição e a ação do passo nunca fica abaixo da dobra. */
          <footer className="hw-focus-mode__actions">
            <div>{back}</div>
            <div>{actions}</div>
          </footer>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
