import { test, expect } from "@playwright/test";

// O círculo é redondo em todo caso: largura e altura iguais, com 0,5px de folga de arredondamento.
test("spinner fica redondo quando a tela o dimensiona ou o espreme", async ({ page }) => {
  await page.goto("/tests/fixtures/spinner.html");
  await expect(page.getByRole("heading", { name: "Spinner" })).toBeVisible();
  const casos = ["sm", "md", "lg", "classname-size-4", "classname-size-4-lg", "botao", "linha-espremida"];
  for (const caso of casos) {
    const box = await page.locator(`[data-caso="${caso}"] .animate-spin`).boundingBox();
    expect(box, caso).not.toBeNull();
    expect(Math.abs(box!.width - box!.height), `${caso}: ${box!.width}x${box!.height}`).toBeLessThanOrEqual(0.5);
    expect(box!.width, caso).toBeGreaterThan(0);
  }
  const dimensionado = await page.locator('[data-caso="classname-size-4"] .animate-spin').boundingBox();
  expect(dimensionado!.width).toBeCloseTo(16, 0);
});

// Num botão preenchido o arco segue o texto do botão; antes era a tinta da marca, a cor do próprio fundo.
test("spinner dentro de botão aparece: o arco tem a cor do texto, não a do fundo", async ({ page }) => {
  await page.goto("/tests/fixtures/spinner.html");
  const cores = await page.locator('[data-caso="botao"] button').evaluate((botao) => {
    const arco = getComputedStyle(botao.querySelector(".animate-spin")!).borderTopColor;
    return { arco, texto: getComputedStyle(botao).color, fundo: getComputedStyle(botao).backgroundColor };
  });
  expect(cores.arco).toBe(cores.texto);
  expect(cores.arco).not.toBe(cores.fundo);
  const fora = await page.locator('[data-caso="md"] .animate-spin').evaluate((el) => getComputedStyle(el).borderTopColor);
  expect(fora).not.toBe(cores.texto);
});
