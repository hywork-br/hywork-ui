import * as React from "react";

import { cn } from "../lib/cn";

export type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, tone = "neutral", ...props }, ref) => (
    <span className={cn("hw-badge", className)} data-tone={tone} ref={ref} {...props} />
  ),
);
Badge.displayName = "Badge";
