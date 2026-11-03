import * as React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/montserrat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../src/core";
import { brandThemeVars } from "../../src/theme";

// Horizontal tabs that do not fit (HCK-258): the six tabs of the DHO cycle
// page across the whole width, three tabs that always fit, and a vertical list
// that must not change. `?product=builder` loads the intranet CSS instead of
// the admin one; `?brand=f97316` applies a workspace brand. The cycle tabs are
// controlled, like the page reading `?aba=`: `?ativa=individuais` opens on the
// last one, and the buttons at the bottom change the value from outside.
const params = new URLSearchParams(location.search);
const css = document.createElement("link");
css.rel = "stylesheet";
css.href = `/.storybook/static/${params.get("product") === "builder" ? "builder" : "package"}.css`;
document.head.append(css);
const html = document.documentElement;
html.style.setProperty("--font-montserrat", '"Montserrat Variable", sans-serif');
const brand = params.get("brand");
if (brand) for (const [name, value] of Object.entries(brandThemeVars("#" + brand))) html.style.setProperty(name, value);
document.body.className = "bg-background text-foreground";

const ciclo = [
  ["visao-geral", "Visão geral"],
  ["pendencias", "Pendências"],
  ["calibragem", "Calibragem"],
  ["devolutiva", "Devolutiva"],
  ["resultados", "Resultados do ciclo"],
  ["individuais", "Resultados individuais"],
] as const;

const inicial = params.get("ativa") ?? "visao-geral";

function App() {
  const [ativa, setAtiva] = React.useState(inicial);
  return (
    <main className="space-y-10 p-6">
      <h1 className="text-2xl font-bold">Abas</h1>

      <Tabs value={ativa} onValueChange={setAtiva} data-testid="ciclo">
        <TabsList aria-label="Seções do ciclo">
          {ciclo.map(([value, label]) => (
            <TabsTrigger key={value} value={value}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        {ciclo.map(([value, label]) => (
          <TabsContent key={value} value={value} className="text-sm">
            {label} do ciclo.
          </TabsContent>
        ))}
      </Tabs>

      <section className="max-w-[640px]">
        <Tabs defaultValue="ativos" data-testid="tres">
          <TabsList aria-label="Situação">
            <TabsTrigger value="ativos">Ativos</TabsTrigger>
            <TabsTrigger value="arquivados">Arquivados</TabsTrigger>
            <TabsTrigger value="rascunhos">Rascunhos</TabsTrigger>
          </TabsList>
          <TabsContent value="ativos" className="text-sm">Documentos ativos.</TabsContent>
        </Tabs>
      </section>

      <Tabs orientation="vertical" defaultValue="perfil" data-testid="vertical" className="max-w-[960px]">
        <TabsList aria-label="Seções do perfil">
          <TabsTrigger value="perfil">Perfil & assessment</TabsTrigger>
          <TabsTrigger value="pdi">PDI</TabsTrigger>
          <TabsTrigger value="feedbacks">Feedbacks</TabsTrigger>
        </TabsList>
        <TabsContent value="perfil" className="text-sm">Informações pessoais.</TabsContent>
      </Tabs>

      <section data-testid="fora" className="flex flex-wrap gap-2">
        {[ciclo[5], ciclo[0]].map(([value, label]) => (
          <button
            key={value}
            type="button"
            className="rounded-md border border-border px-3 py-2 text-sm"
            onClick={() => setAtiva(value)}
          >
            Abrir {label}
          </button>
        ))}
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
