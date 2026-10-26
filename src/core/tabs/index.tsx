// components/ui/tabs.tsx
"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "../../lib/cn";

/*
 * Duas orientações, pelo `orientation` do Radix:
 *
 * - horizontal (padrão) — a decisão da PO, "Abas · sublinhado". As classes
 *   abaixo são as de sempre e não dependem da vertical.
 * - vertical (HCK-308, perfil da pessoa do DHO) — a lista vira uma coluna de
 *   240px à esquerda e o conteúdo fica à direita; abaixo de 768px a lista vem
 *   acima do conteúdo. Proposta: o visual aguarda o aval da PO.
 *
 * O Radix escreve `data-orientation` na raiz, na lista, em cada aba e no
 * conteúdo. Todo estilo da vertical vive sob `data-[orientation=vertical]:`,
 * então a horizontal não muda nem um pixel — e uma aba horizontal dentro do
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

// Lista vertical: uma linha por aba, 4px entre elas, sem a borda inferior.
const verticalList =
  "data-[orientation=vertical]:flex data-[orientation=vertical]:h-auto data-[orientation=vertical]:flex-col data-[orientation=vertical]:gap-1 data-[orientation=vertical]:border-b-0";

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      // Decisão da PO (Catálogo de Divergências, Abas · Opção B — sublinhado):
      // `grid h-12 rounded-none border-b bg-transparent p-0`. As abas dividem a
      // largura em partes iguais; a lista ocupa a linha inteira.
      "grid h-12 w-full auto-cols-fr grid-flow-col items-stretch rounded-none border-b border-border bg-transparent p-0 text-muted-foreground",
      verticalList,
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

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
