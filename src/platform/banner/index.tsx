import * as React from "react";

import { cn } from "../../lib/cn";

/**
 * Faixa de destaque no topo de uma tela ou seção: ícone · título e selo ·
 * uma frase · até duas ações.
 *
 * Nasceu na HyStore (16/10/2026, pedido do Vitor: "um banner mais chamativo,
 * com contraste, ao contrário: em vez de branco, o secundário"). O convite
 * para o módulo People era uma caixa branca igual aos cards e sumia entre
 * eles.
 *
 * `tone="vendor"` é a voz da Hywork: fundo `vendor-strong` (a secundária do
 * guideline, um tom abaixo para o texto branco de 14px passar 4.5:1) e texto
 * `vendor-foreground`. Não segue a marca do workspace. As ações vão em
 * `Button variant="inverse"` e `"inverse-outline"`.
 *
 * `tone="default"` é a mesma anatomia na moldura do card (raio 12, borda de
 * 1px, sem sombra), para o destaque que não é da Hywork.
 *
 * Responsivo por conta própria: as ações descem para baixo do texto quando
 * não cabem. Abaixo de 640px, o ícone sobe para cima do título (ao lado, ele
 * espremia a frase numa coluna de 170px em 320px) e as ações ocupam a largura,
 * com alvo de 44px e rótulo que quebra linha em vez de vazar.
 */
export interface BannerProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title: React.ReactNode;
  /** Uma frase: o que é e o que acontece ao agir. */
  description?: React.ReactNode;
  /** Ícone decorativo, num quadrado de 48px. */
  media?: React.ReactNode;
  /** Selo ao lado do título, normalmente um Badge. */
  status?: React.ReactNode;
  /** Até duas ações. */
  actions?: React.ReactNode;
  /** `vendor`: a voz da Hywork, invertida. `default`: a moldura do card. */
  tone?: "default" | "vendor";
  /** Nível do heading do título. */
  titleAs?: "h2" | "h3";
}

const Banner = React.forwardRef<HTMLElement, BannerProps>(
  (
    {
      title,
      description,
      media,
      status,
      actions,
      tone = "default",
      titleAs: Title = "h2",
      className,
      ...props
    },
    ref,
  ) => {
    const titleId = React.useId();
    const vendor = tone === "vendor";

    return (
      <section
        ref={ref}
        aria-labelledby={titleId}
        className={cn(
          "flex flex-wrap items-center gap-x-6 gap-y-4 rounded-lg p-5 sm:p-6",
          vendor
            ? "bg-vendor-strong text-vendor-foreground"
            : "border border-border bg-card text-card-foreground",
          className,
        )}
        {...props}
      >
        <div className="flex min-w-0 flex-1 basis-80 flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          {media && (
            <div
              aria-hidden="true"
              className={cn(
                "grid h-12 w-12 shrink-0 place-items-center rounded-md [&>svg]:h-6 [&>svg]:w-6",
                vendor ? "bg-vendor-foreground/15" : "bg-primary/10 text-primary-ink",
              )}
            >
              {media}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Title id={titleId} className="text-lg font-semibold">
                {title}
              </Title>
              {status}
            </div>
            {description && (
              <p className={cn("mt-1 max-w-3xl text-sm", !vendor && "text-muted-foreground")}>
                {description}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2 max-sm:w-full max-sm:[&>*]:h-auto max-sm:[&>*]:min-h-11 max-sm:[&>*]:w-full max-sm:[&>*]:whitespace-normal">
            {actions}
          </div>
        )}
      </section>
    );
  },
);
Banner.displayName = "Banner";

export { Banner };
