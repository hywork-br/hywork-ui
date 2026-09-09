import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  Badge,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldError,
  Input,
  Label,
  Select,
} from "../index";

describe("component contracts", () => {
  it("keeps loading buttons announced and inert", () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Salvar campanha
      </Button>,
    );

    const button = screen.getByRole("button", { name: /salvar campanha/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("preserves one semantic child when a button renders as a link", () => {
    render(
      <Button asChild variant="outline">
        <a href="#campaign">Ver campanha</a>
      </Button>,
    );

    const link = screen.getByRole("link", { name: "Ver campanha" });
    expect(link).toHaveAttribute("href", "#campaign");
    expect(link).toHaveClass("hw-button");
  });

  it("prevents activation when an asChild action is loading", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button asChild loading onClick={onClick}>
        <a href="#campaign">Abrir campanha</a>
      </Button>,
    );

    await user.click(screen.getByRole("link", { name: "Abrir campanha" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("links field errors to their control", () => {
    render(
      <Field>
        <Label htmlFor="campaign-name">Nome da campanha</Label>
        <Input id="campaign-name" invalid aria-describedby="campaign-error" />
        <FieldError id="campaign-error">Informe um nome.</FieldError>
      </Field>,
    );

    expect(screen.getByLabelText("Nome da campanha")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Informe um nome.");
  });

  it("opens, labels and closes dialogs using the keyboard-ready primitive", async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Nova campanha</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Criar campanha</DialogTitle>
          <DialogDescription>Defina o público e o canal.</DialogDescription>
          <DialogClose asChild>
            <Button variant="quiet">Cancelar</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByRole("button", { name: "Nova campanha" }));
    expect(screen.getByRole("dialog", { name: "Criar campanha" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders explicit status copy and a labelled select", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <>
        <Badge tone="warning">Agendada</Badge>
        <Select
          ariaLabel="Status"
          onValueChange={onValueChange}
          options={[
            { label: "Todos", value: "all" },
            { label: "Agendada", value: "scheduled" },
          ]}
          placeholder="Todos os status"
        />
      </>,
    );

    expect(screen.getByText("Agendada")).toHaveAttribute("data-tone", "warning");
    await user.click(screen.getByRole("combobox", { name: "Status" }));
    await user.click(screen.getByRole("option", { name: "Agendada" }));
    expect(onValueChange).toHaveBeenCalledWith("scheduled");
  });
});
