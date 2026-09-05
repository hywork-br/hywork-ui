import { render } from "@testing-library/react";
import axe from "axe-core";
import { Info } from "lucide-react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Field,
  FieldError,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./index";

async function expectNoSeriousViolations(ui: ReactNode) {
  render(<main>{ui}</main>);
  const result = await axe.run(document.body, {
    rules: {
      "color-contrast": { enabled: false },
    },
  });
  const blocking = result.violations.filter(
    (violation) => violation.impact === "serious" || violation.impact === "critical",
  );
  expect(blocking, blocking.map((violation) => violation.help).join("\n")).toEqual([]);
}

describe("axe contracts", () => {
  it("audits Button", async () => {
    await expectNoSeriousViolations(<Button>Publicar campanha</Button>);
  });

  it("audits Input, Field and Label", async () => {
    await expectNoSeriousViolations(
      <Field>
        <Label htmlFor="axe-name">Nome</Label>
        <Input aria-describedby="axe-name-error" id="axe-name" invalid />
        <FieldError id="axe-name-error">Informe um nome.</FieldError>
      </Field>,
    );
  });

  it("audits Textarea", async () => {
    await expectNoSeriousViolations(
      <Field>
        <Label htmlFor="axe-message">Mensagem</Label>
        <Textarea id="axe-message" />
      </Field>,
    );
  });

  it("audits Badge", async () => {
    await expectNoSeriousViolations(<Badge tone="warning">Agendada</Badge>);
  });

  it("audits Avatar", async () => {
    await expectNoSeriousViolations(<Avatar name="Luiza Vieira" />);
  });

  it("audits Skeleton in a named busy region", async () => {
    await expectNoSeriousViolations(
      <section aria-busy="true" aria-label="Carregando campanhas">
        <Skeleton />
      </section>,
    );
  });

  it("audits Card heading structure", async () => {
    await expectNoSeriousViolations(
      <Card>
        <CardHeader>
          <CardTitle as="h1">Campanha de segurança</CardTitle>
          <CardDescription>Publicação interna</CardDescription>
        </CardHeader>
        <CardContent>Conteúdo da campanha.</CardContent>
      </Card>,
    );
  });

  it("audits Dialog title and description", async () => {
    await expectNoSeriousViolations(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Enviar teste</DialogTitle>
          <DialogDescription>O teste será enviado apenas para você.</DialogDescription>
          <Button>Confirmar envio</Button>
        </DialogContent>
      </Dialog>,
    );
  });

  it("audits DropdownMenu and Popover", async () => {
    await expectNoSeriousViolations(
      <>
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger asChild><Button>Ações</Button></DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Duplicar campanha</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Popover defaultOpen>
          <PopoverTrigger asChild><Button>Ver contexto</Button></PopoverTrigger>
          <PopoverContent>Publicação agendada para hoje.</PopoverContent>
        </Popover>
      </>,
    );
  });

  it("audits Tooltip", async () => {
    await expectNoSeriousViolations(
      <TooltipProvider delayDuration={0}>
        <Tooltip defaultOpen>
          <TooltipTrigger asChild>
            <Button aria-label="Sobre a taxa de entrega" size="icon" variant="outline">
              <Info aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Percentual de destinatários alcançados.</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
  });

  it("audits Select", async () => {
    await expectNoSeriousViolations(
      <Select
        ariaLabel="Status"
        options={[
          { label: "Todas", value: "all" },
          { label: "Ativas", value: "active" },
        ]}
        placeholder="Selecione"
      />,
    );
  });

  it("audits Tabs", async () => {
    await expectNoSeriousViolations(
      <Tabs defaultValue="overview">
        <TabsList aria-label="Detalhes da campanha">
          <TabsTrigger value="overview">Visão geral</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Campanha pronta.</TabsContent>
        <TabsContent value="history">Duas revisões.</TabsContent>
      </Tabs>,
    );
  });
});
