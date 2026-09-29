"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/cn"

// Decisão da PO (Catálogo de Divergências, Rótulo · Opção B): 14px, peso 600,
// slate-800 (`--hw-text-label`).
// Substitui as 7 combinações em uso, incluindo um hex fixo e uma versão
// em caixa alta.
const labelVariants = cva(
  "text-sm font-semibold leading-none text-hw-label peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
