"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { cn } from "../../lib/cn"
import { DotFilledIcon } from "@radix-ui/react-icons"

// Setas mudam E marcam (WAI-ARIA). O Radix move o foco num setTimeout e só
// marca se a tecla ainda estiver apertada quando o foco chega: a tecla rápida
// movia sem marcar. Depois desse timeout, clica o rádio que ficou com o foco —
// o clique passa pelo Radix, então onValueChange dispara também no grupo não
// controlado. Nada acontece se o foco não andou ou se o rádio já está marcado.
const ARROW_KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]

function checkFocusedRadioAfterArrow(event: React.KeyboardEvent<HTMLDivElement>) {
  if (!ARROW_KEYS.includes(event.key)) return
  const group = event.currentTarget
  const origin = document.activeElement
  setTimeout(() => {
    const focused = document.activeElement
    if (!(focused instanceof HTMLButtonElement) || focused === origin) return
    if (!group.contains(focused) || focused.getAttribute("role") !== "radio") return
    if (focused.getAttribute("aria-checked") === "true" || focused.disabled) return
    focused.click()
  })
}

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, onKeyDown, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        checkFocusedRadioAfterArrow(event)
      }}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary-ink text-primary-ink shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <DotFilledIcon className="h-3.5 w-3.5 fill-primary-ink" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
