"use client";

import * as React from "react";
import { MoreVertical } from "lucide-react";

import { cn } from "../../lib/cn";
import { Button } from "../../core/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../core/dropdown-menu";

/**
 * Ações de uma linha de listagem.
 *
 * Decisão da PO (23/09/2026): gatilho de 32px com reticências, menu suspenso.
 * **Botões soltos na linha saem de uso** — eram 15 telas com duas, três ou
 * quatro ações lado a lado, cada uma com um tamanho.
 *
 * A ação destrutiva recebe o papel por `destructive` em vez de uma classe na
 * tela, e vem sempre por último, separada das demais.
 */
export interface RowAction {
  /** Texto do item. */
  label: string;
  onSelect: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  /** Tinge o item como destrutivo e o separa das demais ações. */
  destructive?: boolean;
}

export interface RowActionsProps {
  actions: RowAction[];
  /** Cabeçalho do menu; omitido quando a listagem já deixa o contexto claro. */
  label?: string;
  /** Desabilita o gatilho inteiro, por exemplo enquanto a linha é removida. */
  disabled?: boolean;
  /** Rótulo acessível do gatilho. */
  triggerLabel?: string;
  className?: string;
}

function RowActions({
  actions,
  label,
  disabled = false,
  triggerLabel = "Ações da linha",
  className,
}: RowActionsProps) {
  const comuns = actions.filter((a) => !a.destructive);
  const destrutivas = actions.filter((a) => a.destructive);

  const item = (action: RowAction) => (
    <DropdownMenuItem
      key={action.label}
      onSelect={action.onSelect}
      disabled={action.disabled}
      className={cn("gap-2", action.destructive && "text-destructive focus:text-destructive")}
    >
      {action.icon}
      {action.label}
    </DropdownMenuItem>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          disabled={disabled}
          aria-label={triggerLabel}
          className={cn("h-8 w-8 p-0", className)}
        >
          <MoreVertical className="h-4 w-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {label && <DropdownMenuLabel>{label}</DropdownMenuLabel>}
        {comuns.map(item)}
        {destrutivas.length > 0 && comuns.length > 0 && <DropdownMenuSeparator />}
        {destrutivas.map(item)}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
RowActions.displayName = "RowActions";

export { RowActions };
