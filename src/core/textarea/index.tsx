import * as React from "react"

import { cn } from "../../lib/cn"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  focusColor?: string
  /** Mostra "N / máx caracteres" abaixo do campo. Só aparece com `maxLength`. */
  showCount?: boolean
  /** Rótulo da unidade do contador (i18n). */
  countLabel?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, focusColor, showCount, countLabel = "caracteres", ...props }, ref) => {
    const countId = React.useId()
    const [typed, setTyped] = React.useState(String(props.defaultValue ?? "").length)
    const field = (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-sm border border-hw-field-border/80 bg-hw-field px-3 py-2 text-sm ring-offset-background placeholder:text-hw-field-placeholder focus-visible:outline-none focus-visible:border-primary-ink focus-visible:ring-1 focus-visible:ring-primary-ink disabled:cursor-not-allowed disabled:opacity-50",
          focusColor && `focus-visible:border-${focusColor} focus-visible:ring-${focusColor}`,
          className,
        )}
        ref={ref}
        {...props}
        {...(showCount && props.maxLength != null
          ? {
              "aria-describedby": cn(props["aria-describedby"], countId),
              onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => {
                setTyped(e.target.value.length)
                props.onChange?.(e)
              },
            }
          : {})}
      />
    )
    if (!showCount || props.maxLength == null) return field
    const count = props.value != null ? String(props.value).length : typed
    const fmt = (n: number) => n.toLocaleString("pt-BR")
    return (
      <div className="w-full space-y-1">
        {field}
        {/* sem aria-live: o leitor lê o contador pelo aria-describedby, não a cada tecla */}
        <p id={countId} className="text-right text-sm text-muted-foreground">
          {fmt(count)} / {fmt(props.maxLength)} {countLabel}
        </p>
      </div>
    )
  },
)
Textarea.displayName = "Textarea"

export { Textarea }
