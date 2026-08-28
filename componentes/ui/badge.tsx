/**
 * Badge — shadcn-ui/ui @ ee628d75, variante `base` (Base UI).
 *
 * Mudou em relação ao upstream:
 * - caminho do `cn`;
 * - o anel de foco inline (`focus-visible:ring-[3px] ring-ring/50`) saiu: foco
 *   é outline com --hw-focus-* na folha de estilo, porque 50% de opacidade
 *   derruba o anel abaixo do piso de 3:1 da WCAG 2.4.11;
 * - as variantes `dark:` de aria-invalid saíram — esta camada não tem modo
 *   escuro, e apontar para token inexistente é regra que some sem erro.
 *
 * ⚠️ Badge de ESTADO carrega ícone ou texto junto, sempre. A paleta da marca
 * não tem verde nem vermelho: sucesso e erro tomam emprestado azul e laranja, e
 * quem não distingue os dois fica sem informação se a cor for o único canal.
 */

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/utils";

const badgeVariants = cva(
  "cn-badge group/badge inline-flex w-fit shrink-0 items-center justify-center overflow-hidden whitespace-nowrap aria-invalid:border-danger [&>svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "cn-badge-variant-default",
        secondary: "cn-badge-variant-secondary",
        destructive: "cn-badge-variant-destructive",
        outline: "cn-badge-variant-outline",
        ghost: "cn-badge-variant-ghost",
        link: "cn-badge-variant-link",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}

export { Badge, badgeVariants };
