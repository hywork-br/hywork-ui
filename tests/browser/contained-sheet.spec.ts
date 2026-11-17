import { test, expect, type Page } from "@playwright/test";

// ContainedSheet and SearchCombobox (HCK-435) in a real browser
// (tests/fixtures/contained-sheet.tsx): what jsdom cannot measure.
async function open(page: Page, width: number, height: number, query = "") {
  await page.setViewportSize({ width, height });
  await page.goto("/tests/fixtures/contained-sheet.html" + query);
  await expect(page.getByRole("heading", { name: "Painel contido" })).toBeVisible();
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

const box = async (page: Page, testId: string) => (await page.getByTestId(testId).boundingBox())!;
const near = (a: number, b: number) => expect(Math.abs(a - b)).toBeLessThanOrEqual(1);
/** Top of an element in page coordinates, independent of the scroll. */
const pageTop = (page: Page, testId: string) =>
  page.getByTestId(testId).evaluate((el) => el.getBoundingClientRect().top + window.scrollY);

test("right: inside the element, 480px wide, nothing dimmed, the rest still clickable", async ({ page }) => {
  await open(page, 1280, 900);
  await page.getByRole("button", { name: "Pessoa 2", exact: true }).click();
  const painel = page.getByRole("dialog", { name: "Pessoa 2" });
  await expect(painel).toBeVisible();
  await expect(page.getByRole("button", { name: "Fechar" })).toBeFocused();

  const p = (await painel.boundingBox())!;
  const e = await box(page, "elemento");
  near(p.width, 480);
  near(p.x + p.width, e.x + e.width - 1); // inside the 1px border
  near(p.y, e.y + 1);
  near(p.height, e.height - 2);
  await expect(page.getByTestId("elemento").locator('[data-state="open"]')).toHaveCount(1); // no backdrop

  // A person left of the panel is still clickable (its visible part), and the panel follows it.
  await page.getByRole("button", { name: "Pessoa 1", exact: true }).click({ position: { x: 20, y: 10 } });
  await expect(page.getByRole("dialog", { name: "Pessoa 1" })).toBeVisible();
});

test("bottom: in an element taller than the screen, it sticks to the bottom of the screen", async ({ page }) => {
  await open(page, 390, 700, "?side=bottom&tall=1");
  const depois = await pageTop(page, "depois");
  const pessoa = page.getByRole("button", { name: "Pessoa 20", exact: true });
  await pessoa.scrollIntoViewIfNeeded();
  await pessoa.focus();
  await page.keyboard.press("Enter");

  const painel = page.getByRole("dialog", { name: "Pessoa 20" });
  await expect(painel).toBeVisible();
  const p = (await painel.boundingBox())!;
  const e = await box(page, "elemento");
  expect(e.y + e.height).toBeGreaterThan(700); // the element goes past the screen
  near(p.y + p.height, 700);
  near(p.x, e.x + 1);
  near(p.width, e.width - 2);

  // The backdrop is the element's, not the page's.
  const fundo = (await page.getByTestId("elemento").locator('[data-state="open"]:not([role="dialog"])').boundingBox())!;
  near(fundo.y, e.y + 1);
  near(fundo.height, e.height - 2);
  near(fundo.width, e.width - 2);

  // Opening does not make the page taller.
  expect(await pageTop(page, "depois")).toBe(depois);

  // A click on the backdrop closes, and the focus goes back to the person.
  await page.mouse.click(e.x + 20, p.y - 20);
  await expect(painel).toBeHidden();
  await expect(pessoa).toBeFocused();
});

test("bottom: in a short element, it sits on its bottom, at most 88% of its height", async ({ page }) => {
  await open(page, 390, 1000, "?side=bottom&long=1");
  await page.getByRole("button", { name: "Pessoa 1", exact: true }).click();
  const painel = page.getByRole("dialog", { name: "Pessoa 1" });
  await expect(painel).toBeVisible();
  const p = (await painel.boundingBox())!;
  const e = await box(page, "elemento");
  near(p.y + p.height, e.y + e.height - 1);
  near(p.height, (e.height - 2) * 0.88);
});

test("search: suggestions under the field, at its width; the active one stays in view", async ({ page }) => {
  await open(page, 1280, 900);
  const campo = page.getByRole("combobox", { name: "Buscar pessoa" });
  await campo.fill("pessoa");
  const lista = page.getByRole("listbox", { name: "Buscar pessoa" });
  await expect(lista).toBeVisible();
  const c = (await campo.boundingBox())!;
  const l = (await lista.boundingBox())!;
  expect(l.y).toBeGreaterThanOrEqual(c.y + c.height);
  near(l.x, c.x + 1); // inside the 1px border of the box
  near(l.width, c.width - 2);

  await campo.press("ArrowUp"); // from none to the last one, below the fold of the list
  const ultima = page.getByRole("option", { name: "Pessoa 12" });
  await expect(ultima).toHaveAttribute("aria-selected", "true");
  await expect(ultima).toBeInViewport();
  await campo.press("Enter");
  await expect(page.getByRole("dialog", { name: "Pessoa 12" })).toBeVisible();
});
