import * as React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/montserrat";
import { Button, SheetTitle } from "../../src/core/index";
import { ContainedSheet, SearchCombobox } from "../../src/platform/index";

// ContainedSheet and SearchCombobox (HCK-435) on the package CSS. What jsdom
// cannot measure lives here: the side panel inside the element and without a
// backdrop, the bottom one stuck to the bottom of the screen in an element
// taller than it, its backdrop only over the element, the page that does not
// grow when it opens, and the suggestions under the field.
// `?side=bottom` opens from the bottom; `?tall=1` makes the element taller than
// the screen; `?long=1` gives the panel a body taller than it can show.
const params = new URLSearchParams(location.search);
const css = document.createElement("link");
css.rel = "stylesheet";
css.href = "/.storybook/static/package.css";
document.head.append(css);
document.documentElement.style.setProperty("--font-montserrat", '"Montserrat Variable", sans-serif');
document.body.className = "bg-background text-foreground";

const side = params.get("side") === "bottom" ? "bottom" : "right";
const PESSOAS = Array.from({ length: params.get("tall") ? 40 : 12 }, (_, i) => `Pessoa ${i + 1}`);

function App() {
  const [nome, setNome] = React.useState<string | null>(null);
  const [texto, setTexto] = React.useState("");
  const termo = texto.trim().toLowerCase();
  return (
    <main className="p-4">
      <h1 className="text-xl font-bold">Painel contido</h1>
      <div
        data-testid="elemento"
        className={`relative mt-4 max-w-[900px] rounded-lg border p-4 ${side === "right" ? "h-[560px] overflow-hidden" : ""}`}
      >
        <SearchCombobox
          className="max-w-md"
          label="Buscar pessoa"
          value={texto}
          onChange={setTexto}
          items={termo ? PESSOAS.filter((p) => p.toLowerCase().includes(termo)) : []}
          getKey={(p) => p}
          renderItem={(p) => <span className="text-sm font-semibold">{p}</span>}
          onPick={(p) => {
            setNome(p);
            setTexto("");
          }}
        />
        <ul className="m-0 mt-3 grid list-none gap-1 p-0">
          {PESSOAS.map((p) => (
            <li key={p}>
              <Button variant="outline" className="w-full justify-start" onClick={() => setNome(p)}>
                {p}
              </Button>
            </li>
          ))}
        </ul>
        <ContainedSheet
          side={side}
          open={nome !== null}
          onOpenChange={(aberto) => !aberto && setNome(null)}
          aria-describedby={undefined}
        >
          <div className="flex-1 overflow-auto px-6 pb-6 pt-14">
            <SheetTitle>{nome}</SheetTitle>
            {params.get("long") ? <div className="h-[2000px]" /> : <p className="mt-2 text-sm">Analista</p>}
          </div>
        </ContainedSheet>
      </div>
      <p data-testid="depois" className="h-[400px] pt-4">
        Elemento seguinte da página.
      </p>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
