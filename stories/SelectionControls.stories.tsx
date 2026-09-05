import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import {
  Checkbox,
  Radio,
  Switch,
  Combobox,
  MultiSelect,
  DateField,
  DateRangeField,
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
