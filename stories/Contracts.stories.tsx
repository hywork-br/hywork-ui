import type { Meta, StoryObj } from "@storybook/react-vite";
import { Info, MoreHorizontal } from "lucide-react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Avatar,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Dialog,
  DialogActions,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Field,
  FieldError,
  FieldHint,
  FilterBar,
  Input,
  Label,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
  Progress,
  Select,
  Separator,
  Skeleton,
  Slider,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../src";

const meta = {
  parameters: {
    docs: {
      description: {
        component:
          "Contrato executável das 12 famílias beta. Use o seletor de superfície para comparar admin e portal.",
      },
    },
  },
  title: "Contracts/Core families",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function ContractFrame({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <main className="hw-contract">
      <header className="hw-contract__header">
        <h1>{title}</h1>
        <p>Estados relevantes, conteúdo realista e comportamento compartilhado entre superfícies.</p>
        <Badge tone="info">Contrato beta</Badge>
      </header>
      <section aria-label={`Estados de ${title}`} className="hw-contract__canvas">
        {children}
      </section>
    </main>
  );
}

export const ButtonContract: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Publicar campanha" })).toHaveFocus();
  },
  render: () => (
    <ContractFrame title="Button">
      <div className="hw-contract__row">
        <Button onClick={fn()}>Publicar campanha</Button>
        <Button onClick={fn()} variant="secondary">Enviar teste</Button>
        <Button onClick={fn()} variant="outline">Salvar rascunho</Button>
        <Button onClick={fn()} variant="quiet">Cancelar</Button>
        <Button onClick={fn()} variant="danger">Excluir campanha</Button>
        <Button disabled>Sem permissão</Button>
        <Button loading>Publicando</Button>
      </div>
    </ContractFrame>
  ),
};

export const FieldContract: Story = {
  render: () => (
    <ContractFrame title="Input, Field e Label">
      <div className="hw-contract__form-grid">
        <Field>
          <Label htmlFor="contract-title">Título</Label>
          <Input id="contract-title" defaultValue="Boas-vindas de setembro" />
          <FieldHint>Visível para o público selecionado.</FieldHint>
        </Field>
        <Field>
          <Label htmlFor="contract-owner">Responsável</Label>
          <Input
            aria-describedby="contract-owner-error"
            id="contract-owner"
            invalid
            placeholder="Nome ou equipe"
          />
          <FieldError id="contract-owner-error">Escolha quem aprova a publicação.</FieldError>
        </Field>
        <Field>
          <Label htmlFor="contract-locked">Código da unidade</Label>
          <Input disabled id="contract-locked" value="MATRIZ-SP" readOnly />
        </Field>
        <FilterBar search={
          <Field>
            <Label htmlFor="contract-search">Busca (estado inválido)</Label>
            <Input id="contract-search" invalid aria-describedby="contract-search-error" />
            <FieldError id="contract-search-error">Revise os termos da busca.</FieldError>
          </Field>
        } />
      </div>
    </ContractFrame>
  ),
  // CSS regression: focus and contextual search must not erase the error cue.
  // Run in the actual browser; jsdom does not resolve CSS custom properties.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const [label, message] of [
      ["Responsável", "Escolha quem aprova a publicação."],
      ["Busca (estado inválido)", "Revise os termos da busca."],
    ]) {
      const input = canvas.getByRole("textbox", { name: label });
      const error = canvas.getByText(message);
      await userEvent.click(input);
      await expect(input).toHaveFocus();
      await waitFor(async () => {
        await expect(getComputedStyle(input).borderBottomColor).toBe(getComputedStyle(error).color);
      });
    }
  },
};

export const TextareaContract: Story = {
  render: () => (
    <ContractFrame title="Textarea">
      <div className="hw-contract__form-grid">
        <Field>
          <Label htmlFor="contract-message">Mensagem</Label>
          <Textarea
            defaultValue="Conte o que muda, por que importa e qual é o próximo passo para a equipe."
            id="contract-message"
          />
          <FieldHint>Até 600 caracteres. Links continuam clicáveis após a publicação.</FieldHint>
        </Field>
        <Field>
          <Label htmlFor="contract-message-error">Resumo executivo</Label>
          <Textarea
            aria-describedby="contract-message-error-copy"
            id="contract-message-error"
            invalid
          />
          <FieldError id="contract-message-error-copy">Inclua um resumo antes de continuar.</FieldError>
        </Field>
      </div>
    </ContractFrame>
  ),
};

export const BadgeContract: Story = {
  render: () => (
    <ContractFrame title="Badge">
      <div className="hw-contract__row">
        <Badge>Rascunho</Badge>
        <Badge tone="info">Em revisão</Badge>
        <Badge tone="success">Publicada</Badge>
        <Badge tone="warning">Agendada</Badge>
        <Badge tone="danger">Falha no envio</Badge>
      </div>
    </ContractFrame>
  ),
};

export const AvatarContract: Story = {
  render: () => (
    <ContractFrame title="Avatar">
      <div className="hw-contract__row">
        <Avatar name="Maricy Souza" size="sm" />
        <Avatar name="Luiza Vieira" />
        <Avatar name="Vitor Ferreira" size="lg" src="/avatar-unavailable.png" />
        <div className="hw-contract__person">
          <Avatar name="Thaize Barbell" />
          <span><strong>Thaize Barbell</strong><small>Experiência do colaborador</small></span>
        </div>
      </div>
    </ContractFrame>
  ),
};

export const SkeletonContract: Story = {
  render: () => (
    <ContractFrame title="Skeleton">
      <section aria-busy="true" aria-label="Carregando campanhas" className="hw-contract__loading">
        <div className="hw-contract__person">
          <Skeleton className="hw-contract__skeleton-avatar" />
          <span className="hw-contract__skeleton-copy">
            <Skeleton />
            <Skeleton />
          </span>
        </div>
        <Skeleton className="hw-contract__skeleton-block" />
      </section>
    </ContractFrame>
  ),
};

export const CardContract: Story = {
  render: () => (
    <ContractFrame title="Card">
      <Card>
        <CardHeader>
          <Badge tone="success">Ativa</Badge>
          <CardTitle as="h2">Semana de segurança</CardTitle>
          <CardDescription>E-mail · Todas as unidades · Atualizada há 18 min</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Orientações práticas, calendário de DDS e materiais para os líderes.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={fn()} variant="outline">Ver detalhes</Button>
        </CardFooter>
      </Card>
    </ContractFrame>
  ),
};

export const DialogContract: Story = {
  render: () => (
    <ContractFrame title="Dialog e AlertDialog">
      <div className="hw-contract__row">
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Enviar teste da campanha</DialogTitle>
            <DialogDescription>O teste será enviado apenas para você e não altera o agendamento.</DialogDescription>
            <DialogActions>
              <DialogClose asChild><Button variant="quiet">Cancelar</Button></DialogClose>
              <DialogClose asChild><Button onClick={fn()}>Enviar para mim</Button></DialogClose>
            </DialogActions>
          </DialogContent>
        </Dialog>
        <AlertDialog>
          <AlertDialogContent>
            <AlertDialogTitle>Excluir campanha?</AlertDialogTitle>
            <AlertDialogDescription>Essa ação remove o rascunho e não pode ser desfeita.</AlertDialogDescription>
            <DialogActions>
              <AlertDialogClose asChild><Button variant="quiet">Manter campanha</Button></AlertDialogClose>
              <AlertDialogClose asChild><Button onClick={fn()} variant="danger">Excluir campanha</Button></AlertDialogClose>
            </DialogActions>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ContractFrame>
  ),
};

export const MenusContract: Story = {
  render: () => (
    <ContractFrame title="DropdownMenu e Popover">
      <div className="hw-contract__row">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline"><MoreHorizontal aria-hidden="true" /> Ações</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Campanha</DropdownMenuLabel>
            <DropdownMenuItem onSelect={fn()}>Duplicar</DropdownMenuItem>
            <DropdownMenuItem onSelect={fn()}>Arquivar</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem danger onSelect={fn()}>Excluir</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Popover>
          <PopoverTrigger asChild><Button variant="outline">Ver contexto</Button></PopoverTrigger>
          <PopoverContent>
            <strong>Publicação agendada</strong>
            <p>Hoje, às 17h, para três unidades.</p>
            <PopoverClose asChild><Button size="sm" variant="quiet">Fechar</Button></PopoverClose>
          </PopoverContent>
        </Popover>
      </div>
    </ContractFrame>
  ),
};

export const TooltipContract: Story = {
  render: () => (
    <ContractFrame title="Tooltip">
      <TooltipProvider delayDuration={0}>
        <Tooltip defaultOpen>
          <TooltipTrigger asChild>
            <Button aria-label="Sobre a taxa de entrega" size="icon" variant="outline">
              <Info aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Percentual de destinatários que receberam a campanha.</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </ContractFrame>
  ),
};

export const SelectContract: Story = {
  render: () => (
    <ContractFrame title="Select">
      <div className="hw-contract__form-grid">
        <Field>
          <Label id="contract-status-label">Status</Label>
          <Select
            ariaLabel="Status"
            onValueChange={fn()}
            options={[
              { label: "Todas", value: "all" },
              { label: "Ativas", value: "active" },
              { label: "Arquivadas", value: "archived" },
            ]}
            value="active"
          />
        </Field>
        <Field>
          <Label>Canal indisponível</Label>
          <Select
            ariaLabel="Canal indisponível"
            disabled
            options={[{ label: "TV corporativa", value: "tv" }]}
            placeholder="Sem permissão"
          />
        </Field>
      </div>
    </ContractFrame>
  ),
};

export const TabsContract: Story = {
  render: () => (
    <ContractFrame title="Tabs">
      <Tabs defaultValue="overview">
        <TabsList aria-label="Detalhes da campanha">
          <TabsTrigger value="overview">Visão geral</TabsTrigger>
          <TabsTrigger value="audience">Público</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger disabled value="automation">Automação</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">A campanha está pronta para revisão.</TabsContent>
        <TabsContent value="audience">1.248 pessoas em três unidades.</TabsContent>
        <TabsContent value="history">Duas revisões concluídas hoje.</TabsContent>
        <TabsContent value="automation">Automação ainda não configurada.</TabsContent>
      </Tabs>
    </ContractFrame>
  ),
};

export const ProgressContract: Story = {
  name: "Progress · estados operacionais",
  render: () => (
    <ContractFrame title="Progress">
      <div className="hw-story-stack" style={{ maxWidth: "32rem" }}>
        <Progress aria-label="Importação em andamento" value={42} />
        <Progress aria-label="Importação concluída" value={100} />
        <Progress aria-label="Importação aguardando início" value={0} />
      </div>
    </ContractFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("progressbar", { name: "Importação em andamento" })).toHaveAttribute("aria-valuenow", "42");
    await expect(canvas.getByRole("progressbar", { name: "Importação concluída" })).toHaveAttribute("data-state", "complete");
  },
};

export const AccordionContract: Story = {
  name: "Accordion · configurações agrupadas",
  render: () => (
    <ContractFrame title="Accordion">
      <Accordion defaultValue="content">
        <AccordionItem value="content">
          <AccordionTrigger>Conteúdo</AccordionTrigger>
          <AccordionContent>Selecione o modelo e o canal desta composição.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="audience">
          <AccordionTrigger>Público</AccordionTrigger>
          <AccordionContent>Defina as áreas e pessoas que poderão visualizar o conteúdo.</AccordionContent>
        </AccordionItem>
        <AccordionItem disabled value="automation">
          <AccordionTrigger>Automação (em breve)</AccordionTrigger>
          <AccordionContent>Esta capacidade ainda não está disponível nesta demonstração.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </ContractFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const audience = canvas.getByRole("button", { name: "Público" });
    await userEvent.click(audience);
    await expect(audience).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByRole("region", { name: "Público" })).toBeVisible();
  },
};

export const SliderContract: Story = {
  name: "Slider · ajustes contínuos",
  render: () => (
    <ContractFrame title="Slider">
      <div className="hw-story-stack" style={{ maxWidth: "32rem" }}>
        <p>Opacidade · 72%</p>
        <Slider aria-label="Opacidade" defaultValue={[72]} max={100} />
        <p>Margem · 24–72 px</p>
        <Slider aria-label="Margem" defaultValue={[24, 72]} max={120} />
      </div>
    </ContractFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole("slider", { name: "Opacidade" })).toHaveFocus();
  },
};

export const BreadcrumbContract: Story = {
  name: "Breadcrumb · contexto de localização",
  render: () => (
    <ContractFrame title="Breadcrumb">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="#dados">Dados</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink href="#colecao">Coleção</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Registros</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </ContractFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "Coleção" })).toHaveAttribute("href", "#colecao");
    await expect(canvas.getByText("Registros")).toHaveAttribute("aria-current", "page");
  },
};

export const SeparatorContract: Story = {
  name: "Separator · grupos de conteúdo",
  render: () => (
    <ContractFrame title="Separator">
      <div className="hw-contract__form-grid">
        <section aria-labelledby="separator-content-title">
          <h2 id="separator-content-title">Conteúdo</h2>
          <Separator />
          <p>Uma divisão visual entre resumo e detalhes da publicação.</p>
        </section>
        <section aria-labelledby="separator-actions-title">
          <h2 id="separator-actions-title">Ações</h2>
          <div className="hw-contract__row">
            <span>Admin</span>
            <Separator aria-label="Divisor entre superfícies" decorative={false} orientation="vertical" />
            <span>Portal</span>
          </div>
        </section>
      </div>
    </ContractFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("separator", { name: "Divisor entre superfícies" })).toHaveAttribute(
      "aria-orientation",
      "vertical",
    );
  },
};
