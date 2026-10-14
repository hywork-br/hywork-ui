import type { Meta, StoryObj } from "@storybook/react-vite";
import { evolution, score } from "../shared/fixtures";
import { LineChart } from "./index";

const meta = {
  title: "Gráficos/LineChart",
  component: LineChart,
  args: {
    points: evolution,
    seriesLabel: "Média geral",
    domain: [1, 5],
    formatValue: score,
    categoryHeader: "Ciclo",
    className: "max-w-[720px]",
  },
  parameters: {
    docs: {
      description: {
        component:
          "Linha de uma série ao longo de categorias ordenadas — a média de cada ciclo.\n\n" +
          "Ponto com `provisional` sai vazado e o trecho até ele, tracejado (ciclo em andamento " +
          'ou em calibragem); ponto com `flag` vira losango ("Modelos diferentes"). Os dois ' +
          "textos entram na legenda, na dica e na tabela. Só o último valor é escrito no " +
          "desenho.\n\n" +
          "Importe de `@hywork/ui/charts`. Proposta para o DHO (HCK-256): o visual aguarda o aval da PO.",
      },
    },
  },
} satisfies Meta<typeof LineChart>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Cinco ciclos: um com modelo diferente e o atual provisório. */
export const Padrao: Story = {};

/** Em andamento: o ponto atual é parcial. */
export const Parcial: Story = {
  args: { points: evolution.map((p) => (p.provisional ? { ...p, provisional: "Parcial" } : p)) },
};

/** Todos encerrados: linha cheia e sem legenda — o título diz o que é. */
export const SoEncerrados: Story = {
  args: { points: evolution.map(({ provisional: _p, flag: _f, ...p }) => p) },
};

/** Um ciclo sem dado: a linha se interrompe, e a tabela mostra "—". */
export const ComLacuna: Story = {
  args: { points: evolution.map((p) => (p.id === "2024.2" ? { ...p, value: null } : p)) },
};

/** Primeiro ciclo: um ponto só, provisório. */
export const PrimeiroCiclo: Story = { args: { points: evolution.slice(-1) } };

/** Em 340px: os nomes quebram em duas linhas. */
export const Estreito: Story = { args: { className: "w-[340px]" } };

/** Largura fixa de impressão (640px): sem medir, sem animar. */
export const Impressao: Story = { args: { width: 640, className: undefined } };
