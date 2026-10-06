import * as React from "react";
import type * as API from "../../src/core";

/**
 * Only the source-derived primitives (status "source-derived" in
 * manifest.json), with plain HTML around them. An authored primitive — a PO
 * decision, such as the semibold Label or the equal-width Tabs — next to them
 * would move them by fractions of a pixel, and the parity would end up
 * comparing the layout instead of the primitive.
 *
 * `data-parity` names the primitive of each element; the test checks that every
 * derived primitive shows up here.
 */
export function DerivedCatalog({ ui }: { ui: typeof API }) {
  const [volume, setVolume] = React.useState([40]);
  const trigger = "rounded border px-3 py-2 text-sm";

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6" aria-label="Primitivas derivadas">
      <h1 className="text-2xl font-semibold">Primitivas derivadas</h1>

      <section aria-label="Campos" className="grid gap-4 sm:grid-cols-2">
        <ui.Input data-parity="input" aria-label="Nome" placeholder="Nome do documento" />
        <ui.Input data-parity="input" aria-label="Campo indisponível" disabled value="Somente leitura" />
        <ui.Textarea data-parity="textarea" aria-label="Descrição" placeholder="Escreva uma descrição" />
      </section>

      <section aria-label="Seleção" className="flex flex-wrap items-center gap-6">
        <ui.Checkbox data-parity="checkbox" aria-label="Notificar equipe" />
        <ui.Checkbox data-parity="checkbox" aria-label="Arquivar" defaultChecked />
        <ui.Switch data-parity="switch" aria-label="Habilitado" />
        <ui.Switch data-parity="switch" aria-label="Público" defaultChecked />
        <ui.RadioGroup defaultValue="all" aria-label="Destino" className="flex gap-3">
          <ui.RadioGroupItem data-parity="radio-group" value="all" aria-label="Todos" />
          <ui.RadioGroupItem data-parity="radio-group" value="team" aria-label="Equipe" />
        </ui.RadioGroup>
        <div className="w-40">
          <ui.Slider data-parity="slider" aria-label="Volume" value={volume} onValueChange={setVolume} />
        </div>
      </section>

      <ui.Separator data-parity="separator" />

      <section aria-label="Conteúdo" className="flex flex-wrap items-center gap-6">
        <ui.Avatar data-parity="avatar">
          <ui.AvatarFallback>HW</ui.AvatarFallback>
        </ui.Avatar>
        <div className="w-64">
          <ui.Progress data-parity="progress" value={60} aria-label="Progresso" />
        </div>
      </section>

      <section aria-label="Navegação" className="space-y-4">
        <ui.Accordion data-parity="accordion" type="single" collapsible defaultValue="details">
          <ui.AccordionItem value="details">
            <ui.AccordionTrigger>Informações adicionais</ui.AccordionTrigger>
            <ui.AccordionContent>Detalhes do documento.</ui.AccordionContent>
          </ui.AccordionItem>
          <ui.AccordionItem value="history">
            <ui.AccordionTrigger>Histórico</ui.AccordionTrigger>
            <ui.AccordionContent>Versões anteriores.</ui.AccordionContent>
          </ui.AccordionItem>
        </ui.Accordion>
        <ui.Collapsible data-parity="collapsible" defaultOpen>
          <ui.CollapsibleTrigger className={trigger}>Mostrar histórico</ui.CollapsibleTrigger>
          <ui.CollapsibleContent>Versão 1</ui.CollapsibleContent>
        </ui.Collapsible>
        <ui.ScrollArea data-parity="scroll-area" className="h-16 rounded-md border p-3">
          <div className="space-y-3">
            <p>Primeiro registro</p>
            <p>Segundo registro</p>
            <p>Terceiro registro</p>
          </div>
        </ui.ScrollArea>
      </section>

      <section aria-label="Sobreposições" className="flex flex-wrap gap-3">
        {/* Header only: AlertDialogAction and AlertDialogCancel draw with the
            authored Button (buttonVariants), so they follow its decision. */}
        <ui.AlertDialog>
          <ui.AlertDialogTrigger className={trigger}>Confirmar exclusão</ui.AlertDialogTrigger>
          <ui.AlertDialogContent>
            <ui.AlertDialogHeader data-parity="alert-dialog">
              <ui.AlertDialogTitle>Excluir documento?</ui.AlertDialogTitle>
              <ui.AlertDialogDescription>Esta ação remove o documento.</ui.AlertDialogDescription>
            </ui.AlertDialogHeader>
          </ui.AlertDialogContent>
        </ui.AlertDialog>
        <ui.Sheet>
          <ui.SheetTrigger className={trigger}>Abrir painel</ui.SheetTrigger>
          <ui.SheetContent data-parity="sheet">
            <ui.SheetHeader>
              <ui.SheetTitle>Detalhes</ui.SheetTitle>
              <ui.SheetDescription>Informações do documento.</ui.SheetDescription>
            </ui.SheetHeader>
          </ui.SheetContent>
        </ui.Sheet>
        <ui.DropdownMenu>
          <ui.DropdownMenuTrigger className={trigger}>Ações do documento</ui.DropdownMenuTrigger>
          <ui.DropdownMenuContent data-parity="dropdown-menu">
            <ui.DropdownMenuLabel>Documento</ui.DropdownMenuLabel>
            <ui.DropdownMenuItem>Editar</ui.DropdownMenuItem>
            <ui.DropdownMenuSeparator />
            <ui.DropdownMenuItem>Arquivar</ui.DropdownMenuItem>
          </ui.DropdownMenuContent>
        </ui.DropdownMenu>
        <ui.Popover>
          <ui.PopoverTrigger className={trigger}>Mais informações</ui.PopoverTrigger>
          <ui.PopoverContent data-parity="popover">Documento da equipe.</ui.PopoverContent>
        </ui.Popover>
        <ui.TooltipProvider delayDuration={0}>
          <ui.Tooltip>
            <ui.TooltipTrigger className={trigger}>Ajuda</ui.TooltipTrigger>
            <ui.TooltipPortal>
              <ui.TooltipContent data-parity="tooltip">Ajuda sobre documentos</ui.TooltipContent>
            </ui.TooltipPortal>
          </ui.Tooltip>
        </ui.TooltipProvider>
      </section>
    </main>
  );
}
