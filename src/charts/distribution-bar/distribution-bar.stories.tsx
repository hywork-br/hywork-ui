import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { bands, calibratedBands } from "../shared/fixtures";
import { DistributionBar } from "./index";

const meta = {
  title: "Gráficos/DistributionBar",
  component: DistributionBar,
  args: { bands, "aria-label": "Distribuição dos resultados", className: "max-w-[720px]" },
  parameters: {
    docs: {
      description: {
        component:
          "Distribuição em barra única empilhada (100%), na ordem recebida, com a legenda " +
          'embaixo: rótulo e, na linha de baixo, percentual e nota ("25% · 1 pessoa").\n\n' +
          "Só CSS, sem `recharts`. A legenda é o texto do gráfico; com `onSelect`, cada item " +
          "vira botão e cada fatia responde ao clique. Legenda numa linha, em duas ou em uma " +
          "coluna, conforme a largura — nunca 3 + 1.\n\n" +
          "**Cor das faixas: pendente da PO.** O padrão é uma rampa de `--chart-1`, do claro " +
          "ao escuro, sem verde, âmbar ou vermelho que pareçam estado; `color` aceita um token " +
          "`chart-1..5` por faixa. Importe de `@hywork/ui/charts`.",
      },
    },
  },
} satisfies Meta<typeof DistributionBar>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Quatro faixas de 25%, como no exemplo da HCK-256. */
export const Padrao: Story = {};

/** Depois da calibragem: uma faixa com 0% some da barra e segue na legenda. */
export const ComFaixaVazia: Story = { args: { bands: calibratedBands } };

/** Clicável: clique na fatia ou Tab até o item da legenda e Enter. */
export const Clicavel: Story = {
  render: (args) => {
    const [escolhida, setEscolhida] = React.useState("nenhuma");
    return (
      <div className="flex max-w-[720px] flex-col gap-3">
        <DistributionBar {...args} className={undefined} onSelect={setEscolhida} />
        <p className="text-sm text-muted-foreground">Escolhida: {escolhida}</p>
      </div>
    );
  },
};

/**
 * Cor por faixa, por token. Exemplo de API, não proposta: a cor de cada faixa
 * aguarda a decisão da PO.
 */
export const CorPorToken: Story = {
  args: { bands: bands.map((b, i) => ({ ...b, color: (["chart-5", "chart-1", "chart-5", "chart-1"] as const)[i] })) },
};

/** Sem ninguém no resultado: a trilha vazia, e a legenda com 0%. */
export const Zerada: Story = {
  args: { bands: bands.map((b) => ({ ...b, value: 0, note: "0 pessoas" })) },
};

/** Em 340px: uma faixa por linha na legenda. */
export const Estreita: Story = { args: { className: "w-[340px]" } };

/** Na metade de um painel: duas colunas. */
export const MeiaLargura: Story = { args: { className: "w-[480px]" } };
