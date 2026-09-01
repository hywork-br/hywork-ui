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
  onExit: () => void;
  open: boolean;
  title: string;
}

export function FocusMode({ children, description, onExit, open, title }: FocusModeProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onExit() : undefined)}>
      <DialogContent className="hw-focus-mode">
        <header className="hw-focus-mode__header">
          <div>
            <p className="hw-focus-mode__eyebrow">Modo foco</p>
            <DialogTitle>{title}</DialogTitle>
            {description ? <DialogDescription>{description}</DialogDescription> : null}
          </div>
          <button aria-label={`Sair de ${title}`} onClick={onExit} type="button">
            <X aria-hidden="true" />
          </button>
        </header>
        <div className="hw-focus-mode__body">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
