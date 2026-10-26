import { test, expect, type Page } from "@playwright/test";
import axe from "axe-core";
import { contrastRatio, rgbToHsl } from "../../src/theme/brand";

// The person profile of HCK-308 in a real browser (tests/fixtures/profile.tsx):
// the vertical tabs beside or above the content, the horizontal tabs as the
// PO decided them, the DescriptionList grid at each width and the contrast of
// the active vertical row on light workspace brands.
async function open(page: Page, width: number, brand?: string) {
  await page.setViewportSize({ width, height: 1000 });
  await page.goto("/tests/fixtures/profile.html" + (brand ? "?brand=" + brand : ""));
  await expect(page.getByRole("heading", { name: "Perfil", exact: true })).toBeVisible();
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

const box = async (page: Page, selector: string) => {
  const b = await page.locator(selector).first().boundingBox();
  if (!b) throw new Error("no box for " + selector);
  return b;
};

const rgb = (color: string) => (color.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number) as [number, number, number];

test("vertical: the list is a 240px column on the left of the content from 768px", async ({ page }) => {
  await open(page, 1280);
  const lista = await box(page, '[data-testid=vertical] [role=tablist]');
  const painel = await box(page, '[data-testid=vertical] [role=tabpanel]:not([hidden])');
  expect(lista.width).toBeCloseTo(240, 0);
  expect(lista.x + lista.width).toBeLessThanOrEqual(painel.x - 31);
  expect(Math.abs(lista.y - painel.y)).toBeLessThan(1);

  // each tab is a full-width row of at least 44px, label on the left, badge on the right
  for (const aba of await page.locator('[data-testid=vertical] [role=tab]').all()) {
    const b = (await aba.boundingBox())!;
    expect(b.width).toBeCloseTo(240, 0);
    expect(b.height).toBeGreaterThanOrEqual(44);
  }
  const avaliacoes = (await page.getByRole("tab", { name: "Avaliações 1 pendente" }).boundingBox())!;
  const selo = await box(page, "[data-testid=selo]");
  expect(avaliacoes.x + avaliacoes.width - (selo.x + selo.width)).toBeCloseTo(16, 0);
  const texto = await page.getByRole("tab", { name: "PDI" }).evaluate((el) => getComputedStyle(el).textAlign);
  expect(["left", "start"]).toContain(texto);
});

test("vertical: below 768px the list sits above the content, one row per tab", async ({ page }) => {
  await open(page, 390);
  const lista = await box(page, '[data-testid=vertical] [role=tablist]');
  const painel = await box(page, '[data-testid=vertical] [role=tabpanel]:not([hidden])');
  expect(lista.y + lista.height).toBeLessThanOrEqual(painel.y);
  expect(lista.width).toBeCloseTo(painel.width, 0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test("vertical: arrow down moves to the next tab and opens it", async ({ page }) => {
  await open(page, 1280);
  await page.getByRole("tab", { name: "Perfil & assessment" }).focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("tab", { name: "PDI" })).toBeFocused();
  await expect(page.getByRole("tab", { name: "PDI" })).toHaveAttribute("aria-selected", "true");
  await expect(page.locator('[data-testid=vertical] [role=tabpanel]:not([hidden])')).toHaveText("Plano de desenvolvimento.");
});

test("horizontal: still the PO decision — 48px, equal widths, 2px underline on the active tab", async ({ page }) => {
  await open(page, 1280);
  const lista = await box(page, '[data-testid=horizontal] [role=tablist]');
  expect(lista.height).toBeCloseTo(48, 0);
  const larguras = await page
    .locator('[data-testid=horizontal] [role=tab]')
    .evaluateAll((abas) => abas.map((a) => a.getBoundingClientRect().width));
  for (const w of larguras) expect(w).toBeCloseTo(lista.width / 3, 0);
  const ativa = await page.getByRole("tab", { name: "Ativos" }).evaluate((el) => {
    const s = getComputedStyle(el);
    return { borda: s.borderBottomWidth, fundo: s.backgroundColor, peso: s.fontWeight };
  });
  expect(ativa).toEqual({ borda: "2px", fundo: "rgba(0, 0, 0, 0)", peso: "600" });
});

// No brand, then light brands whose ink on white drops under 4.5:1 on a pale tint.
for (const brand of [undefined, "f97316", "ff3b0a", "3b82f6", "ef4444", "22c55e", "facc15"]) {
  test("vertical: the active row keeps 4.5:1 — brand " + (brand ?? "none"), async ({ page }) => {
    await open(page, 1280, brand);
    const cores = await page.getByRole("tab", { name: "Perfil & assessment" }).evaluate((el) => {
      const s = getComputedStyle(el);
      return { texto: s.color, fundo: s.backgroundColor, peso: s.fontWeight };
    });
    expect(cores.peso).toBe("600");
    expect(cores.fundo).not.toBe("rgba(0, 0, 0, 0)");
    const ratio = contrastRatio(rgbToHsl(rgb(cores.texto)), rgbToHsl(rgb(cores.fundo)));
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
}

/** Rows of the DescriptionList: the top of each item, rounded. */
const linhas = (page: Page) =>
  page.locator("[data-testid=lista] > div").evaluateAll((itens) =>
    itens.map((i) => {
      const b = i.getBoundingClientRect();
      return { top: Math.round(b.top), left: Math.round(b.left), width: Math.round(b.width) };
    }),
  );

test("description list: three columns from 1024px, with span 2 and span 3", async ({ page }) => {
  await open(page, 1440);
  const itens = await linhas(page);
  const dl = await box(page, "[data-testid=lista]");
  // Nome completo (2) + Nome social (1) share the first row
  expect(itens[0].top).toBe(itens[1].top);
  const coluna = (dl.width - 2 * 24) / 3;
  expect(itens[0].width).toBeCloseTo(2 * coluna + 24, -1);
  expect(itens[1].width).toBeCloseTo(coluna, -1);
  // Contato de emergência (3) takes the whole row
  expect(itens[7].width).toBeCloseTo(dl.width, -1);
});

test("description list: two columns between 640 and 1024px", async ({ page }) => {
  await open(page, 800);
  const itens = await linhas(page);
  const dl = await box(page, "[data-testid=lista]");
  // span 2 is the whole row of two; span 1 is half of it
  expect(itens[0].width).toBeCloseTo(dl.width, -1);
  expect(itens[1].top).toBe(itens[2].top);
  expect(itens[1].width).toBeCloseTo((dl.width - 24) / 2, -1);
});

test("description list: one column below 640px, no item wider than the list", async ({ page }) => {
  await open(page, 390);
  const itens = await linhas(page);
  const dl = await box(page, "[data-testid=lista]");
  for (const item of itens) {
    expect(item.width).toBeCloseTo(dl.width, -1);
    expect(item.left).toBeCloseTo(dl.x, -1);
  }
  expect(new Set(itens.map((i) => i.top)).size).toBe(itens.length);
  expect(await page.locator("[data-testid=lista] dd").nth(1).textContent()).toBe("—");
});

for (const brand of [undefined, "f97316"]) {
  test("profile passes axe, contrast included — brand " + (brand ?? "none"), async ({ page }, info) => {
    await open(page, 1440, brand);
    await page.addScriptTag({ content: axe.source });
    const violations = await page.evaluate(async () => {
      const result = await (window as typeof window & { axe: typeof axe }).axe.run();
      return result.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) }));
    });
    expect(violations).toEqual([]);
    await info.attach("1440 " + (brand ?? "none"), { body: await page.screenshot({ fullPage: true }), contentType: "image/png" });
  });
}
