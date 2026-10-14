import { test, expect, type Page } from "@playwright/test";
import axe from "axe-core";

// RatingScale e RadioGroup num navegador de verdade: o que o jsdom não mede.
// A tecla do Playwright desce e sobe de uma vez — é a "tecla rápida" em que o
// Radix movia o foco sem marcar.
async function open(page: Page, theme = "light") {
  await page.goto("/tests/fixtures/rating-scale.html?theme=" + theme);
  await expect(page.getByRole("heading", { name: "Escala de resposta" })).toBeVisible();
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

// A mensagem de erro é o FormMessage: o red-500 eleito pela PO dá 3,76:1 sobre
// branco, em todo campo do pacote — pendência de decisão registrada na 0.11.0,
// não deste componente. Fica fora da auditoria; todo o resto entra, contraste
// incluído.
const audit = (page: Page) =>
  page.evaluate(async () => {
    const run = (window as typeof window & { axe: typeof axe }).axe.run;
    const result = await run({ exclude: [['[role="alert"]']] });
    return result.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) }));
  });

for (const theme of ["light", "tenant"]) {
  test("rating scale passes axe, contrast included, " + theme, async ({ page }, info) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await open(page, theme);
    await page.addScriptTag({ content: axe.source });
    expect(await audit(page)).toEqual([]);
    await page.getByRole("radiogroup", { name: "Vazia" }).getByRole("radio").first().focus();
    expect(await audit(page)).toEqual([]);
    await info.attach("1440 " + theme, { body: await page.screenshot({ fullPage: true }), contentType: "image/png" });
  });
}

test("rating scale: arrows move and check, Home/End, wrap, and read-only only moves", async ({ page }) => {
  await open(page);
  const escala = page.getByRole("radiogroup", { name: "Escolhida" });
  const nota = (name: string) => escala.getByRole("radio", { name, exact: true });

  await nota("4, Concordo").focus();
  await page.keyboard.press("ArrowRight");
  await expect(nota("5, Concordo totalmente")).toBeFocused();
  await expect(nota("5, Concordo totalmente")).toHaveAttribute("aria-checked", "true");
  await expect(nota("4, Concordo")).toHaveAttribute("aria-checked", "false");

  await page.keyboard.press("ArrowRight");
  await expect(nota("1, Discordo totalmente")).toBeFocused();
  await expect(nota("1, Discordo totalmente")).toHaveAttribute("aria-checked", "true");

  await page.keyboard.press("End");
  await expect(nota("5, Concordo totalmente")).toHaveAttribute("aria-checked", "true");
  await page.keyboard.press("Home");
  await expect(nota("1, Discordo totalmente")).toHaveAttribute("aria-checked", "true");
  await page.keyboard.press("ArrowDown");
  await expect(nota("2, Discordo")).toHaveAttribute("aria-checked", "true");
  await expect(page.locator("section", { has: escala }).locator("[data-selected-label]")).toHaveText("Discordo");

  const leitura = page.getByRole("radiogroup", { name: "Só leitura" });
  await leitura.getByRole("radio", { name: "2, Discordo" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(leitura.getByRole("radio", { name: "3, Neutro" })).toBeFocused();
  await page.keyboard.press("Space");
  await expect(leitura.getByRole("radio", { name: "2, Discordo" })).toHaveAttribute("aria-checked", "true");
  await expect(leitura.getByRole("radio", { name: "3, Neutro" })).toHaveAttribute("aria-checked", "false");
});

test("radio group: a quick arrow moves the focus and checks the radio", async ({ page }) => {
  await open(page);
  const grupo = page.getByRole("radiogroup", { name: "Público" });
  await grupo.getByRole("radio", { name: "Todos" }).focus();
  await page.keyboard.press("ArrowDown");
  await expect(grupo.getByRole("radio", { name: "Por estrutura" })).toBeFocused();
  await expect(grupo.getByRole("radio", { name: "Por estrutura" })).toHaveAttribute("aria-checked", "true");
  await page.keyboard.press("ArrowUp");
  await expect(grupo.getByRole("radio", { name: "Todos" })).toHaveAttribute("aria-checked", "true");
});

test("rating scale at 320px: numbers only, legend of the extremes, 44px targets, no horizontal scroll", async ({ page }, info) => {
  await page.setViewportSize({ width: 320, height: 1000 });
  await open(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  const escala = page.getByRole("radiogroup", { name: "Vazia" });
  await expect(escala.getByText("Discordo totalmente", { exact: true })).toBeHidden();
  await expect(page.getByText("1 · Discordo totalmente").first()).toBeVisible();
  // O nome acessível segue com o rótulo, mesmo sem ele na tela.
  await expect(escala.getByRole("radio", { name: "1, Discordo totalmente" })).toBeVisible();
  const caixa = await escala.getByRole("radio").first().boundingBox();
  expect(caixa!.height).toBeGreaterThanOrEqual(44);
  await info.attach("320", { body: await page.screenshot({ fullPage: true }), contentType: "image/png" });

  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(escala.getByText("Discordo totalmente", { exact: true })).toBeVisible();
  await expect(page.getByText("1 · Discordo totalmente").first()).toBeHidden();
});
