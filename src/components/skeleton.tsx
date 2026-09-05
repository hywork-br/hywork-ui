import * as React from "react";

import { cn } from "../lib/cn";

export const Skeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div aria-hidden="true" className={cn("hw-skeleton", className)} ref={ref} {...props} />
  ),
);
Skeleton.displayName = "Skeleton";
