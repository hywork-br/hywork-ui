import { test, expect, type Page } from "@playwright/test";
import axe from "axe-core";
import { apcaContrast, rgbToHsl } from "../../src/theme/brand";

// StatCard, Progress, BarList and the 1-to-10 RatingScale of the DHO result
// screens (19/10/2026) in a real browser: contrast, marker geometry and the
// narrow widths that jsdom cannot measure (tests/fixtures/indicators.tsx).
async function open(page: Page, theme = "light") {
  await page.goto("/tests/fixtures/indicators.html?theme=" + theme);
  await expect(page.getByRole("heading", { name: "Indicadores" })).toBeVisible();
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

const audit = (page: Page) =>
  page.evaluate(async () => {
    const result = await (window as typeof window & { axe: typeof axe }).axe.run();
    return result.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) }));
  });

for (const theme of ["light", "tenant"]) {
  test("indicators pass axe, contrast included, " + theme, async ({ page }, info) => {
    await page.setViewportSize({ width: 1440, height: 1200 });
    await open(page, theme);
    await page.addScriptTag({ content: axe.source });
    expect(await audit(page)).toEqual([]);
    await info.attach("1440 " + theme, { body: await page.screenshot({ fullPage: true }), contentType: "image/png" });
  });
}

type Rgba = [number, number, number, number];
const parse = (color: string): Rgba => {
  const [r, g, b, a = 1] = (color.match(/[\d.]+/g) ?? []).map(Number);
  return [r, g, b, a];
};
/** APCA of a text color (maybe translucent) on an opaque background, from computed CSS. */
const lc = (text: string, background: string) => {
  const [r, g, b, a] = parse(text);
  const bg = parse(background);
  const mixed = [r, g, b].map((v, i) => v * a + bg[i] * (1 - a)) as [number, number, number];
  return Math.abs(apcaContrast(rgbToHsl(mixed), rgbToHsl([bg[0], bg[1], bg[2]])));
};

for (const theme of ["light", "dark"]) {
  test("the highlight card keeps APCA contrast in the " + theme + " theme", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1200 });
    await open(page, theme);
    const card = page.getByTestId("destaque");
    const colors = await card.evaluate((el) => {
      const style = (node: Element | null) => getComputedStyle(node!);
      return {
        card: style(el).backgroundColor,
        page: style(document.body).backgroundColor,
        label: style(el.querySelector("[id]")).color,
        value: style(el.querySelector("[data-part=value-detail]")!.previousElementSibling).color,
        detail: style(el.querySelector("[data-part=value-detail]")).color,
        note: style(el.lastElementChild).color,
      };
    });
    expect(lc(colors.value, colors.card), "value").toBeGreaterThanOrEqual(90);
    for (const part of ["label", "detail", "note"] as const)
      expect(lc(colors[part], colors.card), part).toBeGreaterThanOrEqual(75);
    // The card stands out from the page it sits on.
    expect(lc(colors.card, colors.page), "card on page").toBeGreaterThanOrEqual(60);
  });
}

test("the marker rises above and below the bar, at its position", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await open(page);
  const bar = page.getByTestId("com-marca");
  const [track, marker] = await Promise.all([bar.boundingBox(), bar.locator("[data-part=marker]").boundingBox()]);
  expect(marker!.height).toBeGreaterThan(track!.height);
  expect(marker!.y).toBeLessThan(track!.y);
  expect(marker!.y + marker!.height).toBeGreaterThan(track!.y + track!.height);
  expect(Math.abs(marker!.x + marker!.width / 2 - (track!.x + track!.width * 0.72))).toBeLessThanOrEqual(1);

  const row = page.getByTestId("time-empresa").getByRole("listitem").first();
  const [fill, mark] = await Promise.all([row.locator("[data-part=bar]").boundingBox(), row.locator("[data-part=marker]").boundingBox()]);
  const trackBox = await row.locator("[data-part=bar]").locator("..").boundingBox();
  expect(mark!.height).toBeGreaterThan(trackBox!.height);
  expect(Math.abs(fill!.width - trackBox!.width * 0.82)).toBeLessThanOrEqual(1);
  expect(Math.abs(mark!.x + mark!.width / 2 - (trackBox!.x + trackBox!.width * 0.76))).toBeLessThanOrEqual(1);
});

for (const width of [360, 320]) {
  test(`1-to-10 scale at ${width}px: one row, no horizontal scroll, 44px tall, label below`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 1000 });
    await open(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    const scale = page.getByRole("radiogroup", { name: "Dez escolhida" });
    const boxes = await Promise.all((await scale.getByRole("radio").all()).map((radio) => radio.boundingBox()));
    expect(boxes).toHaveLength(10);
    for (const box of boxes) {
      expect(box!.y).toBe(boxes[0]!.y);
      expect(box!.height).toBeGreaterThanOrEqual(44);
      // WCAG 2.5.8 (AA): at least 24px.
      expect(box!.width).toBeGreaterThanOrEqual(24);
    }
    const section = page.locator("section", { has: scale });
    const below = section.locator("[data-selected-label]");
    await expect(below).toHaveText("6 · Atende ao esperado");
    await scale.getByRole("radio", { name: "9, Excelente desempenho" }).hover();
    await expect(below).toHaveText("9 · Excelente desempenho");
    await page.mouse.move(0, 0);
    await expect(below).toHaveText("6 · Atende ao esperado");
    await info.attach(String(width), { body: await page.screenshot({ fullPage: true }), contentType: "image/png" });
  });
}

test("1-to-10 scale: arrows check and the label follows the focus; read-only only moves", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await open(page);
  const scale = page.getByRole("radiogroup", { name: "Dez vazia" });
  const below = page.locator("section", { has: scale }).locator("[data-selected-label]");
  await expect(below).toHaveText("1 · Muito abaixo do esperado10 · É referência");
  await scale.getByRole("radio", { name: "1, Muito abaixo do esperado", exact: true }).focus();
  await expect(below).toHaveText("1 · Muito abaixo do esperado");
  await page.keyboard.press("End");
  await expect(scale.getByRole("radio", { name: "10, É referência" })).toHaveAttribute("aria-checked", "true");
  await expect(below).toHaveText("10 · É referência");
  await page.keyboard.press("ArrowRight");
  await expect(scale.getByRole("radio", { name: "1, Muito abaixo do esperado", exact: true })).toBeFocused();
  await expect(scale.getByRole("radio", { name: "1, Muito abaixo do esperado", exact: true })).toHaveAttribute("aria-checked", "true");

  const readOnly = page.getByRole("radiogroup", { name: "Dez só leitura" });
  const belowReadOnly = page.locator("section", { has: readOnly }).locator("[data-selected-label]");
  await readOnly.getByRole("radio", { name: "7, Acima do esperado" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(belowReadOnly).toHaveText("8 · Supera as expectativas");
  await expect(readOnly.getByRole("radio", { name: "7, Acima do esperado" })).toHaveAttribute("aria-checked", "true");
});

// HCK-255/HCK-259 (conference of 20/10/2026): at 1280px with the menu open
// each counter is 226px wide, and "Acima/Abaixo do esperado" break into two
// lines next to the 32px icon. The value of every card in a row must still
// start at the same height; at 266px (1440px) everything fits in one line.
for (const width of [226, 266]) {
  test(`a row of ${width}px StatCards keeps the value at the same height, label in one line or two`, async ({ page }, info) => {
    await page.setViewportSize({ width: 1280, height: 1400 });
    await page.goto("/tests/fixtures/indicators.html?cards=" + width);
    await expect(page.getByRole("heading", { name: "Indicadores" })).toBeVisible();
    await page.evaluate(async () => {
      await document.fonts.ready;
    });

    const measure = (row: string) =>
      page
        .getByTestId("fileira-" + row)
        .getByRole("group")
        .evaluateAll((cards) =>
          cards.map((card) => {
            const box = (el: Element) => el.getBoundingClientRect();
            const label = card.querySelector("[data-part=header] [id]")!;
            const style = getComputedStyle(label);
            return {
              label: label.textContent,
              width: box(card).width,
              valueTop: box(card.querySelector("[data-part=value]")!).top - box(card).top,
              headerHeight: box(card.querySelector("[data-part=header]")!).height,
              labelHeight: box(label).height,
              lines: Math.round(box(label).height / parseFloat(style.lineHeight)),
              // The label stays whole: nothing clipped, clamped or ellipsized.
              whole:
                label.scrollHeight <= label.clientHeight + 1 &&
                label.scrollWidth <= label.clientWidth + 1 &&
                style.textOverflow !== "ellipsis" &&
                ["", "none"].includes(style.getPropertyValue("-webkit-line-clamp")),
            };
          }),
        );

    const expectedLines =
      width === 226
        ? { "Média geral": 1, Participação: 1, "Acima do esperado": 2, "Abaixo do esperado": 2 }
        : { "Média geral": 1, Participação: 1, "Acima do esperado": 1, "Abaixo do esperado": 1 };

    for (const row of ["tela", "default", "attention", "highlight"]) {
      const cards = await measure(row);
      expect(cards).toHaveLength(4);
      for (const card of cards) {
        expect(card.width, `${row} · ${card.label} width`).toBe(width);
        expect(card.whole, `${row} · ${card.label} whole`).toBe(true);
        expect(card.lines, `${row} · ${card.label} lines`).toBe(expectedLines[card.label as keyof typeof expectedLines]);
        expect(Math.abs(card.valueTop - cards[0].valueTop), `${row} · ${card.label} value top`).toBeLessThanOrEqual(0.5);
      }
    }

    // Without an icon nothing changes: the header is just the label.
    for (const card of await measure("sem-icone")) {
      expect(card.lines, card.label + " lines").toBe(1);
      expect(card.headerHeight, card.label + " header").toBe(card.labelHeight);
    }

    await info.attach(`row ${width}`, { body: await page.screenshot({ fullPage: true }), contentType: "image/png" });
  });
}
