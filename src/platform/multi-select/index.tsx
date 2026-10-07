"use client";

// Dependencies
import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

// Components
import { Button } from "../../core/button";
import { Badge } from "../../core/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../core/command";
import { Popover, PopoverContent, PopoverTrigger } from "../../core/popover";
import { ScrollArea } from "../../core/scroll-area";

// Utils
import { cn } from "../../lib/cn";

interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void | Promise<void>;
  placeholder?: string;
  maxSelected?: number;
  disabled?: boolean;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Selecione",
  maxSelected,
  disabled = false,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (currentValue: string) => {
    if (disabled) return;
    let newValue = [...value];
    const isSelected = newValue.includes(currentValue);

    if (isSelected) {
      newValue = newValue.filter((v) => v !== currentValue);
    } else {
      if (maxSelected && maxSelected === 1) {
        newValue = [currentValue];
      } else if (!maxSelected || newValue.length < maxSelected) {
        newValue.push(currentValue);
      }
    }

    onChange(newValue);
  };

  return (
    <Popover open={disabled ? false : open} onOpenChange={(o) => !disabled && setOpen(o)}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between items-center gap-2 h-auto min-h-[40px]"
          disabled={disabled}
        >
          <div className="flex-1 min-w-0 overflow-hidden">
            {value.length > 0 ? (
              <div className="flex flex-wrap gap-x-1 gap-y-0.5 max-h-[72px] overflow-y-auto py-0.5">
                {value.slice(0, 50).map((val) => {
                  const option = options.find((o) => o.value === val);
                  return option ? (
                    <Badge
                      key={val}
                      variant="secondary"
                      className="px-1 text-foreground text-xs whitespace-nowrap"
                    >
                      {option.label}
                    </Badge>
                  ) : null;
                })}
                {value.length > 50 && (
                  <Badge variant="secondary" className="px-1 text-foreground text-xs whitespace-nowrap">
                    +{value.length - 50}
                  </Badge>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <div className="flex items-center justify-center flex-shrink-0">
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="z-[60] p-0 w-[var(--radix-popover-trigger-width)]" align="start">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList className="max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
            <CommandEmpty>Nenhuma opção.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => handleSelect(option.value)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 flex-shrink-0",
                      value.includes(option.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="whitespace-pre-wrap break-words">{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}


