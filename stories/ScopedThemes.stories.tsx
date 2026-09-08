import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { AdminShell, Avatar, FilterBar, Stepper, Tabs, TabsList, TabsTrigger, TabsContent, Button, Field, Label, Input, Select, Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose, Popover, PopoverTrigger, PopoverContent, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "../src";
import { ThemeScope, useThemeScope } from "../src/components/theme-scope";
import { defaultScopedTheme } from "../src/lib/scoped-theme";
import colors from "../tokens/resolved-colors.json";

const alternate = { ...defaultScopedTheme, primary: defaultScopedTheme.text, floating: defaultScopedTheme.subtle };
const row = { display: "flex", flexWrap: "wrap", gap: "var(--hw-space-3)", alignItems: "center" } as const;
const fieldWidth = { width: "100%", maxWidth: "24rem" } as const;
function Status() {
  const scope = useThemeScope();
  return scope?.validation.valid ? null : <p role="alert">Cor rejeitada. O último tema válido foi preservado.</p>;
}

function Demonstration() {
  const [theme, setTheme] = useState(defaultScopedTheme);
  return <main style={{ padding: "var(--hw-space-6)", fontFamily: "var(--hw-font-body)", display: "grid", gap: "var(--hw-space-6)" }}>
    <header><h1>Temas isolados</h1><p>Componentes reais, com validação local. Nenhuma configuração é salva.</p></header>
    <section aria-label="Padrão externo"><h2>Fora dos temas</h2><Button>Botão padrão</Button></section>
    <ThemeScope theme={theme} data-testid="theme-a">
      <section aria-label="Workspace A"><h2>Workspace A</h2><div style={row}>
        <Button>Publicar A</Button><Field style={fieldWidth}><Label htmlFor="scope-name-a">Nome A</Label><Input id="scope-name-a" defaultValue="Comunicação interna" /></Field>
        <Field><Label htmlFor="scope-status-a">Status A</Label><Select id="scope-status-a" ariaLabel="Status A" placeholder="Selecione o status" options={[{ value: "draft", label: "Rascunho" }, { value: "published", label: "Publicado" }]} /></Field>
        <Dialog><DialogTrigger asChild><Button variant="outline">Abrir diálogo A</Button></DialogTrigger>
          <DialogContent><DialogTitle>Preferências do workspace A</DialogTitle><DialogDescription>O tema acompanha o diálogo, mesmo fora do contêiner original.</DialogDescription>
            <div style={row}><Button onClick={() => setTheme(alternate)}>Aplicar tema alternativo</Button><Button variant="outline" onClick={() => setTheme({ ...alternate, primary: "invalid" })}>Testar cor inválida</Button></div>
            <Status /><ThemeScope theme={{ ...alternate, background: alternate.floating }}><Field><Label htmlFor="scope-dialog-status">Status no diálogo</Label><Select id="scope-dialog-status" ariaLabel="Status no diálogo" placeholder="Selecione o status" options={[{ value: "draft", label: "Rascunho" }]} /></Field></ThemeScope>
            <DialogClose asChild><Button variant="outline">Fechar diálogo</Button></DialogClose>
          </DialogContent>
        </Dialog>
        <Popover><PopoverTrigger asChild><Button variant="outline">Abrir detalhes A</Button></PopoverTrigger><PopoverContent aria-label="Detalhes A">A configuração pertence apenas a este workspace.</PopoverContent></Popover>
        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline">Ações A</Button></DropdownMenuTrigger><DropdownMenuContent aria-label="Ações A"><DropdownMenuItem onSelect={() => setTheme(defaultScopedTheme)}>Restaurar tema padrão</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
        <TooltipProvider delayDuration={0}><Tooltip><TooltipTrigger asChild><Button variant="outline">Ajuda A</Button></TooltipTrigger><TooltipContent>O tema não altera outros workspaces.</TooltipContent></Tooltip></TooltipProvider>
      </div><Status /></section>
    </ThemeScope>
    <ThemeScope theme={alternate} data-testid="theme-b"><section aria-label="Workspace B"><h2>Workspace B</h2><div style={row}><Button>Publicar B</Button><Field style={fieldWidth}><Label htmlFor="scope-name-b">Nome B</Label><Input id="scope-name-b" defaultValue="Cultura e pessoas" /></Field><Popover><PopoverTrigger asChild><Button variant="outline">Abrir detalhes B</Button></PopoverTrigger><PopoverContent aria-label="Detalhes B">Este painel usa seu próprio tema.</PopoverContent></Popover></div></section></ThemeScope>
  </main>;
}

const meta = { title: "Themes/Scoped components", component: Demonstration, parameters: { layout: "fullscreen" } } satisfies Meta<typeof Demonstration>;
export default meta;
type Story = StoryObj<typeof meta>;
export const PortalContract: Story = {};

function AccentDemonstration() {
  const [filtered, setFiltered] = useState(true);
  const lightTheme = { ...defaultScopedTheme, primary: colors["--hw-amber"], primaryHover: colors["--hw-peach"], primaryForeground: defaultScopedTheme.text, primarySoft: defaultScopedTheme.text, primarySoftForeground: defaultScopedTheme.surface };
  return <ThemeScope theme={lightTheme}>
    <AdminShell brand="Hywork · temas" currentItem="overview" navigation={[{ id: "overview", label: "Visão geral", href: "#accent-overview" }, { id: "review", label: "Revisão", href: "#accent-review" }]}>
      <main id="accent-overview" style={{ padding: "var(--hw-space-6)", display: "grid", gap: "var(--hw-space-6)" }}>
        <header><h1>Acento claro, texto legível</h1><p>A cor do botão não precisa ser a cor da navegação ou das etapas.</p></header>
        <Avatar name="Maria Silva" />
        <FilterBar search={<Input aria-label="Buscar conteúdos" placeholder="Buscar conteúdos" />} activeFilters={filtered ? [{ id: "published", label: "Publicado", onRemove: () => setFiltered(false) }] : []} />
        <Tabs defaultValue="overview"><TabsList aria-label="Visão"><TabsTrigger value="overview">Visão geral</TabsTrigger><TabsTrigger value="review">Revisão</TabsTrigger></TabsList><TabsContent value="overview">Conteúdos do workspace</TabsContent><TabsContent value="review">Conteúdos aguardando revisão</TabsContent></Tabs>
        <section id="accent-review" aria-label="Progresso"><Stepper currentStep="review" steps={[{ id: "draft", label: "Conteúdo", status: "complete" }, { id: "review", label: "Revisão", status: "current" }, { id: "publish", label: "Publicação", status: "upcoming" }]} /></section>
      </main>
    </AdminShell>
  </ThemeScope>;
}
export const AccentInk: Story = { render: () => <AccentDemonstration /> };
