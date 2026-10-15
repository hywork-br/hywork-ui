import { test, expect, type Page } from "@playwright/test";
import axe from "axe-core";

// The charts of @hywork/ui/charts on the package CSS, with the numbers of the
// HCK-256 example (tests/fixtures/charts.tsx). jsdom has no layout, so the
// geometry, the contrast, the focus ring, the pointer and print live here.
async function open(page: Page, query = "") {
  await page.goto("/tests/fixtures/charts.html" + query);
  await expect(page.getByRole("heading", { name: "Gráficos", exact: true })).toBeVisible();
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await expect(page.locator("svg.recharts-surface").first()).toBeVisible();
}

const audit = (page: Page) =>
  page.evaluate(async () => {
    const result = await (window as typeof window & { axe: typeof axe }).axe.run();
    return result.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) }));
  });

const selected = (page: Page) => page.getByTestId("selected");
const ring = (page: Page) => page.evaluate(() => getComputedStyle(document.activeElement as Element).boxShadow);

for (const theme of ["light", "tenant"]) {
  test("charts pass axe with contrast, " + theme, async ({ page }, info) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await open(page, "?theme=" + theme);
    await page.addScriptTag({ content: axe.source });
    expect(await audit(page)).toEqual([]);
    // The gate does look at contrast: a legend in light grey fails it.
    const legend = page.locator("[data-part='chart-legend']").first();
    await legend.evaluate((el) => ((el as HTMLElement).style.color = "rgb(200, 200, 200)"));
    expect((await audit(page)).some((v) => v.id === "color-contrast")).toBe(true);
    await legend.evaluate((el) => (el as HTMLElement).style.removeProperty("color"));
    // The charts do not follow the workspace brand: series stay on --chart-1/--chart-5.
    const fills = await page
      .locator(".recharts-bar-rectangle path")
      .evaluateAll((paths) => [...new Set(paths.map((p) => getComputedStyle(p).fill))]);
    expect(fills).toEqual(["rgb(20, 55, 72)", "rgb(13, 162, 231)"]);
    await info.attach(theme, { body: await page.screenshot({ fullPage: true, animations: "disabled" }), contentType: "image/png" });
  });
}

for (const width of [1440, 390, 320]) {
  test("no horizontal scroll at " + width + "px, and the radar becomes bars below 360px", async ({ page }, info) => {
    await page.setViewportSize({ width, height: 1000 });
    await open(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    await expect(page.locator("[data-layout]")).toHaveAttribute("data-layout", width >= 700 ? "radar" : "bars");
    // Every axis name stays inside its card.
    const outside = await page.locator("[data-part='chart-axis']").evaluateAll(
      (axes) =>
        axes.filter((a) => {
          const card = a.closest("section")!.getBoundingClientRect();
          const box = a.getBoundingClientRect();
          return box.left < card.left || box.right > card.right;
        }).length,
    );
    expect(outside).toBe(0);
    await info.attach(String(width), { body: await page.screenshot({ fullPage: true, animations: "disabled" }), contentType: "image/png" });
  });
}

test("the keyboard reaches each choice, with a visible focus ring", async ({ page }, info) => {
  await page.setViewportSize({ width: 1200, height: 1000 });
  await open(page);
  const axis = page.getByRole("button", { name: /^Comunicação: Líder 3,3; Autoavaliação 4,3/ });
  await page.getByRole("button", { name: "Como é calculado" }).focus();
  await page.keyboard.press("Tab");
  await expect(axis).toBeFocused();
  expect(await ring(page)).not.toBe("none");
  await info.attach("radar axis", { body: await page.locator("section").first().screenshot(), contentType: "image/png" });
  await page.keyboard.press("Enter");
  await expect(selected(page)).toHaveText("Selecionado: radar: c1");

  const row = page.getByRole("button", { name: /^Resultado: Líder 3,0; Autoavaliação 3,5/ });
  await row.focus();
  expect(await ring(page)).not.toBe("none");
  await info.attach("bar row", { body: await page.locator("section").nth(1).screenshot(), contentType: "image/png" });
  await page.keyboard.press(" ");
  await expect(selected(page)).toHaveText("Selecionado: pilar: p2");

  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: /^Abaixo do esperado/ })).toBeFocused();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(selected(page)).toHaveText("Selecionado: faixa: developing");
});

test("the pointer chooses by sector, row and segment, and the tooltip shows the values", async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 1000 });
  await open(page);
  const bars = page.locator("section").nth(1).locator("svg.recharts-surface");
  const box = (await bars.boundingBox())!;
  // The first row, right of the labels: the tooltip comes up with both values.
  await page.mouse.move(box.x + box.width * 0.6, box.y + 20);
  const tooltip = page.locator("section").nth(1).locator("[data-part='chart-tooltip']");
  await expect(tooltip).toContainText("Comportamento");
  await expect(tooltip).toContainText("Líder3,5");
  await expect(tooltip).toContainText("Autoavaliação4,1");
  await page.mouse.click(box.x + box.width * 0.6, box.y + 20);
  await expect(selected(page)).toHaveText("Selecionado: pilar: p1");

  await page.locator("[data-part='segment']").nth(3).click();
  await expect(selected(page)).toHaveText("Selecionado: faixa: exceeds");

  await page.getByRole("button", { name: /^Entrega com qualidade:/ }).click();
  await expect(selected(page)).toHaveText("Selecionado: radar: c3");
});

test("with reduced motion the charts are drawn at once and the bar does not slide", async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page);
  const first = await page.locator("main").screenshot();
  await page.waitForTimeout(800);
  expect(Buffer.compare(first, await page.locator("main").screenshot())).toBe(0);
  await expect(page.locator("[data-part='segment']").first()).toHaveCSS("transition-property", "none");
});

test("print keeps the fixed width, the colours and drops the calculation button", async ({ page }, info) => {
  await page.setViewportSize({ width: 1200, height: 1000 });
  await open(page, "?print");
  await page.emulateMedia({ media: "print" });
  expect(await page.locator("svg.recharts-surface").evaluateAll((svgs) => svgs.map((s) => s.getAttribute("width")))).toEqual([
    "640",
    "640",
    "640",
    "640",
  ]);
  await expect(page.getByRole("button", { name: "Como é calculado" })).toBeHidden();
  await expect(page.locator("[data-part='distribution-track']")).toHaveCSS("print-color-adjust", "exact");
  await info.attach("print", { body: await page.screenshot({ fullPage: true }), contentType: "image/png" });
});

test("the donut: a slice by keyboard, with a visible ring, or by pointer on the ring", async ({ page }, info) => {
  await page.setViewportSize({ width: 1200, height: 1000 });
  await open(page);
  const donut = page.getByRole("group", { name: "Pessoas por área" });
  const first = donut.getByRole("button", { name: "Comercial: 62" });
  const second = donut.getByRole("button", { name: "Tecnologia: 48" });
  await second.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(first).toBeFocused();
  // The ring is drawn by two arcs on the slice edges: SVG has no box-shadow.
  await expect(first.locator("[data-part='focus-ring']").first()).toHaveCSS("opacity", "1");
  await expect(second.locator("[data-part='focus-ring']").first()).toHaveCSS("opacity", "0");
  await info.attach("donut focus", { body: await donut.screenshot(), contentType: "image/png" });
  await page.keyboard.press("Enter");
  await expect(selected(page)).toHaveText("Selecionado: área: sales");

  // Operations, the fifth slice, runs from 194° to 325° clockwise from 12 o'clock;
  // its middle, on the 180px ring (radius 54 of 140 → 69px), is at 259°.
  const box = (await donut.boundingBox())!;
  const angle = (259 * Math.PI) / 180;
  await page.mouse.click(box.x + 90 + 69 * Math.sin(angle), box.y + 90 - 69 * Math.cos(angle));
  await expect(selected(page)).toHaveText("Selecionado: área: operations");
});
