import * as React from "react";

export type SeparatorOrientation = "horizontal" | "vertical";

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  decorative?: boolean;
  orientation?: SeparatorOrientation;
}

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ decorative = true, orientation = "horizontal", className, ...props }, ref) => (
    <div
      {...props}
      ref={ref}
      aria-orientation={decorative ? undefined : orientation}
      className={className ? `hw-separator ${className}` : "hw-separator"}
      data-orientation={orientation}
      role={decorative ? undefined : "separator"}
    />
  ),
);

Separator.displayName = "Separator";
