import * as React from "react";
import { Button } from "./button";
import { Progress } from "./progress";

export interface FileUploadItem {
  id: string;
  name: string;
  progress: number;
  status: "uploading" | "complete" | "error" | "cancelled";
  error?: string;
}
export interface FileUploadProps {
  label: string;
  items: FileUploadItem[];
  onFilesChange: (files: File[]) => void;
  onCancel?: (id: string) => void;
  onRetry?: (id: string) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
}
const statusLabels = {
  uploading: "Enviando",
  complete: "Concluído",
  error: "Erro",
  cancelled: "Cancelado",
};
export function FileUpload({
  label,
  items,
  onFilesChange,
  onCancel,
  onRetry,
  ...props
}: FileUploadProps) {
  const id = React.useId();
  const input = React.useRef<HTMLInputElement>(null);
  const trigger = React.useRef<HTMLButtonElement>(null);
  const container = React.useRef<HTMLDivElement>(null);
  const restoreFocus = React.useRef(false);
  const [selectionEvent, notifySelection] = React.useReducer(value => value + 1, 0);
  React.useEffect(() => {
    const element = input.current;
    const cancelled = () => { restoreFocus.current = true; notifySelection(); };
    element?.addEventListener('cancel', cancelled);
    return () => element?.removeEventListener('cancel', cancelled);
  }, []);
  React.useLayoutEffect(() => {
    if (!restoreFocus.current || props.disabled) return;
    restoreFocus.current = false;
    const active = document.activeElement;
    // Restore a lost/contained focus only; never steal focus from another control.
    if (active === input.current || active === trigger.current || active === document.body || active === document.documentElement || (active && container.current && active.contains(container.current))) trigger.current?.focus();
  }, [props.disabled, selectionEvent]);
  const selectionLabel = props.multiple ? "Selecionar arquivos" : "Selecionar arquivo";
  return (
    <div ref={container} className="hw-upload hw-field">
      <label className="hw-label" htmlFor={id}>
        {label}
      </label>
      <Button
        ref={trigger}
        type="button"
        variant="outline"
        disabled={props.disabled}
        aria-label={`${selectionLabel}: ${label}`}
        onClick={() => input.current?.click()}
      >
        {selectionLabel}
      </Button>
      <input
        {...props}
        ref={input}
        hidden
        id={id}
        type="file"
        onChange={(event) => {
          restoreFocus.current = true;
          const files = Array.from(event.target.files ?? []);
          if (files.length) onFilesChange(files);
          event.target.value = "";
          notifySelection();
        }}
      />
      <ul className="hw-upload__items">
        {items.map((item) => (
          <li key={item.id}>
            <span>{item.name}</span>
            <span>{statusLabels[item.status]}</span>
            <Progress
              aria-label={item.name}
              max={100}
              value={
                Number.isFinite(item.progress)
                  ? Math.min(100, Math.max(0, item.progress))
                  : 0
              }
            />
            {item.error && (
              <p className="hw-field__error" role="alert">
                {item.error}
              </p>
            )}
            {item.status === "uploading" && onCancel && (
              <button
                type="button"
                className="hw-selection-action"
                disabled={props.disabled}
                aria-label={`Cancelar ${item.name}`}
                onClick={() => onCancel(item.id)}
              >
                Cancelar
              </button>
            )}
            {(item.status === "error" || item.status === "cancelled") &&
              onRetry && (
                <button
                  type="button"
                  className="hw-selection-action"
                  disabled={props.disabled}
                  aria-label={`Tentar novamente ${item.name}`}
                  onClick={() => onRetry(item.id)}
                >
                  Tentar novamente
                </button>
              )}
          </li>
        ))}
      </ul>
    </div>
  );
}
