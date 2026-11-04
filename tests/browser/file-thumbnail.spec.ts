import { test, expect, type Page } from "@playwright/test";
import axe from "axe-core";

// FileThumbnail (HCK-360) in a real browser (tests/fixtures/file-thumbnail.tsx).
async function open(page: Page, width: number, query = "") {
  await page.setViewportSize({ width, height: 1000 });
  await page.goto("/tests/fixtures/file-thumbnail.html" + query);
  await expect(page.getByRole("heading", { name: "Arquivos", exact: true })).toBeVisible();
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

const naoRola = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

test("a real image loads and fills the 4:3 frame, without skeleton or icon", async ({ page }) => {
  await open(page, 1280);
  const miniatura = page.getByTestId("imagem");
  await expect(miniatura).toHaveAttribute("data-preview", "image");
  await expect(miniatura.locator(".animate-pulse")).toHaveCount(0);
  await expect(miniatura.locator("svg")).toHaveCount(0);
  const img = (await miniatura.locator("img").boundingBox())!;
  const b = (await miniatura.boundingBox())!;
  expect(b.width).toBeCloseTo(160, 0);
  expect(img.width).toBeCloseTo(158, 0); // sem a borda de 1px de cada lado
  expect(img.width / img.height).toBeCloseTo(4 / 3, 1);
  expect(await miniatura.locator("img").evaluate((el) => getComputedStyle(el).objectFit)).toBe("cover");
});

test("a real image that fails falls back to the type icon", async ({ page }) => {
  await open(page, 1280);
  const miniatura = page.getByTestId("falha");
  await expect(miniatura).toHaveAttribute("data-preview", "icon");
  await expect(miniatura.locator("img")).toHaveCount(0);
  await expect(miniatura.locator("svg")).toBeVisible();
  await expect(miniatura.getByText("removida.gif")).toBeVisible();
  await expect(miniatura.getByText("64 KB")).toBeVisible();
});

test("the frame keeps its size from the skeleton to the image", async ({ page }) => {
  await open(page, 1280);
  const miniatura = page.getByTestId("depois");
  await expect(miniatura).toHaveAttribute("data-preview", "loading");
  const antes = (await miniatura.boundingBox())!;
  await page.getByRole("button", { name: "Chegar a URL" }).click();
  await expect(miniatura).toHaveAttribute("data-preview", "image");
  const depois = (await miniatura.boundingBox())!;
  expect(depois.width).toBe(antes.width);
  expect(depois.height).toBe(antes.height);
});

for (const [id, largura] of [["longo", 160], ["na-grade", null]] as const) {
  test(`a long name stays on one line, with an ellipsis, and does not widen the thumbnail — ${id}`, async ({ page }) => {
    await open(page, 1280);
    const miniatura = page.getByTestId(id);
    const nome = miniatura.locator("[title]");
    const medidas = await nome.evaluate((el) => ({
      linha: parseFloat(getComputedStyle(el).lineHeight),
      altura: el.getBoundingClientRect().height,
      corta: el.scrollWidth > el.clientWidth,
      fim: getComputedStyle(el).textOverflow,
      titulo: el.getAttribute("title"),
    }));
    expect(medidas.corta).toBe(true);
    expect(medidas.fim).toBe("ellipsis");
    expect(medidas.altura).toBeLessThanOrEqual(medidas.linha + 1);
    expect(medidas.titulo).toMatch(/versao-final\.pdf$/);
    if (largura) expect((await miniatura.boundingBox())!.width).toBeCloseTo(largura, 0);
  });
}

test("the name and the size stay inside the thumbnail", async ({ page }) => {
  await open(page, 1280);
  const miniatura = page.getByTestId("longo");
  const b = (await miniatura.boundingBox())!;
  for (const texto of [miniatura.locator("[title]"), miniatura.getByText("840 KB")]) {
    const t = (await texto.boundingBox())!;
    expect(t.x).toBeGreaterThanOrEqual(b.x);
    expect(t.x + t.width).toBeLessThanOrEqual(b.x + b.width);
    expect(t.y + t.height).toBeLessThanOrEqual(b.y + b.height);
  }
});

test("in a column narrower than 160px, it takes the column and nothing overflows", async ({ page }) => {
  await open(page, 1280);
  const coluna = (await page.getByTestId("estreita").boundingBox())!;
  const b = (await page.getByTestId("na-estreita").boundingBox())!;
  expect(b.width).toBeLessThanOrEqual(coluna.width);
  expect(b.width).toBeCloseTo(96, 0);
});

test("in a grid, `w-full` follows the column", async ({ page }) => {
  await open(page, 1280);
  const b = (await page.getByTestId("na-grade").boundingBox())!;
  expect(b.width).toBeGreaterThanOrEqual(200);
});

for (const largura of [320, 390, 768]) {
  test(`the page does not scroll sideways at ${largura}px`, async ({ page }) => {
    await open(page, largura);
    expect(await naoRola(page)).toBe(true);
    for (const id of ["imagem", "longo", "na-grade"]) {
      const b = (await page.getByTestId(id).boundingBox())!;
      expect(b.x + b.width).toBeLessThanOrEqual(largura);
    }
  });
}

test("Tab reaches it with the focus ring; Enter and Space open it", async ({ page }) => {
  await open(page, 1280);
  const miniatura = page.getByTestId("imagem");
  await page.keyboard.press("Tab");
  await expect(miniatura).toBeFocused();
  const anel = await miniatura.evaluate((el) => getComputedStyle(el).boxShadow);
  expect(anel).not.toBe("none");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Space");
  await expect(page.getByTestId("abertos")).toHaveText("certificado.png,certificado.png");
});

test("the accessible name is the whole file name", async ({ page }) => {
  await open(page, 1280);
  await expect(page.getByRole("button", { name: /versao-final\.pdf$/ }).first()).toBeVisible();
});

for (const query of ["", "?brand=f97316", "?theme=dark"]) {
  test("passes axe, contrast included — " + (query || "no brand"), async ({ page }, info) => {
    await open(page, 1280, query);
    await expect(page.getByTestId("falha")).toHaveAttribute("data-preview", "icon");
    await page.addScriptTag({ content: axe.source });
    const violations = await page.evaluate(async () => {
      const result = await (window as typeof window & { axe: typeof axe }).axe.run();
      return result.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) }));
    });
    expect(violations).toEqual([]);
    await info.attach("1280 " + (query || "none"), { body: await page.screenshot({ fullPage: true }), contentType: "image/png" });
  });
}
