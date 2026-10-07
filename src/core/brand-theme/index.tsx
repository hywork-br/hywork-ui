"use client";

import * as React from "react";

import { brandThemeVars } from "../../theme/brand";

/**
 * Cor de marca do workspace aplicada a um trecho da árvore.
 *
 * Decisão do Rick (06/10/2026): a marca é a ÚNICA cor que o consumidor
 * informa. Botão principal, aba ativa, anel de foco, link, checkbox, switch e
 * rádio passam a segui-la; estado (sucesso, atenção, erro, informação) e
 * destrutivo não.
 *
 * Para a aplicação inteira, prefira escrever as variáveis no `<html>` — é o
 * único lugar que alcança também os portais (Dialog, Select, DropdownMenu,
 * Toast), que o Radix monta fora desta `div`:
 *
 * ```tsx
 * <html style={brandThemeVars(workspace.color_primary_hex)}>   // servidor
 * useBrandTheme(workspace.color_primary_hex);                   // cliente
 * ```
 *
 * `BrandTheme` serve a um trecho: uma pré-visualização, um cartão de
 * workspace, a story. Cor inválida ou ausente → vale a marca de fora.
 */
export interface BrandThemeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Cor do workspace, `#rgb` ou `#rrggbb`. */
  color?: string | null;
}

const BrandTheme = React.forwardRef<HTMLDivElement, BrandThemeProps>(
  ({ color, style, ...props }, ref) => (
    <div
      ref={ref}
      data-hw-brand=""
      style={{ ...(brandThemeVars(color) as React.CSSProperties), ...style }}
      {...props}
    />
  ),
);
BrandTheme.displayName = "BrandTheme";

/**
 * Escreve a marca do workspace no `<html>` (ou em `target`) e a remove ao
 * desmontar ou quando a cor muda. Cor inválida ou ausente → só remove, e o
 * primário do design system volta a valer.
 */
function useBrandTheme(color?: string | null, target?: HTMLElement | null): void {
  React.useEffect(() => {
    const element = target ?? document.documentElement;
    const entries = Object.entries(brandThemeVars(color));
    for (const [name, value] of entries) element.style.setProperty(name, value);
    return () => {
      for (const [name] of entries) element.style.removeProperty(name);
    };
  }, [color, target]);
}

export { BrandTheme, useBrandTheme, brandThemeVars };
export type { BrandThemeVars } from "../../theme/brand";
