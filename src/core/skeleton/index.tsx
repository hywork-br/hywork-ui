import { cn } from "../../lib/cn"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      // Decisão da PO (23/09/2026): pulso em cinza neutro. O `bg-primary/10`
      // anterior tingia o esqueleto com a cor de marca do tenant, o que
      // variava a percepção de carregamento entre clientes.
      className={cn("animate-pulse motion-reduce:!animate-none rounded bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
