import * as React from "react";

import { cn } from "../lib/cn";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current progress. Values outside the range are clamped for a stable visual state. */
  value?: number | null;
  /** Maximum progress value. Defaults to 100. */
  max?: number;
}

function clampProgress(value: number | null | undefined, max: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(max, Math.max(0, value as number));
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, max = 100, value = 0, ...props }, ref) => {
    const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
    const safeValue = clampProgress(value, safeMax);
    const percentage = (safeValue / safeMax) * 100;

    return (
      <div
        aria-valuemax={safeMax}
        aria-valuemin={0}
        aria-valuenow={safeValue}
        className={cn("hw-progress", className)}
        data-max={safeMax}
        data-state={safeValue >= safeMax ? "complete" : safeValue > 0 ? "loading" : "idle"}
        data-value={safeValue}
        role="progressbar"
        ref={ref}
        {...props}
      >
        <span aria-hidden="true" className="hw-progress__indicator" style={{ transform: `scaleX(${percentage / 100})` }} />
      </div>
    );
  },
);
Progress.displayName = "Progress";
