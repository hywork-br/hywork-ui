import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Combobox,
  Field,
  FieldError,
  FieldHint,
  Label,
  MultiSelect,
  Select,
} from "../index";

const options = [
  { value: "draft", label: "Rascunho" },
  { value: "published", label: "Publicado" },
];

describe("selection field contract", () => {
  it("associates Select feedback with its focus target and preserves native form semantics", () => {
    const controlRef = React.createRef<HTMLButtonElement>();
    const { container } = render(
      <form aria-label="Publicação">
        <Field>
          <Label htmlFor="status">Status</Label>
          <Select
            ref={controlRef}
            id="status"
            ariaLabel="Status"
            aria-describedby="status-error"
            aria-invalid="true"
            required
            name="status"
            value="draft"
            options={options}
          />
          <FieldError id="status-error">
            Escolha um status permitido.
          </FieldError>
        </Field>
      </form>,
    );

    const control = screen.getByRole("combobox", { name: "Status" });
    expect((screen.getByText("Status") as HTMLLabelElement).control).toBe(
      control,
    );
    expect(control).toHaveAttribute("id", "status");
    expect(control).toHaveAttribute("aria-describedby", "status-error");
    expect(control).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Escolha um status permitido.")).toHaveAttribute(
      "id",
      "status-error",
    );
    controlRef.current?.focus();
    expect(control).toHaveFocus();

    const nativeSelect = container.querySelector<HTMLSelectElement>(
      'select[name="status"]',
    );
    expect(nativeSelect).toBeRequired();
    expect(nativeSelect).toHaveValue("draft");
    expect(
      new FormData(screen.getByRole("form") as HTMLFormElement).get("status"),
    ).toBe("draft");
  });

  it("associates Combobox hint and error with the labelled input and exposes its ref", () => {
    const controlRef = React.createRef<HTMLInputElement>();
    render(
      <form aria-label="Responsabilidade">
        <Field>
          <Label htmlFor="owner">Responsável</Label>
          <Combobox
            ref={controlRef}
            id="owner"
            aria-label="Responsável"
            aria-describedby="owner-hint owner-error"
            aria-invalid="true"
            options={options}
            value=""
            onValueChange={() => undefined}
          />
          <FieldHint id="owner-hint">Busque pelo nome da pessoa.</FieldHint>
          <FieldError id="owner-error">
            Escolha uma pessoa responsável.
          </FieldError>
        </Field>
      </form>,
    );

    const control = screen.getByRole("combobox", { name: "Responsável" });
    expect((screen.getByText("Responsável") as HTMLLabelElement).control).toBe(
      control,
    );
    expect(control).toHaveAttribute("id", "owner");
    expect(control).toHaveAttribute(
      "aria-describedby",
      "owner-hint owner-error",
    );
    expect(control).toHaveAttribute("aria-invalid", "true");
    controlRef.current?.focus();
    expect(control).toHaveFocus();
  });

  it("associates MultiSelect feedback with its labelled input and exposes its ref", () => {
    const controlRef = React.createRef<HTMLInputElement>();
    render(
      <form aria-label="Canais">
        <Field>
          <Label htmlFor="channels">Canais</Label>
          <MultiSelect
            ref={controlRef}
            id="channels"
            aria-label="Canais"
            aria-describedby="channels-error"
            aria-invalid="true"
            options={options}
            value={[]}
            onValueChange={() => undefined}
          />
          <FieldError id="channels-error">
            Escolha pelo menos um canal.
          </FieldError>
        </Field>
      </form>,
    );

    const control = screen.getByRole("combobox", { name: "Canais" });
    expect((screen.getByText("Canais") as HTMLLabelElement).control).toBe(
      control,
    );
    expect(control).toHaveAttribute("id", "channels");
    expect(control).toHaveAttribute("aria-describedby", "channels-error");
    expect(control).toHaveAttribute("aria-invalid", "true");
    controlRef.current?.focus();
    expect(control).toHaveFocus();
  });
});
