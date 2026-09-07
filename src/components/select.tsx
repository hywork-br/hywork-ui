import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

export interface SelectOption {
  disabled?: boolean;
  label: string;
  value: string;
}

export interface SelectProps {
  "aria-describedby"?: string;
  "aria-invalid"?: React.AriaAttributes["aria-invalid"];
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  value?: string;
}

export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      ariaLabel,
      className,
      disabled,
      id,
      name,
      onValueChange,
      options,
      placeholder,
      required,
      value,
    },
    ref,
  ) => (
    <SelectPrimitive.Root
      disabled={disabled}
      name={name}
      onValueChange={onValueChange}
      required={required}
      value={value}
    >
      <SelectPrimitive.Trigger
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        aria-label={ariaLabel}
        className={cn("hw-select", className)}
        id={id}
        ref={ref}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <ChevronDown aria-hidden="true" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content className="hw-select__content" position="popper" sideOffset={8}>
          <SelectPrimitive.Viewport>
            {options.map((option) => (
              <SelectPrimitive.Item
                className="hw-select__item"
                disabled={option.disabled}
                key={option.value}
                value={option.value}
              >
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator>
                  <Check aria-hidden="true" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  ),
);
Select.displayName = "Select";
