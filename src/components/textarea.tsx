import * as React from "react"

import { cn } from "../lib/cn"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  focusColor?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, focusColor, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-sm border border-slate-300/80 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
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
