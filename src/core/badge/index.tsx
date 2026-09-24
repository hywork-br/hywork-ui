import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-2 text-[12px] font-medium px-2 py-1 border-none rounded-md bg-opacity-80",
  {
    variants: {
      variant: {
        default: "text-primary",
        secondary: "text-muted-foreground",
        destructive: "text-hw-status-danger dark:text-red-400",
        success: "text-hw-status-success dark:text-emerald-400",
        warning: "text-hw-status-warning dark:text-yellow-400",
        info: "text-hw-status-info dark:text-blue-400",
        outline: "text-primary border border-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const colorDotVariants: Record<string, string> = {
  default: "bg-primary",
  secondary: "bg-secondary",
  destructive: "bg-red-600 dark:bg-red-400",
  success: "bg-emerald-600 dark:bg-emerald-400",
  warning: "bg-yellow-600 dark:bg-yellow-400",
  info: "bg-blue-600 dark:bg-blue-400",
};

function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      <span
        className={cn(
          "w-2 h-2 rounded-full",
          colorDotVariants[variant || "default"] || colorDotVariants.default
        )}
      />
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
