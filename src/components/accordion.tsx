import { ChevronDown } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

type AccordionMode = "single" | "multiple";

interface AccordionContextValue {
  isOpen: (value: string) => boolean;
  toggle: (value: string) => void;
  disabled: boolean;
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null);
const AccordionItemContext = React.createContext<{ value: string; disabled: boolean; contentId: string; triggerId: string } | null>(null);

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: AccordionMode;
  value?: string | string[];
  defaultValue?: string | string[];
  collapsible?: boolean;
  disabled?: boolean;
  onValueChange?: (value: string | string[]) => void;
}

function normalizeValues(mode: AccordionMode, value: string | string[] | undefined) {
  if (mode === "multiple") return Array.isArray(value) ? value : value ? [value] : [];
  const first = Array.isArray(value) ? value[0] : value;
  return first ? [first] : [];
}

export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ children, className, collapsible = false, defaultValue, disabled = false, onValueChange, type = "single", value, ...props }, ref) => {
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = React.useState(() => normalizeValues(type, defaultValue));
    const openValues = normalizeValues(type, isControlled ? value : internalValue);

    const update = (next: string[]) => {
      if (!isControlled) setInternalValue(next);
      onValueChange?.(type === "multiple" ? next : next[0] ?? "");
    };

    const toggle = (itemValue: string) => {
      if (disabled) return;
      const open = openValues.includes(itemValue);
      if (type === "multiple") {
        update(open ? openValues.filter((entry) => entry !== itemValue) : [...openValues, itemValue]);
        return;
      }
      if (open && !collapsible) return;
      update(open ? [] : [itemValue]);
    };

    return (
      <AccordionContext.Provider value={{ disabled, isOpen: (itemValue) => openValues.includes(itemValue), toggle }}>
        <div className={cn("hw-accordion", className)} data-orientation="vertical" ref={ref} {...props}>
          {children}
        </div>
      </AccordionContext.Provider>
    );
  },
);
Accordion.displayName = "Accordion";

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
}

export const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ children, className, disabled = false, value, ...props }, ref) => {
    const root = React.useContext(AccordionContext);
    if (!root) throw new Error("AccordionItem must be rendered inside Accordion");
    const id = React.useId().replace(/:/g, "");
    const item = { contentId: `hw-accordion-content-${id}`, disabled: disabled || root.disabled, triggerId: `hw-accordion-trigger-${id}`, value };

    return (
      <AccordionItemContext.Provider value={item}>
        <div className={cn("hw-accordion__item", className)} data-disabled={item.disabled ? "" : undefined} data-state={root.isOpen(value) ? "open" : "closed"} ref={ref} {...props}>
          {children}
        </div>
      </AccordionItemContext.Provider>
    );
  },
);
AccordionItem.displayName = "AccordionItem";

export const AccordionTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ children, className, disabled, onClick, ...props }, ref) => {
    const root = React.useContext(AccordionContext);
    const item = React.useContext(AccordionItemContext);
    if (!root || !item) throw new Error("AccordionTrigger must be rendered inside AccordionItem");
    const open = root.isOpen(item.value);
    const isDisabled = disabled || item.disabled;

    return (
      <div className="hw-accordion__heading">
        <button
          aria-controls={item.contentId}
          aria-expanded={open}
          className={cn("hw-accordion__trigger", className)}
          data-state={open ? "open" : "closed"}
          disabled={isDisabled}
          id={item.triggerId}
          onClick={(event) => {
            onClick?.(event);
            if (!event.defaultPrevented) root.toggle(item.value);
          }}
          ref={ref}
          type="button"
          {...props}
        >
          <span>{children}</span>
          <ChevronDown aria-hidden="true" className="hw-accordion__icon" />
        </button>
      </div>
    );
  },
);
AccordionTrigger.displayName = "AccordionTrigger";

export const AccordionContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className, ...props }, ref) => {
    const root = React.useContext(AccordionContext);
    const item = React.useContext(AccordionItemContext);
    if (!root || !item) throw new Error("AccordionContent must be rendered inside AccordionItem");
    const open = root.isOpen(item.value);

    return (
      <div aria-labelledby={item.triggerId} className={cn("hw-accordion__content", className)} data-state={open ? "open" : "closed"} hidden={!open} id={item.contentId} ref={ref} role="region" {...props}>
        {children}
      </div>
    );
  },
);
AccordionContent.displayName = "AccordionContent";
