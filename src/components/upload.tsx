import * as React from "react";

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
  return (
    <div className="hw-upload hw-field">
      <label className="hw-label" htmlFor={id}>
        {label}
      </label>
      <input
        {...props}
        id={id}
        type="file"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          if (files.length) onFilesChange(files);
          event.target.value = "";
        }}
      />
      <ul className="hw-upload__items">
        {items.map((item) => (
          <li key={item.id}>
            <span>{item.name}</span>
            <span>{statusLabels[item.status]}</span>
            <progress
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
