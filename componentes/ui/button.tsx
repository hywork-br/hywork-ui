/**
 * Button — shadcn-ui/ui @ ee628d75, variante `base` (Base UI).
 *
 * Mudou em relação ao upstream:
 * - caminho do `cn`;
 * - `transition-all` removido: é utility, e utility vence a camada
 *   `components` na cascata do v4 — ele sobrescreveria a transição por token
 *   da folha e levaria junto o tratamento de prefers-reduced-motion, que é a
 *   única coisa aqui que atende a uma preferência de acessibilidade;
 * - tamanhos `xs`, `lg`, `icon-xs` e `icon-lg` removidos: a camada de
 *   superfície declara duas alturas de controle, e inventar as outras duas
 *   produziria no admin um botão de 24px contra um --hw-target-min de 32px.
 *   Voltam quando a superfície declarar as alturas.
 *
 * O LAYOUT fica aqui e o VISUAL na folha, que é o contrato do upstream — é o
 * que mantém este arquivo colável de volta contra shadcn-ui/ui num rebase.
 */

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/utils";

const buttonVariants = cva(
  "cn-button group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "cn-button-variant-default",
        outline: "cn-button-variant-outline",
        secondary: "cn-button-variant-secondary",
        ghost: "cn-button-variant-ghost",
        destructive: "cn-button-variant-destructive",
        link: "cn-button-variant-link",
      },
      size: {
        default: "cn-button-size-default",
        sm: "cn-button-size-sm",
        icon: "cn-button-size-icon",
        "icon-sm": "cn-button-size-icon-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
