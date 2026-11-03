import { test, expect, type Locator, type Page } from "@playwright/test";
import axe from "axe-core";

// Horizontal tabs that do not fit (HCK-258) in a real browser
// (tests/fixtures/tabs.tsx). Up to 0.18.1 the six tabs of the DHO cycle page
// overlapped at 390 and 768 px: each column was an equal part of the row, even
// narrower than its label. Now no tab overlaps another and each keeps its whole
// label; at 390 px the list scrolls inside its 48 px. At 1440 they fit and keep
// equal widths. The active indicator and the focus ring stay whole while the
// list scrolls, the keyboard brings the focused tab whole into view, and the
// vertical list does not change. On the CSS of both products: the admin's and
// the intranet's.

type Box = { x: number; y: number; width: number; height: number };

const lista = (page: Page, id: string) => page.locator(`[data-testid=${id}] [role=tablist]`);
const abas = (page: Page, id: string) => page.locator(`[data-testid=${id}] [role=tab]`);
const caixas = (locator: Locator): Promise<Box[]> =>
  locator.evaluateAll((els) =>
    els.map((el) => {
      const b = el.getBoundingClientRect();
      return { x: b.x, y: b.y, width: b.width, height: b.height };
    }),
  );
const caixa = async (locator: Locator) => (await caixas(locator))[0];

async function open(page: Page, width: number, product: string) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto("/tests/fixtures/tabs.html?product=" + product);
  await expect(page.getByRole("heading", { name: "Abas", exact: true })).toBeVisible();
  await expect(lista(page, "ciclo")).toHaveCSS("height", "48px");
  // Measure on Montserrat: ask for both weights of the tabs instead of trusting
  // `fonts.ready`, which resolves at once if no load has started yet.
  await page.evaluate(async () => {
    await Promise.all(["400 14px", "600 14px"].map((font) => document.fonts.load(`${font} "Montserrat Variable"`)));
    await document.fonts.ready;
  });
  expect(await page.evaluate(() => document.fonts.check('600 14px "Montserrat Variable"'))).toBe(true);
}

/** The colour of the pixels of `region`, read from a real screenshot. */
async function pixels(page: Page, region: Box) {
  const clip = {
    x: Math.floor(region.x),
    y: Math.floor(region.y),
    width: Math.ceil(region.width),
    height: Math.ceil(region.height),
  };
  const png = await page.screenshot({ clip, animations: "disabled" });
  const image = await page.evaluate(async (b64) => {
    const img = new Image();
    img.src = "data:image/png;base64," + b64;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const context = canvas.getContext("2d")!;
    context.drawImage(img, 0, 0);
    return { width: img.width, rgba: Array.from(context.getImageData(0, 0, img.width, img.height).data) };
  }, png.toString("base64"));
  return (x: number, y: number) => {
    const i = ((Math.floor(y) - clip.y) * image.width + (Math.floor(x) - clip.x)) * 4;
    return image.rgba.slice(i, i + 3);
  };
}

const rgb = (color: string) => (color.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
const cores = (shadow: string) => (shadow.match(/rgba?\([^)]*\)/g) ?? []).map(rgb);
const mesmaCor = (pixel: number[], cor: number[], what: string) => {
  for (const [i, v] of pixel.entries()) expect(Math.abs(v - cor[i]), `${what}: ${pixel} ≠ ${cor}`).toBeLessThanOrEqual(2);
};

/** Two frames: the list brings the focused tab into view on the next one. */
const quadro = (page: Page) =>
  page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));

/** The tab lies whole inside the visible part of the list. */
const inteira = (aba: Box, l: Box) => {
  expect(aba.x).toBeGreaterThanOrEqual(l.x - 0.5);
  expect(aba.x + aba.width).toBeLessThanOrEqual(l.x + l.width + 0.5);
  expect(aba.y).toBeGreaterThanOrEqual(l.y - 0.5);
  expect(aba.y + aba.height).toBeLessThanOrEqual(l.y + l.height + 0.5);
};

for (const product of ["platform", "builder"]) {
  for (const width of [390, 768]) {
    test(`${product} ${width}: the six tabs do not overlap and keep their labels`, async ({ page }, info) => {
      await open(page, width, product);
      const l = lista(page, "ciclo");
      const boxes = await caixas(abas(page, "ciclo"));
      expect(boxes).toHaveLength(6);
      for (const [i, b] of boxes.slice(1).entries())
        expect(b.x, `tab ${i + 2} starts where tab ${i + 1} ends`).toBeGreaterThanOrEqual(boxes[i].x + boxes[i].width - 0.5);
      // no label is wider than its tab, and the tabs still fill the row
      const cortados = await abas(page, "ciclo").evaluateAll((els) =>
        els.filter((el) => el.scrollWidth > el.clientWidth).map((el) => el.textContent),
      );
      expect(cortados).toEqual([]);
      expect(boxes.reduce((sum, b) => sum + b.width, 0)).toBeGreaterThanOrEqual((await caixa(l)).width - 0.5);

      const medidas = await l.evaluate((el) => ({
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
        offsetHeight: (el as HTMLElement).offsetHeight,
        scrollbar: getComputedStyle(el).scrollbarWidth,
      }));
      // the hidden scrollbar takes nothing from the 48 px, and nothing scrolls up and down
      expect(medidas).toEqual({ offsetHeight: 48, clientHeight: 48, scrollHeight: 48, scrollbar: "none" });
      // the page itself does not scroll sideways
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await info.attach(`${product} ${width}`, { body: await page.screenshot({ fullPage: true }), contentType: "image/png" });
    });
  }

  test(`${product} 390: the list scrolls sideways to the last tab`, async ({ page }) => {
    await open(page, 390, product);
    const l = lista(page, "ciclo");
    expect(await l.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeGreaterThan(0);
    await l.evaluate((el) => el.scrollTo({ left: el.scrollWidth }));
    expect(await l.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
    inteira((await caixas(abas(page, "ciclo")))[5], await caixa(l));
  });

  test(`${product} 390: a click on a tab cut at the edge brings it whole into view`, async ({ page }) => {
    await open(page, 390, product);
    const l = lista(page, "ciclo");
    const caixaLista = await caixa(l);
    // the first tab past the right edge of the list, still partly visible
    const cortada = (await caixas(abas(page, "ciclo"))).findIndex(
      (b) => b.x < caixaLista.x + caixaLista.width && b.x + b.width > caixaLista.x + caixaLista.width,
    );
    expect(cortada).toBeGreaterThan(0);
    const tab = abas(page, "ciclo").nth(cortada);
    const b = await caixa(tab);
    await page.mouse.click(b.x + 8, b.y + b.height / 2);
    await expect(tab).toHaveAttribute("aria-selected", "true");
    await quadro(page);
    inteira(await caixa(tab), caixaLista);
  });

  test(`${product} 1440: the six tabs fit and keep equal widths; the list does not scroll`, async ({ page }, info) => {
    await open(page, 1440, product);
    for (const [id, n] of [["ciclo", 6], ["tres", 3]] as const) {
      const l = await caixa(lista(page, id));
      for (const b of await caixas(abas(page, id))) expect(b.width).toBeCloseTo(l.width / n, 0);
      expect(await lista(page, id).evaluate((el) => el.scrollWidth - el.clientWidth)).toBe(0);
    }
    await info.attach(`${product} 1440`, { body: await page.screenshot({ fullPage: true }), contentType: "image/png" });
  });

  test(`${product} 390: the 2px indicator and the 1px line stay whole while the list scrolls`, async ({ page }) => {
    await open(page, 390, product);
    const l = lista(page, "ciclo");
    // the line is the last shadow: the first two are the empty ring of Tailwind
    const linha = cores(await l.evaluate((el) => getComputedStyle(el).boxShadow)).at(-1)!;
    expect(await l.evaluate((el) => getComputedStyle(el).boxShadow)).toContain("inset");

    // first tab active at rest, then the last one, scrolled into view
    for (const ativa of ["Visão geral", "Resultados individuais"]) {
      const tab = page.getByRole("tab", { name: ativa });
      await tab.click();
      await expect(tab).toHaveAttribute("aria-selected", "true");
      await quadro(page);
      const caixaLista = await caixa(l);
      const t = await caixa(tab);
      inteira(t, caixaLista);
      const indicador = rgb(await tab.evaluate((el) => getComputedStyle(el).borderBottomColor));
      const fundo = rgb(await page.evaluate(() => getComputedStyle(document.body).backgroundColor));
      const base = caixaLista.y + caixaLista.height;
      const pixel = await pixels(page, caixaLista);
      const meio = t.x + t.width / 2;
      mesmaCor(pixel(meio, base - 1), indicador, `${ativa}: indicator, last row`);
      mesmaCor(pixel(meio, base - 2), indicador, `${ativa}: indicator, row above`);
      mesmaCor(pixel(meio, base - 3), fundo, `${ativa}: above the indicator`);
      // the most visible inactive tab, in the middle of its visible part: the
      // 1px line, and the background above it
      const visiveis = (await caixas(abas(page, "ciclo")))
        .filter((b) => b.x !== t.x)
        .map((b) => {
          const de = Math.max(b.x, caixaLista.x);
          const ate = Math.min(b.x + b.width, caixaLista.x + caixaLista.width);
          return { meio: (de + ate) / 2, largura: ate - de };
        })
        .sort((a, b) => b.largura - a.largura);
      expect(visiveis[0].largura).toBeGreaterThan(20);
      mesmaCor(pixel(visiveis[0].meio, base - 1), linha, `${ativa}: the line under an inactive tab`);
      mesmaCor(pixel(visiveis[0].meio, base - 2), fundo, `${ativa}: above the line`);
    }
  });

  test(`${product} 390: arrows, Home and End bring the focused tab into view, with the whole focus ring`, async ({ page }) => {
    await open(page, 390, product);
    const l = lista(page, "ciclo");
    const nomes = ["Visão geral", "Pendências", "Calibragem", "Devolutiva", "Resultados do ciclo", "Resultados individuais"];
    await page.getByRole("tab", { name: nomes[0] }).focus();
    for (const nome of nomes.slice(1)) {
      await page.keyboard.press("ArrowRight");
      const tab = page.getByRole("tab", { name: nome });
      await expect(tab).toBeFocused();
      await expect(tab).toHaveAttribute("aria-selected", "true");
      await quadro(page);
      inteira(await caixa(tab), await caixa(l));
    }
    expect(await l.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);

    // the ring is drawn inside the tab: 2px of gap, then 2px of ring, all around
    const focada = page.getByRole("tab", { name: nomes[5] });
    const sombra = await focada.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(sombra).toContain("inset");
    const anel = cores(sombra)[1];
    const t = await caixa(focada);
    const pixel = await pixels(page, await caixa(l));
    // the middle of each 2px band: whole pixels even where the tab starts at a fraction
    mesmaCor(pixel(t.x + t.width / 2, t.y + 3), anel, "ring, top");
    mesmaCor(pixel(t.x + 3, t.y + t.height / 2), anel, "ring, left");
    mesmaCor(pixel(t.x + t.width - 3, t.y + t.height / 2), anel, "ring, right");
    // above the 2px indicator, which is the tab's bottom border
    mesmaCor(pixel(t.x + t.width / 2, t.y + t.height - 2 - 3), anel, "ring, bottom");

    await page.keyboard.press("Home");
    await expect(page.getByRole("tab", { name: nomes[0] })).toBeFocused();
    await quadro(page);
    inteira(await caixa(page.getByRole("tab", { name: nomes[0] })), await caixa(l));
    expect(await l.evaluate((el) => el.scrollLeft)).toBe(0);
    await page.keyboard.press("End");
    await expect(page.getByRole("tab", { name: nomes[5] })).toBeFocused();
    await quadro(page);
    inteira(await caixa(page.getByRole("tab", { name: nomes[5] })), await caixa(l));
    await page.keyboard.press("ArrowLeft");
    await expect(page.getByRole("tab", { name: nomes[4] })).toBeFocused();
    await quadro(page);
    inteira(await caixa(page.getByRole("tab", { name: nomes[4] })), await caixa(l));
  });

  test(`${product}: the vertical list does not scroll, has no line and keeps the ring outside`, async ({ page }) => {
    await open(page, 1280, product);
    const l = lista(page, "vertical");
    expect(
      await l.evaluate((el) => {
        const s = getComputedStyle(el);
        return { overflowX: s.overflowX, overflowY: s.overflowY, boxShadow: s.boxShadow, borderBottomWidth: s.borderBottomWidth };
      }),
    ).toEqual({ overflowX: "visible", overflowY: "visible", boxShadow: "none", borderBottomWidth: "0px" });
    expect((await caixa(l)).width).toBeCloseTo(240, 0);
    const perfil = page.getByRole("tab", { name: "Perfil & assessment" });
    await perfil.focus();
    await page.keyboard.press("ArrowDown");
    const pdi = page.getByRole("tab", { name: "PDI" });
    await expect(pdi).toBeFocused();
    const sombra = await pdi.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(sombra).not.toBe("none");
    expect(sombra).not.toContain("inset");
  });

  test(`${product} 390: passes axe, contrast included`, async ({ page }) => {
    await open(page, 390, product);
    await page.addScriptTag({ content: axe.source });
    const violations = await page.evaluate(async () => {
      const result = await (window as typeof window & { axe: typeof axe }).axe.run();
      return result.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) }));
    });
    expect(violations).toEqual([]);
  });
}
