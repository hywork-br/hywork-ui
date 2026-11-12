"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import { RadioGroupItem } from "../../core/radio-group";

type RadioGroupItemProps = React.ComponentPropsWithoutRef<typeof RadioGroupItem>;

export interface ChoiceCardProps extends Omit<RadioGroupItemProps, "title" | "children"> {
  /** Nome da opção. Aceita nó para um selo ao lado do nome. */
  title: React.ReactNode;
  /** Uma ou duas frases sobre a opção, em `muted-foreground`. */
  description?: React.ReactNode;
  /** Linha extra abaixo da descrição: resumo em texto ou um `Badge`. Sem link nem botão. */
  meta?: React.ReactNode;
  /** Texto curto à direita, em uma linha ("Em 2 trilhas"). */
  aside?: React.ReactNode;
  /** Ícone de 20px num quadrado de 40px, entre o rádio e o texto. */
  icon?: React.ReactNode;
}

/**
 * Cartão de escolha: uma opção de `RadioGroup` com o cartão inteiro como alvo.
 * Marcado, desabilitado e foco vêm do rádio por `has-[…]`, então valem também
 * para o grupo inteiro desabilitado. `className` vai para o cartão; o resto,
 * para o rádio. Proposta (HCK-390), aguardando o aval visual da PO.
 */
const ChoiceCard = React.forwardRef<React.ElementRef<typeof RadioGroupItem>, ChoiceCardProps>(
  ({ title, description, meta, aside, icon, className, ...props }, ref) => {
    const id = React.useId();
    const describedBy = [
      description != null && `${id}-description`,
      meta != null && `${id}-meta`,
      aside != null && `${id}-aside`,
      props["aria-describedby"],
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <label
        className={cn(
          "flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card p-4 text-left text-card-foreground ring-offset-background transition-colors motion-reduce:transition-none",
          "[&:hover:not(:has([data-state=checked],[data-disabled]))]:bg-accent/40",
          "has-[[data-state=checked]]:border-primary-ink has-[[data-state=checked]]:bg-primary/5",
          "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2",
          "has-[[data-disabled]]:cursor-not-allowed has-[[data-disabled]]:opacity-60",
          className,
        )}
      >
        <RadioGroupItem
          ref={ref}
          // O nome é o título; quem passa aria-label (para desambiguar) fica com ele.
          aria-labelledby={props["aria-label"] ? undefined : `${id}-title`}
          {...props}
          aria-describedby={describedBy || undefined}
          // O cartão mostra o foco e o esmaecido: o rádio não repete.
          className="mt-0.5 shrink-0 focus-visible:ring-0 disabled:opacity-100"
        />
        {icon != null && (
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-primary-ink [&_svg]:h-5 [&_svg]:w-5"
          >
            {icon}
          </span>
        )}
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span id={`${id}-title`} className="break-words text-sm font-semibold text-foreground">
            {title}
          </span>
          {description != null && (
            <span id={`${id}-description`} className="text-sm text-muted-foreground">
              {description}
            </span>
          )}
          {meta != null && (
            <span id={`${id}-meta`} className="text-sm text-foreground">
              {meta}
            </span>
          )}
        </span>
        {aside != null && (
          // shortcut: aside fica em uma linha ao lado do texto; texto longo aqui aperta o título em 320px — se aparecer, desça-o para baixo do texto no estreito.
          <span id={`${id}-aside`} className="shrink-0 whitespace-nowrap text-xs text-muted-foreground">
            {aside}
          </span>
        )}
      </label>
    );
  },
);
ChoiceCard.displayName = "ChoiceCard";

export { ChoiceCard };
