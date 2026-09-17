import * as React from "react";
import { cn } from "../lib/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  focusColor?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, focusColor, onChange, onClick, onFocus, onBlur, onKeyDown, ...props }, ref) => {
    // Função para prevenir a propagação de eventos
    const handleEventWithStopPropagation =
      <T extends React.SyntheticEvent>(handler: ((event: T) => void) | undefined) =>
      (event: T) => {
        event.stopPropagation();
        handler?.(event);
      };

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-sm border border-slate-300/80 bg-white px-3 py-1.5 text-sm transition-colors motion-reduce:!transition-none file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
          focusColor && `focus-visible:ring-${focusColor} focus-visible:border-${focusColor}`,
          className
        )}
        ref={ref}
        onChange={handleEventWithStopPropagation(onChange)}
        onClick={handleEventWithStopPropagation(onClick)}
        onFocus={handleEventWithStopPropagation(onFocus)}
        onBlur={handleEventWithStopPropagation(onBlur)}
        onKeyDown={handleEventWithStopPropagation(onKeyDown)}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
export default Input;
