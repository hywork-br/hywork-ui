import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChartFrame } from "../chart-frame";
import { competencies, leaderSelf, pillars, score } from "../shared/fixtures";
import { RadarChart } from "./index";

const meta = {
  title: "Gráficos/RadarChart",
  component: RadarChart,
  args: {
    categories: competencies,
    series: leaderSelf,
    domain: [0, 5],
    formatValue: score,
    categoryHeader: "Competência",
    className: "max-w-[720px]",
  },
  parameters: {
    docs: {
      description: {
        component:
          "Radar: uma série por polígono, um eixo por categoria. Cada eixo mostra o nome e, " +
          'embaixo, a nota e o marcador ("2 pessoas", "poucos dados").\n\n' +
          "Com `onSelect`, o nome do eixo é um botão e o clique no setor também escolhe. Valor " +
          "`null` abre o polígono naquele eixo em vez de puxá-lo para o centro. Com menos de " +
          "três categorias, ou abaixo de 360px de largura, desenha barras agrupadas com os " +
          "mesmos dados.\n\n" +
          "Importe de `@hywork/ui/charts`. Proposta para o DHO (HCK-256): o visual aguarda o aval da PO.",
      },
    },
  },
} satisfies Meta<typeof RadarChart>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Líder × autoavaliação em seis competências, uma com poucos dados. */
export const Padrao: Story = {};

/** Clicável: Tab até o nome do eixo e Enter, ou clique no eixo ou no setor. */
export const Clicavel: Story = {
  render: (args) => {
    const [escolhida, setEscolhida] = React.useState("nenhuma");
    return (
      <div className="flex max-w-[720px] flex-col gap-3">
        <RadarChart {...args} onSelect={setEscolhida} />
        <p className="text-sm text-muted-foreground">Escolhida: {escolhida}</p>
      </div>
    );
  },
};

/** Só o líder, com a autoavaliação desligada no ciclo: sem legenda. */
export const UmaSerie: Story = { args: { series: [leaderSelf[0]] } };

/** Sem autoavaliação numa competência: o polígono se abre ali, sem ponto no centro. */
export const SemValorNumEixo: Story = {
  args: {
    categories: competencies.map((c) => (c.id === "c3" ? { ...c, values: { ...c.values, self: null } } : c)),
  },
};

/** Duas categorias: o radar não tem forma, e o componente desenha barras agrupadas. */
export const PoucosEixos: Story = { args: { categories: pillars, categoryHeader: "Pilar" } };

/** Em 340px: abaixo de 360px o radar vira barras agrupadas. */
export const Estreito: Story = { args: { className: "w-[340px]" } };

/** Largura fixa de impressão (640px): sem medir, sem animar. */
export const Impressao: Story = { args: { width: 640, className: undefined } };

/** Dentro da moldura, como na tela de resultados. */
export const NaMoldura: Story = {
  render: (args) => (
    <ChartFrame
      className="max-w-[760px]"
      title="Resultado por competência"
      base="4 pessoas"
      howCalculated="Média do líder na competência: soma das notas do líder dividida pelo número de pessoas que a receberam."
      footer="Não muda com a calibragem."
    >
      <RadarChart {...args} className={undefined} />
    </ChartFrame>
  ),
};
