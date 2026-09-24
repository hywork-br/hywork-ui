import * as React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/montserrat";
import { Catalog } from "../../stories/catalog";
const params = new URLSearchParams(location.search);
const source = params.get("implementation") === "source";
const css = document.createElement("link");
css.rel = "stylesheet";
css.href = `/.storybook/static/${source ? "source" : "package"}.css`;
document.head.append(css);
document.documentElement.style.setProperty("--font-montserrat", '"Montserrat Variable", sans-serif');
if (params.get("theme") === "dark") document.documentElement.classList.add("dark");
if (params.get("theme") === "tenant") {
  document.documentElement.style.setProperty("--primary", "270 60% 35%");
  document.documentElement.style.setProperty("--primary-foreground", "0 0% 100%");
}
// A paridade compara as PRIMITIVAS extraídas contra a referência congelada.
// Padrões autorais (FilterBar e os próximos) não têm equivalente em
// provenance/ — eles nascem aqui, e por isso ficam fora desta comparação.
const ui = source ? await import("../../provenance/platform") : await import("../../src/core");
createRoot(document.getElementById("root")!).render(<Catalog ui={ui} />);
