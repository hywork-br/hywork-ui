import { Slot, Slottable } from "@radix-ui/react-slot";
import { LoaderCircle } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

export type ButtonVariant = "primary" | "secondary" | "outline" | "quiet" | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  loading?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      asChild = false,
      children,
      className,
      disabled,
      loading = false,
      onClick,
      size = "md",
      type = "button",
      variant = "primary",
      ...props
    },
    ref,
  ) => {
    const Component = asChild ? Slot : "button";
    const isDisabled = disabled || loading;
    const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
      if (isDisabled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      onClick?.(event);
    };

    return (
      <Component
        aria-busy={loading || undefined}
        aria-disabled={isDisabled || undefined}
        className={cn("hw-button", className)}
        data-size={size}
        data-variant={variant}
        disabled={asChild ? undefined : isDisabled}
        onClick={handleClick}
        ref={ref}
        type={asChild ? undefined : type}
        {...props}
      >
        {loading ? <LoaderCircle aria-hidden="true" className="hw-button__spinner" /> : null}
        <Slottable>
          {asChild ? children : <span className="hw-button__label">{children}</span>}
        </Slottable>
      </Component>
    );
  },
);
Button.displayName = "Button";
