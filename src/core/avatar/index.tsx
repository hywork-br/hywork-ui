"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "../../lib/cn"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

export type AvatarTone = "primary" | "info" | "success" | "warning" | "danger" | "neutral"

/** Fundo suave e texto no papel: os mesmos pares do quadrado de ícone do StatCard. */
const toneClasses: Record<AvatarTone, string> = {
  primary: "bg-primary/10 text-primary",
  info: "bg-hw-status-info/15 text-hw-status-info",
  success: "bg-hw-status-success-fill/15 text-hw-status-success",
  warning: "bg-warning/15 text-hw-status-warning",
  danger: "bg-hw-status-danger/15 text-hw-status-danger",
  neutral: "bg-muted text-muted-foreground",
}

const seedTones = ["primary", "info", "success", "warning", "danger"] as const

/** Tom estável para um texto (id, nome): o mesmo seed dá sempre a mesma cor. */
function avatarToneFor(seed: string): AvatarTone {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return seedTones[h % seedTones.length]
}

interface AvatarFallbackProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> {
  /** Cor do papel de estado. Sem ele, o fundo neutro de sempre. */
  tone?: AvatarTone
}

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  AvatarFallbackProps
>(({ className, tone, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    data-tone={tone}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full",
      tone ? cn("font-semibold", toneClasses[tone]) : "bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback, avatarToneFor }
export type { AvatarFallbackProps }
