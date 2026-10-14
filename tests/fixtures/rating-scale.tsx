import * as React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/montserrat";
import { Label, RadioGroup, RadioGroupItem, RatingScale } from "../../src/core";
import { brandThemeVars } from "../../src/theme";

// Componentes nativos do pacote, sem referência congelada: ficam fora da
// paridade e ganham aqui o que o jsdom não mede — contraste, teclado de
// verdade (tecla rápida) e as larguras estreitas.
const params = new URLSearchParams(location.search);
const css = document.createElement("link");
css.rel = "stylesheet";
css.href = "/.storybook/static/package.css";
document.head.append(css);
document.documentElement.style.setProperty("--font-montserrat", '"Montserrat Variable", sans-serif');
if (params.get("theme") === "tenant") {
  // Um workspace de marca clara (âmbar): o texto sobre a nota escolhida e o
  // anel de foco vêm do cálculo do pacote, como na aplicação.
  for (const [name, value] of Object.entries(brandThemeVars("#f59e0b")))
    document.documentElement.style.setProperty(name, value);
}

const labels = ["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"];

function Escala(props: Partial<React.ComponentProps<typeof RatingScale>> & { nome: string }) {
  const { nome, ...rest } = props;
  const [valor, setValor] = React.useState<number | null>(rest.value ?? null);
  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold">{nome}</h2>
      <RatingScale name={nome} aria-label={nome} labels={labels} {...rest} value={valor} onChange={setValor} />
    </section>
  );
}

function Pagina() {
  const [publico, setPublico] = React.useState("todos");
  return (
    <main className="mx-auto max-w-3xl space-y-8 p-4 font-sans text-foreground">
      <h1 className="text-2xl font-bold">Escala de resposta</h1>
      <Escala nome="Vazia" />
      <Escala nome="Escolhida" value={4} showSelectedLabel compareValue={2} />
      <Escala nome="Referência na escolha" value={3} compareValue={3} />
      <Escala nome="Só leitura" value={2} readOnly />
      <Escala nome="Com erro" error="Escolha uma nota." />
      <Escala nome="Três notas" labels={["Abaixo do esperado", "Dentro do esperado", "Acima do esperado"]} value={2} />
      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Grupo de rádio</h2>
        <RadioGroup aria-label="Público" value={publico} onValueChange={setPublico}>
          {[
            ["todos", "Todos"],
            ["estrutura", "Por estrutura"],
            ["lista", "Lista específica"],
          ].map(([v, l]) => (
            <div key={v} className="flex items-center gap-2">
              <RadioGroupItem value={v} id={`publico-${v}`} />
              <Label htmlFor={`publico-${v}`}>{l}</Label>
            </div>
          ))}
        </RadioGroup>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<Pagina />);
