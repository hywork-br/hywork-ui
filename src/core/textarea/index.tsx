import * as React from "react"

import { cn } from "../../lib/cn"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  focusColor?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, focusColor, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-sm border border-hw-field-border/80 bg-hw-field px-3 py-2 text-sm ring-offset-background placeholder:text-hw-field-placeholder focus-visible:outline-none focus-visible:border-primary-ink focus-visible:ring-1 focus-visible:ring-primary-ink disabled:cursor-not-allowed disabled:opacity-50",
        focusColor && `focus-visible:border-${focusColor} focus-visible:ring-${focusColor}`,
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
