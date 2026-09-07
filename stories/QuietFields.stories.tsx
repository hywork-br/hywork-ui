import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import {
  Combobox,
  DateField,
  Field,
  FieldError,
  FieldHint,
  FilterBar,
  Input,
  Label,
  MultiSelect,
  Select,
  Textarea,
} from "../src";
import { CollectionDemo } from "./collections/collection-demo";
import { RecoveryDemo } from "./feedback/recovery-demo";

const categories = [
  { value: "culture", label: "Cultura" },
  { value: "benefits", label: "Benefícios" },
];
const people = [
  { value: "ana", label: "Ana Lima" },
  { value: "bruno", label: "Bruno Reis" },
];

function QuietFieldMatrix() {
  const [owner, setOwner] = useState("ana");
  const [invalidOwner, setInvalidOwner] = useState("");
  const [participants, setParticipants] = useState(["ana"]);
  const [invalidParticipants, setInvalidParticipants] = useState<string[]>([]);

  return (
    <main className="hw-contract">
      <header className="hw-contract__header">
        <h1>Campos quiet em contexto</h1>
        <p>
          Formulários preservam superfície e linha-base compartilhadas; filtros
          contextuais reduzem peso sem apagar foco, erro ou semântica.
        </p>
      </header>

      <section aria-labelledby="quiet-normal-heading" className="hw-contract__canvas">
        <h2 id="quiet-normal-heading">Formulário · normal</h2>
        <div className="hw-contract__form-grid">
          <Field>
            <Label htmlFor="quiet-text-normal">Texto normal</Label>
            <Input id="quiet-text-normal" defaultValue="Comunicado mensal" />
            <FieldHint>Ajuda associada ao campo textual.</FieldHint>
          </Field>
          <Field>
            <Label htmlFor="quiet-description-normal">Descrição normal</Label>
            <Textarea
              id="quiet-description-normal"
              defaultValue="Resumo da comunicação para a equipe."
            />
          </Field>
          <Field>
            <Label htmlFor="quiet-category-normal">Categoria normal</Label>
            <Select
              id="quiet-category-normal"
              ariaLabel="Categoria normal"
              options={categories}
              value="culture"
            />
          </Field>
          <Field>
            <Label htmlFor="quiet-owner-normal">Responsável normal</Label>
            <Combobox
              id="quiet-owner-normal"
              aria-label="Responsável normal"
              onValueChange={setOwner}
              options={people}
              value={owner}
            />
          </Field>
          <Field>
            <Label htmlFor="quiet-participants-normal">Participantes normais</Label>
            <MultiSelect
              id="quiet-participants-normal"
              aria-label="Participantes normais"
              onValueChange={setParticipants}
              options={people}
              value={participants}
            />
          </Field>
          <DateField
            id="quiet-date-normal"
            label="Data normal"
            defaultValue="2026-09-07"
          />
        </div>
      </section>

      <section aria-labelledby="quiet-invalid-heading" className="hw-contract__canvas">
        <h2 id="quiet-invalid-heading">Formulário · inválido</h2>
        <div className="hw-contract__form-grid">
          <Field>
            <Label htmlFor="quiet-text-invalid">Texto inválido</Label>
            <Input
              id="quiet-text-invalid"
              aria-describedby="quiet-text-error"
              invalid
            />
            <FieldError id="quiet-text-error">Informe um título válido.</FieldError>
          </Field>
          <Field>
            <Label htmlFor="quiet-description-invalid">Descrição inválida</Label>
            <Textarea
              id="quiet-description-invalid"
              aria-describedby="quiet-description-error"
              invalid
            />
            <FieldError id="quiet-description-error">
              Inclua uma descrição válida.
            </FieldError>
          </Field>
          <Field>
            <Label htmlFor="quiet-category-invalid">Categoria inválida</Label>
            <Select
              id="quiet-category-invalid"
              ariaLabel="Categoria inválida"
              aria-describedby="quiet-category-error"
              aria-invalid="true"
              options={categories}
              value="culture"
            />
            <FieldError id="quiet-category-error">
              Escolha uma categoria permitida.
            </FieldError>
          </Field>
          <Field>
            <Label htmlFor="quiet-owner-invalid">Responsável inválido</Label>
            <Combobox
              id="quiet-owner-invalid"
              aria-label="Responsável inválido"
              aria-describedby="quiet-owner-error"
              aria-invalid="true"
              onValueChange={setInvalidOwner}
              options={people}
              value={invalidOwner}
            />
            <FieldError id="quiet-owner-error">
              Escolha uma pessoa responsável.
            </FieldError>
          </Field>
          <Field>
            <Label htmlFor="quiet-participants-invalid">
              Participantes inválidos
            </Label>
            <MultiSelect
              id="quiet-participants-invalid"
              aria-label="Participantes inválidos"
              aria-describedby="quiet-participants-error"
              aria-invalid="true"
              onValueChange={setInvalidParticipants}
              options={people}
              value={invalidParticipants}
            />
            <FieldError id="quiet-participants-error">
              Escolha pelo menos uma pessoa.
            </FieldError>
          </Field>
          <div className="hw-field">
            <DateField
              id="quiet-date-invalid"
              label="Data inválida"
              aria-describedby="quiet-date-error"
              aria-invalid="true"
              defaultValue="2026-09-07"
            />
            <FieldError id="quiet-date-error">Escolha uma data futura.</FieldError>
          </div>
        </div>
      </section>

      <section aria-labelledby="quiet-context-heading" className="hw-contract__canvas">
        <h2 id="quiet-context-heading">Filtro contextual · inválido</h2>
        <FilterBar
          aria-label="Busca contextual"
          filters={
            <Select
              ariaLabel="Status contextual"
              options={[
                { value: "all", label: "Todos" },
                { value: "published", label: "Publicado" },
              ]}
              value="all"
            />
          }
          search={
            <Field>
              <Label htmlFor="quiet-search-invalid">Busca inválida</Label>
              <Input
                id="quiet-search-invalid"
                aria-describedby="quiet-search-error"
                invalid
                type="search"
                value="Termo bloqueado"
                readOnly
              />
              <FieldError id="quiet-search-error">
                Revise os termos usados na busca.
              </FieldError>
            </Field>
          }
        />
      </section>

      <section aria-labelledby="quiet-disabled-heading" className="hw-contract__canvas">
        <h2 id="quiet-disabled-heading">Desabilitado</h2>
        <div className="hw-contract__form-grid">
          <Field>
            <Label htmlFor="quiet-text-disabled">Texto desabilitado</Label>
            <Input id="quiet-text-disabled" disabled value="Sem permissão" readOnly />
          </Field>
          <Field>
            <Label htmlFor="quiet-description-disabled">Descrição desabilitada</Label>
            <Textarea
              id="quiet-description-disabled"
              disabled
              value="Conteúdo indisponível"
              readOnly
            />
          </Field>
          <Field>
            <Label htmlFor="quiet-category-disabled">Categoria desabilitada</Label>
            <Select
              id="quiet-category-disabled"
              ariaLabel="Categoria desabilitada"
              disabled
              options={categories}
              value="culture"
            />
          </Field>
          <Field>
            <Label htmlFor="quiet-owner-disabled">Responsável desabilitado</Label>
            <Combobox
              id="quiet-owner-disabled"
              aria-label="Responsável desabilitado"
              disabled
              onValueChange={() => undefined}
              options={people}
              value="ana"
            />
          </Field>
          <Field>
            <Label htmlFor="quiet-participants-disabled">
              Participantes desabilitados
            </Label>
            <MultiSelect
              id="quiet-participants-disabled"
              aria-label="Participantes desabilitados"
              disabled
              onValueChange={() => undefined}
              options={people}
              value={["ana"]}
            />
          </Field>
          <DateField
            id="quiet-date-disabled"
            label="Data desabilitada"
            disabled
            value="2026-09-07"
            readOnly
          />
        </div>
      </section>

      <section aria-labelledby="quiet-readonly-heading" className="hw-contract__canvas">
        <h2 id="quiet-readonly-heading">Somente leitura</h2>
        <div className="hw-contract__form-grid">
          <Field>
            <Label htmlFor="quiet-text-readonly">Texto somente leitura</Label>
            <Input id="quiet-text-readonly" readOnly value="Código HR-204" />
          </Field>
          <Field>
            <Label htmlFor="quiet-description-readonly">
              Descrição somente leitura
            </Label>
            <Textarea
              id="quiet-description-readonly"
              readOnly
              value="Registro preservado para consulta."
            />
          </Field>
          <DateField
            id="quiet-date-readonly"
            label="Data somente leitura"
            readOnly
            value="2026-09-07"
          />
        </div>
      </section>
    </main>
  );
}

const meta = {
  title: "Contracts/Quiet fields",
  parameters: { layout: "padded" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const StateMatrix: Story = {
  render: () => <QuietFieldMatrix />,
};

export const CollectionConsumer: Story = {
  render: () => <CollectionDemo />,
};

export const RecoveryConsumer: Story = {
  render: () => <RecoveryDemo />,
};
