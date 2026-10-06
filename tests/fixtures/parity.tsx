import * as React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/montserrat";
import { Catalog } from "../../stories/catalog";
import { DerivedCatalog } from "./derived-catalog";
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
// Os dois lados divergem em tipo nos componentes autorais — o Badge ganhou
// variantes que a referência congelada não tem. A comparação aqui é VISUAL:
// renderiza o mesmo catálogo com as duas implementações e compara pixels.
// `view=derived`: only the source-derived primitives, for the pixel parity.
// The whole catalog stays for the interaction and accessibility tests.
const View = params.get("view") === "derived" ? DerivedCatalog : Catalog;
createRoot(document.getElementById("root")!).render(
  <View ui={ui as unknown as Parameters<typeof Catalog>[0]["ui"]} />,
);
