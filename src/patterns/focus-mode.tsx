import { X } from "lucide-react";
import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../components/dialog";

export interface FocusModeProps {
  children: React.ReactNode;
  description?: string;
  exitDisabled?: boolean;
  onExit: () => void;
  open: boolean;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
  title: string;
}

export function FocusMode({ children, description, exitDisabled = false, onExit, open, returnFocusRef, title }: FocusModeProps) {
  const openerRef = React.useRef<HTMLElement | null>(null);
  const exit = () => {
    if (!exitDisabled) onExit();
  };
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? exit() : undefined)}>
      <DialogContent
        className="hw-focus-mode"
        {...(!description ? { "aria-describedby": undefined } : {})}
        onOpenAutoFocus={() => {
          const active = document.activeElement;
          openerRef.current = active instanceof HTMLElement && active !== document.body ? active : null;
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
            <DialogTitle>{title}</DialogTitle>
            {description ? <DialogDescription>{description}</DialogDescription> : null}
          </div>
          <button aria-label={`Sair de ${title}`} disabled={exitDisabled} onClick={exit} type="button">
            <X aria-hidden="true" />
          </button>
        </header>
        <div className="hw-focus-mode__body">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
