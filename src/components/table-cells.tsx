import { Avatar } from "./avatar";
import { useId, useState } from "react";
import { Button } from "./button";
import { Badge, type BadgeTone } from "./badge";

const missing = "Não informado";
export function PersonCell({
  name,
  src,
  description,
}: {
  name?: string | null;
  src?: string;
  description?: string;
}) {
  return (
    <span className="hw-person-cell">
      {name && (
        <span aria-hidden="true">
          <Avatar name={name} src={src} size="sm" />
        </span>
      )}
      <span>
        {name || missing}
        {description && <small>{description}</small>}
      </span>
    </span>
  );
}
export function StatusCell({
  label,
  tone = "neutral",
}: {
  label?: string | null;
  tone?: BadgeTone;
}) {
  return <Badge tone={tone}>{label || missing}</Badge>;
}
export function DateCell({
  value,
  locale = "pt-BR",
}: {
  value?: string | Date | null;
  locale?: string;
}) {
  const date =
    typeof value === "string"
      ? new Date(
          /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value
        )
      : value;
  return date && !Number.isNaN(date.getTime()) ? (
    <time dateTime={typeof value === "string" ? value : date.toISOString()}>
      {new Intl.DateTimeFormat(locale).format(date)}
    </time>
  ) : (
    <span>{missing}</span>
  );
}
export function NumberCell({
  value,
  locale = "pt-BR",
  options,
}: {
  value?: number | null;
  locale?: string;
  options?: Intl.NumberFormatOptions;
}) {
  return (
    <span className="hw-number-cell">
      {typeof value === "number" && Number.isFinite(value)
        ? new Intl.NumberFormat(locale, options).format(value)
        : missing}
    </span>
  );
}
export function ContentCell({
  title,
  metadata,
  thumbnail,
}: {
  title?: string | null;
  metadata?: string;
  thumbnail?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className="hw-content-cell">
      {thumbnail && <img src={thumbnail} alt="" />}
      <div>
        <strong>{title || missing}</strong>
        {metadata && (
          <div>
            <Button
              variant="quiet"
              aria-expanded={open}
              aria-controls={id}
              onClick={() => setOpen(!open)}
            >
              Detalhes do conteúdo
            </Button>
            <p id={id} hidden={!open}>
              {metadata}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
