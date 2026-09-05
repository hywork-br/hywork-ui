import * as React from "react";
import { cn } from "../lib/cn";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  indeterminate?: boolean;
}
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ indeterminate = false, className, ...props }, ref) => {
    const input = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => input.current!);
    React.useLayoutEffect(() => {
      if (input.current) input.current.indeterminate = indeterminate;
    }, [indeterminate, props.checked]);
    return (
      <input
        {...props}
        type="checkbox"
        ref={input}
        className={cn("hw-choice", className)}
      />
    );
  }
);
Checkbox.displayName = "Checkbox";
export const Radio = React.forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">
>(({ className, ...props }, ref) => (
  <input
    {...props}
    type="radio"
    ref={ref}
    className={cn("hw-choice", className)}
  />
));
Radio.displayName = "Radio";
export const Switch = React.forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "role">
>(({ className, ...props }, ref) => (
  <input
    {...props}
    type="checkbox"
    role="switch"
    ref={ref}
    className={cn("hw-choice", "hw-switch", className)}
  />
));
Switch.displayName = "Switch";
