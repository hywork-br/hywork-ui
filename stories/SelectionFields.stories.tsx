import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import {
  Button,
  Combobox,
  Field,
  FieldError,
  FieldHint,
  Label,
  Select,
} from "../src";

const statusOptions = [
  { value: "draft", label: "Rascunho" },
  { value: "published", label: "Publicado" },
];
const ownerOptions = [
  { value: "mariana", label: "Mariana Costa" },
  { value: "luiz", label: "Luiz Almeida" },
];

function ControlledSelectionForm() {
  const statusRef = useRef<HTMLButtonElement>(null);
  const ownerRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);
  const attemptRef = useRef(0);
  const [status, setStatus] = useState("");
  const [owner, setOwner] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<"failure" | "success" | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const statusInvalid = submitted && !status;
  const ownerInvalid = submitted && !owner;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;

    setSubmitted(true);
    setFeedback(null);
    if (!status) {
      statusRef.current?.focus();
      return;
    }
    if (!owner) {
      ownerRef.current?.focus();
      return;
    }

    setPending(true);
    attemptRef.current += 1;
    const attempt = attemptRef.current;
    timerRef.current = window.setTimeout(() => {
      setPending(false);
      setFeedback(attempt === 1 ? "failure" : "success");
      timerRef.current = null;
    }, 150);
  };

  return (
    <div className="hw-story-frame">
      <form
        aria-label="Configuração da publicação"
        className="hw-catalog__form"
        noValidate
        onSubmit={submit}
      >
        <Field>
          <Label htmlFor="selection-status">Status</Label>
          <Select
            ref={statusRef}
            id="selection-status"
            ariaLabel="Status"
            aria-describedby={statusInvalid ? "selection-status-error" : undefined}
            aria-invalid={statusInvalid || undefined}
            name="status"
            onValueChange={setStatus}
            options={statusOptions}
            placeholder="Escolha um status"
            required
            value={status}
          />
          {statusInvalid ? (
            <FieldError id="selection-status-error">
              Escolha um status permitido.
            </FieldError>
          ) : null}
        </Field>

        <Field>
          <Label htmlFor="selection-owner">Responsável</Label>
          <Combobox
            ref={ownerRef}
            id="selection-owner"
            aria-label="Responsável"
            aria-describedby={
              ownerInvalid
                ? "selection-owner-hint selection-owner-error"
                : "selection-owner-hint"
            }
            aria-invalid={ownerInvalid || undefined}
            onValueChange={setOwner}
            options={ownerOptions}
            placeholder="Busque uma pessoa"
            value={owner}
          />
          <FieldHint id="selection-owner-hint">
            A busca é local nesta fixture controlada.
          </FieldHint>
          {ownerInvalid ? (
            <FieldError id="selection-owner-error">
              Escolha uma pessoa responsável.
            </FieldError>
          ) : null}
        </Field>

        {pending ? <p role="status">Salvando configuração...</p> : null}
        {feedback === "failure" ? (
          <FieldError>
            A tentativa 1 falhou. Os valores foram preservados para retry.
          </FieldError>
        ) : null}
        {feedback === "success" ? (
          <p role="status">Configuração salva na fixture local.</p>
        ) : null}

        <Button loading={pending} type="submit">
          {feedback === "failure" ? "Tentar novamente" : "Salvar"}
        </Button>
      </form>
    </div>
  );
}

const meta = {
  title: "Components/Campos de seleção",
  parameters: { layout: "fullscreen" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const ValidationAndRetry: Story = {
  render: () => <ControlledSelectionForm />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole("button", { name: "Salvar" }));
    await expect(canvas.getByText("Escolha um status permitido.")).toBeVisible();
    await expect(canvas.getByRole("combobox", { name: "Status" })).toHaveFocus();

    await userEvent.click(canvas.getByRole("combobox", { name: "Status" }));
    await userEvent.click(body.getByRole("option", { name: "Publicado" }));
    await userEvent.type(
      canvas.getByRole("combobox", { name: "Responsável" }),
      "Mar{ArrowDown}{Enter}",
    );

    const save = canvas.getByRole("button", { name: "Salvar" });
    await userEvent.click(save);
    await expect(save).toBeDisabled();
    await expect(save).toHaveAttribute("aria-busy", "true");
    await userEvent.click(save);

    await waitFor(() =>
      expect(canvas.getByRole("alert")).toHaveTextContent(
        "A tentativa 1 falhou.",
      ),
    );
    await expect(canvas.getByRole("combobox", { name: "Status" })).toHaveTextContent(
      "Publicado",
    );
    await expect(
      canvas.getByRole("combobox", { name: "Responsável" }),
    ).toHaveValue("Mariana Costa");

    await userEvent.click(
      canvas.getByRole("button", { name: "Tentar novamente" }),
    );
    await waitFor(() =>
      expect(canvas.getByRole("status")).toHaveTextContent(
        "Configuração salva na fixture local.",
      ),
    );
  },
};
