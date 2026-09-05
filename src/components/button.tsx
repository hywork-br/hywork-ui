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

function unavailableCaptureHandlers(handlers: React.DOMAttributes<HTMLElement>) {
  const block = (event: React.SyntheticEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  const keyboard = (handler?: React.KeyboardEventHandler<HTMLElement>): React.KeyboardEventHandler<HTMLElement> => (event) => {
    if (event.key === "Enter" || event.key === " ") block(event);
    else handler?.(event);
  };
  return {
    onClickCapture: block,
    onDoubleClickCapture: block,
    onPointerDownCapture: block,
    onPointerUpCapture: block,
    onMouseDownCapture: block,
    onMouseUpCapture: block,
    onKeyDownCapture: keyboard(handlers.onKeyDownCapture),
    onKeyUpCapture: keyboard(handlers.onKeyUpCapture),
  };
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
    // Slot runs child handlers first. Guard the child itself before Slot merges
    // callbacks, and guard capture so descendant actions cannot run either.
    const child = asChild && React.isValidElement<React.HTMLAttributes<HTMLElement>>(children)
      ? React.cloneElement(children, {
          ...(isDisabled ? unavailableCaptureHandlers(children.props) : {}),
          ...(isDisabled ? { "aria-disabled": true } : {}),
          "aria-busy": loading || children.props["aria-busy"],
          children: <span className="hw-button__label">{children.props.children}</span>,
        })
      : children;
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
        {...props}
        {...(isDisabled ? unavailableCaptureHandlers(props) : {})}
        aria-busy={loading || undefined}
        aria-disabled={isDisabled || undefined}
        className={cn("hw-button", className)}
        data-size={size}
        data-variant={variant}
        disabled={asChild ? undefined : isDisabled}
        onClick={handleClick}
        ref={ref}
        type={asChild ? undefined : type}
      >
        {loading ? <LoaderCircle aria-hidden="true" className="hw-button__spinner" /> : null}
        <Slottable>
          {asChild ? child : <span className="hw-button__label">{children}</span>}
        </Slottable>
      </Component>
    );
  },
);
Button.displayName = "Button";
