import * as React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/montserrat";
import { Button, Spinner } from "../../src/core";

// O Spinner nos lugares em que ele virava oval: dimensionado pela tela, dentro
// de botão e espremido numa linha flex. O jsdom não mede; o teste mede aqui.
const css = document.createElement("link");
css.rel = "stylesheet";
css.href = "/.storybook/static/package.css";
document.head.append(css);

function Caso({ id, children }: { id: string; children: React.ReactNode }) {
  return <div data-caso={id} className="flex items-center gap-2 p-2">{children}</div>;
}

createRoot(document.getElementById("root")!).render(
  <main className="space-y-2 p-4">
    <h1 className="text-sm font-semibold">Spinner</h1>
    <Caso id="sm"><Spinner size="sm" /></Caso>
    <Caso id="md"><Spinner /></Caso>
    <Caso id="lg"><Spinner size="lg" /></Caso>
    <Caso id="classname-size-4"><Spinner className="size-4" /></Caso>
    <Caso id="classname-size-4-lg"><Spinner size="lg" className="size-4 shrink-0" /></Caso>
    <Caso id="botao"><Button disabled><Spinner />Enviando</Button></Caso>
    <Caso id="linha-espremida">
      <div className="flex w-24 items-center gap-2"><span className="shrink-0">Trocando o workspace…</span><Spinner /></div>
    </Caso>
  </main>,
);
