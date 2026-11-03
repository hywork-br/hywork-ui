// components/ui/tabs.tsx
"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "../../lib/cn";

/*
 * Duas orientações, pelo `orientation` do Radix:
 *
 * - horizontal (padrão) — a decisão da PO, "Abas · sublinhado". As classes
 *   sem prefixo são as de sempre; o que a horizontal precisa para rolar quando
 *   as abas não cabem (HCK-258) vive sob `data-[orientation=horizontal]:`.
 * - vertical (HCK-308, perfil da pessoa do DHO) — a lista vira uma coluna de
 *   240px à esquerda e o conteúdo fica à direita; abaixo de 768px a lista vem
 *   acima do conteúdo. Proposta: o visual aguarda o aval da PO.
 *
 * O Radix escreve `data-orientation` na raiz, na lista, em cada aba e no
 * conteúdo. Todo estilo da vertical vive sob `data-[orientation=vertical]:`,
 * e todo estilo novo da horizontal sob `data-[orientation=horizontal]:`, então
 * uma não mexe na outra — e uma aba horizontal dentro do
 * conteúdo de uma vertical continua horizontal, porque cada parte lê o próprio
 * atributo.
 */

// Raiz: coluna (lista em cima) em tela estreita; a partir de 768px, a lista à
// esquerda em 240px e o conteúdo no resto. `items-start` deixa a lista na
// altura dela — o consumidor pode fixá-la com `sticky` sem que ela estique.
const verticalRoot =
  "data-[orientation=vertical]:flex data-[orientation=vertical]:flex-col data-[orientation=vertical]:gap-4 md:data-[orientation=vertical]:grid md:data-[orientation=vertical]:grid-cols-[15rem_minmax(0,1fr)] md:data-[orientation=vertical]:items-start md:data-[orientation=vertical]:gap-8";

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Root ref={ref} className={cn(verticalRoot, className)} {...props} />
));
Tabs.displayName = TabsPrimitive.Root.displayName;

// Lista horizontal quando as abas não cabem (HCK-258, 03/11/2026). Cada coluna
// é uma parte igual da linha, mas nunca mais estreita que o próprio rótulo
// (`minmax(max-content,1fr)`): quando todas cabem, nada muda; quando não cabem,
// a lista rola na horizontal em vez de sobrepor os rótulos — antes era
// `auto-cols-fr` (`minmax(0,1fr)`), que espremia a coluna abaixo do texto.
//
// A barra de rolagem fica escondida, para não roubar altura dos 48px. Uma
// lista que rola recorta o que passa da própria caixa de conteúdo, e a borda
// fica fora dela: o indicador de 2px da aba ativa, que cobre a borda de 1px
// (`-mb-px`), perderia a linha de baixo. Por isso a borda inferior de 1px é
// desenhada por dentro (`shadow-[inset…]`, na mesma cor `--border`) — o mesmo
// pixel, agora dentro da área que a rolagem mostra, e fixo enquanto o conteúdo
// rola. Tudo sob `data-[orientation=horizontal]:`, para a vertical não mudar.
const horizontalList =
  "data-[orientation=horizontal]:auto-cols-[minmax(max-content,1fr)] data-[orientation=horizontal]:overflow-x-auto data-[orientation=horizontal]:overflow-y-hidden data-[orientation=horizontal]:shadow-[inset_0_-1px_0_hsl(var(--border))] data-[orientation=horizontal]:[scrollbar-width:none] data-[orientation=horizontal]:[&::-webkit-scrollbar]:hidden";

// Lista vertical: uma linha por aba, 4px entre elas, sem a borda inferior.
const verticalList =
  "data-[orientation=vertical]:flex data-[orientation=vertical]:h-auto data-[orientation=vertical]:flex-col data-[orientation=vertical]:gap-1 data-[orientation=vertical]:border-b-0";

// Traz uma aba inteira para a parte visível da lista horizontal que rola, com a
// rolagem mínima (até a borda mais próxima), pelo `scrollLeft` da própria lista:
// `scrollIntoView` rolaria também a página na vertical. Sem efeito quando tudo
// cabe ou na vertical. Meio pixel de folga, para não rolar por arredondamento.
function revealTab(list: HTMLElement, tab: HTMLElement) {
  if (list.getAttribute("data-orientation") !== "horizontal") return;
  if (list.scrollWidth <= list.clientWidth) return;
  const visible = list.getBoundingClientRect();
  const box = tab.getBoundingClientRect();
  const before = box.left - visible.left;
  const after = box.right - visible.right;
  if (before < -0.5) list.scrollLeft += Math.floor(before);
  // mais larga que a lista: alinha pelo começo do rótulo
  else if (after > 0.5) list.scrollLeft += after < before ? Math.ceil(after) : Math.floor(before);
}

// No quadro seguinte: a aba recém-ativada fica em peso 600, mais larga, e as
// colunas mudam de largura depois da troca.
function nextFrame(callback: () => void) {
  if (typeof requestAnimationFrame !== "function") {
    const timer = setTimeout(callback, 0);
    return () => clearTimeout(timer);
  }
  const frame = requestAnimationFrame(callback);
  return () => cancelAnimationFrame(frame);
}

// A aba focada (setas, Home, End, Tab ou clique) entra inteira na vista. O
// navegador só rola o foco até uma aba que está toda fora da vista: a que está
// pela metade continuaria cortada, com o anel de foco e o indicador junto. Vale
// também com `activationMode="manual"`, em que o foco anda sem ativar.
function revealFocusedTab(event: React.FocusEvent<HTMLDivElement>) {
  const list = event.currentTarget;
  const tab = event.target;
  if (tab !== list) nextFrame(() => revealTab(list, tab));
}

// A aba ativa entra inteira na vista ao montar e sempre que a ativa muda — por
// clique, por teclado ou por `value` controlado de fora (`?aba=` na URL). O
// Radix marca a ativa com `data-state="active"`: a lista observa esse atributo
// nas abas. Observa também o tamanho da ativa, que muda depois da troca (peso
// 600) e quando a fonte termina de carregar, para ela não ficar cortada por
// uma medida antiga. A rolagem feita à mão pela pessoa fica como está.
function useRevealActiveTab(listRef: React.RefObject<HTMLDivElement | null>) {
  React.useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const active = () => list.querySelector<HTMLElement>('[role="tab"][data-state="active"]');
    let cancel = () => {};
    const reveal = () => {
      cancel();
      cancel = nextFrame(() => {
        const tab = active();
        if (tab) revealTab(list, tab);
      });
    };
    const resize = typeof ResizeObserver === "function" ? new ResizeObserver(reveal) : null;
    let watched: HTMLElement | null = null;
    const watch = () => {
      const tab = active();
      if (tab === watched) return;
      if (watched) resize?.unobserve(watched);
      watched = tab;
      if (tab) resize?.observe(tab);
    };
    const changes = new MutationObserver(() => {
      watch();
      reveal();
    });
    changes.observe(list, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-state"] });
    watch();
    reveal();
    return () => {
      cancel();
      changes.disconnect();
      resize?.disconnect();
    };
  }, [listRef]);
}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, onFocus, ...props }, ref) => {
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const setRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      listRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );
  useRevealActiveTab(listRef);
  return (
    <TabsPrimitive.List
      ref={setRef}
      onFocus={(event) => {
        onFocus?.(event);
        revealFocusedTab(event);
      }}
      className={cn(
        // Decisão da PO (Catálogo de Divergências, Abas · Opção B — sublinhado):
        // `grid h-12 rounded-none border-b bg-transparent p-0`. As abas dividem a
        // largura em partes iguais; a lista ocupa a linha inteira. A borda
        // inferior e as colunas estão em `horizontalList`.
        "grid h-12 w-full grid-flow-col items-stretch rounded-none bg-transparent p-0 text-muted-foreground",
        horizontalList,
        verticalList,
        className
      )}
      {...props}
    />
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

// Aba horizontal: o anel de foco (a folga de 2px e o anel de 2px de sempre)
// fica por dentro da aba. Por fora, a lista que rola o recortaria em cima,
// embaixo e nas pontas.
const horizontalTrigger = "data-[orientation=horizontal]:focus-visible:ring-inset";

// Aba vertical: linha da largura da coluna, 44px de alvo, texto à esquerda e o
// que vier depois do rótulo (um `Badge` de contagem) empurrado para a direita
// — com um filho só, `justify-between` o deixa no começo. Rótulo longo quebra
// em vez de alargar a coluna. Inativa como na horizontal (esmaecida, peso
// normal) e com fundo `muted` no cursor; ativa com o par suave da marca
// (`primary-soft`, texto calculado com 4.5:1 sobre ele) e o peso 600 de sempre.
const verticalTrigger =
  "data-[orientation=vertical]:mb-0 data-[orientation=vertical]:flex data-[orientation=vertical]:h-auto data-[orientation=vertical]:min-h-11 data-[orientation=vertical]:w-full data-[orientation=vertical]:justify-between data-[orientation=vertical]:gap-2 data-[orientation=vertical]:whitespace-normal data-[orientation=vertical]:rounded-sm data-[orientation=vertical]:border-b-0 data-[orientation=vertical]:px-4 data-[orientation=vertical]:py-2.5 data-[orientation=vertical]:text-left data-[state=inactive]:data-[orientation=vertical]:hover:bg-muted data-[state=active]:data-[orientation=vertical]:bg-primary-soft data-[state=active]:data-[orientation=vertical]:text-primary-soft-foreground";

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      // Inativa em cor esmaecida e peso normal; ativa na cor primária, peso 600,
      // com indicador de 2px na primária. "Primária" é a marca do workspace na
      // versão legível sobre o fundo (--primary-ink): igual à marca quando ela
      // já tem 4.5:1 sobre o branco, escurecida quando não tem — uma marca
      // amarela não pode virar uma aba ilegível.
      "relative -mb-px inline-flex h-12 items-center justify-center whitespace-nowrap rounded-none border-b-2 border-transparent bg-transparent px-3 text-sm font-normal text-muted-foreground ring-offset-background transition-colors motion-reduce:!transition-none hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-primary-ink data-[state=active]:font-semibold data-[state=active]:text-primary-ink data-[state=active]:shadow-none",
      horizontalTrigger,
      verticalTrigger,
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

// Conteúdo vertical: sem a margem de cima da horizontal (o vão é da raiz) e
// sem largura mínima de conteúdo, para uma tabela larga rolar dentro da coluna
// em vez de empurrar a grade.
const verticalContent = "data-[orientation=vertical]:mt-0 data-[orientation=vertical]:min-w-0";

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      verticalContent,
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
