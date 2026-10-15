import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { areas } from "../shared/fixtures";
import { DonutChart, donutColors } from "./index";

const meta = {
  title: "Gráficos/DonutChart",
  component: DonutChart,
  args: { segments: areas, centerValue: "3,8", centerLabel: "Média geral" },
  parameters: {
    docs: {
      description: {
        component:
          "Rosca: uma fatia por segmento, na ordem recebida, a partir do topo e no sentido " +
          "horário, do tamanho de `value / soma`. No centro, opcionalmente, um valor em " +
          'destaque e um rótulo pequeno em caixa alta ("3,8" / "MÉDIA GERAL").\n\n' +
          "SVG puro, sem `recharts`. Fatias separadas por 2px da superfície; segmento com " +
          "valor 0 não desenha. Sem legenda embutida: a tela monta a lista ao lado, com as " +
          "cores de `donutColors(segments)` — as mesmas do desenho. `legend` liga uma legenda " +
          "simples embaixo.\n\n" +
          "Cores pela ordem fixa das séries (`chart-1`, `chart-5`, `chart-2..4`); do sexto " +
          "segmento em diante, a mesma ordem mais clara. `color` aceita um token `chart-1..5`, " +
          'nunca uma cor livre. O leitor de tela ouve "rótulo: valor" de cada segmento. ' +
          "Importe de `@hywork/ui/charts`.",
      },
    },
  },
} satisfies Meta<typeof DonutChart>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Seis áreas e a média geral no centro, como no protótipo da HCK-256. */
export const Padrao: Story = {};

/** No tamanho do protótipo (180px). O texto do centro cresce junto. */
export const Grande: Story = { args: { size: 180 } };

/** Sem centro: só a rosca. */
export const SemCentro: Story = { args: { centerValue: undefined, centerLabel: undefined } };

/** Com a legenda simples embaixo, para quando a tela não monta a lista. */
export const ComLegenda: Story = { args: { legend: true } };

/** Um segmento com valor 0 não desenha; os outros mantêm a cor da posição. */
export const ComSegmentoZerado: Story = {
  args: { segments: areas.map((a) => (a.id === "product" ? { ...a, value: 0 } : a)) },
};

/** Soma zero: só o trilho neutro. */
export const Zerada: Story = { args: { segments: areas.map((a) => ({ ...a, value: 0 })), centerValue: "—" } };

/** Cor por token. Exemplo de API: a cor de cada segmento é da tela só dentro da paleta. */
export const CorPorToken: Story = {
  args: { segments: areas.slice(0, 2).map((a, i) => ({ ...a, color: (["chart-5", "chart-1"] as const)[i] })) },
};

/**
 * Como a tela usa: a rosca e, ao lado, a lista clicável com as mesmas cores.
 * Com `onSegmentClick`, a fatia também responde ao clique e ao teclado (Tab, Enter).
 */
export const ComListaAoLado: Story = {
  render: (args) => {
    const [escolhida, setEscolhida] = React.useState("nenhuma");
    const colors = donutColors(args.segments);
    return (
      <div className="flex max-w-[560px] flex-col gap-4">
        <div className="flex flex-wrap items-center gap-6">
          <DonutChart {...args} aria-label="Pessoas por área" onSegmentClick={setEscolhida} />
          <ul className="flex min-w-[200px] flex-1 flex-col gap-1">
            {args.segments.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setEscolhida(s.id)}
                  className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: colors[i] }} />
                  <span className="flex-1 font-semibold text-foreground">{s.label}</span>
                  <span className="tabular-nums text-muted-foreground">{s.value}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-muted-foreground">Escolhida: {escolhida}</p>
      </div>
    );
  },
};
