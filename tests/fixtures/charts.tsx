import * as React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/montserrat";
import { ChartFrame, DistributionBar, DonutChart, GroupedBarChart, LineChart, RadarChart, donutColors } from "../../src/charts";
import { areas, bands, comparison, competencies, cycles, evolution, leaderSelf, pillars, score } from "../../src/charts/shared/fixtures";

// The charts of HCK-256 with the numbers of its example, on the package CSS.
// `?print` renders them at a fixed width, as the print view does; `?theme=tenant`
// applies a workspace brand, which the charts must not follow.
const params = new URLSearchParams(location.search);
const css = document.createElement("link");
css.rel = "stylesheet";
css.href = "/.storybook/static/package.css";
document.head.append(css);
document.documentElement.style.setProperty("--font-montserrat", '"Montserrat Variable", sans-serif');
if (params.get("theme") === "tenant") {
  document.documentElement.style.setProperty("--hw-brand-primary", "270 60% 35%");
  document.documentElement.style.setProperty("--hw-brand-primary-foreground", "0 0% 100%");
}
const width = params.has("print") ? 640 : undefined;

function Page() {
  const [selected, setSelected] = React.useState("nenhuma");
  const pick = (chart: string) => (id: string) => setSelected(`${chart}: ${id}`);
  return (
    <main className="mx-auto grid max-w-5xl gap-6 p-4 sm:p-6" aria-label="Gráficos">
      <h1 className="text-2xl font-semibold">Gráficos</h1>
      <p role="status" data-testid="selected" className="text-sm">
        Selecionado: {selected}
      </p>
      <ChartFrame
        title="Resultado por competência"
        base="4 pessoas"
        howCalculated="Média do líder na competência: soma das notas do líder dividida pelo número de pessoas que a receberam."
        footer="Não muda com a calibragem."
      >
        <RadarChart
          categories={competencies}
          series={leaderSelf}
          domain={[0, 5]}
          formatValue={score}
          onSelect={pick("radar")}
          categoryHeader="Competência"
          width={width}
        />
      </ChartFrame>
      <ChartFrame title="Por pilar" base="4 pessoas" footer="Não muda com a calibragem.">
        <GroupedBarChart
          categories={pillars}
          series={leaderSelf}
          domain={[0, 5]}
          formatValue={score}
          onSelect={pick("pilar")}
          categoryHeader="Pilar"
          width={width}
        />
      </ChartFrame>
      <ChartFrame title="Distribuição dos resultados" base="4 pessoas" footer="Baseado na nota final do ciclo">
        <DistributionBar bands={bands} onSelect={pick("faixa")} />
      </ChartFrame>
      <ChartFrame title="Evolução" base="Companhia" footer="Baseado na nota original, provisória">
        <LineChart points={evolution} seriesLabel="Média geral" domain={[1, 5]} formatValue={score} categoryHeader="Ciclo" width={width} />
      </ChartFrame>
      <ChartFrame title="Comparar ciclos" base="Competências em comum">
        <GroupedBarChart
          categories={comparison}
          series={cycles}
          domain={[0, 5]}
          formatValue={score}
          categoryHeader="Competência"
          width={width}
        />
      </ChartFrame>
      <ChartFrame title="Por estrutura organizacional" base="Clique em uma área para o detalhe.">
        <div className="flex flex-col items-center gap-5">
          <DonutChart
            aria-label="Pessoas por área"
            segments={areas}
            centerValue="3,8"
            centerLabel="Média geral"
            size={180}
            onSegmentClick={pick("área")}
          />
          <ul className="flex w-full flex-col gap-1">
            {areas.map((area, i) => (
              <li key={area.id} className="flex items-center gap-2.5 px-2 py-1 text-sm">
                <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: donutColors(areas)[i] }} />
                <span className="flex-1 font-semibold">{area.label}</span>
                <span className="tabular-nums text-muted-foreground">{area.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </ChartFrame>
      <ChartFrame title="Por estrutura organizacional, sem dados" state="empty" footer="Baseado na nota final do ciclo" />
      <ChartFrame title="Líderes" state="loading" />
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<Page />);
