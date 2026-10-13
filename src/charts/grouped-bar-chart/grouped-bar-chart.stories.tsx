import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { comparison, competencies, cycles, leaderSelf, pillars, score } from "../shared/fixtures";
import { GroupedBarChart } from "./index";

const meta = {
  title: "Gráficos/GroupedBarChart",
  component: GroupedBarChart,
  args: {
    categories: pillars,
    series: leaderSelf,
    domain: [0, 5],
    formatValue: score,
    categoryHeader: "Pilar",
    className: "max-w-[720px]",
  },
  parameters: {
    docs: {
      description: {
        component:
          "Barras agrupadas na horizontal: uma linha por categoria, uma barra por série. " +
          "O nome da categoria quebra na coluna da esquerda, com nota e marcador embaixo; o " +
          "valor formatado fica na ponta da barra.\n\n" +
          'Valor `null` não desenha barra e vira "—" na tabela do leitor de tela. Com ' +
          "`onSelect`, o clique em qualquer ponto da linha escolhe a categoria e cada linha " +
          "ganha um botão de teclado.\n\n" +
          "Uma série só? Use o `BarList`. Importe de `@hywork/ui/charts`. Proposta para o DHO " +
          "(HCK-256): o visual aguarda o aval da PO.",
      },
    },
  },
} satisfies Meta<typeof GroupedBarChart>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Por pilar: líder × autoavaliação, números do exemplo da HCK-256. */
export const Padrao: Story = {};

/** Comparar ciclos: o ciclo atual e o comparado; sem dado do outro lado, a barra não aparece. */
export const ComparacaoDeCiclos: Story = {
  args: { categories: comparison, series: cycles, categoryHeader: "Competência" },
};

/** Muitas categorias com nomes longos: a altura cresce, o nome quebra, o marcador fica. */
export const NomesLongos: Story = { args: { categories: competencies, categoryHeader: "Competência" } };

/** Clicável: clique na linha ou Tab até ela e Enter. */
export const Clicavel: Story = {
  render: (args) => {
    const [escolhida, setEscolhida] = React.useState("nenhuma");
    return (
      <div className="flex max-w-[720px] flex-col gap-3">
        <GroupedBarChart {...args} onSelect={setEscolhida} />
        <p className="text-sm text-muted-foreground">Escolhida: {escolhida}</p>
      </div>
    );
  },
};

/** Uma série, quando a autoavaliação está desligada: sem legenda, o título diz o que é. */
export const UmaSerie: Story = { args: { series: [leaderSelf[0]] } };

/** Sem domínio: de 0 ao maior valor, num passo redondo. */
export const DominioAutomatico: Story = {
  args: {
    domain: undefined,
    formatValue: undefined,
    categories: [
      { id: "a", label: "Comercial", values: { leader: 12, self: 18 } },
      { id: "b", label: "Operações", values: { leader: 34, self: 27 } },
    ],
  },
};

/** Largura fixa de impressão (640px): sem medir, sem animar. */
export const Impressao: Story = { args: { width: 640, className: undefined } };

/** Em 320px: a coluna do nome nunca fica mais estreita que a palavra mais longa. */
export const Estreito: Story = { args: { className: "w-[320px]" } };
