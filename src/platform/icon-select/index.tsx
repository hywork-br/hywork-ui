"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Popover, PopoverTrigger } from "../../core/popover";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "../../lib/cn";

/**
 * Normaliza a classe do ícone Font Awesome para o formato FA6 (fa-solid fa-xxx).
 */
export function getFontAwesomeIconClass(icon: string): string {
  if (!icon) return "fa-solid fa-comments";
  const s = icon.trim().replace(/^fa\s+/, "");
  return s.startsWith("fa-solid ") || s.startsWith("fa-regular ") || s.startsWith("fa-brands ")
    ? s
    : `fa-solid ${s}`;
}

/**
 * Lista padrão de ícones Font Awesome 6 (solid) para uso em categorias, menus, etc.
 */
export const DEFAULT_FONT_AWESOME_ICONS = [
  { value: "fa-comments", label: "Comentários" },
  { value: "fa-folder", label: "Pasta" },
  { value: "fa-file-lines", label: "Documentos" },
  { value: "fa-circle-question", label: "Dúvidas" },
  { value: "fa-lightbulb", label: "Ideias" },
  { value: "fa-bullhorn", label: "Anúncios" },
  { value: "fa-book", label: "Conhecimento" },
  { value: "fa-users", label: "Equipe" },
  { value: "fa-star", label: "Destaque" },
  { value: "fa-heart", label: "Favoritos" },
  { value: "fa-tag", label: "Tags" },
  { value: "fa-envelope", label: "Mensagens" },
  { value: "fa-bell", label: "Notificações" },
  { value: "fa-gear", label: "Configurações" },
  { value: "fa-house", label: "Início" },
  { value: "fa-magnifying-glass", label: "Busca" },
  { value: "fa-circle-info", label: "Informação" },
  { value: "fa-circle-exclamation", label: "Importante" },
  { value: "fa-circle-check", label: "Resolvido" },
  { value: "fa-globe", label: "Geral" },
  { value: "fa-briefcase", label: "Trabalho" },
  { value: "fa-graduation-cap", label: "Aprendizagem" },
  { value: "fa-newspaper", label: "Notícias" },
  { value: "fa-wrench", label: "Suporte" },
  { value: "fa-shield-halved", label: "Segurança" },
  { value: "fa-chart-line", label: "Métricas" },
] as const;

export type FontAwesomeIconOption = {
  value: string;
  label: string;
};

export interface FontAwesomeIconSelectProps {
  value: string;
  onChange: (value: string) => void;
  icons?: readonly FontAwesomeIconOption[];
  id?: string;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
}

/**
 * Dropdown de seleção de ícones Font Awesome 6 em grid.
 * Reutilizável em formulários de categorias, menus, configurações, etc.
 */
export function FontAwesomeIconSelect({
  value,
  onChange,
  icons = DEFAULT_FONT_AWESOME_ICONS,
  id,
  placeholder = "Selecione um ícone",
  className,
  triggerClassName,
}: FontAwesomeIconSelectProps) {
  const [open, setOpen] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const iconList = icons as readonly FontAwesomeIconOption[];
  const hasCustomIcon = value && !iconList.some((opt) => opt.value === value);
  const selectedOption = iconList.find((opt) => opt.value === value);
  const displayLabel = selectedOption?.label || value || placeholder;

  useEffect(() => {
    let container = document.getElementById("icon-select-portal");
    if (!container) {
      container = document.createElement("div");
      container.id = "icon-select-portal";
      container.style.position = "fixed";
      container.style.zIndex = "99999";
      container.style.pointerEvents = "none";
      document.body.appendChild(container);
    }
    setPortalContainer(container);
  }, []);

  const handleSelect = (iconValue: string) => {
    onChange(iconValue);
    setOpen(false);
  };

  const gridIcons = hasCustomIcon
    ? [{ value, label: value }, ...iconList]
    : iconList;

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          className={cn(
            "flex h-10 w-full items-center justify-between gap-2 rounded-md border border-gray-300 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-gray-400 hover:bg-muted/50 focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
            triggerClassName ?? className
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <i
              className={cn("shrink-0 text-foreground", value ? getFontAwesomeIconClass(value) : "fa-solid fa-comments opacity-50")}
              style={{ width: "1rem" }}
              aria-hidden
            />
            <span className={value ? "text-foreground" : "text-muted-foreground"}>
              {displayLabel}
            </span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      {portalContainer && (
        <PopoverPrimitive.Portal container={portalContainer}>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={4}
            className={cn(
              "w-auto p-2 rounded-md border bg-popover text-popover-foreground shadow-md outline-none",
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
            )}
            style={{ zIndex: 99999, pointerEvents: "auto" }}
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div
              className="grid grid-cols-6 gap-1 max-h-[280px] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {gridIcons.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelect(opt.value);
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelect(opt.value);
                  }}
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-muted",
                    value === opt.value && "bg-muted ring-1 ring-primary"
                  )}
                  title={typeof opt.label === "string" ? opt.label : opt.value}
                >
                  <i
                    className={cn(getFontAwesomeIconClass(opt.value), "text-foreground")}
                    style={{ fontSize: "1.125rem" }}
                    aria-hidden
                  />
                </button>
              ))}
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      )}
    </Popover>
  );
}
