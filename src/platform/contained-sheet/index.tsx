"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "../../lib/cn";
import { Button } from "../../core/button";

/**
 * Painel contido — abre dentro de um elemento da tela, não sobre a página.
 *
 * O `Sheet` do core vai num portal no `<body>` e cobre a tela inteira; no editor
 * do Page Builder, cobre o editor. Este renderiza no lugar onde está, preso ao
 * primeiro ancestral posicionado (`relative`) — o elemento. Mesmo Radix Dialog
 * por baixo, com outra anatomia, por isso é outro componente: o `Sheet` não muda.
 *
 * `side="right"` (padrão): ocupa a altura do elemento, à direita, com até 480px
 * (a tela estreita por `className`, como `w-[min(440px,92%)]`). Não é modal e não
 * escurece nada: o resto do elemento segue visível e clicável, e clicar ou focar
 * nele não fecha o painel.
 *
 * `side="bottom"`: sobe do pé, com alça no topo, até 88% do elemento e da tela.
 * É modal: escurece só o elemento, prende o foco, e clicar no fundo escurecido
 * fecha. Fica preso ao pé da tela enquanto o elemento está à vista, ainda que
 * ele seja mais alto que ela — por isso nenhum ancestral pode ter
 * `overflow: hidden` entre o elemento e a rolagem da página.
 *
 * Fecha pelo botão (`closeLabel`), por Esc e por `onOpenChange(false)`. Ao
 * abrir, o foco vai ao botão de fechar; ao fechar, volta para onde estava antes,
 * a menos que a tela já o tenha levado a outro lugar. Esc numa busca com
 * sugestões abertas (`role="combobox"` com `aria-expanded="true"`) é da busca.
 *
 * O título vem da tela, com o `SheetTitle` do core. O corpo também: para rolar
 * por dentro, ele leva `flex-1 overflow-auto` (o painel é uma coluna).
 *
 * Referência de estrutura: o painel da pessoa e a folha de filtros do protótipo
 * do organograma (HCK-435). O visual é proposta, aguardando o aval da PO.
 */
export interface ContainedSheetProps
  extends Omit<React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>, "forceMount"> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** De onde o painel sai (padrão `right`). `bottom` é a forma do celular. */
  side?: "right" | "bottom";
  /** Nome acessível do botão de fechar (padrão "Fechar"). */
  closeLabel?: string;
}

const ContainedSheet = React.forwardRef<HTMLDivElement, ContainedSheetProps>(
  (
    {
      open,
      onOpenChange,
      side = "right",
      closeLabel = "Fechar",
      className,
      children,
      onOpenAutoFocus,
      onCloseAutoFocus,
      onEscapeKeyDown,
      onInteractOutside,
      ...props
    },
    ref,
  ) => {
    const bottom = side === "bottom";
    const returnTo = React.useRef<Element | null>(null);

    return (
      <DialogPrimitive.Root open={open} onOpenChange={onOpenChange} modal={bottom}>
        {open ? (
          <div className={cn("pointer-events-none absolute inset-0 z-40", bottom && "flex flex-col justify-end")}>
            {/* O Radix só desenha o fundo quando é modal: ao lado, nada escurece. */}
            <DialogPrimitive.Overlay className="absolute inset-0 bg-hw-overlay/80 animate-in fade-in-0 motion-reduce:!animate-none" />
            <DialogPrimitive.Content
              ref={ref}
              data-side={side}
              aria-modal={bottom || undefined}
              className={cn(
                "pointer-events-auto flex flex-col overflow-hidden border-border bg-background text-foreground shadow-lg outline-none animate-in fade-in-0 duration-200 motion-reduce:!animate-none",
                bottom
                  ? "sticky bottom-0 max-h-[min(88%,88vh)] w-full rounded-t-xl border-t slide-in-from-bottom-8"
                  : "absolute inset-y-0 right-0 w-[min(480px,100%)] border-l slide-in-from-right-6",
                className,
              )}
              onOpenAutoFocus={(event) => {
                returnTo.current = document.activeElement;
                onOpenAutoFocus?.(event);
              }}
              onCloseAutoFocus={(event) => {
                onCloseAutoFocus?.(event);
                if (event.defaultPrevented) return;
                event.preventDefault();
                // Sem gatilho do Radix (o painel abre por estado): o foco volta para onde estava.
                const target = returnTo.current;
                const lost = !document.activeElement || document.activeElement === document.body;
                if (lost && target instanceof HTMLElement && target.isConnected) target.focus({ preventScroll: true });
              }}
              onEscapeKeyDown={(event) => {
                onEscapeKeyDown?.(event);
                const target = event.target instanceof Element ? event.target : null;
                if (target?.closest('[role="combobox"][aria-expanded="true"]')) event.preventDefault();
              }}
              onInteractOutside={(event) => {
                onInteractOutside?.(event);
                if (!bottom) event.preventDefault();
              }}
              {...props}
            >
              {bottom ? (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-2 z-10 h-1 w-10 -translate-x-1/2 rounded-full bg-muted-foreground/30"
                />
              ) : null}
              <DialogPrimitive.Close asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={closeLabel}
                  className={cn("absolute z-10 bg-background/90", bottom ? "right-3 top-4 h-11 w-11" : "right-2.5 top-2.5")}
                >
                  <X className="h-[18px] w-[18px]" aria-hidden="true" />
                </Button>
              </DialogPrimitive.Close>
              {children}
            </DialogPrimitive.Content>
          </div>
        ) : null}
      </DialogPrimitive.Root>
    );
  },
);
ContainedSheet.displayName = "ContainedSheet";

export { ContainedSheet };
