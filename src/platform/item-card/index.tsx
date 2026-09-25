"use client";

import * as React from "react";

import { cn } from "../../lib/cn";

/**
 * Card de item de listagem.
 *
 * Decisão da PO (23/09/2026): raio 12, respiro interno 24, borda de 1px e
 * **sem sombra** — sombra fica reservada a sobreposições, não a estrutura.
 *
 * Substitui as 21 implementações do Platform, que variavam o raio de 8 a 24px
 * e o respiro de 12 a 24px, com nove delas montando a moldura à mão.
 *
 * A anatomia é fixa: mídia · título · metadados · ações. O que não couber nela
 * entra como `children`, abaixo dos metadados.
 */
// `title` do HTML é string; aqui ele é conteúdo renderizável, então o
// atributo nativo sai da herança.
export interface ItemCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  /** Uma linha de apoio — data, autor, contagem. */
  description?: React.ReactNode;
  /** Avatar, ícone ou miniatura à esquerda do título. */
  media?: React.ReactNode;
  /** Indicador de estado, normalmente um Badge, ao lado do título. */
  status?: React.ReactNode;
  /** Ações do item, no rodapé do card. */
  actions?: React.ReactNode;
  /** Torna o card inteiro clicável. */
  onOpen?: () => void;
  /** Nível do heading do título. */
  titleAs?: "h2" | "h3" | "h4";
  /** Elemento do container. `article` quando o card é um item de listagem. */
  as?: "div" | "article" | "li";
}

const ItemCard = React.forwardRef<HTMLDivElement, ItemCardProps>(
  (
    {
      title,
      description,
      media,
      status,
      actions,
      onOpen,
      titleAs: Title = "h3",
      as = "div",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const clicavel = typeof onOpen === "function";
    // O container é escolhido em tempo de uso. Como div, article e li têm
    // tipos de props e de ref diferentes, a checagem cede num ponto só.
    const Container = as as React.ElementType;

    return (
      <Container
        ref={ref}
        className={cn(
          "relative rounded-lg border border-border bg-card p-6 text-card-foreground",
          clicavel &&
            "cursor-pointer transition-colors motion-reduce:!transition-none hover:bg-accent/40 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          className,
        )}
        {...props}
      >
        <div className="flex items-start gap-3">
          {media && <div className="shrink-0">{media}</div>}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Title className="min-w-0 truncate text-base font-semibold">
                {clicavel ? (
                  <button
                    type="button"
                    onClick={onOpen}
                    className="text-left outline-none after:absolute after:inset-0 after:content-['']"
                  >
                    {title}
                  </button>
                ) : (
                  title
                )}
              </Title>
              {status}
            </div>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>

        {children && <div className="mt-4">{children}</div>}

        {actions && (
          <div className="relative z-10 mt-4 flex flex-wrap items-center gap-2">{actions}</div>
        )}
      </Container>
    );
  },
);
ItemCard.displayName = "ItemCard";

export { ItemCard };
