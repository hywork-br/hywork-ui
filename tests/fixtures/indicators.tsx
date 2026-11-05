import * as React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/montserrat";
import { Progress, RatingScale } from "../../src/core";
import { BarList, StatCard } from "../../src/platform/index";
import { brandThemeVars } from "../../src/theme";

// The DHO result screens of 19/10/2026 (HCK-255, HCK-259, HCK-235) on the
// package CSS: StatCard tones and icon colors, the Progress and BarList
// markers, and the 1-to-10 RatingScale. What jsdom cannot measure lives here:
// contrast, the marker geometry and the 360px width. `?theme=dark` puts
// `.dark` on <html>; `?theme=tenant` applies a light workspace brand.
const params = new URLSearchParams(location.search);
const css = document.createElement("link");
css.rel = "stylesheet";
css.href = "/.storybook/static/package.css";
document.head.append(css);
const html = document.documentElement;
html.style.setProperty("--font-montserrat", '"Montserrat Variable", sans-serif');
if (params.get("theme") === "dark") html.classList.add("dark");
if (params.get("theme") === "tenant")
  for (const [name, value] of Object.entries(brandThemeVars("#f59e0b"))) html.style.setProperty(name, value);
document.body.className = "bg-background text-foreground";

const icon = <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor"><circle cx="8" cy="8" r="6" /></svg>;
const dez = [
  "Muito abaixo do esperado",
  "Abaixo do esperado",
  "Em desenvolvimento",
  "Atende parcialmente",
  "Próximo do esperado",
  "Atende ao esperado",
  "Acima do esperado",
  "Supera as expectativas",
  "Excelente desempenho",
  "É referência",
];

function Escala(props: Partial<React.ComponentProps<typeof RatingScale>> & { nome: string }) {
  const { nome, ...rest } = props;
  const [valor, setValor] = React.useState<number | null>(rest.value ?? null);
  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold">{nome}</h2>
      <RatingScale name={nome} aria-label={nome} labels={dez} {...rest} value={valor} onChange={setValor} />
    </section>
  );
}

// `?cards=226` renders rows of four fixed-width StatCards: the counters of
// HCK-255/HCK-259 at 1280px with the menu open (226px) or at 1440px (266px).
// Only on demand, so the 360px tests above never see a 4-card row.
const largura = Number(params.get("cards")) || 0;
const contadores = [
  { label: "Média geral", value: "3,8", note: "empresa 3,7", iconTone: "primary" },
  { label: "Participação", value: "82%", valueDetail: "9 de 11", progress: 82, iconTone: "info" },
  { label: "Acima do esperado", value: "3", note: "27% do time", iconTone: "success", delta: { value: "−1", tone: "negative" } },
  { label: "Abaixo do esperado", value: "2", note: "Sugerem PDI imediato", iconTone: "warning" },
] as const;
type Fileira = { nome: string; tone: (i: number) => "default" | "attention" | "highlight"; semIcone?: boolean };
const fileiras: Fileira[] = [
  // As in the cycle results: the last counter is the attention card.
  { nome: "tela", tone: (i) => (i === 3 ? "attention" : "default") },
  { nome: "default", tone: () => "default" },
  { nome: "attention", tone: () => "attention" },
  { nome: "highlight", tone: () => "highlight" },
  { nome: "sem-icone", tone: () => "default", semIcone: true },
];

function Fileiras() {
  return (
    <section aria-label="Fileiras" className="space-y-4">
      {fileiras.map(({ nome, tone, semIcone }) => (
        <div key={nome} data-testid={"fileira-" + nome} className="flex gap-4">
          {contadores.map(({ iconTone, ...cartao }, i) => (
            <StatCard
              key={cartao.label}
              {...cartao}
              tone={tone(i)}
              icon={semIcone ? undefined : icon}
              iconTone={semIcone ? undefined : iconTone}
              style={{ width: largura, flex: "none" }}
            />
          ))}
        </div>
      ))}
    </section>
  );
}

function Pagina() {
  return (
    <main className={largura ? "space-y-8 p-4 font-sans" : "mx-auto max-w-5xl space-y-8 p-4 font-sans"}>
      <h1 className="text-2xl font-bold">Indicadores</h1>

      {largura > 0 && <Fileiras />}

      <section aria-label="Contadores" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          data-testid="destaque"
          label="Nota do colaborador"
          value="84%"
          valueDetail="4,2 / 5,0"
          progress={84}
          note="Média ponderada 4,2 ÷ 5,0"
          tone="highlight"
        />
        <StatCard
          label="Nota final"
          value="84%"
          valueDetail="4,2 / 5,0"
          tone="highlight"
          icon={icon}
          iconTone="success"
          delta={{ value: "+0,3", tone: "positive" }}
        />
        <StatCard label="Participação" value="82%" valueDetail="9 de 11" progress={82} note="responderam" icon={icon} iconTone="info" />
        <StatCard label="Abaixo do esperado" value="2" valueDetail="18%" progress={18} note="Sugerem PDI imediato" icon={icon} tone="attention" />
        <StatCard label="Acima do esperado" value="3" icon={icon} iconTone="success" delta={{ value: "−1", tone: "negative" }} />
        <StatCard label="Perigo" value="1" icon={icon} iconTone="danger" />
        <StatCard label="Neutro" value="5" icon={icon} iconTone="neutral" delta={{ value: "estável", tone: "neutral" }} />
        <StatCard label="Primária" value="12" icon={icon} iconTone="primary" />
      </section>

      <section aria-label="Barras" className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-4">
          <Progress data-testid="com-marca" aria-label="Nota final" value={84} marker={72} markerLabel="Autoavaliação: 72%" />
          <Progress aria-label="Comunicação" value={38} tone="attention" marker={64} />
          <Progress aria-label="Sem marca" value={60} />
        </div>
        <BarList
          data-testid="time-empresa"
          aria-label="Time vs. empresa"
          max={5}
          items={[
            { id: "a", label: "Entrega e execução", value: 4.1, marker: 3.8, valueLabel: "4,1 · empresa 3,8", markerLabel: "Empresa: 3,8" },
            { id: "b", label: "Comunicação", value: 3.4, marker: 3.7, valueLabel: "3,4 · empresa 3,7", markerLabel: "Empresa: 3,7", tone: "attention" },
          ]}
        />
      </section>

      <Escala nome="Dez vazia" />
      <Escala nome="Dez escolhida" value={6} compareValue={8} />
      <Escala nome="Dez só leitura" value={7} readOnly />
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<Pagina />);
