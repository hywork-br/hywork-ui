import { test, expect, type Page } from "@playwright/test";
import axe from "axe-core";

// Vertical ItemCards in an auto-fill grid and the FilterBar clear label, in a
// real browser (tests/fixtures/people.tsx).
async function open(page: Page, width: number, brand?: string) {
  await page.setViewportSize({ width, height: 1000 });
  await page.goto("/tests/fixtures/people.html" + (brand ? "?brand=" + brand : ""));
  await expect(page.getByRole("heading", { name: "Equipe", exact: true })).toBeVisible();
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

test("the FilterBar says what the screen asked for", async ({ page }) => {
  await open(page, 1280);
  await page.getByRole("button", { name: "Limpar filtros" }).click();
  await expect(page.getByRole("searchbox").or(page.getByRole("textbox"))).toHaveValue("");
  await expect(page.getByRole("button", { name: "Limpar filtros" })).toHaveCount(0);
});

test("vertical card: the Avatar fills the 108px frame, centered on the card", async ({ page }) => {
  await open(page, 1280);
  const card = page.getByTestId("card-1");
  const avatar = card.locator(".rounded-full").first();
  const a = (await avatar.boundingBox())!;
  const c = (await card.boundingBox())!;
  expect(a.width).toBeCloseTo(108, 0);
  expect(a.height).toBeCloseTo(108, 0);
  expect(a.x + a.width / 2).toBeCloseTo(c.x + c.width / 2, 0);
  expect(a.y - c.y).toBeCloseTo(25, 0); // borda de 1px + respiro de 24
});

test("vertical card: a long title stays on one line, with an ellipsis", async ({ page }) => {
  await open(page, 1280);
  const titulo = page.getByTestId("card-2").getByRole("heading");
  const medidas = await titulo.evaluate((el) => ({
    linha: parseFloat(getComputedStyle(el).lineHeight),
    altura: el.getBoundingClientRect().height,
    corta: el.scrollWidth > el.clientWidth,
    reticencias: getComputedStyle(el).textOverflow,
  }));
  expect(medidas.altura).toBeLessThanOrEqual(medidas.linha + 1);
  expect(medidas.corta).toBe(true);
  expect(medidas.reticencias).toBe("ellipsis");
});

test("vertical cards: auto-fill grid, and the actions line up at the foot of a row", async ({ page }) => {
  await open(page, 1280);
  const cards = await page.locator("[data-testid=grade] > li").evaluateAll((itens) =>
    itens.map((li) => {
      const b = li.getBoundingClientRect();
      const botao = li.querySelector("button")!.getBoundingClientRect();
      return { top: Math.round(b.top), bottom: Math.round(b.bottom), width: b.width, botao: Math.round(botao.bottom), botaoW: botao.width };
    }),
  );
  const primeira = cards.filter((c) => c.top === cards[0].top);
  expect(primeira.length).toBeGreaterThanOrEqual(4);
  for (const c of cards) expect(c.width).toBeGreaterThanOrEqual(232);
  // os cards da fileira têm a mesma altura e o botão no mesmo lugar, colado ao pé
  expect(new Set(primeira.map((c) => c.bottom)).size).toBe(1);
  expect(new Set(primeira.map((c) => c.botao)).size).toBe(1);
  for (const c of primeira) {
    expect(c.bottom - c.botao).toBeCloseTo(25, 0);
    expect(c.botaoW).toBeCloseTo(c.width - 2 - 48, 0);
  }
});

test("vertical cards: one per row at 390px, no horizontal scroll", async ({ page }) => {
  await open(page, 390);
  const tops = await page.locator("[data-testid=grade] > li").evaluateAll((itens) => itens.map((li) => Math.round(li.getBoundingClientRect().top)));
  expect(new Set(tops).size).toBe(tops.length);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test("the horizontal card keeps the 40px Avatar beside the title", async ({ page }) => {
  await open(page, 1280);
  const card = page.getByTestId("horizontal");
  const avatar = (await card.locator(".rounded-full").first().boundingBox())!;
  const titulo = (await card.getByRole("heading").boundingBox())!;
  expect(avatar.width).toBeCloseTo(40, 0);
  expect(titulo.x).toBeGreaterThan(avatar.x + avatar.width);
});

for (const brand of [undefined, "f97316"]) {
  test("people grid passes axe, contrast included — brand " + (brand ?? "none"), async ({ page }) => {
    await open(page, 1280, brand);
    await page.addScriptTag({ content: axe.source });
    const violations = await page.evaluate(async () => {
      const result = await (window as typeof window & { axe: typeof axe }).axe.run();
      return result.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) }));
    });
    expect(violations).toEqual([]);
  });
}
