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
// A referência congelada traz a borda de 06/10 (217 20% 82%); a PO a trocou por
// #edf1f5 na validação de 07/10/2026. A comparação é de componente, não de
// valor de token: a referência recebe a borda decidida, como recebe a marca.
// No escuro a borda não mudou.
if (source && params.get("theme") !== "dark") document.documentElement.style.setProperty("--border", "210 28.6% 94.5%");
// Corpo do admin em 14px (Rick, 08/10/2026): o pacote aplica --hw-text-body ao
// body pelo platform-preset. A referência congelada recebe o corpo decidido,
// como recebe a borda e a marca.
if (source) Object.assign(document.body.style, { fontSize: "0.875rem", lineHeight: "1.25rem" });
if (params.get("theme") === "tenant") {
  // A referência congelada recebia a marca sobrescrevendo --primary. Desde
  // 06/10/2026 o pacote só aceita o gancho de marca: --primary é dele.
  const root = document.documentElement.style;
  root.setProperty(source ? "--primary" : "--hw-brand-primary", "270 60% 35%");
  root.setProperty(source ? "--primary-foreground" : "--hw-brand-primary-foreground", "0 0% 100%");
  // A mesma decisão leva a marca ao anel de foco. Na referência o anel era
  // uma variável à parte; aqui ele recebe a marca como o pacote a deriva (a
  // tinta, que para este roxo escuro é a própria marca).
  if (source) root.setProperty("--ring", "270 60% 35%");
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
