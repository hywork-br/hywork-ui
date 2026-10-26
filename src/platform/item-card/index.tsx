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
 *
 * Duas formas sobre a mesma anatomia (`orientation`):
 *
 * - **horizontal** (padrão) — mídia à esquerda do título, estado ao lado dele.
 * - **vertical** (HCK-308, lista de Pessoas do DHO) — tudo centralizado numa
 *   coluna: a mídia em cima, num quadro de 108px que um `Avatar` preenche; o
 *   título numa linha, cortado com reticências; a descrição; o estado numa
 *   linha própria; o conteúdo próprio; e as ações em largura total, presas ao
 *   pé do card, para ficarem alinhadas numa fileira da grade. Mesma moldura da
 *   decisão da PO. O visual aguarda o aval da PO.
 *
 * O card não sabe o que mostra: mídia, título, descrição, estado, conteúdo e
 * ações chegam prontos da tela.
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
  /** `horizontal` (padrão): mídia à esquerda. `vertical`: coluna centralizada, para grade de cards. */
  orientation?: "horizontal" | "vertical";
}

// Moldura e alvo clicável, comuns às duas formas.
const frame = "relative rounded-lg border border-border bg-card p-6 text-card-foreground";
const clickable =
  "cursor-pointer transition-colors motion-reduce:!transition-none hover:bg-accent/40 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2";

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
      orientation = "horizontal",
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

    if (orientation === "vertical") {
      return (
        <Container
          ref={ref}
          data-orientation="vertical"
          className={cn(frame, clicavel && clickable, "flex flex-col items-center gap-3.5 text-center", className)}
          {...props}
        >
          {media && (
            // Quadro de 108px: o filho direto (um Avatar) o preenche. As
            // iniciais do fallback herdam o tamanho e a cor daqui.
            <div className="flex h-[108px] w-[108px] shrink-0 items-center justify-center text-2xl font-semibold text-muted-foreground [&>*]:h-full [&>*]:w-full">
              {media}
            </div>
          )}

          <div className="flex w-full min-w-0 flex-col gap-1">
            <Title className="w-full truncate text-base font-semibold">
              {clicavel ? (
                <button
                  type="button"
                  onClick={onOpen}
                  className="max-w-full truncate outline-none after:absolute after:inset-0 after:content-['']"
                >
                  {title}
                </button>
              ) : (
                title
              )}
            </Title>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>

          {status && <div className="flex max-w-full flex-wrap justify-center gap-2">{status}</div>}

          {children && <div className="w-full">{children}</div>}

          {actions && (
            // `mt-auto` prende as ações ao pé: numa fileira da grade os cards
            // esticam até a mesma altura, e os botões se alinham.
            <div className="relative z-10 mt-auto flex w-full flex-col gap-2 [&>*]:w-full">{actions}</div>
          )}
        </Container>
      );
    }

    return (
      <Container
        ref={ref}
        className={cn(frame, clicavel && clickable, className)}
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
