import * as React from "react";
import { X } from "lucide-react";

import { cn } from "../../lib/cn";

/**
 * Card de convite em pé: ícone e rótulo · título · uma frase · ação no pé.
 *
 * Nasceu na home nova do admin (16/10/2026, pedido do Vitor: "seja um
 * carrossel lateral, ou seja ali na lateral do menu"): a coluna "Descubra"
 * mostra um convite por vez (produto, HyTalks, blog, serviço) e o pé do menu
 * leva o convite do módulo que a pessoa ainda não tem.
 *
 * O `Banner` deita a anatomia (ícone ao lado do texto, ações à direita) e, numa
 * coluna de 250px, espreme a frase; o `ItemCard` corta o título numa linha. Aqui
 * tudo empilha, o título quebra linha e a ação ocupa a largura, alinhada no pé:
 * num carrossel, os botões ficam na mesma altura de um card para o outro.
 *
 * `tone="vendor"` é a voz da Hywork, como no `Banner`: fundo `vendor-strong`,
 * texto branco, ações em `Button variant="inverse"`. `tone="default"` é a
 * moldura do card (raio 12, borda de 1px, sem sombra).
 *
 * `size="compact"` é para o pé do menu lateral (16rem): respiro de 16px e
 * ícone de 32px. `onDismiss` põe um X no canto, com alvo de 40px.
 */
export interface PromoCardProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title: React.ReactNode;
  /** Uma ou duas frases: o que é e por que olhar agora. */
  description?: React.ReactNode;
  /** Ícone decorativo, num quadrado de 40px (32px no compacto). */
  media?: React.ReactNode;
  /** Rótulo ao lado do ícone: o tipo do convite (Produto, HyTalks, Blog). Texto ou Badge. */
  eyebrow?: React.ReactNode;
  /** Normalmente uma ação; ocupa a largura e fica no pé do card. */
  actions?: React.ReactNode;
  /** `vendor`: a voz da Hywork, invertida. `default`: a moldura do card. */
  tone?: "default" | "vendor";
  /** `compact`: o pé do menu lateral. */
  size?: "default" | "compact";
  /** Nível do heading do título. */
  titleAs?: "h2" | "h3" | "h4";
  /** Mostra o X no canto e é chamado no clique. */
  onDismiss?: () => void;
  /** Nome do X para o leitor de tela. */
  dismissLabel?: string;
}

const PromoCard = React.forwardRef<HTMLElement, PromoCardProps>(
  (
    {
      title,
      description,
      media,
      eyebrow,
      actions,
      tone = "default",
      size = "default",
      titleAs: Title = "h3",
      onDismiss,
      dismissLabel = "Dispensar",
      className,
      ...props
    },
    ref,
  ) => {
    const titleId = React.useId();
    const vendor = tone === "vendor";
    const compact = size === "compact";
    const hasHeader = Boolean(media || eyebrow);

    return (
      <article
        ref={ref}
        aria-labelledby={titleId}
        className={cn(
          "relative flex h-full flex-col rounded-lg",
          compact ? "gap-3 p-4" : "gap-4 p-6",
          vendor
            ? "bg-vendor-strong text-vendor-foreground"
            : "border border-border bg-card text-card-foreground",
          className,
        )}
        {...props}
      >
        {hasHeader && (
          <div className={cn("flex items-center gap-3", onDismiss && "pr-8")}>
            {media && (
              <div
                aria-hidden="true"
                className={cn(
                  "grid shrink-0 place-items-center rounded-md",
                  compact ? "h-8 w-8 [&>svg]:h-4 [&>svg]:w-4" : "h-10 w-10 [&>svg]:h-5 [&>svg]:w-5",
                  vendor ? "bg-vendor-foreground/15" : "bg-primary/10 text-primary-ink",
                )}
              >
                {media}
              </div>
            )}
            {eyebrow && (
              <div
                className={cn("min-w-0 text-xs font-semibold", !vendor && "text-muted-foreground")}
              >
                {eyebrow}
              </div>
            )}
          </div>
        )}

        <div className={cn("flex flex-col gap-1", !hasHeader && onDismiss && "pr-8")}>
          <Title
            id={titleId}
            className={cn("text-balance font-semibold", compact ? "text-sm" : "text-base")}
          >
            {title}
          </Title>
          {description && (
            <p className={cn("text-pretty text-sm", !vendor && "text-muted-foreground")}>
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="mt-auto flex flex-col gap-2 [&>*]:h-auto [&>*]:min-h-10 [&>*]:w-full [&>*]:whitespace-normal max-sm:[&>*]:min-h-11">
            {actions}
          </div>
        )}

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label={dismissLabel}
            className={cn(
              "absolute right-1 top-1 inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors motion-reduce:!transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              vendor
                ? "text-vendor-foreground hover:bg-foreground/10"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </article>
    );
  },
);
PromoCard.displayName = "PromoCard";

export { PromoCard };
