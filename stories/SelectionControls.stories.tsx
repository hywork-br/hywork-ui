import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import {
  Button,
  Checkbox,
  Radio,
  Switch,
  Combobox,
  MultiSelect,
  DateField,
  DateRangeField,
  FieldError,
  FileUpload,
  type FileUploadItem,
} from "../src";

const meta = {
  title: "Components/Seleção",
  parameters: { layout: "padded" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
const options = [
  { value: "academy", label: "Academy", description: "Educação corporativa" },
  { value: "tv", label: "TV corporativa", disabled: true },
  { value: "campaigns", label: "Campanhas" },
];

function LocalFileSelection() {
  const [reading, setReading] = useState(false);
  const [result, setResult] = useState('Nenhum arquivo lido.');
  return <div className="hw-surface-admin">
    <p>Leitura local para verificar o retorno de foco. Nenhum upload.</p>
    <FileUpload label="Arquivo local" items={[]} disabled={reading} onFilesChange={files => {
      setReading(true);
      files[0].text().then(() => setResult(`Lido: ${files[0].name}`), () => setResult('Não foi possível ler o arquivo.')).finally(() => setReading(false));
    }} />
    <p role="status">{reading ? 'Lendo arquivo…' : result}</p>
    <Button type="button" variant="quiet">Próxima ação</Button>
  </div>;
}
export const LocalSelectionFocus: Story = { render: () => <LocalFileSelection /> };

function Example() {
  const [channel, setChannel] = useState("");
  const [channels, setChannels] = useState<string[]>(["academy"]);
  const [checked, setChecked] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [radio, setRadio] = useState("all");
  const [date, setDate] = useState("");
  const [range, setRange] = useState({ from: "2026-09-10", to: "2026-09-01" });
  const [items, setItems] = useState<FileUploadItem[]>([
    { id: "demo", name: "Relatório.pdf", progress: 30, status: "uploading" },
    {
      id: "error",
      name: "Foto.png",
      progress: 0,
      status: "error",
      error: "Demonstração: conexão interrompida.",
    },
    { id: "complete", name: "Guia.pdf", progress: 100, status: "complete" },
    { id: "cancelled", name: "Vídeo.mp4", progress: 20, status: "cancelled" },
  ]);
  useEffect(() => {
    const timer = window.setInterval(
      () =>
        setItems((current) =>
          current.map((item) =>
            item.status === "uploading"
              ? {
                  ...item,
                  progress: Math.min(100, item.progress + 10),
                  status: item.progress >= 90 ? "complete" : "uploading",
                }
              : item
          )
        ),
      2000
    );
    return () => window.clearInterval(timer);
  }, []);
  return (
    <div className="hw-selection-demo">
      <h2>Seleção e arquivos</h2>
      <div>
        <label>
          <Checkbox
            checked={checked}
            onChange={(event) => setChecked(event.target.checked)}
          />{" "}
          Receber resumo
        </label>
        <label>
          <Checkbox indeterminate disabled /> Seleção parcial
        </label>
        <label>
          <Checkbox disabled /> Indisponível
        </label>
      </div>
      <fieldset className="hw-date-range">
        <legend className="hw-label">Público</legend>
        {[
          { value: "all", label: "Todos" },
          { value: "team", label: "Minha equipe" },
        ].map((item) => (
          <label key={item.value}>
            <Radio
              name="audience"
              value={item.value}
              checked={radio === item.value}
              onChange={() => setRadio(item.value)}
            />
            {item.label}
          </label>
        ))}
      </fieldset>
      <label>
        <Switch
          checked={enabled}
          onChange={(event) => setEnabled(event.target.checked)}
        />{" "}
        Notificações ativas
      </label>
      <Combobox
        aria-label="Canal"
        placeholder="Escolha um canal"
        options={options}
        value={channel}
        onValueChange={setChannel}
      />
      <Combobox
        aria-label="Canal indisponível"
        disabled
        options={options}
        value="academy"
        onValueChange={() => undefined}
      />
      <MultiSelect
        aria-label="Canais selecionados"
        placeholder="Buscar canais"
        options={options}
        value={channels}
        onValueChange={setChannels}
      />
      <DateField
        label="Publicação"
        value={date}
        onChange={(event) => setDate(event.target.value)}
      />
      <DateField label="Publicação indisponível" disabled value="2026-09-05" />
      <DateRangeField label="Período" value={range} onValueChange={setRange} />
      <DateRangeField
        label="Período indisponível"
        disabled
        value={{ from: "2026-09-01", to: "2026-09-30" }}
        onValueChange={() => undefined}
      />
      <p>
        Datas são exibidas no formato nativo do navegador; os valores usam ISO
        (AAAA-MM-DD).
      </p>
      <p>
        Upload demonstrativo local: o progresso é simulado apenas nesta story.
        Nenhum arquivo é enviado.
      </p>
      <FileUpload
        label="Anexos"
        multiple
        items={items}
        onFilesChange={(files) =>
          setItems((current) => [
            ...current,
            ...files.map((file) => ({
              id: crypto.randomUUID(),
              name: file.name,
              progress: 0,
              status: "uploading" as const,
            })),
          ])
        }
        onCancel={(id) =>
          setItems((current) =>
            current.map((item) =>
              item.id === id ? { ...item, status: "cancelled" } : item
            )
          )
        }
        onRetry={(id) =>
          setItems((current) =>
            current.map((item) =>
              item.id === id
                ? {
                    ...item,
                    status: "uploading",
                    progress: 0,
                    error: undefined,
                  }
                : item
            )
          )
        }
      />
    </div>
  );
}
export const Interactive: Story = {
  render: () => <Example />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox", { name: "Canal" });
    await userEvent.click(input);
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    await expect(input).toHaveValue("Campanhas");
    await expect(input).toHaveAttribute("aria-expanded", "false");
    await userEvent.keyboard("{ArrowDown}{Escape}");
    await expect(input).toHaveFocus();
  },
};

/* Estados desenhados pelo DS: caixa vazia, marcada, parcial, inválida e
   indisponível, mais o radio nos mesmos estados. Existe porque com aparência
   nativa não havia o que medir — o limite do controle era decisão do navegador,
   e o Firefox reprovava o piso de 3:1. Nada aqui é controle falso: menos os
   `disabled`, todos operam de verdade. */
function ChoiceStates() {
  const [marked, setMarked] = useState(true);
  const [empty, setEmpty] = useState(false);
  const [partial, setPartial] = useState<"partial" | boolean>("partial");
  const [accepted, setAccepted] = useState(false);
  const [pick, setPick] = useState("sim");
  return (
    <div className="hw-selection-demo">
      <h2>Estados de escolha</h2>
      <div className="hw-choice-states">
        <label>
          <Checkbox checked={marked} onChange={(event) => setMarked(event.target.checked)} /> Marcada
        </label>
        <label>
          <Checkbox checked={empty} onChange={(event) => setEmpty(event.target.checked)} /> Vazia
        </label>
        <label>
          <Checkbox
            checked={partial === true}
            indeterminate={partial === "partial"}
            onChange={(event) => setPartial(event.target.checked)}
          />{" "}
          Parcial
        </label>
        <label>
          <Checkbox
            aria-describedby={accepted ? undefined : "choice-invalid-error"}
            aria-invalid={accepted ? undefined : "true"}
            checked={accepted}
            onChange={(event) => setAccepted(event.target.checked)}
          />{" "}
          Inválida
        </label>
        <label>
          <Checkbox checked disabled onChange={() => undefined} /> Indisponível marcada
        </label>
        <label>
          <Checkbox disabled checked={false} onChange={() => undefined} /> Indisponível vazia
        </label>
      </div>
      {accepted ? null : (
        <FieldError id="choice-invalid-error">Aceite os termos para continuar.</FieldError>
      )}
      <fieldset className="hw-date-range">
        <legend className="hw-label">Exclusiva</legend>
        <div className="hw-choice-states">
          {[
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
          ].map((item) => (
            <label key={item.value}>
              <Radio
                name="choice-states"
                value={item.value}
                checked={pick === item.value}
                onChange={() => setPick(item.value)}
              />
              {item.label}
            </label>
          ))}
          <label>
            <Radio name="choice-states-off" disabled checked onChange={() => undefined} /> Indisponível
          </label>
        </div>
      </fieldset>
    </div>
  );
}

export const ChoiceStateMatrix: Story = {
  render: () => <ChoiceStates />,
  /* jsdom não resolve custom property; este contrato só diz a verdade no
     navegador, e é lá que ele roda. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const marked = canvas.getByRole("checkbox", { name: "Marcada" });
    const empty = canvas.getByRole("checkbox", { name: "Vazia" });
    const invalid = canvas.getByRole("checkbox", { name: "Inválida" });
    const radio = canvas.getByRole("radio", { name: "Sim" });

    // Valor computado do papel, para comparar com o que a tela pinta.
    const role = (token: string) => {
      const probe = document.createElement("span");
      probe.style.backgroundColor = `var(${token})`;
      canvasElement.append(probe);
      const value = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return value;
    };

    // O limite do controle é do DS, não do navegador: era aí que o Firefox
    // pintava um cinza de 2,90:1 e nenhum gate media.
    await expect(getComputedStyle(empty).appearance).toBe("none");
    await expect(getComputedStyle(empty).borderTopColor).toBe(role("--hw-input-border"));
    await expect(getComputedStyle(empty).backgroundColor).toBe(role("--hw-surface"));
    await expect(getComputedStyle(marked).backgroundColor).toBe(role("--hw-primary"));
    await expect(getComputedStyle(marked, "::before").backgroundColor).toBe(role("--hw-primary-fg"));
    await expect(getComputedStyle(radio).backgroundColor).toBe(role("--hw-primary"));
    await expect(getComputedStyle(invalid).borderTopColor).toBe(role("--hw-danger-strong"));

    // Desenhar o controle não pode custar o comportamento nativo do input.
    await userEvent.click(empty);
    await expect(empty).toBeChecked();
    await expect(getComputedStyle(empty).backgroundColor).toBe(role("--hw-primary"));
    await userEvent.click(empty);
    await expect(empty).not.toBeChecked();
    await expect(getComputedStyle(empty).backgroundColor).toBe(role("--hw-surface"));
  },
};
