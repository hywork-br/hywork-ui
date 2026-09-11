import { test, expect } from "@playwright/test";
import { openStory } from "./helpers";

for (const width of [1440, 390]) {
  test(`tree navigation and presentation at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openStory(page, "components-treeview--navigation");
    const tree = page.getByRole("tree", { name: "Pastas da empresa" });
    await expect(tree).toBeVisible();
    // The story runs its own contract first; do not race its final collapse.
    await expect(page.getByRole("status")).toHaveText("Selecionado: culture");
    await expect(
      page.getByRole("treeitem", { name: "Pessoas", exact: true })
    ).toHaveAttribute("aria-expanded", "false");
    const company = page.getByRole("treeitem", {
      name: "Empresa",
      exact: true,
    });
    await company.focus();
    await page.keyboard.press("Home");
    await expect(company).toBeFocused();
    await page.keyboard.press("ArrowRight");
    const people = page.getByRole("treeitem", { name: "Pessoas", exact: true });
    await expect(people).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    const culture = page.getByRole("treeitem", {
      name: "Cultura e formas de trabalhar",
      exact: true,
    });
    await expect(culture).toHaveAttribute("aria-selected", "true");
    await expect(culture).toBeFocused();
    await expect(page.locator('[role="treeitem"][tabindex="0"]')).toHaveCount(
      1
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true);
    expect(
      await tree.evaluate((element) => getComputedStyle(element).fontFamily)
    ).toContain("Montserrat");
    expect(
      await tree.evaluate(
        (element) => element.getAnimations({ subtree: true }).length
      )
    ).toBe(0);
    const targetHeight = await page
      .getByRole("button", { name: "Recolher Pessoas", exact: true })
      .evaluate((element) => element.getBoundingClientRect().height);
    expect(targetHeight).toBeGreaterThanOrEqual(width < 640 ? 44 : 32);
    await page.screenshot({
      path: testInfo.outputPath(`tree-${width}.png`),
      fullPage: true,
    });
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await expect(people).toHaveAttribute("aria-expanded", "false");
    await expect(people).toBeFocused();
  });
}
test("readonly is announced without unsupported aria and cannot select", async ({
  page,
}) => {
  await page.goto(
    "/iframe.html?id=components-treeview--read-only&viewMode=story"
  );
  await expect(
    page.getByRole("tree", { name: "Pastas da empresa (somente leitura)" })
  ).toBeVisible();
  await page.getByRole("treeitem", { name: "Pessoas", exact: true }).click();
  await page.keyboard.press("Enter");
  await expect(
    page.locator('[role="treeitem"][aria-selected="true"]')
  ).toHaveCount(0);
});
