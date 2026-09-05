import * as React from "react";
import { cn } from "../lib/cn";

export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}
interface SelectionProps {
  options: ComboboxOption[];
  "aria-label": string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}
export interface ComboboxProps extends SelectionProps {
  value: string;
  onValueChange: (value: string) => void;
}
export interface MultiSelectProps extends SelectionProps {
  value: string[];
  onValueChange: (value: string[]) => void;
}

function Selection({
  options,
  value,
  onValueChange,
  multiple,
  className,
  ...props
}: SelectionProps & {
  value: string[];
  onValueChange: (value: string[]) => void;
  multiple: boolean;
}) {
  const id = React.useId();
  const input = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState<string | null>(null);
  const visible = options.filter((option) =>
    option.label.toLocaleLowerCase().includes(query.toLocaleLowerCase())
  );
  const enabled = visible.filter((option) => !option.disabled);
  const activeOption = enabled.find((option) => option.value === active);
  const optionId = (value: string) =>
    `${id}-option-${encodeURIComponent(value)}`;
  const close = () => {
    setOpen(false);
    setQuery("");
    setActive(null);
  };
  const select = (option: ComboboxOption) => {
    if (option.disabled) return;
    onValueChange(
      multiple
        ? value.includes(option.value)
          ? value.filter((item) => item !== option.value)
          : [...value, option.value]
        : [option.value]
    );
    if (!multiple) close();
  };
  React.useEffect(() => {
    if (open && activeOption)
      document
        .getElementById(optionId(activeOption.value))
        ?.scrollIntoView?.({ block: "nearest" });
  }, [open, activeOption?.value]);
  return (
    <div
      className={cn("hw-combobox", className)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          close();
      }}
    >
      {multiple && (
        <div className="hw-combobox__values">
          {value.map((item) => (
            <button
              type="button"
              className="hw-selection-action"
              key={item}
              disabled={props.disabled}
              aria-label={`Remover ${
                options.find((option) => option.value === item)?.label ?? item
              }`}
              onClick={() => {
                onValueChange(value.filter((selected) => selected !== item));
                input.current?.focus();
              }}
            >
              {options.find((option) => option.value === item)?.label ?? item} ×
            </button>
          ))}
          <span role="status">
            {value.length} {value.length === 1 ? "selecionado" : "selecionados"}
          </span>
        </div>
      )}
      <input
        {...props}
        ref={input}
        className="hw-input"
        role="combobox"
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={open ? `${id}-list` : undefined}
        aria-activedescendant={
          open && activeOption ? optionId(activeOption.value) : undefined
        }
        value={
          open || multiple
            ? query
            : options.find((option) => option.value === value[0])?.label ?? ""
        }
        onClick={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          setActive(null);
        }}
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing) return;
          if (event.key === "Escape" && open) {
            event.preventDefault();
            event.stopPropagation();
            close();
          }
          if (event.key === "Enter") {
            event.preventDefault();
            if (open && activeOption) select(activeOption);
          }
          if (
            ["ArrowDown", "ArrowUp"].includes(event.key) ||
            (open && ["Home", "End"].includes(event.key))
          ) {
            event.preventDefault();
            setOpen(true);
            const index = enabled.findIndex(
              (option) => option.value === active
            );
            const next =
              event.key === "Home"
                ? 0
                : event.key === "End"
                ? enabled.length - 1
                : event.key === "ArrowDown"
                ? Math.min(index + 1, enabled.length - 1)
                : index < 0
                ? enabled.length - 1
                : Math.max(index - 1, 0);
            setActive(enabled[next]?.value ?? null);
          }
        }}
      />
      {open && (
        <div className="hw-combobox__popup">
          <ul
            id={`${id}-list`}
            role="listbox"
            aria-label={props["aria-label"]}
            aria-multiselectable={multiple || undefined}
          >
            {visible.map((option) => (
              <li
                key={option.value}
                id={optionId(option.value)}
                role="option"
                aria-selected={value.includes(option.value)}
                aria-disabled={option.disabled || undefined}
                data-active={activeOption?.value === option.value || undefined}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => select(option)}
              >
                <span>{option.label}</span>
                {value.includes(option.value) && (
                  <span aria-hidden="true"> ✓</span>
                )}
                {option.description && <small>{option.description}</small>}
              </li>
            ))}
          </ul>
          {!visible.length && (
            <p role={multiple ? undefined : "status"}>
              Nenhuma opção encontrada
            </p>
          )}
        </div>
      )}
    </div>
  );
}
export function Combobox({ value, onValueChange, ...props }: ComboboxProps) {
  return (
    <Selection
      {...props}
      value={value ? [value] : []}
      onValueChange={(items) => onValueChange(items[0] ?? "")}
      multiple={false}
    />
  );
}
export function MultiSelect(props: MultiSelectProps) {
  return <Selection {...props} multiple />;
}
