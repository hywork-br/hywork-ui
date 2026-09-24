import * as React from "react";
import type * as API from "../src/core";

// Component documentation. Content is shared by source/package parity renders.
export function Catalog({ ui }: { ui: typeof API }) {
  const [tab, setTab] = React.useState("active");
  const [checked, setChecked] = React.useState(false);
  const [volume, setVolume] = React.useState([40]);
  return <main className="mx-auto max-w-5xl space-y-6 p-6" aria-label="Componentes do Platform">
    <h1 className="text-2xl font-semibold">Componentes do Platform</h1>
    <section aria-label="Ações" className="flex flex-wrap items-center gap-3">
      <ui.Button>Salvar</ui.Button>
      <ui.Button variant="secondary">Cancelar</ui.Button>
      <ui.Button variant="outline">Visualizar</ui.Button>
      <ui.Button variant="destructive">Excluir</ui.Button>
      <ui.Button variant="ghost">Mais</ui.Button>
      <ui.Button variant="link">Ver detalhes</ui.Button>
      <ui.Button disabled>Indisponível</ui.Button>
      <ui.Button variant="success">Sucesso</ui.Button>
      <ui.Button variant="warning">Atenção</ui.Button>
      <ui.Button variant="error">Erro</ui.Button>
      <ui.Button variant="info">Informação</ui.Button>
    </section>
    <section aria-label="Campos" className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2"><ui.Label htmlFor="name">Nome</ui.Label><ui.Input id="name" placeholder="Nome do documento" /></div>
      <div className="space-y-2"><ui.Label htmlFor="disabled">Campo indisponível</ui.Label><ui.Input id="disabled" disabled value="Somente leitura" /></div>
      <div className="space-y-2"><ui.Label htmlFor="description">Descrição</ui.Label><ui.Textarea id="description" placeholder="Escreva uma descrição" /></div>
      <div className="space-y-2"><ui.Label htmlFor="state">Status</ui.Label>
        <ui.Select defaultValue="active"><ui.SelectTrigger id="state"><ui.SelectValue /></ui.SelectTrigger>
          <ui.SelectContent><ui.SelectItem value="active">Ativo</ui.SelectItem><ui.SelectItem value="paused">Pausado</ui.SelectItem></ui.SelectContent>
        </ui.Select>
      </div>
    </section>
    <section aria-label="Seleção" className="flex flex-wrap items-center gap-6">
      <div className="flex items-center gap-2"><ui.Checkbox id="notify" checked={checked} onCheckedChange={v=>setChecked(v===true)} /><ui.Label htmlFor="notify">Notificar equipe</ui.Label></div>
      <div className="flex items-center gap-2"><ui.Switch id="enabled" /><ui.Label htmlFor="enabled">Habilitado</ui.Label></div>
      <ui.RadioGroup defaultValue="all" aria-label="Público" className="flex gap-3">
        <div className="flex items-center gap-2"><ui.RadioGroupItem id="all" value="all" /><ui.Label htmlFor="all">Todos</ui.Label></div>
        <div className="flex items-center gap-2"><ui.RadioGroupItem id="team" value="team" /><ui.Label htmlFor="team">Equipe</ui.Label></div>
      </ui.RadioGroup>
      <div className="w-40"><ui.Slider aria-label="Volume" value={volume} onValueChange={setVolume} /></div>
    </section>
    <ui.Separator />
    <section aria-label="Conteúdo" className="grid gap-4 sm:grid-cols-2">
      <ui.Card><ui.CardHeader><ui.CardTitle>Documento</ui.CardTitle><ui.CardDescription>Atualizado hoje</ui.CardDescription></ui.CardHeader><ui.CardContent>
        <div className="flex items-center gap-2"><ui.Avatar><ui.AvatarFallback>HW</ui.AvatarFallback></ui.Avatar><ui.Badge>Publicado</ui.Badge><ui.Badge variant="success">Concluído</ui.Badge></div>
      </ui.CardContent><ui.CardFooter><ui.Button size="sm">Abrir documento</ui.Button></ui.CardFooter></ui.Card>
      <div className="space-y-4"><ui.Alert><ui.AlertTitle>Atualização disponível</ui.AlertTitle><ui.AlertDescription>Revise as alterações antes de continuar.</ui.AlertDescription></ui.Alert><ui.Progress value={60} aria-label="Progresso" /><ui.Skeleton className="h-8 w-full" /></div>
    </section>
    <section aria-label="Tabela"><ui.Table><ui.TableCaption>Documentos da equipe</ui.TableCaption><ui.TableHeader><ui.TableRow><ui.TableHead>Nome</ui.TableHead><ui.TableHead>Status</ui.TableHead></ui.TableRow></ui.TableHeader><ui.TableBody>
      <ui.TableRow><ui.TableCell>Política interna</ui.TableCell><ui.TableCell><ui.Badge>Publicado</ui.Badge></ui.TableCell></ui.TableRow>
      <ui.TableRow><ui.TableCell>Comunicado</ui.TableCell><ui.TableCell>Rascunho</ui.TableCell></ui.TableRow>
    </ui.TableBody></ui.Table></section>
    <section aria-label="Navegação" className="space-y-4">
      <ui.Breadcrumb><ui.BreadcrumbList><ui.BreadcrumbItem><ui.BreadcrumbLink href="#">Início</ui.BreadcrumbLink></ui.BreadcrumbItem><ui.BreadcrumbSeparator /><ui.BreadcrumbItem><ui.BreadcrumbPage>Documentos</ui.BreadcrumbPage></ui.BreadcrumbItem></ui.BreadcrumbList></ui.Breadcrumb>
      <ui.Tabs value={tab} onValueChange={setTab}><ui.TabsList><ui.TabsTrigger value="active">Ativos</ui.TabsTrigger><ui.TabsTrigger value="archived">Arquivados</ui.TabsTrigger></ui.TabsList><ui.TabsContent value="active">Documentos ativos</ui.TabsContent><ui.TabsContent value="archived">Documentos arquivados</ui.TabsContent></ui.Tabs>
      <ui.Accordion type="single" collapsible><ui.AccordionItem value="details"><ui.AccordionTrigger>Informações adicionais</ui.AccordionTrigger><ui.AccordionContent>Detalhes do documento.</ui.AccordionContent></ui.AccordionItem></ui.Accordion>
      <ui.Collapsible><ui.CollapsibleTrigger asChild><ui.Button variant="outline">Mostrar histórico</ui.Button></ui.CollapsibleTrigger><ui.CollapsibleContent>Versão 1</ui.CollapsibleContent></ui.Collapsible>
      <ui.ScrollArea className="h-16 rounded-md border p-3"><div className="space-y-3"><p>Primeiro registro</p><p>Segundo registro</p><p>Terceiro registro</p></div></ui.ScrollArea>
    </section>
    <section aria-label="Sobreposições" className="flex flex-wrap gap-3">
      <ui.Dialog><ui.DialogTrigger asChild><ui.Button>Abrir diálogo</ui.Button></ui.DialogTrigger><ui.DialogContent><ui.DialogHeader><ui.DialogTitle>Editar documento</ui.DialogTitle><ui.DialogDescription>Revise o nome antes de salvar.</ui.DialogDescription></ui.DialogHeader><ui.Label htmlFor="dialog-name">Nome no diálogo</ui.Label><ui.Input id="dialog-name" defaultValue="Política interna" /><ui.DialogFooter><ui.DialogClose asChild><ui.Button>Concluir</ui.Button></ui.DialogClose></ui.DialogFooter></ui.DialogContent></ui.Dialog>
      <ui.AlertDialog><ui.AlertDialogTrigger asChild><ui.Button variant="destructive">Confirmar exclusão</ui.Button></ui.AlertDialogTrigger><ui.AlertDialogContent><ui.AlertDialogHeader><ui.AlertDialogTitle>Excluir documento?</ui.AlertDialogTitle><ui.AlertDialogDescription>Esta ação remove o documento.</ui.AlertDialogDescription></ui.AlertDialogHeader><ui.AlertDialogFooter><ui.AlertDialogCancel>Cancelar</ui.AlertDialogCancel><ui.AlertDialogAction>Excluir</ui.AlertDialogAction></ui.AlertDialogFooter></ui.AlertDialogContent></ui.AlertDialog>
      <ui.Sheet><ui.SheetTrigger asChild><ui.Button variant="outline">Abrir painel</ui.Button></ui.SheetTrigger><ui.SheetContent><ui.SheetHeader><ui.SheetTitle>Detalhes</ui.SheetTitle><ui.SheetDescription>Informações do documento.</ui.SheetDescription></ui.SheetHeader></ui.SheetContent></ui.Sheet>
      <ui.DropdownMenu><ui.DropdownMenuTrigger asChild><ui.Button variant="outline">Ações do documento</ui.Button></ui.DropdownMenuTrigger><ui.DropdownMenuContent><ui.DropdownMenuLabel>Documento</ui.DropdownMenuLabel><ui.DropdownMenuItem>Editar</ui.DropdownMenuItem><ui.DropdownMenuSeparator /><ui.DropdownMenuItem>Arquivar</ui.DropdownMenuItem></ui.DropdownMenuContent></ui.DropdownMenu>
      <ui.Popover><ui.PopoverTrigger asChild><ui.Button variant="outline">Mais informações</ui.Button></ui.PopoverTrigger><ui.PopoverContent>Documento da equipe.</ui.PopoverContent></ui.Popover>
      <ui.TooltipProvider delayDuration={0}><ui.Tooltip><ui.TooltipTrigger asChild><ui.Button variant="outline">Ajuda</ui.Button></ui.TooltipTrigger><ui.TooltipPortal><ui.TooltipContent>Ajuda sobre documentos</ui.TooltipContent></ui.TooltipPortal></ui.Tooltip></ui.TooltipProvider>
    </section>
  </main>;
}
