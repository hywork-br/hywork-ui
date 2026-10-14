import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../../core/button";
import { GroupedBarChart } from "../grouped-bar-chart";
import { leaderSelf, pillars, score } from "../shared/fixtures";
import { ChartFrame } from "./index";

const grafico = <GroupedBarChart categories={pillars} series={leaderSelf} domain={[0, 5]} formatValue={score} categoryHeader="Pilar" />;

const meta = {
  title: "Gráficos/ChartFrame",
  component: ChartFrame,
  args: {
    title: "Por pilar",
    base: "4 pessoas",
    howCalculated:
      "Nota do pilar da pessoa: média ponderada das notas do líder nas competências do pilar. " +
      "Média do pilar no ciclo: média simples entre as pessoas.",
    footer: "Não muda com a calibragem.",
    children: grafico,
    className: "max-w-[720px]",
  },
  parameters: {
    docs: {
      description: {
        component:
          'Moldura de gráfico: título, base ("4 pessoas"), o botão "Como é calculado", ' +
          "controles à direita, o gráfico e o rodapé.\n\n" +
          "`state` troca o gráfico pelo esqueleto (`loading`) ou pela frase de vazio " +
          '(`empty`, "Sem dados suficientes" ou a de `emptyMessage`); título, base e ' +
          "rodapé ficam. Moldura do Card, título de 18px.\n\n" +
          "Importe de `@hywork/ui/charts`. Proposta para o DHO (HCK-256): o visual aguarda o aval da PO.",
      },
    },
  },
} satisfies Meta<typeof ChartFrame>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Título, base, "Como é calculado", gráfico e rodapé. */
export const Padrao: Story = {};

/** Controles no cabeçalho, à direita — quebram para baixo do título quando falta espaço. */
export const ComAcoes: Story = {
  args: {
    actions: (
      <Button variant="outline" size="sm">
        Ver pessoas
      </Button>
    ),
  },
};

/** Só o título e o gráfico. */
export const Minimo: Story = { args: { base: undefined, howCalculated: undefined, footer: undefined } };

/** Carregando: o esqueleto no lugar do gráfico; título, base e rodapé ficam. */
export const Carregando: Story = { args: { state: "loading" } };

/** Base zero: "Sem dados suficientes" no lugar do gráfico. */
export const Vazio: Story = { args: { state: "empty", base: "0 pessoas" } };

/** Vazio com a frase da tela — o filtro não encontrou ninguém. */
export const VazioComFrase: Story = {
  args: { state: "empty", base: "0 pessoas", emptyMessage: "Nenhuma pessoa neste filtro" },
};

/** Em 360px: o botão "Como é calculado" desce para baixo do título em vez de espremê-lo. */
export const Estreito: Story = { args: { className: "w-[360px]" } };
