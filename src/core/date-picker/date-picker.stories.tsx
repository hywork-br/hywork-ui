import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DatePicker, type DatePickerProps } from "./index";

/** A story guarda o valor só para demonstrar; na tela, quem guarda é o formulário. */
function Controlado(props: DatePickerProps) {
  const [valor, setValor] = React.useState(props.value);
  React.useEffect(() => setValor(props.value), [props.value]);
  return (
    <div className="w-[280px] space-y-3">
      <DatePicker {...props} value={valor} onChange={setValor} />
      <p className="text-xs text-muted-foreground">
        Valor: <code>{valor === null ? "null" : `"${valor}"`}</code>
      </p>
    </div>
  );
}

const meta = {
  title: "Core/DatePicker",
  component: DatePicker,
  args: { label: "Início", value: null, onChange: () => undefined },
  render: (args) => <Controlado {...args} />,
  parameters: {
    docs: {
      description: {
        component:
          "Data única. Mostra dd/mm/aaaa e devolve a string `YYYY-MM-DD`, sem " +
          "fuso — é uma data de calendário, não um instante.\n\n" +
          "Digita-se direto no campo (as barras entram sozinhas, e colar " +
          "`2026-10-12` também vale) ou escolhe-se no calendário, que abre pelo " +
          "botão ou por Alt+↓. No calendário: setas andam dia e semana, " +
          "PageUp/PageDown trocam o mês (com Shift, o ano), Home/End vão ao " +
          "início e ao fim da semana, Enter escolhe e Esc fecha.\n\n" +
          "Datas fora de `min`/`max` ficam desabilitadas. Texto que não é data, " +
          "ou fora do intervalo, devolve `null` e mostra o motivo colado ao campo. " +
          "O aval visual da PO ainda está pendente.",
      },
    },
  },
} satisfies Meta<typeof DatePicker>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Vazio, à espera da data. */
export const Padrao: Story = {};

/** Com valor. */
export const Preenchido: Story = { args: { value: "2026-10-12" } };

/**
 * Com limites: o encerramento não pode vir antes do início nem passar do fim
 * do ano. Os dias fora do intervalo aparecem desabilitados no calendário.
 */
export const ComMinEMax: Story = {
  args: { label: "Encerramento", value: "2026-10-20", min: "2026-10-12", max: "2026-12-31" },
};

/** Erro vindo do formulário, colado ao campo e ligado por `aria-describedby`. */
export const ComErro: Story = {
  args: { label: "Encerramento", error: "Informe a data de encerramento." },
};

/** Indisponível — em geral porque outro campo ainda não foi preenchido. */
export const Desabilitado: Story = { args: { value: "2026-10-12", disabled: true } };

/** Dois campos lado a lado, o segundo limitado pelo primeiro. */
export const Periodo: Story = {
  render: () => {
    const [inicio, setInicio] = React.useState<string | null>("2026-10-12");
    const [fim, setFim] = React.useState<string | null>(null);
    return (
      <div className="grid w-[580px] grid-cols-2 gap-4">
        <DatePicker label="Início" value={inicio} onChange={setInicio} max={fim ?? undefined} />
        <DatePicker label="Encerramento" value={fim} onChange={setFim} min={inicio ?? undefined} />
      </div>
    );
  },
};
