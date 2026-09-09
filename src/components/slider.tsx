import * as React from "react";

import { cn } from "../lib/cn";

export interface SliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange" | "value"> {
  value?: number[];
  defaultValue?: number[];
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onValueChange?: (value: number[]) => void;
  onValueCommit?: (value: number[]) => void;
}

function normalizeValues(values: number[] | undefined, min: number, max: number, step: number) {
  const source = values?.length ? values : [min];
  return source.map((value) => Math.min(max, Math.max(min, Number.isFinite(value) ? value : min)))
    .sort((a, b) => a - b)
    .map((value) => Math.round((value - min) / step) * step + min);
}

export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ className, defaultValue, disabled = false, max = 100, min = 0, onValueChange, onValueCommit, step = 1, value, ...props }, ref) => {
    const safeMax = Number.isFinite(max) && max > min ? max : min + 100;
    const safeStep = Number.isFinite(step) && step > 0 ? step : 1;
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = React.useState(() => normalizeValues(defaultValue, min, safeMax, safeStep));
    const values = normalizeValues(isControlled ? value : internalValue, min, safeMax, safeStep);
    const ariaLabel = typeof props["aria-label"] === "string" ? props["aria-label"] : "Valor";
    const low = values[0] ?? min;
    const high = values[values.length - 1] ?? min;
    const rangeStart = ((low - min) / (safeMax - min)) * 100;
    const rangeWidth = ((high - low) / (safeMax - min)) * 100;

    const update = (index: number, nextValue: number, commit = false) => {
      const next = normalizeValues(values.map((entry, entryIndex) => entryIndex === index ? nextValue : entry), min, safeMax, safeStep);
      if (!isControlled) setInternalValue(next);
      onValueChange?.(next);
      if (commit) onValueCommit?.(next);
    };

    return (
      <div aria-disabled={disabled || undefined} className={cn("hw-slider", className)} data-disabled={disabled ? "" : undefined} ref={ref} {...props}>
        <span aria-hidden="true" className="hw-slider__track" />
        <span aria-hidden="true" className="hw-slider__range" style={{ left: `${rangeStart}%`, width: `${rangeWidth}%` }} />
        {values.map((current, index) => (
          <input
            aria-label={values.length > 1 ? `${ariaLabel} ${index + 1}` : ariaLabel}
            className="hw-slider__input"
            disabled={disabled}
            key={index}
            max={safeMax}
            min={min}
            onChange={(event) => update(index, Number(event.target.value))}
            onMouseUp={() => onValueCommit?.(values)}
            onTouchEnd={() => onValueCommit?.(values)}
            onKeyUp={(event) => {
              if (["ArrowDown", "ArrowLeft", "ArrowRight", "ArrowUp", "End", "Home", "PageDown", "PageUp"].includes(event.key)) onValueCommit?.(values);
            }}
            step={safeStep}
            type="range"
            value={current}
          />
        ))}
      </div>
    );
  },
);
Slider.displayName = "Slider";
