import { test, expect, type Locator, type Page } from "@playwright/test";
import axe from "axe-core";

// Row selection on the DataList (HCK-258), in a real browser
// (tests/fixtures/selection.tsx).
async function open(page: Page, brand?: string) {
  await page.setViewportSize({ width: 1280, height: 1600 });
  await page.goto("/tests/fixtures/selection.html" + (brand ? "?brand=" + brand : ""));
  await expect(page.getByRole("heading", { name: "Pendências", exact: true })).toBeVisible();
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

const alturas = (tabela: Locator) =>
  tabela.locator("tbody tr").evaluateAll((linhas) => linhas.map((l) => l.getBoundingClientRect().height));

const fundo = (linha: Locator) => linha.evaluate((el) => getComputedStyle(el).backgroundColor);

/** The color a table token resolves to, read from a probe painted with it. */
const corDoToken = (page: Page, token: string) =>
  page.evaluate((t) => {
    const sonda = document.createElement("div");
    sonda.style.backgroundColor = `rgb(var(${t}))`;
    document.body.append(sonda);
    const cor = getComputedStyle(sonda).backgroundColor;
    sonda.remove();
    return cor;
  }, token);

test("a marked row keeps its height, with the stripe, rowHeight and minWidth on", async ({ page }) => {
  await open(page);
  const tabela = page.getByTestId("com").getByRole("table");
  const antes = await alturas(tabela);
  // 76px of `rowHeight`, plus the half of the collapsed border the row takes.
  for (const altura of antes) {
    expect(altura).toBeGreaterThanOrEqual(76);
    expect(altura).toBeLessThanOrEqual(77);
  }
  await page.getByRole("checkbox", { name: "Selecionar Lara Menezes" }).first().click();
  await page.getByRole("checkbox", { name: "Selecionar Otávio Bragança" }).first().click();
  expect(await alturas(tabela)).toEqual(antes);
  await page.getByRole("checkbox", { name: "Selecionar todas desta página" }).click();
  expect(await alturas(tabela)).toEqual(antes);
});

test("the selection column does not make a row taller than the same row without it", async ({ page }) => {
  await open(page);
  const com = await alturas(page.getByTestId("com-natural").getByRole("table"));
  const sem = await alturas(page.getByTestId("sem").getByRole("table"));
  expect(com).toEqual(sem);
  const cabecalhoCom = await page.getByTestId("com-natural").locator("thead tr").boundingBox();
  const cabecalhoSem = await page.getByTestId("sem").locator("thead tr").boundingBox();
  expect(cabecalhoCom!.height).toBe(cabecalhoSem!.height);
});

test("the selection column is 40px, and keeps it while loading", async ({ page }) => {
  await open(page);
  const carregada = await page.getByTestId("com").locator("thead th").first().boundingBox();
  const carregando = await page.getByTestId("carregando").locator("thead th").first().boundingBox();
  // 24px of padding and the 16px box, plus the half of the table border.
  expect(carregada!.width).toBeGreaterThanOrEqual(40);
  expect(carregada!.width).toBeLessThanOrEqual(41);
  expect(carregando!.width).toBe(carregada!.width);
  await expect(page.getByTestId("carregando").locator("tbody [role=checkbox]")).toHaveCount(0);
  await expect(page.getByTestId("carregando").locator("thead [role=checkbox]")).toBeDisabled();
});

test("a marked row paints the table selection token, over the stripe and the hover", async ({ page }) => {
  await open(page);
  const selecionada = await corDoToken(page, "--hw-table-selected");
  const listra = await corDoToken(page, "--hw-table-stripe");
  const tabela = page.getByTestId("com").getByRole("table");
  const segunda = tabela.locator("tbody tr").nth(1); // par: listrada
  expect(await fundo(segunda)).toBe(listra);
  await page.getByRole("checkbox", { name: "Selecionar Otávio Bragança" }).first().click();
  expect(await fundo(segunda)).toBe(selecionada);
  await segunda.locator("td").nth(2).hover();
  expect(await fundo(segunda)).toBe(selecionada);
  const primeira = tabela.locator("tbody tr").first();
  await page.getByRole("checkbox", { name: "Selecionar Lara Menezes" }).first().click();
  expect(await fundo(primeira)).toBe(selecionada);
});

test("clicking the box or around it marks, and never opens the row", async ({ page }) => {
  await open(page);
  const caixa = page.getByRole("checkbox", { name: "Selecionar Cecília Prado" }).first();
  await caixa.click();
  await expect(caixa).toBeChecked();
  const celula = page.getByTestId("com").locator("tbody tr").nth(2).locator("td").first();
  const c = (await celula.boundingBox())!;
  await page.mouse.click(c.x + 6, c.y + 6); // no respiro, longe da caixa
  await expect(caixa).not.toBeChecked();
  await expect(page.getByTestId("aberto")).toHaveText("Aberto: nenhum");
  await page.getByTestId("com").getByText("Cecília Prado").click();
  await expect(page.getByTestId("aberto")).toHaveText("Aberto: Cecília Prado");
});

for (const brand of [undefined, "f97316"]) {
  test("Tab reaches the boxes, Space marks, and the focus ring shows — brand " + (brand ?? "none"), async ({ page }) => {
    await open(page, brand);
    await page.keyboard.press("Tab");
    const cabecalho = page.getByRole("checkbox", { name: "Selecionar todas desta página" });
    await expect(cabecalho).toBeFocused();
    await page.keyboard.press("Tab");
    const lara = page.getByRole("checkbox", { name: "Selecionar Lara Menezes" }).first();
    await expect(lara).toBeFocused();
    const foco = await lara.evaluate((el) => ({
      visivel: el.matches(":focus-visible"),
      sombra: getComputedStyle(el).boxShadow,
    }));
    expect(foco.visivel).toBe(true);
    expect(foco.sombra).not.toBe("none");
    await page.keyboard.press("Space");
    await expect(lara).toBeChecked();
    await expect(cabecalho).toHaveAttribute("aria-checked", "mixed");
    await expect(page.getByTestId("aberto")).toHaveText("Aberto: nenhum");
  });

  test("selection page passes axe, contrast included — brand " + (brand ?? "none"), async ({ page }) => {
    await open(page, brand);
    await page.getByRole("checkbox", { name: "Selecionar Lara Menezes" }).first().click();
    await page.addScriptTag({ content: axe.source });
    const violations = await page.evaluate(async () => {
      const result = await (window as typeof window & { axe: typeof axe }).axe.run();
      return result.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) }));
    });
    expect(violations).toEqual([]);
  });
}
