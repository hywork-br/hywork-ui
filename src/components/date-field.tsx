import * as React from "react";
import { cn } from "../lib/cn";

/** Native locale display; the value and bounds use ISO YYYY-MM-DD. */
export interface DateFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
}
export const DateField = React.forwardRef<HTMLInputElement, DateFieldProps>(
  ({ label, id, className, ...props }, ref) => {
    const generated = React.useId();
    return (
      <div className="hw-field">
        <label className="hw-label" htmlFor={id ?? generated}>
          {label}
        </label>
        <input
          {...props}
          id={id ?? generated}
          ref={ref}
          type="date"
          className={cn("hw-input", className)}
        />
      </div>
    );
  }
);
DateField.displayName = "DateField";
export interface DateRangeValue {
  from: string;
  to: string;
}
export interface DateRangeFieldProps {
  label: string;
  value: DateRangeValue;
  onValueChange: (value: DateRangeValue) => void;
  fromLabel?: string;
  toLabel?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
}
export function DateRangeField({
  label,
  value,
  onValueChange,
  fromLabel = "De",
  toLabel = "Até",
  error,
  className,
  ...props
}: DateRangeFieldProps) {
  const id = React.useId();
  const message =
    error ||
    (value.from && value.to && value.from > value.to
      ? "A data final deve ser igual ou posterior à inicial."
      : "");
  return (
    <fieldset
      className={cn("hw-date-range", className)}
      disabled={props.disabled}
    >
      <legend className="hw-label">{label}</legend>
      <div className="hw-date-range__fields">
        <DateField
          {...props}
          label={fromLabel}
          value={value.from}
          aria-invalid={!!message || undefined}
          aria-describedby={message ? id : undefined}
          onChange={(event) =>
            onValueChange({ ...value, from: event.target.value })
          }
        />
        <DateField
          {...props}
          label={toLabel}
          value={value.to}
          aria-invalid={!!message || undefined}
          aria-describedby={message ? id : undefined}
          onChange={(event) =>
            onValueChange({ ...value, to: event.target.value })
          }
        />
      </div>
      {message && (
        <p id={id} role="alert" className="hw-field__error">
          {message}
        </p>
      )}
    </fieldset>
  );
}
